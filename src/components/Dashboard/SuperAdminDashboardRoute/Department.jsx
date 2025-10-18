import React from "react";
import TeamLeaderStats from "./ui/TeamLeaderStats";
import { TeamStats } from "../../../Helpers/Helper";
import ExampleIosSwitch from "./ui/Switch";
import StatsPage from "./ui/StatsPage";
import SuperAdminData from "./ui/SuperAdminData";

const Department = () => {
  return (
    <div className="mt-5">
      <div className="flex justify-between items-start">
        <StatsPage />
        <ExampleIosSwitch />
      </div>
      <TeamLeaderStats
        SecondaryTitle="Monitor and manage department quotas and performance"
        title="Department Management"
        data={TeamStats}
      />
      <SuperAdminData/>
    </div>
  );
};

export default Department;
