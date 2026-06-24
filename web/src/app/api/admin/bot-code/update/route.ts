import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  const { id, content } = await req.json() as { id: string; content: string };
  if (!id || !content) {
    return NextResponse.json({ success: false, error: "id و content مطلوبان" }, { status: 400 });
  }

  const file = await db.botCodeFile.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ success: false, error: "الملف غير موجود" }, { status: 404 });

  await db.botCodeFile.update({
    where: { id },
    data: {
      content,
      version: file.version + 1,
      fileSize: Buffer.byteLength(content, "utf8"),
      uploadedById: session.user.id,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CODE_UPLOAD",
    resource: `file:${file.filename}`,
    details: { newVersion: file.version + 1 },
  });

  return NextResponse.json({ success: true });
}
