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
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ShiftChart = ({ timeFilter, data, title }) => {
  // Fallback data if no data is provided
  const defaultData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
    datasets: [
      {
        label: 'Morning Shift',
        data: [10, 30, 80, 100, 60, 20, 5],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true,
      },

      {
        label: 'Night Shift',
        data: [60, 80, 30, 10, 20, 70, 100],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // Use provided data or fallback to default
  const chartData = data && data.labels ? data : defaultData;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#e5e7eb",
          font: {
            size: 11
          },
          callback: function (value) {
            // Format large numbers
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        },
        title: {
          display: true,
          text: timeFilter === 'daily' ? 'Count' : timeFilter === 'weekly' ? 'Weekly Count' : 'Monthly Count',
          color: "#e5e7eb",
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: "#374151",
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: "#e5e7eb",
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0
        },
        title: {
          display: true,
          text: timeFilter === 'daily' ? 'Time' : timeFilter === 'weekly' ? 'Days' : 'Weeks',
          color: "#e5e7eb",
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: "#374151",
          drawBorder: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: "#e5e7eb",
          font: {
            size: 12
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f3f4f6',
        bodyColor: '#e5e7eb',
        borderColor: '#4b5563',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.parsed.y;
            // Format numbers in tooltip
            if (value >= 1000000) {
              label += (value / 1000000).toFixed(2) + 'M';
            } else if (value >= 1000) {
              label += (value / 1000).toFixed(1) + 'K';
            } else {
              label += value.toLocaleString();
            }
            return label;
          }
        }
      },
      title: {
        display: false
      }
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700 p-5 rounded-2xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-semibold flex items-center gap-2">
          📊 {title || 'Shift Performance Comparison'}
        </h3>
        <div className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-600">
          {timeFilter === 'daily' ? '24 Hours' : timeFilter === 'weekly' ? '7 Days' : '4 Weeks'} View
        </div>
      </div>

      <div style={{ height: "320px" }}>
        <Line options={options} data={chartData} />
      </div>

      {/* Legend Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Morning (6AM-2PM)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Night (10PM-6AM)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftChart;