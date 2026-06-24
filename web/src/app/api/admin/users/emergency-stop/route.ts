import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  const { userId } = await req.json() as { userId: string };
  if (!userId) return NextResponse.json({ success: false, error: "userId مطلوب" }, { status: 400 });

  await db.botConfig.update({
    where: { userId },
    data: { isLaunched: false, workerStatus: "STOPPED", workerPid: null },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "BOT_STOP",
    resource: `user:${userId}`,
    details: { triggeredBy: "admin_emergency_stop" },
  });

  return NextResponse.json({ success: true });
}
