import React, { useMemo, useState } from "react";
import ExampleIosSwitch from "./ui/Switch";
import { Download, Search } from "lucide-react";
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
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Filter data based on all criteria
  const filteredData = useMemo(() => {
    return attendanceData.filter((item) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase());

      // Department filter
      const matchesDepartment =
        selectedDepartment === "All" || item.department === selectedDepartment;

      // Status filter
      const matchesStatus =
        selectedStatus === "All" || item.status === selectedStatus;

      // Date range filter
      let matchesDate = true;
      if (startDate && endDate) {
        const itemDate = new Date(item.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        matchesDate = itemDate >= start && itemDate <= end;
      } else if (startDate) {
        const itemDate = new Date(item.date);
        const start = new Date(startDate);
        matchesDate = itemDate >= start;
      } else if (endDate) {
        const itemDate = new Date(item.date);
        const end = new Date(endDate);
        matchesDate = itemDate <= end;
      }

      return matchesSearch && matchesDepartment && matchesStatus && matchesDate;
    });
  }, [searchTerm, selectedDepartment, selectedStatus, startDate, endDate]);

  // Get unique departments and statuses for filter options
  const departments = ["All", ...new Set(attendanceData.map(item => item.department))];
  const statuses = ["All", ...new Set(attendanceData.map(item => item.status))];

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Overbreak":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "Absent":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      case "Missed Punch In":
      case "Missed Punch Out":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Export functions
  const exportToExcel = () => {
    alert("Excel export functionality - Connect to backend or use library like xlsx");
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
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("All");
    setSelectedStatus("All");
    setStartDate("");
    setEndDate("");
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
        <div className="bg-[#121212] rounded-lg shadow-lg p-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            {/* Title */}
            <h1 className="text-2xl font-semibold text-white">
              Daily Time Record (DTR)
            </h1>

            {/* Right side - Search, Date and Export */}
            <div className="flex  gap-4 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[var(--box-border)] text-white rounded-md text-sm"
                />
              </div>

              {/* Date Display and Export Buttons */}
              <div className="flex sm:flex-row items-start sm:items-center gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-[rgba(59,130,246,0.03)] border_gray text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Download size={16} />
                    Excel
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-[rgba(59,130,246,0.03)] border_gray text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Download size={16} />
                    CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-[rgba(59,130,246,0.03)] rounded-lg shadow p-4 mb-6 border border-slate-800">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              {/* Department Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white">
                  Department:
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="border text-white border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="bg-[#10131f]">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white">
                  Status:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border text-white border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status} className="bg-[#10131f]">
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white">Date Range:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-600 text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-white">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-600 text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-[rgba(59,130,246,0.03)] border_gray text-white rounded transition-colors text-sm font-medium"
              >
                Clear Filters
              </button>

              {/* Results Count */}
              <div className="ml-auto text-sm text-gray-400">
                Showing {filteredData.length} of {attendanceData.length} records
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[var(--box-border)] shadow-sm">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[rgba(59,131,246,0.06)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    NAME
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    DATE
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    DEPARTMENT
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    PUNCH IN
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    BREAKS
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    PUNCH OUT
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[rgba(59,130,246,0.03)] divide-y divide-[#9E9FA74D]">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-lg font-medium mb-2">No records found</div>
                        <div className="text-sm">Try adjusting your filters</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{scrollbarStyles}</style>
      <AttendanceChartMonth />
    </div>
  );
};

export default OverallAttendance;