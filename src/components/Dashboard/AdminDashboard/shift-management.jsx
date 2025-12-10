import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  Search,
  Download,
  Filter,
  Zap,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getDepartmentUsers, updateUserShift } from "../../../redux/authSlice";

const ShiftManagement = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.auth);

  const [selectedShifts, setSelectedShifts] = useState({});
  const [shiftStartDates, setShiftStartDates] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [animateRow, setAnimateRow] = useState(null);

  const departmentConfig = {
    CSR: {
      badge: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
      border: "border border-blue-500/30",
      bg: "bg-blue-500/15",
      text: "text-blue-400"
    },
    Deposit: {
      badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      border: "border border-emerald-500/30",
      bg: "bg-emerald-500/15",
      text: "text-emerald-400"
    },
    Withdrawal: {
      badge: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
      border: "border border-purple-500/30",
      bg: "bg-purple-500/15",
      text: "text-purple-400"
    },
    Marketing: {
      badge: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
      border: "border border-orange-500/30",
      bg: "bg-orange-500/15",
      text: "text-orange-400"
    }
  };

  const shiftConfig = {
    Morning: {
      icon: Sunrise,
      CSR: {
        bg: "bg-blue-500/15",
        text: "text-blue-400",
        border: "border-blue-500/30"
      },
      Deposit: {
        bg: "bg-emerald-500/15",
        text: "text-emerald-400",
        border: "border-emerald-500/30"
      },
      Withdrawal: {
        bg: "bg-purple-500/15",
        text: "text-purple-400",
        border: "border-purple-500/30"
      },
      Marketing: {
        bg: "bg-orange-500/15",
        text: "text-orange-400",
        border: "border-orange-500/30"
      },

      times: {
        CSR: [{ start: "04:00", end: "16:00", hours: 12 }],

        Deposit: [
          { start: "04:00", end: "16:00", hours: 12 }
        ],

        Withdrawal: [
          { start: "04:00", end: "16:00", hours: 12 }
        ],

        Marketing: [
          { start: "12:00", end: "24:00", hours: 12 }
        ]
      }
    },

    "Trainee (M)": {
      icon: Sun,
      CSR: {
        bg: "bg-blue-500/15",
        text: "text-blue-400",
        border: "border-blue-500/30"
      },
      Deposit: {
        bg: "bg-emerald-500/15",
        text: "text-emerald-400",
        border: "border-emerald-500/30"
      },
      Withdrawal: {
        bg: "bg-purple-500/15",
        text: "text-purple-400",
        border: "border-purple-500/30"
      },
      Marketing: {
        bg: "bg-orange-500/15",
        text: "text-orange-400",
        border: "border-orange-500/30"
      },

      times: {
        Deposit: [{ start: "07:00", end: "16:00", hours: 9 }],
        Withdrawal: [{ start: "07:00", end: "16:00", hours: 9 }]
      }
    },

    "Trainee (N)": {
      icon: Sunset,
      CSR: {
        bg: "bg-blue-500/15",
        text: "text-blue-400",
        border: "border-blue-500/30"
      },
      Deposit: {
        bg: "bg-emerald-500/15",
        text: "text-emerald-400",
        border: "border-emerald-500/30"
      },
      Withdrawal: {
        bg: "bg-purple-500/15",
        text: "text-purple-400",
        border: "border-purple-500/30"
      },
      Marketing: {
        bg: "bg-orange-500/15",
        text: "text-orange-400",
        border: "border-orange-500/30"
      },

      times: {
        Withdrawal: [{ start: "19:00", end: "04:00", hours: 9 }]
      }
    },

    Night: {
      icon: Moon,
      CSR: {
        bg: "bg-blue-500/15",
        text: "text-blue-400",
        border: "border-blue-500/30"
      },
      Deposit: {
        bg: "bg-emerald-500/15",
        text: "text-emerald-400",
        border: "border-emerald-500/30"
      },
      Withdrawal: {
        bg: "bg-purple-500/15",
        text: "text-purple-400",
        border: "border-purple-500/30"
      },
      Marketing: {
        bg: "bg-orange-500/15",
        text: "text-orange-400",
        border: "border-orange-500/30"
      },

      times: {
        CSR: [{ start: "16:00", end: "04:00", hours: 12 }],

        Deposit: [
          { start: "16:00", end: "04:00", hours: 12 },
          { start: "07:00", end: "16:00", hours: 9 } // I kept your line
        ],

        Withdrawal: [
          { start: "16:00", end: "04:00", hours: 12 }
        ]
      }
    }
  };


  const shiftOptions = ["Morning", "Trainee (M)", "Trainee (N)", "Night"];


  // Format time to 12-hour format
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${period}`;
  };

  const getShiftTimeDisplay = (shift) => {
    const fixedTimes = {
      "Morning": [{ start: "04:00", end: "16:00", hours: 12 }],
      "Trainee (M)": [{ start: "07:00", end: "16:00", hours: 9 }],
      "Trainee (N)": [{ start: "19:00", end: "04:00", hours: 9 }],
      "Night": [{ start: "16:00", end: "04:00", hours: 12 }]
    };

    return fixedTimes[shift] || [];
  };



  // Format Philippine Peso
  const formatPHP = (amount) => {
    if (!amount) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  useEffect(() => {
    dispatch(getDepartmentUsers());
  }, [dispatch]);

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

    setAnimateRow(userId);

    dispatch(
      updateUserShift({
        id: userId,
        Shift: newShift,
        startFrom: startDate,
      })
    ).then(() => {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setAnimateRow(null);
      }, 2500);

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

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.agent?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      departmentFilter === "all" || user.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen ">
      {/* Subtle Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative">
        {/* Header */}
        <div className=" backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-40">
          <div className="max-w-full mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center space-x-5">
                <button
                  onClick={() => window.history.back()}
                  className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 hover:scale-105"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-300" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Shift Management</h1>
                  <p className="text-slate-400 text-sm mt-0.5">Real-time workforce scheduling system</p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex gap-3 items-center">
                {/* Search */}
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-slate-400 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-72 pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-slate-600 focus:bg-slate-800/70 transition-all duration-200"
                  />
                </div>

                {/* Department Filter */}
                <div className="relative flex items-center bg-slate-800/50 border border-slate-700/50 rounded-lg px-3.5 py-2.5 hover:bg-slate-800/70 transition-all duration-200">
                  <Filter className="w-4 h-4 text-slate-400 mr-2" />
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer pr-8"
                  >
                    <option value="all" className="bg-slate-900">All Departments</option>
                    <option value="CSR" className="bg-slate-900">CSR</option>
                    <option value="Deposit" className="bg-slate-900">Deposit</option>
                    <option value="Withdrawal" className="bg-slate-900">Withdrawal</option>
                    <option value="Marketing" className="bg-slate-900">Marketing</option>
                  </select>
                </div>

                {/* Export Button */}
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-lg font-medium text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed top-24 right-6 z-50 animate-slideIn">
            <div className="bg-emerald-600 px-5 py-3.5 rounded-lg shadow-2xl flex items-center gap-3 border border-emerald-500">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <div>
                <p className="font-semibold text-white text-sm">Success!</p>
                <p className="text-emerald-100 text-xs">Shift updated successfully</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="max-w-full mx-auto px-6 py-6">
          <div className=" backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/50 bg-slate-900/20">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Date Hired
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Current Shift
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      New Shift
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers?.map((employee) => {
                    const shiftData = shiftConfig[employee.Shift] || {};
                    const ShiftIcon = shiftData.icon || Clock;
                    const deptConfig = departmentConfig[employee.department] || departmentConfig.CSR;
                    const shiftColors = departmentConfig[employee.department] || departmentConfig["CSR"];

                    const isAnimating = animateRow === employee._id;
                    const timeSlots = getShiftTimeDisplay(employee.Shift, employee.department);

                    return (
                      <tr
                        key={employee._id}
                        className={`hover:bg-slate-800/30 transition-all duration-200 ${isAnimating ? "bg-slate-800/50 animate-pulse" : ""
                          }`}
                      >
                        {/* Employee Column */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <div className="text-sm font-semibold text-white capitalize">
                              {employee.FullName}
                            </div>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium w-fit ${deptConfig.badge} transition-all duration-200 ${deptConfig.hover}`}>
                              <Users className="w-3 h-3" />
                              {employee.department}
                            </div>
                          </div>
                        </td>

                        {/* Date Hired Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="font-medium">{formatDate(employee.dateHired)}</span>
                          </div>
                        </td>

                        {/* Salary Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold text-sm ${employee.salary < 20000 ? "text-red-400" : "text-emerald-400"
                                }`}
                            >
                              {formatPHP(employee.salary)}
                            </span>
                          </div>
                        </td>


                        {/* Current Shift Column */}
                        <td className="px-6 py-4">
                          <div className={`inline-flex flex-col gap-1.5 ${shiftColors.bg} ${shiftColors.border} px-4 py-2.5 rounded-lg transition-all duration-200 hover:scale-105`}>


                            <div className="flex items-center gap-2">
                              <ShiftIcon className={`w-4 h-4 ${shiftColors.text}`} />
                              <span className={`font-semibold text-sm ${shiftColors.text}`}>
                                {employee.Shift}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              {Array.isArray(timeSlots) ? (
                                timeSlots.map((slot, idx) => (
                                  <div key={idx} className={`text-xs font-medium ${shiftColors.text} opacity-90`}>
                                    {slot.text}
                                  </div>
                                ))
                              ) : (
                                <div className={`text-xs font-medium ${shiftColors.text} opacity-90`}>
                                  {timeSlots[0]?.text}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* New Shift Column */}
                        <td className="px-6 py-4">
                          <select
                            value={selectedShifts[employee._id] || ""}
                            onChange={(e) => handleShiftChange(employee._id, e.target.value)}
                            className="w-52 bg-slate-800/50 text-white text-sm border border-slate-700/50 rounded-lg px-3.5 py-2.5 font-medium focus:border-slate-600 focus:bg-slate-800/70 focus:outline-none transition-all duration-200 hover:bg-slate-800/70 cursor-pointer"
                          >
                            <option value="" className="bg-slate-900">Select new shift</option>

                            {shiftOptions.map((shift) => {
                              const t = getShiftTimeDisplay(shift)[0];

                              return (
                                <option key={shift} value={shift} className="bg-slate-900">
                                  {shift} — {formatTime(t.start)} – {formatTime(t.end)}
                                </option>
                              );
                            })}


                          </select>

                        </td>

                        {/* Start Date Column */}
                        <td className="px-6 py-4">
                          <input
                            type="date"
                            value={shiftStartDates[employee._id] || ""}
                            onChange={(e) => handleStartDateChange(employee._id, e.target.value)}
                            className="w-44 bg-slate-800/50 text-white text-sm border border-slate-700/50 rounded-lg px-3.5 py-2.5 font-medium focus:border-slate-600 focus:bg-slate-800/70 focus:outline-none transition-all duration-200 hover:bg-slate-800/70"
                          />
                        </td>

                        {/* Action Column */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleShiftUpdate(employee._id)}
                            disabled={!selectedShifts[employee._id] || !shiftStartDates[employee._id]}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${selectedShifts[employee._id] && shiftStartDates[employee._id]
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                              : "bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700/30"
                              }`}
                          >
                            <Zap className="w-4 h-4" />
                            Update Shift
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {(!filteredUsers || filteredUsers.length === 0) && (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-400 text-lg font-medium mb-2">No employees found</p>
                <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        /* Smooth scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};

export default ShiftManagement;