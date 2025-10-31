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
import WeeklyPerformanceChart from "./../WeeklyPerformanceChart";
import { getDashboardStats } from "../../../../../redux/QuotaSlice";
import { fetchCombinedDepartmentsData } from "../../../../../redux/combinedQuotaSlice";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const CustomizedDataGrid: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { lastUpdated } = useSelector((state: any) => state.quota);
  const { data } = useSelector((state: any) => state.combinedQuota);

  // ✅ IMPROVED: Separate calculation function for each department
  const calculateDepartmentStatus = (
    departmentData: any[],
    quotaIndex: number,
    targetQuota: number
  ) => {
    if (!departmentData?.length) {
      return { abovePercent: 0, belowPercent: 100, total: 0, values: [] };
    }

    const values = departmentData
      ?.map((row: any) => {
        const value = Number(row[quotaIndex]);
        return isNaN(value) ? 0 : value;
      })
      .filter((num: number) => num !== 0);

    let belowTarget = 0;
    let aboveTarget = 0;

    values.forEach((num) => {
      if (num >= targetQuota) { 
        aboveTarget++;
      } else {
        belowTarget++;
      }
    });

    const total = values.length || 1;
    const abovePercent = Number(((aboveTarget / total) * 100).toFixed(2));
    const belowPercent = Number(((belowTarget / total) * 100).toFixed(2));

    return { abovePercent, belowPercent, total, values };
  };

  // ✅ FIXED: Calculate separately for each department with proper indices
  const filteredCSR = data?.filter((row: any) =>
    row[0]?.toLowerCase().includes("csr")
  );
  const csrResult = calculateDepartmentStatus(filteredCSR, 2, 530);

  const filteredDeposit = data?.filter((row: any) =>
    row[0]?.toLowerCase().includes("deposit")
  );
  const depositResult = calculateDepartmentStatus(filteredDeposit, 9, 530);

  const filteredWithdraw = data?.filter((row: any) =>
    row[0]?.toLowerCase().includes("withdraw")
  );

  const withdrawResultIndex7 = calculateDepartmentStatus(
    filteredWithdraw,
    7,
    530
  );

  const withdrawResult = withdrawResultIndex7;

  // ---------------- Hooks ----------------
  useEffect(() => {
    dispatch(fetchCombinedDepartmentsData());
    dispatch(getDashboardStats());
  }, [dispatch]);

  // ---------------- Chart Config ----------------
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        color: "#f8fafc",
        font: { size: 16, weight: "bold" as const },
        padding: { bottom: 10 },
      },
    },
    cutout: "70%",
  };

  // Center text plugin
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
      const subText = "Met";
      const subX = Math.round((width - ctx.measureText(subText).width) / 2);
      ctx.fillText(subText, subX, textY + 18);
      ctx.restore();
    },
  };

  // Chart data builder
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

  return (
    <div className="text-white mt-6">
      <div className="px-2">
        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-full">
          {/* CSR Department */}
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
            </div>
            <div className="text-center mt-4 text-sm text-gray-400">
              {csrResult.abovePercent}% Met • {csrResult.belowPercent}% Not Met
            </div>
          </div>

          {/* Deposit Department */}
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
            </div>
            <div className="text-center mt-4 text-sm text-gray-400">
              {depositResult.abovePercent}% Met • {depositResult.belowPercent}%
              Not Met
            </div>
          </div>

          {/* Withdrawal Department */}
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
                      text: "Withdrawal Department Quota",
                    },
                  },
                }}
                plugins={[centerTextPlugin]}
              />
            </div>
            <div className="text-center mt-4 text-sm text-gray-400">
              {withdrawResult.abovePercent}% Met • {withdrawResult.belowPercent}
              % Not Met
            </div>
          </div>

          <WeeklyPerformanceChart />
        </div>

        {/* Last Updated */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Last updated:{" "}
          {lastUpdated
            ? new Date(lastUpdated).toLocaleTimeString()
            : new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default CustomizedDataGrid;
