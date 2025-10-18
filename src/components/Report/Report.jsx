import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { ExternalLink } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { areaElementClasses } from "@mui/x-charts/LineChart";
import { DataGrid } from "@mui/x-data-grid";
import TeamLeaderStats from "../Dashboard/SuperAdminDashboardRoute/ui/TeamLeaderStats";
import { TeamStats } from "../../Helpers/Helper";
import SessionsChart from "../Dashboard/Chart";
import PageViewsBarChart from "../Dashboard/Data";
import ChartUserByCountry from "../Dashboard/SuperAdminDashboardRoute/ui/ChartUserByCountry";
import CustomizedDataGrid from "../Dashboard/SuperAdminDashboardRoute/ui/data/CustomizedDataGrid";
function getDaysInMonth(month, year) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString("en-US", {
    month: "short",
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

// Individual Stat Card Component
function StatCard({ title, value, interval, trend, data }) {
  const theme = useTheme();
  const daysInWeek = getDaysInMonth(4, 2024);

  const trendColors = {
    up: "#10b981",
    down: "#ef4444",
    neutral: "#6b7280",
  };

  const labelColors = {
    up: "success",
    down: "error",
    neutral: "default",
  };

  const color = labelColors[trend];
  const chartColor = trendColors[trend];
  const trendValues = { up: "+25%", down: "-25%", neutral: "+5%" };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        flexGrow: 1,
        backgroundColor: "#1a1a1a",
        borderColor: "#333",
        color: "white",
      }}
    >
      <CardContent>
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ color: "#9ca3af" }}
        >
          {title}
        </Typography>
        <Stack
          direction="column"
          sx={{ justifyContent: "space-between", flexGrow: "1", gap: 1 }}
        >
          <Stack sx={{ justifyContent: "space-between" }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Typography
                variant="h4"
                component="p"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                {value}
              </Typography>
              <Chip
                size="small"
                color={color}
                label={trendValues[trend]}
                sx={{
                  fontWeight: "bold",
                  backgroundColor:
                    trend === "up"
                      ? "#10b98120"
                      : trend === "down"
                      ? "#ef444420"
                      : "#6b728020",
                  color: chartColor,
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>
              {interval}
            </Typography>
          </Stack>
          <Box sx={{ width: "100%", height: 50 }}>
            <SparkLineChart
              colors={[chartColor]}
              data={data}
              area
              showHighlight
              showTooltip
              xAxis={{
                scaleType: "band",
                data: daysInWeek,
              }}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#area-gradient-${value})`,
                },
              }}
            >
              <AreaGradient color={chartColor} id={`area-gradient-${value}`} />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function Report() {
  const rows = [
    {
      id: 1,
      name: "Ashish Prabhakar",
      date: "2025-10-01",
      details: "Report A description goes here.",
      link: "https://example.com/reportA",
      dailyConversions: [3, 5, 7, 8, 10, 12, 15],
    },
    {
      id: 2,
      name: "Paoul Daef",
      date: "2025-10-05",
      details: "Report B details here.",
      link: "https://example.com/reportB",
      dailyConversions: [1, 2, 4, 3, 6, 8, 9],
    },
    {
      id: 3,
      name: "John Smith",
      date: "2025-10-08",
      details: "Report C analysis and insights.",
      link: "https://example.com/reportC",
      dailyConversions: [2, 4, 6, 5, 8, 10, 12],
    },
    {
      id: 4,
      name: "Sarah Johnson",
      date: "2025-10-12",
      details: "Report D comprehensive overview.",
      link: "https://example.com/reportD",
      dailyConversions: [4, 6, 8, 7, 9, 11, 13],
    },
  ];

  const countryData = [
    { name: "India", value: 50000, percentage: 50, color: "#4A5568" },
    { name: "USA", value: 35000, percentage: 35, color: "#718096" },
    { name: "Philippines", value: 10000, percentage: 10, color: "#A0AEC0" },
    { name: "Other", value: 5000, percentage: 5, color: "#CBD5E0" },
  ];

  const generateChartData = (trend) => {
    if (trend === "up") {
      return Array.from(
        { length: 30 },
        (_, i) => 200 + i * 10 + Math.random() * 50
      );
    } else if (trend === "down") {
      return Array.from(
        { length: 30 },
        (_, i) => 500 - i * 8 + Math.random() * 30
      );
    } else {
      return Array.from(
        { length: 30 },
        () => Math.floor(Math.random() * 100) + 400
      );
    }
  };

  const statsData = [
    {
      title: "Users",
      value: "14k",
      interval: "Last 30 days",
      trend: "up",
      data: generateChartData("up"),
    },
    {
      title: "Conversions",
      value: "325",
      interval: "Last 30 days",
      trend: "down",
      data: generateChartData("down"),
    },
    {
      title: "Event count",
      value: "200k",
      interval: "Last 30 days",
      trend: "neutral",
      data: generateChartData("neutral"),
    },
    {
      title: "Total Reports",
      value: rows.length.toString(),
      interval: "Last 30 days",
      trend: "up",
      data: generateChartData("up"),
    },
  ];

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "date",
      headerName: "Date",
      flex: 0.8,
      minWidth: 120,
    },
    {
      field: "details",
      headerName: "Details",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "link",
      headerName: "Link",
      flex: 0.6,
      minWidth: 100,
      renderCell: (params) => (
        <a
          href={params.value}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <ExternalLink size={16} />
          <span>View</span>
        </a>
      ),
    },
  ];

  const totalUsers = countryData.reduce((sum, item) => sum + item.value, 0);

  // Prepare data for MUI BarChart
  const conversionChartData = rows[0].dailyConversions.map((value, index) => ({
    day: `Day ${index + 1}`,
    conversions: value,
  }));

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#0a0a0a" }}>
      <div className="max-w-full mx-auto">
        <TeamLeaderStats title="Team-Leader" data={TeamStats} />

        <div className="flex gap-6 mt-2 overflow-y-auto ">
          <SessionsChart />
          <PageViewsBarChart />
        </div>

        <p className="text-white text-lg font-semibold my-5">
          Team Leader Details
        </p>
        <div className="flex gap-5">
          <CustomizedDataGrid />
          <ChartUserByCountry />
        </div>
      </div>
    </div>
  );
}

export default Report;
