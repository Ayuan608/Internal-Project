import { FolderUp, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SuperAdminData from "../SuperAdminDashboardRoute/ui/SuperAdminData";
import { monthlyData, weeklyData } from "../../../Helpers/Helper";
import { getUserAttendance } from "../../../redux/attendenceSlice";

function DailyTimeRecord() {
  const dispatch = useDispatch();
  const [view, setView] = useState("weekly");

  // Get userId from auth state
  const userId = useSelector(
    (state) => state?.auth?.data?._id
  );

  // Get attendance data from redux store
  const { attendanceList, pagination } = useSelector(
    (state) => state.attendance
  );

  console.log(attendanceList)

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
      Partial: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return "-";
    }
  };

  // Format time
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

  // Calculate breaks display
  const formatBreaks = (row) => {
    const breaks = [];
    if (row.wcStart && row.wcEnd) breaks.push("WC");
    if (row.smokeStart && row.smokeEnd) breaks.push("Smoke");
    if (row.lunchStart && row.lunchEnd) breaks.push("Lunch");
    return breaks.length > 0 ? breaks.join(", ") : "-";
  };

  // Determine status
  const getStatus = (row) => {
    if (!row.clockIn) return "Absent";
    if (!row.clockOut) return "Missed Punch Out";

    // Parse working hours
    const workingHours = row.workingHours || "0h 0m";
    const match = workingHours.match(/(\d+)h/);
    const hours = match ? parseInt(match[1]) : 0;

    if (hours >= 8) return "Normal";
    if (hours >= 4) return "Partial";
    return "Partial";
  };

  // Export function (placeholder)
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

            <div className="flex items-center gap-2 text-white/80">
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

              <button
                onClick={handleExport}
                className="bg-[#10101bd6] hover:bg-[#10101b] cursor-pointer text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border"
              >
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
                          {formatTime(record.clockIn)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatBreaks(record)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {record.clockOut ? (
                            formatTime(record.clockOut)
                          ) : (
                            <span className="text-orange-400">Not punched out</span>
                          )}
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