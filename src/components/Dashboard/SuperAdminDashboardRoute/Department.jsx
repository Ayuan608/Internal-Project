import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  const dispatch = useDispatch();

  const { data, loading: combinedQuotaLoading } = useSelector(
    (state) => state.combinedQuota
  );

  useEffect(() => {
    dispatch(fetchCombinedDepartmentsData());
  }, []);

  const parseNumber = useCallback((value) => {
    if (typeof value === "string") return Number(value.replace(/,/g, ""));
    return Number(value) || 0;
  }, []);

  const extractAvailableMonths = useCallback((data) => {
    if (!data || !Array.isArray(data)) return ["September"];
    const months = [];
    data.forEach((row) => {
      if (Array.isArray(row) && row.length >= 3 && row[1] === "" && row[2] && typeof row[2] === 'string') {
        const month = row[2];
        if (!months.includes(month)) months.push(month);
      }
    });
    return months.length > 0 ? months : ["September"];
  }, []);

  const getRowMonth = useCallback((row) => {
    if (!Array.isArray(row) || row.length < 3) return null;
    if (row[1] === "" && row[2] && typeof row[2] === 'string') return row[2];
    return null;
  }, []);

  const filterDataByMonth = useCallback(
    (data, targetMonth) => {
      if (!data || !Array.isArray(data)) return [];
      let currentMonth = targetMonth;
      const filteredData = [];
      let includeCurrentData = false;

      data.forEach((row) => {
        const rowMonth = getRowMonth(row);
        if (rowMonth) {
          currentMonth = rowMonth;
          includeCurrentData = currentMonth === targetMonth;
        } else if (includeCurrentData && Array.isArray(row) && row.length > 0) {
          filteredData.push(row);
        }
      });
      return filteredData;
    },
    [getRowMonth]
  );

  const availableMonths = useMemo(
    () => extractAvailableMonths(data),
    [data, extractAvailableMonths]
  );

  // Get current month and previous month according to calendar
  const getCurrentMonth = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentDate = new Date();
    return months[currentDate.getMonth()];
  };

  const getPreviousMonth = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentDate = new Date();
    let previousMonthIndex = currentDate.getMonth() - 1;

    // Handle January case (previous month would be December)
    if (previousMonthIndex < 0) {
      previousMonthIndex = 11; // December
    }

    return months[previousMonthIndex];
  };

  // Get the month we want to show data for (Previous Month)
  const displayMonth = useMemo(() => {
    const currentMonth = getCurrentMonth();
    const previousMonth = getPreviousMonth();

    console.log("=== MONTH CALCULATION ===");
    console.log("📅 Current Month:", currentMonth);
    console.log("📅 Previous Month:", previousMonth);
    console.log("📊 Available Months in Data:", availableMonths);

    // Always try to show previous month's data
    if (availableMonths.includes(previousMonth)) {
      console.log("✅ PREVIOUS MONTH FOUND IN DATA - Showing:", previousMonth);
      return previousMonth;
    }

    // If previous month not available, show the latest available month
    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    if (availableMonths.length === 0) {
      console.log("❌ NO DATA AVAILABLE - Defaulting to:", previousMonth);
      return previousMonth;
    }

    let latestMonth = availableMonths[0];
    let highestIndex = monthOrder.indexOf(availableMonths[0]);

    availableMonths.forEach(month => {
      const currentIndex = monthOrder.indexOf(month);
      if (currentIndex > highestIndex) {
        highestIndex = currentIndex;
        latestMonth = month;
      }
    });

    console.log("📈 LATEST MONTH FROM DATA - Showing:", latestMonth);
    console.log("=== MONTH CALCULATION COMPLETE ===");

    return latestMonth;
  }, [availableMonths]);

  console.log('🎯 FINAL DISPLAY MONTH:', displayMonth);
  console.log('📋 ALL AVAILABLE MONTHS:', availableMonths);

  const monthlyData = useMemo(
    () => filterDataByMonth(data, displayMonth),
    [data, displayMonth, filterDataByMonth]
  );

  console.log('📊 MONTHLY DATA FOR', displayMonth, ':', monthlyData);
  console.log('📊 DATA ROWS COUNT:', monthlyData.length);

  const getDepartmentData = useCallback((dept) => {
    console.log(`🔍 Getting ${dept} department data for ${displayMonth}`);

    let quotaIndex, target;
    if (dept === 'CSR') {
      quotaIndex = 2;
      target = 530;
    } else if (dept === 'Deposit') {
      quotaIndex = 9;
      target = 530;
    } else if (dept === 'Withdrawal') {
      quotaIndex = 7;
      target = 1500;
    } else {
      return {
        transactions: 0,
        quota: 0,
        agents: 0,
        completion: 0,
        quotaMet: 0,
        nonQuota: 100,
        chartData: {
          labels: ["Quota Met", "Non-Quota"],
          datasets: [
            {
              data: [0, 100],
              backgroundColor: ["#00C49F", "#FF5A5F"],
            },
          ],
        }
      };
    }

    const filtered = monthlyData.filter((row) =>
      row[0]?.toLowerCase().includes(dept.toLowerCase()) &&
      Array.isArray(row) &&
      row.length > quotaIndex + 1 &&
      row[1] &&
      typeof row[1] === 'string' &&
      !row[1].includes('shift') &&
      row[1] !== 'Member'
    );

    console.log(`👥 ${dept} agents found:`, filtered.length);

    const values = filtered
      .map((row) => parseNumber(row[quotaIndex]))
      .filter((num) => !isNaN(num) && num !== 0);

    const agents = filtered.length;
    const totalTransactions = values.reduce((acc, curr) => acc + curr, 0);
    const aboveTargetCount = values.filter((v) => v >= target).length;
    const quotaMetPercent = agents > 0 ? (aboveTargetCount / agents) * 100 : 0;
    const quotaTotal = target * agents;

    console.log(`📈 ${dept} Summary:`, {
      agents,
      totalTransactions,
      aboveTargetCount,
      quotaMetPercent: Math.round(quotaMetPercent),
      quotaTotal
    });

    return {
      transactions: totalTransactions,
      quota: quotaTotal,
      agents,
      completion: Math.round(quotaMetPercent),
      quotaMet: Math.round(quotaMetPercent),
      nonQuota: 100 - Math.round(quotaMetPercent),
      chartData: {
        labels: ["Quota Met", "Non-Quota"],
        datasets: [
          {
            data: [Math.round(quotaMetPercent), 100 - Math.round(quotaMetPercent)],
            backgroundColor: ["#00C49F", "#FF5A5F"],
          },
        ],
      }
    };
  }, [monthlyData, parseNumber, displayMonth]);

  const currentData = useMemo(() => getDepartmentData(activeTab), [activeTab, getDepartmentData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      title: {
        display: true,
        text: `${activeTab} Department - ${displayMonth}`,
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

  if (combinedQuotaLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading department data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 px-2">
      {/* Title */}
      <div className="flex justify-between items-center mt-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Department Performance - {displayMonth}
          </h1>
          <p className="text-gray-500">
            Showing data for previous month performance
          </p>
          {/* Debug info */}
          <div className="text-xs text-gray-400 mt-1 bg-gray-800/50 p-2 rounded">
            <div>🔄 Current Month: <span className="text-green-300">{getCurrentMonth()}</span></div>
            <div>📅 Previous Month: <span className="text-blue-300">{getPreviousMonth()}</span></div>
            <div>🎯 Showing Data For: <span className="text-yellow-300 font-bold">{displayMonth}</span></div>
            <div>📊 Available Data: <span className="text-purple-300">{availableMonths.join(", ")}</span></div>
            <div>📈 Data Rows: <span className="text-orange-300">{monthlyData.length}</span></div>
          </div>
        </div>
        <ExampleIosSwitch />
      </div>

      {/* Rest of your component remains the same */}
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
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10 overflow-hidden">
              {["CSR", "Deposit", "Withdrawal"].map((department) => (
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
        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-6 border-l-2 transition-all duration-200 hover:shadow-lg border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Total Completed</p>
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

        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-6 border-l-2 transition-all duration-200 hover:shadow-lg border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Total Quota</p>
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

        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-6 border-l-2 transition-all duration-200 hover:shadow-lg border-purple-500/30">
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
              {currentData.agents > 0 ? Math.round((currentData.agents / currentData.agents) * currentData.completion) : 0} agents met quota
            </span>
          </div>
        </div>

        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-6 border-l-2 transition-all duration-200 hover:shadow-lg border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Quota Met Rate</p>
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
      <div className="flex gap-6 mt-6">
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