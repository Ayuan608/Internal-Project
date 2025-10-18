// import React, { useEffect, useState } from "react";
// import { useTheme, createTheme, ThemeProvider } from "@mui/material/styles";
// import { LineChart } from "@mui/x-charts/LineChart";
// import { Card, CardContent, Typography, Stack, Chip } from "@mui/material";

// function AreaGradient({ color, id }) {
//   return (
//     <defs>
//       <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
//         <stop offset="0%" stopColor={color} stopOpacity={0.5} />
//         <stop offset="100%" stopColor={color} stopOpacity={0} />
//       </linearGradient>
//     </defs>
//   );
// }

// function getDays(count) {
//   const today = new Date();
//   return Array.from({ length: count }, (_, i) => {
//     const date = new Date(today);
//     date.setDate(today.getDate() - (count - i - 1));
//     return `${date.getMonth() + 1}/${date.getDate()}`;
//   });
// }

// function generateRandomSeries(length) {
//   return Array.from({ length }, () => Math.floor(Math.random() * 3000) + 1000);
// }

// const RealTimeChart = () => {
//   const theme = useTheme();
//   const [data, setData] = useState({
//     labels: getDays(30),
//     direct: generateRandomSeries(30),
//     referral: generateRandomSeries(30),
//     organic: generateRandomSeries(30),
//   });

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setData((prev) => {
//         const next = {
//           ...prev,
//           direct: [
//             ...prev.direct.slice(1),
//             Math.floor(Math.random() * 3000 + 1000),
//           ],
//           referral: [
//             ...prev.referral.slice(1),
//             Math.floor(Math.random() * 3000 + 1000),
//           ],
//           organic: [
//             ...prev.organic.slice(1),
//             Math.floor(Math.random() * 3000 + 1000),
//           ],
//         };
//         return next;
//       });
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <Card
//       variant="outlined"
//       sx={{
//         width: "100%",
//         bgcolor: "#121212",
//         color: "white",
//         borderColor: "#333",
//       }}
//     >
//       <CardContent>
//         <div style={{ display: "flex", justifyContent: "space-between" }}>
//           <Typography variant="subtitle2" color="white">
//             30-Day Performance Trends
//           </Typography>
//           <Typography
//             variant="subtitle2"
//             color="white"
//             sx={{
//               backgroundColor: "grey",
//               borderRadius: "10px",
//               padding: "4px",
//             }}
//           >
//             Last 30 Days
//           </Typography>
//         </div>

//         <Stack sx={{ justifyContent: "space-between", mb: 2 }}>
//           <Stack direction="row" alignItems="center" gap={1}>
//             <Typography variant="h4" component="p" color="white">
//               13,277
//             </Typography>
//             <Chip
//               size="small"
//               label="+35%"
//               sx={{ bgcolor: "green", color: "white" }}
//             />
//           </Stack>
//           <Typography variant="caption" sx={{ color: "white" }}>
//             Sessions per day for the last 30 days
//           </Typography>
//         </Stack>

//         <LineChart
//           colors={[
//             theme.palette.primary.light,
//             theme.palette.primary.main,
//             theme.palette.primary.dark,
//           ]}
//           xAxis={[{ scaleType: "point", data: data.labels }]}

//           series={[
//             {
//               id: "direct",
//               label: "CSR",
//               data: data.direct,
//               area: true,
//               showMark: false,
//             },
//             {
//               id: "referral",
//               label: "Deposit",
//               data: data.referral,
//               area: true,
//               showMark: false,
//             },
//             {
//               id: "organic",
//               label: "Withdraw",
//               data: data.organic,
//               area: true,
//               showMark: false,
//             },
//           ]}
//           height={250}
//           sx={{
//             backgroundColor: "#121212",
//             "& .MuiChartsAxis-root .MuiChartsAxis-tickLabel": {
//               fill: "#fff",
//             },
//             "& .MuiChartsAxis-root .MuiChartsAxis-line": {
//               stroke: "#888",
//             },
//             "& .MuiChartsGrid-line": {
//               stroke: "#333",
//             },
//             "& .MuiAreaElement-series-organic": {
//               fill: "url('#organic')",
//             },
//             "& .MuiAreaElement-series-referral": {
//               fill: "url('#referral')",
//             },
//             "& .MuiAreaElement-series-direct": {
//               fill: "url('#direct')",
//             },
//           }}
//           margin={{ left: 10, right: 10, top: 20, bottom: 20 }}
//         >
//           <AreaGradient color={theme.palette.primary.dark} id="organic" />
//           <AreaGradient color={theme.palette.primary.main} id="referral" />
//           <AreaGradient color={theme.palette.primary.light} id="direct" />
//         </LineChart>
//       </CardContent>
//     </Card>
//   );
// };

// // Dark theme
// const darkTheme = createTheme({
//   palette: {
//     mode: "dark",
//     primary: {
//       light: "#90caf9",
//       main: "#2196f3",
//       dark: "#1565c0",
//     },
//   },
// });

// export default function App() {
//   return (
//     <ThemeProvider theme={darkTheme}>
//       <div style={{ padding: 20, backgroundColor: "#121212", width: "100%" }}>
//         <RealTimeChart />
//       </div>
//     </ThemeProvider>
//   );
// }

import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const labels = [
  "Day 1",
  "Day 5",
  "Day 10",
  "Day 15",
  "Day 20",
  "Day 25",
  "Day 30",
];

const data = {
  labels,
  datasets: [
    {
      label: "CSR",
      data: [65, 67, 70, 73, 74, 75, 76],
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.2)",
      tension: 0.4,
      fill: true,
    },
    {
      label: "Deposit",
      data: [85, 87, 88, 89, 90, 90, 91],
      borderColor: "rgb(34, 197, 94)",
      backgroundColor: "rgba(34, 197, 94, 0.2)",
      tension: 0.4,
      fill: true,
    },
    {
      label: "Withdrawal",
      data: [70, 69, 67, 66, 65, 64, 64],
      borderColor: "rgb(234, 179, 8)",
      backgroundColor: "rgba(234, 179, 8, 0.2)",
      tension: 0.4,
      fill: true,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: {
        callback: (value) => `${value}%`,
        color: "#fff",
      },
      title: {
        display: true,
        text: "Percentage",
        color: "#fff",
      },
      grid: {
        color: "#333",
      },
    },
    x: {
      ticks: {
        color: "#fff",
      },
      title: {
        display: true,
        text: "Days",
        color: "#fff",
      },
      grid: {
        color: "#333",
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: "#fff",
      },
    },
  },
};

const PerformanceTrendChart = () => {
  return (
    <div style={{ backgroundColor: "#121212", padding: 20, borderRadius: 10 }}>
      <h3 style={{ color: "white", marginBottom: 10 }}>
        30-Day Performance Trends
      </h3>
      <div style={{ height: "300px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default PerformanceTrendChart;
