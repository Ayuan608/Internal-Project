import { Calendar, Users, UserCheck, UserX, Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDepartmentWiseUsers } from './../../../redux/attendenceSlice';

export default function AttendanceDashboard() {
  const [searchName, setSearchName] = useState("");

  const dispatch = useDispatch();

  const { departmentAttendance, department } = useSelector(
    (state) => state.attendance
  );


  const { role } = useSelector((state) => state?.auth);


  // Fetch department data on component mount
  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        await dispatch(getDepartmentWiseUsers()).unwrap();
      } catch (error) {
        console.error("Failed to fetch department data:", error);
      }
    };

    fetchDepartmentData();
  }, [dispatch]);

  // Search filter
  const filteredData = useMemo(() => {
    if (!departmentAttendance || !Array.isArray(departmentAttendance)) {
      return [];
    }

    return departmentAttendance.filter((emp) =>
      emp.FullName?.toLowerCase().includes(searchName.toLowerCase()) ||
      emp.username?.toLowerCase().includes(searchName.toLowerCase())
    );
  }, [departmentAttendance, searchName]);


  // Calculate stats
  const stats = useMemo(() => {
    if (!filteredData || !Array.isArray(filteredData)) {
      return { present: 0, absent: 0, leave: 0, total: 0 };
    }
    const present = filteredData.filter((e) => e.status === "Present").length;
    const absent = filteredData.filter((e) => e.status === "Absent").length;
    const leave = filteredData.filter((e) => e.status === "Leave").length;
    return { present, absent, leave, total: filteredData.length };
  }, [filteredData]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-emerald-500/20 border-emerald-500 text-emerald-300";
      case "Absent":
        return "bg-red-500/20 border-red-500 text-red-300";
      case "Leave":
        return "bg-amber-500/20 border-amber-500 text-amber-300";
      default:
        return "bg-slate-500/20 border-slate-500 text-slate-300";
    }
  };

  const getPatternColor = (p) => {
    const colors = {
      0: "bg-yellow-400 text-black",
      1: "bg-green-400 text-black",
      2: "bg-blue-400 text-white",
      3: "bg-red-500 text-white",
    };
    return colors[p] || "bg-slate-400";
  };



  const userDepartment = department || "Your Department";

  return (
    <div className="min-h-screen  text-slate-100">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-2/3 h-2/3 mx-auto rounded-full opacity-10 blur-3xl bg-blue-500/40 mt-12" />
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        {role !== "Super-Admin" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Attendance Dashboard</h1>
                <p className="text-blue-300">Department: <span className="font-semibold text-blue-100">{userDepartment}</span></p>
              </div>
              <div className="text-right text-slate-400">
                <p className="text-sm">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-emerald-500/60 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-300 mb-1">Today's Present</p>
                    <p className="text-3xl font-bold text-emerald-100">{stats.present}</p>
                    <p className="text-xs text-emerald-400 mt-2">Out of {stats.total}</p>
                  </div>
                  <UserCheck className="w-10 h-10 text-emerald-500/60" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-900/30 to-red-900/10 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-red-500/60 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-300 mb-1">Today's Absent</p>
                    <p className="text-3xl font-bold text-red-100">{stats.absent}</p>
                    <p className="text-xs text-red-400 mt-2">Needs follow-up</p>
                  </div>
                  <UserX className="w-10 h-10 text-red-500/60" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 border border-amber-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-amber-500/60 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-300 mb-1">Today's Leave</p>
                    <p className="text-3xl font-bold text-amber-100">{stats.leave}</p>
                    <p className="text-xs text-amber-400 mt-2">Approved</p>
                  </div>
                  <Calendar className="w-10 h-10 text-amber-500/60" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-blue-500/60 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300 mb-1">Total Staff</p>
                    <p className="text-3xl font-bold text-blue-100">{stats.total}</p>
                    <p className="text-xs text-blue-400 mt-2">Registered</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-500/60" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {role !== "Super-Admin" && (
          <div className="flex justify-end mb-3">
            <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg pl-4 pr-4 py-2 text-slate-100 placeholder-slate-500  focus-within:bg-slate-900/70 transition">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="bg-transparent w-full rounded-lg pl-2 pr-4 py-1 text-slate-100 placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white">Schedule & Attendance</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-700/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">User Id</th>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Schedule</th>
                  <th className="px-4 py-3 text-left">Shift</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Month Pattern</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredData.length > 0 ? (
                  filteredData.map((emp, idx) => (
                    <tr key={emp.id} className="hover:bg-slate-800/40 transition whitespace-nowrap">
                      <td className="px-4 py-3 text-sm text-slate-300">  {emp._id ? emp._id.slice(0, 8) : 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-white">{emp.FullName}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{emp.clockIn ? new Date(emp.clockIn).toLocaleTimeString() : 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{emp.Shift}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(emp.status)}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 max-w-full">
                          {(emp.pattern || []).map((p, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded text-[10px] font-semibold flex items-center justify-center cursor-pointer hover:opacity-80 transition ${getPatternColor(p)}`}
                              title={`Day ${i + 1}`}
                            >
                              {p === 0 ? "D" : p === 1 ? "N" : p === 2 ? "RD" : "A"}
                            </div>
                          ))}
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                      {departmentAttendance && departmentAttendance.length === 0
                        ? "No employees found in your department"
                        : "No employees found matching your search"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-900/30 border-t border-slate-700/50 flex items-center gap-4 text-xs">
            <span className="text-slate-400">Legend:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-300">
              <span className="w-3 h-3 rounded bg-yellow-400"></span> Day
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-500/20 border border-green-500/30 text-green-300">
              <span className="w-3 h-3 rounded bg-green-400"></span> Night
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300">
              <span className="w-3 h-3 rounded bg-blue-400"></span> Rest Day
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/20 border border-red-500/30 text-red-300">
              <span className="w-3 h-3 rounded bg-red-500"></span> Absent
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}