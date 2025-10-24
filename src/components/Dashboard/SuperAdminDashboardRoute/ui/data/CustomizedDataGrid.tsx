import React, { useState, useEffect } from "react";
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
import { CheckCircle, Clock, FileText, Users } from "lucide-react";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const CustomizedDataGrid: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    totalCases: 1247,
    activeAgents: 142,
    avgResponseTime: 3.2,
    successRate: 94.5,
    csrQuota: { met: 78, nonMet: 22 },
    depositQuota: { met: 85, nonMet: 15 },
    withdrawalQuota: { met: 72, nonMet: 28 },
  });

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardData((prev) => ({
        totalCases: prev.totalCases + Math.floor(Math.random() * 10) - 3,
        activeAgents: prev.activeAgents + Math.floor(Math.random() * 3) - 1,
        avgResponseTime: Math.max(
          1.5,
          Math.min(5, prev.avgResponseTime + (Math.random() - 0.5) * 0.2)
        ),
        successRate: Math.max(
          85,
          Math.min(99, prev.successRate + (Math.random() - 0.5) * 0.5)
        ),
        csrQuota: {
          met: Math.max(
            70,
            Math.min(95, prev.csrQuota.met + Math.floor(Math.random() * 3) - 1)
          ),
          nonMet:
            100 -
            Math.max(
              70,
              Math.min(95, prev.csrQuota.met + Math.floor(Math.random() * 3) - 1)
            ),
        },
        depositQuota: {
          met: Math.max(
            75,
            Math.min(98, prev.depositQuota.met + Math.floor(Math.random() * 3) - 1)
          ),
          nonMet:
            100 -
            Math.max(
              75,
              Math.min(98, prev.depositQuota.met + Math.floor(Math.random() * 3) - 1)
            ),
        },
        withdrawalQuota: {
          met: Math.max(
            65,
            Math.min(90, prev.withdrawalQuota.met + Math.floor(Math.random() * 3) - 1)
          ),
          nonMet:
            100 -
            Math.max(
              65,
              Math.min(90, prev.withdrawalQuota.met + Math.floor(Math.random() * 3) - 1)
            ),
        },
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        color: "#f8fafc",
        font: {
          size: 16,
          weight: "bold" as const,
        },
        padding: { bottom: 10 },
      },
    },
    cutout: "70%",
  };

  // Custom plugin for center text
  const centerTextPlugin: Plugin<"doughnut"> = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { width, height, ctx } = chart;
      const meta = chart.getDatasetMeta(0);
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

      // small "Met" text
      ctx.font = `${(Number(fontSize) * 0.4).toFixed(2)}em sans-serif`;
      ctx.fillStyle = "#9ca3af";
      const subText = "Met";
      const subX = Math.round((width - ctx.measureText(subText).width) / 2);
      ctx.fillText(subText, subX, textY + 18);
      ctx.restore();
    },
  };

  // Chart data function
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
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Cases */}
          <div className="rounded-xl p-6 shadow-lg border border-gray-700/40 bg-gradient-to-br from-[#0b0f19] to-[#101828]">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-blue-400 w-5 h-5" />
              <span className="text-blue-400 bg-blue-400/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                LIVE
              </span>
            </div>
            <div className="text-3xl font-bold text-white">
              {dashboardData.totalCases.toLocaleString()}
              <div className="text-gray-400 text-sm font-medium pt-2">
                TOTAL CASES TODAY
              </div>
            </div>
          </div>

          {/* Active Agents */}
          <div className="rounded-xl p-6 shadow-lg border border-gray-700/40 bg-gradient-to-br from-[#0b0f19] to-[#101828]">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-sky-400 w-5 h-5" />
              <span className="text-sky-400 bg-sky-400/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                LIVE
              </span>
            </div>
            <div className="text-3xl font-bold text-sky-400">
              {dashboardData.activeAgents}
            </div>
            <div className="text-gray-400 text-sm font-medium pt-1">
              ACTIVE AGENTS
            </div>
          </div>

          {/* Avg Response Time */}
          <div className="rounded-xl p-6 shadow-lg border border-gray-700/40 bg-gradient-to-br from-[#0b0f19] to-[#101828]">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-yellow-400 w-5 h-5" />
              <span className="text-yellow-400 bg-yellow-400/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                LIVE
              </span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">
              {dashboardData.avgResponseTime.toFixed(1)}m
            </div>
            <div className="text-gray-400 text-sm font-medium pt-1">
              AVG RESPONSE TIME
            </div>
          </div>

          {/* Success Rate */}
          <div className="rounded-xl p-6 shadow-lg border border-gray-700/40 bg-gradient-to-br from-[#0b0f19] to-[#101828]">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-400 w-5 h-5" />
              <span className="text-green-400 bg-green-400/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                LIVE
              </span>
            </div>
            <div className="text-3xl font-bold text-green-400">
              {dashboardData.successRate.toFixed(1)}%
            </div>
            <div className="text-gray-400 text-sm font-medium pt-1">
              SUCCESS RATE
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-full">
          {/* CSR Department */}
          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="h-72 w-72 mx-auto relative">
              <Doughnut
                data={createChartData(
                  dashboardData.csrQuota.met,
                  dashboardData.csrQuota.nonMet,
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
              {dashboardData.csrQuota.met}% Met •{" "}
              {dashboardData.csrQuota.nonMet}% Not Met
            </div>
          </div>

          {/* Deposit Department */}
          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="h-72 w-72 mx-auto relative">
              <Doughnut
                data={createChartData(
                  dashboardData.depositQuota.met,
                  dashboardData.depositQuota.nonMet,
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
              {dashboardData.depositQuota.met}% Met •{" "}
              {dashboardData.depositQuota.nonMet}% Not Met
            </div>
          </div>

          {/* Withdrawal Department */}
          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="h-72 w-72 mx-auto relative">
              <Doughnut
                data={createChartData(
                  dashboardData.withdrawalQuota.met,
                  dashboardData.withdrawalQuota.nonMet,
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
                {dashboardData.withdrawalQuota.met}% Met •{" "}
                {dashboardData.withdrawalQuota.nonMet}% Not Met
              </div>
          </div>

          <WeeklyPerformanceChart />
        </div>

        {/* Last Updated */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default CustomizedDataGrid;
