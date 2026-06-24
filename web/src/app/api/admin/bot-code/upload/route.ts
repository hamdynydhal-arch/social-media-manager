import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  const { filename, content } = await req.json() as { filename: string; content: string };

  if (!filename || !filename.endsWith(".py")) {
    return NextResponse.json({ success: false, error: "يمكن رفع ملفات .py فقط" }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ success: false, error: "محتوى الملف مطلوب" }, { status: 400 });
  }

  const fileSize = Buffer.byteLength(content, "utf8");

  const existing = await db.botCodeFile.findUnique({ where: { filename } });
  if (existing) {
    await db.botCodeFile.update({
      where: { filename },
      data: {
        content,
        uploadedById: session.user.id,
        version: existing.version + 1,
        fileSize,
      },
    });
  } else {
    await db.botCodeFile.create({
      data: {
        filename,
        content,
        uploadedById: session.user.id,
        fileSize,
      },
    });
  }

  await createAuditLog({
    userId: session.user.id,
    action: "CODE_UPLOAD",
    resource: `file:${filename}`,
    details: { fileSize, isUpdate: !!existing },
  });

  return NextResponse.json({ success: true });
}
