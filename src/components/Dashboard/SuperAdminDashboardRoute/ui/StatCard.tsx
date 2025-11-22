import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useState, useEffect, useMemo } from "react";
import {
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from "recharts";

export type StatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend: string;
  data: number[];
  difference: any;
  role?: "superAdmin" | "teamLeader" | "user";
  index?: number;
  totalCompleted?: number;
  target?: number;
  isPositive?: boolean;
  getDailyTotals?: any;
  goalValue?: number;
};

// ----------------------------------------------------------------------
// MINI TOOLTIP
// ----------------------------------------------------------------------
const MiniTooltip = ({ active, payload, goalValue, color }) => {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0].payload;
  const value = point.value;
  const isAbove = value >= goalValue;

  return (
    <Box
      sx={{
        bgcolor: "#1e293b",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "6px",
        color: "white",
        p: 1,
        minWidth: 110,
      }}
    >
      <Typography sx={{ fontSize: "11px", opacity: 0.7 }}>
        Day {point.day}
      </Typography>

      <Typography sx={{ fontSize: "13px", fontWeight: "bold" }}>
        {value.toLocaleString()}
      </Typography>

      <Typography
        sx={{
          fontSize: "11px",
          color: isAbove ? "#22c55e" : "#ef4444",
          mt: 0.5,
        }}
      >
        {isAbove ? "✓ Above Goal" : "✗ Below Goal"}
      </Typography>
    </Box>
  );
};

// ----------------------------------------------------------------------
// MINI GOAL CHART
// ----------------------------------------------------------------------
const MiniGoalChart = ({ data, goalValue, color, index }) => {
  const chartData = useMemo(() => {
    return data.map((value, i) => ({
      day: i + 1,
      value,
      aboveGoal: value >= goalValue ? value : goalValue,
      belowGoal: value < goalValue ? value : goalValue,
    }));
  }, [data, goalValue]);

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);

  return (
    <ResponsiveContainer width="100%" height={110}>
      <ComposedChart data={chartData}>
        <defs>
          <linearGradient id={`above-${index}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="10%" stopColor={color} stopOpacity={0.45} />
            <stop offset="90%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <XAxis dataKey="day" hide />
        <YAxis hide domain={[Math.min(minValue * 0.9, goalValue * 0.8), maxValue * 1.1]} />

        <Tooltip
          content={<MiniTooltip goalValue={goalValue} color={color} />}
          cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }}
        />

        <ReferenceLine
          y={goalValue}
          stroke="rgba(255,255,255,0.4)"
          strokeDasharray="5 5"
          strokeWidth={1}
        />

        <Area
          dataKey="aboveGoal"
          type="linear"
          stroke="none"
          fill={`url(#above-${index})`}
          fillOpacity={1}
        />

        <Area
          dataKey="belowGoal"
          type="linear"
          stroke="none"
          fill={`url(#below-${index})`}
          fillOpacity={1}
        />

        <Line
          dataKey="value"
          type="linear"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// ----------------------------------------------------------------------
// MAIN CARD COMPONENT
// ----------------------------------------------------------------------
export default function StatCard({
  title,
  value,
  trend,
  data,
  difference,
  role = "user",
  index = 0,
  target = 0,
  isPositive = true,
  getDailyTotals = [],
  goalValue = 10000,
}: StatCardProps) {
  const theme = useTheme();

  const chartData =
    data && data.length > 0
      ? data
      : getDailyTotals.map((d: any) =>
          title.includes("CSR")
            ? d.csr
            : title.includes("Deposit")
            ? d.deposit
            : d.withdraw
        );

  const trendColors = [
    "oklch(74.6% 0.16 232.661)",
    "oklch(65.6% 0.241 354.308)",
    "oklch(79.2% 0.209 151.711)",
  ];

  const chartColor = trendColors[index];

  const borderColorPalette = [
    "rgba(59, 130, 246, 0.8)",
    "rgba(16, 185, 129, 0.8)",
    "rgba(168, 85, 247, 0.8)",
    "rgba(245, 158, 11, 0.8)",
  ];

  const borderColor = borderColorPalette[index % borderColorPalette.length];

  return (
    <Card
      sx={{
        height: "100%",
        bgcolor: "#282e3c38",
        color: "white",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
      }}
    >
      <CardContent
        sx={{
          borderLeft: `6px solid ${borderColor}`,
          borderRadius: "8px",
          padding: "16px !important",
          height: "100%",
        }}
      >
        <Typography sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>

        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          {difference}
        </Typography>

        <Box
          sx={{
            width: "100%",
            height: 120,
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            p: 1,
            bgcolor: "rgba(0,0,0,0.18)",
          }}
        >
          <MiniGoalChart
            data={chartData}
            goalValue={goalValue}
            color={chartColor}
            index={index}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
