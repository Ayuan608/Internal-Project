import React from "react";
import PageContainer from "./PageContainer";
import { ButtonGroup } from "../../CommonButton/Button";
import {
  TriangleAlert,
  Clock,
  Calendar,
  TrendingUp,
  Zap,
  Play,
  Square,
  X,
  CalendarX,
} from "lucide-react";
import RefreshIcon from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { useAttendanceDashboard } from "./../../hooks/useAttendanceHooks";

// Constants
const COLORS = ["#10b981", "#60a5fa", "#f59e0b", "#a855f7"];

// Stats card component
const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-[rgba(59,130,246,0.03)] border-l-2",
    green: "bg-[rgba(16,185,129,0.03)] border-l-2",
    orange: "bg-[rgba(245,158,11,0.03)] border-l-2",
    purple: "bg-[rgba(168,85,247,0.03)] border-l-2",
  };
  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`p-4 rounded-xl ${selectedColor} backdrop-blur-sm`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon size={20} className="opacity-80" />
        <span className="text-sm font-medium text-gray-300">{title}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
    </div>
  );
};

const AttendanceDashboardUI = ({
  userId,
  attendanceList,
  isLoading,
  activeTimer,
  timeLeft,
  breakCounts,
  breakHistory: _breakHistory,
  showDayOffModal,
  dayOffForm,
  error,
  currentStatus,
  stats,
  isSmokeBreakDisabled,
  isWcBreakDisabled,
  isLunchBreakDisabled,
  hasPunchedInToday, // Added prop
  handleRefresh,
  startBreak,
  endBreak,
  setShowDayOffModal,
  setDayOffForm,
  handleDayOffSubmit,
  formatTime,
  formatDate,
  formatTimeDisplay,
  calculateBreakTime,
  calculateWcBreakTime,
  calculateLunchBreakTime,
}) => {
  return (
    <PageContainer
      title="Attendance Dashboard"
      actions={
        <div className="flex items-center gap-2">
          <Tooltip title="Request Day Off">
            <IconButton onClick={() => setShowDayOffModal(true)}>
              <CalendarX className="text-white" />
              <p className="text-white text-base ms-2">Request DayOff</p>
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={isLoading || !userId}>
              <RefreshIcon className="text-white" />
            </IconButton>
          </Tooltip>
          <ButtonGroup />
        </div>
      }
    >
      <div className="flex flex-col 2xl:flex-row justify-between items-start gap-6">
        <div className="w-full 2xl:w-[65%]">
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg mb-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}
          {/* Current Status Banner */}
          <div className="mb-6 p-4 bg-[rgba(59,130,246,0.03)] border-l-2 text-white rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${currentStatus === "Ready"
                      ? "bg-gray-500"
                      : currentStatus === "Currently Working"
                        ? "bg-green-500"
                        : currentStatus.includes("Break")
                          ? "bg-orange-500"
                          : currentStatus === "Punched Out"
                            ? "bg-red-500"
                            : "bg-gray-500"
                    }`}
                ></div>
                <span className="text-white font-semibold">Current Status</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {currentStatus || "Unknown"}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-300">
              {currentStatus === "Ready" && "Ready to punch in for the day"}
              {currentStatus === "Currently Working" &&
                "You are currently working"}
              {currentStatus.includes("Break") && "You are on a break"}
              {currentStatus === "Punched Out" &&
                "You have completed your work for today"}
              {!["Ready", "Currently Working", "Punched Out"].includes(currentStatus) &&
                !currentStatus.includes("Break") &&
                "Status unknown"}
            </div>
          </div>

          {/* Break Timer Section */}
          {activeTimer && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-semibold">
                    {activeTimer.type.charAt(0).toUpperCase() +
                      activeTimer.type.slice(1)}{" "}
                    Break Timer
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatTime(timeLeft)}
                </div>
                <button
                  onClick={endBreak}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <Square size={16} />
                  End Break
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-300">
                Time remaining for your {activeTimer.type} break
              </div>
            </div>
          )}

          {/* Break Controls */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-[rgba(59,130,246,0.03)] border-l-2 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-red-500 font-semibold">Smoke Break</span>
                <span className="text-xs text-gray-400">
                  {breakCounts.smoke}/3 used today
                </span>
              </div>
              <button
                onClick={() => startBreak("smoke")}
                disabled={isSmokeBreakDisabled}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${isSmokeBreakDisabled
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "bg-[rgba(59,130,246,0.03)] border-gray-600 text-white"
                  }`}
              >
                <Play size={16} />
                {isSmokeBreakDisabled
                  ? "Cannot Start Break"
                  : "Start Smoke Break"}
              </button>
              {isSmokeBreakDisabled && (
                <div className="mt-2 text-xs text-sky-300 text-center">
                  {isSmokeBreakDisabled
                    ? breakCounts.smoke >= 3
                      ? "Limit reached"
                      : !hasPunchedInToday
                        ? "Punch in first"
                        : "Another break in progress"
                    : ""}
                </div>
              )}
            </div>
            <div className="p-4 bg-[rgba(59,130,246,0.03)] border-l-2 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-yellow-500 font-semibold">WC Break</span>
                <span className="text-xs text-gray-400">
                  {breakCounts.wc}/3 used today
                </span>
              </div>
              <button
                onClick={() => startBreak("wc")}
                disabled={isWcBreakDisabled}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${isWcBreakDisabled
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "bg-[rgba(59,130,246,0.03)] border-gray-600 text-white"
                  }`}
              >
                <Play size={16} />
                {isWcBreakDisabled ? "Cannot Start Break" : "Start WC Break"}
              </button>
              {isWcBreakDisabled && (
                <div className="mt-2 text-xs text-blue-300 text-center">
                  {isWcBreakDisabled
                    ? breakCounts.wc >= 3
                      ? "Limit reached"
                      : !hasPunchedInToday
                        ? "Punch in first"
                        : "Another break in progress"
                    : ""}
                </div>
              )}
            </div>
            <div className="p-4 bg-[rgba(59,130,246,0.03)] border-l-2 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-blue-500 font-semibold">Lunch Break</span>
                <span className="text-xs text-gray-400">
                  {breakCounts.lunch}/1 used today
                </span>
              </div>
              <button
                onClick={() => startBreak("lunch")}
                disabled={isLunchBreakDisabled}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${isLunchBreakDisabled
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "bg-[rgba(59,130,246,0.03)] border-gray-600 text-white"
                  }`}
              >
                <Play size={16} />
                {isLunchBreakDisabled
                  ? "Cannot Start Break"
                  : "Start Lunch Break"}
              </button>
              {isLunchBreakDisabled && (
                <div className="mt-2 text-xs text-purple-300 text-center">
                  {isLunchBreakDisabled
                    ? breakCounts.lunch >= 1
                      ? "Limit reached"
                      : !hasPunchedInToday
                        ? "Punch in first"
                        : "Another break in progress"
                    : ""}
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Calendar}
              title="Total Working Hours"
              value={stats.todayWorkedHours}
              subtitle={stats.todayStatus}
              color="blue"
            />
            <StatCard
              icon={Clock}
              title="Days Worked"
              value={stats.daysWorked.toString()}
              subtitle="Total days"
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              title="Avg Daily Hours"
              value={stats.avgDailyHours}
              subtitle="Average per day"
              color="orange"
            />
            <StatCard
              icon={Zap}
              title="Overtime"
              value={stats.overtimeHours}
              subtitle="Extra hours"
              color="purple"
            />
          </div>

          {/* Attendance Table */}
          <div className="border border-[#2d3748] rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto h-full">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#4a5568]">
                    <th className="px-4 py-3 text-left text-[#f7fafc] font-bold">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-[#f7fafc] font-bold">
                      Punch In
                    </th>
                    <th className="px-4 py-3 text-left text-[#f7fafc] font-bold">
                      Punch Out
                    </th>
                    <th className="px-4 py-3 text-center text-[#f7fafc] font-bold">
                      WC Break
                    </th>
                    <th className="px-4 py-3 text-center text-[#f7fafc] font-bold">
                      Smoke Break
                    </th>
                    <th className="px-4 py-3 text-center text-[#f7fafc] font-bold">
                      Lunch Break
                    </th>
                    <th className="px-4 py-3 text-left text-[#f7fafc] font-bold">
                      Working Hours
                    </th>
                  </tr>
                </thead>
                <tbody className="cursor-pointer">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
                        Loading...
                      </td>
                    </tr>
                  ) : (!Array.isArray(attendanceList) ||
                    attendanceList.length === 0) ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        No attendance data found
                      </td>
                    </tr>
                  ) : (
                    attendanceList.slice(0, 1).map((row) => {
                      const rowDate = new Date(row.date)
                        .toISOString()
                        .split("T")[0];
                      return (
                        <tr
                          key={row._id}
                          className="border-b border-[#2d3748] hover:bg-[#3b82f6]/10 transition-colors duration-200"
                        >
                          <td className="px-4 py-3 text-[#e2e8f0] font-medium">
                            {formatDate(row.date)}
                          </td>
                          <td className="px-4 py-3 text-[#e2e8f0]">
                            {formatTimeDisplay(row.clockIn)}
                          </td>
                          <td className="px-4 py-3 text-[#e2e8f0]">
                            {row.clockOut ? (
                              formatTimeDisplay(row.clockOut)
                            ) : (
                              <span className="text-orange-400">
                                Not punched out
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-[#60a5fa]">
                            {calculateWcBreakTime(
                              row.wcStart,
                              row.wcEnd,
                              rowDate
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-[#f59e0b]">
                            {calculateBreakTime(
                              row.smokeStart,
                              row.smokeEnd,
                              rowDate
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-[#a855f7]">
                            {calculateLunchBreakTime(
                              row.breakStart,
                              row.breakEnd,
                              rowDate
                            )}
                          </td>
                          <td className="px-4 py-3 text-[#10b981] font-semibold">
                            {row.workingHours || "0h 0m"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {!isLoading && attendanceList?.length > 0 && (
              <div className="bg-black px-6 py-3 border-t border-[#4a5568] flex justify-between items-center text-[#e2e8f0]">
                <span>Showing {attendanceList.length} records</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-[#3b82f6]/20 rounded hover:bg-[#3b82f6]/30">
                    Prev
                  </button>
                  <button className="px-3 py-1 bg-[#3b82f6]/20 rounded hover:bg-[#3b82f6]/30">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="2xl:w-[35%] w-full">
          <div className="p-6 bg-black border border-[#4a5568] rounded-xl shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">
              Personal Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-300">
                  {stats.currentStreak}
                </div>
                <div className="text-xs text-gray-400 mt-1">Day Streak</div>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-2xl font-bold text-green-300">
                  {stats.efficiency}
                </div>
                <div className="text-xs text-gray-400 mt-1">Efficiency</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-800/50">
                <div className="text-xl font-bold text-white-300">
                  {breakCounts.smoke}
                </div>
                <div className="text-xs text-gray-400 mt-1">Smoke</div>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-xl font-bold text-blue-300">
                  {breakCounts.wc}
                </div>
                <div className="text-xs text-gray-400 mt-1">WC</div>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-xl font-bold text-purple-300">
                  {breakCounts.lunch}
                </div>
                <div className="text-xs text-gray-400 mt-1">Lunch</div>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 font-medium">Total Hours</span>
                <span className="text-green-400 font-bold">
                  {stats.totalHoursWorked}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 font-medium">WC Breaks</span>
                <span className="text-blue-400 font-bold">
                  {stats.totalWcBreak}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 font-medium">Smoke Breaks</span>
                <span className="text-orange-400 font-bold">
                  {stats.totalSmokeBreak}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 font-medium">Lunch Breaks</span>
                <span className="text-purple-400 font-bold">
                  {stats.totalLunchBreak}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 font-medium">Last Punch In</span>
                <span className="text-purple-400 font-bold text-sm">
                  {stats.lastPunchIn}
                </span>
              </div>
            </div>
            {stats.pieData.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Time Breakdown
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {stats.pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-gray-400 mb-6">
                No time data available for chart
              </div>
            )}
            <div
              className={`p-3 rounded-lg flex items-center gap-3 ${stats.hasPendingPunchOut
                  ? "bg-yellow-500/20 border border-yellow-500/50"
                  : "bg-green-500/20 border border-green-500/20"
                }`}
            >
              <TriangleAlert
                size={20}
                className={
                  stats.hasPendingPunchOut
                    ? "text-yellow-400"
                    : "text-green-400"
                }
              />
              <span
                className={
                  stats.hasPendingPunchOut
                    ? "text-yellow-300 font-semibold"
                    : "text-green-300 font-semibold"
                }
              >
                {stats.hasPendingPunchOut
                  ? "Please punch out today!"
                  : "All caught up!"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Off Request Modal */}
      {showDayOffModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[rgba(59,130,246,0.03)] backdrop-blur-md border border-[#4a5568] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Request Day Off</h3>
              <button
                onClick={() => setShowDayOffModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleDayOffSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={dayOffForm.date}
                  onChange={(e) =>
                    setDayOffForm({ ...dayOffForm, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={dayOffForm.reason}
                  onChange={(e) =>
                    setDayOffForm({ ...dayOffForm, reason: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  rows={4}
                  placeholder="Please provide a reason for your day off request..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Attachment Type
                </label>
                <select
                  value={dayOffForm.attachmentType}
                  onChange={(e) =>
                    setDayOffForm({
                      ...dayOffForm,
                      attachmentType: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-none"
                >
                  <option value="medical">Medical Certificate</option>
                  <option value="personal">Personal Leave</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDayOffModal(false)}
                  className="flex-1 px-4 py-2 hover:bg-[rgba(59,130,246,0.03)] border-gray-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default function AttendanceDashboard() {
  const hookProps = useAttendanceDashboard();
  return <AttendanceDashboardUI {...hookProps} />;
}