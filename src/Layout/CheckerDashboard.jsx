import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Coffee,
  Download,
  Search,
  XCircle,
} from "lucide-react";
import ExampleIosSwitch from "../components/Dashboard/SuperAdminDashboardRoute/ui/Switch";
import EmployeeSchedule from "../components/Dashboard/CheckerDashboard/Schedule";
import { useDispatch, useSelector } from "react-redux";
import { getAllAttendance } from "../redux/attendenceSlice";

// ✅ Status color styling
const getStatusColor = (status) => {
  const colors = {
    Normal: { bg: "#22c55e22", text: "#22c55e", border: "#22c55e" },
    Absent: { bg: "#ef444422", text: "#ef4444", border: "#ef4444" },
    Overbreak: { bg: "#f59e0b22", text: "#f59e0b", border: "#f59e0b" },
    "Missed Punch In": { bg: "#ec489922", text: "#ec4899", border: "#ec4899" },
    "Missed Punch Out": { bg: "#a855f722", text: "#a855f7", border: "#a855f7" },
    "On-break": { bg: "#3b82f622", text: "#3b82f6", border: "#3b82f6" },
    "Late Arrival": { bg: "#f59e0b22", text: "#f59e0b", border: "#f59e0b" },
  };
  return colors[status] || colors.Normal;
};

// ✅ Status icons
const getStatusIcon = (status) => {
  if (status === "Normal") return <CheckCircle size={14} />;
  if (status === "Absent") return <XCircle size={14} />;
  return <AlertCircle size={14} />;
};

const OverallAttendance = () => {
  const dispatch = useDispatch();
  const { allAttendance } = useSelector((state) => state.attendance);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 🔹 Fetch attendance data
  useEffect(() => {
    dispatch(
      getAllAttendance({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        department: filterDepartment !== "all" ? filterDepartment : undefined,
        page: 1,
        limit: 500,
      })
    );
  }, [dispatch, startDate, endDate, filterDepartment]);

  // 🔹 Apply logic for Late Arrival / On Break / Absent + search & filter
  const filteredData = useMemo(() => {
    const now = new Date();

    return allAttendance
      .map((record) => {
        let status = record.status;
        const punchIn = record.clockIn ? new Date(record.clockIn) : null;
        const punchOut = record.clockOut ? new Date(record.clockOut) : null;

        // Late Arrival → Punch in after 10:30 AM
        if (punchIn) {
          const limit = new Date(punchIn);
          limit.setHours(10, 30, 0, 0);
          if (punchIn > limit) {
            status = "Late Arrival";
          }
        }

        // On Break → Has punchIn but no punchOut after 1 PM
        if (punchIn && !punchOut) {
          const breakLimit = new Date(punchIn);
          breakLimit.setHours(13, 0, 0, 0); // 1:00 PM
          if (now > breakLimit) {
            status = "On-break";
          }
        }

        // Absent → No punchIn
        if (!punchIn) {
          status = "Absent";
        }

        // Otherwise Normal
        if (punchIn && punchOut && !["Late Arrival", "On-break"].includes(status)) {
          status = "Normal";
        }

        return { ...record, status };
      })
      .filter((record) => {
        const matchesDept =
          filterDepartment === "all" ||
          record.user?.department === filterDepartment;
        const matchesSearch =
          record.user?.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.user?.department?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesDept && matchesSearch;
      });
  }, [allAttendance, filterDepartment, searchTerm]);

  // 🔹 Stats calculation based on updated status
  const stats = useMemo(() => {
    const present = filteredData.filter(
      (r) => r.status === "Normal" || r.status === "Late Arrival"
    ).length;
    const late = filteredData.filter((r) => r.status === "Late Arrival").length;
    const absent = filteredData.filter((r) => r.status === "Absent").length;
    const onBreak = filteredData.filter((r) => r.status === "On-break").length;

    return [
      {
        label: "Present Today",
        value: present,
        icon: <CheckCircle size={20} />,
        color: "#22c55e",
      },
      {
        label: "Late Arrivals",
        value: late,
        icon: <Clock size={20} />,
        color: "#f59e0b",
      },
      {
        label: "Absent",
        value: absent,
        icon: <XCircle size={20} />,
        color: "#ef4444",
      },
      {
        label: "On-break",
        value: onBreak,
        icon: <Coffee size={20} />,
        color: "#3b82f6",
      },
    ];
  }, [filteredData]);

  // 🔹 CSV Export
  const exportToCSV = () => {
    const headers = ["Name", "Date", "Department", "Punch In", "Punch Out", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(
        (r) =>
          `${r.user?.FullName},${r.date},${r.user?.department},${r.clockIn},${r.clockOut},${r.status}`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();
  };

  // ✅ JSX
  return (
    <div className="mt-5">
      <div className="flex justify-end items-start">
        <ExampleIosSwitch />
      </div>

      <div className=" p-5 font-sans text-white">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Daily Time Record (DTR)</h1>
            <p className="text-sm text-slate-400">
              Tracking {filteredData.length} employees for today
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px] max-w-[400px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-10 py-2 bg-slate-800/40 border border-slate-800 rounded-lg text-sm outline-none placeholder:text-slate-500"
              />
            </div>

            {/* Department Filter */}
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm cursor-pointer outline-none"
            >
              <option value="all">All Departments</option>
              <option value="CSR">CSR</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Deposit">Deposit</option>
            </select>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[rgba(59,130,246,0.03)] border border-slate-700"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(250px,1fr))] mb-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="relative bg-slate-900/20 p-5 rounded-xl border border-slate-700 overflow-hidden"
              >
                <div className="absolute top-4 right-4 opacity-30" style={{ color: stat.color }}>
                  {React.cloneElement(stat.icon, { size: 40 })}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Table Section */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-700">
                  {["NAME", "DATE", "DEPARTMENT", "PUNCH IN", "PUNCH OUT", "STATUS"].map(
                    (th, i) => (
                      <th
                        key={i}
                        className="p-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide"
                      >
                        {th}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredData.map((record) => {
                  const color = getStatusColor(record.status);
                  return (
                    <tr
                      key={record._id}
                      className="border-b border-slate-800 transition-all bg-slate-900/30 hover:bg-slate-800/40 cursor-pointer"
                    >
                      <td className="p-4">
                        <div>
                          <div className="text-sm font-semibold">
                            {record.user?.FullName}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            ID: EM{String(record._id).slice(0, 8)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm">{record.user?.department}</td>
                      <td className="p-4 text-sm">
                        {record.clockIn
                          ? new Date(record.clockIn).toLocaleTimeString()
                          : "—"}
                      </td>
                      <td className="p-4 text-sm">
                        {record.clockOut
                          ? new Date(record.clockOut).toLocaleTimeString()
                          : "—"}
                      </td>
                      <td className="p-4">
                        <span
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border"
                          style={{
                            background: color.bg,
                            color: color.text,
                            borderColor: `${color.border}55`,
                          }}
                        >
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Schedule Component */}
      <EmployeeSchedule />
    </div>
  );
};

export default OverallAttendance;
