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

// Sample data for different months
const monthlyData = {
  january: {
    labels: ["Day 1", "Day 5", "Day 10", "Day 15", "Day 20", "Day 25", "Day 30"],
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
  },
  february: {
    labels: ["Day 1", "Day 5", "Day 10", "Day 15", "Day 20", "Day 25", "Day 28"],
    datasets: [
      {
        label: "CSR",
        data: [70, 72, 74, 76, 78, 80, 82],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Deposit",
        data: [88, 89, 90, 91, 92, 93, 94],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Withdrawal",
        data: [68, 67, 66, 65, 64, 63, 62],
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  },
  march: {
    labels: ["Day 1", "Day 5", "Day 10", "Day 15", "Day 20", "Day 25", "Day 30"],
    datasets: [
      {
        label: "CSR",
        data: [75, 76, 78, 80, 82, 83, 85],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Deposit",
        data: [90, 91, 92, 93, 94, 94, 95],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Withdrawal",
        data: [65, 64, 63, 62, 61, 60, 59],
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  },
  april: {
    labels: ["Day 1", "Day 5", "Day 10", "Day 15", "Day 20", "Day 25", "Day 30"],
    datasets: [
      {
        label: "CSR",
        data: [78, 80, 81, 83, 84, 85, 87],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Deposit",
        data: [92, 93, 94, 95, 95, 96, 97],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Withdrawal",
        data: [63, 62, 61, 60, 59, 58, 57],
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  },
  may: {
    labels: ["Day 1", "Day 5", "Day 10", "Day 15", "Day 20", "Day 25", "Day 30"],
    datasets: [
      {
        label: "CSR",
        data: [75, 76, 78, 80, 82, 83, 85],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Deposit",
        data: [90, 91, 92, 93, 94, 94, 95],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Withdrawal",
        data: [65, 64, 63, 62, 61, 60, 59],
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  },
  june: {
    labels: ["Day 1", "Day 5", "Day 10", "Day 15", "Day 20", "Day 25", "Day 30"],
    datasets: [
      {
        label: "CSR",
        data: [78, 80, 81, 83, 84, 85, 87],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Deposit",
        data: [92, 93, 94, 95, 95, 96, 97],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Withdrawal",
        data: [63, 62, 61, 60, 59, 58, 57],
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
  const [selectedMonth, setSelectedMonth] = useState("january");

  const months = [
    { value: "january", label: "January 2025" },
    { value: "february", label: "February 2025" },
    { value: "march", label: "March 2025" },
    { value: "april", label: "April 2025" },
    { value: "may", label: "May 2025" },
    { value: "june", label: "June 2025" },
  ];

  const currentData = monthlyData[selectedMonth];

  return (
    <div
      style={{
        backgroundColor: "#121212",
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
          30-Day Performance Trends
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ color: "white", fontSize: "14px" }}>
            Filter by Month:
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #333",
              backgroundColor: "#1a1a1a",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              outline: "none",
            }}
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ height: "300px" }}>
        <Line data={currentData} options={options} />
      </div>
    </div>
  );
};

export default PerformanceTrendChart;