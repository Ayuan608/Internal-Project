import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { useState, useEffect } from "react";

export type StatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend: "up" | "down" | "neutral";
  data: number[];
  difference: any;
  role?: "superAdmin" | "teamLeader" | "user";
  index?: number;
  totalCompleted?: number;
  target?: number;
  isPositive?: boolean;
  getDailyTotals?: any;
};

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
}: StatCardProps) {
  const theme = useTheme();

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Log daily data when tooltip changes
  useEffect(() => {
    if (hoverIndex !== null) {
      console.log("🔥 Hover index:", hoverIndex);
      console.log("📅 Hover day data:", getDailyTotals[hoverIndex]);
    }
  }, [hoverIndex]);

  // DATA FOR SPARKLINE (CSR/DEPOSIT/WITHDRAW)
  const chartData = data && data.length > 0
    ? data
    : getDailyTotals.map((d: any) =>
        title.includes("CSR")
          ? d.csr
          : title.includes("Deposit")
          ? d.deposit
          : d.withdraw
      );

  const trendColors = {
    up: "orange",
    down: "#ef4444",
    neutral: "#6b7280",
  };

  const chartColor = trendColors[trend];

  const borderColorPalette = [
    "rgba(59, 130, 246, 0.8)",
    "rgba(16, 185, 129, 0.8)",
    "rgba(168, 85, 247, 0.8)",
    "rgba(245, 158, 11, 0.8)",
  ];

  const borderColor = borderColorPalette[index % borderColorPalette.length];

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        flexGrow: 1,
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
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography sx={{ color: "white", fontWeight: 600 }}>
          {title}
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: "bold", color: "white" }}>
          {difference}
        </Typography>

        <Box sx={{ width: "100%", height: 60, mt: 2 }}>
          <SparkLineChart
            color={chartColor}
            data={chartData}
            area
            showTooltip
            showHighlight
            onHighlightChange={(e: any) => {
              if (e && e.index !== undefined) {
                setHoverIndex(e.index);
              }
            }}
            xAxis={{
              scaleType: "band",
              data: chartData.map((_, i) => i + 1),
            }}
            tooltip={{
              renderTooltip: (params: any) => {
                if (!params || params.index == null) return null;

                const idx = params.index;
                const dayData = getDailyTotals[idx];

                if (!dayData) return null;

                return (
                  <Box
                    sx={{
                      bgcolor: "#1e293b",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "white",
                      p: 1.2,
                      minWidth: 130,
                    }}
                  >
                    <Typography sx={{ fontSize: "12px", opacity: 0.8 }}>
                      Day {dayData.day}
                    </Typography>

                    <Typography sx={{ fontSize: "13px" }}>
                      CSR: <b>{dayData.csr.toLocaleString()}</b>
                    </Typography>

                    <Typography sx={{ fontSize: "13px" }}>
                      Deposit: <b>{dayData.deposit.toLocaleString()}</b>
                    </Typography>

                    <Typography sx={{ fontSize: "13px" }}>
                      Withdraw: <b>{dayData.withdraw.toLocaleString()}</b>
                    </Typography>
                  </Box>
                );
              },
            }}
            sx={{
              "& .MuiLineElement-root": {
                stroke: chartColor,
                strokeWidth: 2,
              },
              "& .MuiAreaElement-root": {
                fill: `url(#gradient-${index})`,
              },
            }}
          >
            <defs>
              <linearGradient id={`gradient-${index}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
          </SparkLineChart>
        </Box>
      </CardContent>
    </Card>
  );
}
