"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  data: { date: string; fittings: number }[];
}

export function RetailerAnalyticsChart({ data }: Props) {
  // Show every 5th label to avoid crowding
  const tickFormatter = (_: string, index: number) => (index % 5 === 0 ? data[index]?.date ?? "" : "");

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} tickFormatter={tickFormatter} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid #f3f4f6", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
          cursor={{ fill: "#f9fafb" }}
          labelStyle={{ fontWeight: 600, color: "#111827", fontSize: 12 }}
          itemStyle={{ fontSize: 12, color: "#166534" }}
        />
        <Bar dataKey="fittings" fill="#166534" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
