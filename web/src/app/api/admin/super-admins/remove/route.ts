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

  // Cannot remove yourself
  if (userId === session.user.id) {
    return NextResponse.json({ success: false, error: "لا يمكنك إزالة نفسك" }, { status: 400 });
  }

  // Cannot remove initial owner
  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (targetUser?.email === process.env.INITIAL_SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ success: false, error: "لا يمكن إزالة المالك الأول" }, { status: 403 });
  }

  await db.user.update({
    where: { id: userId },
    data: { isSuperAdmin: false },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "SUPER_ADMIN_REMOVE",
    resource: `user:${userId}`,
  });

  return NextResponse.json({ success: true });
}
