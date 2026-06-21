import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsersAdminClient } from "@/components/admin/UsersAdminClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "إدارة المُصرَّحين" };

export default async function AdminUsersPage() {
  const session = await auth();

  const users = await db.user.findMany({
    include: {
      botConfig: {
        select: {
          isLaunched: true,
          workerStatus: true,
          currentCapital: true,
          lastHeartbeat: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const usersData = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    image: u.image,
    isSuperAdmin: u.isSuperAdmin,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    botStatus: u.botConfig
      ? {
          isLaunched: u.botConfig.isLaunched,
          workerStatus: u.botConfig.workerStatus,
          currentCapital: u.botConfig.currentCapital,
          lastHeartbeat: u.botConfig.lastHeartbeat?.toISOString() ?? null,
        }
      : null,
  }));

  return <UsersAdminClient users={usersData} currentUserId={session!.user.id} />;
}
