import { FolderUp, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SuperAdminData from "../SuperAdminDashboardRoute/ui/SuperAdminData";
import { getUserAttendance } from "../../../redux/attendenceSlice";
import { useAttendanceDashboard } from "../../hooks/useAttendanceHooks"

function DailyTimeRecord() {
  const dispatch = useDispatch();
  const [view, setView] = useState("weekly");

  // ADD MISSING STATE
  const [isLoading, setIsLoading] = useState(false);

  // Use the attendance dashboard hook
  const {
    attendanceList,
    pagination,
    formatBreaksDisplay, // Use the formatted breaks display from hook
    formatDate,
    formatTimeDisplay,
    stats, // Get stats from hook
    breakCounts, // Get break counts from hook
  } = useAttendanceDashboard();

  const [error, setError] = useState(null);

  // Get userId from auth state
  const userId = useSelector(
    (state) => state?.auth?.data?._id
  );

  // Clear local storage breaks when user is deleted/not found
  useEffect(() => {
    if (!userId) {
      // Clear break-related local storage when no user is found
      const today = new Date().toDateString();
      localStorage.removeItem(`breakCounts_${today}`);
      localStorage.removeItem("breakHistory");
      localStorage.removeItem("dayOffRequests");
      console.log("Local storage cleared - no user found");
    }
  }, [userId]);

  // Calculate date ranges for weekly/monthly view
  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;

    if (view === "weekly") {
      // Get current week (Sunday to Saturday)
      const currentDay = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - currentDay);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else {
      // Get current month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Calculate total breaks from break counts and stats
  const calculateTotalBreaks = () => {
    if (!stats || !breakCounts) return "0m";

    // Calculate total break count
    const totalBreakCount = breakCounts.smoke + breakCounts.wc + breakCounts.lunch;

    // Get total break time from stats if available
    if (stats.totalAllBreaks && stats.totalAllBreaks !== "0m") {
      return `${stats.totalAllBreaks} (${totalBreakCount} breaks)`;
    }

    // Fallback calculation
    const smokeMinutes = parseInt(stats.totalSmokeBreak) || 0;
    const wcMinutes = parseInt(stats.totalWcBreak) || 0;
    const lunchMinutes = parseInt(stats.totalLunchBreak) || 0;
    const totalMinutes = smokeMinutes + wcMinutes + lunchMinutes;

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0
        ? `${hours}h ${minutes}m (${totalBreakCount} breaks)`
        : `${hours}h (${totalBreakCount} breaks)`;
    }

    return `${totalMinutes}m (${totalBreakCount} breaks)`;
  };

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const { startDate, endDate } = getDateRange();
        await dispatch(
          getUserAttendance({
            userId,
            startDate,
            endDate,
            page: 1,
            limit: 100
          })
        ).unwrap();
      } catch (err) {
        setError(err?.message || "Failed to load attendance data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [dispatch, userId, view]);

  const getStatusColor = (status) => {
    const colors = {
      Normal: "bg-green-100 text-green-800",
      Overbreak: "bg-yellow-100 text-yellow-800",
      "Missed Punch In": "bg-red-100 text-red-800",
      "Missed Punch Out": "bg-red-100 text-red-800",
      Absent: "bg-gray-200 text-gray-800",
      Active: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Format time (fallback if hook doesn't provide it)
  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "-";
    }
  };

  // UPDATED: Simple status logic - Only show absent after 6:20 PM if no punch in
  const getStatus = (row) => {
    const today = new Date();
    const recordDate = new Date(row.date);
    const isToday = recordDate.toDateString() === today.toDateString();

    // If no punch in
    if (!row.clockIn) {
      if (isToday) {
        const currentTime = today.getHours() * 60 + today.getMinutes(); // Current time in minutes
        const sixTwentyPM = 18 * 60 + 20; // 6:20 PM in minutes

        // Only show absent if it's past 6:20 PM and no punch in
        if (currentTime >= sixTwentyPM) {
          return "Absent";
        }
      }
      // For past dates with no punch in, show absent
      return "Absent";
    }

    // If punched in but no punch out
    if (!row.clockOut) {
      if (isToday) {
        const currentTime = today.getHours() * 60 + today.getMinutes();
        const sixTwentyPM = 18 * 60 + 20;

        // If it's past 6:20 PM and no punch out, show absent
        if (currentTime >= sixTwentyPM) {
          return "Absent";
        }
      }
      return "Active"; // Show active if punched in but not out (before 6:20 PM)
    }

    // Parse working hours
    const workingHours = row.workingHours || "0h 0m";
    const match = workingHours.match(/(\d+)h/);
    const hours = match ? parseInt(match[1]) : 0;

    if (hours >= 8) return "Normal";
    return "Active";
  };

  // UPDATED: Function to format punch in display
  const formatPunchIn = (record) => {
    if (!record.clockIn) {
      const today = new Date();
      const recordDate = new Date(record.date);
      const isToday = recordDate.toDateString() === today.toDateString();

      if (isToday) {
        const currentTime = today.getHours() * 60 + today.getMinutes();
        const sixTwentyPM = 18 * 60 + 20;

        // Only show absent after 6:20 PM
        if (currentTime >= sixTwentyPM) {
          return <span className="text-red-400">Absent</span>;
        }
      }
      // For past dates, show absent
      return <span className="text-red-400">Absent</span>;
    }

    return formatTimeDisplay ? formatTimeDisplay(record.clockIn) : formatTime(record.clockIn);
  };

  // UPDATED: Function to format punch out display
  const formatPunchOut = (record) => {
    if (!record.clockOut) {
      const today = new Date();
      const recordDate = new Date(record.date);
      const isToday = recordDate.toDateString() === today.toDateString();

      if (isToday) {
        const currentTime = today.getHours() * 60 + today.getMinutes();
        const sixTwentyPM = 18 * 60 + 20;

        // If it's past 6:20 PM and no punch out, show absent
        if (currentTime >= sixTwentyPM) {
          return <span className="text-red-400">Absent</span>;
        }
      }
      return <span className="text-orange-400">Not punched out</span>;
    }

    return formatTimeDisplay ? formatTimeDisplay(record.clockOut) : formatTime(record.clockOut);
  };

  // Export function (placeholder)
  const handleExport = () => {
    alert("Export functionality will be implemented with backend API");
  };

  // Debug log to check data
  useEffect(() => {
    console.log("DailyTimeRecord Data:", {
      stats,
      breakCounts,
      totalBreaks: calculateTotalBreaks(),
      attendanceListCount: attendanceList?.length,
      userId
    });
  }, [stats, breakCounts, attendanceList, userId]);

  return (
    <>
      <div className="min-h-screen p-4">
        <div className="max-w-full mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Daily Time Record (DTR)
            </h1>
            <p className="text-gray-500">
              View your attendance history - Read Only
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* No User ID Warning */}
          {!userId && (
            <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300">User ID not found. Please log in.</p>
            </div>
          )}

          <div className="rounded-lg shadow p-4 mb-6 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setView("weekly")}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${view === "weekly"
                  ? "bg-[#10131f] text-white shadow-md border"
                  : "text-white/70 border border-gray-300"
                  }`}
              >
                Weekly View
              </button>

              <button
                onClick={() => setView("monthly")}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${view === "monthly"
                  ? "bg-[#10131f] text-white shadow-md border"
                  : "text-white/70 border border-gray-300"
                  }`}
              >
                Monthly View
              </button>
            </div>

            {/* Total Breaks Display */}
            <div className="flex items-center gap-4 text-white/80">
              <div className="bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/30">
                <span className="text-sm font-medium">Total Breaks Today: </span>
                <span className="text-blue-300 font-bold">{calculateTotalBreaks()}</span>
              </div>
              <span className="text-sm font-medium">
                Read Only - Cannot be edited
              </span>
            </div>
          </div>

          <SuperAdminData view={view} setView={setView} />

          {/* DTR Table */}
          <div className="bg-[#10101b94] border border-gray-500 rounded-lg shadow text-white">
            <div className="p-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                {view === "weekly"
                  ? "Weekly DTR - Current Week"
                  : "Monthly DTR - Current Month"}
              </h2>

              <div className="flex items-center gap-4">
                {/* Break Summary */}
                <div className="bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/30">
                  <div className="text-sm text-purple-300">
                    <span className="font-medium">Break Summary: </span>
                    <span>Smoke: {breakCounts?.smoke || 0}/3 </span>
                    <span>WC: {breakCounts?.wc || 0}/3 </span>
                    <span>Lunch: {breakCounts?.lunch || 0}/1</span>
                  </div>
                </div>

                <button
                  onClick={handleExport}
                  className="bg-[#10101bd6] hover:bg-[#10101b] cursor-pointer text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border"
                >
                  <FolderUp /> Export File
                </button>
              </div>
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                        <p className="mt-2 text-gray-400">Loading attendance...</p>
                      </td>
                    </tr>
                  ) : !attendanceList || attendanceList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No attendance records found for this period
                      </td>
                    </tr>
                  ) : (
                    attendanceList.map((record, index) => (
                      <tr key={record._id || index} className="hover:bg-[#10101b]">
                        <td className="px-6 py-4 text-sm">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatPunchIn(record)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {stats.totalAllBreaks || "0m"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatPunchOut(record)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {record.workingHours || "0h 0m"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              getStatus(record)
                            )}`}
                          >
                            {getStatus(record)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Info */}
            {pagination && attendanceList?.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  Showing {attendanceList.length} of {pagination.total} records
                </span>
                <span className="text-sm text-gray-400">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>
            )}
          </div>

          {/* Additional Break Statistics */}
          {stats && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                <h3 className="text-blue-300 font-semibold mb-2">Break Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Break Time:</span>
                    <span className="text-white font-bold">{stats.totalAllBreaks || "0m"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Smoke Breaks:</span>
                    <span className="text-orange-300">{stats.totalSmokeBreak || "0m"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">WC Breaks:</span>
                    <span className="text-blue-300">{stats.totalWcBreak || "0m"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Lunch Breaks:</span>
                    <span className="text-purple-300">{stats.totalLunchBreak || "0m"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                <h3 className="text-green-300 font-semibold mb-2">Work Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Hours:</span>
                    <span className="text-white font-bold">{stats.totalHoursWorked || "0h 00m"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Today's Hours:</span>
                    <span className="text-green-300">{stats.todayWorkedHours || "0h 00m"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Days Worked:</span>
                    <span className="text-white">{stats.daysWorked || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                <h3 className="text-purple-300 font-semibold mb-2">Break Counts</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Smoke Breaks:</span>
                    <span className="text-orange-300">{breakCounts?.smoke || 0}/3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">WC Breaks:</span>
                    <span className="text-blue-300">{breakCounts?.wc || 0}/3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Lunch Breaks:</span>
                    <span className="text-purple-300">{breakCounts?.lunch || 0}/1</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="text-gray-300 font-semibold">Total:</span>
                    <span className="text-white font-bold">
                      {(breakCounts?.smoke || 0) + (breakCounts?.wc || 0) + (breakCounts?.lunch || 0)} breaks
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                <h3 className="text-yellow-300 font-semibold mb-2">Performance</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Efficiency:</span>
                    <span className="text-yellow-300">{stats.efficiency || "0%"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Current Streak:</span>
                    <span className="text-white">{stats.currentStreak || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Overtime:</span>
                    <span className="text-green-300">{stats.overtimeHours || "0h 00m"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INFO ALERT BAR */}
      <div className="border-l-2 pt-4 border-blue-200 text-white mx-4 bg-[rgba(59,131,246,0.06)] px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 mt-[2px]" />
        <p className="text-sm">
          <span className="font-semibold">Information:</span> This is your
          official Daily Time Record. All entries are automatically recorded by
          the system and cannot be modified. If you notice any discrepancies,
          please contact your Team Leader or HR department.
        </p>
      </div>
    </>
  );
}

export default DailyTimeRecord;