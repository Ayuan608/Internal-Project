import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Plugin,
} from "chart.js";
import { getDashboardStats } from "../../../../../redux/QuotaSlice";
import { fetchCombinedDepartmentsData } from "../../../../../redux/combinedQuotaSlice";
import WeeklyPerformanceChart from "./../WeeklyPerformanceChart";

import CollapsibleDepartment from "../../../../ModernChart/CollapsibleDepartment";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  MessageCircle,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

interface CustomizedDataGridProps {
  onStatsUpdate?: (data: any[]) => void;
}

interface DepartmentResult {
  abovePercent: number;
  belowPercent: number;
  total: number;
  values: number[];
  aboveTarget: number;
}

const formatNumber = (number: number): string => {
  if (isNaN(number)) return "0";
  if (Math.abs(number) >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1)}m`;
  } else if (Math.abs(number) >= 1_000) {
    return `${(number / 1_000).toFixed(1)}k`;
  }
  return number.toString();
};

const CustomizedDataGrid: React.FC<CustomizedDataGridProps> = ({
  onStatsUpdate,
}) => {
  const dispatch = useDispatch<any>();
  const { lastUpdated, loading: quotaLoading } = useSelector(
    (state: any) => state.quota
  );

  const { data, loading: combinedQuotaLoading } = useSelector(
    (state: any) => state.combinedQuota
  );

  const [selectedMonth, setSelectedMonth] = useState<string>("November");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loading = quotaLoading || combinedQuotaLoading;

  const parseNumber = useCallback((value: any): number => {
    if (typeof value === "string") return Number(value.replace(/,/g, ""));
    return Number(value) || 0;
  }, []);

  const excludedKeywords = [
    "shift",
    "highlights",
    "half data",
    "failed",
    "assigned",
    "reached",
    "total",
    "ave",
    "member",
    "reject",
    "拒绝提现",
    "deposit total",
    "withdraw total",
  ];

  const groupedUsers: { [key: string]: any[][] } = {}; // store full rows

  for (const sublist of data) {
    const department = sublist[0]?.trim();
    const name = sublist[2]?.trim();

    // Skip if no department or name
    if (!department || !name) continue;

    const lowerName = name.toLowerCase();

    // Exclude non-user or summary rows
    const isExcluded = excludedKeywords.some((keyword) =>
      lowerName.includes(keyword)
    );
    if (isExcluded) continue;

    if (["CSR", "Deposit", "Withdraw"].includes(department)) {
      if (!groupedUsers[department]) groupedUsers[department] = [];
      groupedUsers[department].push(sublist);
    }
  }

  const CsrTotalConvey = groupedUsers?.CSR?.map((item) => Number(item[3]) || 0);
  const WdTotaltransaction = groupedUsers?.Withdraw?.map((item) =>
    parseNumber(item[7] || 0)
  );

  const CsrTotalSum = CsrTotalConvey?.reduce((acc, val) => acc + val, 0);
  const WdtotalSum = WdTotaltransaction?.reduce((acc, val) => acc + val, 0);

  // Calculate real totals from data
  const calculateRealTotals = useCallback(() => {
    const csrTotals: { [key: string]: number } = {};
    const depositTotals: { [key: string]: number } = {};
    const withdrawTotals: { [key: string]: number } = {};

    data.forEach((item: any) => {
      const key = item[0];

      // CSR: Process rows where the 4th index is "Ave. Completed Convo"
      if (key === "CSR" && item[3] === "Ave. Completed Convo") {
        const morningShift = parseFloat(item[4]) || 0;
        const nightShift = parseFloat(item[5]) || 0;
        const sum = morningShift + nightShift;
        csrTotals[key] = (csrTotals[key] || 0) + sum;
      }

      // Deposit: Process rows where the 4th index is "Ave. Completed Convo"
      if (key === "Deposit" && item[3] === "Ave. Completed Convo") {
        const morningShift = parseFloat(item[4]) || 0;
        const nightShift = parseFloat(item[5]) || 0;
        const sum = morningShift + nightShift;
        depositTotals[key] = (depositTotals[key] || 0) + sum;
      }
    });

    // Calculate Withdraw sum from real data
    let withdrawSum = 0;
    data.forEach((item: any) => {
      if (
        item[0] === "Withdraw" &&
        item[2] !== "" &&
        item[2] !== "TOTAL" &&
        item[2] !== "Member" &&
        item[2] !== "reject" &&
        item[2] !== "拒绝提现"
      ) {
        const value = parseFloat((item[7] || "0").replace(/,/g, "")) || 0;
        withdrawSum += value;
      }
    });

    withdrawTotals["Withdraw"] = withdrawSum;

    return {
      csrRealTotal: csrTotals["CSR"] || 0,
      depositRealTotal: depositTotals["Deposit"] || 0,
      withdrawRealTotal: withdrawTotals["Withdraw"] || 0,
    };
  }, [data]);

  const { csrRealTotal, depositRealTotal, withdrawRealTotal } =
    calculateRealTotals();

  // Calculate performance percentages based on real data - FIXED TARGET CALCULATION
  const calculateRealPerformance = useCallback(() => {
    const csrTargetPerPerson = 530;
    const depositTargetPerPerson = 530;
    const withdrawTargetPerPerson = 1500;

    // CSR के लिए total target = प्रति व्यक्ति target × कुल CSR की संख्या
    const csrTotalTarget = csrTargetPerPerson * (groupedUsers.CSR?.length || 0);
    const depositTotalTarget =
      depositTargetPerPerson * (groupedUsers.Deposit?.length || 0);
    const withdrawTotalTarget =
      withdrawTargetPerPerson * (groupedUsers.Withdraw?.length || 0);

    // Percentage calculation
    const csrAchievedPercent =
      csrTotalTarget > 0
        ? Math.min((CsrTotalSum / csrTotalTarget) * 100, 100)
        : 0;

    const depositAchievedPercent =
      depositTotalTarget > 0
        ? Math.min((depositRealTotal / depositTotalTarget) * 100, 100)
        : 0;

    const withdrawAchievedPercent =
      withdrawTotalTarget > 0
        ? Math.min((withdrawRealTotal / withdrawTotalTarget) * 100, 100)
        : 0;

    return {
      csrAbovePercent: csrAchievedPercent,
      csrBelowPercent: Math.max(100 - csrAchievedPercent, 0),
      depositAbovePercent: depositAchievedPercent,
      depositBelowPercent: Math.max(100 - depositAchievedPercent, 0),
      withdrawAbovePercent: withdrawAchievedPercent,
      withdrawBelowPercent: Math.max(100 - withdrawAchievedPercent, 0),
      csrTargetMet: csrAchievedPercent >= 100,
      depositTargetMet: depositAchievedPercent >= 100,
      withdrawTargetMet: withdrawAchievedPercent >= 100,
    };
  }, [csrRealTotal, depositRealTotal, withdrawRealTotal, groupedUsers]);

  const performance = calculateRealPerformance();

  // Team Leader Stats with Real Data - FIXED
  const teamLeaderData = React.useMemo(
    () => [
      {
        title: "CSR - Total Conversation",
        value: `${formatNumber(csrRealTotal)}`,
        interval: `Target: 530`,
        trend: performance.csrTargetMet ? "up" : "down",
        totalCompleted: csrRealTotal,
        target: 530,
        difference: csrRealTotal,
        isPositive: performance.csrTargetMet,
        realTotal: csrRealTotal,
        performance: performance.csrAbovePercent,
        targetMet: performance.csrTargetMet,
      },
      {
        title: "Deposit - Total Transaction",
        value: `${formatNumber(depositRealTotal)}`,
        interval: `Target: 530`,
        trend: performance.depositTargetMet ? "up" : "down",
        totalCompleted: depositRealTotal,
        target: 530,
        difference: formatNumber(depositRealTotal),
        isPositive: performance.depositTargetMet,
        realTotal: depositRealTotal,
        performance: performance.depositAbovePercent,
        targetMet: performance.depositTargetMet,
      },
      {
        title: "Withdrawal - Total Transaction Process",
        value: `${formatNumber(withdrawRealTotal)}`,
        interval: `Target: 1,500`,
        trend: performance.withdrawTargetMet ? "up" : "down",
        totalCompleted: withdrawRealTotal,
        target: 1500,
        difference: withdrawRealTotal,
        isPositive: performance.withdrawTargetMet,
        realTotal: withdrawRealTotal,
        performance: performance.withdrawAbovePercent,
        targetMet: performance.withdrawTargetMet,
      },
    ],
    [csrRealTotal, depositRealTotal, withdrawRealTotal, performance]
  );

  // Line Chart Data for Team Leader Stats - FIXED
  const lineChartData = {
    labels: ["CSR", "Deposit", "Withdrawal"],
    datasets: [
      {
        label: "Actual Performance",
        data: [csrRealTotal, depositRealTotal, withdrawRealTotal],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: "Target",
        data: [530, 530, 1500],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
        pointBackgroundColor: "rgb(16, 185, 129)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#f8fafc",
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "Department Performance vs Targets",
        color: "#f8fafc",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: "rgba(30, 41, 59, 0.9)",
        titleColor: "#f8fafc",
        bodyColor: "#e5e7eb",
        borderColor: "#475569",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#f8fafc",
          callback: function (value: any) {
            return formatNumber(value);
          },
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#f8fafc",
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  // Initialize data
  const initializeData = useCallback(async () => {
    if (!isInitialized) {
      setIsRefreshing(true);
      try {
        await Promise.all([
          dispatch(fetchCombinedDepartmentsData()),
          dispatch(getDashboardStats()),
        ]);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (onStatsUpdate && isInitialized) {
      onStatsUpdate(teamLeaderData);
    }
  }, [teamLeaderData, onStatsUpdate, isInitialized]);

  const chartOptions = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          color: "#f8fafc",
          font: { size: 16, weight: "bold" } as any,
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const label = context.label || "";
              const value = context.parsed || 0;
              return `${label}: ${value.toFixed(1)}%`;
            },
          },
        },
      },
      cutout: "70%",
    }),
    []
  );

  const centerTextPlugin: Plugin<"doughnut"> = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { width, height, ctx } = chart;
      const value = chart.data.datasets[0].data[0] as number;
      ctx.save();
      const fontSize = (height / 120).toFixed(2);
      ctx.font = `${fontSize}em sans-serif`;
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "middle";
      const text = `${Math.round(value)}%`;
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 1.8 - 5;
      ctx.fillText(text, textX, textY);
      ctx.font = `${(Number(fontSize) * 0.4).toFixed(2)}em sans-serif`;
      ctx.fillStyle = "#9ca3af";
      const subText = performance.csrTargetMet ? "Quota Met" : "Quota Not Met";
      const subX = Math.round((width - ctx.measureText(subText).width) / 2);
      ctx.fillText(subText, subX, textY + 28);
      ctx.restore();
    },
  };

  const createChartData = React.useCallback(
    (met: number, nonMet: number, color: string, targetMet: boolean) => ({
      labels: ["Quota Met", "Not Met"],
      datasets: [
        {
          data: targetMet ? [100, 0] : [met, nonMet],
          backgroundColor: [color, "#1f2937"],
          borderColor: "#0f172a",
          borderWidth: 2,
          hoverBackgroundColor: [color, "#374151"],
        },
      ],
    }),
    []
  );

  // Rest of your existing code for metrics, staff data, etc.
  const [expandedDept, setExpandedDept] = useState({
    csr: true,
    deposit: true,
    withdrawal: true,
  });

  const staffPerShift = {
    csr: { morning: 24, night: 12 },
    deposit: { morning: 10, night: 5 },
    withdrawal: { morning: 12, night: 6 },
  };

  // Update metrics with real data
  const csrMetrics = [
    {
      title: "Completed",
      value: formatNumber(csrRealTotal),
      change: performance.csrTargetMet ? "+Achieved" : "-Below Target",
      icon: CheckCircle,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Target",
      value: "530",
      change: "Monthly Goal",
      icon: Target,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Performance",
      value: `${Math.round(performance.csrAbovePercent)}%`,
      change: performance.csrTargetMet ? "+Excellent" : "+Good",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
    },
  ];

  const depositMetrics = [
    {
      title: "Completed",
      value: formatNumber(depositRealTotal),
      change: performance.depositTargetMet ? "+Achieved" : "-Below Target",
      icon: CheckCircle,
      color: "from-green-500 to-teal-500",
    },
    {
      title: "Target",
      value: "530",
      change: "Monthly Goal",
      icon: Target,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Performance",
      value: `${Math.round(performance.depositAbovePercent)}%`,
      change: performance.depositTargetMet ? "+Excellent" : "+Good",
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-500",
    },
  ];

  const withdrawalMetrics = [
    {
      title: "Completed",
      value: formatNumber(withdrawRealTotal),
      change: performance.withdrawTargetMet ? "+Achieved" : "-Below Target",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Target",
      value: "1,500",
      change: "Monthly Goal",
      icon: Target,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Performance",
      value: `${Math.round(performance.withdrawAbovePercent)}%`,
      change: performance.withdrawTargetMet ? "+Excellent" : "+Good",
      icon: TrendingUp,
      color: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <div className="text-white mt-6 bg-[#00010B]">
      <div className="mt-5">
        {/* Collapsible Department Metrics */}
        <CollapsibleDepartment
          title="CSR Department"
          userLength={groupedUsers}
          data={data}
          subtitle="Customer Service & Support"
          metrics={csrMetrics}
          deptKey="csr"
          expandedDept={expandedDept}
          setExpandedDept={setExpandedDept}
          staffPerShift={staffPerShift}
        />
        <CollapsibleDepartment
          title="Deposit Department"
          data={data}
          userLength={groupedUsers}
          subtitle="Verification & Processing"
          metrics={depositMetrics}
          deptKey="deposit"
          expandedDept={expandedDept}
          setExpandedDept={setExpandedDept}
          staffPerShift={staffPerShift}
        />
        <CollapsibleDepartment
          title="Withdrawal Department"
          data={data}
          subtitle="Transaction Processing"
          userLength={groupedUsers}
          metrics={withdrawalMetrics}
          deptKey="withdrawal"
          expandedDept={expandedDept}
          setExpandedDept={setExpandedDept}
          staffPerShift={staffPerShift}
        />
      </div>

      {/* Charts Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">
          Department Performance Charts
        </h2>

        {/* Pie Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* CSR Pie Chart */}
          <div className="p-6 bg-[#282e3c38] rounded-2xl border border-white/10 h-[400px]">
            <div className="h-75 w-70 mx-auto relative">
              <Doughnut
                data={createChartData(
                  performance.csrAbovePercent,
                  performance.csrBelowPercent,
                  "rgba(59, 130, 246, 0.8)",
                  performance.csrTargetMet
                )}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: "CSR Department Quota",
                    },
                  },
                }}
                plugins={[centerTextPlugin]}
              />
              <div className="text-center mt-3 text-sm text-gray-400">
                {performance.csrTargetMet
                  ? "100% Met"
                  : `${Math.round(performance.csrAbovePercent)}% Met`}{" "}
                •{" "}
                {performance.csrTargetMet
                  ? "0%"
                  : `${Math.round(performance.csrBelowPercent)}%`}{" "}
                Not Met
              </div>
            </div>
          </div>

          {/* Deposit Pie Chart */}
          <div className="p-6 bg-[#282e3c38] rounded-2xl border border-white/10 h-[400px]">
            <div className="h-72 w-70 mx-auto relative">
              <Doughnut
                data={createChartData(
                  performance.depositAbovePercent,
                  performance.depositBelowPercent,
                  "rgba(16, 185, 129, 0.8)",
                  performance.depositTargetMet
                )}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: "Deposit Department Quota",
                    },
                  },
                }}
                plugins={[centerTextPlugin]}
              />
              <div className="text-center mt-3 text-sm text-gray-400">
                {performance.depositTargetMet
                  ? "100% Met"
                  : `${Math.round(performance.depositAbovePercent)}% Met`}{" "}
                •{" "}
                {performance.depositTargetMet
                  ? "0%"
                  : `${Math.round(performance.depositBelowPercent)}%`}{" "}
                Not Met
              </div>
            </div>
          </div>

          {/* Withdraw Pie Chart */}
          <div className="p-6 bg-[#282e3c38] rounded-2xl border border-white/10 h-[400px]">
            <div className="h-72 w-70 mx-auto relative">
              <Doughnut
                data={createChartData(
                  performance.withdrawAbovePercent,
                  performance.withdrawBelowPercent,
                  "rgba(168, 85, 247, 1)",
                  performance.withdrawTargetMet
                )}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: "Withdraw Department Quota",
                    },
                  },
                }}
                plugins={[centerTextPlugin]}
              />
              <div className="text-center mt-3 text-sm text-gray-400">
                {performance.withdrawTargetMet
                  ? "100% Met"
                  : `${Math.round(performance.withdrawAbovePercent)}% Met`}{" "}
                •{" "}
                {performance.withdrawTargetMet
                  ? "0%"
                  : `${Math.round(performance.withdrawBelowPercent)}%`}{" "}
                Not Met
              </div>
            </div>
          </div>

          {/* Weekly Performance Chart */}
          <div className="rounded-2xl h-[400px]">
            <WeeklyPerformanceChart
              csrData={{
                realTotal: csrRealTotal,
                performance: performance.csrAbovePercent,
                targetMet: performance.csrTargetMet,
              }}
              depositData={{
                realTotal: depositRealTotal,
                performance: performance.depositAbovePercent,
                targetMet: performance.depositTargetMet,
              }}
              withdrawData={{
                realTotal: withdrawRealTotal,
                performance: performance.withdrawAbovePercent,
                targetMet: performance.withdrawTargetMet,
              }}
              selectedMonth={selectedMonth}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-gray-500 text-sm">
        Last updated:{" "}
        {lastUpdated
          ? new Date(lastUpdated).toLocaleTimeString()
          : new Date().toLocaleTimeString()}{" "}
        • Showing real-time data
        {loading && " • Updating..."}
      </div>
    </div>
  );
};

export default React.memo(CustomizedDataGrid);
