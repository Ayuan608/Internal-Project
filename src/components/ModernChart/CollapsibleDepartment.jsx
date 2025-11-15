import React from "react";
import {
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle,
  Target,
  MessageCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Activity,
  DollarSign,
  TrendingDown,
} from "lucide-react";

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`backdrop-blur-xl bg-[#282e3c38] rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

const AnimatedMetricCard = ({ title, value, change, icon: Icon, color }) => (
  <GlassCard className="p-6 group hover:scale-105 transition-transform duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    <h3 className="text-xl font-bold text-white mb-1">{value}</h3>
    <p className="text-sm text-gray-400">{title}</p>
  </GlassCard>
);

const StaffPill = ({ staffPerShift, deptKey, deptData, userLength }) => {

  // Get the correct department key from userLength object
  const getDepartmentKey = () => {
    const keys = Object.keys(userLength || {});

    // Map deptKey to possible keys in userLength
    const keyMap = {
      'csr': ['CSR'],
      'deposit': ['Deposit'],
      'withdrawal': ['Withdraw', 'Withdrawal']
    };

    const possibleKeys = keyMap[deptKey] || [deptKey];

    // Find the matching key in userLength
    const matchingKey = possibleKeys.find(key =>
      keys.some(userKey => userKey.toLowerCase() === key.toLowerCase())
    );

    if (matchingKey) {
      // Find the exact key with case sensitivity
      return keys.find(key => key.toLowerCase() === matchingKey.toLowerCase());
    }

    return null;
  };

  const departmentKey = getDepartmentKey();
  const userArray = departmentKey ? userLength[departmentKey] : [];
  const totalStaff = Array.isArray(userArray) ? userArray.length : 0;

  const s = staffPerShift?.[deptKey] || { morning: 0, night: 0 };

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-xs">
        <Users size={14} className="opacity-80" />
        <span className="font-semibold">{totalStaff}</span>
        <span className="opacity-70">users</span>
      </div>
      <div className="absolute top-full right-0 mt-1 z-50 hidden group-hover:block whitespace-nowrap px-2.5 py-1.5 rounded-md text-[11px] bg-black/80 text-white border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Morning: <span className="font-medium">{s.morning}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          Night: <span className="font-medium">{s.night}</span>
        </div>
        <div className="border-t border-white/20 mt-1 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Total Users: <span className="font-medium">{totalStaff}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CollapsibleDepartment = ({
  title,
  subtitle,
  metrics,
  deptKey,
  expandedDept,
  setExpandedDept,
  data,
  userLength,
  TotalSum,
  staffPerShift = {},
}) => {
  // 🔍 Filter department data based on actual data structure
  const filterByDepartment = (deptName) => {
    return (data || []).filter(row => {
      if (!Array.isArray(row) || row.length === 0) return false;
      return row[0] === deptName;
    });
  };

  const csrData = filterByDepartment("CSR");
  const depositData = filterByDepartment("Deposit");
  const withdrawData = filterByDepartment("Withdraw");

  const deptData =
    deptKey === "csr"
      ? csrData
      : deptKey === "deposit"
        ? depositData
        : withdrawData;

  // 🎯 Calculate real metrics from actual data structure
  const calculateCSRMetrics = () => {
    if (deptKey !== "csr") return {};

    // Filter out header rows and get only agent data
    const agentRows = csrData.filter(row =>
      row.length > 5 && // Has enough data columns
      typeof row[2] === 'string' &&
      !row[2].includes('shift') &&
      !row[2].includes('Trainees') &&
      row[2] !== '' &&
      !row[2].includes('Ave. Completed Convo')
    );

    const totalAgents = agentRows.length;

    let totalCompleted = 0;

    data.forEach((item) => {
      const key = item[0];

      // CSR: Process rows where the 4th index is "Ave. Completed Convo"
      if (key === "CSR" && item[3] === "Ave. Completed Convo") {
        const morningShift = parseFloat(item[4]) || 0;
        const nightShift = parseFloat(item[5]) || 0;
        const sum = morningShift + nightShift;
        totalCompleted += sum;
      }
    });

    // Calculate effective conversations (index 4)
    const totalEffective = agentRows.reduce((sum, row) => sum + (parseInt(row[4]) || 0), 0);

    // Calculate total messages (index 5)
    const totalMessages = agentRows.reduce((sum, row) => sum + (parseInt(row[5]) || 0), 0);

    // Calculate missed chats (index 6)
    const totalMissed = agentRows.reduce((sum, row) => sum + (parseInt(row[6]) || 0), 0);

    // Calculate average online time
    const onlineTimes = agentRows
      .map(row => {
        const timeStr = row[7]; // Online time at index 7
        if (!timeStr || timeStr === '0:00:00') return 0;
        const [h, m, s] = timeStr.split(':').map(Number);
        return h + (m / 60) + (s / 3600);
      })
      .filter(time => time > 0);

    const avgOnlineHours = onlineTimes.length > 0
      ? (onlineTimes.reduce((a, b) => a + b, 0) / onlineTimes.length).toFixed(1) + "h"
      : "0h";

    // Calculate positive rates (index 8)
    const positiveRates = agentRows
      .map(row => {
        const rateStr = row[8]; // Positive rate at index 8
        if (!rateStr || rateStr === '0.00%') return 0;
        return parseFloat(rateStr) || 0;
      })
      .filter(rate => rate > 0);

    const avgPositiveRate = positiveRates.length > 0
      ? (positiveRates.reduce((a, b) => a + b, 0) / positiveRates.length).toFixed(1) + "%"
      : "0%";

    // Calculate negative rates (index 9)
    const negativeRates = agentRows
      .map(row => {
        const rateStr = row[9]; // Negative rate at index 9
        if (!rateStr || rateStr === '0.00%') return 0;
        return parseFloat(rateStr) || 0;
      })
      .filter(rate => rate > 0);

    const avgNegativeRate = negativeRates.length > 0
      ? (negativeRates.reduce((a, b) => a + b, 0) / negativeRates.length).toFixed(1) + "%"
      : "0%";

    // Count agents who met quota (530)
    const agentsMetQuota = agentRows.filter(row => (parseInt(row[3]) || 0) >= 530).length;
    const quotaMetPercent = totalAgents > 0 ? ((agentsMetQuota / totalAgents) * 100).toFixed(1) + "%" : "0%";

    return {
      totalAgents,
      totalCompleted,
      totalEffective,
      totalMessages,
      totalMissed,
      avgOnlineHours,
      avgPositiveRate,
      avgNegativeRate,
      agentsMetQuota,
      quotaMetPercent
    };
  };

  const calculateWithdrawMetrics = () => {
    if (deptKey !== "withdrawal") return {};

    // Filter out header rows and get only member data
    const memberRows = withdrawData.filter(row =>
      row.length > 5 &&
      typeof row[2] === 'string' &&
      row[2] !== 'Member' &&
      row[2] !== 'TOTAL' &&
      !row[2].includes('reject') &&
      !row[2].includes('拒绝提现')
    );

    // Calculate passed transactions (index 3)
    const totalPassed = memberRows.reduce((sum, row) => {
      const passed = parseInt((row[3] || "0").replace(/,/g, "")) || 0;
      return sum + passed;
    }, 0);

    // Calculate passed amount (index 4)
    const totalPassedAmount = memberRows.reduce((sum, row) => {
      const amount = parseInt((row[4] || "0").replace(/,/g, "")) || 0;
      return sum + amount;
    }, 0);

    // Calculate rejected transactions (index 5)
    const totalRejected = memberRows.reduce((sum, row) => {
      const rejected = parseInt((row[5] || "0").replace(/,/g, "")) || 0;
      return sum + rejected;
    }, 0);

    // Calculate rejected amount (index 6)
    const totalRejectedAmount = memberRows.reduce((sum, row) => {
      const amount = parseInt((row[6] || "0").replace(/,/g, "")) || 0;
      return sum + amount;
    }, 0);

    // Calculate processing transactions (index 7)
    const totalProcessing = memberRows.reduce((sum, row) => {
      const processing = parseInt((row[7] || "0").replace(/,/g, "")) || 0;
      return sum + processing;
    }, 0);

    // Calculate processing amount (index 8)
    const totalProcessingAmount = memberRows.reduce((sum, row) => {
      const amount = parseInt((row[8] || "0").replace(/,/g, "")) || 0;
      return sum + amount;
    }, 0);

    const totalMembers = memberRows.length;

    return {
      totalMembers,
      totalPassed,
      totalPassedAmount,
      totalRejected,
      totalRejectedAmount,
      totalProcessing,
      totalProcessingAmount
    };
  };

  const calculateDepositMetrics = () => {
    if (deptKey !== "deposit") return {};

    // For deposit data, we'll use similar structure as CSR
    const agentRows = depositData.filter(row =>
      row.length > 5 &&
      typeof row[2] === 'string' &&
      !row[2].includes('shift') &&
      row[2] !== ''
    );

    const totalAgents = agentRows.length;

    // Calculate live checks (assuming similar structure to CSR completed)
    const totalLiveChecks = agentRows.reduce((sum, row) => sum + (parseInt(row[3]) || 0), 0);

    // Calculate 1st checks (assuming index 4)
    const totalFirstChecks = agentRows.reduce((sum, row) => sum + (parseInt(row[4]) || 0), 0);

    // Calculate 2nd/3rd checks (assuming index 5)
    const totalSecondThirdChecks = agentRows.reduce((sum, row) => sum + (parseInt(row[5]) || 0), 0);

    // Calculate paycheck (assuming index 6)
    const totalPaycheck = agentRows.reduce((sum, row) => sum + (parseInt(row[6]) || 0), 0);

    // Calculate records (assuming index 7)
    const totalRecords = agentRows.reduce((sum, row) => sum + (parseInt(row[7]) || 0), 0);

    // Calculate offline (assuming index 8)
    const totalOffline = agentRows.reduce((sum, row) => sum + (parseInt(row[8]) || 0), 0);

    return {
      totalAgents,
      totalLiveChecks,
      totalFirstChecks,
      totalSecondThirdChecks,
      totalPaycheck,
      totalRecords,
      totalOffline
    };
  };

  // Calculate metrics based on department
  const csrMetricsData = calculateCSRMetrics();
  const withdrawMetricsData = calculateWithdrawMetrics();
  const depositMetricsData = calculateDepositMetrics();

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount}`;
  };

  // 🎯 Dynamic metrics per department using REAL DATA
  let dynamicMetrics = [];

  if (deptKey === "csr") {
    dynamicMetrics = [
      {
        title: "Completed convo",
        value: TotalSum?.toLocaleString() || "0",
        change: csrMetricsData.quotaMetPercent || "0%",
        icon: CheckCircle,
        color: "from-blue-500 to-cyan-500",
      },
      {
        title: "Total Effective",
        value: csrMetricsData.totalEffective?.toLocaleString() || "0",
        change: "+8.3%",
        icon: Target,
        color: "from-purple-500 to-pink-500",
      },
      {
        title: "Total message",
        value: csrMetricsData.totalMessages?.toLocaleString() || "0",
        change: "+15.7%",
        icon: MessageCircle,
        color: "from-green-500 to-emerald-500",
      },
      {
        title: "missed chats",
        value: csrMetricsData.totalMissed?.toLocaleString() || "0",
        change: "-5.2%",
        icon: XCircle,
        color: "from-red-500 to-orange-500",
      },
      {
        title: "Online Time",
        value: csrMetricsData.avgOnlineHours || "0h",
        change: "+3.8%",
        icon: Clock,
        color: "from-yellow-500 to-orange-500",
      },
      {
        title: "Positive Rates",
        value: csrMetricsData.avgPositiveRate || "0%",
        change: "+2.4%",
        icon: TrendingUp,
        color: "from-teal-500 to-cyan-500",
      },
      {
        title: "Negative Rates",
        value: csrMetricsData.avgNegativeRate || "0%",
        change: "-4.5%",
        icon: AlertTriangle,
        color: "from-red-600 to-orange-500",
      },
    ];
  } else if (deptKey === "deposit") {
    dynamicMetrics = [
      {
        title: "Feedback/livechecking",
        value: depositMetricsData.totalLiveChecks?.toLocaleString() || "0",
        change: "+9.2%",
        icon: Activity,
        color: "from-blue-500 to-indigo-500",
      },
      {
        title: "spreadsheet 1st checkback",
        value: depositMetricsData.totalFirstChecks?.toLocaleString() || "0",
        change: "+6.7%",
        icon: CheckCircle,
        color: "from-green-500 to-teal-500",
      },
      {
        title: "spreadsheet 2nd /3rd checkback",
        value: depositMetricsData.totalSecondThirdChecks?.toLocaleString() || "0",
        change: "+4.1%",
        icon: Target,
        color: "from-purple-500 to-pink-500",
      },
      {
        title: "Paycheck",
        value: depositMetricsData.totalPaycheck?.toLocaleString() || "0",
        change: "+11.8%",
        icon: DollarSign,
        color: "from-yellow-500 to-orange-500",
      },
      {
        title: "Paycheck Daily records CB",
        value: depositMetricsData.totalRecords?.toLocaleString() || "0",
        change: "+7.5%",
        icon: Activity,
        color: "from-cyan-500 to-blue-500",
      },
      {
        title: "Games and Bugs",
        value: depositMetricsData.totalOffline?.toLocaleString() || "0",
        change: "-3.2%",
        icon: XCircle,
        color: "from-red-500 to-pink-500",
      },
    ];
  } else if (deptKey === "withdrawal") {
    dynamicMetrics = [
      {
        title: "Total Transaction passed",
        value: withdrawMetricsData.totalPassed?.toLocaleString() || "0",
        change: "+18.5%",
        icon: CheckCircle,
        color: "from-green-500 to-emerald-500",
      },
      {
        title: "Total Amount passed",
        value: withdrawMetricsData.totalPassedAmount?.toLocaleString() || "$0",
        change: "+22.3%",
        icon: DollarSign,
        color: "from-purple-500 to-pink-500",
      },
      {
        title: "Total Transaction Rejected",
        value: withdrawMetricsData.totalRejected?.toLocaleString() || "0",
        change: "-4.8%",
        icon: XCircle,
        color: "from-red-500 to-orange-500",
      },
      {
        title: "Total Amount Rejected",
        value: withdrawMetricsData.totalRejectedAmount?.toLocaleString() || "$0",
        change: "-6.2%",
        icon: TrendingDown,
        color: "from-orange-500 to-red-500",
      },
      {
        title: "Total Transaction process",
        value: withdrawMetricsData.totalProcessing?.toLocaleString() || "0",
        change: "+5.3%",
        icon: Clock,
        color: "from-blue-500 to-cyan-500",
      },
      {
        title: "Total Amount process",
        value: withdrawMetricsData.totalProcessingAmount?.toLocaleString() || "$0",
        change: "+8.7%",
        icon: Activity,
        color: "from-indigo-500 to-purple-500",
      },
    ];
  }

  return (
    <GlassCard className="mb-8">
      <button
        onClick={() =>
          setExpandedDept((prev) => ({ ...prev, [deptKey]: !prev[deptKey] }))
        }
        className="w-full p-8 flex items-center justify-between transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="text-left">
            <h3 className="text-2xl font-bold">{title}</h3>
            <span className="text-sm text-gray-400">{subtitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StaffPill
            staffPerShift={staffPerShift}
            deptKey={deptKey}
            deptData={deptData}
            userLength={userLength}
          />
          <span className="text-sm text-gray-400">
            {expandedDept?.[deptKey] ? "Hide Details" : "Show Details"}
          </span>
          {expandedDept?.[deptKey] ? (
            <ChevronUp className="text-gray-400 w-6 h-6" />
          ) : (
            <ChevronDown className="text-gray-400 w-6 h-6" />
          )}
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ${expandedDept?.[deptKey]
          ? "max-h-[2000px] opacity-100"
          : "max-h-0 opacity-0"
          }`}
      >
        <div className="p-8 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {dynamicMetrics.map((metric, idx) => (
              <AnimatedMetricCard key={idx} {...metric} />
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default CollapsibleDepartment;