"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";

interface TimeSeriesData {
  date: string;
  count: number;
}

interface ChartCardProps {
  title: string;
  data: TimeSeriesData[];
  color?: string;
  type?: "area" | "bar";
}

export function TimeSeriesChart({
  title,
  data,
  color = "#3b82f6",
  type = "area",
}: ChartCardProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "M/d"),
    count: Number(d.count),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        {type === "area" ? (
          <AreaChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 13,
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={color}
              fill={color}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        ) : (
          <BarChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 13,
              }}
            />
            <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

const PIE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#6b7280",
];

interface PieData {
  stage: string;
  count: number;
}

export function CKDPieChart({ data }: { data: PieData[] }) {
  const formatted = data.map((d) => ({
    name: d.stage === "N/A" ? "해당없음" : `${d.stage}단계`,
    value: Number(d.count),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        CKD 단계 분포
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={formatted}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {formatted.map((_, i) => (
              <Cell
                key={i}
                fill={PIE_COLORS[i % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
