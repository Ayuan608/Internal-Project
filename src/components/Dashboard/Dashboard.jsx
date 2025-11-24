import TeamLeaderStats from "./SuperAdminDashboardRoute/ui/TeamLeaderStats";

import { useState } from 'react';
import { useSelector } from "react-redux";
import PerformanceTrendCard from "../ModernChart/PerformanceTrendCard";
import CustomizedDataGrid from "./SuperAdminDashboardRoute/ui/data/CustomizedDataGrid";

export default function Dashboard() {
  const [teamLeaderData, setTeamLeaderData] = useState([]);


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
            title="Monthly Performance Overview"
            height={400}
            showFullMonth={true}
          />
        </div>

        <CustomizedDataGrid onStatsUpdate={setTeamLeaderData} />
      </div>
    </>
  );
}