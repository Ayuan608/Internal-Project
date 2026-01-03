import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  X,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  Trash,
  User,
  Edit,
  QrCode,
  CheckCircle,
  Ban,
  Key,
  RefreshCw,
  Eye,
  FileText,
  Download,
  Shield,
  Lock,
  Unlock,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  addAdminAccount,
  deleteUser,
  getAllUsers,
  editUserAccount,
} from "../../redux/authSlice";
import toast from "react-hot-toast";
import MetaData from "../../more/MetaData";
import UserActionsModal from "./ActionModal";

function Admin() {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state?.auth);
  const role = useSelector((state) => state.auth?.role);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [qrModal, setQrModal] = useState(false);
  const [actionModal, setActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [actionUser, setActionUser] = useState(null);
  const [useManualShift, setUseManualShift] = useState(false);

  const [formData, setFormData] = useState({
    FullName: "",
    username: "",
    password: "",
    email: "",
    department: "",
    role: "",
    Shift: "",
    workingHour: "",
  });

  // Sab departments ke liye shift options
  const departmentShifts = {
    "CSR": [
      { value: "Morning", label: "Morning: 4:00 AM - 4:00 PM" },
      { value: "Night", label: "Night: 4:00 PM - 4:00 AM" },
      { value: "Mid", label: "Mid Shift: 10:00 AM - 10:00 PM" }
    ],
    "Deposit": [
      { value: "Morning", label: "Morning: 4:00 AM - 4:00 PM" },
      { value: "Night", label: "Night: 4:00 PM - 4:00 AM" },
      { value: "Mid", label: "Mid Shift: 7:00 AM - 4:00 PM" }
    ],
    "Withdraw": [
      { value: "Morning", label: "Morning: 4:00 AM - 4:00 PM" },
      { value: "Night", label: "Night: 4:00 PM - 4:00 AM" }
    ],
    "Marketing": [
      { value: "Marketing", label: "Marketing: 12 Noon - 12 Midnight" }
    ],
    "Admin": [
      { value: "Morning", label: "Admin Shift: 10:00 AM - 10:00 PM" },
      { value: "Day", label: "Day Shift: 9 AM - 5 PM" }
    ],
    "Checker": [
      { value: "Morning", label: "Checker Shift: 9 AM - 5 PM" },
      { value: "Day", label: "Day Shift: 9 AM - 5 PM" }
    ]
  };

  const rolePermissions = {
    "Super-Admin": ["Team-Leader", "Admin", "User", "Checker"],
    Admin: ["Team-Leader", "User", "Checker"],
  };

  const allowedRoles = rolePermissions[role] || [];

  // Format functions
  const formatDepartment = (dept, userRole) => {
    if (!dept || dept === "undefined") {
      if (userRole === "Admin") return "Admin";
      if (userRole === "Checker") return "Checker";
      return "—";
    }
    return dept;
  };

  const formatRole = (userRole) => {
    if (!userRole || userRole === "undefined") return "—";
    return userRole;
  };

  const formatShift = (shift) => {
    if (!shift || shift === "undefined") return "—";
    return shift;
  };

  // Color mappings
  const departmentColors = {
    CSR: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Deposit: "bg-green-500/20 text-green-300 border-green-500/30",
    Withdraw: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    Marketing: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    Admin: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    Checker: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  };

  const getDepartmentColor = (dept, userRole) => {
    let formattedDept = formatDepartment(dept, userRole);
    if (formattedDept === "—") return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    return departmentColors[formattedDept] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const roleColors = {
    "Super-Admin": "bg-red-500/20 text-red-300 border-red-500/30",
    Admin: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "Team-Leader": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    User: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    Checker: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  };

  const getRoleColor = (userRole) => {
    const formattedRole = formatRole(userRole);
    if (formattedRole === "—") return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    return roleColors[userRole] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const shiftColors = {
    Morning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Night: "bg-green-500/20 text-green-300 border-green-500/30",
    Mid: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    Marketing: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    Day: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Probation: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    Rest: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };

  const getShiftColor = (shift) => {
    const formattedShift = formatShift(shift);
    if (formattedShift === "—") return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    return shiftColors[shift] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  // Effects
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (formData.Shift && !useManualShift) {
      const allShifts = Object.values(departmentShifts).flat();
      const selectedShift = allShifts.find(shift => shift.value === formData.Shift);

      if (selectedShift) {
        const match = selectedShift.label.match(/:\s*(.+)/);
        if (match) {
          const workingHour = match[1].split('|')[0].trim();
          setFormData(prev => ({
            ...prev,
            workingHour: workingHour
          }));
        }
      }
    }
  }, [formData.Shift, useManualShift]);

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users;

    if (activeTab === "checker") {
      filtered = filtered.filter(user => user?.role === "Checker");
    } else if (activeTab === "admin") {
      filtered = filtered.filter(user => user?.role === "Admin");
    } else if (activeTab === "super-admin") {
      filtered = filtered.filter(user => user?.role === "Super-Admin");
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(user =>
        formatDepartment(user.department, user.role) === departmentFilter
      );
    }

    return filtered;
  }, [users, activeTab, searchTerm, departmentFilter]);

  // Statistics
  const statistics = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(
      (user) => user?.status === "active"
    ).length;

    const departmentCount = filteredUsers.reduce((acc, user) => {
      const dept = formatDepartment(user?.department, user?.role);
      if (dept !== "—") {
        acc[dept] = (acc[dept] || 0) + 1;
      }
      return acc;
    }, {});

    const roleCount = filteredUsers.reduce((acc, user) => {
      const role = formatRole(user?.role);
      if (role !== "—") {
        acc[role] = (acc[role] || 0) + 1;
      }
      return acc;
    }, {});

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentHires = filteredUsers.filter((user) => {
      if (!user || !user.dateHired) return false;
      const hiredDate = new Date(user.dateHired);
      return hiredDate >= thirtyDaysAgo;
    }).length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      departmentCount,
      roleCount,
      recentHires,
      activePercentage:
        totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
    };
  }, [filteredUsers]);

  // Get available shifts
  const getAvailableShifts = () => {
    if (formData.role === "Admin") {
      return departmentShifts["Admin"] || [];
    }
    if (formData.role === "Checker") {
      return departmentShifts["Checker"] || [];
    }
    if (formData.department && departmentShifts[formData.department]) {
      return departmentShifts[formData.department];
    }
    return [];
  };

  // Form handlers
  const handleFormInput = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };

    if (name === "role") {
      updatedData.Shift = "";
      updatedData.workingHour = "";
      if (value === "Admin" || value === "Checker") {
        updatedData.department = "";
      }
    }

    if (name === "department") {
      updatedData.Shift = "";
      updatedData.workingHour = "";
      setUseManualShift(false);
    }

    setFormData(updatedData);
  };

  const openAddModal = () => {
    setModalType("add");
    setFormData({
      FullName: "",
      username: "",
      password: "",
      email: "",
      department: "",
      role: "",
      Shift: "",
      workingHour: "",
    });
    setSelectedUser(null);
    setUseManualShift(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setModalType("edit");
    setSelectedUser(user);

    const userShift = user.Shift || "";
    const isManualShift = !["Morning", "Night", "Mid", "Marketing", "Day"].includes(userShift);

    setFormData({
      FullName: user.FullName || "",
      username: user.username || "",
      password: "",
      email: user.email || "",
      department: user.department || "",
      role: user.role || "",
      Shift: userShift,
      workingHour: user.workingHour || "",
    });
    setUseManualShift(isManualShift);
    setIsModalOpen(true);
  };

  // Form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const { FullName, username, password, email, department, role, Shift, workingHour } = formData;

    if (!FullName || !email || !role) {
      toast.error("Please fill required fields");
      return;
    }

    if (modalType === "add") {
      if (!username || !password) {
        toast.error("Username and password are required");
        return;
      }
    }

    if (role !== "Checker" && role !== "Admin" && !department) {
      toast.error("Department is required for this role");
      return;
    }

    if (!Shift || !workingHour) {
      toast.error("Shift and working hours are required");
      return;
    }

    if (FullName.length < 5) {
      toast.error("Name should be at least 5 characters");
      return;
    }

    if (modalType === "add" && !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/)) {
      toast.error("Password must have 8+ chars, Uppercase, Lowercase, Number");
      return;
    }

    if (modalType === "add") {
      const response = await dispatch(addAdminAccount(formData));
      if (response?.payload?.success) {
        toast.success("User added successfully!");
        setIsModalOpen(false);
        dispatch(getAllUsers());
      }
    } else {
      const response = await dispatch(
        editUserAccount({
          id: selectedUser._id,
          userData: formData,
        })
      );
      if (response?.payload?.success) {
        toast.success("User updated successfully!");
        setIsModalOpen(false);
        setSelectedUser(null);
        dispatch(getAllUsers());
      }
    }
  };

  // Delete user function
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    const response = await dispatch(deleteUser(id));

    if (response?.payload?.success) {
      toast.success("User deleted successfully!");
      dispatch(getAllUsers());
    } else {
      toast.error(response?.payload || "Failed to delete user");
    }
  };

  // Action handlers
  const handleAction = async (action, user) => {
    switch (action) {
      case "delete":
        const confirmDelete = window.confirm(
          `Are you sure you want to delete ${user.FullName}?`
        );
        if (!confirmDelete) return;

        const response = await dispatch(deleteUser(user._id));

        if (response?.payload?.success) {
          toast.success("User deleted successfully!");
          dispatch(getAllUsers());
        } else {
          toast.error(response?.payload || "Failed to delete user");
        }
        break;
      case "suspend":
        toast.success(`${user.FullName} has been suspended!`);
        break;
      case "activate":
        toast.success(`${user.FullName} has been activated!`);
        break;
      case "reset-password":
        toast.success(`Password reset link sent to ${user.email}!`);
        break;
      case "view-logs":
        toast.success(`Opening logs for ${user.FullName}...`);
        break;
      case "export-data":
        toast.success(`Exporting data for ${user.FullName}...`);
        break;
      case "toggle-2fa":
        toast.success(`2FA ${user.isTwoFactorEnabled ? "disabled" : "enabled"} for ${user.FullName}!`);
        break;
      default:
        break;
    }
    setActionUser(null);
  };

  if (!allowedRoles.length) {
    return (
      <div className="text-red-500 text-center p-4">
        You don't have permission to add users
      </div>
    );
  }

  // Modal for add/edit
  const renderModal = () => (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-slate-900/30 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] border border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-800/30 bg-slate-900/30">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {modalType === "add" ? <User className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
                {modalType === "add" ? "Add New Employee" : "Edit Employee"}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <form noValidate onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      name="FullName"
                      value={formData.FullName}
                      onChange={handleFormInput}
                      placeholder="Enter employee name"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Email *
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormInput}
                      placeholder="Enter employee email"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Username {modalType === "add" ? "*" : ""}
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleFormInput}
                      placeholder="Enter username"
                      disabled={modalType === "edit"}
                      className={`w-full border border-slate-700 rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${modalType === "edit"
                        ? "bg-slate-800/30 text-gray-400 cursor-not-allowed"
                        : "bg-slate-800/50 text-white"
                        }`}
                    />
                    {modalType === "edit" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Username cannot be changed
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  {modalType === "add" && (
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        Password *
                      </label>
                      <input
                        required
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleFormInput}
                        placeholder="Enter password"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  )}

                  {/* Department (not for Admin/Checker) */}
                  {formData.role !== "Checker" && formData.role !== "Admin" && (
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        Department *
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleFormInput}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option className="bg-slate-800" value="">
                          Select Department
                        </option>
                        <option className="bg-slate-800" value="CSR">
                          CSR Department
                        </option>
                        <option className="bg-slate-800" value="Deposit">
                          Deposit Department
                        </option>
                        <option className="bg-slate-800" value="Withdraw">
                          Withdraw Department
                        </option>
                        <option className="bg-slate-800" value="Marketing">
                          Marketing Department
                        </option>
                      </select>
                    </div>
                  )}

                  {/* Role */}
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleFormInput}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option className="bg-slate-800" value="">
                        Select Role
                      </option>
                      {allowedRoles.map((roleOption) => (
                        <option
                          key={roleOption}
                          value={roleOption}
                          className="bg-slate-800"
                        >
                          {roleOption}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Shift Section - All in One */}
                  <div className="col-span-2">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Shift & Working Hours *
                    </label>

                    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 space-y-4">
                      {/* Toggle for Manual Shift */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="manualShift"
                          checked={useManualShift}
                          onChange={(e) => {
                            setUseManualShift(e.target.checked);
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                Shift: "",
                                workingHour: ""
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor="manualShift" className="text-sm text-gray-300 font-medium">
                          Enter custom shift manually
                        </label>
                      </div>

                      {useManualShift ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-300 mb-2 text-sm">
                              Shift Name *
                            </label>
                            <input
                              type="text"
                              name="Shift"
                              value={formData.Shift}
                              onChange={handleFormInput}
                              placeholder="e.g., Custom Shift"
                              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 mb-2 text-sm">
                              Working Hours *
                            </label>
                            <input
                              type="text"
                              name="workingHour"
                              value={formData.workingHour}
                              onChange={handleFormInput}
                              placeholder="e.g., 9 AM - 5 PM"
                              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-gray-300 mb-2 text-sm">
                            Select Shift *
                          </label>
                          <select
                            name="Shift"
                            value={formData.Shift}
                            onChange={handleFormInput}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            disabled={!formData.role}
                          >
                            <option className="bg-slate-800" value="">
                              {!formData.role
                                ? "Select Role First"
                                : `Select ${formData.role} Shift`}
                            </option>
                            {getAvailableShifts().map((shift) => (
                              <option
                                key={shift.value}
                                value={shift.value}
                                className="bg-slate-800"
                              >
                                {shift.label}
                              </option>
                            ))}
                          </select>

                          {formData.workingHour && (
                            <div className="mt-3 p-3 bg-slate-800/30 rounded-lg">
                              <p className="text-sm text-gray-300 mb-1">Working Hours:</p>
                              <p className="text-white font-medium">{formData.workingHour}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-6">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${modalType === "add"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      } text-white`}
                  >
                    {modalType === "add" ? (
                      <>
                        <Plus className="w-4 h-4 inline mr-2" />
                        Add Employee
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 inline mr-2" />
                        Update Employee
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Main render
  return (
    <div className="min-h-[92.7vh] p-6">
      <MetaData title="Admin Dashboard - User Management" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              User Management
            </h1>
            <p className="text-gray-400">
              Manage your users, employees and their permissions
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddModal}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add User
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "all"
              ? "bg-blue-600 text-white"
              : "bg-slate-800/30 text-gray-300 hover:bg-slate-800/50"
              }`}
          >
            All Users ({users?.length || 0})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("checker")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "checker"
              ? "bg-pink-600 text-white"
              : "bg-slate-800/30 text-gray-300 hover:bg-slate-800/50"
              }`}
          >
            Checkers ({users?.filter(u => u?.role === "Checker")?.length || 0})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("admin")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "admin"
              ? "bg-yellow-600 text-white"
              : "bg-slate-800/30 text-gray-300 hover:bg-slate-800/50"
              }`}
          >
            Admins ({users?.filter(u => u?.role === "Admin")?.length || 0})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("super-admin")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "super-admin"
              ? "bg-red-600 text-white"
              : "bg-slate-800/30 text-gray-300 hover:bg-slate-800/50"
              }`}
          >
            Super Admin ({users?.filter(u => u?.role === "Super-Admin")?.length || 0})
          </motion.button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 flex-wrap items-end">
          <div className="relative flex-1 min-w-[250px] max-w-2xl">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Department Filter Buttons */}
          <div className="flex gap-3">
            {Object.entries(statistics.departmentCount).map(([dept, count]) => {
              const isActive = departmentFilter === dept;
              let buttonColor = "bg-slate-800/30 text-gray-300 border-slate-700 hover:bg-slate-800/50";

              // Color coding for departments
              if (dept === "CSR") {
                buttonColor = isActive
                  ? "bg-blue-600/30 text-blue-300 border-blue-500"
                  : "bg-blue-600/10 text-blue-400 border-blue-600/30 hover:bg-blue-600/20";
              } else if (dept === "Deposit") {
                buttonColor = isActive
                  ? "bg-green-600/30 text-green-300 border-green-500"
                  : "bg-green-600/10 text-green-400 border-green-600/30 hover:bg-green-600/20";
              } else if (dept === "Withdraw") {
                buttonColor = isActive
                  ? "bg-purple-600/30 text-purple-300 border-purple-500"
                  : "bg-purple-600/10 text-purple-400 border-purple-600/30 hover:bg-purple-600/20";
              } else if (dept === "Marketing") {
                buttonColor = isActive
                  ? "bg-orange-600/30 text-orange-300 border-orange-500"
                  : "bg-orange-600/10 text-orange-400 border-orange-600/30 hover:bg-orange-600/20";
              } else if (dept === "Admin") {
                buttonColor = isActive
                  ? "bg-yellow-600/30 text-yellow-300 border-yellow-500"
                  : "bg-yellow-600/10 text-yellow-400 border-yellow-600/30 hover:bg-yellow-600/20";
              } else if (dept === "Checker") {
                buttonColor = isActive
                  ? "bg-pink-600/30 text-pink-300 border-pink-500"
                  : "bg-pink-600/10 text-pink-400 border-pink-600/30 hover:bg-pink-600/20";
              }

              return (
                <motion.button
                  key={dept}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDepartmentFilter(departmentFilter === dept ? "" : dept)}
                  className={`px-5 py-3 rounded-xl font-semibold transition-all border-2 ${buttonColor}`}
                >
                  {dept}: {count}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300 mb-1 font-semibold">TOTAL USERS</p>
              <p className="text-4xl font-bold text-white mb-2">{statistics.totalUsers}</p>
              <p className="text-xs text-blue-200">All registered users</p>
            </div>
            <Users className="w-12 h-12 text-blue-400 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-300 mb-1 font-semibold">ACTIVE USERS</p>
              <p className="text-4xl font-bold text-white mb-2">{statistics.activeUsers}</p>
              <p className="text-xs text-green-200">{statistics.activePercentage}% active rate</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-400 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-300 mb-1 font-semibold">RECENT HIRES</p>
              <p className="text-4xl font-bold text-white mb-2">{statistics.recentHires}</p>
              <p className="text-xs text-purple-200">Last 30 days</p>
            </div>
            <Calendar className="w-12 h-12 text-purple-400 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-300 mb-1 font-semibold">INACTIVE USERS</p>
              <p className="text-4xl font-bold text-white mb-2">{statistics.inactiveUsers}</p>
              <p className="text-xs text-orange-200">Need attention</p>
            </div>
            <Clock className="w-12 h-12 text-orange-400 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/30 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Avatar
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider emailwidth">
                  Email
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider rolewidth">
                  Role
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider shiftwidth">
                  Shift
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider statuswidth">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user?._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 dsb">
                    <img
                      src={user?.avatar?.url}
                      alt={user?.FullName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                    />
                  </td>
                  <td className="px-6 py-4 text-white font-medium capitalize sdas">
                    {user?.FullName}
                  </td>
                  <td className="px-6 py-4 text-gray-300 sdas">
                    {user?.username}
                  </td>
                  <td className="px-6 py-4 text-gray-300 sdasemail">
                    {user?.email || "—"}
                  </td>

                  <td className="px-6 py-4 sdsadepart">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getDepartmentColor(
                        user?.department,
                        user?.role
                      )}`}
                    >
                      {formatDepartment(user?.department, user?.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getRoleColor(
                        user?.role
                      )}`}
                    >
                      {formatRole(user?.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getShiftColor(
                        user?.Shift
                      )}`}
                    >
                      {formatShift(user?.Shift)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${user?.status === "active"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                        }`}
                    >
                      {user?.status === "active" ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <Ban className="w-3 h-3" />
                          Suspended
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      {/* QR Code Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedUser(user);
                          setQrModal(true);
                        }}
                        className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all"
                        title="View QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(user)}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-all"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActionUser(user)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all"
                        title="More Actions"
                      >
                        <Shield className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      {renderModal()}

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModal && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrModal(false)}
          >
            <motion.div
              className="bg-slate-900/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center relative max-w-md w-full border border-slate-800"
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-2 capitalize text-white">
                {selectedUser.FullName}
              </h2>
              <div className="mb-4">
                <label className="text-gray-400 text-sm">Department: </label>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ml-2 ${getDepartmentColor(selectedUser.department, selectedUser.role)}`}>
                  {formatDepartment(selectedUser.department, selectedUser.role)}
                </span>
              </div>

              {selectedUser.qrCode ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <img
                    src={selectedUser.qrCode}
                    alt="QR Code"
                    className="w-64 h-64 object-contain mx-auto bg-white rounded-xl p-4 shadow-lg"
                  />
                </motion.div>
              ) : (
                <div className="w-64 h-64 mx-auto bg-slate-800 rounded-xl flex items-center justify-center">
                  <p className="text-gray-400">No QR Code Available</p>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-semibold shadow-lg w-full"
                onClick={() => setQrModal(false)}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {actionUser && (
          <UserActionsModal
            actionUser={actionUser}
            onClose={() => setActionUser(null)}
            onEdit={(user) => {
              openEditModal(user);
              setActionUser(null);
            }}
            onDelete={(id, name) => {
              handleDelete(id, name);
              setActionUser(null);
            }}
            onActionSelect={(action, user) => {
              setSelectedAction(action);
              setActionUser(user);
              setActionModal(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Admin;