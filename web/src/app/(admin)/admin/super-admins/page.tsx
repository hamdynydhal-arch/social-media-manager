import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SuperAdminsClient } from "@/components/admin/SuperAdminsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "إدارة Super Admins" };

export default async function SuperAdminsPage() {
  const session = await auth();

  const [admins, pendingInvites] = await Promise.all([
    db.user.findMany({
      where: { isSuperAdmin: true },
      select: { id: true, email: true, name: true, image: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.superAdminInvite.findMany({
      where: {
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { invitedBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <SuperAdminsClient
      admins={admins.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
      pendingInvites={pendingInvites.map((i) => ({
        id: i.id,
        email: i.email,
        invitedBy: i.invitedBy.name ?? i.invitedBy.email,
        expiresAt: i.expiresAt.toISOString(),
        createdAt: i.createdAt.toISOString(),
      }))}
      currentUserId={session!.user.id}
      initialAdminEmail={process.env.INITIAL_SUPER_ADMIN_EMAIL ?? ""}
    />
  );
}
