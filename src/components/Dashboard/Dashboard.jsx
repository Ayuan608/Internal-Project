import React, { useState } from "react";
import { Search } from "lucide-react";
import Charts from "./Chart";
import Data from "./Data";
import TeamLeaderStats from "./SuperAdminDashboardRoute/ui/TeamLeaderStats";
import { CustomizedDataGrid } from "./SuperAdminDashboardRoute/ui/data/CustomizedDataGrid";
import ChartUserByCountry from "./SuperAdminDashboardRoute/ui/ChartUserByCountry";
import { TeamStats } from "../../Helpers/Helper";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Daily");

  return (
    <>
      <div className="min-h-screen text-gray-100 bg-black">
        <div
          className=" top-0 rounded-lg p-2 z-auto backdrop-blur-3xl "
          style={{ zIndex: 9 }}
        >
          <div className="flex justify-start items-start mb-4">
            <div className="relative w-full max-w-[400px]">
              <input
                type="text"
                placeholder="Search, contacts, deals, campaigns..."
                className="bg-[#f5f6fa13] text-white rounded-full pl-9 pr-3 py-2 w-full text-sm focus:outline-none placeholder:text-white"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-white" />
            </div>
          </div>

          <div className="p-2 bg-[#282e3c38] rounded-xl mb-4">
            <div className="flex gap-2 mb-6 bg-[#f5f6fa09] max-w-[230px] p-1 rounded-full">
              {["Daily", "Week", "Month"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-[#d9d9d935] rounded-full text-white"
                      : "bg-transparent text-gray-400 hover:text-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <TeamLeaderStats title="Team Leader" data={TeamStats} />
          </div>
        </div>
        <div className="flex gap-6 mt-2 overflow-y-auto ">
          <Charts />
          <Data />
        </div>
        <p className="text-white text-lg font-semibold my-5">User Details</p>
        <div className="flex gap-5">
          <CustomizedDataGrid />
          <ChartUserByCountry />
        </div>
      </div>
    </>
  );
}
