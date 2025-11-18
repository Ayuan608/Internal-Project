import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Doughnut } from "react-chartjs-2";
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
import {
  fetchCombinedDepartmentsData,
  fetchCombinedDepartmentsHistory,
  loadFromCache,
} from "../../../../../redux/combinedQuotaSlice";
import WeeklyPerformanceChart from "./../WeeklyPerformanceChart";
import CollapsibleDepartment from "../../../../ModernChart/CollapsibleDepartment";
import { CheckCircle, Target, TrendingUp } from "lucide-react";

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

  const { data, loading, fromCache } = useSelector(
    (state: any) => state.combinedQuota
  );

  const historyState = useSelector(
    (alldata: any) => alldata.combinedQuota.history
  );

  const CSR = historyState?.CSR || [];
  const Deposit = historyState?.Deposit || [];
  const Withdraw = historyState?.Withdraw || [];



  let totalCompleted = 0;
  let totalDeposit = 0;
  let totalWithdraw = 0;

  // CSR - Total Completed Conversations
  const calculateTotalCompletedConvo = (csrData: any) => {
    totalCompleted = 0;

    csrData.forEach((dayData: any) => {
      const rows = dayData.rows || [];

      rows.forEach((row: any) => {
        if (
          row.length >= 2 &&
          typeof row[0] === "string" &&
          typeof row[1] === "string" &&
          !row[0].includes("shift") &&
          !row[0].includes("HIGHLIGHTS") &&
          !row[0].includes("Ave.") &&
          !row[0].includes("TOTAL") &&
          !row[0].includes("FAILED") &&
          !row[0].includes("ASSIGNED") &&
          !row[0].includes("REACHED") &&
          row[0] !== "" &&
          row[1] !== "" &&
          !isNaN(parseInt(row[1].replace(/,/g, "")))
        ) {
          const completedConvo = parseInt(row[1].replace(/,/g, "")) || 0;
          totalCompleted += completedConvo;
        }
      });
    });

    return totalCompleted;
  };

  // Deposit - Total Amount (column 7 - Total)
  const calculateTotalDeposit = (depositData: any) => {
    totalDeposit = 0;

    depositData.forEach((dayData: any) => {
      const rows = dayData.rows || [];

      rows.forEach((row: any) => {
        if (
          row.length >= 8 &&
          typeof row[0] === "string" &&
          typeof row[7] === "string" &&
          !row[0].includes("Morning") &&
          !row[0].includes("Night") &&
          !row[0].includes("Total") &&
          !row[0].includes("12 Hours") &&
          !row[0].includes("9 HOURS") &&
          row[0] !== "" &&
          row[7] !== "" &&
          !isNaN(parseInt(row[7].replace(/,/g, "")))
        ) {
          const depositAmount = parseInt(row[7].replace(/,/g, "")) || 0;
          totalDeposit += depositAmount;
        }
      });
    });

    return totalDeposit;
  };

  // Withdraw - Total Amount Passed (column 2 - Total amount passed)
  const calculateTotalWithdraw = (withdrawData: any) => {
    totalWithdraw = 0;

    withdrawData.forEach((dayData: any) => {

      const rows = dayData.rows || [];

      rows.forEach((row: any) => {
        if (
          row.length >= 3 &&
          typeof row[0] === "string" &&
          typeof row[2] === "string" &&
          !row[0].includes("AutoDraw") &&
          !row[0].includes("TOTAL") &&
          !row[0].includes("reject") &&
          !row[0].includes("拒绝提现") &&
          !row[0].includes("Member") &&
          row[0] !== "" &&
          row[2] !== "" &&
          !isNaN(parseInt(row[5]))
        ) {
          const withdrawAmount = parseInt(row[5]) || 0;
          totalWithdraw += withdrawAmount;
        }
      });
    });

    return totalWithdraw;
  };

  // Usage - Calculate all totals
  const totalCompletedConvo = calculateTotalCompletedConvo(CSR);
  const totalDepositAmount = calculateTotalDeposit(Deposit);
  const totalWithdrawAmount = calculateTotalWithdraw(Withdraw);

  useEffect(() => {
    dispatch(loadFromCache());
    setTimeout(() => {
      dispatch(fetchCombinedDepartmentsHistory());
    }, 100);
  }, [dispatch]);

  const [selectedMonth, setSelectedMonth] = useState<string>("November");
  const [hasLoadedCache, setHasLoadedCache] = useState(false);

  // INSTANT LOAD: Load from cache immediately on mount
  useEffect(() => {
    if (!hasLoadedCache) {
      dispatch(loadFromCache());
      setHasLoadedCache(true);

      // Then fetch in background
      setTimeout(() => {
        dispatch(fetchCombinedDepartmentsData());
      }, 50);
    }
  }, [dispatch, hasLoadedCache]);

  const parseNumber = useCallback((value: any): number => {
    if (typeof value === "string") return Number(value.replace(/,/g, ""));
    return Number(value) || 0;
  }, []);

  const excludedKeywords = useMemo(
    () => [
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
    ],
    []
  );

  const groupedUsers = useMemo(() => {
    const groups: { [key: string]: any[][] } = {};

    for (const sublist of data) {
      const department = sublist[0]?.trim();
      const name = sublist[2]?.trim();

      if (!department || !name) continue;

      const lowerName = name.toLowerCase();
      const isExcluded = excludedKeywords.some((keyword) =>
        lowerName.includes(keyword)
      );

      if (isExcluded) continue;

      if (["CSR", "Deposit", "Withdraw"].includes(department)) {
        if (!groups[department]) groups[department] = [];
        groups[department].push(sublist);
      }
    }

    return groups;
  }, [data, excludedKeywords]);

  const calculations = useMemo(() => {
    const CsrTotalConvey =
      groupedUsers?.CSR?.map((item) => Number(item[3]) || 0) || [];
    const WdTotaltransaction =
      groupedUsers?.Withdraw?.map((item) => parseNumber(item[7] || 0)) || [];
    const DepositTotaltransaction =
      groupedUsers?.Deposit?.map((item) => parseNumber(item[9] || 0)) || [];

    const CsrTotalSum = CsrTotalConvey.reduce((acc, val) => acc + val, 0);
    const WdtotalSum = WdTotaltransaction.reduce((acc, val) => acc + val, 0);
    const DepositTotalsum = DepositTotaltransaction.reduce(
      (acc, val) => acc + val,
      0
    );

    let csrRealTotal = 0;
    let depositRealTotal = 0;
    let withdrawRealTotal = 0;

    data.forEach((item: any) => {
      const key = item[0];

      if (key === "CSR" && item[3] === "Ave. Completed Convo") {
        const morningShift = parseFloat(item[4]) || 0;
        const nightShift = parseFloat(item[5]) || 0;
        csrRealTotal += morningShift + nightShift;
      }

      if (key === "Deposit" && item[3] === "Ave. Completed Convo") {
        const morningShift = parseFloat(item[4]) || 0;
        const nightShift = parseFloat(item[5]) || 0;
        depositRealTotal += morningShift + nightShift;
      }

      if (
        item[0] === "Withdraw" &&
        item[2] !== "" &&
        item[2] !== "TOTAL" &&
        item[2] !== "Member" &&
        item[2] !== "reject" &&
        item[2] !== "拒绝提现"
      ) {
        const value = parseFloat((item[7] || "0").replace(/,/g, "")) || 0;
        withdrawRealTotal += value;
      }
    });

    return {
      CsrTotalSum,
      WdtotalSum,
      DepositTotalsum,
      csrRealTotal,
      depositRealTotal,
      withdrawRealTotal,
    };
  }, [groupedUsers, data, parseNumber]);

  const performance = useMemo(() => {
    const csrTargetPerPerson = 560;
    const depositTargetPerPerson = 530;
    const withdrawTargetPerPerson = 1500;

    const csrTotalTarget = csrTargetPerPerson * (groupedUsers.CSR?.length || 0);
    const depositTotalTarget =
      depositTargetPerPerson * (groupedUsers.Deposit?.length || 0);
    const withdrawTotalTarget =
      withdrawTargetPerPerson * (groupedUsers.Withdraw?.length || 0);

    const csrAchievedPercent =
      csrTotalTarget > 0
        ? Math.min((calculations.CsrTotalSum / csrTotalTarget) * 100, 100)
        : 0;

    const depositAchievedPercent =
      depositTotalTarget > 0
        ? Math.min(
          (calculations.DepositTotalsum / depositTotalTarget) * 100,
          100
        )
        : 0;

    const withdrawAchievedPercent =
      withdrawTotalTarget > 0
        ? Math.min(
          (calculations.withdrawRealTotal / withdrawTotalTarget) * 100,
          100
        )
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
  }, [groupedUsers, calculations]);
  const { history } = useSelector((state: any) => state.combinedQuota);

  // DAILY HISTORY CALCULATION
  const getDailyTotals = useMemo(() => {
    if (!historyState) return [];

    const result: any[] = [];

    const totalDays = historyState?.CSR?.length || 0;

    for (let i = 0; i < totalDays; i++) {
      const csrDay = historyState.CSR[i];
      const depositDay = historyState.Deposit[i];
      const withdrawDay = historyState.Withdraw[i];
      let dailyCSR = 0;
      let dailyDeposit = 0;
      let dailyWithdraw = 0;

      // CSR total
      csrDay?.rows?.forEach((row: any) => {
        if (
          row[0] &&
          row[1] &&
          !row[0].includes("shift") &&
          !row[0].includes("TOTAL") &&
          !row[0].includes("FAILED") &&
          !isNaN(parseInt(row[1]?.replace(/,/g, "")))
        ) {
          dailyCSR += parseInt(row[1].replace(/,/g, ""));
        }
      });

      // Deposit total (col 7)
      depositDay?.rows?.forEach((row: any) => {
        if (
          row[7] &&
          !row[0].includes("Total") &&
          !isNaN(parseInt(row[7]?.replace(/,/g, "")))
        ) {
          dailyDeposit += parseInt(row[7].replace(/,/g, ""));
        }
      });

      // Withdraw total (col 2)
      withdrawDay?.rows?.forEach((row: any) => {
        if (
          row[2] &&
          !row[0].includes("TOTAL") &&
          !row[0].includes("reject") &&
          !isNaN(parseInt(row[5]?.replace(/,/g, "")))
        ) {
          dailyWithdraw += parseInt(row[5].replace(/,/g, ""));
        }
      });

      result.push({
        day: i + 1,
        csr: dailyCSR,
        deposit: dailyDeposit,
        withdraw: dailyWithdraw,
        dateKey: csrDay?.dateKey,
      });
    }

    return result;
  }, [historyState]);


  const csrData = getDailyTotals.map((item) => item.csr);
  const depositData = getDailyTotals.map((item) => item.deposit);
  const withdrawData = getDailyTotals.map((item) => item.withdraw);


  const wdTotal = withdrawData.reduce((acc, curr) => acc + curr, 0)
  const depTotal = depositData.reduce((acc, curr) => acc + curr, 0)
  // console.log("dep", depTotal)

  const teamLeaderData = useMemo(
    () => [
      {
        title: "CSR - Total Conversation",
        value: `${formatNumber(calculations.csrRealTotal)}`,
        interval: `Target: 550`,
        trend: performance.csrTargetMet ? "up" : "up",
        totalCompleted: calculations.csrRealTotal,
        target: 550,
        difference: totalCompleted?.toLocaleString(),
        isPositive: performance.csrTargetMet,
        realTotal: calculations.csrRealTotal,
        performance: performance.csrAbovePercent,
        targetMet: performance.csrTargetMet,
        getDailyTotals
      },
      {
        title: "Deposit - Total Transaction",
        value: `${formatNumber(calculations.DepositTotalsum)}`,
        interval: `Target: 530`,
        trend: performance.depositTargetMet ? "up" : "up",
        totalCompleted: calculations.DepositTotalsum,
        target: 530,
        difference: totalDepositAmount?.toLocaleString(),
        isPositive: performance.depositTargetMet,
        realTotal: calculations.depositRealTotal,
        performance: performance.depositAbovePercent,
        targetMet: performance.depositTargetMet,
        getDailyTotals
      },
      {
        title: "Withdrawal - Total Transaction Process",
        value: `${formatNumber(calculations.withdrawRealTotal)}`,
        interval: `Target: 1,500`,
        trend: performance.withdrawTargetMet ? "up" : "up",
        totalCompleted: calculations.withdrawRealTotal,
        target: 1500,
        difference: wdTotal?.toLocaleString(),
        isPositive: performance.withdrawTargetMet,
        realTotal: calculations.withdrawRealTotal,
        performance: performance.withdrawAbovePercent,
        targetMet: performance.withdrawTargetMet,
        getDailyTotals
      },
    ],
    [calculations, performance]
  );

  useEffect(() => {
    if (onStatsUpdate && data.length > 0) {
      onStatsUpdate(teamLeaderData);
    }
  }, [teamLeaderData, onStatsUpdate, data.length]);

  const chartOptions = useMemo(
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

  const centerTextPlugin: Plugin<"doughnut"> = useMemo(
    () => ({
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
        const subText = performance.csrTargetMet
          ? "Quota Met"
          : "Quota Not Met";
        const subX = Math.round((width - ctx.measureText(subText).width) / 2);
        ctx.fillText(subText, subX, textY + 28);
        ctx.restore();
      },
    }),
    [performance.csrTargetMet]
  );

  const createChartData = useCallback(
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

  const [expandedDept, setExpandedDept] = useState({
    csr: true,
    deposit: true,
    withdrawal: true,
  });

  const staffPerShift = useMemo(
    () => ({
      csr: { morning: 24, night: 12 },
      deposit: { morning: 10, night: 5 },
      withdrawal: { morning: 12, night: 6 },
    }),
    []
  );

  const csrMetrics = useMemo(
    () => [
      {
        title: "Completed",
        value: formatNumber(calculations.CsrTotalSum),
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
    ],
    [calculations.CsrTotalSum, performance]
  );

  const depositMetrics = useMemo(
    () => [
      {
        title: "Completed",
        value: formatNumber(calculations.depositRealTotal),
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
    ],
    [calculations.depositRealTotal, performance]
  );

  const withdrawalMetrics = useMemo(
    () => [
      {
        title: "Completed",
        value: formatNumber(calculations.withdrawRealTotal),
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
    ],
    [calculations.withdrawRealTotal, performance]
  );

  // NO LOADING STATE - Data dikho turant!
  return (
    <div className="text-white mt-6 bg-[#00010B]">


      <div className="mt-5">
        <CollapsibleDepartment
          TotalSum={calculations.CsrTotalSum}
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
          TotalSum={calculations.CsrTotalSum}
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
          TotalSum={calculations.CsrTotalSum}
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

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">
          Department Performance Charts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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

          <div className="rounded-2xl h-[400px]">
            <WeeklyPerformanceChart
              csrData={{
                realTotal: calculations.csrRealTotal,
                performance: performance.csrAbovePercent,
                targetMet: performance.csrTargetMet,
              }}
              depositData={{
                realTotal: calculations.depositRealTotal,
                performance: performance.depositAbovePercent,
                targetMet: performance.depositTargetMet,
              }}
              withdrawData={{
                realTotal: calculations.withdrawRealTotal,
                performance: performance.withdrawAbovePercent,
                targetMet: performance.withdrawTargetMet,
              }}
              selectedMonth={selectedMonth}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CustomizedDataGrid);
