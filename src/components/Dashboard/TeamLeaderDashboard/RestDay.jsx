// AttendanceDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Users, UserCheck, UserX, Search } from "lucide-react";
// import { getDepartmentWiseUsers } from "../../../redux/attendenceSlice";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend as RechartsLegend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
} from "recharts";
import AttendanceTable from "./AtteadanceTable";

// color constants
const KPI_BG = {
  present: "from-emerald-900/30 to-emerald-900/10 border-emerald-500/30",
  absent: "from-red-900/30 to-red-900/10 border-red-500/30",
  leave: "from-amber-900/30 to-amber-900/10 border-amber-500/30",
  undertime: "from-pink-900/20 to-pink-900/10 border-pink-500/30",
  total: "from-blue-900/30 to-blue-900/10 border-blue-500/30",
};

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function AttendanceDashboard() {
  const dispatch = useDispatch();
  const { departmentAttendance = [], department } = useSelector(
    (s) => s.attendance || {}
  );
console.log(departmentAttendance,"abhishek")
  console.log("desparetmebt",departmentAttendance)
  const { role } = useSelector((s) => s.auth || {});
  const [searchName, setSearchName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [departmentFilter, setDepartmentFilter] = useState(department || "All");
  const [statusFilter, setStatusFilter] = useState("All");

  // fetch data
  // useEffect(() => {
  //   dispatch(getDepartmentWiseUsers()).catch((e) =>
  //     console.error("fetch dept users err", e)
  //   );
  // }, [dispatch]);

  // months utilities
  const daysInSelectedMonth = useMemo(() => {
    const y = selectedMonth.getFullYear();
    const m = selectedMonth.getMonth();
    return new Date(y, m + 1, 0).getDate();
  }, [selectedMonth]);

  const monthLabel = useMemo(() => {
    return selectedMonth.toLocaleString("default", { month: "long", year: "numeric" });
  }, [selectedMonth]);

  const gotoPreviousMonth = () =>
    setSelectedMonth(
      (s) => new Date(s.getFullYear(), s.getMonth() - 1, 1)
    );
  const gotoNextMonth = () =>
    setSelectedMonth(
      (s) => new Date(s.getFullYear(), s.getMonth() + 1, 1)
    );

  // filtered data
  const filteredData = useMemo(() => {
    return (departmentAttendance || [])
      .filter((emp) =>
        emp.FullName?.toLowerCase().includes(searchName.toLowerCase()) ||
        emp.username?.toLowerCase().includes(searchName.toLowerCase())
      )
      .filter((emp) => (departmentFilter === "All" ? true : emp.department === departmentFilter))
      .filter((emp) => {
        if (statusFilter === "All") return true;
        return emp.status === statusFilter;
      });
  }, [departmentAttendance, searchName, departmentFilter, statusFilter]);

  // KPI calculation for selected month
  const stats = useMemo(() => {
    let present = 0, absent = 0, leave = 0, undertime = 0, halfday = 0;

    filteredData.forEach((emp) => {
      if (Array.isArray(emp.pattern) && emp.pattern.length >= 1) {
        const arr = emp.pattern.slice(0, daysInSelectedMonth);
        arr.forEach((p) => {
          if (p === 0) present++;
          else if (p === 1) present++; // Night shift is also present
          else if (p === 2) leave++;
          else if (p === 3) absent++;
          else if (p === "U") undertime++;
          else if (p === "H") halfday++;
        });
      } else if (emp.attendanceRecords && typeof emp.attendanceRecords === "object") {
        const records = emp.attendanceRecords;
        for (let d = 1; d <= daysInSelectedMonth; d++) {
          const dd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), d);
          const key = dd.toISOString().slice(0, 10);
          const status = records[key];
          if (!status) {
            absent++;
          } else if (status === "Present") present++;
          else if (status === "Absent") absent++;
          else if (status === "Leave") leave++;
          else if (status === "Undertime") undertime++;
          else if (status === "Half Day") halfday++;
        }
      } else {
        if (emp.status === "Present") present++;
        else if (emp.status === "Absent") absent++;
        else if (emp.status === "Leave") leave++;
        else if (emp.status === "Undertime") undertime++;
        else if (emp.status === "Half Day") halfday++;
      }
    });

    return { present, absent, leave, undertime, halfday, total: filteredData.length };
  }, [filteredData, selectedMonth, daysInSelectedMonth]);

  // Real attendance trend data based on actual patterns
  const trendData = useMemo(() => {
    const arr = [];
    for (let d = 1; d <= daysInSelectedMonth; d++) {
      let dayPresent = 0;
      let dayAbsent = 0;
      let dayLeave = 0;
      let dayUndertime = 0;

      filteredData.forEach((emp) => {
        if (Array.isArray(emp.pattern) && emp.pattern.length >= d) {
          const status = emp.pattern[d - 1];
          if (status === 0 || status === 1) dayPresent++;
          else if (status === 3) dayAbsent++;
          else if (status === 2) dayLeave++;
          else if (status === "U") dayUndertime++;
        } else if (emp.attendanceRecords && typeof emp.attendanceRecords === "object") {
          const dd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), d);
          const key = dd.toISOString().slice(0, 10);
          const status = emp.attendanceRecords[key];
          if (status === "Present") dayPresent++;
          else if (status === "Absent") dayAbsent++;
          else if (status === "Leave") dayLeave++;
          else if (status === "Undertime") dayUndertime++;
        }
      });

      arr.push({
        day: d,
        present: dayPresent,
        absent: dayAbsent,
        leave: dayLeave,
        undertime: dayUndertime,
      });
    }
    return arr;
  }, [filteredData, daysInSelectedMonth, selectedMonth]);

  return (
    <div className="min-h-screen text-slate-100 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-2/3 h-2/3 mx-auto rounded-full opacity-10 blur-3xl bg-blue-500/40 mt-12" />
      </div>

      <div className="relative z-10  ">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xl text-slate-400">Agents status - <span className="font-semibold text-slate-400">Live</span></p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg pl-3 pr-3 py-2 text-slate-100">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                className="bg-transparent ml-2 outline-none placeholder-slate-500 text-sm"
                placeholder="Search employee..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <button onClick={gotoPreviousMonth} className="px-3 py-2 rounded bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800/80">Prev</button>
              <div className="px-3 py-2 rounded bg-slate-900/40 border border-slate-700/50 text-sm">{monthLabel}</div>
              <button onClick={gotoNextMonth} className="px-3 py-2 rounded bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800/80">Next</button>
            </div>
          </div>
        </div>

        {/* Charts + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Breakdown (Radial Chart) */}
          <div className="col-span-1 bg-slate-900/40 p-4 rounded-lg border border-slate-700/50">
            <h3 className="text-sm font-semibold mb-2 text-white">Monthly Breakdown</h3>

            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="90%"
                  barSize={18}
                  data={[
                    { name: "Present", value: stats.present, fill: "#10b981" },
                    { name: "Absent", value: stats.absent, fill: "#ef4444" },
                    { name: "Leave", value: stats.leave, fill: "#f59e0b" },
                    { name: "Undertime", value: stats.undertime, fill: "#ec4899" },
                    { name: "Half Day", value: stats.halfday, fill: "#3b82f6" },
                  ]}
                >
                  <RadialBar minAngle={10} clockWise dataKey="value" />
                  <Tooltip />
                  <RechartsLegend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconSize={12}
                    wrapperStyle={{ color: "white", marginTop: 10 }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Trend - Real Data */}
          <div className="col-span-2 bg-slate-900/40 p-4 rounded-lg border border-slate-700/50">
            <h3 className="text-sm font-semibold mb-2 text-white">Attendance Trend</h3>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                  <XAxis dataKey="day" tick={{ fill: "#93C5FD" }} />
                  <YAxis tick={{ fill: "#93C5FD" }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} name="Present" />
                  <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
                  <Line type="monotone" dataKey="leave" stroke="#f59e0b" strokeWidth={2} name="Leave" />
                  <Line type="monotone" dataKey="undertime" stroke="#ec4899" strokeWidth={2} name="Undertime" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table below charts */}
          <div className="lg:col-span-3">
            <AttendanceTable
              data={filteredData}
              selectedMonth={selectedMonth}
              daysInMonth={daysInSelectedMonth}
              monthLabel={monthLabel}
              role={role}
            />
          </div>
        </div>
      </div>
    </div>
  );
}