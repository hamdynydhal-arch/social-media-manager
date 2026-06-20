import { db } from "./db";
import { AuditAction, Prisma } from "@prisma/client";

interface AuditOptions {
  userId: string;
  action: AuditAction;
  resource: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(opts: AuditOptions): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: opts.userId,
        action: opts.action,
        resource: opts.resource,
        details: opts.details ?? Prisma.DbNull,
        ipAddress: opts.ipAddress,
        userAgent: opts.userAgent,
      },
    });
  } catch {
    // Audit log failure should not break the main flow
    console.error("[AuditLog] Failed to create audit log:", opts.action);
  }
}
