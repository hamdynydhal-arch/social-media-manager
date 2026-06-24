import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  }

  const { token } = await req.json() as { token: string };
  if (!token) return NextResponse.json({ success: false, error: "token مطلوب" }, { status: 400 });

  const invite = await db.superAdminInvite.findUnique({ where: { token } });

  if (!invite || invite.acceptedAt || invite.revokedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ success: false, error: "الدعوة غير صالحة أو منتهية" }, { status: 400 });
  }

  if (invite.email !== session.user.email) {
    return NextResponse.json({ success: false, error: "هذه الدعوة ليست لك" }, { status: 403 });
  }

  await Promise.all([
    db.user.update({ where: { email: invite.email }, data: { isSuperAdmin: true } }),
    db.superAdminInvite.update({ where: { token }, data: { acceptedAt: new Date() } }),
  ]);

  await createAuditLog({
    userId: session.user.id,
    action: "SUPER_ADMIN_ACCEPT",
    resource: `invite:${invite.id}`,
  });

  return NextResponse.json({ success: true });
}
