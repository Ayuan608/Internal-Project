import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { ChevronDown, Users, Target, TrendingUp, BarChart3 } from "lucide-react";
import ExampleIosSwitch from "./ui/Switch";
import NonQuota from './NonQuota';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Department = () => {
  const [activeTab, setActiveTab] = useState("CSR");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Example data for departments
  const departmentData = {
    CSR: {
      transactions: 485,
      quota: 620,
      agents: 52,
      completion: 78,
      quotaMet: 78,
      nonQuota: 22,
      chartData: {
        labels: ["Quota Met", "Non-Quota"],
        datasets: [
          {
            data: [78, 22],
            backgroundColor: ["#00C49F", "#FF5A5F"],

          },
        ],
      }
    },
    Deposit: {
      transactions: 320,
      quota: 500,
      agents: 40,
      completion: 64,
      quotaMet: 64,
      nonQuota: 36,
      chartData: {
        labels: ["Quota Met", "Non-Quota"],
        datasets: [
          {
            data: [64, 36],
            backgroundColor: ["#00C49F", "#FF5A5F"],

          },
        ],
      }
    },
    Withdrawal: {
      transactions: 210,
      quota: 400,
      agents: 35,
      completion: 52,
      quotaMet: 52,
      nonQuota: 48,
      chartData: {
        labels: ["Quota Met", "Non-Quota"],
        datasets: [
          {
            data: [52, 48],
            backgroundColor: ["#00C49F", "#FF5A5F"],

          },
        ],
      }
    },
  };

  const currentData = departmentData[activeTab];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
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
        labels: {
          color: "#d1d5db",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          boxWidth: 10,
        },
      }
    },

    elements: {
      arc: {
        borderWidth: 0,
      }
    }
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      CSR: "from-blue-500 to-blue-600",
      Deposit: "from-green-500 to-green-600",
      Withdrawal: "from-orange-500 to-orange-600"
    };
    return colors[dept] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="mt-5 px-2" >
      {/* Title */}
      <div div className="flex justify-between items-center mt-6" >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Department Management
          </h1>
          <p className="text-gray-500">
            Monitor and manage department quotas and performance
          </p>
        </div>
        <ExampleIosSwitch />
      </div >

      {/* Enhanced Department Filter */}
      <div div className="mt-6 flex justify-end" >
        <div className="relative inline-block w-64">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-200 ${isDropdownOpen
              ? "border border-gray-500 bg-blue-500/10"
              : "border-gray-800 bg-slate-900/40 hover:border-gray-800"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getDepartmentColor(activeTab)}`}></div>
              <span className="text-white font-medium">{activeTab} Department</span>
            </div>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10 overflow-hidden ">
              {Object.keys(departmentData).map((department) => (
                <button
                  key={department}
                  onClick={() => {
                    setActiveTab(department);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${activeTab === department
                    ? "bg-[rgba(59,130,246,0.03)] text-blue-300"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getDepartmentColor(department)}`}></div>
                  <span className="font-medium">{department}</span>
                  {activeTab === department && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div >

      {/* Enhanced Department Stats */}
      <div div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" >
        <div className="bg-[rgba(59,130,246,0.03)]  rounded-xl p-6 border-l-2 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Total Met %</p>
              <p className="text-white text-2xl font-bold">{currentData.transactions.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <BarChart3 size={24} className="text-blue-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentData.transactions / currentData.quota) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {Math.round((currentData.transactions / currentData.quota) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-6 border-l-2 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Monthly Quota</p>
              <p className="text-white text-2xl font-bold">{currentData.quota.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Target size={24} className="text-green-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-gray-400">
              Remaining: {(currentData.quota - currentData.transactions).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-6 border-l-2 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Active Agents</p>
              <p className="text-white text-2xl font-bold">{currentData.agents}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Users size={24} className="text-purple-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-gray-400">
              {Math.round(currentData.agents / 100 * currentData.completion)} agents met quota
            </span>
          </div>
        </div>

        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-6 border-l-2 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Completion Rate</p>
              <p className="text-white text-2xl font-bold">{currentData.completion}%</p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <TrendingUp size={24} className="text-orange-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-xs font-medium ${currentData.completion >= 75 ? "text-green-400" :
              currentData.completion >= 50 ? "text-yellow-400" : "text-red-400"
              }`}>
              {currentData.completion >= 75 ? "Excellent" :
                currentData.completion >= 50 ? "Good" : "Needs Improvement"}
            </span>
          </div>
        </div>
      </div >

      {/* Dual Charts - Centered */}
      <div div className="flex flex-col md:flex-row gap-6 mt-6 rounded-lg" >
        <div className="rounded-xl shadow-xl border border-gray-700 w-full bg-black">
          <div className="relative w-80 h-80 mx-auto flex items-center justify-center p-4">
            {/* Donut Chart */}
            <Doughnut data={currentData.chartData} options={chartOptions} />

            {/* Center Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-extrabold text-white">
                {currentData.completion}%
              </p>
              <p className="text-gray-400 text-sm font-medium">Quota Met</p>
            </div>
          </div>
        </div>

        <div>
          <NonQuota department={activeTab} />
        </div>
      </div >
    </div >
  );
};

export default Department;