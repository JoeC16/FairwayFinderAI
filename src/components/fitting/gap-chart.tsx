"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { GapChartPoint } from "@/types/fitting";

interface Props {
  data: GapChartPoint[];
}

export function GapChart({ data }: Props) {
  if (!data || data.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg">
          <p className="font-semibold text-gray-900 text-sm">{label}</p>
          <p className="text-brand-700 text-sm font-medium">{payload[0].value}y carry</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="club"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(22,101,52,0.05)" }} />
          <Bar dataKey="carry" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.optimal ? "#16a34a" : "#4ade80"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
