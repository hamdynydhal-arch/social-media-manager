import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "لوحة التحكم" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Redirect to onboarding if not completed
  if (!session.user.hasCompletedOnboarding) {
    redirect("/settings?onboarding=true");
  }

  const [botConfig, activeTrades, recentTrades] = await Promise.all([
    db.botConfig.findUnique({
      where: { userId: session.user.id },
      select: {
        isLaunched: true,
        workerStatus: true,
        lastHeartbeat: true,
        lastError: true,
        currentCapital: true,
        vault: true,
        riskLevel: true,
        isLiveMode: true,
        initialCapital: true,
      },
    }).then((c) =>
      c
        ? {
            ...c,
            lastHeartbeat: c.lastHeartbeat?.toISOString() ?? null,
          }
        : null
    ),
    db.trade.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      orderBy: { entryTime: "desc" },
    }),
    db.trade.findMany({
      where: { userId: session.user.id, status: "CLOSED" },
      orderBy: { exitTime: "desc" },
      take: 20,
    }),
  ]);

  // Calculate stats from closed trades
  const closedTrades = recentTrades;
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnlUsd ?? 0), 0);
  const winningTrades = closedTrades.filter((t) => (t.pnlUsd ?? 0) > 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

  return (
    <DashboardClient
      botConfig={botConfig}
      activeTrades={activeTrades.map((t) => ({
        ...t,
        entryTime: t.entryTime.toISOString(),
        exitTime: t.exitTime?.toISOString() ?? null,
      }))}
      recentTrades={closedTrades.map((t) => ({
        ...t,
        entryTime: t.entryTime.toISOString(),
        exitTime: t.exitTime?.toISOString() ?? null,
      }))}
      stats={{
        totalTrades: closedTrades.length,
        winRate,
        totalPnlUsd: totalPnl,
        totalPnlPct: botConfig?.initialCapital
          ? (totalPnl / botConfig.initialCapital) * 100
          : 0,
        avgPnlUsd: closedTrades.length > 0 ? totalPnl / closedTrades.length : 0,
        bestTrade: Math.max(...closedTrades.map((t) => t.pnlUsd ?? 0), 0),
        worstTrade: Math.min(...closedTrades.map((t) => t.pnlUsd ?? 0), 0),
      }}
    />
  );
}
