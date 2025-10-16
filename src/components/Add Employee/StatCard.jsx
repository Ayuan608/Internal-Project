import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { areaElementClasses } from "@mui/x-charts/LineChart";
import { useSelector } from "react-redux";
import { SparkLineChart } from "@mui/x-charts";

// Helper function to generate days
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

// Gradient component
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
    up:
      theme.palette.mode === "light"
        ? theme.palette.success.main
        : theme.palette.success.dark,
    down:
      theme.palette.mode === "light"
        ? theme.palette.error.main
        : theme.palette.error.dark,
    neutral:
      theme.palette.mode === "light"
        ? theme.palette.grey[400]
        : theme.palette.grey[700],
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
    <Card variant="outlined" sx={{ height: "100%", flexGrow: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
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
              <Typography variant="h4" component="p">
                {value}
              </Typography>
              <Chip size="small" color={color} label={trendValues[trend]} />
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
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

// Main Dashboard Stats Component
export default function DashboardStats() {
  const { users } = useSelector((state) => state?.auth);
  const [statsData, setStatsData] = useState([]);

  // Generate sample chart data
  const generateChartData = () => {
    return Array.from(
      { length: 30 },
      () => Math.floor(Math.random() * 500) + 200
    );
  };

  useEffect(() => {
    if (users && users.length > 0) {
      // Count users by role
      const adminCount = users.filter(
        (user) => user?.role === "Team-Leader" || user.role === "Super-Admin"
      ).length;

      const regularUserCount = users.filter(
        (user) => user.role !== "Team-Leader" && user.role !== "Super-Admin"
      ).length;

      // Count active users
      const activeUsers = users.filter(
        (user) => user.status === "Active" || user.status === "active"
      ).length;

      // Calculate percentage trends (you can modify this logic based on your needs)
      const adminTrend = adminCount > regularUserCount / 2 ? "up" : "neutral";
      const userTrend = regularUserCount > adminCount ? "up" : "down";
      const activeTrend = activeUsers === users.length ? "up" : "neutral";

      const dynamicStats = [
        {
          title: "Total Admins",
          value: adminCount.toString(),
          interval: "Last 30 days",
          trend: adminTrend,
          data: generateChartData(),
        },
        {
          title: "Total Users",
          value: regularUserCount.toString(),
          interval: "Last 30 days",
          trend: userTrend,
          data: generateChartData(),
        },
        {
          title: "Active Users",
          value: activeUsers.toString(),
          interval: "Last 30 days",
          trend: activeTrend,
          data: generateChartData(),
        },
        {
          title: "Total Employees",
          value: users.length.toString(),
          interval: "Last 30 days",
          trend: "up",
          data: generateChartData(),
        },
      ];

      setStatsData(dynamicStats);
    }
  }, [users]);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Grid container spacing={2} columns={12}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              interval={stat.interval}
              trend={stat.trend}
              data={stat.data}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
