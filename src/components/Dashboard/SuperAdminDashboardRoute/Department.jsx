import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import ExampleIosSwitch from "./ui/Switch";
import StatsPage from "./ui/StatsPage";
import SuperAdminData from "./ui/SuperAdminData";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Department = () => {
  const [activeTab, setActiveTab] = useState("CSR");

  // Example data for departments
  const departmentData = {
    CSR: {
      transactions: 485,
      quota: 620,
      agents: 52,
      completion: 78,
      quotaMet: 78,
      nonQuota: 22,
    },
    Deposit: {
      transactions: 320,
      quota: 500,
      agents: 40,
      completion: 64,
      quotaMet: 64,
      nonQuota: 36,
    },
    Withdrawal: {
      transactions: 210,
      quota: 400,
      agents: 35,
      completion: 52,
      quotaMet: 52,
      nonQuota: 48,
    },
  };

  const currentData = departmentData[activeTab];

  // Primary Quota chart
  const chartData = {
    labels: ["Quota Met", "Non-Quota"],
    datasets: [
      {
        data: [currentData.quotaMet, currentData.nonQuota],
        backgroundColor: ["#22c55e", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  // Non-Quota chart (example variation)
  const nonQuotaChartData = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [currentData.quotaMet, 100 - currentData.quotaMet],
        backgroundColor: ["#3b82f6", "#facc15"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: `${activeTab} Department Quota`,
        font: { size: 18 },
        color: "#fff",
      },
      legend: {
        display: true,
        position: "bottom",
        labels: { color: "#d1d5db" },
      },
    },
  };

  return (
    <div className="mt-5">

      {/* Title */}
      <div className="flex justify-between items-center mt-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Department Management</h1>
          <p className="text-gray-500">
            Monitor and manage department quotas and performance
          </p>
        </div>
        <ExampleIosSwitch />
      </div>



      <div className="pt-8">
        <SuperAdminData />
      </div>

      {/* Dual Charts - Centered */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-10 mt-10 bg-[#3b83f60e] rounded-lg p-6 border border-[var(--box-border)]">
        {/* Left Chart */}
        <div className="rounded-xl p-6 bg-[var(--box-color)] shadow-xl border border-gray-700 w-full md:w-1/2">
          <div className="h-80 w-80 mx-auto flex items-center justify-center">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          <div className="text-center mt-4 text-sm text-gray-400">
            {currentData.quotaMet}% Met • {currentData.nonQuota}% Not Met
          </div>
        </div>

        {/* Right Chart (Non-Quota) */}
        <div className="rounded-xl p-6 shadow-xl bg-[var(--box-color)] border border-gray-700 w-full md:w-1/2">
          <div className="h-80 w-80 mx-auto flex items-center justify-center">
            <Doughnut
              data={nonQuotaChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: `${activeTab} Non-Quota Chart`,
                  },
                },
              }}
            />
          </div>
          <div className="text-center mt-4 text-sm text-gray-400">
            {currentData.quotaMet}% Completed • {100 - currentData.quotaMet}% Remaining
          </div>
        </div>
      </div>
    </div>
  );
};

export default Department;
