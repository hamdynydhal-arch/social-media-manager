import { db } from "@/lib/db";
import { PlatformStatsClient } from "@/components/admin/PlatformStatsClient";
import type { Metadata } from "next";
import { startOfMonth } from "date-fns";

export const metadata: Metadata = { title: "إحصائيات المنصة" };

export default async function AdminStatsPage() {
  const [totalUsers, activeBots, capitalData, newThisMonth, tradeStats] = await Promise.all([
    db.user.count(),
    db.botConfig.count({ where: { isLaunched: true } }),
    db.botConfig.aggregate({ _sum: { currentCapital: true, vault: true } }),
    db.user.count({ where: { createdAt: { gte: startOfMonth(new Date()) } } }),
    db.trade.aggregate({
      where: { status: "CLOSED", pnlUsd: { not: null } },
      _avg: { pnlUsd: true, pnlPct: true },
      _sum: { pnlUsd: true },
      _count: true,
    }),
  ]);

  const totalCapital =
    (capitalData._sum.currentCapital ?? 0) + (capitalData._sum.vault ?? 0);

  return (
    <PlatformStatsClient
      stats={{
        totalUsers,
        activeBotsCount: activeBots,
        totalCapitalManaged: totalCapital,
        avgPnlPct: tradeStats._avg.pnlPct ?? 0,
        totalTrades: tradeStats._count,
        newUsersThisMonth: newThisMonth,
      }}
    />
  );
}
