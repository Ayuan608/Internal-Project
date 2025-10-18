import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WeeklyPerformanceChart = () => {
  const [chartData, setChartData] = useState({
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "CSR",
        data: [85, 78, 92, 88],
        backgroundColor: "#10b981", // Emerald
        borderColor: "#10b981",
        borderWidth: 1,
      },
      {
        label: "Deposit",
        data: [92, 85, 88, 95],
        backgroundColor: "#3b82f6", // Blue
        borderColor: "#3b82f6",
        borderWidth: 1,
      },
      {
        label: "Withdrawal",
        data: [78, 82, 75, 80],
        backgroundColor: "#8b5cf6", // Violet
        borderColor: "#8b5cf6",
        borderWidth: 1,
      },
    ],
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => ({
        ...prev,
        datasets: prev.datasets.map((dataset) => ({
          ...dataset,
          data: dataset.data.map((value) =>
            Math.max(60, Math.min(100, value + (Math.random() - 0.5) * 5))
          ),
        })),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#e5e7eb",
          font: {
            size: 12,
            weight: "500",
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "Weekly Performance Comparison",
        color: "#f8fafc",
        font: {
          size: 18,
          weight: "bold",
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f8fafc",
        bodyColor: "#e5e7eb",
        borderColor: "#374151",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: "#374151",
        },
        ticks: {
          color: "#e5e7eb",
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: "#374151",
        },
        ticks: {
          color: "#e5e7eb",
          stepSize: 10,
          callback: function (value) {
            return value + "%";
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  return (
    <div className="rounded-xl p-2 shadow-lg border border-gray-700 mb-4 max-w-[450px]">
      <div className="h-80">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className="mt-4 text-center text-sm text-gray-400">
        Performance metrics updated in real-time
      </div>
    </div>
  );
};

export default WeeklyPerformanceChart;
