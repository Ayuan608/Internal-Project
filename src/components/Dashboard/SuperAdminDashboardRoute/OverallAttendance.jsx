import React, { useMemo, useState, useEffect } from "react";
import { Download, Search } from "lucide-react";
import AttendenceData from "../AdminDashboard/AttendenceData";
import WeeklyAttendanceTrendChart from "../AdminDashboard/WeeklyAttendenceChart";
import AttendanceChartMonth from "./ui/AttendanceChartMonth";
import { useDispatch, useSelector } from "react-redux";
import { getAllAttendance } from "../../../redux/attendenceSlice";
import { headers } from "../../../Helpers/Helper";
import AttendanceStatsChart from "./ui/AttendanceChartMonth";
import AttendanceDashboard from "../TeamLeaderDashboard/RestDay";

const OverallAttendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const dispatch = useDispatch();

  const { allAttendance, isLoading, pagination } = useSelector(
    (state) => state.attendance
  );


  // Fetch attendance data on component mount and when filters change
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        await dispatch(getAllAttendance({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          department: selectedDepartment !== "All" ? selectedDepartment : undefined,
          page: 1,
          limit: 100 // Adjust as needed
        })).unwrap();
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      }
    };

    fetchAttendanceData();
  }, [dispatch, startDate, endDate, selectedDepartment]);



  // Helper function to determine attendance status
  const getAttendanceStatus = (record) => {
    if (!record.punchIn && !record.punchOut) return "Absent";
    if (!record.punchIn) return "Missed Punch In";
    if (!record.punchOut) return "Missed Punch Out";
    if (record.status) return record.status;

    // Calculate status based on breaks
    if (record.breaks) {
      const breakTime = parseBreakTime(record.breaks);
      if (breakTime > 60) return "Overbreak"; // More than 60 minutes break
    }

    return "Normal";
  };

  // Transform Redux data to match your expected format
  const transformedAttendanceData = useMemo(() => {
    if (!allAttendance || !Array.isArray(allAttendance)) return [];

    return allAttendance.map((record, index) => ({
      id: record._id || record.id || index,
      name: record.userId?.name || record.employeeName || "Unknown Employee",
      date: record.date || new Date().toISOString().split('T')[0],
      department: record.userId?.department || record.department || "Unknown Department",
      punchIn: record.punchIn || "N/A",
      breaks: record.breaks || record.breakDuration || "0h",
      punchOut: record.punchOut || "N/A",
      status: getAttendanceStatus(record),
      overtime: record.overtime || "0h"
    }));
  }, [allAttendance]);

  // Helper function to parse break time
  const parseBreakTime = (breakString) => {
    if (!breakString) return 0;
    const match = breakString.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      const hours = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      return hours * 60 + minutes;
    }
    return 0;
  };


  // Get unique departments and statuses for filter options
  const departments = ["All", ...new Set(transformedAttendanceData.map(item => item.department))];
  const statuses = ["All", ...new Set(transformedAttendanceData.map(item => item.status))];

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
      case "Present":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Late":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
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
      "Overtime"
    ];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(
        (row) =>
          `"${row.name}","${row.date}","${row.department}","${row.punchIn}","${row.breaks}","${row.punchOut}","${row.status}","${row.overtime}"`
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

  // Refresh data
  const refreshData = () => {
    dispatch(getAllAttendance({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      department: selectedDepartment !== "All" ? selectedDepartment : undefined,
      page: 1,
      limit: 100
    }));
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
    

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-white">Loading attendance data...</span>
        </div>
      )}

      <div className="pt-8">
        <AttendenceData data={allAttendance} />
      </div>

      <div>
        <WeeklyAttendanceTrendChart attendanceData={transformedAttendanceData} />
      </div>

      <div className="max-w-full pt-8 mx-auto">
        {/* Main Card */}
        <div className="bg-[rgba(59,130,246,0.03)] rounded-lg shadow-lg p-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            {/* Title */}
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-white">
                Daily Time Record (DTR)
              </h1>
              <button
                onClick={refreshData}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {/* Right side - Search, Date and Export */}
            <div className="flex gap-4 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[var(--box-border)] text-white rounded-md text-sm"
                  disabled={isLoading}
                />
              </div>

              {/* Date Display and Export Buttons */}
              <div className="flex sm:flex-row items-start sm:items-center gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={exportToExcel}
                    disabled={isLoading || allAttendance.length === 0}
                    className="px-4 py-2 bg-[rgba(59,130,246,0.03)] border_gray text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={16} />
                    Excel
                  </button>
                  <button
                    onClick={exportToCSV}
                    disabled={isLoading || allAttendance.length === 0}
                    className="px-4 py-2 bg-[rgba(59,130,246,0.03)] border_gray text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="border text-white border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-[#10131f]"
                  disabled={isLoading}
                >
                  {/* Manual Departments */}
                  <option value="All">All Departments</option>
                  <option value="CSR">CSR</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Withdraw">Withdraw</option>

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
                  className="border text-white border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-[#10131f]"
                  disabled={isLoading}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
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
                  className="border border-gray-600 text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-[#10131f]"
                  disabled={isLoading}
                />
                <span className="text-white">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-600 text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-[#10131f]"
                  disabled={isLoading}
                />
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={clearFilters}
                disabled={isLoading}
                className="px-4 py-2 bg-[rgba(59,130,246,0.03)] border_gray text-white rounded transition-colors text-sm font-medium disabled:opacity-50"
              >
                Clear Filters
              </button>

              {/* Results Count */}
              <div className="ml-auto text-sm text-gray-400">
                {isLoading ? "Loading..." : `Showing ${allAttendance.length} records`}
                {pagination && ` (Total: ${pagination.total})`}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[var(--box-border)] shadow-sm">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[rgba(59,131,246,0.06)]">
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[rgba(59,130,246,0.03)] divide-y divide-[#9E9FA74D]">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
                        <div className="text-sm">Loading attendance data...</div>
                      </div>
                    </td>
                  </tr>
                ) : allAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-lg font-medium mb-2">No records found</div>
                        <div className="text-sm">Try adjusting your filters</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  allAttendance.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-[#3b83f610] transition-colors whitespace-nowrap"
                    >
                      <td className="px-6 py-4 text-sm text-white font-medium whitespace-nowrap">
                        {row._id ? row._id.slice(0, 8) : "--"}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium whitespace-nowrap">
                        {row.user?.FullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                        {row.user?.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                        {row.clockIn ? new Date(row.clockIn).toLocaleTimeString() : "--"}
                      </td>
                      <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                        {row.shift}
                      </td>
                      <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                        {row.clockOut ? new Date(row.clockOut).toLocaleTimeString() : "Not Punched Out"}
                      </td>
                      <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                        {row.workingHours}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-4 py-1.5 rounded-md text-xs font-semibold ${getStatusColor(
                            row.alert
                          )}`}
                        >
                          {row.alert}
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
        <AttendanceDashboard />
    </div>
  );
};

export default OverallAttendance;