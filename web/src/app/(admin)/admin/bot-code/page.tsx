import { db } from "@/lib/db";
import { BotCodeClient } from "@/components/admin/BotCodeClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "إدارة كود البوت" };

export default async function BotCodePage() {
  const files = await db.botCodeFile.findMany({
    where: { isActive: true },
    orderBy: { filename: "asc" },
    select: {
      id: true,
      filename: true,
      content: true,
      version: true,
      isActive: true,
      fileSize: true,
      description: true,
      updatedAt: true,
    },
  });

  const backups = await db.botCodeBackup.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { createdBy: { select: { name: true } } },
  });

  return (
    <BotCodeClient
      files={files.map((f) => ({ ...f, updatedAt: f.updatedAt.toISOString() }))}
      backups={backups.map((b) => ({
        id: b.id,
        backupName: b.backupName,
        fileCount: b.fileCount,
        createdBy: b.createdBy.name ?? "—",
        createdAt: b.createdAt.toISOString(),
      }))}
    />
  );
}
