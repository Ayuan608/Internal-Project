import React, { useMemo, useRef, useState } from "react";

import ExampleIosSwitch from "./ui/Switch";
import { Calendar } from "lucide-react";
import AttendenceData from "../AdminDashboard/AttendenceData";
import WeeklyAttendanceTrendChart from "../AdminDashboard/WeeklyAttendenceChart";
import AttendanceChartMonth from "./ui/AttendanceChartMonth";
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
      <AttendanceChartMonth />
    </div>
  );
};

export default OverallAttendance;
