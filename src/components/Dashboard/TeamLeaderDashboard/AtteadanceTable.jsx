// AttendanceTable.jsx
import React, { useMemo } from "react";

/**
 * Props:
 * - data: array of employees
 * - selectedMonth: Date (first day of month)
 * - daysInMonth: number
 * - monthLabel: string
 * - role: string
 */
const STATUS_MAP = {
    0: { label: "D", className: "bg-yellow-400 text-black" },   // Day
    1: { label: "N", className: "bg-green-400 text-black" },    // Night
    2: { label: "RD", className: "bg-blue-400 text-white" },   // Rest Day
    3: { label: "A", className: "bg-red-500 text-white" },     // Absent
    U: { label: "U", className: "bg-pink-500 text-white" },    // Undertime
};

function formatShortId(id) {
    return id ? id.slice(0, 8) : "N/A";
}

export default function AttendanceTable({ data = [], selectedMonth, daysInMonth, monthLabel, role }) {
    const monthDaysArr = useMemo(() => {
        const arr = [];
        for (let d = 1; d <= daysInMonth; d++) arr.push(d);
        return arr;
    }, [daysInMonth]);

    // function to get pattern for an employee for the selected month
    const getPatternForEmp = (emp) => {
        // prefer emp.pattern if valid
        if (Array.isArray(emp.pattern) && emp.pattern.length >= 1) {
            // ensure exact length = daysInMonth (truncate or pad)
            const base = emp.pattern.slice(0, daysInMonth);
            while (base.length < daysInMonth) base.push(3); // pad as Absent
            return base;
        }

        // if attendanceRecords exist, build array
        if (emp.attendanceRecords && typeof emp.attendanceRecords === "object") {
            const arr = [];
            for (let d = 1; d <= daysInMonth; d++) {
                const dd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), d).toISOString().slice(0, 10);
                const status = emp.attendanceRecords[dd]; // e.g. "Present" / "Absent" / "Leave" / "Undertime"
                if (!status) arr.push(3);
                else if (status === "Present") arr.push(0);
                else if (status === "Absent") arr.push(3);
                else if (status === "Leave") arr.push(2);
                else if (status === "Undertime") arr.push("U");
                else arr.push(3);
            }
            return arr;
        }

        // fallback: create month of 'A' (absent)
        return new Array(daysInMonth).fill(3);
    };

    return (
        <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Schedule & Attendance — {monthLabel}</h2>
                <div className="text-sm text-slate-400">Days: {daysInMonth}</div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[920px]">
                    <thead>
                        <tr className="bg-slate-900/60 border-b border-slate-700/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <th className="px-3 py-3 text-left">User Id</th>
                            <th className="px-3 py-3 text-left">Employee</th>
                            <th className="px-3 py-3 text-left">Schedule</th>
                            <th className="px-3 py-3 text-left">Shift</th>
                            <th className="px-3 py-3 text-left">Status</th>
                            <th className="px-3 py-3 text-left">Month Pattern</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {data.length ? (
                            data.map((emp) => {
                                const pattern = getPatternForEmp(emp);
                                return (
                                    <tr key={emp._id || emp.username} className="hover:bg-slate-800/30 transition">
                                        <td className="px-3 py-3 text-sm text-slate-300">{formatShortId(emp._id)}</td>
                                        <td className="px-3 py-3 text-sm">
                                            <div className="font-medium text-white">{emp.FullName || emp.username}</div>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-slate-300">{emp.clockIn ? new Date(emp.clockIn).toLocaleTimeString() : "N/A"}</td>
                                        <td className="px-3 py-3 text-sm text-slate-300">{emp.Shift || "-"}</td>
                                        <td className="px-3 py-3 text-sm">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${emp.status === "Present" ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : emp.status === "Absent" ? "bg-red-500/20 border-red-500 text-red-300" : emp.status === "Leave" ? "bg-amber-500/20 border-amber-500 text-amber-300" : emp.status === "Undertime" ? "bg-pink-500/20 border-pink-500 text-pink-300" : "bg-slate-500/20 border-slate-500 text-slate-300"}`}>
                                                {emp.status || "N/A"}
                                            </span>
                                        </td>

                                        <td className="px-3 py-3">
                                            <div className="flex gap-1 overflow-x-auto">
                                                {pattern.map((p, i) => {
                                                    const item = STATUS_MAP[p] || STATUS_MAP[3];
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`w-6 h-6 rounded text-[10px] font-semibold flex items-center justify-center cursor-pointer hover:opacity-80 transition ${item.className}`}
                                                            title={`Day ${i + 1}`}
                                                        >
                                                            {item.label}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-slate-400">No employees found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-900/30 border-t border-slate-700/50 flex items-center gap-3 text-xs">
                <span className="text-slate-400">Legend:</span>

                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-300">
                    <span className="w-3 h-3 rounded bg-yellow-400"></span> Day
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/20 border border-green-500/30 text-green-300">
                    <span className="w-3 h-3 rounded bg-green-400"></span> Night
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300">
                    <span className="w-3 h-3 rounded bg-blue-400"></span> Rest Day
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/20 border border-red-500/30 text-red-300">
                    <span className="w-3 h-3 rounded bg-red-500"></span> Absent
                </span>
                <span className="inline-flex gap-1 px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-blue-300 text-xs">
                   <span className="w-3 h-3 rounded bg-blue-500"></span>  Half Day
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-pink-500/20 border border-pink-500/30 text-pink-300">
                    <span className="w-3 h-3 rounded bg-pink-500"></span> Undertime
                </span>
            </div>
        </div>
    );
}
