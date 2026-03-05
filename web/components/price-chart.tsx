"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatChartDate, formatCurrency } from "@/lib/utils";

interface PriceChartProps {
  data: { date: string; price: number }[];
  height?: number;
  range?: "all" | "season" | "month" | "week" | "day";
}

export function PriceChart({ data, height = 300, range = "all" }: PriceChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-500"
        style={{ height }}
      >
        No price history yet
      </div>
    );
  }

  const isPositive =
    data.length >= 2 && data[data.length - 1].price >= data[0].price;
  const color = isPositive ? "#16a34a" : "#dc2626";
  const gradientId = `priceGradient-${isPositive ? "up" : "down"}`;

  const chartData = useMemo(() => {
    const useDateAxis = range === "all" || range === "day" || data.length > 60;
    return data.map((d, i) => ({
      ...d,
      day: i + 1,
      label: useDateAxis && d.date
        ? formatChartDate(d.date, { includeYear: range === "all" })
        : `Day ${i + 1}`,
    }));
  }, [data, range]);

  const { yMin, yMax } = useMemo(() => {
    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const priceRange = max - min;
    const avgPrice = (min + max) / 2;
    // For "day" range with 2 points: use min 3% domain range so small changes (e.g. win multiplier) are visible
    const minRange = range === "day" && data.length === 2 ? avgPrice * 0.03 : 0;
    const effectiveRange = Math.max(priceRange, minRange);
    const padding = Math.max(effectiveRange * 0.15, max * 0.02);
    const halfPadding = (effectiveRange + padding * 2) / 2;
    const center = avgPrice;
    return {
      yMin: Math.floor((center - halfPadding) * 100) / 100,
      yMax: Math.ceil((center + halfPadding) * 100) / 100,
    };
  }, [data, range]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
        <XAxis
          dataKey={range === "all" || range === "day" || data.length > 60 ? "label" : "day"}
          tick={{ fontSize: 10 }}
          stroke="#888"
          tickLine={false}
          label={{
            value: range === "all" || range === "day" || data.length > 60 ? "Date" : "Trading Day",
            position: "insideBottomRight",
            offset: -5,
            fontSize: 11,
            fill: "#888",
          }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fontSize: 11 }}
          stroke="#888"
          tickLine={false}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--tooltip-bg, #1a1a1a)",
            border: "1px solid #333",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelFormatter={(_, payload) => {
            const item = payload?.[0]?.payload;
            if (item?.date) {
              return formatChartDate(item.date, { fullYear: true });
            }
            return item?.label ?? "";
          }}
          formatter={(value: number) => [formatCurrency(value), "Price"]}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
