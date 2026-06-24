"use client";

import { motion } from "framer-motion";
import { Users, Bot, DollarSign, TrendingUp, BarChart3, UserPlus } from "lucide-react";
import { formatUSD, formatPct } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/StatsCard";

interface PlatformStats {
  totalUsers: number;
  activeBotsCount: number;
  totalCapitalManaged: number;
  avgPnlPct: number;
  totalTrades: number;
  newUsersThisMonth: number;
}

export function PlatformStatsClient({ stats }: { stats: PlatformStats }) {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">إحصائيات المنصة</h1>
        <p className="page-subtitle">نظرة عامة على أداء المنصة وقاعدة المُصرَّحين</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: Users,
            label: "إجمالي المُصرَّحين",
            value: stats.totalUsers.toString(),
            color: "blue" as const,
          },
          {
            icon: Bot,
            label: "بوتات نشطة",
            value: stats.activeBotsCount.toString(),
            color: "green" as const,
          },
          {
            icon: DollarSign,
            label: "رأس المال المُدار",
            value: formatUSD(stats.totalCapitalManaged),
            color: "purple" as const,
          },
          {
            icon: TrendingUp,
            label: "متوسط الأداء",
            value: formatPct(stats.avgPnlPct),
            color: stats.avgPnlPct >= 0 ? ("green" as const) : ("red" as const),
          },
          {
            icon: BarChart3,
            label: "إجمالي الصفقات",
            value: stats.totalTrades.toString(),
            color: "gray" as const,
          },
          {
            icon: UserPlus,
            label: "مُصرَّحون جدد هذا الشهر",
            value: stats.newUsersThisMonth.toString(),
            color: "blue" as const,
          },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <StatsCard
              icon={item.icon}
              label={item.label}
              value={item.value}
              color={item.color}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
