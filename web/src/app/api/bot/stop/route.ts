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
    select: { isLaunched: true, workerPid: true },
  });

  if (!botConfig?.isLaunched) {
    return NextResponse.json({ success: false, error: "البوت متوقف بالفعل" }, { status: 400 });
  }

  // Phase 6 will add actual SIGTERM to workerPid
  // For now, update DB state only
  await db.botConfig.update({
    where: { userId: session.user.id },
    data: {
      isLaunched: false,
      workerStatus: "STOPPED",
      workerPid: null,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "BOT_STOP",
    resource: "bot_worker",
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ success: true, message: "تم إيقاف البوت" });
}
