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
  Database,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`backdrop-blur-xl bg-[#282e3c38] rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);



const ComparisonBadge = ({ currentValue, previousValue }) => {
  const current = parseFloat(currentValue) || 0;
  const previous = parseFloat(previousValue) || 0;

  const difference = current - previous;

  const isPositive = difference > 0;
  const isNegative = difference < 0;
  const isNeutral = difference === 0;

  return (
    <div className="absolute top-3 right-3 group">
      <div className="w-8 h-8 flex items-center justify-center">

        {/* Neutral Arrow */}
        {isNeutral && (
          <span className="opacity-0  transition duration-200 text-yellow-400 text-xl font-bold">
            →
          </span>
        )}

        {/* TRENDING UP (Lucide) */}
        {isPositive && (
          <TrendingUp
            size={22}
            className="
             
              transition duration-200 
              text-green-400 
              drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]
            "
          />
        )}

        {/* TRENDING DOWN (Lucide) */}
        {isNegative && (
          <TrendingDown
            size={22}
            className="
              
              transition duration-200 
              text-red-400 
              drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]
            "
          />
        )}
      </div>
    </div>
  );
};



const AnimatedMetricCard = ({ title, value, change, icon: Icon, color, comparisonData }) => (
  <GlassCard className="p-6 group hover:scale-105 transition-transform duration-300 relative">
    {/* Comparison Badge */}
    {comparisonData && (
      <ComparisonBadge
        currentValue={value}
        previousValue={comparisonData.previousValue}
        formatType={comparisonData.formatType}
      />
    )}

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
  // ... (existing StaffPill code remains the same)
  const getDepartmentKey = () => {
    const keys = Object.keys(userLength || {});

    const keyMap = {
      'csr': ['CSR'],
      'deposit': ['Deposit'],
      'withdrawal': ['Withdraw', 'Withdrawal']
    };

    const possibleKeys = keyMap[deptKey] || [deptKey];
    const matchingKey = possibleKeys.find(key =>
      keys.some(userKey => userKey.toLowerCase() === key.toLowerCase())
    );

    if (matchingKey) {
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
  // ... (existing filter and calculation functions remain the same)
  const filterByDepartment = (deptName) => {
    return (data || []).filter(row => {
      if (!Array.isArray(row) || row.length === 0) return false;
      return row[0] === deptName;
    });
  };
  const navigate = useNavigate()
  const csrData = filterByDepartment("CSR");
  const depositData = filterByDepartment("Deposit");
  const withdrawData = filterByDepartment("Withdraw");

  const deptData =
    deptKey === "csr"
      ? csrData
      : deptKey === "deposit"
        ? depositData
        : withdrawData;

  const calculateCSRMetrics = () => {
    // ... (existing CSR calculation code remains the same)
    if (deptKey !== "csr") return {};

    const agentRows = csrData.filter(row =>
      row.length > 5 &&
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
      if (key === "CSR" && item[3] === "Ave. Completed Convo") {
        const morningShift = parseFloat(item[4]) || 0;
        const nightShift = parseFloat(item[5]) || 0;
        const sum = morningShift + nightShift;
        totalCompleted += sum;
      }
    });

    const totalEffective = agentRows.reduce((sum, row) => sum + (parseInt(row[4]) || 0), 0);
    const totalMessages = agentRows.reduce((sum, row) => sum + (parseInt(row[5]) || 0), 0);
    const totalMissed = agentRows.reduce((sum, row) => sum + (parseInt(row[6]) || 0), 0);

    const onlineTimes = agentRows
      .map(row => {
        const timeStr = row[7];
        if (!timeStr || timeStr === '0:00:00') return 0;
        const [h, m, s] = timeStr.split(':').map(Number);
        return h + (m / 60) + (s / 3600);
      })
      .filter(time => time > 0);

    const avgOnlineHours = onlineTimes.length > 0
      ? (onlineTimes.reduce((a, b) => a + b, 0) / onlineTimes.length).toFixed(1) + "h"
      : "0h";

    const positiveRates = agentRows
      .map(row => {
        const rateStr = row[8];
        if (!rateStr || rateStr === '0.00%') return 0;
        return parseFloat(rateStr) || 0;
      })
      .filter(rate => rate > 0);

    const avgPositiveRate = positiveRates.length > 0
      ? (positiveRates.reduce((a, b) => a + b, 0) / positiveRates.length).toFixed(1) + "%"
      : "0%";

    const negativeRates = agentRows
      .map(row => {
        const rateStr = row[9];
        if (!rateStr || rateStr === '0.00%') return 0;
        return parseFloat(rateStr) || 0;
      })
      .filter(rate => rate > 0);

    const avgNegativeRate = negativeRates.length > 0
      ? (negativeRates.reduce((a, b) => a + b, 0) / negativeRates.length).toFixed(1) + "%"
      : "0%";

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
    // ... (existing withdrawal calculation code remains the same)
    if (deptKey !== "withdrawal") return {};

    const memberRows = withdrawData.filter(row =>
      row.length > 5 &&
      typeof row[2] === 'string' &&
      row[2] !== 'Member' &&
      row[2] !== 'TOTAL' &&
      !row[2].includes('reject') &&
      !row[2].includes('拒绝提现')
    );

    const totalPassed = memberRows.reduce((sum, row) => {
      const passed = parseInt((row[3] || "0").replace(/,/g, "")) || 0;
      return sum + passed;
    }, 0);

    const totalPassedAmount = memberRows.reduce((sum, row) => {
      const amount = parseInt((row[4] || "0").replace(/,/g, "")) || 0;
      return sum + amount;
    }, 0);

    const totalRejected = memberRows.reduce((sum, row) => {
      const rejected = parseInt((row[5] || "0").replace(/,/g, "")) || 0;
      return sum + rejected;
    }, 0);

    const totalRejectedAmount = memberRows.reduce((sum, row) => {
      const amount = parseInt((row[6] || "0").replace(/,/g, "")) || 0;
      return sum + amount;
    }, 0);

    const totalProcessing = memberRows.reduce((sum, row) => {
      const processing = parseInt((row[7] || "0").replace(/,/g, "")) || 0;
      return sum + processing;
    }, 0);

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
    // ... (existing deposit calculation code remains the same)
    if (deptKey !== "deposit") return {};

    const agentRows = depositData.filter(row =>
      row.length > 5 &&
      typeof row[2] === 'string' &&
      !row[2].includes('shift') &&
      row[2] !== ''
    );

    const totalAgents = agentRows.length;
    const totalLiveChecks = agentRows.reduce((sum, row) => sum + (parseInt(row[3]) || 0), 0);
    const totalFirstChecks = agentRows.reduce((sum, row) => sum + (parseInt(row[4]) || 0), 0);
    const totalSecondThirdChecks = agentRows.reduce((sum, row) => sum + (parseInt(row[5]) || 0), 0);
    const totalPaycheck = agentRows.reduce((sum, row) => sum + (parseInt(row[6]) || 0), 0);
    const totalRecords = agentRows.reduce((sum, row) => sum + (parseInt(row[7]) || 0), 0);
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

  // Static comparison data for previous day (you can replace this with actual data)
  const getComparisonData = (currentValue, metricTitle, dept) => {
    // Static comparison values - in real app, you would get this from your data
    const comparisonMap = {
      csr: {
        "Completed convo": 10500,
        "Total Effective": 8600,
        "Total message": 102000,
        "missed chats": 15,
        "Avg Online": "9.8h",
        "Positive Rate": "22.5%",
        "Negative Rate": "57.8%"
      },
      deposit: {
        "Live Check": 4800,
        "1st Check": 680,
        "2nd/3rd Check": 5900,
        "Paycheck": 5800,
        "Paycheck Daily records": 2500,
        "Offline": 850
      },
      withdrawal: {
        "Total Transaction passed": 7200,
        "Total Amount passed": 6580000,
        "Total Transaction Rejected": 1250,
        "Total Amount Rejected": 980000,
        "Total Transaction process": 1240,
        "Total Amount process": 14800000
      }
    };

    const previousValue = comparisonMap[dept]?.[metricTitle] || 0;

    let formatType = "number";
    if (metricTitle.includes("Amount") || metricTitle.includes("Paycheck")) {
      formatType = "currency";
    } else if (metricTitle.includes("Rate")) {
      formatType = "percentage";
    }

    return {
      previousValue,
      formatType
    };
  };

  // Dynamic metrics with comparison data
  let dynamicMetrics = [];

  if (deptKey === "csr") {
    dynamicMetrics = [
      {
        title: "Completed convo",
        value: TotalSum?.toLocaleString() || "0",
        change: csrMetricsData.quotaMetPercent || "0%",
        icon: CheckCircle,
        color: "from-blue-500 to-cyan-500",
        comparisonData: getComparisonData(TotalSum, "Completed convo", "csr")
      },
      {
        title: "Total Effective",
        value: csrMetricsData.totalEffective?.toLocaleString() || "0",
        change: "+8.3%",
        icon: Target,
        color: "from-purple-500 to-pink-500",
        comparisonData: getComparisonData(csrMetricsData.totalEffective, "Total Effective", "csr")
      },
      {
        title: "Total message",
        value: csrMetricsData.totalMessages?.toLocaleString() || "0",
        change: "+15.7%",
        icon: MessageCircle,
        color: "from-green-500 to-emerald-500",
        comparisonData: getComparisonData(csrMetricsData.totalMessages, "Total message", "csr")
      },
      {
        title: "missed chats",
        value: csrMetricsData.totalMissed?.toLocaleString() || "0",
        change: "-5.2%",
        icon: XCircle,
        color: "from-red-500 to-orange-500",
        comparisonData: getComparisonData(csrMetricsData.totalMissed, "missed chats", "csr")
      },
      {
        title: "Online Time",
        value: csrMetricsData.avgOnlineHours || "0h",
        change: "+3.8%",
        icon: Clock,
        color: "from-yellow-500 to-orange-500",
        comparisonData: getComparisonData(csrMetricsData.avgOnlineHours, "Avg Online", "csr")
      },
      {
        title: "Positive Rates",
        value: csrMetricsData.avgPositiveRate || "0%",
        change: "+2.4%",
        icon: TrendingUp,
        color: "from-teal-500 to-cyan-500",
        comparisonData: getComparisonData(csrMetricsData.avgPositiveRate, "Positive Rate", "csr")
      },
      {
        title: "Negative Rates",
        value: csrMetricsData.avgNegativeRate || "0%",
        change: "-4.5%",
        icon: AlertTriangle,
        color: "from-red-600 to-orange-500",
        comparisonData: getComparisonData(csrMetricsData.avgNegativeRate, "Negative Rate", "csr")
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
        comparisonData: getComparisonData(depositMetricsData.totalLiveChecks, "Live Check", "deposit")
      },
      {
        title: "spreadsheet 1st checkback",
        value: depositMetricsData.totalFirstChecks?.toLocaleString() || "0",
        change: "+6.7%",
        icon: CheckCircle,
        color: "from-green-500 to-teal-500",
        comparisonData: getComparisonData(depositMetricsData.totalFirstChecks, "1st Check", "deposit")
      },
      {
        title: "spreadsheet 2nd /3rd checkback",
        value: depositMetricsData.totalSecondThirdChecks?.toLocaleString() || "0",
        change: "+4.1%",
        icon: Target,
        color: "from-purple-500 to-pink-500",
        comparisonData: getComparisonData(depositMetricsData.totalSecondThirdChecks, "2nd/3rd Check", "deposit")
      },
      {
        title: "Paycheck",
        value: depositMetricsData.totalPaycheck?.toLocaleString() || "0",
        change: "+11.8%",
        icon: DollarSign,
        color: "from-yellow-500 to-orange-500",
        comparisonData: getComparisonData(depositMetricsData.totalPaycheck, "Paycheck", "deposit")
      },
      {
        title: "Paycheck Daily records CB",
        value: depositMetricsData.totalRecords?.toLocaleString() || "0",
        change: "+7.5%",
        icon: Activity,
        color: "from-cyan-500 to-blue-500",
        comparisonData: getComparisonData(depositMetricsData.totalRecords, "Paycheck Daily records", "deposit")
      },
      {
        title: "Games and Bugs",
        value: depositMetricsData.totalOffline?.toLocaleString() || "0",
        change: "-3.2%",
        icon: XCircle,
        color: "from-red-500 to-pink-500",
        comparisonData: getComparisonData(depositMetricsData.totalOffline, "Offline", "deposit")
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
        comparisonData: getComparisonData(withdrawMetricsData.totalPassed, "Total Transaction passed", "withdrawal")
      },
      {
        title: "Total Amount passed",
        value: withdrawMetricsData.totalPassedAmount?.toLocaleString() || "$0",
        change: "+22.3%",
        icon: DollarSign,
        color: "from-purple-500 to-pink-500",
        comparisonData: getComparisonData(withdrawMetricsData.totalPassedAmount, "Total Amount passed", "withdrawal")
      },
      {
        title: "Total Transaction Rejected",
        value: withdrawMetricsData.totalRejected?.toLocaleString() || "0",
        change: "-4.8%",
        icon: XCircle,
        color: "from-red-500 to-orange-500",
        comparisonData: getComparisonData(withdrawMetricsData.totalRejected, "Total Transaction Rejected", "withdrawal")
      },
      {
        title: "Total Amount Rejected",
        value: withdrawMetricsData.totalRejectedAmount?.toLocaleString() || "$0",
        change: "-6.2%",
        icon: TrendingDown,
        color: "from-orange-500 to-red-500",
        comparisonData: getComparisonData(withdrawMetricsData.totalRejectedAmount, "Total Amount Rejected", "withdrawal")
      },
      {
        title: "Total Transaction process",
        value: withdrawMetricsData.totalProcessing?.toLocaleString() || "0",
        change: "+5.3%",
        icon: Clock,
        color: "from-blue-500 to-cyan-500",
        comparisonData: getComparisonData(withdrawMetricsData.totalProcessing, "Total Transaction process", "withdrawal")
      },
      {
        title: "Total Amount process",
        value: withdrawMetricsData.totalProcessingAmount?.toLocaleString() || "$0",
        change: "+8.7%",
        icon: Activity,
        color: "from-indigo-500 to-purple-500",
        comparisonData: getComparisonData(withdrawMetricsData.totalProcessingAmount, "Total Amount process", "withdrawal")
      },
    ];
  }

  return (
    <GlassCard className="mb-8">
      <button

        className="w-full p-8 flex items-center justify-between transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="text-left">
            <h3 className="text-2xl font-bold">{title}</h3>
            <span className="text-sm text-gray-400">{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              navigate('/dashboard/data-storage', {
              })
            }
            className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 transition-all hover:scale-105"
          >
            <Database size={18} />
            <span className="text-sm font-medium">Data Storage</span>
          </button>


          <StaffPill
            staffPerShift={staffPerShift}
            deptKey={deptKey}
            deptData={deptData}
            userLength={userLength}
          />
          <span onClick={() =>
            setExpandedDept((prev) => ({ ...prev, [deptKey]: !prev[deptKey] }))
          } className="text-sm text-gray-400">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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