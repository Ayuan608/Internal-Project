import React, { useMemo, useRef, useState } from "react";

import { AlertCircle, Calendar, CheckCircle, Clock, Coffee, Download, Search, XCircle } from "lucide-react";
import ExampleIosSwitch from "../components/Dashboard/SuperAdminDashboardRoute/ui/Switch";

const attendanceData = [
  { id: 1, name: 'Daryl Carbonado', date: '2025-10-17', department: 'CSR', punchIn: '08:00 AM', breaks: '1h 15m', punchOut: '05:00 PM', overtime: '0h', status: 'Overbreak' },
  { id: 2, name: 'Ayun Daef', date: '2025-10-17', department: 'Deposit', punchIn: '06:05 AM', breaks: '1h 00m', punchOut: '05:02 PM', overtime: '2h 57m', status: 'Normal' },
  { id: 3, name: 'Ashish Prabhakar', date: '2025-10-17', department: 'Withdrawal', punchIn: '08:00 AM', breaks: '1h 00m', punchOut: '--', overtime: '0h', status: 'Missed Punch Out' },
  { id: 4, name: 'David Kumar', date: '2025-10-17', department: 'CSR', punchIn: '--', breaks: '--', punchOut: '--', overtime: '0h', status: 'Absent' },
  { id: 5, name: 'David Chen', date: '2025-10-17', department: 'Deposit', punchIn: '07:58 AM', breaks: '1h 00m', punchOut: '05:00 PM', overtime: '1h 02m', status: 'Normal' },
  { id: 6, name: 'Madhu Kumari', date: '2025-10-17', department: 'CSR', punchIn: '--', breaks: '1h 00m', punchOut: '05:03 PM', overtime: '0h', status: 'Missed Punch In' },
  { id: 7, name: 'Khushi Kumari', date: '2025-10-17', department: 'Withdrawal', punchIn: '08:15 AM', breaks: '1h 30m', punchOut: '05:15 PM', overtime: '15m', status: 'Overbreak' },
  { id: 8, name: 'Lekh Raj', date: '2025-10-17', department: 'CSR', punchIn: '08:00 AM', breaks: '1h 00m', punchOut: '05:00 PM', overtime: '0h', status: 'Normal' },
  { id: 9, name: 'Chandan Aheer', date: '2025-10-17', department: 'Deposit', punchIn: '08:02 AM', breaks: '55m', punchOut: '05:00 PM', overtime: '0h', status: 'Normal' },
];
// Schedule data for the bottom table
const scheduleData = [
  {
    id: 1,
    dateHired: "14-Feb-25",
    team: "Deposit",
    position: "Staff",
    name: "Ashish Prabhakar",
    schedule: "16:00 - 04:00",
    remarks: "12 hrs",
    schedule_days: {
      nov4: "D",
      nov5: "N",
      nov6: "N",
      nov7: "D",
      nov8: "D",
      nov9: "RD",
      nov10: "N",
      nov11: "D",
      nov12: "N",
      nov13: "D",
      nov14: "N",
      nov15: "RD",
      nov16: "N",
      nov17: "D",
      nov18: "N",
      nov19: "D",
      nov20: "N",
      nov21: "RD",
      nov22: "D",
      nov23: "N",
      nov24: "D",
      nov25: "N",
      nov26: "RD",
      nov27: "D",
      nov28: "N",
      nov29: "D",
      nov30: "N",
    },
  },
  {
    id: 2,
    dateHired: "7-Mar-25",
    team: "Deposit",
    position: "Staff",
    name: "Lekh Raj",
    schedule: "16:00 - 04:00",
    remarks: "12 hrs",
    schedule_days: {
      nov4: "D",
      nov5: "D",
      nov6: "RD",
      nov7: "N",
      nov8: "N",
      nov9: "N",
      nov10: "D",
      nov11: "D",
      nov12: "RD",
      nov13: "N",
      nov14: "N",
      nov15: "D",
      nov16: "D",
      nov17: "RD",
      nov18: "N",
      nov19: "N",
      nov20: "D",
      nov21: "D",
      nov22: "RD",
      nov23: "N",
      nov24: "N",
      nov25: "D",
      nov26: "D",
      nov27: "RD",
      nov28: "N",
      nov29: "N",
      nov30: "D",
    },
  },
  {
    id: 3,
    dateHired: "16-Nov-24",
    team: "CSR",
    position: "Agent",
    name: "Chandan Aheer",
    schedule: "16:00 - 04:00",
    remarks: "12 hrs",
    schedule_days: {
      nov4: "N",
      nov5: "N",
      nov6: "D",
      nov7: "RD",
      nov8: "N",
      nov9: "N",
      nov10: "D",
      nov11: "RD",
      nov12: "N",
      nov13: "D",
      nov14: "N",
      nov15: "N",
      nov16: "RD",
      nov17: "D",
      nov18: "N",
      nov19: "RD",
      nov20: "D",
      nov21: "N",
      nov22: "N",
      nov23: "D",
      nov24: "RD",
      nov25: "N",
      nov26: "D",
      nov27: "N",
      nov28: "RD",
      nov29: "D",
      nov30: "N",
    },
  },
  {
    id: 4,
    dateHired: "12-Jan-25",
    team: "CSR",
    position: "Senior",
    name: "harish Kumar",
    schedule: "16:00 - 04:00",
    remarks: "12 hrs",
    schedule_days: {
      nov4: "D",
      nov5: "D",
      nov6: "N",
      nov7: "N",
      nov8: "RD",
      nov9: "D",
      nov10: "D",
      nov11: "N",
      nov12: "N",
      nov13: "RD",
      nov14: "D",
      nov15: "D",
      nov16: "N",
      nov17: "N",
      nov18: "RD",
      nov19: "D",
      nov20: "D",
      nov21: "N",
      nov22: "N",
      nov23: "RD",
      nov24: "D",
      nov25: "D",
      nov26: "N",
      nov27: "N",
      nov28: "RD",
      nov29: "D",
      nov30: "D",
    },
  },
  {
    id: 5,
    dateHired: "20-Aug-24",
    team: "Withdrawal",
    position: "Staff",
    name: "Sukhminder Singh",
    schedule: "16:00 - 04:00",
    remarks: "12 hrs",
    schedule_days: {
      nov4: "D",
      nov5: "N",
      nov6: "D",
      nov7: "N",
      nov8: "RD",
      nov9: "N",
      nov10: "N",
      nov11: "D",
      nov12: "N",
      nov13: "RD",
      nov14: "D",
      nov15: "N",
      nov16: "D",
      nov17: "N",
      nov18: "RD",
      nov19: "N",
      nov20: "D",
      nov21: "N",
      nov22: "D",
      nov23: "RD",
      nov24: "N",
      nov25: "D",
      nov26: "N",
      nov27: "D",
      nov28: "N",
      nov29: "RD",
      nov30: "N",
    },
  },
];

const days = [
  { day: "FRI", date: "NOV 4", key: "nov4" },
  { day: "SAT", date: "NOV 5", key: "nov5" },
  { day: "SUN", date: "NOV 6", key: "nov6" },
  { day: "MON", date: "NOV 7", key: "nov7" },
  { day: "TUE", date: "NOV 8", key: "nov8" },
  { day: "WED", date: "NOV 9", key: "nov9" },
  { day: "THU", date: "NOV 10", key: "nov10" },
  { day: "FRI", date: "NOV 11", key: "nov11" },
  { day: "SAT", date: "NOV 12", key: "nov12" },
  { day: "SUN", date: "NOV 13", key: "nov13" },
  { day: "MON", date: "NOV 14", key: "nov14" },
  { day: "TUE", date: "NOV 15", key: "nov15" },
  { day: "WED", date: "NOV 16", key: "nov16" },
  { day: "THU", date: "NOV 17", key: "nov17" },
  { day: "FRI", date: "NOV 18", key: "nov18" },
  { day: "SAT", date: "NOV 19", key: "nov19" },
  { day: "SUN", date: "NOV 20", key: "nov20" },
  { day: "MON", date: "NOV 21", key: "nov21" },
  { day: "TUE", date: "NOV 22", key: "nov22" },
  { day: "WED", date: "NOV 23", key: "nov23" },
  { day: "THU", date: "NOV 24", key: "nov24" },
  { day: "FRI", date: "NOV 25", key: "nov25" },
  { day: "SAT", date: "NOV 26", key: "nov26" },
  { day: "SUN", date: "NOV 27", key: "nov27" },
  { day: "MON", date: "NOV 28", key: "nov28" },
  { day: "TUE", date: "NOV 29", key: "nov29" },
  { day: "WED", date: "NOV 30", key: "nov30" },
];
const stats = [
  { label: 'Present Today', value: '145', icon: <CheckCircle size={20} />, color: '#22c55e' },
  { label: 'Late Arrivals', value: '12', icon: <Clock size={20} />, color: '#f59e0b' },
  { label: 'Absent', value: '8', icon: <XCircle size={20} />, color: '#ef4444' },
  { label: 'On-break', value: '23', icon: <Coffee size={20} />, color: '#3b82f6' }
];
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


  // Filter data based on search and section
  const filteredData = useMemo(() => {
    return attendanceData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSection =
        selectedSection === "All" || item.department === selectedSection;
      return matchesSearch && matchesSection;
    });
  }, [searchTerm, selectedSection]);
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
              Tracking 2 employees for 10/24/2025
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
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm cursor-pointer outline-none"
              >
                <option value="all">All Departments</option>
                <option value="CSR">CSR</option>
                <option value="Deposit">Deposit</option>
                <option value="Withdrawal">Withdrawal</option>
              </select>

              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg text-sm font-semibold hover:bg-green-600"
              >
                <Download size={16} />
                Export Excel
              </button>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-sm font-semibold hover:bg-blue-600"
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

      {/* Filter Section */}

      <style>{scrollbarStyles}</style>
      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col mt-3">
        {/* Scroll hint with buttons */}
        <div className=" border-b border-blue-200 px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-blue-800">
            ← → Scroll to see all Attendence Details | ↑ ↓ Scroll to see all
            employees
          </span>
          <div className="flex gap-2">
            <select
              className="bg-[var(--main-color)] text-white text-sm px-4 py-2 rounded-lg outline-none border border-[var(--box-border)] focus:border-blue-500 transition-colors    appearance-none "
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">Filter by Department</option>
              <option value="CSR">CSR</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
            </select>
            <button
              onClick={scrollLeft}
              className="bg-[var(--main-color)] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
            >
              ← Left
            </button>
            <button
              onClick={scrollRight}
              className="bg-[var(--main-color)] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
            >
              Right →
            </button>
          </div>
        </div>
        <div ref={tableRef} className="flex-1 overflow-auto scrollbar-visible">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-0 z-20 min-w-[70px]">
                  HEAD
                  <br />
                  COUNT
                </th>
                <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-[70px] z-20 min-w-[90px]">
                  DATE
                  <br />
                  HIRED
                </th>
                <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-[160px] z-20 min-w-[100px]">
                  TEAM
                </th>
                <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-[260px] z-20 min-w-[90px]">
                  POSITION
                </th>
                <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-[350px] z-20 min-w-[120px]">
                  NAME
                </th>
                <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-[470px] z-20 min-w-[100px]">
                  SCHEDULE
                </th>
                <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-[570px] z-20 min-w-[80px]">
                  REMARKS
                </th>
                {days.map((day, idx) => (
                  <th
                    key={idx}
                    className="bg-blue-900 text-white px-3 py-3 text-center font-semibold border-r border-blue-800 min-w-[60px]"
                  >
                    {day.day}
                    <br />
                    {day.date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scheduleData.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-3 py-3 text-center font-medium text-gray-900 border-r border-gray-200 bg-white sticky left-0 z-10">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-3 text-gray-700 border-r border-gray-200 bg-white sticky left-[70px] z-10">
                    {row.dateHired}
                  </td>
                  <td className="px-3 py-3 text-gray-700 border-r border-gray-200 bg-white sticky left-[160px] z-10">
                    {row.team}
                  </td>
                  <td className="px-3 py-3 text-gray-700 border-r border-gray-200 bg-white sticky left-[260px] z-10">
                    {row.position}
                  </td>
                  <td className="px-3 py-3 text-gray-900 font-medium border-r border-gray-200 bg-white sticky left-[350px] z-10">
                    {row.name}
                  </td>
                  <td className="px-3 py-3 text-gray-700 text-sm border-r border-gray-200 bg-white sticky left-[470px] z-10">
                    {row.schedule}
                  </td>
                  <td className="px-3 py-3 text-gray-700 border-r border-gray-200 bg-white sticky left-[570px] z-10">
                    {row.remarks}
                  </td>
                  {days.map((day, dayIdx) => (
                    <td
                      key={dayIdx}
                      className={`px-3 py-3 text-center font-semibold border-r border-gray-200 ${getScheduleColor(
                        row.schedule_days[day.key]
                      )}`}
                    >
                      {row.schedule_days[day.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 bg-yellow-200 border border-yellow-300 rounded"></div>
              <span className="text-gray-700">D - Day Shift</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 bg-green-200 border border-green-300 rounded"></div>
              <span className="text-gray-700">N - Night Shift</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 bg-red-400 border border-red-500 rounded"></div>
              <span className="text-gray-700">RD - Rest Day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallAttendance;
