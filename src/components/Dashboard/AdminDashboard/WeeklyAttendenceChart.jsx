import React, { useState } from "react";
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

// Sample data for last 5 weeks
const weeklyData = {
  week1: {
    range: "Oct 21 - Oct 27, 2024",
    datasets: [
      {
        label: "Present",
        data: [145, 148, 140, 135, 150, 152, 155],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Absent",
        data: [18, 16, 18, 22, 12, 10, 8],
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  },
  week2: {
    range: "Oct 14 - Oct 20, 2024",
    datasets: [
      {
        label: "Present",
        data: [142, 145, 138, 140, 148, 150, 153],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Absent",
        data: [20, 18, 20, 19, 15, 13, 10],
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  },
  week3: {
    range: "Oct 07 - Oct 13, 2024",
    datasets: [
      {
        label: "Present",
        data: [140, 143, 135, 138, 145, 148, 150],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Absent",
        data: [22, 20, 23, 20, 18, 15, 13],
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  },
  week4: {
    range: "Sep 30 - Oct 06, 2024",
    datasets: [
      {
        label: "Present",
        data: [138, 140, 132, 135, 142, 145, 148],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Absent",
        data: [24, 22, 25, 23, 20, 18, 15],
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  },
  week5: {
    range: "Sep 23 - Sep 29, 2024",
    datasets: [
      {
        label: "Present",
        data: [135, 138, 130, 132, 140, 142, 145],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Absent",
        data: [26, 24, 27, 25, 22, 20, 18],
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  },
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 0,
      max: 180,
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
  const [selectedWeek, setSelectedWeek] = useState("week1");

  const weeks = [
    { value: "week1", label: "Current Week (Oct 21 - Oct 27)" },
    { value: "week2", label: "Last Week (Oct 14 - Oct 20)" },
    { value: "week3", label: "2 Weeks Ago (Oct 07 - Oct 13)" },
    { value: "week4", label: "3 Weeks Ago (Sep 30 - Oct 06)" },
    { value: "week5", label: "4 Weeks Ago (Sep 23 - Sep 29)" },
  ];

  const currentData = {
    labels,
    datasets: weeklyData[selectedWeek].datasets,
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(59,130,246,0.03)",
        padding: 20,
        borderRadius: 10,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h3 style={{ color: "white", margin: 0 }}>
          Weekly Attendance Trend
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ color: "white", fontSize: "14px" }}>
            Filter by Week:
          </label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #333",
              backgroundColor: "#1a1a1a",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              outline: "none",
              minWidth: "240px",
            }}
          >
            {weeks.map((week) => (
              <option key={week.value} value={week.value}>
                {week.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          color: "#888",
          fontSize: "13px",
          marginBottom: 15,
          fontStyle: "italic",
        }}
      >
        Showing data for: {weeklyData[selectedWeek].range}
      </div>

      <div style={{ height: "300px" }}>
        <Line data={currentData} options={options} />
      </div>
    
    </div>
  );
};

export default WeeklyAttendanceTrendChart;