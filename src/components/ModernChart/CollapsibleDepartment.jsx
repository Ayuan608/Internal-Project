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
    <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
    <p className="text-sm text-gray-400">{title}</p>
  </GlassCard>
);

// 🧩 Updated Staff Pill (Now showing real user total count)
const StaffPill = ({ staffPerShift, deptKey, deptData }) => {
  const s = staffPerShift?.[deptKey] || { morning: 0, night: 0 };
  const totalStaff = deptData.length || 0; // ✅ real total users from your data

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
  staffPerShift = {},
}) => {
  // 🔍 Filter department data
  const filterByKeyword = (keyword) =>
    (data || []).filter((row) =>
      row.join(" ").toLowerCase().includes(keyword.toLowerCase())
    );

  const csrData = filterByKeyword("csr");
  const depositData = filterByKeyword("deposit");
  const withdrawData = filterByKeyword("withdraw");


  const deptData =
    deptKey === "csr"
      ? csrData
      : deptKey === "deposit"
        ? depositData
        : withdrawData;

  const total = deptData.length;

  const completed = deptData.filter((r) =>
    r[2] <= 530
  );

  let final = completed.length

  // console.log(completed, 'hiii')

  const missed = deptData.filter((r) =>
    r.join(" ").toLowerCase().includes("missed")
  ).length;

  const rejected = deptData.filter((r) => r[4])

  const avgOnline = (Math.random() * 5 + 4).toFixed(1) + "h";
  const avgNegativeRate = (Math.random() * 10 + 5).toFixed(1);
  const positive = (100 - avgNegativeRate).toFixed(1);

  // 🎯 Metrics per department
  let dynamicMetrics = [];

  if (deptKey === "csr") {
    dynamicMetrics = [
      {
        title: "Completed",
        value: final,
        change: "+12.5%",
        icon: CheckCircle,
        color: "from-blue-500 to-cyan-500",
      },
      {
        title: "Effective",
        value: total - missed,
        change: "+8.3%",
        icon: Target,
        color: "from-purple-500 to-pink-500",
      },
      {
        title: "Messages",
        value: total * 3,
        change: "+15.7%",
        icon: MessageCircle,
        color: "from-green-500 to-emerald-500",
      },
      {
        title: "Missed",
        value: missed,
        change: "-5.2%",
        icon: XCircle,
        color: "from-red-500 to-orange-500",
      },
      {
        title: "Avg Online",
        value: avgOnline,
        change: "+3.8%",
        icon: Clock,
        color: "from-yellow-500 to-orange-500",
      },
      {
        title: "Positive",
        value: `${positive}%`,
        change: "+2.4%",
        icon: TrendingUp,
        color: "from-teal-500 to-cyan-500",
      },
      {
        title: "Negative Rate Avg",
        value: `${avgNegativeRate}%`,
        change: "-4.5%",
        icon: AlertTriangle,
        color: "from-red-600 to-orange-500",
      },
    ];
  } else if (deptKey === "deposit") {
    dynamicMetrics = [
      {
        title: "Live Check",
        value: total,
        change: "+9.2%",
        icon: Activity,
        color: "from-blue-500 to-indigo-500",
      },
      {
        title: "1st Check",
        value: Math.round(total * 0.5),
        change: "+6.7%",
        icon: CheckCircle,
        color: "from-green-500 to-teal-500",
      },
      {
        title: "2nd/3rd",
        value: Math.round(total * 0.2),
        change: "+4.1%",
        icon: Target,
        color: "from-purple-500 to-pink-500",
      },
      {
        title: "Paycheck",
        value: Math.round(total * 1.4),
        change: "+11.8%",
        icon: DollarSign,
        color: "from-yellow-500 to-orange-500",
      },
      {
        title: "Records",
        value: total * 2,
        change: "+7.5%",
        icon: Activity,
        color: "from-cyan-500 to-blue-500",
      },
      {
        title: "Offline",
        value: missed,
        change: "-3.2%",
        icon: XCircle,
        color: "from-red-500 to-pink-500",
      },
    ];
  } else if (deptKey === "withdrawal") {
    dynamicMetrics = [
      {
        title: "Passed",
        value: final,
        change: "+18.5%",
        icon: CheckCircle,
        color: "from-green-500 to-emerald-500",
      },
      {
        title: "Amount",
        value: `$${(total).toLocaleString()}`,
        change: "+22.3%",
        icon: DollarSign,
        color: "from-purple-500 to-pink-500",
      },
      {
        title: "Rejected",
        value: missed,
        change: "-4.8%",
        icon: XCircle,
        color: "from-red-500 to-orange-500",
      },
      {
        title: "Rej. Amount",
        value: `$${(missed * 2000).toLocaleString()}`,
        change: "-6.2%",
        icon: TrendingDown,
        color: "from-orange-500 to-red-500",
      },
      {
        title: "Processing",
        value: Math.round(total / 2),
        change: "+5.3%",
        icon: Clock,
        color: "from-blue-500 to-cyan-500",
      },
      {
        title: "Proc. Amt",
        value: `$${(total * 3000).toLocaleString()}`,
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
