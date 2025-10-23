import { Download, FolderUp } from "lucide-react";
import React, { useCallback, useState } from "react";
import SuperAdminData from "../SuperAdminDashboardRoute/ui/SuperAdminData";
import { monthlyData, weeklyData } from "../../../Helpers/Helper";
import { useDispatch, useSelector } from "react-redux";

function DailyTimeRecord() {
  const [view, setView] = useState("weekly");

  const currentData = view === "weekly" ? weeklyData : monthlyData;

  const getStatusColor = (status) => {
    const colors = {
      Normal: "bg-green-100 text-green-800",
      Overbreak: "bg-yellow-100 text-yellow-800",
      "Missed Punch In": "bg-red-100 text-red-800",
      "Missed Punch Out": "bg-red-100 text-red-800",
      Absent: "bg-gray-200 text-gray-800",
      Partial: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Daily Time Record (DTR)
          </h1>
          <p className="text-gray-500">
            View your attendance history - Read Only
          </p>
        </div>

        {/* View Toggle and Export */}
        <div className="border border-gray-500 rounded-lg shadow p-4 mb-6 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setView("weekly")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                view === "weekly"
                  ? "bg-[#10131f] text-white shadow-md border"
                  : "text-white/70 border border-gray-300"
              }`}
            >
              Weekly View
            </button>
            <button
              onClick={() => setView("monthly")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                view === "monthly"
                  ? "bg-[#10131f] text-white shadow-md border"
                  : "text-white/70 border border-gray-300"
              }`}
            >
              Monthly View
            </button>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <span className="text-sm font-medium">
              Read Only - Cannot be edited
            </span>
          </div>
        </div>

        <SuperAdminData />

        {/* DTR Table */}
        <div className="bg-[#10101b94] border  border-gray-500 rounded-lg shadow text-white">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              {view === "weekly"
                ? "Weekly DTR - Current Week"
                : "Monthly DTR - October 2025"}
            </h2>
            <button className="bg-[#10101bd6] hover:bg-[#10101b] cursor-pointer text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border">
              <FolderUp /> Export File
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#3b83f60c]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    DATE
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    PUNCH IN
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    BREAKS
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    PUNCH OUT
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    TOTAL HOURS
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.records.map((record, index) => (
                  <tr key={index} className=" hover:bg-[#10101b]">
                    <td className="px-6 py-4 text-sm text-white">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {record.punchIn}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {record.breaks}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {record.punchOut}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {record.totalHours}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyTimeRecord;
