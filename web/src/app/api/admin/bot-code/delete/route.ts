import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await req.json() as { id: string };
  if (!id) return NextResponse.json({ success: false, error: "id مطلوب" }, { status: 400 });

  const file = await db.botCodeFile.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ success: false, error: "الملف غير موجود" }, { status: 404 });

  await db.botCodeFile.delete({ where: { id } });

  await createAuditLog({
    userId: session.user.id,
    action: "CODE_DELETE",
    resource: `file:${file.filename}`,
  });

  return NextResponse.json({ success: true });
}
