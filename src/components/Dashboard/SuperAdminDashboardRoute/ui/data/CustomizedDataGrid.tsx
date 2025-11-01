import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Plugin,
} from "chart.js";
import { getDashboardStats } from "../../../../../redux/QuotaSlice";
import { fetchCombinedDepartmentsData } from "../../../../../redux/combinedQuotaSlice";
import WeeklyPerformanceChart from "./../WeeklyPerformanceChart";
import { TrendingUp, Users, MessageCircle, Target } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface CustomizedDataGridProps {
  onStatsUpdate?: (data: any[]) => void;
}

const CustomizedDataGrid: React.FC<CustomizedDataGridProps> = ({
  onStatsUpdate,
}) => {
  const dispatch = useDispatch<any>();
  const { lastUpdated } = useSelector((state: any) => state.quota);
  const { data } = useSelector((state: any) => state.combinedQuota);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toLocaleString("default", { month: "long" })
  );

  const parseNumber = (value: any): number => {
    if (typeof value === "string") return Number(value.replace(/,/g, ""));
    return Number(value) || 0;
  };

  const extractAvailableMonths = (data: any[]): string[] => {
    if (!data || !Array.isArray(data)) return [];
    const months: string[] = [];
    data.forEach((row: any) => {
      if (Array.isArray(row) && row[0] === "CSR" && row[1] === "" && row[2]) {
        const month = row[2];
        if (month && !months.includes(month)) months.push(month);
      }
    });
    return months;
  };

  const getRowMonth = (row: any): string | null => {
    if (!Array.isArray(row) || row.length === 0) return null;
    if (row[0] === "CSR" && row[1] === "" && row[2]) return row[2];
    return null;
  };

  const filterDataByMonth = (data: any[], targetMonth: string): any[] => {
    if (!data || !Array.isArray(data)) return [];
    let currentMonth = targetMonth;
    const filteredData: any[] = [];
    let includeCurrentData = false;

    data.forEach((row: any) => {
      const rowMonth = getRowMonth(row);
      if (rowMonth) {
        currentMonth = rowMonth;
        includeCurrentData = currentMonth === targetMonth;
      } else if (includeCurrentData && Array.isArray(row) && row.length > 0) {
        filteredData.push(row);
      }
    });
    return filteredData;
  };

  const calculateDepartmentStatus = (
    departmentData: any[],
    quotaIndex: number,
    targetQuota: number
  ) => {
    if (!departmentData?.length)
      return {
        abovePercent: 0,
        belowPercent: 100,
        total: 0,
        values: [],
        aboveTarget: 0,
      };

    const values = departmentData
      ?.map((row: any) => parseNumber(row[quotaIndex]))
      .filter((num: number) => num !== 0);

    let belowTarget = 0;
    let aboveTarget = 0;

    values.forEach((num) => {
      if (num >= targetQuota) aboveTarget++;
      else belowTarget++;
    });

    const total = values.length || 1;
    const abovePercent = Number(((aboveTarget / total) * 100).toFixed(2));
    const belowPercent = Number(((belowTarget / total) * 100).toFixed(2));

    return {
      abovePercent,
      belowPercent,
      total,
      values,
      aboveTarget,
    };
  };

  const getPreviousMonth = (monthName: string): string => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const index = months.indexOf(monthName);
    if (index <= 0) return months[11];
    return months[index - 1];
  };

  const availableMonths = extractAvailableMonths(data);
  const monthOptions =
    availableMonths.length > 0
      ? availableMonths
      : [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

  const monthlyData = filterDataByMonth(data, selectedMonth);
  const previousMonth = getPreviousMonth(selectedMonth);
  const prevMonthData = filterDataByMonth(data, previousMonth);

  const filteredCSR = monthlyData.filter((row: any) =>
    row[0]?.toLowerCase().includes("csr")
  );
  const filteredDeposit = monthlyData.filter((row: any) =>
    row[0]?.toLowerCase().includes("deposit")
  );
  const filteredWithdraw = monthlyData.filter((row: any) =>
    row[0]?.toLowerCase().includes("withdraw")
  );

  const filteredPrevCSR = prevMonthData.filter((row: any) =>
    row[0]?.toLowerCase().includes("csr")
  );
  const filteredPrevDeposit = prevMonthData.filter((row: any) =>
    row[0]?.toLowerCase().includes("deposit")
  );
  const filteredPrevWithdraw = prevMonthData.filter((row: any) =>
    row[0]?.toLowerCase().includes("withdraw")
  );

  const csrResult = calculateDepartmentStatus(filteredCSR, 2, 530);
  const depositResult = calculateDepartmentStatus(filteredDeposit, 9, 530);
  const withdrawResult = calculateDepartmentStatus(filteredWithdraw, 7, 1500);

  const prevCSRResult = calculateDepartmentStatus(filteredPrevCSR, 2, 530);
  const prevDepositResult = calculateDepartmentStatus(
    filteredPrevDeposit,
    9,
    530
  );
  const prevWithdrawResult = calculateDepartmentStatus(
    filteredPrevWithdraw,
    7,
    1500
  );

  // Calculate department-wise completed conversations
  const csrCurrentMonth = csrResult.values.reduce(
    (accu, curr) => accu + (isNaN(curr) ? 0 : curr),
    0
  );
  const csrPreviousMonth = prevCSRResult.values.reduce(
    (accu, curr) => accu + (isNaN(curr) ? 0 : curr),
    0
  );
  const csrDifference = csrCurrentMonth - csrPreviousMonth;
  const isCSRPositive = csrDifference >= 0;

  const depositCurrentMonth = depositResult.values.reduce(
    (accu, curr) => accu + (isNaN(curr) ? 0 : curr),
    0
  );
  const depositPreviousMonth = prevDepositResult.values.reduce(
    (accu, curr) => accu + (isNaN(curr) ? 0 : curr),
    0
  );
  const depositDifference = depositCurrentMonth - depositPreviousMonth;
  const isDepositPositive = depositDifference >= 0;

  const withdrawCurrentMonth = withdrawResult.values.reduce(
    (accu, curr) => accu + (isNaN(curr) ? 0 : curr),
    0
  );
  const withdrawPreviousMonth = prevWithdrawResult.values.reduce(
    (accu, curr) => accu + (isNaN(curr) ? 0 : curr),
    0
  );
  const withdrawDifference = withdrawCurrentMonth - withdrawPreviousMonth;
  const isWithdrawPositive = withdrawDifference >= 0;

  // Calculate totals
  const currentMonthTotalCompleted =
    csrCurrentMonth + depositCurrentMonth + withdrawCurrentMonth;
  const previousMonthTotalCompleted =
    csrPreviousMonth + depositPreviousMonth + withdrawPreviousMonth;
  const totalDifference =
    currentMonthTotalCompleted - previousMonthTotalCompleted;
  const isTotalPositive = totalDifference >= 0;

  // Calculate overall performance metrics
  const totalAgents =
    filteredCSR.length + filteredDeposit.length + filteredWithdraw.length || 1;
  const avgConversationsPerAgent = Math.round(
    currentMonthTotalCompleted / totalAgents
  );
  const successRate =
    ((csrResult.aboveTarget +
      depositResult.aboveTarget +
      withdrawResult.aboveTarget) /
      totalAgents) *
    100;

  // Generate realistic trading-style sparkline data
  const generateSparklineData = (
    current: number,
    previous: number,
    trend: string
  ) => {
    const dataPoints = [];
    const steps = 7; // More points for smoother curve

    // Start from previous month
    dataPoints.push(previous);

    // Generate realistic fluctuations like trading data
    for (let i = 1; i < steps - 1; i++) {
      const progress = i / (steps - 1);
      let baseValue;

      if (trend === "up") {
        baseValue = previous + (current - previous) * progress;
      } else {
        baseValue = previous - (previous - current) * progress;
      }

      // Add realistic fluctuations (more volatility in the middle)
      const volatility = 0.15; // 15% volatility
      const midPointFactor = Math.sin(Math.PI * progress) * 0.5 + 0.5; // More fluctuation in middle
      const fluctuation =
        (Math.random() - 0.5) * baseValue * volatility * midPointFactor;

      const fluctuatedValue = Math.max(0, baseValue + fluctuation);
      dataPoints.push(Math.round(fluctuatedValue));
    }

    // End with current month
    dataPoints.push(current);
    return dataPoints;
  };

  useEffect(() => {
    dispatch(fetchCombinedDepartmentsData());
    dispatch(getDashboardStats());
  }, [dispatch]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        color: "#f8fafc",
        font: { size: 16, weight: "bold" } as any,
      },
    },
    cutout: "70%",
  };

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
      const text = `${value}%`;
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2 - 5;
      ctx.fillText(text, textX, textY);
      ctx.font = `${(Number(fontSize) * 0.4).toFixed(2)}em sans-serif`;
      ctx.fillStyle = "#9ca3af";
      const subText = "Quota Met";
      const subX = Math.round((width - ctx.measureText(subText).width) / 2);
      ctx.fillText(subText, subX, textY + 18);
      ctx.restore();
    },
  };

  const createChartData = (met: number, nonMet: number, color: string) => ({
    labels: ["Quota Met", "Not Met"],
    datasets: [
      {
        data: [met, nonMet],
        backgroundColor: [color, "#1f2937"],
        borderColor: "#0f172a",
        borderWidth: 2,
      },
    ],
  });

  // Trading-style Sparkline Component (exactly like the image)
  const TradingSparkline = ({
    data,
    isPositive,
  }: {
    data: number[];
    isPositive: boolean;
  }) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 120;
    const height = 40;

    // Calculate points for smooth curve
    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - 8 - ((value - min) / range) * (height - 16);
        return `${x},${y}`;
      })
      .join(" ");

    // Get first and last values
    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    const startX = 2;
    const endX = width - 2;
    const startY = height - 8 - ((firstValue - min) / range) * (height - 16);
    const endY = height - 8 - ((lastValue - min) / range) * (height - 16);

    const percentageChange = ((lastValue - firstValue) / firstValue) * 100;

    return (
      <div className="mt-3">
        <svg width={width} height={height} className="mx-auto">
          {/* Main line with smooth curve */}
          <polyline
            fill="none"
            stroke={isPositive ? "#00ff00" : "#ff4444"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Start circle indicator */}
          <circle
            cx={startX}
            cy={startY}
            r="2"
            fill={isPositive ? "#00ff00" : "#ff4444"}
            opacity="0.8"
          />

          {/* End circle indicator - larger and more prominent */}
          <circle
            cx={endX}
            cy={endY}
            r="3.5"
            fill={isPositive ? "#00ff00" : "#ff4444"}
            opacity="1"
            stroke="#1f2937"
            strokeWidth="1.5"
          />
        </svg>

        {/* Percentage indicator below sparkline */}
        <div className="flex justify-center items-center mt-1">
          <div
            className={`text-xs font-semibold ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {percentageChange.toFixed(1)}%
          </div>
        </div>
      </div>
    );
  };

  const ProgressCard = ({
    title,
    current,
    previous,
    difference,
    isPositive,
    color,
  }: {
    title: string;
    current: number;
    previous: number;
    difference: number;
    isPositive: boolean;
    color: string;
  }) => {
    const sparklineData = generateSparklineData(
      current,
      previous,
      isPositive ? "up" : "down"
    );

    return (
      <div className={`p-4 rounded-xl border-l-4 ${color} bg-gray-800/30`}>
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-white text-sm">{title}</h4>
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              isPositive
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "bg-red-500/20 text-red-300 border border-red-500/30"
            }`}
          >
            {isPositive ? "↑" : "↓"} {Math.abs(difference).toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
          <div>
            <div className="text-gray-400 text-xs">Current</div>
            <div className="text-white font-bold text-lg">
              {current.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">Previous</div>
            <div className="text-gray-300 text-lg">
              {previous.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PerformanceMetric = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = "text-blue-400",
  }: {
    icon: any;
    title: string;
    value: string;
    subtitle: string;
    color?: string;
  }) => (
    <div className="text-center p-4 bg-gray-800/30 rounded-lg">
      <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-300 font-medium">{title}</div>
      <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
    </div>
  );

  const teamLeaderData = [
    {
      title: "CSR Department",
      value: `${csrResult.aboveTarget}`,
      interval: `Prev Month: ${prevCSRResult.aboveTarget}`,
      trend: csrCurrentMonth > csrPreviousMonth ? "up" : "down",
      data: csrResult.values || [],
      totalCompleted: csrCurrentMonth,
      prevTotalCompleted: csrPreviousMonth,
      difference: csrDifference,
      isPositive: isCSRPositive,
    },
    {
      title: "Deposit Department",
      value: `${depositResult.aboveTarget}`,
      interval: `Prev Month: ${prevDepositResult.aboveTarget}`,
      trend: depositCurrentMonth > depositPreviousMonth ? "up" : "down",
      data: depositResult.values || [],
      totalCompleted: depositCurrentMonth,
      prevTotalCompleted: depositPreviousMonth,
      difference: depositDifference,
      isPositive: isDepositPositive,
    },
    {
      title: "Withdraw Department",
      value: `${withdrawResult.aboveTarget}`,
      interval: `Prev Month: ${prevWithdrawResult.aboveTarget}`,
      trend: withdrawCurrentMonth > withdrawPreviousMonth ? "up" : "down",
      data: withdrawResult.values || [],
      totalCompleted: withdrawCurrentMonth,
      prevTotalCompleted: withdrawPreviousMonth,
      difference: withdrawDifference,
      isPositive: isWithdrawPositive,
    },
  ];

  useEffect(() => {
    if (onStatsUpdate) onStatsUpdate(teamLeaderData);
  }, [selectedMonth, data]);

  return (
    <div className="text-white mt-6">
      <div className="px-2">
        {/* Department-wise Progress Cards */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Department Progress - Month Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProgressCard
              title="CSR Department"
              current={csrCurrentMonth}
              previous={csrPreviousMonth}
              difference={csrDifference}
              isPositive={isCSRPositive}
              color="border-blue-500"
            />
            <ProgressCard
              title="Deposit Department"
              current={depositCurrentMonth}
              previous={depositPreviousMonth}
              difference={depositDifference}
              isPositive={isDepositPositive}
              color="border-green-500"
            />
            <ProgressCard
              title="Withdraw Department"
              current={withdrawCurrentMonth}
              previous={withdrawPreviousMonth}
              difference={withdrawDifference}
              isPositive={isWithdrawPositive}
              color="border-purple-500"
            />
          </div>
        </div>

        {/* Overall Performance Section */}
        <div className="mb-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Overall Performance Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <PerformanceMetric
              icon={Users}
              title="Total Agents"
              value={totalAgents.toString()}
              subtitle="Active Departments"
              color="text-blue-400"
            />
            <PerformanceMetric
              icon={MessageCircle}
              title="Total Conversations"
              value={currentMonthTotalCompleted.toLocaleString()}
              subtitle={`${
                isTotalPositive ? "+" : ""
              }${totalDifference.toLocaleString()} from last month`}
              color="text-green-400"
            />
            <PerformanceMetric
              icon={Target}
              title="Success Rate"
              value={`${successRate.toFixed(1)}%`}
              subtitle="Quota Achievement"
              color="text-purple-400"
            />
            <PerformanceMetric
              icon={TrendingUp}
              title="Avg per Agent"
              value={avgConversationsPerAgent.toLocaleString()}
              subtitle="Conversations per agent"
              color="text-yellow-400"
            />
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Department Performance Charts</h2>
          <div className="flex items-center gap-4">
            <label htmlFor="monthFilter" className="text-sm text-gray-300">
              Filter by Month:
            </label>
            <select
              id="monthFilter"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-full">
          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="h-72 w-72 mx-auto relative">
              <Doughnut
                data={createChartData(
                  csrResult.abovePercent,
                  csrResult.belowPercent,
                  "#3b82f6"
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
                {csrResult.abovePercent}% Met • {csrResult.belowPercent}% Not
                Met
              </div>
              <div className="text-center mt-2 text-xs text-blue-300">
                Completed: {csrCurrentMonth.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="h-72 w-72 mx-auto relative">
              <Doughnut
                data={createChartData(
                  depositResult.abovePercent,
                  depositResult.belowPercent,
                  "#22c55e"
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
                {depositResult.abovePercent}% Met • {depositResult.belowPercent}
                % Not Met
              </div>
              <div className="text-center mt-2 text-xs text-green-300">
                Completed: {depositCurrentMonth.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="h-72 w-72 mx-auto relative">
              <Doughnut
                data={createChartData(
                  withdrawResult.abovePercent,
                  withdrawResult.belowPercent,
                  "#8b5cf6"
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
                {withdrawResult.abovePercent}% Met •{" "}
                {withdrawResult.belowPercent}% Not Met
              </div>
              <div className="text-center mt-2 text-xs text-purple-300">
                Completed: {withdrawCurrentMonth.toLocaleString()}
              </div>
            </div>
          </div>

          <WeeklyPerformanceChart
            csrData={csrResult}
            depositData={depositResult}
            withdrawData={withdrawResult}
            selectedMonth={selectedMonth}
          />
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          Last updated:{" "}
          {lastUpdated
            ? new Date(lastUpdated).toLocaleTimeString()
            : new Date().toLocaleTimeString()}{" "}
          • Showing data for: {selectedMonth}
        </div>
      </div>
    </div>
  );
};

export default CustomizedDataGrid;
