import React from "react";
import { overallAttendance } from "../../../Helpers/Helper";

function AttendanceData({ view = "daily" }) {
  const d = overallAttendance || {
    presentToday: 0,
    absentToday: 0,
    lateArrivals: 0,
    onLeave: 0,
    attendanceRate: "0%",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Present Today */}
      <div className="relative bg-[rgba(59,131,246,0.06)] rounded-lg p-4 border-l-4 border-sky-500/80 shadow-sm">
        <p className="text-xs text-slate-300 mb-1 uppercase tracking-wider">
          Present Today
        </p>
        <p className="text-3xl md:text-4xl font-extrabold text-white mb-2">
          {d.presentToday}
        </p>
        <div className="h-2 w-full bg-white/6 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-sky-300/60"
            style={{ width: d.attendanceRate ? d.attendanceRate : "0%" }}
            aria-hidden
          />
        </div>
        <p className="text-xs text-slate-400">
          {view === "weekly" ? "This week" : view === "monthly" ? "This month" : "Today"} · {d.attendanceRate} attendance
        </p>
      </div>

      {/* Absent Today */}
      <div className="relative bg-[rgba(239,68,68,0.04)] rounded-lg p-4 border-l-4 border-rose-500/80 shadow-sm">
        <p className="text-xs text-slate-300 mb-1 uppercase tracking-wider">
          Absent Today
        </p>
        <p className="text-3xl md:text-4xl font-extrabold text-white mb-2">
          {d.absentToday}
        </p>
        <div className="h-2 w-full bg-white/6 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-rose-400/50"
            style={{ width: `${Math.min(100, (d.absentToday / Math.max(1, d.presentToday + d.absentToday)) * 100)}%` }}
            aria-hidden
          />
        </div>
        <p className="text-xs text-slate-400">{view === "weekly" ? "This week" : view === "monthly" ? "This month" : "Today"}</p>
      </div>

      {/* Late Arrivals */}
      <div className="relative bg-[rgba(34,197,94,0.04)] rounded-lg p-4 border-l-4 border-emerald-400/80 shadow-sm">
        <p className="text-xs text-slate-300 mb-1 uppercase tracking-wider">
          Late Arrivals
        </p>
        <p className="text-3xl md:text-4xl font-extrabold text-white mb-2">
          {d.lateArrivals}
        </p>
        <div className="h-2 w-full bg-white/6 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-emerald-300/60"
            style={{ width: `${Math.min(100, (d.lateArrivals / Math.max(1, d.presentToday)) * 100)}%` }}
            aria-hidden
          />
        </div>
        <p className="text-xs text-slate-400">↓ 2 from yesterday</p>
      </div>

      {/* On Leave */}
      <div className="relative bg-[rgba(59,130,246,0.03)] rounded-lg p-4 border-l-4 border-blue-400/80 shadow-sm">
        <p className="text-xs text-slate-300 mb-1 uppercase tracking-wider">
          On Leave
        </p>
        <p className="text-3xl md:text-4xl font-extrabold text-white mb-2">
          {d.onLeave}
        </p>
        <div className="h-2 w-full bg-white/6 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-blue-300/60"
            style={{ width: `${Math.min(100, (d.onLeave / Math.max(1, d.presentToday + d.onLeave)) * 100)}%` }}
            aria-hidden
          />
        </div>
        <p className="text-xs text-slate-400">Approved leave</p>
      </div>
    </div>
  );
}

export default AttendanceData;
