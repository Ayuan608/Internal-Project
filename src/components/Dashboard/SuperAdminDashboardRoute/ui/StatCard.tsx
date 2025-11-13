import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";

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
};

// Generate realistic sample data based on performance
function generateSampleData(
  totalCompleted: number,
  target: number,
  isPositive: boolean
): number[] {
  const daysInMonth = 30;
  const data = [];

  // Create realistic daily data that accumulates to the total
  const averageDaily = totalCompleted / daysInMonth;

  for (let i = 0; i < daysInMonth; i++) {
    // Add some randomness to make it look natural
    const randomFactor = 0.8 + Math.random() * 0.4;
    const dailyValue = averageDaily * randomFactor;

    // Ensure the trend matches the overall performance
    const adjustedValue = isPositive
      ? dailyValue * (1 + (i / daysInMonth) * 0.3) // Positive trend
      : dailyValue * (1 - (i / daysInMonth) * 0.2); // Negative trend

    data.push(Math.max(0, Math.round(adjustedValue)));
  }

  return data;
}

function getDaysInMonth(month: number, year: number) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString("en-US", {
    month: "short",
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${i}`);
    i += 1;
  }
  return days;
}

export default function StatCard({
  title,
  value,
  interval,
  trend,
  data,
  difference,
  role = "user",
  index = 0,
  totalCompleted = 0,
  target = 0,
  isPositive = true,
}: StatCardProps) {
  const theme = useTheme();
  const daysInMonth = getDaysInMonth(
    new Date().getMonth() + 1,
    new Date().getFullYear()
  );

  // Generate sample data if no data provided
  const chartData =
    data && data.length > 0
      ? data
      : generateSampleData(totalCompleted, target, isPositive);

  const trendColors = {
    up: theme.palette.mode === "light" ? theme.palette.success.main : "#10b981", // Green
    down: theme.palette.mode === "light" ? theme.palette.error.main : "#ef4444", // Red
    neutral:
      theme.palette.mode === "light" ? theme.palette.grey[400] : "#6b7280", // Gray
  };

  const labelColors = {
    up: "success" as const,
    down: "error" as const,
    neutral: "default" as const,
  };

  const color = labelColors[trend];
  const chartColor = trendColors[trend];

  // Color options for borders
  const BorderColors = [
    "rgba(59, 130, 246, 0.8)", // Blue
    "rgba(16, 185, 129, 0.8)", // Green
    "rgba(168, 85, 247, 0.8)", // Purple
    "rgba(245, 158, 11, 0.8)", // Amber
  ];

  const borderColor = BorderColors[index % BorderColors.length];

  // Format label based on role
  const formattedLabel =
    role === "superAdmin"
      ? trend === "up"
        ? `+${value}%`
        : trend === "down"
        ? `-${value}%`
        : `${value}%`
      : `${value}`;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        flexGrow: 1,
        bgcolor: "#282e3c38",
        color: "white",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
        },
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
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ color: "white", fontWeight: 600 }}
        >
          {title}
        </Typography>

        <Stack
          direction="column"
          sx={{ justifyContent: "space-between", gap: 1, flexGrow: 1 }}
        >
          <Stack sx={{ justifyContent: "space-between" }}>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                variant="h4"
                component="p"
                sx={{ fontWeight: "bold", color: "white" }}
              >
                {difference}
              </Typography>

              <Chip
                size="medium"
                color={color}
                label={formattedLabel}
                sx={{
                  fontWeight: 600,
                  backgroundColor:
                    trend === "up"
                      ? "rgba(16, 185, 129, 0.2)"
                      : trend === "down"
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(107, 114, 128, 0.2)",
                  color: "white",
                }}
              />
            </Stack>
          </Stack>

          {/* Line Chart with Area */}
          <Box sx={{ width: "100%", height: 60, mt: "auto" }}>
            <SparkLineChart
              color={chartColor}
              data={chartData}
              showHighlight
              showTooltip
              area
              xAxis={{
                scaleType: "band",
                data: daysInMonth,
              }}
              sx={{
                width: "100%",
                height: "100%",
                "& .MuiLineElement-root": {
                  stroke: chartColor,
                  strokeWidth: 2,
                },
                "& .MuiAreaElement-root": {
                  fill: `url(#gradient-${index})`,
                },
                "& .MuiMarkElement-root": {
                  stroke: chartColor,
                  strokeWidth: 2,
                  fill: "white",
                },
              }}
              // Add gradient for area fill
              children={
                <defs>
                  <linearGradient
                    id={`gradient-${index}`}
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={chartColor}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
              }
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
