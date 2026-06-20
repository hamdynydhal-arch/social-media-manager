import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendSuperAdminInviteEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";
import { addHours } from "date-fns";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  const { email } = await req.json() as { email: string };
  if (!email || !email.includes("@")) {
    return NextResponse.json({ success: false, error: "إيميل غير صالح" }, { status: 400 });
  }

  // Check target user exists
  const targetUser = await db.user.findUnique({ where: { email }, select: { id: true, isSuperAdmin: true } });
  if (!targetUser) {
    return NextResponse.json({ success: false, error: "المستخدم غير مسجّل في المنصة" }, { status: 404 });
  }
  if (targetUser.isSuperAdmin) {
    return NextResponse.json({ success: false, error: "المستخدم مدير بالفعل" }, { status: 400 });
  }

  // Revoke existing pending invites for this email
  await db.superAdminInvite.updateMany({
    where: { email, acceptedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const token = randomBytes(32).toString("hex");
  const invite = await db.superAdminInvite.create({
    data: {
      email,
      invitedById: session.user.id,
      token,
      expiresAt: addHours(new Date(), 48),
    },
  });

  await sendSuperAdminInviteEmail({
    toEmail: email,
    inviterName: session.user.name ?? session.user.email,
    token,
  });

  await createAuditLog({
    userId: session.user.id,
    action: "SUPER_ADMIN_INVITE",
    resource: `invite:${invite.id}`,
    details: { targetEmail: email },
  });

  return NextResponse.json({ success: true });
}
