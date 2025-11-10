import Charts from "./Chart";
import TeamLeaderStats from "./SuperAdminDashboardRoute/ui/TeamLeaderStats";
import { TeamStats } from "../../Helpers/Helper";
import CustomizedDataGrid from "./SuperAdminDashboardRoute/ui/data/CustomizedDataGrid";
import ExampleIosSwitch from "./SuperAdminDashboardRoute/ui/Switch";
import { useState } from 'react';
import { useSelector } from "react-redux";
import ModernDashboard from "../ModernChart/ModernDashboard";
import PerformanceTrendCard from "../ModernChart/PerformanceTrendCard";

export default function Dashboard() {
  const [teamLeaderData, setTeamLeaderData] = useState([]);

  const userId = useSelector((state) => state.auth?.data?._id);

  const performanceTrendData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    CSR: 75 + Math.random() * 20,
    Deposit: 60 + Math.random() * 25,
    Withdrawal: 85 + Math.random() * 15
  }));

  return (
    <>

      <div className="min-h-screen text-gray-100 p-4">
        <div
          className=" top-0 rounded-lg p-2 z-auto backdrop-blur-3xl "
          style={{ zIndex: 9 }}
        >
          <div className="p-4 bg-[#282e3c38] rounded-xl mb-4 w-full">
           
            <TeamLeaderStats
              title="Dashboard Overview"
              SecondaryTitle="Monitor real-time metrics and performance across all departments"
              data={teamLeaderData}
            />
          </div>
        </div>
        <div className="flex gap-6 mt-2 overflow-y-auto px-2">
          <PerformanceTrendCard
            data={performanceTrendData}
            title="30-Day Performance Trend (vs Yesterday)"
          />
        </div>

        <CustomizedDataGrid onStatsUpdate={setTeamLeaderData} />
      </div>
    </>
  );
}
