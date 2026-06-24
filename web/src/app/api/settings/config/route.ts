import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { createAuditLog } from "@/lib/audit";
import { sendApiKeyChangedEmail } from "@/lib/email";
import { z } from "zod";

const settingsSchema = z.object({
  binanceApiKey: z.string().min(10).optional(),
  binanceSecret: z.string().min(10).optional(),
  telegramBotToken: z.string().min(10).optional(),
  telegramChatId: z.string().optional(),
  riskLevel: z.enum(["CONSERVATIVE", "BALANCED", "AGGRESSIVE"]),
  initialCapital: z.number().positive().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "طلب غير صالح" }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "بيانات غير صالحة: " + parsed.error.message },
      { status: 400 }
    );
  }

  const { binanceApiKey, binanceSecret, telegramBotToken, telegramChatId, riskLevel, initialCapital } =
    parsed.data;

  const updateData: Record<string, unknown> = { riskLevel };

  if (binanceApiKey) updateData.binanceApiKeyEncrypted = encrypt(binanceApiKey);
  if (binanceSecret) updateData.binanceSecretEncrypted = encrypt(binanceSecret);
  if (telegramBotToken) updateData.telegramBotTokenEncrypted = encrypt(telegramBotToken);
  if (telegramChatId !== undefined) updateData.telegramChatId = telegramChatId;
  if (initialCapital !== undefined) {
    updateData.initialCapital = initialCapital;
    // Only update currentCapital if it's 0 (first time)
    const existing = await db.botConfig.findUnique({
      where: { userId: session.user.id },
      select: { currentCapital: true },
    });
    if (!existing || existing.currentCapital === 0) {
      updateData.currentCapital = initialCapital;
    }
  }

  await db.botConfig.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      riskLevel,
      binanceApiKeyEncrypted: binanceApiKey ? encrypt(binanceApiKey) : undefined,
      binanceSecretEncrypted: binanceSecret ? encrypt(binanceSecret) : undefined,
      telegramBotTokenEncrypted: telegramBotToken ? encrypt(telegramBotToken) : undefined,
      telegramChatId: telegramChatId,
      initialCapital: initialCapital ?? 0,
      currentCapital: initialCapital ?? 0,
    },
    update: updateData,
  });

  // Mark onboarding complete if user has API keys and capital
  if (binanceApiKey && binanceSecret && initialCapital) {
    await db.user.update({
      where: { id: session.user.id },
      data: { hasCompletedOnboarding: true },
    });
  }

  // Send email if API keys were changed
  if (binanceApiKey || binanceSecret) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });
    if (user) {
      await sendApiKeyChangedEmail({ toEmail: user.email, userName: user.name ?? "مستخدم" }).catch(
        () => {}
      );
    }
  }

  await createAuditLog({
    userId: session.user.id,
    action: "SETTINGS_UPDATE",
    resource: "bot_config",
    details: {
      changedFields: [
        ...(binanceApiKey ? ["apiKey"] : []),
        ...(binanceSecret ? ["apiSecret"] : []),
        ...(telegramBotToken ? ["tgToken"] : []),
        "riskLevel",
        ...(initialCapital !== undefined ? ["initialCapital"] : []),
      ],
    },
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ success: true, message: "تم حفظ الإعدادات بنجاح" });
}
