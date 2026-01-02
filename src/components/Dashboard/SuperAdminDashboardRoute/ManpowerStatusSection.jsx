import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAttendance } from "../../../redux/attendenceSlice";
import { Download, Search, Filter, Calendar } from "lucide-react";

const departments = [
  "All Departments",
  "CSR Department",
  "Withdraw Department",
  "Deposit Department",
  "Marketing Department",
];

const statusFilters = [
  "All Status",
  "Absent",
  "Late",
  "Half Day",
  "Undertime",
  "Suspended",
  "Day Off",
];

const statusColorMap = {
  Absent: {
    badge: "border-rose-500/70 bg-rose-500/10 text-rose-200",
    dot: "bg-rose-400",
  },
  Late: {
    badge: "border-amber-400/70 bg-amber-500/10 text-amber-200",
    dot: "bg-amber-400",
  },
  "Half Day": {
    badge: "border-sky-400/70 bg-sky-500/10 text-sky-200",
    dot: "bg-sky-400",
  },
  Undertime: {
    badge: "border-indigo-400/70 bg-indigo-500/10 text-indigo-200",
    dot: "bg-indigo-400",
  },
  Suspended: {
    badge: "border-fuchsia-400/70 bg-fuchsia-500/10 text-fuchsia-200",
    dot: "bg-fuchsia-400",
  },
  "Day Off": {
    badge: "border-emerald-400/70 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
  },
  Present: {
    badge: "border-green-400/70 bg-green-500/10 text-green-200",
    dot: "bg-green-400",
  },
  Normal: {
    badge: "border-blue-400/70 bg-blue-500/10 text-blue-200",
    dot: "bg-blue-400",
  },
};
const departmentTextColorMap = {
  "CSR Department": "text-blue-400",
  "Deposit Department": "text-emerald-400",
  "Withdraw Department": "text-purple-400",
  "Marketing Department": "text-orange-400",
};

const ManpowerStatusSection = () => {
  const dispatch = useDispatch();
  const { allAttendance, isLoading } = useSelector((state) => state.attendance);
  const { departmentAttendance = [], department } = useSelector(
    (s) => s.attendance || {}
  );

  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Fetch data on component mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getAllAttendance({
          startDate: dateFrom || undefined,
          endDate: dateTo || undefined,
          department: selectedDept !== "All Departments"
            ? selectedDept.replace(" Department", "")
            : undefined,
          page: 1,
          limit: 100
        })).unwrap();
      } catch (error) {
        console.error("Failed to fetch manpower data:", error);
      }
    };
    fetchData();
  }, [dispatch, dateFrom, dateTo, selectedDept]);

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
  };
  //calculate shift over
  const isShiftOver = (workingHour) => {

    if (!workingHour) return false;

    const [, endTime] = workingHour.split(" - ");
    if (!endTime) return false;

    const now = new Date();
    const shiftEnd = new Date(now);

    const [time, modifier] = endTime.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    shiftEnd.setHours(hours, minutes, 0, 0);

    return now > shiftEnd;
  };
  //calculate is shift started
  const isShiftStarted = (workingHour) => {
    if (!workingHour) return false;

    const [start] = workingHour.split(" - ");
    const { hours, minutes } = parseTime(start.trim());

    const now = new Date();
    const shiftStart = new Date(now);
    shiftStart.setHours(hours, minutes, 0, 0);

    return now >= shiftStart;
  };


  const isToday = (date) => {
    if (!date) return false;
    const d = new Date(date);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  // Convert attendance data to manpower records
  const manpowerData = useMemo(() => {
    if (!departmentAttendance || !Array.isArray(departmentAttendance)) return [];

    return departmentAttendance.map((record, index) => {
      // Map attendance status to manpower status
      let manpowerStatus = "Present";
      if (record.alert === "Absent") manpowerStatus = "Absent";
      else if (record.alert === "Late") manpowerStatus = "Late";
      else if (record.alert === "Half Day") manpowerStatus = "Half Day";
      else if (record.alert === "Undertime") manpowerStatus = "Undertime";
      else if (record.alert === "Suspended") manpowerStatus = "Suspended";
      else if (record.alert === "Day Off") manpowerStatus = "Day Off";
      else if (record.alert === "Present" || record.alert === "Normal") manpowerStatus = "Present";


      const hasClockIn = Boolean(record.clockIn);
 
      const hasClockOut = Boolean(record.clockOut);
      const shiftEnded = isShiftOver(record.workingHour);

      // ✅ EXACT violation rule
      const totalViolation =
        hasClockIn && !hasClockOut && shiftEnded ? 1 : 0;


      // ✅ day off rule
      const hasTodayDayOff =
        !hasClockIn
        // ||
        // Array.isArray(record.dayOffRequests) ||
        // record.dayOffRequests.some(req => isToday(req.date));


      const totalDayOff = hasTodayDayOff ? 1 : 0;
      // const hasTodayDayOffRequest =
      //   Array.isArray(record.dayOffRequests) &&
      //   record.dayOffRequests.some(req => isToday(req.date));

      // const totalDayOff =
      //   !hasClockIn && !hasTodayDayOffRequest ? 1 : 0;

      // LATE
      const totalLate =
        isToday(record.date) &&
          !hasClockIn &&
          isShiftStarted(record.workingHour) ? 1 : 0;

      // STATUS OVERRIDE
      let status = record.alert || "Present";
      if (totalDayOff) status = "Day Off";
      else if (totalLate) status = "Late";
    



      return {
        id: record._id || `emp-${index}`,
        date: record.date ? new Date(record.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        department: record?.department ? `${record.department} Department` : "Unknown Department",
        name: record?.FullName || "Unknown Employee",
        status: record.status,
        totalViolation: totalViolation,
        totalDayOff: totalDayOff,
        totalLate: totalLate,
        originalRecord: record
      };
    });
  }, [departmentAttendance]);


  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return manpowerData.filter((row) => {
      // Department filter
      const matchDept =
        selectedDept === "All Departments" || row.department === selectedDept;

      // Status filter
      const matchStatus =
        statusFilter === "All Status" || row.status === statusFilter;

      // Search filter
      const q = search.trim().toLowerCase();
      const matchSearch = !q
        ? true
        : [row.name, row.status, row.department]
          .join(" ")
          .toLowerCase()
          .includes(q);

      // Date filter (inclusive)
      let matchDate = true;
      if (dateFrom && row.date < dateFrom) matchDate = false;
      if (dateTo && row.date > dateTo) matchDate = false;

      return matchDept && matchStatus && matchSearch && matchDate;
    });
  }, [manpowerData, selectedDept, statusFilter, search, dateFrom, dateTo]);


  const absentCount = filteredData.filter(r => r.status === "Absent").length;
  const lateCount = filteredData.filter(r => r.status === "Late").length;
  const dayOffCount = filteredData.filter(r => r.totalDayOff === 1).length;

  const handleExport = () => {
    const header = [
      "Date",
      "Department",
      "Name",
      "Status",
      "Total Violation",
      "Total Day Off",
    ];

    const rows = filteredData.map((r) => [
      r.date,
      r.department,
      r.name,
      r.status,
      r.totalViolation.toString(),
      r.totalDayOff.toString(),
    ]);

    const csvContent = [header, ...rows]
      .map((cols) =>
        cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `manpower-status-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const Th = ({ children, className = "", ...rest }) => (
    <th
      className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:text-xs ${className}`}
      {...rest}
    >
      {children}
    </th>
  );

  return (
    <div className="px-4 py-6 text-slate-50 md:px-8">
      <div className="mx-auto w-full max-w-full">
        {/* Section header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Manpower Status</h2>
            <p className="text-xs text-slate-400">
              Attendance and discipline status. Use filters to see previous dates.
            </p>
          </div>

          {/* Actions */}
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            {/* Left group: filters */}
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {/* Date range */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Calendar size={14} />
                <span>From</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 rounded-lg border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-200 outline-none ring-0 focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                />
                <span>To</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 rounded-lg border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-200 outline-none ring-0 focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                />
              </div>

              {/* Filter by department */}
              <div className="relative">
                <Filter size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="h-9 rounded-lg border border-slate-700 bg-slate-900/80 pl-8 pr-3 text-xs text-slate-200 outline-none ring-0 focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-lg border border-slate-700 bg-slate-900/80 pl-8 pr-3 text-xs text-slate-200 outline-none ring-0 focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                >
                  {statusFilters.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative min-w-[180px] md:min-w-[220px]">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, status..."
                  className="h-9 w-full rounded-lg border border-slate-700 bg-slate-900/80 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 outline-none ring-0 focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                />
              </div>
            </div>

            {/* Right: Export button */}
            <div className="flex justify-start md:justify-end">
              <button
                type="button"
                onClick={handleExport}
                disabled={filteredData.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={14} />
                Export File
              </button>
            </div>
          </div>
        </div>

        {/* Stats summary */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">Total Records</p>
            <p className="text-2xl font-bold text-slate-100">{filteredData.length}</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">Absent</p>
            <p className="text-2xl font-bold text-rose-400">
              {filteredData.filter(r => r.status === "Absent").length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">Late</p>
            <p className="text-2xl font-bold text-amber-400">
              {filteredData.filter(r => r.status === "Late").length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">Day Off</p>
            <p className="text-2xl font-bold text-emerald-400">
              {dayOffCount}
            </p>
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-slate-950/60">
          <div className="max-h-[calc(100vh-250px)]  overflow-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs md:text-sm">
              <thead className="bg-slate-900/90 sticky top-0 z-10">
                <tr>
                  <Th>Date</Th>
                  <Th>Department</Th>
                  <Th>Name</Th>
                  <Th>Status</Th>
                  <Th>Total Violation</Th>
                  <Th>Total Day Off</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                {
                // isLoading 
                // ? (
                //   <tr>
                //     <td colSpan={6} className="px-4 py-8 text-center">
                //       <div className="flex justify-center">
                //         <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-sky-500"></div>
                //       </div>
                //     </td>
                //   </tr>
                // ) :
                filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-xs text-slate-400"
                    >
                      No records match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => {
                    const colors = statusColorMap[row.status] || statusColorMap.Present;
                    return (
                      <tr
                        key={row.id}
                        className="transition hover:bg-slate-900/80"
                      >
                        <td className="px-4 py-3 text-slate-100">
                          {row.date}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center justify-center
      
      text-[11px] font-semibold uppercase
      ${departmentTextColorMap[row.department] ||
                              "text-slate-400"
                              }
    `}
                          >
                            {row.department}
                          </span>
                        </td>


                        <td className="px-4 py-3 text-slate-100 uppercase">{row.name}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${colors.dot}`}
                            />
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${colors.badge}`}
                            >
                              {row.status}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-100">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${row.totalViolation > 0 ? 'bg-rose-900/50 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                            {row.totalViolation}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-100">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${row.totalDayOff > 0 ? 'bg-emerald-900/50 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                            {row.totalDayOff}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Showing {filteredData.length} records
            {dateFrom || dateTo ? ` (Filtered by date)` : ""}
          </p>
          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setSelectedDept("All Departments");
              setStatusFilter("All Status");
              setSearch("");
            }}
            className="text-xs text-slate-400 hover:text-slate-300 transition"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManpowerStatusSection;