import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  const { userId } = await req.json() as { userId: string };
  if (!userId) return NextResponse.json({ success: false, error: "userId مطلوب" }, { status: 400 });
  if (userId === session.user.id) {
    return NextResponse.json({ success: false, error: "لا يمكنك حذف حسابك" }, { status: 400 });
  }

  const targetUser = await db.user.findUnique({ where: { id: userId }, select: { isSuperAdmin: true } });
  if (targetUser?.isSuperAdmin) {
    return NextResponse.json({ success: false, error: "لا يمكن حذف Super Admin" }, { status: 400 });
  }

  await db.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
