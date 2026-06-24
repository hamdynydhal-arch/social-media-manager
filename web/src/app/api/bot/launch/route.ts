import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  }

  const botConfig = await db.botConfig.findUnique({
    where: { userId: session.user.id },
    select: {
      binanceApiKeyEncrypted: true,
      binanceSecretEncrypted: true,
      initialCapital: true,
      isLaunched: true,
    },
  });

  if (!botConfig?.binanceApiKeyEncrypted || !botConfig?.binanceSecretEncrypted) {
    return NextResponse.json(
      { success: false, error: "أدخل مفاتيح Binance API أولاً في الإعدادات" },
      { status: 400 }
    );
  }

  if (botConfig.initialCapital <= 0) {
    return NextResponse.json(
      { success: false, error: "حدّد رأس المال الأولي في الإعدادات" },
      { status: 400 }
    );
  }

  if (botConfig.isLaunched) {
    return NextResponse.json({ success: false, error: "البوت يعمل بالفعل" }, { status: 400 });
  }

  // Phase 1-5: Update DB only (no actual Python worker yet)
  await db.botConfig.update({
    where: { userId: session.user.id },
    data: {
      isLaunched: true,
      workerStatus: "STARTING",
      lastError: null,
      lastHeartbeat: new Date(),
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "BOT_LAUNCH",
    resource: "bot_worker",
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ success: true, message: "تم إطلاق البوت" });
}
