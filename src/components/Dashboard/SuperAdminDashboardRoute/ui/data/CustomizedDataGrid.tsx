import React, { useState, useEffect, useCallback } from "react";
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
import {
  TrendingUp,
  Users,
  MessageCircle,
  Target,
  RefreshCw,
} from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

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

  console.log(data, "sheet data");

  const [selectedMonth, setSelectedMonth] = useState<string>("September");

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loading = quotaLoading || combinedQuotaLoading || isRefreshing;

  const parseNumber = useCallback((value: any): number => {
    if (typeof value === "string") return Number(value.replace(/,/g, ""));
    return Number(value) || 0;
  }, []);

  const extractAvailableMonths = useCallback((data: any[]): string[] => {
    if (!data || !Array.isArray(data)) return ["September"];
    const months: string[] = [];
    data.forEach((row: any) => {
      if (Array.isArray(row) && row[0] === "CSR" && row[1] === "" && row[2]) {
        const month = row[2];
        if (month && !months.includes(month)) months.push(month);
      }
    });
    return months.length > 0 ? months : ["September"];
  }, []);

  const getRowMonth = useCallback((row: any): string | null => {
    if (!Array.isArray(row) || row.length === 0) return null;
    if (row[0] === "CSR" && row[1] === "" && row[2]) return row[2];
    return null;
  }, []);

  const filterDataByMonth = useCallback(
    (data: any[], targetMonth: string): any[] => {
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
    },
    [getRowMonth]
  );

  const calculateDepartmentStatus = useCallback(
    (
      departmentData: any[],
      quotaIndex: number,
      targetQuota: number
    ): DepartmentResult => {
      if (!departmentData?.length) {
        return {
          abovePercent: 0,
          belowPercent: 100,
          total: 0,
          values: [],
          aboveTarget: 0,
        };
      }

      const values = departmentData
        .map((row: any) => parseNumber(row[quotaIndex]))
        .filter((num: number) => !isNaN(num) && num !== 0);

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
    },
    [parseNumber]
  );

  const getPreviousMonth = useCallback((monthName: string): string => {
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
  }, []);

  // Memoized data calculations
  const availableMonths = React.useMemo(
    () => extractAvailableMonths(data),
    [data, extractAvailableMonths]
  );

  // Auto-select first available month if current selection not available
  useEffect(() => {
    if (
      availableMonths.length > 0 &&
      !availableMonths.includes(selectedMonth)
    ) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const monthlyData = React.useMemo(
    () => filterDataByMonth(data, selectedMonth),
    [data, selectedMonth, filterDataByMonth]
  );

  const previousMonth = React.useMemo(
    () => getPreviousMonth(selectedMonth),
    [selectedMonth, getPreviousMonth]
  );

  const prevMonthData = React.useMemo(
    () => filterDataByMonth(data, previousMonth),
    [data, previousMonth, filterDataByMonth]
  );

  // Filter departments data
  const filteredCSR = React.useMemo(
    () =>
      monthlyData.filter((row: any) => row[0]?.toLowerCase().includes("csr")),
    [monthlyData]
  );

  const filteredDeposit = React.useMemo(
    () =>
      monthlyData.filter((row: any) =>
        row[0]?.toLowerCase().includes("deposit")
      ),
    [monthlyData]
  );

  const filteredWithdraw = React.useMemo(
    () =>
      monthlyData.filter((row: any) =>
        row[0]?.toLowerCase().includes("withdraw")
      ),
    [monthlyData]
  );

  const filteredPrevCSR = React.useMemo(
    () =>
      prevMonthData.filter((row: any) => row[0]?.toLowerCase().includes("csr")),
    [prevMonthData]
  );

  const filteredPrevDeposit = React.useMemo(
    () =>
      prevMonthData.filter((row: any) =>
        row[0]?.toLowerCase().includes("deposit")
      ),
    [prevMonthData]
  );

  const filteredPrevWithdraw = React.useMemo(
    () =>
      prevMonthData.filter((row: any) =>
        row[0]?.toLowerCase().includes("withdraw")
      ),
    [prevMonthData]
  );

  // Calculate department results
  const csrResult = React.useMemo(
    () => calculateDepartmentStatus(filteredCSR, 2, 530),
    [filteredCSR, calculateDepartmentStatus]
  );

  const depositResult = React.useMemo(
    () => calculateDepartmentStatus(filteredDeposit, 9, 530),
    [filteredDeposit, calculateDepartmentStatus]
  );

  const withdrawResult = React.useMemo(
    () => calculateDepartmentStatus(filteredWithdraw, 7, 1500),
    [filteredWithdraw, calculateDepartmentStatus]
  );

  const prevCSRResult = React.useMemo(
    () => calculateDepartmentStatus(filteredPrevCSR, 2, 530),
    [filteredPrevCSR, calculateDepartmentStatus]
  );

  const prevDepositResult = React.useMemo(
    () => calculateDepartmentStatus(filteredPrevDeposit, 9, 530),
    [filteredPrevDeposit, calculateDepartmentStatus]
  );

  const prevWithdrawResult = React.useMemo(
    () => calculateDepartmentStatus(filteredPrevWithdraw, 7, 1500),
    [filteredPrevWithdraw, calculateDepartmentStatus]
  );

  // Calculate totals and differences
  const csrCurrentMonth = React.useMemo(
    () =>
      csrResult.values.reduce(
        (accu, curr) => accu + (isNaN(curr) ? 0 : curr),
        0
      ),
    [csrResult.values]
  );

  const csrPreviousMonth = React.useMemo(
    () =>
      prevCSRResult.values.reduce(
        (accu, curr) => accu + (isNaN(curr) ? 0 : curr),
        0
      ),
    [prevCSRResult.values]
  );

  const csrDifference = csrCurrentMonth - csrPreviousMonth;
  const isCSRPositive = csrDifference >= 0;

  const depositCurrentMonth = React.useMemo(
    () =>
      depositResult.values.reduce(
        (accu, curr) => accu + (isNaN(curr) ? 0 : curr),
        0
      ),
    [depositResult.values]
  );

  const depositPreviousMonth = React.useMemo(
    () =>
      prevDepositResult.values.reduce(
        (accu, curr) => accu + (isNaN(curr) ? 0 : curr),
        0
      ),
    [prevDepositResult.values]
  );

  const depositDifference = depositCurrentMonth - depositPreviousMonth;
  const isDepositPositive = depositDifference >= 0;

  const withdrawCurrentMonth = React.useMemo(
    () =>
      withdrawResult.values.reduce(
        (accu, curr) => accu + (isNaN(curr) ? 0 : curr),
        0
      ),
    [withdrawResult.values]
  );

  const withdrawPreviousMonth = React.useMemo(
    () =>
      prevWithdrawResult.values.reduce(
        (accu, curr) => accu + (isNaN(curr) ? 0 : curr),
        0
      ),
    [prevWithdrawResult.values]
  );

  const withdrawDifference = withdrawCurrentMonth - withdrawPreviousMonth;
  const isWithdrawPositive = withdrawDifference >= 0;

  const currentMonthTotalCompleted =
    csrCurrentMonth + depositCurrentMonth + withdrawCurrentMonth;
  const previousMonthTotalCompleted =
    csrPreviousMonth + depositPreviousMonth + withdrawPreviousMonth;
  const totalDifference =
    currentMonthTotalCompleted - previousMonthTotalCompleted;
  const isTotalPositive = totalDifference >= 0;

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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchCombinedDepartmentsData()),
        dispatch(getDashboardStats()),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch]);

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
      const text = `${value}%`;
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 1.8 - 5;
      ctx.fillText(text, textX, textY);
      ctx.font = `${(Number(fontSize) * 0.4).toFixed(2)}em sans-serif`;
      ctx.fillStyle = "#9ca3af";
      const subText = "Quota Met";
      const subX = Math.round((width - ctx.measureText(subText).width) / 2);
      ctx.fillText(subText, subX, textY + 28);
      ctx.restore();
    },
  };

  const createChartData = React.useCallback(
    (met: number, nonMet: number, color: string) => ({
      labels: ["Quota Met", "Not Met"],
      datasets: [
        {
          data: [met, nonMet],
          backgroundColor: [color, "#1f2937"],
          borderColor: "#0f172a",
          borderWidth: 2,
        },
      ],
    }),
    []
  );

  const ProgressCard = React.memo(
    ({
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
    }) => (
      <div className={`p-4 rounded-xl border-l-4 ${color} border-l`}>
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-white text-sm">{title}</h4>
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              isPositive
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "bg-red-500/20 text-red-300 border border-red-500/30"
            }`}
          >
            {isPositive ? "↑" : "↓"} {formatNumber(Math.abs(difference))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
          <div>
            <div className="text-gray-400 text-xs">Current</div>
            <div className="text-white font-bold text-lg">
              {formatNumber(current)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">Previous</div>
            <div className="text-gray-300 text-lg">
              {formatNumber(previous)}
            </div>
          </div>
        </div>
      </div>
    )
  );

  const PerformanceMetric = React.memo(
    ({
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
    }) => {
      const formattedValue = value.includes("%")
        ? value
        : formatNumber(Number(value));

      return (
        <div className="text-center p-4 bg-gray-800/30 rounded-lg">
          <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
          <div className="text-2xl font-bold text-white">{formattedValue}</div>
          <div className="text-sm text-gray-300 font-medium">{title}</div>
          <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
        </div>
      );
    }
  );

  const teamLeaderData = React.useMemo(
    () => [
      {
        title: "CSR Department",
        value: `${csrResult.aboveTarget}`,
        interval: `Prev Month: ${prevCSRResult.aboveTarget}`,
        trend: csrCurrentMonth > csrPreviousMonth ? "up" : "down",
        data: csrResult.values || [],
        totalCompleted: csrCurrentMonth,
        prevTotalCompleted: csrPreviousMonth,
        difference: formatNumber(csrDifference),
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
        difference: formatNumber(depositDifference),
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
        difference: formatNumber(withdrawDifference),
        isPositive: isWithdrawPositive,
      },
    ],
    [
      csrResult,
      prevCSRResult,
      csrCurrentMonth,
      csrPreviousMonth,
      csrDifference,
      isCSRPositive,
      depositResult,
      prevDepositResult,
      depositCurrentMonth,
      depositPreviousMonth,
      depositDifference,
      isDepositPositive,
      withdrawResult,
      prevWithdrawResult,
      withdrawCurrentMonth,
      withdrawPreviousMonth,
      withdrawDifference,
      isWithdrawPositive,
    ]
  );

  useEffect(() => {
    if (onStatsUpdate && isInitialized && !loading) {
      onStatsUpdate(teamLeaderData);
    }
  }, [teamLeaderData, onStatsUpdate, isInitialized, loading]);

  return (
    <div className="text-white mt-6 bg-[#00010B]">
      <div className="px-2">
        {/* Charts Section */}
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
              className="bg-[#282e3c38] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
              disabled={loading}
            >
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="flex  gap-4 h-full ">
          <div className="p-4 bg-[#282e3c38] rounded-2xl border border-white/10">
            <div className="h-72 w-72 mx-auto relative">
              <Doughnut
                data={createChartData(
                  csrResult.abovePercent,
                  csrResult.belowPercent,
                  "rgba(59, 130, 246, 0.8)"
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
                Completed: {formatNumber(csrCurrentMonth)}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#282e3c38] rounded-2xl border border-white/10">
            <div className="h-72 w-72 mx-auto relative">
              <Doughnut
                data={createChartData(
                  depositResult.abovePercent,
                  depositResult.belowPercent,
                  "rgba(16, 185, 129, 0.8"
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
                Completed: {formatNumber(depositCurrentMonth)}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#282e3c38] rounded-2xl border border-white/10">
            <div className="h-72 w-72 mx-auto relative">
              <Doughnut
                data={createChartData(
                  withdrawResult.abovePercent,
                  withdrawResult.belowPercent,
                  "rgba(168, 85, 247, 1)"
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
                Completed: {formatNumber(withdrawCurrentMonth)}
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

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Last updated:{" "}
          {lastUpdated
            ? new Date(lastUpdated).toLocaleTimeString()
            : new Date().toLocaleTimeString()}{" "}
          • Showing data for: {selectedMonth}
          {loading && " • Updating..."}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CustomizedDataGrid);
