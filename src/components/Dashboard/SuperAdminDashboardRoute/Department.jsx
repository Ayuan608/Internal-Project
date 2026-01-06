import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import {
  ChevronDown,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  Layout,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCombinedDepartmentsData } from "../../../redux/combinedQuotaSlice";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const NonQuotaMembersTable = ({ nonQuotaMembers, activeTab }) => {
  const excludedWords = [
    "hours",
    "backstage",
    "senior",
    "trainee",
    "highlight",
    "half",
    "failed",
    "assigned",
    "reached",
    "name",
  ];

  // 1️⃣ Filter valid members
  const filteredMembers = nonQuotaMembers?.filter((m) => {
    const name = m.name?.toLowerCase() || "";
    return !excludedWords.some((w) => name.includes(w));
  });

  // 2️⃣ Build rows with shift headers (FIXED)
  const rowsWithShiftHeaders = [];
  let lastShiftTitle = null;

  filteredMembers.forEach((m) => {
    if (m.shiftTitle && m.shiftTitle !== lastShiftTitle) {
      rowsWithShiftHeaders.push({
        type: "shift",
        title: m.shiftTitle,
        shift: m.shift?.toLowerCase(),
      });
      lastShiftTitle = m.shiftTitle;
    }

    rowsWithShiftHeaders.push({
      type: "member",
      ...m,
      shift: m.shift?.toLowerCase(),
    });
  });

  // 3️⃣ Target logic
  const getTargetForShift = (shift) => {
    if (activeTab === "CSR") {
      if (shift === "morning") return 500;
      if (shift === "night") return 600;
    }

    if (activeTab === "Deposit") {
      if (shift === "morning") return 530;
      if (shift === "night") return 450;
    }
    if (activeTab === "Withdrawal") {
      if (shift === "morning") return 1500;
      if (shift === "night") return 900;
      return 0;
    }

    return 0;
  };

  const calculateCompletion = (output, shift) => {
    const target = getTargetForShift(shift);
    return target ? Math.round((output / target) * 100) : 0;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm table-auto">
        <thead>
          <tr className="border-b border-gray-700/50">
            <th className="py-3 px-4 text-xs text-gray-300 text-center">DATE</th>
            <th className="py-3 px-4 text-xs text-gray-300 text-left">NAME</th>
            <th className="py-3 px-4 text-xs text-gray-300 text-center">OUTPUT</th>
            <th className="py-3 px-4 text-xs text-gray-300 text-center">SHIFT</th>
            <th className="py-3 px-4 text-xs text-gray-300 text-center">TARGET</th>
            <th className="py-3 px-4 text-xs text-gray-300 text-center">COMPLETION</th>
            <th className="py-3 px-4 text-xs text-gray-300 text-center">VARIANCE</th>
          </tr>
        </thead>

        <tbody>
          {rowsWithShiftHeaders.length > 0 ? (
            rowsWithShiftHeaders.map((row, idx) => {
              if (row.type === "shift") {
                const isMorning = row.title?.toLowerCase().includes("morning");
                const isNight = row.title?.toLowerCase().includes("night");

                return (
                  <tr key={idx} className="bg-black">
                    <td colSpan="7" className="px-4 py-2">
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold
            ${isMorning
                            ? "border border-yellow-500 text-yellow-400"
                            : isNight
                              ? "border border-green-500 text-green-400"
                              : "border border-gray-500 text-gray-400"
                          }
          `}
                      >
                        {row.title}
                      </span>
                    </td>
                  </tr>
                );
              }

              // 👤 MEMBER ROW
              const target = getTargetForShift(row.shift);
              const completion = calculateCompletion(row.output, row.shift);
              const variance = row.output - target;

              return (
                <tr
                  key={idx}
                  className="border-b border-gray-800/30 hover:bg-gray-900/40"
                >
                  <td className="py-3 px-4 text-gray-400 text-xs text-center">
                    {row.date}
                  </td>

                  <td className="py-3 px-4 text-white font-medium text-sm text-left">
                    {row.name}
                  </td>

                  <td className="py-3 px-4 text-white text-sm text-center">
                    {row.output}
                  </td>

                  <td className="py-3 px-4 text-center ">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                        ${row.shift === "morning"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                          : "bg-green-500/20 text-green-400 border border-green-500/40"
                        }
                      `}
                    >
                      {row.shift}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">{target}</td>

                  <td
                    className={`py-3 px-4 text-center font-semibold
                      ${completion >= 90 ? "text-green-400" : "text-red-400"}
                    `}
                  >
                    {completion}%
                  </td>

                  <td
                    className={`py-3 px-4 text-center
                      ${variance >= 0 ? "text-green-400" : "text-red-400"}
                    `}
                  >
                    {variance}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className="py-8 text-center text-gray-400">
                All agents have met their quota targets
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const Department = () => {
  const [activeTab, setActiveTab] = useState("CSR");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState("side");
  const [departmentStats, setDepartmentStats] = useState({
    CSR: {
      transactions: 0,
      totalQuota: 560,
      morningQuota: 500,
      nightQuota: 600,
      agents: 0,
      completion: 0,
      quotaMet: 0,
      nonQuota: 0,
      totalAgents: 0,
      quotaMetCount: 0,
      nonQuotaCount: 0,
      morningAgents: 0,
      nightAgents: 0,
    },
    Deposit: {
      transactions: 0,
      totalQuota: 560,
      morningQuota: 530,
      nightQuota: 450,
      agents: 0,
      completion: 0,
      quotaMet: 0,
      nonQuota: 0,
      totalAgents: 0,
      quotaMetCount: 0,
      nonQuotaCount: 0,
      morningAgents: 0,
      nightAgents: 0,
    },
    Withdrawal: {
      transactions: 0,
      totalQuota: 1500,
      morning12Quota: 1400,
      morning9Quota: 900,
      night12Quota: 1500,
      night9Quota: 1000,
      agents: 0,
      completion: 0,
      quotaMet: 0,
      nonQuota: 0,
      totalAgents: 0,
      quotaMetCount: 0,
      nonQuotaCount: 0,
    },
  });
  const [nonQuotaMembers, setNonQuotaMembers] = useState([]);

  const dispatch = useDispatch();
  const { data, loading: combinedQuotaLoading } = useSelector(
    (state) => state.combinedQuota
  );
  console.log("data of departent", data)

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num?.toString();
  };

  useEffect(() => {
    dispatch(fetchCombinedDepartmentsData());
  }, [dispatch]);
  // Convert "12/04" or "2025-12-04" → "December 4, 2025"
  const formatDateReadable = (raw) => {
    if (!raw) return "N/A";

    let date;

    // If format is "12/04"
    if (raw.includes("/")) {
      const [month, day] = raw.split("/");
      const year = new Date().getFullYear();
      date = new Date(`${year}-${month}-${day}`);
    }
    // If format already "2025-12-04"
    else {
      date = new Date(raw);
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Function to extract shift from agent name
  const getShiftFromName = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("morning")) return "morning";
    if (lowerName.includes("night")) return "night";
    if (lowerName.includes("12h")) return "morning12";
    if (lowerName.includes("9h")) return "morning9";
    return "morning"; // default
  };

  // Function to get target based on department and shift
  const getTargetForAgent = (department, shift) => {
    if (department === "CSR") {
      if (shift === "morning") return 500;
      if (shift === "night") return 600;
      return 560;
    } else if (department === "Deposit") {
      if (shift === "morning") return 530;
      if (shift === "night") return 450;
      return 560;
    } else if (department === "Withdrawal") {
      if (shift === "morning12") return 1400;
      if (shift === "morning9") return 900;
      if (shift === "night12") return 1500;
      if (shift === "night9") return 1000;
      return 1500;
    }
    return 0;
  };
  let currentShiftTitle = null;

  const calculateDepartmentStats = () => {
    if (!data || data.length === 0) {
      return;
    }

    const stats = {
      CSR: {
        transactions: 0,
        agents: 0,
        completion: 0,
        quotaMet: 0,
        nonQuota: 0,
        totalAgents: 0,
        quotaMetCount: 0,
        nonQuotaCount: 0,
        morningAgents: 0,
        nightAgents: 0,
      },
      Deposit: {
        transactions: 0,
        agents: 0,
        completion: 0,
        quotaMet: 0,
        nonQuota: 0,
        totalAgents: 0,
        quotaMetCount: 0,
        nonQuotaCount: 0,
        morningAgents: 0,
        nightAgents: 0,
      },
      Withdrawal: {
        transactions: 0,
        agents: 0,
        completion: 0,
        quotaMet: 0,
        nonQuota: 0,
        totalAgents: 0,
        quotaMetCount: 0,
        nonQuotaCount: 0,
      },
    };

    const nonQuotaList = [];

    data.forEach((row) => {
      if (
        Array.isArray(row) &&
        row.length === 4 &&
        typeof row[2] === "string" &&
        row[2].toLowerCase().includes("shift")
      ) {
        currentShiftTitle = row[2]; // 👈 THIS IS THE KEY
        return;
      }
      const sheetDate = row[1];

      const department = row[0]?.toString()?.trim();
      const memberName = row[2]?.toString()?.trim();

      if (
        !department ||
        !memberName ||
        memberName.toLowerCase().includes("member") ||
        memberName.toLowerCase().includes("total") ||
        memberName.toLowerCase().includes("shift") ||
        memberName === ""
      ) {
        return;
      }

      const shift = row[row.length - 1]?.toString()?.toLowerCase();

      if (department === "CSR") {
        const conversations =
          parseFloat(row[3]?.toString()?.replace(/,/g, "")) || 0;

        // ✅ ONLY MORNING / NIGHT (IGNORE 9hrs / 12hrs)
        let target = 0;
        if (shift === "morning") target = 500;
        else if (shift === "night") target = 600;

        stats.CSR.transactions += conversations;
        stats.CSR.totalAgents += 1;

        if (shift === "morning") stats.CSR.morningAgents += 1;
        if (shift === "night") stats.CSR.nightAgents += 1;

        const quotaPercentage =
          target > 0 ? (conversations / target) * 100 : 0;

        if (conversations >= target) {
          stats.CSR.quotaMetCount += 1;
        } else {
          stats.CSR.nonQuotaCount += 1;

          nonQuotaList.push({
            department: "CSR",
            date: formatDateReadable(sheetDate),
            name: memberName,
            output: conversations,
            shift,
            shiftTitle: currentShiftTitle,
            quota: target,
            completion: Math.round((conversations / target) * 100),
            variance: conversations - target,
          });
        }

      }

      else if (department === "Deposit") {

        if (
          memberName.toLowerCase().includes("total") ||
          memberName.toLowerCase().includes("member")
        ) return;

        const shift = row[row.length - 1]?.toString().toLowerCase();

        // ✅ ALWAYS TOTAL column
        const depositAmount =
          parseFloat(row[9]?.toString()?.replace(/,/g, "")) || 0;

        const target =
          shift === "morning" ? 530 :
            shift === "night" ? 450 : 0;

        const quotaPercentage =
          target > 0 ? (depositAmount / target) * 100 : 0;

        stats.Deposit.transactions += depositAmount;
        stats.Deposit.totalAgents += 1;

        if (shift === "morning") stats.Deposit.morningAgents += 1;
        if (shift === "night") stats.Deposit.nightAgents += 1;

        if (quotaPercentage < 100) {
          stats.Deposit.nonQuotaCount += 1;

          nonQuotaList.push({
            department: "Deposit",
            date: formatDateReadable(sheetDate),
            name: memberName,
            output: depositAmount,     // ✅ 461, 502, 360, 279...
            shift,
            shiftTitle: currentShiftTitle,
            quota: target,             // 530 / 450
            completion: Math.round(quotaPercentage),
            variance: depositAmount - target
          });
        } else {
          stats.Deposit.quotaMetCount += 1;
        }
      }
      else if (department === "Withdraw") {

        // ✅ Total Transaction process (row[7] is correct)
        const transactionsProcessed =
          parseFloat(row[7]?.toString()?.replace(/,/g, "")) || 0;

        // ✅ UPDATED SHIFT-BASED TARGET
        let target = 0;
        if (shift === "morning") target = 1500;
        else if (shift === "night") target = 900;

        stats.Withdrawal.transactions += transactionsProcessed;
        stats.Withdrawal.totalAgents += 1;

        const quotaPercentage =
          target > 0 ? (transactionsProcessed / target) * 100 : 0;

        // ✅ SHOW ONLY BELOW TARGET
        if (transactionsProcessed < target) {

          stats.Withdrawal.nonQuotaCount += 1;

          nonQuotaList.push({
            department: "Withdrawal",
            date: formatDateReadable(sheetDate),
            name: memberName,
            output: transactionsProcessed,
            shift,
            quota: target, // ✅ 1500 / 900
            completion: Math.round(quotaPercentage),
            variance: transactionsProcessed - target, // negative = below
          });

        } else {
          stats.Withdrawal.quotaMetCount += 1;
        }
      }

    });

    // Calculate percentages
    Object.keys(stats).forEach((dept) => {
      const deptStats = stats[dept];
      const baseStats = departmentStats[dept];

      // Calculate completion based on total transactions vs weighted quota
      const weightedQuota = dept === "CSR"
        ? (baseStats.morningQuota * (deptStats.morningAgents || 1) +
          baseStats.nightQuota * (deptStats.nightAgents || 1)) /
        (deptStats.morningAgents + deptStats.nightAgents || 1)
        : dept === "Deposit"
          ? (baseStats.morningQuota * (deptStats.morningAgents || 1) +
            baseStats.nightQuota * (deptStats.nightAgents || 1)) /
          (deptStats.morningAgents + deptStats.nightAgents || 1)
          : baseStats.totalQuota;

      deptStats.completion = weightedQuota > 0
        ? Math.min(Math.round((deptStats.transactions / weightedQuota) * 100), 100)
        : 0;

      deptStats.quotaMet = deptStats.totalAgents > 0
        ? Math.round((deptStats.quotaMetCount / deptStats.totalAgents) * 100)
        : 0;

      deptStats.nonQuota = 100 - deptStats.quotaMet;
      deptStats.agents = deptStats.totalAgents;
    });

    setDepartmentStats(prev => ({
      CSR: { ...prev.CSR, ...stats.CSR },
      Deposit: { ...prev.Deposit, ...stats.Deposit },
      Withdrawal: { ...prev.Withdrawal, ...stats.Withdrawal },
    }));
    setNonQuotaMembers(nonQuotaList);
  };

  useEffect(() => {
    if (data && data.length > 0) {
      calculateDepartmentStats();
    }
  }, [data]);

  const currentData = departmentStats[activeTab];
  const quotaMet = currentData?.quotaMet || 0;

  const chartData = {
    labels: ["Quota Met", "Non-Quota"],
    datasets: [
      {
        data: [quotaMet, 100 - quotaMet],
        backgroundColor: ["#10b981", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` },
      },
    },
  };

  const getDeviceChartData = () => {
    return [
      {
        name: "Quota Met",
        value: currentData?.quotaMetCount || 0,
        color: "#3b82f6",
      },
      {
        name: "Below Target",
        value: currentData?.nonQuotaCount || 0,
        color: "#f97316",
      },
      {
        name: "On Track",
        value: Math.max(
          0,
          (currentData?.agents || 0) -
          (currentData?.quotaMetCount || 0) -
          (currentData?.nonQuotaCount || 0)
        ),
        color: "#06b6d4",
      },
    ];
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    sublabel,
    bgColor,
    borderColor,
    textColor,
  }) => (
    <div
      className={`bg-slate-900/50 border rounded-lg p-4 hover:shadow-lg transition ${borderColor}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
          {label !== "Shift-Based Quota" && (
            <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
          )}

          {sublabel && (
            <p className="text-sm text-white mt-2 whitespace-pre-line">
              {sublabel}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  const filteredNonQuotaMembers = nonQuotaMembers.filter(
    (m) => m.department === activeTab
  );

  return (
    <div className="min-h-screen text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Department Management</h1>
        <p className="text-gray-400">
          Monitor and manage department quotas and performance
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex justify-between items-center mb-8 gap-4">
        <div className="relative inline-block w-64">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border transition ${isDropdownOpen
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 bg-slate-900/40 hover:border-gray-600"
              }`}
          >
            <span className="font-medium text-sm">{activeTab} Department</span>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition ${isDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-gray-700 rounded-lg shadow-xl z-10">
              {["CSR", "Deposit", "Withdrawal"].map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    setActiveTab(dept);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition ${activeTab === dept
                    ? "bg-blue-500/20 text-blue-300"
                    : "text-gray-300 hover:bg-slate-700"
                    }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() =>
            setLayoutMode(layoutMode === "stacked" ? "side" : "stacked")
          }
          className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(59,130,246,0.03)] border border-gray-700 rounded-lg hover:border-gray-600 transition text-sm"
        >
          <Layout size={16} />
          {layoutMode === "stacked" ? "Side View" : "Stacked View"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={BarChart3}
          label={
            activeTab === "CSR" ? "Total Conversations" : "Total Transactions"
          }
          value={formatNumber(currentData?.transactions)}
          sublabel={`${currentData?.completion}% of target`}
          bgColor="bg-blue-600/30"
          borderColor="border border-blue-600/50"
          textColor="text-blue-400"
        />
        <StatCard
          icon={Target}
          label="Shift-Based Quota"
          value={formatNumber(currentData?.totalQuota)}
          sublabel={
            <>
              {activeTab === "CSR" && (
                <>
                  Morning Shift: {currentData?.morningQuota}
                  <br />
                  Night Shift: {currentData?.nightQuota}
                </>
              )}

              {activeTab === "Deposit" && (
                <>
                  Morning Shift: {currentData?.morningQuota}
                  <br />
                  Night Shift: {currentData?.nightQuota}
                </>
              )}

              {activeTab === "Withdrawal" && (
                <>
                  Morning 12h: {currentData?.morning12Quota}
                  <br />
                  Morning 9h: {currentData?.morning9Quota}
                  <br />
                  Night 12h: {currentData?.night12Quota}
                  <br />
                  Night 9h: {currentData?.night9Quota}
                </>
              )}
            </>
          }
          bgColor={
            activeTab === "CSR"
              ? "bg-blue-600/30"
              : activeTab === "Deposit"
                ? "bg-green-600/30"
                : "bg-orange-600/30"
          }
          borderColor={
            activeTab === "CSR"
              ? "border border-blue-600/50"
              : activeTab === "Deposit"
                ? "border border-green-600/50"
                : "border border-orange-600/50"
          }
          textColor="text-white"
        />

        <StatCard
          icon={Users}
          label="Active Agents"
          value={currentData?.agents}
          sublabel={`${currentData?.quotaMetCount} met • ${currentData?.nonQuotaCount} below`}
          bgColor="bg-purple-600/30"
          borderColor="border border-purple-600/50"
          textColor="text-white"
        />
        <StatCard
          icon={TrendingUp}
          label="Quota Completion"
          value={`${quotaMet}%`}
          sublabel={
            quotaMet >= 75
              ? "Excellent"
              : quotaMet >= 50
                ? "Good"
                : "Needs Improvement"
          }
          bgColor="bg-orange-600/30"
          borderColor="border border-orange-600/50"
          textColor={
            quotaMet >= 75
              ? "text-green-400"
              : quotaMet >= 50
                ? "text-yellow-400"
                : "text-red-400"
          }
        />
      </div>

      {/* Main Content - Dynamic Layout */}
      {layoutMode === "stacked" ? (
        <div className="space-y-0">
          {/* Top Row - Two Charts Side by Side */}
          <div className="grid grid-cols-2 gap-0 mb-0">
            {/* Left Chart - Enhanced Doughnut */}
            <div className="bg-[rgba(59,130,246,0.03)] border border-gray-800/50 rounded-tl-lg p-8">
              <h2 className="text-xl font-bold mb-8">
                {activeTab} Department Performance
              </h2>
              <div className="flex flex-col items-center justify-center h-80">
                <div className="relative w-64 h-64 mb-6">
                  <Doughnut data={chartData} options={chartOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-4xl font-bold text-green-400">
                      {quotaMet}%
                    </p>
                    <p className="text-gray-400 text-sm mt-2">Quota Met</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {currentData?.quotaMetCount}/{currentData?.agents} agents
                    </p>
                  </div>
                </div>

                {/* Progress Below Chart */}
                <div className="w-full mt-6 px-4">
                  <div className="bg-gray-700/40 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 via-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-700 shadow-lg shadow-green-500/50"
                      style={{ width: `${quotaMet}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Chart - Large Pie with Right Legend */}
            <div className="bg-[rgba(59,130,246,0.03)] border border-l-0 border-gray-800/50 rounded-tr-lg p-8">
              <h2 className="text-xl font-bold mb-8">Agent Distribution</h2>
              <div className="flex items-center justify-between h-80">
                {/* Pie Chart - Left Side */}
                <div
                  style={{ width: "50%" }}
                  className="flex items-center justify-center"
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={getDeviceChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {getDeviceChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend - Right Side */}
                <div className="space-y-4 flex-1 pl-6">
                  {getDeviceChartData().map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-300">
                          {item.name}
                        </p>
                        <p
                          className="text-lg font-bold"
                          style={{ color: item.color }}
                        >
                          {item.value}
                          <span className="text-xs text-gray-400 ml-2">
                            (
                            {currentData?.agents > 0
                              ? Math.round(
                                (item.value / currentData?.agents) * 100
                              )
                              : 0}
                            %)
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-[rgba(59,130,246,0.03)] border border-t-0 border-gray-700/50 rounded-b-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  Non-Quota Dashboard - {activeTab} Department
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                  Track members who haven't met their shift-based quota targets
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-red-900/30 px-4 py-2 rounded-lg border border-red-700/50">
                  <span className="text-red-300 text-sm font-semibold">
                    {filteredNonQuotaMembers.length} Non-Quota
                  </span>
                </div>
                <div className="bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-700/50">
                  <span className="text-blue-300 text-sm font-semibold">
                    {currentData?.agents} Total
                  </span>
                </div>
              </div>
            </div>
            <NonQuotaMembersTable
              activeTab={activeTab}
              nonQuotaMembers={filteredNonQuotaMembers}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Chart - Bar Chart */}
            <div className="bg-[rgba(59,130,246,0.03)] border border-gray-700/50 rounded-lg p-8">
              <h2 className="text-lg font-bold mb-8">
                {activeTab} Performance Metrics
              </h2>
              <div className="space-y-6">
                {/* Metric 1 */}
                <div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-300">
                        Quota Achievement
                      </span>
                      <span className="text-xl font-bold text-blue-400">
                        {quotaMet}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/40 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-700 shadow-lg shadow-blue-500/50"
                        style={{ width: `${quotaMet}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-300">
                        Agents Met Quota
                      </span>
                      <span className="text-xl font-bold text-green-400">
                        {currentData?.quotaMetCount}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/40 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-700 shadow-lg shadow-green-500/50"
                        style={{
                          width: `${currentData?.agents > 0
                            ? (currentData?.quotaMetCount /
                              currentData?.agents) *
                            100
                            : 0
                            }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-300">
                        Below Target
                      </span>
                      <span className="text-xl font-bold text-orange-400">
                        {currentData?.nonQuotaCount}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/40 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full transition-all duration-700 shadow-lg shadow-orange-500/50"
                        style={{
                          width: `${currentData?.agents > 0
                            ? (currentData?.nonQuotaCount /
                              currentData?.agents) *
                            100
                            : 0
                            }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="border-t border-gray-700/50 pt-6 mt-6 ">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-500/10 border border-blue-600/30 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-xs mb-1">Total Agents</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {currentData?.agents}
                      </p>
                    </div>
                    <div className="bg-green-500/10 border border-green-600/30 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-xs mb-1">Met Quota</p>
                      <p className="text-2xl font-bold text-green-400">
                        {currentData?.quotaMetCount}
                      </p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-600/30 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-xs mb-1">Below Quota</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {currentData?.nonQuotaCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Chart - Enhanced Pie with Legend */}
            <div className="bg-[rgba(59,130,246,0.03)] border border-gray-700/50 rounded-lg p-8">
              <h2 className="text-lg font-bold mb-8">Agent Status Breakdown</h2>
              <div className="flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={getDeviceChartData()}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {getDeviceChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Enhanced Legend */}
                <div className="w-full grid grid-cols-3 gap-3 mt-6">
                  {getDeviceChartData().map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border transition hover:shadow-lg"
                      style={{
                        backgroundColor: item.color + "15",
                        borderColor: item.color + "50",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-xs font-semibold text-gray-300">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-2xl font-bold"
                          style={{ color: item.color }}
                        >
                          {item.value}
                        </span>
                        <span className="text-xs text-gray-400">
                          {currentData?.agents > 0
                            ? Math.round(
                              (item.value / currentData?.agents) * 100
                            )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table - Full Width */}
          <div className="bg-[rgba(59,130,246,0.03)] border border-gray-700/50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">
                  Non-Quota Dashboard - {activeTab} Department
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  Track members who haven't met their shift-based quota targets
                </p>
              </div>
              <div className="flex gap-2">
                <div className="bg-red-900/30 px-3 py-1 rounded-lg border border-red-700/50">
                  <span className="text-red-300 text-xs">
                    {filteredNonQuotaMembers.length} Non-Quota
                  </span>
                </div>
                <div className="bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-700/50">
                  <span className="text-blue-300 text-xs">
                    {currentData?.agents} Total
                  </span>
                </div>
              </div>
            </div>
            <NonQuotaMembersTable
              activeTab={activeTab}
              nonQuotaMembers={filteredNonQuotaMembers}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Department;