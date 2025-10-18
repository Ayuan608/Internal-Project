import React from "react";
import TeamLeaderStats from "./ui/TeamLeaderStats";
import { TeamStats } from "../../../Helpers/Helper";
import StatsPage from "./ui/StatsPage";
import ExampleIosSwitch from "./ui/Switch";
import PerformanceTrendChart from "../Chart";

const OverallAttendance = () => {
  return (
    <div className="mt-5">
      <div className="flex justify-between items-start">
        <StatsPage />
        <ExampleIosSwitch />
      </div>
      <TeamLeaderStats
        SecondaryTitle="Monitor attendance across all departments"
        title="Overall Attendance"
        data={TeamStats}
      />
      <div>
        <PerformanceTrendChart />
      </div>
    </div>
  );
};

export default OverallAttendance;
