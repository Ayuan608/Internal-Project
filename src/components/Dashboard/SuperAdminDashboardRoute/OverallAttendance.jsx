import React, { useMemo, useRef, useState } from "react";

import ExampleIosSwitch from "./ui/Switch";
import { Calendar } from "lucide-react";
import AttendenceData from "../AdminDashboard/AttendenceData";
import WeeklyAttendanceTrendChart from "../AdminDashboard/WeeklyAttendenceChart";
const attendanceData = [
  {
    id: 1,
    name: "Daryl Carboado",
    date: "2025-10-17",
    department: "CSR",
    punchIn: "08:00 AM",
    breaks: "1h 15m",
    punchOut: "05:00 PM",
    status: "Overbreak",
  },
  {
    id: 2,
    name: "Ayun Daef",
    date: "2025-10-17",
    department: "Deposit",
    punchIn: "06:05 AM",
    breaks: "1h 00m",
    punchOut: "05:02 PM",
    status: "Normal",
  },
  {
    id: 3,
    name: "Ashish Prabhakar",
    date: "2025-10-17",
    department: "Withdrawal",
    punchIn: "08:00 AM",
    breaks: "1h 00m",
    punchOut: "--",
    status: "Missed Punch Out",
  },
  {
    id: 4,
    name: "David Kumar",
    date: "2025-10-17",
    department: "CSR",
    punchIn: "--",
    breaks: "--",
    punchOut: "--",
    status: "Absent",
  },
  {
    id: 5,
    name: "David Chein",
    date: "2025-10-17",
    department: "Deposit",
    punchIn: "07:58 AM",
    breaks: "1h 00m",
    punchOut: "05:00 PM",
    status: "Normal",
  },
  {
    id: 6,
    name: "Madhu Kumari",
    date: "2025-10-17",
    department: "CSR",
    punchIn: "--",
    breaks: "1h 00m",
    punchOut: "05:03 PM",
    status: "Missed Punch In",
  },
  {
    id: 7,
    name: "Khushi Kumari",
    date: "2025-10-17",
    department: "Withdrawal",
    punchIn: "08:15 AM",
    breaks: "1h 30m",
    punchOut: "05:15 PM",
    status: "Overbreak",
  },
  {
    id: 8,
    name: "Lekh Raj ",
    date: "2025-10-17",
    department: "CSR",
    punchIn: "08:00 AM",
    breaks: "1h 00m",
    punchOut: "05:00 PM",
    status: "Normal",
  },
  {
    id: 9,
    name: "Chandan Aheer",
    date: "2025-10-17",
    department: "Deposit",
    punchIn: "08:02 AM",
    breaks: "55m",
    punchOut: "05:00 PM",
    status: "Normal",
  },
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-800";
      case "Overbreak":
        return "bg-orange-100 text-orange-800";
      case "Absent":
        return "bg-gray-100 text-gray-800";
      case "Missed Punch In":
      case "Missed Punch Out":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
      <div className="pt-8">
        <AttendenceData />
      </div>
      <div>
        <WeeklyAttendanceTrendChart />
      </div>
      <div className="max-w-full pt-8 mx-auto">
        {/* Main Card */}
        <div className="bg-[#121212]  rounded-lg shadow-lg p-6">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            {/* Title */}
            <h1 className="text-2xl font-semibold text-white">
              Daily Time Record (DTR)
            </h1>

            {/* Right side - Search, Date and Export */}
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative w-80">
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchTerm}
                  className="w-full pl-4 pr-4 py-2.5 border border-[var(--box-border)] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Date Display and Export Buttons */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value="10/22/2025"
                    readOnly
                    className="w-32 px-3 py-2 border border-[var(--box-border)] rounded-md text-sm  text-center"
                  />
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>

                <button
                  onClick={exportToExcel}
                  className="px-5 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  Export Excel
                </button>
                <button
                  onClick={exportToCSV}
                  className="px-5 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[var(--box-border)] shadow-sm">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[rgba(59,131,246,0.06)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    NAME ↕
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    DATE ↕
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    DEPARTMENT ↕
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    PUNCH IN ↕
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    BREAKS ↕
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    PUNCH OUT ↕
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    STATUS ↕
                  </th>
                </tr>
              </thead>
              <tbody className="  bg-[rgba(59,130,246,0.03)] divide-y divide-[#9E9FA74D]">
                {filteredData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#3b83f610] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-white font-medium whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                      {row.department}
                    </td>
                    <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                      {row.punchIn}
                    </td>
                    <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                      {row.breaks}
                    </td>
                    <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                      {row.punchOut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-4 py-1.5 rounded-md text-xs font-semibold ${getStatusColor(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[rgba(59,130,246,0.03)] rounded-lg shadow p-4 mt-0.5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white">
                  Section:
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All</option>
                  <option value="CSR">CSR</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawal">Withdrawal</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white">Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-white">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-1 bg-blue-900 text-white rounded hover:bg-blue-800 transition-colors text-sm">
                  Filter
                </button>
              </div>

              <button className="ml-auto px-4 py-1 bg-blue-900 text-white rounded hover:bg-blue-800 transition-colors text-sm">
                ⬇ Export to Excel
              </button>
            </div>
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
            <button
              onClick={scrollLeft}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
            >
              ← Left
            </button>
            <button
              onClick={scrollRight}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
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
