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
    <div
      style={{
        backgroundColor: "#121212",
        padding: 20,
        borderRadius: 10,
        width: "100%",
      }}
    >
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
