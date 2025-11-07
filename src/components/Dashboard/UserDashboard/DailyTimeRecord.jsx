import { FolderUp, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SuperAdminData from "../SuperAdminDashboardRoute/ui/SuperAdminData";
import { getUserAttendance } from "../../../redux/attendenceSlice";
import { useAttendanceDashboard } from "../../hooks/useAttendanceHooks";

function DailyTimeRecord() {
  const dispatch = useDispatch();
  const [view, setView] = useState("weekly");
  const [isLoading, setIsLoading] = useState(false);
  const [componentError, setComponentError] = useState(null); // ✅ Renamed to avoid conflict

  const {
    attendanceList,
    formatBreaksDisplay,
    formatDate,
    formatTimeDisplay,
    stats,
    breakCounts,
    breakHistory,
  } = useAttendanceDashboard();

  const userId = useSelector((state) => state?.auth?.data?._id);

  // **FIXED: Calculate breaks for EACH DATE from breakHistory**
  const getBreaksForDate = (dateStr) => {
    if (!breakHistory || breakHistory.length === 0) return "0m 0s";

    const dateBreaks = breakHistory.filter(record => record.date === dateStr);
    if (dateBreaks.length === 0) return "0m 0s";

    const totalSeconds = dateBreaks.reduce((total, record) => {
      return total + (record.duration || 0);
    }, 0);

    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours > 0 && minutes > 0 && remainingSeconds > 0) {
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
      } else if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0 && remainingSeconds > 0) {
        return `${hours}h ${remainingSeconds}s`;
      } else {
        return `${hours}h`;
      }
    }

    // For less than 1 hour
    if (totalMinutes > 0 && remainingSeconds > 0) {
      return `${totalMinutes}m ${remainingSeconds}s`;
    } else if (totalMinutes > 0) {
      return `${totalMinutes}m`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // **FIXED: Calculate Total Breaks (Time + Count) - TODAY ONLY**
  const calculateTotalBreaks = () => {
    if (!stats || !breakCounts) return "0m (0 breaks)";

    const totalCount = breakCounts.smoke + breakCounts.wc + breakCounts.lunch;
    const totalTime = stats.totalAllBreaks || "0m";

    return `${totalTime} (${totalCount} ${totalCount === 1 ? "break" : "breaks"})`;
  };

  // **Calculate total breaks from localStorage**
  const calculateTotalBreakMinutes = () => {
    const data = JSON.parse(localStorage.getItem(`breakHistory_${userId}`)) || [];

    if (data.length === 0) {
      console.log("No break data found for user:", userId);
      return 0;
    }

    const totalBreakMinutes = data.reduce((total, item) => {
      if (item.endTime && item.startTime) {
        const start = new Date(item.startTime);
        const end = new Date(item.endTime);
        const diffMinutes = (end - start) / 1000 / 60;
        return total + diffMinutes;
      } else if (item.duration) {
        return total + (item.duration / 60);
      } else {
        return total;
      }
    }, 0);

    console.log(`Total break time for user ${userId}: ${totalBreakMinutes.toFixed(2)} minutes`);
    return totalBreakMinutes;
  };

  // Clear local storage if no user
  useEffect(() => {
    if (!userId) {
      const today = new Date().toDateString();
      localStorage.removeItem(`breakCounts_${today}`);
      localStorage.removeItem("breakHistory");
      localStorage.removeItem("dayOffRequests");
      console.log("Local storage cleared - no user");
    }
  }, [userId]);

  // Get date range for weekly/monthly
  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;

    if (view === "weekly") {
      const currentDay = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - currentDay);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  // Fetch attendance
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!userId) return;

      setIsLoading(true);
      setComponentError(null); // ✅ Use the renamed variable

      try {
        const { startDate, endDate } = getDateRange();
        await dispatch(
          getUserAttendance({
            userId,
            startDate,
            endDate,
            page: 1,
            limit: 100,
          })
        ).unwrap();
      } catch (err) {
        setComponentError(err?.message || "Failed to load attendance data"); // ✅ Use the renamed variable
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [dispatch, userId, view]);

  // Status color
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

  // Format time fallback
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

  // Status logic – Absent only after 6:20 PM
  const getStatus = (row) => {
    const today = new Date();
    const recordDate = new Date(row.date);
    const isToday = recordDate.toDateString() === today.toDateString();

    if (!row.clockIn) {
      if (isToday) {
        const currentMins = today.getHours() * 60 + today.getMinutes();
        if (currentMins >= 18 * 60 + 20) return "Absent";
      } else {
        return "Absent";
      }
      return "Absent";
    }

    if (!row.clockOut) {
      if (isToday) {
        const currentMins = today.getHours() * 60 + today.getMinutes();
        if (currentMins >= 18 * 60 + 20) return "Absent";
      }
      return "Active";
    }

    const match = (row.workingHours || "0h 0m").match(/(\d+)h/);
    const hours = match ? parseInt(match[1]) : 0;
    return hours >= 8 ? "Normal" : "Active";
  };

  // Punch In Display
  const formatPunchIn = (record) => {
    if (!record.clockIn) {
      const today = new Date();
      const recordDate = new Date(record.date);
      const isToday = recordDate.toDateString() === today.toDateString();

      if (isToday) {
        const currentMins = today.getHours() * 60 + today.getMinutes();
        if (currentMins >= 18 * 60 + 20) {
          return <span className="text-red-400">Absent</span>;
        }
      }
      return <span className="text-red-400">Absent</span>;
    }

    return formatTimeDisplay ? formatTimeDisplay(record.clockIn) : formatTime(record.clockIn);
  };

  // Punch Out Display
  const formatPunchOut = (record) => {
    if (!record.clockOut) {
      const today = new Date();
      const recordDate = new Date(record.date);
      const isToday = recordDate.toDateString() === today.toDateString();

      if (isToday) {
        const currentMins = today.getHours() * 60 + today.getMinutes();
        if (currentMins >= 18 * 60 + 20) {
          return <span className="text-red-400">Absent</span>;
        }
      }
      return <span className="text-orange-400">Not punched out</span>;
    }

    return formatTimeDisplay ? formatTimeDisplay(record.clockOut) : formatTime(record.clockOut);
  };

  const handleExport = () => {
    alert("Export functionality will be implemented with backend API");
  };

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

          {/* ✅ FIXED: Use the renamed error variable */}
          {componentError && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300">{componentError}</p>
            </div>
          )}

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
              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-4 py-2 rounded-lg border border-purple-500/30">
                <span className="text-sm font-medium">Total Breaks Today: </span>
                <span className="text-purple-300 font-bold">
                  {calculateTotalBreaks()}
                </span>
              </div>
              <span className="text-sm font-medium">
                Read Only - Cannot be edited
              </span>
            </div>
          </div>

          <SuperAdminData Totalbreak={calculateTotalBreakMinutes()} view={view} setView={setView} />

          {/* DTR Table */}
          <div className="bg-[#10101b94] border border-gray-500 rounded-lg shadow text-white">
            <div className="p-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                {view === "weekly" ? "Weekly DTR - Current Week" : "Monthly DTR - Current Month"}
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">DATE</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">PUNCH IN</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">BREAKS</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">PUNCH OUT</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">TOTAL HOURS</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">STATUS</th>
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
                    attendanceList.map((record, index) => {
                      const recordDate = new Date(record.date).toISOString().split('T')[0];

                      return (
                        <tr key={record._id || index} className="hover:bg-[#10101b]">
                          <td className="px-6 py-4 text-sm">{formatDate(record.date)}</td>
                          <td className="px-6 py-4 text-sm">{formatPunchIn(record)}</td>
                          <td className="px-6 py-4 text-sm">

                            {getBreaksForDate(recordDate)}
                          </td>
                          <td className="px-6 py-4 text-sm">{formatPunchOut(record)}</td>
                          <td className="px-6 py-4 text-sm">{record.workingHours || "0h 0m"}</td>
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {attendanceList?.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  Showing {attendanceList.length} records
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Bar */}
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