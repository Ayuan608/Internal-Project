import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Trophy,
  Award,
  Users,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Send,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  clearStatus,
  createEmployeeOfMonth,
  deleteEmployeeOfMonth,
  fetchAllEmployeesOfMonth,
  updateEmployeeOfMonth
} from "../../../../redux/employeeOfMonthSlice";

const EmployeeOfTheMonthAdmin = () => {
  const dispatch = useDispatch();

  // Redux state
  const { announcements, loading, error, success } = useSelector(
    (state) => state.employeeOfMonth || {
      announcements: [],
      loading: false,
      error: null,
      success: false
    }
  );

  const [activeTab, setActiveTab] = useState("create");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const departments = [
    {
      id: "CSR",
      name: "CSR Department",
      color: "blue",
    },
    { id: "Deposit", name: "Deposit Department", color: "emerald" },
    { id: "Withdrawal", name: "Withdrawal Department", color: "purple" },
  ];

  const [formData, setFormData] = useState({
    employeeName: "",
    department: "",
    month: "",
    year: new Date().getFullYear(),
    achievements: "",
    message: "",
    hasGoodPerformance: false,
    hasNoLate: false,
    hasNoMissingPunches: false,
  });

  // Fetch all employees on component mount
  useEffect(() => {
    dispatch(fetchAllEmployeesOfMonth());
  }, [dispatch]);

  // Handle success state
  useEffect(() => {
    if (success) {
      setShowModal(true);
      dispatch(clearStatus());

      if (editMode) {
        setEditMode(false);
        setEditId(null);
      }
      resetForm();
    }
  }, [success, editMode, dispatch]);

  // Handle error state
  useEffect(() => {
    if (error) {
      alert(`Error: ${error}`);
      dispatch(clearStatus());
    }
  }, [error, dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({
      employeeName: "",
      department: "",
      month: "",
      year: new Date().getFullYear(),
      achievements: "",
      message: "",
      hasGoodPerformance: false,
      hasNoLate: false,
      hasNoMissingPunches: false,
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.employeeName ||
      !formData.department ||
      !formData.month ||
      !formData.achievements
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // if (
    //   !formData.hasGoodPerformance ||
    //   !formData.hasNoLate ||
    //   !formData.hasNoMissingPunches
    // ) {
    //   alert(
    //     "Employee must meet all selection criteria: Good Performance, No Late, and No Missing Punches"
    //   );
    //   return;
    // }

    const employeeData = {
      employeeName: formData.employeeName,
      department: formData.department,
      month: formData.month,
      year: formData.year,
      achievements: formData.achievements,
      message: formData.message,
      hasGoodPerformance: formData.hasGoodPerformance,
      hasNoLate: formData.hasNoLate,
      hasNoMissingPunches: formData.hasNoMissingPunches,
    };

    try {
      if (editMode && editId) {
        await dispatch(updateEmployeeOfMonth({ id: editId, updatedData: employeeData })).unwrap();
      } else {
        await dispatch(createEmployeeOfMonth(employeeData)).unwrap();
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  const handleEdit = (employee) => {
    const deptId = departments.find((d) => d.name === employee.department)?.id || "";

    setFormData({
      employeeName: employee.name || employee.employeeName,
      department: deptId,
      month: employee.month,
      year: employee.year,
      achievements: employee.achievements,
      message: employee.message || "",
      hasGoodPerformance: employee.hasGoodPerformance,
      hasNoLate: employee.hasNoLate,
      hasNoMissingPunches: employee.hasNoMissingPunches,
    });

    setEditMode(true);
    setEditId(employee._id || employee.id);
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await dispatch(deleteEmployeeOfMonth(id)).unwrap();
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditId(null);
    resetForm();
  };

  const getDepartmentColor = (deptName) => {
    if (deptName?.includes("Customer Service")) return "blue";
    if (deptName?.includes("Deposit")) return "emerald";
    if (deptName?.includes("Withdrawal")) return "purple";
    return "slate";
  };

  return (
    <div className="min-h-screen bg-[rgba(59,130,246,0.03)] p-2">
      <div className="w-full">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-6 flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              <span className="text-white font-semibold">Processing...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/30">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Employee of the Month
              </h1>
              <p className="text-slate-400 text-lg">
                Recognize outstanding performance across departments
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === "create"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "bg-[rgba(59,130,246,0.03)] text-slate-300 border border-slate-700 hover:bg-slate-800"
              }`}
          >
            <Plus className="w-5 h-5" />
            Create Announcement
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === "view"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "bg-[rgba(59,130,246,0.03)] text-slate-300 border border-slate-700 hover:bg-slate-800"
              }`}
          >
            <Award className="w-5 h-5" />
            View All Announcements
          </button>
        </div>

        {/* Create Tab */}
        {activeTab === "create" && (
          <div className="space-y-6">
            {/* Edit Mode Banner */}
            {editMode && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit2 className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-amber-400 font-bold">Edit Mode Active</p>
                    <p className="text-amber-300/70 text-sm">
                      You are editing an existing announcement
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                >
                  Cancel Edit
                </button>
              </div>
            )}

            {/* Department Stats */}
            <div className="grid grid-cols-3 gap-6">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-[rgba(59,130,246,0.03)] cursor-pointer backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  style={{
                    borderColor: activeTab === "create" ? undefined : undefined
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Users
                      className={`w-6 h-6 ${dept.color === "blue"
                          ? "text-blue-400"
                          : dept.color === "emerald"
                            ? "text-emerald-400"
                            : "text-purple-400"
                        }`}
                    />
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${dept.color === "blue"
                          ? "bg-blue-500/10 text-blue-400"
                          : dept.color === "emerald"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-purple-500/10 text-purple-400"
                        }`}
                    >
                      {
                        announcements.filter((e) => e.department === dept.name)
                          .length
                      }{" "}
                      Awarded
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">
                    {dept.name}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Track and recognize excellence
                  </p>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-black backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Award className="w-7 h-7 text-amber-400" />
                {editMode ? "Edit Employee of the Month" : "Nominate Employee of the Month"}
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-2">
                      Employee Name *
                    </label>
                    <input
                      type="text"
                      name="employeeName"
                      value={formData.employeeName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1  focus:border-transparent transition-all"
                      placeholder="Enter employee full name"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:border-transparent transition-all"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-2">
                      Month *
                    </label>
                    <select
                      name="month"
                      value={formData.month}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:border-transparent transition-all"
                    >
                      <option value="">Select Month</option>
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Selection Criteria */}
                <div className="bg-black border border-slate-700 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400" />
                    Selection Criteria
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Employee must meet all criteria below to be nominated
                  </p>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 bg-[rgba(59,130,246,0.03)] rounded-lg cursor-pointer hover:bg-slate-800 transition-all border border-slate-700/50">
                      <input
                        type="checkbox"
                        name="hasGoodPerformance"
                        checked={formData.hasGoodPerformance}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="text-white font-semibold block">
                          Good Performance
                        </span>
                        <span className="text-slate-400 text-sm">
                          Consistently meets or exceeds performance metrics
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 bg-[rgba(59,130,246,0.03)] rounded-lg cursor-pointer hover:bg-slate-800 transition-all border border-slate-700/50">
                      <input
                        type="checkbox"
                        name="hasNoLate"
                        checked={formData.hasNoLate}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="text-white font-semibold block">
                          No Late Arrivals
                        </span>
                        <span className="text-slate-400 text-sm">
                          Perfect attendance record with no late check-ins
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 bg-[rgba(59,130,246,0.03)] rounded-lg cursor-pointer hover:bg-slate-800 transition-all border border-slate-700/50">
                      <input
                        type="checkbox"
                        name="hasNoMissingPunches"
                        checked={formData.hasNoMissingPunches}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="text-white font-semibold block">
                          No Missing Punches
                        </span>
                        <span className="text-slate-400 text-sm">
                          Complete time tracking with no missed clock-ins/outs
                        </span>
                      </div>
                    </label>
                  </div>

                  {(!formData.hasGoodPerformance ||
                    !formData.hasNoLate ||
                    !formData.hasNoMissingPunches) && (
                      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-amber-400 text-sm font-medium">
                          ⚠️ All criteria must be checked to proceed with
                          nomination
                        </p>
                      </div>
                    )}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Key Achievements *
                  </label>
                  <textarea
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-black border border-slate-800 rounded-xl text-white placeholder-slate-500 outline-none"
                    placeholder="Describe the employee's outstanding achievements and contributions"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Recognition Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-black border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none"
                    placeholder="Write a personalized message to celebrate this achievement (optional)"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {editMode ? "Update Announcement" : "Post Announcement"}
                      </>
                    )}
                  </button>
                  <button
                    onClick={editMode ? handleCancelEdit : resetForm}
                    disabled={loading}
                    className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all duration-300 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editMode ? "Cancel" : "Clear Form"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Tab */}
        {activeTab === "view" && (
          <div className="grid grid-cols-2 gap-4">
            {announcements.length === 0 ? (
              <div className="text-center py-20 col-span-2">
                <Trophy className="w-10 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No announcements yet</p>
              </div>
            ) : (
              announcements.map((employee) => {
                const color = getDepartmentColor(employee.department);
                return (
                  <div
                    key={employee._id || employee.id}
                    className="bg-black backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-6 flex-1">
                        <div
                          className={`p-3 rounded-2xl shadow-lg h-full ${color === "blue"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600"
                              : color === "emerald"
                                ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                : "bg-gradient-to-br from-purple-500 to-purple-600"
                            }`}
                        >
                          <Trophy className="w-8 h-8 text-white" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-white">
                              {employee.name || employee.employeeName}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${color === "blue"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : color === "emerald"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                }`}
                            >
                              {employee.month} {employee.year}
                            </span>
                          </div>

                          <p className="text-slate-300 font-medium mb-3">
                            {employee.department}
                          </p>

                          {/* Criteria Badges */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {employee.hasGoodPerformance && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">
                                <CheckCircle className="w-3 h-3" />
                                Good Performance
                              </span>
                            )}
                            {employee.hasNoLate && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold border border-blue-500/20">
                                <CheckCircle className="w-3 h-3" />
                                No Late
                              </span>
                            )}
                            {employee.hasNoMissingPunches && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-bold border border-purple-500/20">
                                <CheckCircle className="w-3 h-3" />
                                No Missing Punches
                              </span>
                            )}
                          </div>

                          <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-4 mb-3">
                            <p className="text-slate-400 text-sm font-semibold mb-2">
                              Key Achievements:
                            </p>
                            <p className="text-slate-200">
                              {employee.achievements}
                            </p>
                          </div>

                          {employee.message && (
                            <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-4 mb-3">
                              <p className="text-slate-400 text-sm font-semibold mb-2">
                                Recognition Message:
                              </p>
                              <p className="text-slate-200">
                                {employee.message}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Calendar className="w-4 h-4" />
                            Posted on{" "}
                            {employee.datePosted
                              ? new Date(employee.datePosted).toLocaleDateString()
                              : employee.createdAt
                                ? new Date(employee.createdAt).toLocaleDateString()
                                : "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          disabled={loading}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee._id || employee.id)}
                          disabled={loading}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Success Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[rgba(59,130,246,0.03)] border border-slate-800/30 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                  <CheckCircle className="w-16 h-16 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {editMode ? "Announcement Updated!" : "Announcement Posted!"}
                </h3>
                <p className="text-slate-400 mb-6">
                  {editMode
                    ? "The employee of the month announcement has been successfully updated."
                    : "The employee of the month has been successfully announced."}
                </p>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setActiveTab("view");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeOfTheMonthAdmin;