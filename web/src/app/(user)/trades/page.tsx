import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { TradesClient } from "@/components/dashboard/TradesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "سجل الصفقات" };

export default async function TradesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const trades = await db.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { entryTime: "desc" },
    take: 100,
  });

  return (
    <TradesClient
      trades={trades.map((t) => ({
        ...t,
        entryTime: t.entryTime.toISOString(),
        exitTime: t.exitTime?.toISOString() ?? null,
      }))}
    />
  );
}
