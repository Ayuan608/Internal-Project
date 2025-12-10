import React, { useState, useEffect } from "react";
import { Search, Edit2, Calendar, UserCheck, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getDepartmentUsers } from "../../../redux/authSlice";
import SuspensionForm from "../TeamLeaderDashboard/SuspensionForm";
import { getDayOffRequests } from "../../../redux/attendenceSlice";
import { useNavigate } from "react-router-dom";

const EmployeeDirectory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { users } = useSelector((state) => state.auth);
  const { dayOffRequests } = useSelector((state) => state.attendance);
  console.log(dayOffRequests)

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [suspensionForm, setSuspensionForm] = useState(false);
  useEffect(() => {
    dispatch(getDepartmentUsers());
    dispatch(getDayOffRequests());
  }, [dispatch]);

  useEffect(() => {
    if (!users) return;

    let filtered = [...users];

    if (activeFilter !== "All") {
      filtered = filtered.filter((emp) => emp.status === activeFilter);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.FullName?.toLowerCase().includes(query) ||
          emp.email?.toLowerCase().includes(query) ||
          emp.phone?.toLowerCase().includes(query)
      );
    }

    setFilteredEmployees(filtered);
  }, [users, searchTerm, activeFilter]);

  const getLeaveCount = (userId) =>
    dayOffRequests.filter((req) => req.userId === userId).length;


  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US");
  };

  const openLeavePage = (employee) => {
    const leaves = dayOffRequests.filter((req) => req.userId === employee._id);
    navigate("/team/leave-request", {
      state: { employee, leaves }
    });
  };
  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Employee Directory</h2>
          <p className="text-slate-400">Manage and monitor your team</p>
        </div>
        <button
          onClick={() => setSuspensionForm(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white rounded-lg"
        >
          Add Suspension Form
        </button>
      </div>

      <SuspensionForm
        suspensionForm={suspensionForm}
        setSuspensionForm={setSuspensionForm}
      />

      <div className="  p-6 rounded-xl mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-3 text-slate-400" />
            <input
              className="pl-12 pr-4 py-3 w-full bg-slate-900/40 text-slate-200 rounded-lg border border-slate-700 focus:ring-2 focus:ring-blue-600"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {["All", "Active", "Inactive"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg ${activeFilter === filter
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700/50 text-slate-300"
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-left  custom-employee-table">
          <thead className="border-b border-slate-700">
            <tr>
              {["Name", "DATE Hired", "Salary", "Phone", "Email", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-slate-400 uppercase text-sm text-center"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp) => (
              <tr
                key={emp._id}
                className="hover:bg-slate-700/20 transition-colors text-start afjj"
              >
                <td className="px-6 py-4 text-white capitalize afjj">{emp.FullName}</td>
                <td className="px-6 py-4 text-slate-300">
                  {formatDate(emp.dateHired)}
                </td>
                <td
                  className={`px-6 py-4 font-medium salerywidth ${emp.salary && Number(emp.salary) < 20000
                      ? "text-red-500"
                      : "text-emerald-400"
                    }`}
                >
                  {emp.salary
                    ? `₱${Number(emp.salary).toLocaleString("en-PH")}`
                    : "N/A"}
                </td>


                <td className="px-6 py-4 text-slate-300 phwidth">+63{emp.phone}</td>
                <td className="px-6 py-4 text-slate-300 hfiash">{emp.email}</td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${emp.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                  >
                    {emp.status}
                  </span>
                </td>

                <td className="px-6 py-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => openLeavePage(emp)}
                    className="relative px-3 py-2 bg-blue-600/20 border border-blue-500/40 text-blue-300 rounded-lg hover:bg-blue-600/30"
                  >
                    <Calendar size={16} />

                    {/* Badge */}
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 rounded-full">
                      {getLeaveCount(emp._id)}
                    </span>
                  </button>

                  <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600">
                    <Edit2 size={16} className="text-slate-300" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDirectory;
