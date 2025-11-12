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
};

function getDaysInMonth(month: number, year: number) {
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

export default function StatCard({
  title,
  value,
  interval,
  trend,
  data,
  difference,
  role = "user",
  index = 0,
}: StatCardProps) {
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
    up: "success" as const,
    down: "error" as const,
    neutral: "default" as const,
  };

  const color = labelColors[trend];
  const chartColor = trendColors[trend];

  // 3 color options for borders
  const BorderColors = [
    "rgba(59, 130, 246, 0.8) ",
    "rgba(16, 185, 129, 0.8)",
    "rgba(168, 85, 247, 1)",
  ];

  const borderColor = BorderColors[index % BorderColors.length];

  // 👇 format label based on role
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
      sx={{ height: "100%", flexGrow: 1, bgcolor: "#282e3c38", color: "white" }}
    >
      <CardContent
        sx={{
          borderLeft: `6px solid ${borderColor}`,
          borderRadius: "12px",
        }}
      >
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {title}
        </Typography>

        <Stack
          direction="column"
          sx={{ justifyContent: "space-between", gap: 1 }}
        >
          <Stack sx={{ justifyContent: "space-between" }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Typography variant="h4" component="p">
                {difference}
              </Typography>

              <Chip size="large" color={color} label={formattedLabel} />
            </Stack>
            {/* <Typography fontSize={16} className="text-white/80">
              {interval}
            </Typography> */}
          </Stack>

          <Box sx={{ width: "100%", height: 50 }}>
            <SparkLineChart
              color={chartColor}
              data={data || []}
              showHighlight
              showTooltip
              xAxis={{
                scaleType: "band",
                data: daysInWeek,
              }}
              sx={{
                width: "350px",
                "& path": { fill: "none" },
                "& .MuiAreaElement-root": { display: "none" },
              }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
