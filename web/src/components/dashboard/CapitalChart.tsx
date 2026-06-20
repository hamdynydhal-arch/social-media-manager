"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Trade {
  exitTime: string | null;
  pnlUsd: number | null;
}

interface CapitalChartProps {
  initialCapital: number;
  trades: Trade[];
}

export function CapitalChart({ initialCapital, trades }: CapitalChartProps) {
  // Build equity curve from closed trades
  const closedTrades = trades
    .filter((t) => t.exitTime && t.pnlUsd !== null)
    .sort((a, b) => new Date(a.exitTime!).getTime() - new Date(b.exitTime!).getTime());

  const data = [
    { date: "البداية", value: initialCapital },
    ...closedTrades.reduce<{ date: string; value: number }[]>((acc, trade) => {
      const prev = acc.at(-1)?.value ?? initialCapital;
      return [
        ...acc,
        {
          date: format(new Date(trade.exitTime!), "dd/MM", { locale: ar }),
          value: Math.max(0, prev + (trade.pnlUsd ?? 0)),
        },
      ];
    }, []),
  ];

  const minValue = Math.min(...data.map((d) => d.value)) * 0.95;
  const maxValue = Math.max(...data.map((d) => d.value)) * 1.05;
  const isGrowth = data.at(-1)?.value ?? 0 >= initialCapital;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold">منحنى رأس المال</h3>
          <p className="text-xs text-muted-foreground mt-1">Equity Curve</p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded">
          {closedTrades.length} صفقة
        </div>
      </div>

      {data.length < 2 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          لا توجد بيانات كافية لرسم المنحنى
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isGrowth ? "#22c55e" : "#ef4444"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isGrowth ? "#22c55e" : "#ef4444"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: "#666", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[minValue, maxValue]}
              tick={{ fill: "#666", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              orientation="left"
            />
            <Tooltip
              contentStyle={{
                background: "#111",
                border: "1px solid #222",
                borderRadius: "8px",
                fontFamily: "Cairo, sans-serif",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "رأس المال"]}
              labelStyle={{ color: "#888" }}
            />
            <ReferenceLine
              y={initialCapital}
              stroke="#555"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isGrowth ? "#22c55e" : "#ef4444"}
              strokeWidth={2}
              fill="url(#capitalGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: isGrowth ? "#22c55e" : "#ef4444" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
