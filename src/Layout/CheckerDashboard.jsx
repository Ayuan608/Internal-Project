import React, { useMemo, useRef, useState } from "react";

import { AlertCircle, Calendar, CheckCircle, Clock, Coffee, Download, Search, XCircle } from "lucide-react";
import ExampleIosSwitch from "../components/Dashboard/SuperAdminDashboardRoute/ui/Switch";
import EmployeeSchedule from './../components/Dashboard/CheckerDashboard/Schedule';
import { attendanceData } from "../Helpers/Helper";

const getScheduleColor = (value) => {
  switch (value) {
    case "D":
      return "bg-yellow-200 text-yellow-900";
    case "N":
      return "bg-green-200 text-green-900";
    case "RD":
      return "bg-red-400 text-white";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const OverallAttendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("All");
  const [filterDepartment, setFilterDepartment] = useState("all");

  // Filter data based on search, section, and department
  const filteredData = useMemo(() => {
    return attendanceData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSection =
        selectedSection === "All" || item.department === selectedSection;
      const matchesDepartment =
        filterDepartment === "all" || item.department === filterDepartment;

      return matchesSearch && matchesSection && matchesDepartment;
    });
  }, [searchTerm, selectedSection, filterDepartment]);

  const getAvatar = (name) => {
    const letters = name.replace(/\s+/g, '');
    return letters.charAt(0) + letters.charAt(letters.length - 1);
  };

  const getStatusLabel = (status) => status;

  const getStatusIcon = (status) => {
    if (status === 'Normal') return <CheckCircle size={14} />;
    if (status === 'Absent') return <XCircle size={14} />;
    return <AlertCircle size={14} />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Normal': { bg: '#22c55e22', text: '#22c55e', border: '#22c55e' },
      'Absent': { bg: '#ef444422', text: '#ef4444', border: '#ef4444' },
      'Overbreak': { bg: '#f59e0b22', text: '#f59e0b', border: '#f59e0b' },
      'Missed Punch In': { bg: '#ec489922', text: '#ec4899', border: '#ec4899' },
      'Missed Punch Out': { bg: '#a855f722', text: '#a855f7', border: '#a855f7' },
      'On-break': { bg: '#3b82f622', text: '#3b82f6', border: '#3b82f6' },
      'Late Arrival': { bg: '#f59e0b22', text: '#f59e0b', border: '#f59e0b' }
    };
    return colors[status] || colors['Normal'];
  };

  const stats = [
    { label: 'Present Today', value: '145', icon: <CheckCircle size={20} />, color: '#22c55e' },
    { label: 'Late Arrivals', value: '12', icon: <Clock size={20} />, color: '#f59e0b' },
    { label: 'Absent', value: '8', icon: <XCircle size={20} />, color: '#ef4444' },
    { label: 'On-break', value: '23', icon: <Coffee size={20} />, color: '#3b82f6' }
  ];

  const tableRef = useRef(null);

  // Custom scrollbar CSS
  const scrollbarStyles = `
    .scrollbar-visible::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }
    .scrollbar-visible::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 6px;
    }
    .scrollbar-visible::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 6px;
      border: 2px solid #f1f5f9;
    }
    .scrollbar-visible::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
    .scrollbar-visible::-webkit-scrollbar-corner {
      background: #f1f5f9;
    }
  `;

  const scrollLeft = () => {
    if (tableRef.current) {
      tableRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (tableRef.current) {
      tableRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const exportToExcel = () => {
    alert(
      "Excel export functionality - Connect to backend or use library like xlsx"
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Date",
      "Department",
      "Punch In",
      "Breaks",
      "Punch Out",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(
        (row) =>
          `${row.name},${row.date},${row.department},${row.punchIn},${row.breaks},${row.punchOut},${row.status}`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();
  };

  return (
    <div className="mt-5">
      <div className="flex justify-end items-start">
        <ExampleIosSwitch />
      </div>

      <div className="min-h-screen p-5 font-sans  text-white">
        <div className="max-w-[1400px] mx-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">
              Daily Time Record (DTR)
            </h1>
            <p className="text-sm text-slate-400">
              Tracking {filteredData.length} employees for 10/24/2025
            </p>
          </div>

          {/* Top bar */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-10 py-2 bg-slate-800/40 border border-slate-800 rounded-lg text-sm outline-none placeholder:text-slate-500"
              />
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
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
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[rgba(59,130,246,0.03)] border_gray"
              >
                <Download size={16} />
                Export Excel
              </button>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2  rounded-lg text-sm font-semibold bg-[rgba(59,130,246,0.03)] border_gray"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stat Cards */}
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

          {/* Table */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-700">
                  {["NAME", "DATE", "DEPARTMENT", "PUNCH IN", "BREAKS", "PUNCH OUT", "OVERTIME", "STATUS"]
                    .map((th, i) => (
                      <th
                        key={i}
                        className="p-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide"
                      >
                        {th}
                      </th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {filteredData.map((record) => {
                  const statusColor = getStatusColor(record.status);
                  const avatar = getAvatar(record.name);

                  return (
                    <tr
                      key={record.id}
                      className="border-b border-slate-800 transition-all bg-slate-900/30 hover:bg-slate-800/40 cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm border"
                            style={{
                              background: `${statusColor.border}33`,
                              color: statusColor.text,
                              borderColor: `${statusColor.border}55`,
                            }}
                          >
                            {avatar}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">
                              {record.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              ID: EM{String(record.id).padStart(5, '0')}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-sm text-slate-300">
                        {record.date}
                      </td>

                      <td className="p-4">
                        <span className="px-3 py-1 text-xs border border-slate-700 bg-slate-900 text-slate-400 rounded-md">
                          {record.department}
                        </span>
                      </td>

                      <td className="p-4 font-medium text-sm">{record.punchIn}</td>
                      <td className="p-4 text-sm text-slate-300">{record.breaks}</td>
                      <td className="p-4 font-medium text-sm">{record.punchOut}</td>

                      <td className="p-4">
                        <span
                          className={`text-sm ${record.overtime !== "0h"
                            ? "text-green-500 font-semibold"
                            : "text-slate-500"
                            }`}
                        >
                          {record.overtime}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border"
                          style={{
                            background: statusColor.bg,
                            color: statusColor.text,
                            borderColor: `${statusColor.border}55`,
                          }}
                        >
                          {getStatusIcon(record.status)}
                          {getStatusLabel(record.status)}
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

      {/* ATTENDANCE TABLE */}
      <EmployeeSchedule />
    </div>
  );
};

export default OverallAttendance;