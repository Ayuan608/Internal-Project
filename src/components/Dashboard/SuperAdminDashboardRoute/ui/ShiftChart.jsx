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

const ShiftChart = () => {
  const [activeTab, setActiveTab] = useState("Daily");

  // ✅ Different datasets for each filter
  const chartData = {
    Daily: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Morning shift",
          data: [65, 67, 70, 73, 74, 75, 76],
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Night shift",
          data: [85, 87, 88, 89, 90, 90, 91],
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    Weekly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [
        {
          label: "Morning shift",
          data: [70, 72, 74, 77],
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Night shift",
          data: [88, 89, 91, 93],
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    Monthly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      datasets: [
        {
          label: "Morning shift",
          data: [60, 65, 67, 69, 70, 74, 76],
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Night shift",
          data: [80, 82, 84, 86, 88, 90, 91],
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
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

  const tabs = ["Daily", "Weekly", "Monthly"];

  return (
    <div className="bg-[rgba(59,130,246,0.03)] border_gray p-5 rounded-2xl w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white text-lg font-semibold">
          📊 Shift Performance Comparison
        </h3>
        <div className="flex gap-2 items-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-xl border transition-all ${
                activeTab === tab
                  ? "bg-[#10131f] text-white border_gray"
                  : "text-white/80 border_gray"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: "300px" }}>
        <Line options={options} data={chartData[activeTab]} />
      </div>
    </div>
  );
};

export default ShiftChart;
