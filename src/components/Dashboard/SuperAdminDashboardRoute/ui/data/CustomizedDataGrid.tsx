import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import WeeklyPerformanceChart from "./../WeeklyPerformanceChart";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const CustomizedDataGrid = () => {
  const [dashboardData, setDashboardData] = useState({
    totalCases: 1247,
    activeAgents: 142,
    avgResponseTime: 3.2,
    successRate: 94.5,
    csrQuota: { met: 78, nonMet: 22 },
    depositQuota: { met: 85, nonMet: 15 },
    withdrawalQuota: { met: 72, nonMet: 28 },
  });

  // Simulate real-time data updates
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
              Math.min(
                95,
                prev.csrQuota.met + Math.floor(Math.random() * 3) - 1
              )
            ),
        },
        depositQuota: {
          met: Math.max(
            75,
            Math.min(
              98,
              prev.depositQuota.met + Math.floor(Math.random() * 3) - 1
            )
          ),
          nonMet:
            100 -
            Math.max(
              75,
              Math.min(
                98,
                prev.depositQuota.met + Math.floor(Math.random() * 3) - 1
              )
            ),
        },
        withdrawalQuota: {
          met: Math.max(
            65,
            Math.min(
              90,
              prev.withdrawalQuota.met + Math.floor(Math.random() * 3) - 1
            )
          ),
          nonMet:
            100 -
            Math.max(
              65,
              Math.min(
                90,
                prev.withdrawalQuota.met + Math.floor(Math.random() * 3) - 1
              )
            ),
        },
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#e5e7eb",
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
      title: {
        display: true,
        color: "#f8fafc",
        font: {
          size: 16,
          weight: "bold" as const,
        },
        padding: {
          bottom: 10,
        },
      },
    },
    cutout: "60%",
  };

  // Chart data configuration
  const createChartData = (met: number, nonMet: number, title: string) => ({
    labels: ["Quota Met", "Non-Quota"],
    datasets: [
      {
        data: [met, nonMet],
        backgroundColor: [
          "#3b82f6", // Green for met quota
          "#f53a3a", // Red for non-quota
        ],
        borderColor: "#1f2937",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  });

  return (
    <div className="text-white mt-6">
      <div className="px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="text-gray-400 text-sm font-medium mb-2">
              TOTAL CASES TODAY
            </div>
            <div className="text-3xl font-bold text-white">
              {dashboardData.totalCases.toLocaleString()}
            </div>
          </div>

          {/* Active Agents */}
          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="text-gray-400 text-sm font-medium mb-2">
              ACTIVE AGENTS
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {dashboardData.activeAgents}
            </div>
          </div>

          {/* Avg Response Time */}
          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="text-gray-400 text-sm font-medium mb-2">
              AVG RESPONSE TIME
            </div>
            <div className="text-3xl font-bold text-yellow-400">
              {dashboardData.avgResponseTime.toFixed(1)}m
            </div>
          </div>

          {/* Success Rate */}
          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="text-gray-400 text-sm font-medium mb-2">
              SUCCESS RATE
            </div>
            <div className="text-3xl font-bold text-green-400">
              {dashboardData.successRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-full">
          {/* CSR Department Quota */}
          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div>
              <Doughnut
                data={createChartData(
                  dashboardData.csrQuota.met,
                  dashboardData.csrQuota.nonMet,
                  "CSR Department Quota"
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
              />
            </div>
            <div className="text-center mt-4 text-sm text-gray-400">
              {dashboardData.csrQuota.met}% Met •{" "}
              {dashboardData.csrQuota.nonMet}% Not Met
            </div>
          </div>

          {/* Deposit Department Quota */}
          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div>
              <Doughnut
                data={createChartData(
                  dashboardData.depositQuota.met,
                  dashboardData.depositQuota.nonMet,
                  "Deposit Department Quota"
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
              />
            </div>
            <div className="text-center mt-4 text-sm text-gray-400">
              {dashboardData.depositQuota.met}% Met •{" "}
              {dashboardData.depositQuota.nonMet}% Not Met
            </div>
          </div>

          {/* Withdrawal Department Quota */}
          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div>
              <Doughnut
                data={createChartData(
                  dashboardData.withdrawalQuota.met,
                  dashboardData.withdrawalQuota.nonMet,
                  "Withdrawal Department Quota"
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
