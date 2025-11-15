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
import { CheckCircle, Target, TrendingUp } from "lucide-react";

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
    (state: any) => state?.combinedQuota
  );

  console.log(data);

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
    "member",
    "reject",
    "拒绝提现",
    "deposit total",
    "withdraw total",
    "senior",
    "morning",
    "12 Hours",
    "9 HOURS",
  ];

  // New function to process nested data structure
  const processDepartmentData = useCallback(
    (departmentName: string) => {
      if (!data || !Array.isArray(data))
        return { rows: [], total: 0, users: [] };

      // Find the department object
      const deptObj = data.find((item) => item.department === departmentName);
      if (!deptObj || !deptObj.rows) return { rows: [], total: 0, users: [] };

      let total = 0;
      const users = [];

      for (const row of deptObj.rows) {
        if (!Array.isArray(row) || row.length === 0) continue;

        const name = row[0]?.toString().trim();
        if (!name) continue;

        const lowerName = name.toLowerCase();
        const isExcluded = excludedKeywords.some((keyword) =>
          lowerName.includes(keyword)
        );
        if (isExcluded) continue;

        let value = 0;

        if (departmentName === "CSR") {
          value = parseNumber(row[1]) || 0;
        } else if (departmentName === "Deposit") {
          value = parseNumber(row[7]) || 0;
        } else if (departmentName === "Withdraw") {
          value = parseNumber(row[5]) || 0;
        }

        total += value;
        users.push({ name, value, row });
      }

      return { rows: deptObj.rows, total, users };
    },
    [data, parseNumber]
  );

  // Process all departments
  const csrData = processDepartmentData("CSR");
  const depositData = processDepartmentData("Deposit");
  const withdrawData = processDepartmentData("Withdraw");

  const CsrTotalSum = csrData.total;
  const DepositTotalsum = depositData.total;
  const withdrawRealTotal = withdrawData.total;


  // Calculate real totals from actual data structure
  const calculateRealTotals = useCallback(() => {
    let csrRealTotal = 0;
    let depositRealTotal = 0;
    let withdrawRealTotal = 0;

    if (data && Array.isArray(data)) {
      data.forEach((dept) => {
        if (!dept.rows || !Array.isArray(dept.rows)) return;

        if (dept.department === "CSR") {
          dept.rows.forEach((row: any) => {
            if (Array.isArray(row) && row.length > 3) {
              csrRealTotal += parseNumber(row[1]) || 0;
            }
          });
        } else if (dept.department === "Deposit") {
          dept.rows.forEach((row: any) => {
            if (Array.isArray(row) && row.length > 9) {
              depositRealTotal += parseNumber(row[7]) || 0;
            }
          });
        } else if (dept.department === "Withdraw") {
          dept.rows.forEach((row: any) => {
            if (Array.isArray(row) && row.length > 7) {
              withdrawRealTotal += parseNumber(row[5]) || 0;
            }
          });
        }
      });
    }

    return {
      csrRealTotal,
      depositRealTotal,
      withdrawRealTotal,
    };
  }, [data, parseNumber]);

  const {
    csrRealTotal,
    depositRealTotal,
    withdrawRealTotal: calculatedWithdrawTotal,
  } = calculateRealTotals();

  // Calculate performance percentages based on real data
  const calculateRealPerformance = useCallback(() => {
    const csrTargetPerPerson = 560;
    const depositTargetPerPerson = 530;
    const withdrawTargetPerPerson = 1500;

    const csrTotalTarget = csrTargetPerPerson * (csrData.users.length || 0);
    const depositTotalTarget =
      depositTargetPerPerson * (depositData.users.length || 0);
    const withdrawTotalTarget =
      withdrawTargetPerPerson * (withdrawData.users.length || 0);

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
  }, [
    CsrTotalSum,
    DepositTotalsum,
    withdrawRealTotal,
    csrData.users.length,
    depositData.users.length,
    withdrawData.users.length,
  ]);

  const performance = calculateRealPerformance();

  // Team Leader Stats with Real Data
  const teamLeaderData = React.useMemo(
    () => [
      {
        title: "CSR - Total Conversation",
        value: `${formatNumber(csrRealTotal)}`,
        interval: `Target: 560`,
        trend: performance.csrTargetMet ? "up" : "down",
        totalCompleted: csrRealTotal,
        target: 560,
        difference: csrRealTotal?.toLocaleString(),
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
        difference: DepositTotalsum?.toLocaleString(),
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
        totalCompleted: calculatedWithdrawTotal,
        target: 1500,
        difference: withdrawRealTotal?.toLocaleString(),
        isPositive: performance.withdrawTargetMet,
        realTotal: calculatedWithdrawTotal,
        performance: performance.withdrawAbovePercent,
        targetMet: performance.withdrawTargetMet,
      },
    ],
    [
      csrRealTotal,
      depositRealTotal,
      calculatedWithdrawTotal,
      performance,
      CsrTotalSum,
      DepositTotalsum,
    ]
  );

  // Line Chart Data for Team Leader Stats
  const lineChartData = {
    labels: ["CSR", "Deposit", "Withdrawal"],
    datasets: [
      {
        label: "Actual Performance",
        data: [csrRealTotal, depositRealTotal, calculatedWithdrawTotal],
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
        data: [560, 530, 1500],
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
    csr: {
      morning:
        csrData.users.length > 0 ? Math.ceil(csrData.users.length * 0.7) : 24,
      night:
        csrData.users.length > 0 ? Math.floor(csrData.users.length * 0.3) : 12,
    },
    deposit: {
      morning:
        depositData.users.length > 0
          ? Math.ceil(depositData.users.length * 0.7)
          : 10,
      night:
        depositData.users.length > 0
          ? Math.floor(depositData.users.length * 0.3)
          : 5,
    },
    withdrawal: {
      morning:
        withdrawData.users.length > 0
          ? Math.ceil(withdrawData.users.length * 0.7)
          : 12,
      night:
        withdrawData.users.length > 0
          ? Math.floor(withdrawData.users.length * 0.3)
          : 6,
    },
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
      value: "560",
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

  // Debug info
  console.log("Processed Data:", {
    csrData,
    depositData,
    withdrawData,
    csrRealTotal,
    depositRealTotal,
    calculatedWithdrawTotal,
    performance,
  });

  return (
    <div className="text-white mt-6 bg-[#00010B]">
      <div className="mt-5">
        {/* Collapsible Department Metrics */}
        <CollapsibleDepartment
          TotalSum={csrRealTotal}
          title="CSR Department"
          userLength={csrData.users.length}
          data={csrData.rows}
          subtitle="Customer Service & Support"
          metrics={csrMetrics}
          deptKey="csr"
          expandedDept={expandedDept}
          setExpandedDept={setExpandedDept}
          staffPerShift={staffPerShift}
        />
        <CollapsibleDepartment
          TotalSum={depositRealTotal}
          title="Deposit Department"
          data={depositData.rows}
          userLength={depositData.users.length}
          subtitle="Verification & Processing"
          metrics={depositMetrics}
          deptKey="deposit"
          expandedDept={expandedDept}
          setExpandedDept={setExpandedDept}
          staffPerShift={staffPerShift}
        />
        <CollapsibleDepartment
          TotalSum={withdrawRealTotal}
          title="Withdrawal Department"
          data={withdrawData.rows}
          subtitle="Transaction Processing"
          userLength={withdrawData.users.length}
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
                realTotal: calculatedWithdrawTotal,
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
