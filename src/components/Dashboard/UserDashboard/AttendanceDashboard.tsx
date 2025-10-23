import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import PageContainer from "./PageContainer";
import { getUserAttendance } from "../../../redux/attendenceSlice";
import { ButtonGroup } from "../../CommonButton/Button";
import {
  TriangleAlert,
  Clock,
  Calendar,
  TrendingUp,
  Zap,
  Play,
  Square,
} from "lucide-react";
import RefreshIcon from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

const INITIAL_PAGE_SIZE = 10;

const COLORS = ["#10b981", "#60a5fa", "#f59e0b"];

export default function AttendanceDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userId = useSelector(
    (state: { auth: { data?: { _id?: string } } }) => state?.auth?.data?._id
  );

  const { attendanceList, isLoading } = useSelector(
    (state: any) => state.attendance
  );

  // Timer states
  const [activeTimer, setActiveTimer] = useState<{
    type: "smoke" | "wc";
    startTime: Date;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds

  // Break counts with daily reset
  const [breakCounts, setBreakCounts] = useState<{
    smoke: number;
    wc: number;
    lastReset: string;
  }>(() => {
    const today = new Date().toDateString();
    return { smoke: 0, wc: 0, lastReset: today };
  });

  // Check and reset break counts daily
  useEffect(() => {
    const today = new Date().toDateString();
    if (breakCounts.lastReset !== today) {
      setBreakCounts({ smoke: 0, wc: 0, lastReset: today });
    }
  }, [breakCounts.lastReset]);

  // Timer countdown effect
  useEffect(() => {
    if (!activeTimer) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setActiveTimer(null);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  // Format time for display (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if user has punched out today
  const hasPunchedOutToday = React.useMemo(() => {
    if (!Array.isArray(attendanceList) || attendanceList.length === 0) {
      return false;
    }

    const today = new Date().toISOString().split("T")[0];
    const todayRecord = attendanceList.find((row: any) => {
      const rowDate = new Date(row.date).toISOString().split("T")[0];
      return rowDate === today;
    });

    return todayRecord && todayRecord.clockOut;
  }, [attendanceList]);

  // Check if user has punched in today
  const hasPunchedInToday = React.useMemo(() => {
    if (!Array.isArray(attendanceList) || attendanceList.length === 0) {
      return false;
    }

    const today = new Date().toISOString().split("T")[0];
    const todayRecord = attendanceList.find((row: any) => {
      const rowDate = new Date(row.date).toISOString().split("T")[0];
      return rowDate === today;
    });

    return todayRecord && todayRecord.clockIn;
  }, [attendanceList]);

  // Calculate current status
  const currentStatus = React.useMemo(() => {
    if (hasPunchedOutToday) {
      return "Punched Out";
    }
    if (activeTimer) {
      return `On ${activeTimer.type === "smoke" ? "Smoke Break" : "WC Break"}`;
    }
    if (hasPunchedInToday) {
      return "Currently Working";
    }
    return "Ready";
  }, [hasPunchedOutToday, activeTimer, hasPunchedInToday]);

  // Start break timer
  const startBreak = (type: "smoke" | "wc") => {
    // Check if user has already punched out today
    if (hasPunchedOutToday) {
      alert(
        "You have already punched out for today. Breaks are not allowed after punch out."
      );
      return;
    }

    // Check if already have 3 breaks today
    const todayBreaks = breakCounts[type];

    if (todayBreaks >= 3) {
      alert(
        `Maximum ${
          type === "smoke" ? "smoke" : "WC"
        } breaks (3) reached for today! Please wait until tomorrow.`
      );
      return;
    }

    // Check if another timer is active
    if (activeTimer) {
      alert(
        `Please finish your ${
          activeTimer.type === "smoke" ? "smoke" : "WC"
        } break first!`
      );
      return;
    }

    setActiveTimer({ type, startTime: new Date() });
    setTimeLeft(300); // 5 minutes
  };

  // End break timer
  const endBreak = () => {
    if (!activeTimer) return;

    const breakType = activeTimer.type;
    setBreakCounts((prev) => ({
      ...prev,
      [breakType]: prev[breakType] + 1,
    }));

    setActiveTimer(null);
    setTimeLeft(300);

    // Here you would typically dispatch an action to save the break data
    console.log(`${breakType} break completed`);
  };

  // Real-time statistics calculation
  const calculateStats = React.useMemo(() => {
    if (!Array.isArray(attendanceList) || attendanceList.length === 0) {
      return {
        // Today's Stats
        todayWorkedHours: "0h 0m",
        todayStatus: "No data",

        // Overall Stats
        daysWorked: 0,
        totalHoursWorked: "0h 0m",
        avgDailyHours: "0h 0m",
        overtimeHours: "0h 0m",

        // Breakdown
        totalWorkTime: "0h 0m",
        totalWcBreak: `${breakCounts.wc * 5} min`,
        totalSmokeBreak: `${breakCounts.smoke * 5} min`,
        hasPendingPunchOut: false,

        // Additional Metrics
        currentStreak: 0,
        lastPunchIn: "No data",
        efficiency: "0%",

        // Pie Data
        pieData: [],
      };
    }

    let totalWorkMinutes = 0;
    let totalWcMinutes = breakCounts.wc * 5; // Add current session breaks
    let totalSmokeMinutes = breakCounts.smoke * 5; // Add current session breaks
    let pendingPunchOutToday = false;
    let daysWithWork = 0;
    let todayWorkMinutes = 0;
    const today = new Date().toISOString().split("T")[0];
    let lastPunchInTime: Date | null = null;
    let consecutiveDays = 0;
    const last7Days = new Set();

    // Sort by date to calculate streak
    const sortedAttendance = [...attendanceList].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate various metrics
    attendanceList.forEach((row: any) => {
      const rowDate = new Date(row.date).toISOString().split("T")[0];

      // Working hours calculation
      if (row.workingHours) {
        const match = row.workingHours.match(/(\d+)h (\d+)m/);
        if (match) {
          const minutes = parseInt(match[1]) * 60 + parseInt(match[2]);
          totalWorkMinutes += minutes;
          daysWithWork++;

          // Today's work
          if (rowDate === today) {
            todayWorkMinutes = minutes;
          }
        }
      }

      // Break calculations
      if (row.wcStart && row.wcEnd) {
        try {
          const start = new Date(row.wcStart);
          const end = new Date(row.wcEnd);
          const diff = Math.floor(
            (end.getTime() - start.getTime()) / (1000 * 60)
          );
          totalWcMinutes += diff;
        } catch {}
      }

      if (row.smokeStart && row.smokeEnd) {
        try {
          const start = new Date(row.smokeStart);
          const end = new Date(row.smokeEnd);
          const diff = Math.floor(
            (end.getTime() - start.getTime()) / (1000 * 60)
          );
          totalSmokeMinutes += diff;
        } catch {}
      }

      // Pending punch out check
      if (!row.clockOut && rowDate === today) {
        pendingPunchOutToday = true;
      }

      if (
        row.clockIn &&
        (!lastPunchInTime || new Date(row.clockIn) > lastPunchInTime)
      ) {
        lastPunchInTime = new Date(row.clockIn);
      }

      // Track last 7 days for streak calculation
      const date = new Date(row.date);
      const dateStr = date.toISOString().split("T")[0];
      last7Days.add(dateStr);
    });

    // Calculate streak
    const todayDate = new Date();
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(todayDate.getDate() - i);
      const checkDateStr = checkDate.toISOString().split("T")[0];
      if (last7Days.has(checkDateStr)) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    // Formatting functions
    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins.toString().padStart(2, "0")}m`;
    };

    const formatShortTime = (minutes: number) => {
      const hours = (minutes / 60).toFixed(1);
      return `${hours}h`;
    };

    // Calculate averages and overtime
    const avgDailyMinutes =
      daysWithWork > 0 ? totalWorkMinutes / daysWithWork : 0;
    const standardHoursPerDay = 8 * 60; // 8 hours in minutes
    const overtimeMinutes = Math.max(
      0,
      totalWorkMinutes - daysWithWork * standardHoursPerDay
    );

    // Efficiency calculation (work time vs total time)
    const totalBreakMinutes = totalWcMinutes + totalSmokeMinutes;
    const totalAvailableMinutes = totalWorkMinutes + totalBreakMinutes;
    const efficiency =
      totalAvailableMinutes > 0
        ? Math.round((totalWorkMinutes / totalAvailableMinutes) * 100)
        : 0;

    // Today's status
    let todayStatus = "No work today";
    if (todayWorkMinutes > 0) {
      if (pendingPunchOutToday) {
        todayStatus = "Working...";
      } else if (todayWorkMinutes >= standardHoursPerDay) {
        todayStatus = "Completed";
      } else {
        todayStatus = "Partial";
      }
    }

    const lastPunchInFormatted = lastPunchInTime
      ? new Date(lastPunchInTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "No data";

    // Pie data for chart
    const pieData = [
      { name: "Work", value: totalWorkMinutes },
      { name: "WC Break", value: totalWcMinutes },
      { name: "Smoke Break", value: totalSmokeMinutes },
    ].filter((item) => item.value > 0);

    return {
      // Today's Stats
      todayWorkedHours: formatTime(todayWorkMinutes),
      todayStatus,

      // Overall Stats
      daysWorked: daysWithWork,
      totalHoursWorked: formatTime(totalWorkMinutes),
      avgDailyHours: formatShortTime(avgDailyMinutes),
      overtimeHours: formatTime(overtimeMinutes),

      // Breakdown
      totalWorkTime: formatTime(totalWorkMinutes),
      totalWcBreak: `${totalWcMinutes} min`,
      totalSmokeBreak: `${totalSmokeMinutes} min`,
      hasPendingPunchOut: pendingPunchOutToday,

      // Additional Metrics
      currentStreak: consecutiveDays,
      lastPunchIn: lastPunchInFormatted,
      efficiency: `${efficiency}%`,

      // Pie Data
      pieData,
    };
  }, [attendanceList, breakCounts]);

  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setError(null);
    if (!userId) return;

    try {
      await dispatch(
        (getUserAttendance as any)({
          userId,
          page: 1,
          limit: INITIAL_PAGE_SIZE,
        }) as any
      ).unwrap();
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load attendance data";
      setError(errorMessage);
    }
  }, [dispatch, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData();
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "-";
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);
      return `${day}/${month}/${year}`;
    } catch {
      return "-";
    }
  };

  const formatTimeDisplay = (timeStr: any) => {
    if (!timeStr) return "-";
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "-";
    }
  };

  const calculateBreakTime = (start: any, end: any) => {
    if (!start || !end) return "-";
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "-";
      const diff = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60)
      );
      return `${diff} min`;
    } catch {
      return "-";
    }
  };

  // Stats card component
  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = "blue",
  }: {
    icon: any;
    title: string;
    value: string;
    subtitle?: string;
    color?: string;
  }) => {
    const colorClasses: Record<string, string> = {
      blue: "bg-[rgba(59,130,246,0.03)] border-l-2",
      green: "bg-[rgba(59,130,246,0.03)] border-l-2",
      orange: "bg-[rgba(59,130,246,0.03)] border-l-2",
      purple: "bg-[rgba(59,130,246,0.03)] border-l-2",
    };

    const selectedColor = colorClasses[color] || colorClasses.blue;

    return (
      <div className={`p-4 rounded-xl  ${selectedColor} backdrop-blur-sm`}>
        <div className="flex items-center gap-3 mb-2">
          <Icon size={20} className="opacity-80" />
          <span className="text-sm font-medium text-gray-300">{title}</span>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
      </div>
    );
  };

  // Check if break buttons should be disabled
  const isSmokeBreakDisabled =
    activeTimer !== null || breakCounts.smoke >= 3 || hasPunchedOutToday;
  const isWcBreakDisabled =
    activeTimer !== null || breakCounts.wc >= 3 || hasPunchedOutToday;

  return (
    <PageContainer
      title="Attendance Dashboard"
      actions={
        <div className="flex items-center gap-2">
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={isLoading || !userId}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <ButtonGroup />
        </div>
      }
    >
      <div className="flex justify-between items-start gap-6">
        <div>
          {!userId ? (
            <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg mb-4">
              <p className="text-yellow-300">
                User ID not found. Please log in.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg mb-4">
              <p className="text-red-300">{error}</p>
            </div>
          ) : null}

          {/* Current Status Banner */}
          <div>
            <div className="mb-6 p-4 bg-[rgba(59,130,246,0.03)] border-l-2 text-white rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full animate-pulse ${
                      currentStatus === "Ready"
                        ? "bg-gray-500"
                        : currentStatus === "Currently Working"
                        ? "bg-green-500"
                        : currentStatus.includes("Break")
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-white font-semibold">
                    Current Status
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {currentStatus}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-300">
                {currentStatus === "Ready" && "Ready to punch in for the day"}
                {currentStatus === "Currently Working" &&
                  "You are currently working"}
                {currentStatus.includes("Break") && "You are on a break"}
                {currentStatus === "Punched Out" &&
                  "You have completed your work for today"}
              </div>
            </div>

            {/* Break Timer Section */}
            {activeTimer && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-semibold">
                      {activeTimer.type === "smoke"
                        ? "Smoke Break"
                        : "WC Break"}{" "}
                      Timer
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
                  Time remaining for your{" "}
                  {activeTimer.type === "smoke" ? "smoke" : "WC"} break
                </div>
              </div>
            )}

            {/* Break Controls */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-[rgba(59,130,246,0.03)] border-l-2 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sky-300 font-semibold">
                    Smoke Break
                  </span>
                  <span className="text-xs text-gray-400">
                    {breakCounts.smoke}/3 used today
                  </span>
                </div>
                <button
                  onClick={() => startBreak("smoke")}
                  disabled={isSmokeBreakDisabled}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                    isSmokeBreakDisabled
                      ? "bg-gray-600 cursor-not-allowed text-gray-400"
                      : "bg-[rgba(59,130,246,0.03)] border_gray text-white"
                  }`}
                >
                  <Play size={16} />
                  {hasPunchedOutToday
                    ? "Punch Out Completed"
                    : breakCounts.smoke >= 3
                    ? "Daily Limit Reached"
                    : "Start Smoke Break"}
                </button>
                {hasPunchedOutToday ? (
                  <div className="mt-2 text-xs text-sky-300 text-center">
                    Breaks disabled after punch out
                  </div>
                ) : breakCounts.smoke >= 3 ? (
                  <div className="mt-2 text-xs text-sky-300 text-center">
                    Limit resets tomorrow
                  </div>
                ) : null}
              </div>

              <div className="p-4 bg-[rgba(59,130,246,0.03)] border-l-2 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-blue-300 font-semibold">WC Break</span>
                  <span className="text-xs text-gray-400">
                    {breakCounts.wc}/3 used today
                  </span>
                </div>
                <button
                  onClick={() => startBreak("wc")}
                  disabled={isWcBreakDisabled}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                    isWcBreakDisabled
                      ? "bg-gray-600 cursor-not-allowed text-gray-400"
                      : "bg-[rgba(59,130,246,0.03)] border_gray text-white"
                  }`}
                >
                  <Play size={16} />
                  {hasPunchedOutToday
                    ? "Punch Out Completed"
                    : breakCounts.wc >= 3
                    ? "Daily Limit Reached"
                    : "Start WC Break"}
                </button>
                {hasPunchedOutToday ? (
                  <div className="mt-2 text-xs text-blue-300 text-center">
                    Breaks disabled after punch out
                  </div>
                ) : breakCounts.wc >= 3 ? (
                  <div className="mt-2 text-xs text-blue-300 text-center">
                    Limit resets tomorrow
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Real-time Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Calendar}
              title="Total Working Hours"
              value={calculateStats.todayWorkedHours}
              subtitle={calculateStats.todayStatus}
              color="blue"
            />
            <StatCard
              icon={Clock}
              title="Days Worked"
              value={calculateStats.daysWorked.toString()}
              subtitle="Total days"
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              title="Avg Daily Hours"
              value={calculateStats.avgDailyHours}
              subtitle="Average per day"
              color="orange"
            />
            <StatCard
              icon={Zap}
              title="Overtime"
              value={calculateStats.overtimeHours}
              subtitle="Extra hours"
              color="purple"
            />
          </div>

          <div className="border border-[#2d3748] rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto h-[550px]">
              <table className="w-full text-sm">
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
                      WC
                    </th>
                    <th className="px-4 py-3 text-center text-[#f7fafc] font-bold">
                      Smoke
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
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
                        Loading...
                      </td>
                    </tr>
                  ) : !Array.isArray(attendanceList) ||
                    attendanceList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        No attendance data found
                      </td>
                    </tr>
                  ) : (
                    attendanceList.map((row) => (
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
                          {calculateBreakTime(row.wcStart, row.wcEnd)}
                        </td>
                        <td className="px-4 py-3 text-center text-[#f59e0b]">
                          {calculateBreakTime(row.smokeStart, row.smokeEnd)}
                        </td>
                        <td className="px-4 py-3 text-[#10b981] font-semibold">
                          {row.workingHours || "0h 0m"}
                        </td>
                      </tr>
                    ))
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

        {/* Enhanced Stats Sidebar */}
        <div className="w-[35%]">
          <div className="p-6 bg-black border border-[#4a5568] rounded-xl shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">
              Personal Metrics
            </h3>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-300">
                  {calculateStats.currentStreak}
                </div>
                <div className="text-xs text-gray-400 mt-1">Day Streak</div>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-2xl font-bold text-green-300">
                  {calculateStats.efficiency}
                </div>
                <div className="text-xs text-gray-400 mt-1">Efficiency</div>
              </div>
            </div>

            {/* Break Counts */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-800/50">
                <div className="text-2xl font-bold text-white-300">
                  {breakCounts.smoke}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Smoke Breaks Today
                </div>
                {hasPunchedOutToday ? (
                  <div className="text-xs text-sky-300 mt-1">
                    Day Completed
                  </div>
                ) : breakCounts.smoke >= 3 ? (
                  <div className="text-xs text-orange-300 mt-1">
                    Limit Reached
                  </div>
                ) : null}
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-300">
                  {breakCounts.wc}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  WC Breaks Today
                </div>
                {hasPunchedOutToday ? (
                  <div className="text-xs text-blue-300 mt-1">
                    Day Completed
                  </div>
                ) : breakCounts.wc >= 3 ? (
                  <div className="text-xs text-blue-300 mt-1">
                    Limit Reached
                  </div>
                ) : null}
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 font-medium">Total Hours</span>
                <span className="text-green-400 font-bold">
                  {calculateStats.totalHoursWorked}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 font-medium">WC Breaks</span>
                <span className="text-blue-400 font-bold">
                  {calculateStats.totalWcBreak}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 font-medium">Smoke Breaks</span>
                <span className="text-orange-400 font-bold">
                  {calculateStats.totalSmokeBreak}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 font-medium">Last Punch In</span>
                <span className="text-purple-400 font-bold text-sm">
                  {calculateStats.lastPunchIn}
                </span>
              </div>
            </div>

            {/* Pie Chart for Time Breakdown */}
            {calculateStats.pieData.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Time Breakdown
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={calculateStats.pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {calculateStats.pieData.map((entry, index) => (
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

            {/* Status Alert */}
            <div
              className={`p-3 rounded-lg flex items-center gap-3 ${
                calculateStats.hasPendingPunchOut
                  ? "bg-yellow-500/20 border border-yellow-500/50"
                  : "bg-green-500/20 border border-green-500/50"
              }`}
            >
              <TriangleAlert
                size={20}
                className={
                  calculateStats.hasPendingPunchOut
                    ? "text-yellow-400"
                    : "text-green-400"
                }
              />
              <span
                className={`font-semibold ${
                  calculateStats.hasPendingPunchOut
                    ? "text-yellow-300"
                    : "text-green-300"
                }`}
              >
                {calculateStats.hasPendingPunchOut
                  ? "Please punch out today!"
                  : "All caught up!"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
