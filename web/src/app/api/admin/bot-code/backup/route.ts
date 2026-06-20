import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { format } from "date-fns";

export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }

  const files = await db.botCodeFile.findMany({
    where: { isActive: true },
    select: { filename: true, content: true, version: true, fileSize: true },
  });

  if (files.length === 0) {
    return NextResponse.json({ success: false, error: "لا توجد ملفات للنسخ الاحتياطي" }, { status: 400 });
  }

  const backupName = `backup-${format(new Date(), "yyyy-MM-dd-HH-mm-ss")}`;
  const totalSize = files.reduce((sum, f) => sum + f.fileSize, 0);

  await db.botCodeBackup.create({
    data: {
      backupName,
      filesSnapshot: files,
      createdById: session.user.id,
      fileCount: files.length,
      totalSizeBytes: totalSize,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CODE_BACKUP",
    resource: "bot_code",
    details: { backupName, fileCount: files.length },
  });

  return NextResponse.json({ success: true, backupName });
}
