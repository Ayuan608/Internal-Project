// AttendanceTable.jsx
import React, { useMemo, useState } from "react";

/**
 * Props:
 * - data: array of employees (can be either employee objects or attendance objects)
 * - selectedMonth: Date (first day of month)
 * - daysInMonth: number
 * - monthLabel: string
 * - role: string
 */
const STATUS_MAP = {
    0: { label: "D", className: "bg-yellow-400 text-black" },   // Day
    1: { label: "N", className: "bg-green-400 text-black" },    // Night
    2: { label: "RD", className: "bg-blue-400 text-white" },    // Rest Day
    3: { label: "A", className: "bg-red-500 text-white" },      // Absent
    U: { label: "U", className: "bg-pink-500 text-white" },     // Undertime
    // Suspended (new)
    S: { label: "S", className: "bg-purple-600 text-white" },
};

const DEPARTMENTS = [
    "All Department",
    "CSR Department",
    "Deposit Department",
    "Withdraw Department",
    "Marketing Department",
];

function formatShortId(id) {
    return id ? id.slice(0, 8) : "N/A";
}

export default function AttendanceTable({
    data = [],
    selectedMonth = new Date(),
    daysInMonth = 30,
    monthLabel = "",
    role = "",
}) {
    const [selectedDept, setSelectedDept] = useState("All");

    const monthDaysArr = useMemo(() => {
        const arr = [];
        for (let d = 1; d <= daysInMonth; d++) arr.push(d);
        return arr;
    }, [daysInMonth]);

    // function to get pattern for an employee for the selected month
    const getPatternForEmp = (emp) => {
        // prefer emp.pattern if valid (array of statuses)
        if (Array.isArray(emp.pattern) && emp.pattern.length >= 1) {
            const base = emp.pattern.slice(0, daysInMonth);
            while (base.length < daysInMonth) base.push(3); // pad as Absent
            return base;
        }

        // if attendanceRecords exist, build array
        const records = emp.attendanceRecords || emp.records || emp.attendance || null;
        if (records && typeof records === "object") {
            const arr = [];
            for (let d = 1; d <= daysInMonth; d++) {
                const dd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), d)
                    .toISOString()
                    .slice(0, 10);
                const status = records[dd]; // e.g. "Present" / "Absent" / "Leave" / "Undertime" / "Suspended"
                if (!status) arr.push(3);
                else if (status === "Present" || status === "Normal") arr.push(0);
                else if (status === "Absent") arr.push(3);
                else if (status === "Leave") arr.push(2);
                else if (status === "Undertime") arr.push("U");
                else if (status === "Suspended") arr.push("S");
                else arr.push(3);
            }
            return arr;
        }

        // fallback: create month of 'A' (absent)
        return new Array(daysInMonth).fill(3);
    };

    // Normalize employee display fields safely
    const normalizeEmp = (emp) => {
        return {
            _id: emp._id || emp.id || emp.user?._id || emp.user?.id || "",
            FullName: emp.FullName || emp.fullName || emp.user?.FullName || emp.user?.fullName || emp.username || emp.user?.username || "Unknown",
            department: emp.department || emp.dept || emp.user?.department || emp.user?.dept || "Unknown",
            clockIn: emp.clockIn || emp.user?.clockIn || null,
            Shift: emp.Shift || emp.shift || emp.user?.Shift || emp.user?.shift || "-",
            status: emp.status || emp.alert || emp.user?.status || "N/A",
            patternSource: emp.pattern || emp.attendanceRecords || emp.attendance || emp.records || null,
            raw: emp,
        };
    };

    // Filtered employees by department
    const filteredData = useMemo(() => {
        const normalized = data.map(normalizeEmp);
        if (selectedDept === "All") return normalized;
        return normalized.filter((e) => {
            // compare normalized department strings
            return (e.department || "").toString() === selectedDept;
        });
    }, [data, selectedDept]);

    // CSV export of currently filtered data (month + pattern)
    const exportMonthCSV = () => {
        const headers = ["ID", "Name", "Department", "Status", "Pattern"];
        const rows = filteredData.map((emp) => {
            // build pattern textual
            const original = emp.raw;
            const patternArray = getPatternForEmp(original);
            const patternText = patternArray.map((p) => (STATUS_MAP[p] ? STATUS_MAP[p].label : p)).join("");
            return [
                `"${emp._id}"`,
                `"${emp.FullName}"`,
                `"${emp.department}"`,
                `"${emp.status}"`,
                `"${patternText}"`,
            ].join(",");
        });

        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance_${monthLabel || "month"}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getStatusColor = (status) => {
        if (!status) return "bg-slate-500/20 border-slate-500 text-slate-300";
        if (status === "Present" || status === "Normal") return "bg-emerald-500/20 border-emerald-500 text-emerald-300";
        if (status === "Absent") return "bg-red-500/20 border-red-500 text-red-300";
        if (status === "Leave") return "bg-amber-500/20 border-amber-500 text-amber-300";
        if (status === "Undertime") return "bg-pink-500/20 border-pink-500 text-pink-300";
        if (status === "Suspended") return "bg-purple-600/20 border-purple-500 text-purple-300";
        return "bg-slate-500/20 border-slate-500 text-slate-300";
    };

    return (
        <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">

                {/* LEFT — Title + Department side-by-side */}
                <div className="flex items-center gap-6">
                    <h2 className="text-lg font-semibold text-white">
                        Schedule & Attendance — {monthLabel}
                    </h2>

                    {/* Department Dropdown EXACT BAJU ME */}
                    <div className="w-52">
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="w-full px-4 py-2  border border-slate-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
                        >
                            {DEPARTMENTS.map((dept, idx) => (
                                <option key={idx} value={dept} className="bg-[#0d1b2a] text-gray-300">
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* RIGHT — Days + Export */}
                <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-400">Days: {daysInMonth}</div>
                    <button
                        onClick={exportMonthCSV}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
                    >
                        Export CSV
                    </button>
                </div>

            </div>




            {/* Department filter placed inside table header area (keeps layout consistent) */}


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
                        {filteredData.length ? (
                            filteredData.map((empNorm) => {
                                const orig = empNorm.raw;
                                const pattern = getPatternForEmp(orig);
                                return (
                                    <tr key={empNorm._id || empNorm.FullName} className="hover:bg-slate-800/30 transition">
                                        <td className="px-3 py-3 text-sm text-slate-300">{formatShortId(empNorm._id)}</td>
                                        <td className="px-3 py-3 text-sm">
                                            <div className="font-medium text-white">{empNorm.FullName}</div>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-slate-300">{empNorm.clockIn ? new Date(empNorm.clockIn).toLocaleTimeString() : "N/A"}</td>
                                        <td className="px-3 py-3 text-sm text-slate-300">{empNorm.Shift || "-"}</td>
                                        <td className="px-3 py-3 text-sm">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(empNorm.status)}`}
                                            >
                                                {empNorm.status || "N/A"}
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
                                <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                                    No employees found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-900/30 border-t border-slate-700/50 flex items-center gap-3 text-xs flex-wrap">
                <span className="text-slate-400 mr-2">Legend:</span>

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
                    <span className="w-3 h-3 rounded bg-blue-500"></span> Half Day
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-pink-500/20 border border-pink-500/30 text-pink-300">
                    <span className="w-3 h-3 rounded bg-pink-500"></span> Undertime
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-600/20 border border-purple-500/30 text-purple-300">
                    <span className="w-3 h-3 rounded bg-purple-500"></span> Suspended
                </span>
            </div>
        </div>
    );
}
