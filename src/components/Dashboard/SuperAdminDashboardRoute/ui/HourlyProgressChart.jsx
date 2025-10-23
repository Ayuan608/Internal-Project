import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler
);

const HourlyProgressChart = () => {
  const data = {
    labels: [
      "8AM",
      "9AM",
      "10AM",
      "11AM",
      "12PM",
      "1PM",
      "2PM",
      "3PM",
      "4PM",
      "5PM",
    ],
    datasets: [
      {
        label: "Progress",
        data: [50, 90, 135, 185, 225, 265, 315, 365, 410, 455],
        fill: true,
        borderColor: "#3b82f6",
        pointBackgroundColor: "#3b82f6",
        tension: 0.4,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        titleColor: "#f9fafb",
        bodyColor: "#d1d5db",
        borderColor: "#374151",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: "#374151" },
        ticks: { color: "#d1d5db" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#374151" },
        ticks: { color: "#d1d5db" },
      },
    },
  };

  return (
    <div className={`p-4 rounded-lg shadow-md bg-gray-800`}>
      <h2 className={`text-lg font-semibold mb-4 bg-gray-800`}>
        Hourly Progress
      </h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default HourlyProgressChart;
