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

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const data = {
  labels,
  datasets: [
    {
      label: "Present",
      data: [145, 148, 140, 135, 150, 152, 155], // Example data for present attendance
      borderColor: "rgb(34, 197, 94)", // Green color for Present
      backgroundColor: "rgba(34, 197, 94, 0.2)",
      tension: 0.4,
      fill: true,
    },
    {
      label: "Absent",
      data: [18, 16, 18, 22, 12, 10, 8], // Example data for absent attendance
      borderColor: "rgb(234, 179, 8)", // Yellow color for Absent
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
      max: 180, // Adjust this to fit your data range
      ticks: {
        callback: (value) => `${value}`,
        color: "#fff",
      },
      title: {
        display: true,
        text: "Attendance Count",
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
        text: "Days of the Week",
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

const WeeklyAttendanceTrendChart = () => {
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
        Weekly Attendance Trend
      </h3>
      <div style={{ height: "300px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default WeeklyAttendanceTrendChart;
