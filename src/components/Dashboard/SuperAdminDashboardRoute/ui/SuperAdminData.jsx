import React, { useState } from "react";
import { monthlyData, weeklyData } from "../../../../Helpers/Helper";

const SuperAdminData = () => {
  const [view, setView] = useState("weekly");

  const currentData = view === "weekly" ? weeklyData : monthlyData;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-[#3b83f60e] rounded-lg shadow-[0_0_10px_black] p-4 border-l-2 border-blue-500">
        <p className="text-sm text-white mb-1">TOTAL DAYS PRESENT</p>
        <p className="text-4xl font-bold text-white mb-2">
          {currentData.summary.daysPresent}
        </p>
        <p className="text-sm text-gray-500">
          {view === "weekly" ? "This week" : "This month"}
        </p>
      </div>

      <div className="bg-[#3b83f60e] rounded-lg shadow-[0_0_10px_black] p-6 border-l-2  border-green-500">
        <p className="text-sm text-white mb-1">TOTAL HOURS WORKED</p>
        <p className="text-4xl font-bold text-white mb-2">
          {currentData.summary.hoursWorked}
        </p>
        <p className="text-sm text-gray-500">
          {view === "weekly" ? "This week" : "This month"}
        </p>
      </div>

      <div className="bg-[#3b83f60e] rounded-lg shadow-[0_0_10px_black] p-6 border-l-2  border-purple-500">
        <p className="text-sm text-white mb-1">TOTAL BREAKS</p>
        <p className="text-4xl font-bold text-white mb-2">
          {currentData.summary.breaks}
        </p>
        <p className="text-sm text-gray-500">
          {view === "weekly" ? "This week" : "This month"}
        </p>
      </div>

      <div className="bg-[#3b83f60e] rounded-lg shadow-[0_0_10px_black] p-6 border-l-2  border-orange-500">
        <p className="text-sm text-white mb-1">ATTENDANCE RATE</p>
        <p className="text-4xl font-bold text-white mb-2">
          {currentData.summary.attendance}
        </p>
        <p className="text-sm text-gray-500">Overall performance</p>
      </div>
    </div>
  );
};

export default SuperAdminData;
