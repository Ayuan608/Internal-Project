import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import ExampleIosSwitch from "./ui/Switch";
import SuperAdminData from "./ui/SuperAdminData";
import HourlyProgressChart from "./ui/HourlyProgressChart";

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
    <div className="mt-5 px-2">
      {/* Title */}
      <div className="flex justify-between items-center mt-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Department Management
          </h1>
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
      <div className="flex flex-col md:flex-row gap-6 mt-10 rounded-lg">
        <div className="rounded-xl bg-[var(--box-color)] shadow-xl border border-gray-700 w-full">
          <div className="w-80 mx-auto flex items-center justify-center">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          <div className="text-center mt-4 text-sm text-gray-400">
            {currentData.quotaMet}% Met • {currentData.nonQuota}% Not Met
          </div>
        </div>
        <div className="w-full h-full">
          <HourlyProgressChart />
        </div>
      </div>
    </div>
  );
};

export default Department;
