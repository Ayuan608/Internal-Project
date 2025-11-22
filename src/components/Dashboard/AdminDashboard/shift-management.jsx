
import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  Save,
  Search,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getDepartmentUsers, updateUserShift } from "../../../redux/authSlice";


const ShiftManagement = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.auth);

  const [selectedShifts, setSelectedShifts] = useState({});
  const [shiftStartDates, setShiftStartDates] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Backend ENUM Shifts
  const shiftOptions = ["Morning", "Day", "Evening", "Night"];

  // Fetch users on load
  useEffect(() => {
    dispatch(getDepartmentUsers());
  }, [dispatch]);

  // Dynamic Badge Color
  const getShiftBadgeColor = (shift) => {
    switch (shift) {
      case "Morning":
        return "bg-blue-500"; // Sky blue
      case "Day":
        return "bg-green-500";
      case "Evening":
        return "bg-purple-500";
      case "Night":
        return "bg-indigo-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleShiftChange = (userId, shift) => {
    setSelectedShifts((prev) => ({ ...prev, [userId]: shift }));
  };

  const handleStartDateChange = (userId, date) => {
    setShiftStartDates((prev) => ({ ...prev, [userId]: date }));
  };

  const handleShiftUpdate = (userId) => {
    const newShift = selectedShifts[userId];
    const startDate = shiftStartDates[userId];

    if (!newShift || !startDate) return;

    dispatch(
      updateUserShift({
        id: userId,
        Shift: newShift,
        startFrom: startDate,
      })
    ).then(() => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      setSelectedShifts((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });

      setShiftStartDates((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="shadow-lg">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg transition">
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Shift Management
                </h1>
                <p className="text-slate-400 text-sm">
                  Manage employee shifts
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="relative flex-1 min-w-[200px] max-w-[400px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search employee..."
                  className="w-full px-10 py-2 bg-slate-800/40 border border-slate-800 rounded-lg text-sm outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center space-x-2 bg-blue-600 px-4 py-2 rounded-lg">
                <Users className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">
                  {users?.length || 0} Employees
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
            <Save className="w-5 h-5" />
            <span className="font-semibold">Shift updated successfully!</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  {[
                    "Name",
                    "Date Hired",
                    "Salary",
                    "Current Shift",
                    "New Shift",
                    "Start Date",
                    "Action",
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700">
                {users?.map((employee) => (
                  <tr
                    key={employee._id}
                    className="hover:bg-slate-900/50 transition"
                  >
                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-medium">{employee.agent}</span>
                          </div>
                        </td>
                        <div className="ml-4">
                          <div className="text-sm font-medium capitalize text-white">
                            {employee.FullName}
                          </div>
                          <div className="text-sm text-slate-400">
                            {employee.department}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date Hired */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-slate-300">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        {new Date(employee.dateHired).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Salary */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-green-400 font-semibold">
                        {employee.salary || "--"}
                      </span>
                    </td>

                    {/* Current Shift */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                        <span
                          className={`${getShiftBadgeColor(
                            employee.Shift
                          )} text-white px-3 py-1 rounded-full text-xs font-medium`}
                        >
                          {employee.Shift} ({employee.workingHour})
                        </span>
                      </div>
                    </td>

                    {/* New Shift */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={selectedShifts[employee._id] || ""}
                        onChange={(e) =>
                          handleShiftChange(employee._id, e.target.value)
                        }
                        className="bg-slate-900/40 text-white border border-slate-800 rounded-lg px-4 py-2"
                      >
                        <option className="bg-slate-950" value="">
                          Select new shift
                        </option>
                        {shiftOptions.map((shift) => (
                          <option
                            key={shift}
                            className="bg-slate-950"
                            value={shift}
                          >
                            {shift}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Start Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="date"
                        value={shiftStartDates[employee._id] || ""}
                        onChange={(e) =>
                          handleStartDateChange(employee._id, e.target.value)
                        }
                        className="bg-slate-900/40 text-white border border-slate-800 rounded-lg px-4 py-2"
                      />
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleShiftUpdate(employee._id)}
                        disabled={
                          !selectedShifts[employee._id] ||
                          !shiftStartDates[employee._id]
                        }
                        className={`px-6 py-2 rounded-lg font-semibold transition ${selectedShifts[employee._id] &&
                            shiftStartDates[employee._id]
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-slate-600 text-slate-400 cursor-not-allowed"
                          }`}
                      >
                        Shift
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftManagement;
