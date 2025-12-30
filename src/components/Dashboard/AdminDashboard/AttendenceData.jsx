import React from "react";

function AttendanceData({ view = "daily", data = [] }) {
  // Calculate derived metrics
  const calculateAttendanceData = () => {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        totalUsers: 0,
        presentToday: 0,
        absentToday: 0,
        lateArrivals: 0,
        totalWorkingHours: "0h 0m",
        attendanceRate: "0%",
      };
    }

    const totalUsers = data.length;

    // 🔹 Get today's date (without time)
    const today = new Date();
    const todayDateString = today.toISOString().split("T")[0]; // e.g. "2025-10-29"

    // 🔹 Filter users who punched in today
    const presentUsers = data.filter((user) => {
      if (!user.clockIn) return false;
      const clockInDate = new Date(user.clockIn).toISOString().split("T")[0];
      return clockInDate === todayDateString;
    });

    const presentToday = presentUsers.length;

    // 🔹 Late arrivals (after 10:30 AM today)
    const lateArrivals = presentUsers.filter((user) => {
      const punchInTime = new Date(user.clockIn);
      const lateThreshold = new Date(punchInTime);
      lateThreshold.setHours(10, 30, 0, 0);
      return punchInTime > lateThreshold;
    }).length;

    // 🔹 Absent users (total - present today)
    const absentToday = totalUsers - presentToday;

    // 🔹 Total working hours
    let totalMinutes = 0;
    presentUsers.forEach((u) => {
      if (u.clockIn && u.clockOut) {
        const inTime = new Date(u.clockIn);
        const outTime = new Date(u.clockOut);
        const diff = (outTime - inTime) / (1000 * 60);
        totalMinutes += diff;
      }
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = Math.floor(totalMinutes % 60);
    const totalWorkingHours = `${totalHours}h ${remainingMinutes}m`;

    const attendanceRate =
      totalUsers > 0 ? `${Math.round((presentToday / totalUsers) * 100)}%` : "0%";

    return {
      totalUsers,
      presentToday,
      absentToday,
      lateArrivals,
      totalWorkingHours,
      attendanceRate,
    };
  };
  const d = calculateAttendanceData();

  const getTimePeriodText = () => {
    switch (view) {
      case "weekly":
        return "This Week";
      case "monthly":
        return "This Month";
      default:
        return "Today";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Users */}
      <div className="relative bg-[rgba(59,131,246,0.06)] rounded-lg p-4 border-l-4 border-sky-500/80 shadow-sm">
        <p className="text-xs text-slate-300 mb-1 uppercase tracking-wider">
          Total Employees
        </p>
        <p className="text-3xl font-extrabold text-white mb-2">
          {d.totalUsers}
        </p>
        <p className="text-xs text-slate-400">
          {getTimePeriodText()} · Total Workforce
        </p>
      </div>

      {/* Present Today */}
      <div className="relative bg-[rgba(34,197,94,0.06)] rounded-lg p-4 border-l-4 border-emerald-400/80 shadow-sm">
        <p className="text-xs text-slate-300 mb-1 uppercase tracking-wider">
          Present {getTimePeriodText()}
        </p>
        <p className="text-3xl font-extrabold text-white mb-2">
          {d.presentToday}
        </p>
        <p className="text-xs text-slate-400">
          {d.attendanceRate} attendance rate
        </p>
      </div>



      {/* Late Arrivals */}
      <div className="relative bg-[rgba(234,179,8,0.05)] rounded-lg p-4 border-l-4 border-yellow-400/80 shadow-sm">
        <p className="text-xs text-slate-300 mb-1 uppercase tracking-wider">
          Late Arrivals (after 10:30 AM)
        </p>
        <p className="text-3xl font-extrabold text-white mb-2">
          {d.lateArrivals}
        </p>
        <p className="text-xs text-slate-400">
          {d.presentToday > 0
            ? `${Math.round((d.lateArrivals / d.presentToday) * 100)}% of present`
            : "No present employees"}
        </p>
      </div>

      {/* Total Working Hours */}
      <div className="relative bg-[rgba(59,130,246,0.03)] rounded-lg p-4 border-l-4 border-blue-400/80 shadow-sm">
        <p className="text-xs text-slate-300 mb-1 uppercase tracking-wider">
          Total Working Hours
        </p>
        <p className="text-3xl font-extrabold text-white mb-2">
          {d.totalWorkingHours}
        </p>
        <p className="text-xs text-slate-400">
          Combined hours of all present employees
        </p>
      </div>
    </div>
  );
}

export default AttendanceData;
