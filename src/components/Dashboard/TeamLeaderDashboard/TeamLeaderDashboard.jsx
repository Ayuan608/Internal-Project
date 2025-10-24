import { Search } from "lucide-react";
import TeamLeaderStats from "../SuperAdminDashboardRoute/ui/TeamLeaderStats";
import { LeaderStats } from "../../../Helpers/Helper";
import ExampleIosSwitch from "../SuperAdminDashboardRoute/ui/Switch";
import ShiftChart from "../SuperAdminDashboardRoute/ui/ShiftChart";
import { Doughnut } from "react-chartjs-2";
import { useState } from "react";
import QuotaManagement from "../SuperAdminDashboardRoute/ui/QuotaManagement";

export default function TeamLeaderDashboard() {
  const createChartData = (met, nonMet, title) => ({
    labels: ["Quota Met", "Non-Quota"],
    datasets: [
      {
        data: [met, nonMet],
        backgroundColor: ["#3b82f6", "#f53a3a"],
        borderColor: "#1f2937",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  });
  const [dashboardData, setDashboardData] = useState({
    totalCases: 1247,
    activeAgents: 142,
    avgResponseTime: 3.2,
    successRate: 94.5,
    csrQuota: { met: 78, nonMet: 22 },
    depositQuota: { met: 85, nonMet: 15 },
    withdrawalQuota: { met: 72, nonMet: 28 },
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
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
          weight: "bold",
        },
        padding: {
          bottom: 10,
        },
      },
    },
    cutout: "60%",
  };

  return (
    <>
      <div className="min-h-screen text-gray-100 bg-black">
        <div
          className=" top-0 rounded-lg p-2 z-auto backdrop-blur-3xl "
          style={{ zIndex: 9 }}
        >
          <div className="flex justify-between">
            <div className="flex justify-start items-start mb-4">
              <div className="relative w-full max-w-[600px]">
                <input
                  type="text"
                  placeholder="Search, contacts, deals, campaigns..."
                  className="bg-[#f5f6fa13] text-white rounded-full pl-9 pr-3 py-2 w-full text-sm focus:outline-none placeholder:text-white"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-white" />
              </div>
            </div>
            <ExampleIosSwitch />
          </div>

          <div className="p-2 bg-[#282e3c38] rounded-xl mb-4 ">
            <TeamLeaderStats title="⚡ Performance Trends" data={LeaderStats} />
          </div>
        </div>
        <div className="flex gap-6 mt-2 overflow-y-auto px-2">
          <ShiftChart />
          <div className="rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="h-72 w-72 items-center justify-center">
              <Doughnut
                data={createChartData(
                  dashboardData.csrQuota.met,
                  dashboardData.csrQuota.nonMet,
                  "📊 Quota Performance"
                )}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: "📊 Quota Performance",
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
        </div>

        <QuotaManagement />
      </div>
    </>
  );
}
