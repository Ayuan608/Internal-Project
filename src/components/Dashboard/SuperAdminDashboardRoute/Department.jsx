import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { ChevronDown, Users, Target, TrendingUp, BarChart3 } from "lucide-react";
import ExampleIosSwitch from "./ui/Switch";
import NonQuota from './NonQuota';
import { useDispatch, useSelector } from "react-redux";
import { fetchCombinedDepartmentsData } from "../../../redux/combinedQuotaSlice";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Department = () => {
  const [activeTab, setActiveTab] = useState("CSR");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [departmentStats, setDepartmentStats] = useState({
    CSR: { transactions: 0, quota: 0, agents: 0, completion: 0, quotaMet: 0, nonQuota: 0 },
    Deposit: { transactions: 0, quota: 0, agents: 0, completion: 0, quotaMet: 0, nonQuota: 0 },
    Withdrawal: { transactions: 0, quota: 0, agents: 0, completion: 0, quotaMet: 0, nonQuota: 0 }
  });
  const dispatch = useDispatch()

  const { data, loading: combinedQuotaLoading } = useSelector(
    (state) => state.combinedQuota
  );


  

  // Number formatting function
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    } else {
      return num.toString();
    }
  };

  useEffect(() => {
    dispatch(fetchCombinedDepartmentsData())
  }, [])

  // Calculate real-time department statistics
  const calculateDepartmentStats = () => {
    if (!data || data.length === 0) return;

    const stats = {
      CSR: { transactions: 0, quota: 580, agents: 0, completion: 0, quotaMet: 0, nonQuota: 0 },
      Deposit: { transactions: 0, quota: 580, agents: 0, completion: 0, quotaMet: 0, nonQuota: 0 },
      Withdrawal: { transactions: 0, quota: 1500, agents: 0, completion: 0, quotaMet: 0, nonQuota: 0 }
    };

    let currentDepartment = "";
    let currentMonth = "";

    data.forEach((row) => {
      // Detect department
      if (row[0] && typeof row[0] === 'string') {
        const firstItem = row[0].toLowerCase();
        if (firstItem.includes('csr')) currentDepartment = "CSR";
        else if (firstItem.includes('deposit')) currentDepartment = "Deposit";
        else if (firstItem.includes('withdraw')) currentDepartment = "Withdrawal";
      }

      // Detect month
      if (row[2] && typeof row[2] === 'string') {
        const monthName = row[2].toLowerCase();
        if (monthName.includes('october')) currentMonth = "October";
        else if (monthName.includes('november')) currentMonth = "November";
      }

      // Process data rows for October
      if (currentMonth === "October" && currentDepartment && row.length > 5) {
        const isHeaderRow =
          row[1] === 'Member' ||
          row[1] === '' ||
          row[0]?.toLowerCase().includes('shift') ||
          row[0]?.toLowerCase().includes('trainees');

        if (!isHeaderRow && row[1] && row[1] !== '') {
          // Extract transaction data (assuming index 2 has transaction count)
          const transactions = parseInt(row[2]) || 0;
          stats[currentDepartment].transactions += transactions;
          stats[currentDepartment].agents += 1;

          // Calculate quota met based on some logic (you can adjust this)
          const quotaPercentage = (transactions / stats[currentDepartment].quota) * 100;
          if (quotaPercentage >= 70) {
            stats[currentDepartment].quotaMet += 1;
          } else {
            stats[currentDepartment].nonQuota += 1;
          }
        }
      }
    });

    // Calculate completion percentages
    Object.keys(stats).forEach(dept => {
      const deptStats = stats[dept];
      if (deptStats.agents > 0) {
        deptStats.completion = Math.round((deptStats.transactions / deptStats.quota) * 100);
        deptStats.quotaMet = Math.round((deptStats.quotaMet / deptStats.agents) * 100);
        deptStats.nonQuota = 100 - deptStats.quotaMet;
      }
    });

    console.log("Real-time Department Stats:", stats);
    setDepartmentStats(stats);
  };

  // Process data when it loads
  useEffect(() => {
    if (data && data.length > 0) {
      calculateDepartmentStats();
    }
  }, [data]);

  // Dynamic department data based on real stats
  const departmentData = {
    CSR: {
      transactions: departmentStats.CSR.transactions,
      quota: departmentStats.CSR.quota,
      agents: departmentStats.CSR.agents,
      completion: departmentStats.CSR.completion,
      quotaMet: departmentStats.CSR.quotaMet,
      nonQuota: departmentStats.CSR.nonQuota,
      chartData: {
        labels: ["Quota Met", "Non-Quota"],
        datasets: [
          {
            data: [departmentStats.CSR.quotaMet, departmentStats.CSR.nonQuota],
            backgroundColor: ["#00C49F", "#FF5A5F"],
          },
        ],
      }
    },
    Deposit: {
      transactions: departmentStats.Deposit.transactions,
      quota: departmentStats.Deposit.quota,
      agents: departmentStats.Deposit.agents,
      completion: departmentStats.Deposit.completion,
      quotaMet: departmentStats.Deposit.quotaMet,
      nonQuota: departmentStats.Deposit.nonQuota,
      chartData: {
        labels: ["Quota Met", "Non-Quota"],
        datasets: [
          {
            data: [departmentStats.Deposit.quotaMet, departmentStats.Deposit.nonQuota],
            backgroundColor: ["#00C49F", "#FF5A5F"],
          },
        ],
      }
    },
    Withdrawal: {
      transactions: departmentStats.Withdrawal.transactions,
      quota: departmentStats.Withdrawal.quota,
      agents: departmentStats.Withdrawal.agents,
      completion: departmentStats.Withdrawal.completion,
      quotaMet: departmentStats.Withdrawal.quotaMet,
      nonQuota: departmentStats.Withdrawal.nonQuota,
      chartData: {
        labels: ["Quota Met", "Non-Quota"],
        datasets: [
          {
            data: [departmentStats.Withdrawal.quotaMet, departmentStats.Withdrawal.nonQuota],
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

      {/* Enhanced Department Filter */}
      <div className="mt-6 flex justify-end">
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
      </div>

      {/* Enhanced Department Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-6 border-l-2 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Total Transactions</p>
              <p className="text-white text-2xl font-bold">{formatNumber(currentData.transactions)}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <BarChart3 size={24} className="text-blue-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">

            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formatNumber(currentData.completion)}%
            </span>
          </div>
        </div>

        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-6 border-l-2 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Daily Quota</p>
              <p className="text-white text-2xl font-bold">{formatNumber(currentData.quota)}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Target size={24} className="text-green-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-gray-400">
              Remaining: {formatNumber((currentData.quota, currentData.transactions))}
            </span>
          </div>
        </div>

        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-6 border-l-2 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Active Agents</p>
              <p className="text-white text-2xl font-bold">{formatNumber(currentData.agents)}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Users size={24} className="text-purple-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-gray-400">
              {formatNumber(Math.round(currentData.agents * (currentData.quotaMet / 100)))} agents met quota
            </span>
          </div>
        </div>

        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-6 border-l-2 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Quota Completion</p>
              <p className="text-white text-2xl font-bold">{currentData.quotaMet}%</p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <TrendingUp size={24} className="text-orange-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-xs font-medium ${currentData.quotaMet >= 75 ? "text-green-400" :
              currentData.quotaMet >= 50 ? "text-yellow-400" : "text-red-400"
              }`}>
              {currentData.quotaMet >= 75 ? "Excellent" :
                currentData.quotaMet >= 50 ? "Good" : "Needs Improvement"}
            </span>
          </div>
        </div>
      </div>

      {/* Dual Charts - Centered */}
      <div className="flex gap-6 mt-6 rounded-lg">
        <div className="rounded-xl shadow-xl bg-slate-900/40 border-slate-800 border w-1/3">
          <div className="relative w-80 h-80 mx-auto flex items-center justify-center p-4">
            {/* Donut Chart */}
            <Doughnut data={currentData.chartData} options={chartOptions} />

            {/* Center Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-extrabold text-white">
                {currentData.quotaMet}%
              </p>
              <p className="text-gray-400 text-sm font-medium">Quota Met</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border-slate-800 border rounded-xl w-2/3">
          <NonQuota department={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default Department;