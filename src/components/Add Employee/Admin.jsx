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
import countries from "../../Helpers/countriles";

function Admin() {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state?.auth);
  const role = useSelector((state) => state.auth?.role);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [qrModal, setQrModal] = useState(false);
  const [actionModal, setActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [actionUser, setActionUser] = useState(null);

  // Single form state for both add and edit
  const [formData, setFormData] = useState({
    FullName: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    department: "",
    dateHired: "",
    role: "",
    salary: "",
    workingHour: "",
    Shift: "",
  });

  const [selectedCountry] = useState(
    countries.find((c) => c.dialCode === "+63")
  );

  const rolePermissions = {
    "Super-Admin": ["Team-Leader", "Admin", "User", "Checker"],
    Admin: ["Team-Leader", "User", "Checker"],
  };

  const allowedRoles = rolePermissions[role] || [];

  // Check if role should show extra fields
  const shouldShowExtraFields = (userRole) => {
    return !["Admin", "Checker"].includes(userRole);
  };

  // Format department name
  const formatDepartment = (dept) => {
    if (!dept || dept === "undefined") return "—";
    return dept;
  };

  // Format role name
  const formatRole = (userRole) => {
    if (!userRole || userRole === "undefined") return "—";
    return userRole;
  };

  // Format shift name
  const formatShift = (shift, userRole) => {
    if (["Admin", "Checker"].includes(userRole)) return "—";
    if (!shift || shift === "undefined") return "—";
    return shift;
  };

  // Format phone number
  const formatPhone = (phone, userRole) => {
    if (["Admin", "Checker"].includes(userRole) && !phone) return "—";
    if (!phone) return "—";
    return `+63 ${phone}`;
  };

  // Format salary
  const formatSalary = (salary, userRole) => {
    if (["Admin", "Checker"].includes(userRole) && !salary) return "—";
    if (!salary) return "—";
    return new Intl.NumberFormat("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(salary);
  };

  // Department colors
  const departmentColors = {
    CSR: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Deposit: "bg-green-500/20 text-green-300 border-green-500/30",
    Withdraw: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    Marketing: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  };

  const getDepartmentColor = (dept) => {
    const formattedDept = formatDepartment(dept);
    if (formattedDept === "—") return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    return departmentColors[dept] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  // Role colors
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

  // Shift colors
  const shiftColors = {
    Morning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Evening: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    Night: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    Rotational: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  };

  const getShiftColor = (shift, userRole) => {
    if (["Admin", "Checker"].includes(userRole)) return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    const formattedShift = formatShift(shift, userRole);
    if (formattedShift === "—") return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    return shiftColors[shift] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Filter users based on active tab
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users;

    // Filter by tab
    if (activeTab === "checker") {
      filtered = filtered.filter(user => user?.role === "Checker");
    } else if (activeTab === "admin") {
      filtered = filtered.filter(user => user?.role === "Admin");
    } else if (activeTab === "super-admin") {
      filtered = filtered.filter(user => user?.role === "Super-Admin");
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by department
    if (departmentFilter) {
      filtered = filtered.filter(user =>
        formatDepartment(user.department) === departmentFilter
      );
    }

    return filtered;
  }, [users, activeTab, searchTerm, departmentFilter]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(
      (user) => user?.status === "active"
    ).length;

    // Department distribution
    const departmentCount = filteredUsers.reduce((acc, user) => {
      const dept = formatDepartment(user?.department);
      if (dept !== "—") {
        acc[dept] = (acc[dept] || 0) + 1;
      }
      return acc;
    }, {});

    // Role distribution
    const roleCount = filteredUsers.reduce((acc, user) => {
      const role = formatRole(user?.role);
      if (role !== "—") {
        acc[role] = (acc[role] || 0) + 1;
      }
      return acc;
    }, {});

    // Recent hires (last 30 days)
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

  // Handle form input change
  const handleFormInput = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };

    // Handle Checker role - no department
    if (name === "role" && value === "Checker") {
      updatedData.department = "";
    }

    // Handle Admin role - clear extra fields
    if (name === "role" && value === "Admin") {
      updatedData.phone = "";
      updatedData.dateHired = "";
      updatedData.salary = "";
      updatedData.workingHour = "";
      updatedData.Shift = "";
    }

    setFormData(updatedData);
  };

  // Open modal for add
  const openAddModal = () => {
    setModalType("add");
    setFormData({
      FullName: "",
      username: "",
      password: "",
      email: "",
      phone: "",
      department: "",
      dateHired: "",
      role: "",
      salary: "",
      workingHour: "",
      Shift: "",
    });
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const openEditModal = (user) => {
    setModalType("edit");
    setSelectedUser(user);
    setFormData({
      FullName: user.FullName || "",
      username: user.username || "",
      password: "",
      email: user.email || "",
      phone: user.phone || "",
      department: user.department || "",
      dateHired: user.dateHired
        ? new Date(user.dateHired).toISOString().split("T")[0]
        : "",
      role: user.role || "",
      salary: user.salary || "",
      workingHour: user.workingHour || "",
      Shift: user.Shift || "",
    });
    setIsModalOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const { FullName, username, password, email, phone, department, dateHired, role, salary, workingHour, Shift } = formData;

    // Basic validation
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

    // Department validation for non-Checker roles
    if (role !== "Checker" && !department) {
      toast.error("Department is required for this role");
      return;
    }

    // Extra fields validation for non-Admin/Checker roles
    if (shouldShowExtraFields(role)) {
      if (!phone || !dateHired || !salary || !workingHour || !Shift) {
        toast.error("Please fill all the details");
        return;
      }
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

  // Handle delete
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

  // Handle action modal
  const openActionModal = (user, action) => {
    setActionUser(user);
    setSelectedAction(action);
    setActionModal(true);
  };

  // Handle action execution
  const handleAction = async () => {
    switch (selectedAction) {
      case "suspend":
        toast.success(`${actionUser.FullName} has been suspended!`);
        break;
      case "activate":
        toast.success(`${actionUser.FullName} has been activated!`);
        break;
      case "reset-password":
        toast.success(`Password reset link sent to ${actionUser.email}!`);
        break;
      case "view-logs":
        toast.success(`Opening logs for ${actionUser.FullName}...`);
        break;
      case "export-data":
        toast.success(`Exporting data for ${actionUser.FullName}...`);
        break;
      default:
        break;
    }
    setActionModal(false);
    dispatch(getAllUsers());
  };

  if (!allowedRoles.length) {
    return (
      <div className="text-red-500 text-center p-4">
        You don't have permission to add users
      </div>
    );
  }

  return (
    <div className="min-h-[92.7vh] p-6">
      <MetaData title="Admin Dashboard - User Management" />

      {/* Header */}
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

          <div className="flex gap-3">
            {Object.entries(statistics.departmentCount).map(([dept, count]) => {
              const isActive = departmentFilter === dept;
              let buttonColor = "bg-slate-800/30 text-gray-300 border-slate-700 hover:bg-slate-800/50";

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
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider phonewidth">
                  Phone
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
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider salerywith">
                  Salary
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
                  <td className="px-6 py-4 text-gray-300 sddsphone">
                    {formatPhone(user?.phone, user?.role)}
                  </td>
                  <td className="px-6 py-4 sdsadepart">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getDepartmentColor(
                        user?.department
                      )}`}
                    >
                      {formatDepartment(user?.department)}
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
                        user?.Shift,
                        user?.role
                      )}`}
                    >
                      {formatShift(user?.Shift, user?.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`flex items-center gap-1 font-semibold ${user?.salary > 20000 ? "text-purple-400" : "text-red-400"
                        }`}
                    >
                      <span className="text-lg font-bold">₱</span>
                      {formatSalary(user?.salary, user?.role)}
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

                      {/* Edit Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(user)}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-all"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>

                      {/* Action Menu Button (Suspended, Reset Password, etc.) */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActionUser(user)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all"
                        title="More Actions"
                      >
                        <Shield className="w-4 h-4" />
                      </motion.button>

                      {/* Delete Button */}
                      {role !== "Admin" && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(user._id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Single Modal for Add/Edit */}
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
              {/* Header */}
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

              {/* Form */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                <form onSubmit={handleFormSubmit} className="space-y-4">
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

                    {/* Password - Only for Add */}
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

                    {/* Department */}
                    {formData.role !== "Checker" && (
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

                    {/* Extra Fields for non-Admin/Checker */}
                    {shouldShowExtraFields(formData.role) && (
                      <>
                        {/* Phone */}
                        <div>
                          <label className="block text-gray-300 mb-2 text-sm font-medium">
                            Phone Number *
                          </label>
                          <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white w-full">
                            <div className="relative flex items-center mr-2 min-w-[85px]">
                              <select
                                value={selectedCountry.dialCode}
                                onChange={(e) => {
                                  const country = countries.find(
                                    (c) => c.dialCode === e.target.value
                                  );
                                }}
                                className="bg-transparent text-white outline-none text-sm cursor-pointer appearance-none w-full"
                              >
                                {countries.map((country, index) => (
                                  <option
                                    key={index}
                                    value={country.dialCode}
                                    className="bg-slate-800"
                                  >
                                    {country.flag} {country.dialCode}
                                  </option>
                                ))}
                              </select>
                              <span className="absolute right-6 text-white pointer-events-none text-sm">
                                ▼
                              </span>
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={(e) => {
                                const onlyDigits = e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 10);
                                setFormData({ ...formData, phone: onlyDigits });
                              }}
                              placeholder="9168636883"
                              className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                            />
                          </div>
                        </div>

                        {/* Date Hired */}
                        <div>
                          <label className="block text-gray-300 mb-2 text-sm font-medium">
                            Date Hired *
                          </label>
                          <input
                            type="date"
                            name="dateHired"
                            value={formData.dateHired}
                            onChange={handleFormInput}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>

                        {/* Salary */}
                        <div>
                          <label className="block text-gray-300 mb-2 text-sm font-medium">
                            Salary *
                          </label>
                          <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleFormInput}
                            placeholder="Enter salary"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>

                        {/* Working Hours */}
                        <div>
                          <label className="block text-gray-300 mb-2 text-sm font-medium">
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

                        {/* Shift */}
                        <div>
                          <label className="block text-gray-300 mb-2 text-sm font-medium">
                            Shift *
                          </label>
                          <select
                            name="Shift"
                            value={formData.Shift}
                            onChange={handleFormInput}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          >
                            <option className="bg-slate-800" value="">
                              Select Shift
                            </option>
                            <option className="bg-slate-800" value="Morning">
                              Morning
                            </option>
                            <option className="bg-slate-800" value="Night">
                              Night
                            </option>
                          </select>
                        </div>
                      </>
                    )}
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
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ml-2 ${getDepartmentColor(selectedUser.department)}`}>
                  {formatDepartment(selectedUser.department)}
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

      {/* Action Menu Modal */}
      <AnimatePresence>
        {actionUser && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActionUser(null)}
          >
            <motion.div
              className="bg-slate-900/30 backdrop-blur-xl rounded-2xl shadow-2xl p-6 relative max-w-md w-full border border-slate-800"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Manage {actionUser.FullName}
              </h3>

              <div className="space-y-3 mb-6">
                {/* Suspend/Activate */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const action = actionUser.status === "active" ? "suspend" : "activate";
                    openActionModal(actionUser, action);
                    setActionUser(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${actionUser.status === "active"
                      ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                      : "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                    }`}
                >
                  {actionUser.status === "active" ? (
                    <>
                      <Ban className="w-5 h-5" />
                      Suspend User
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Activate User
                    </>
                  )}
                </motion.button>

                {/* Reset Password */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    openActionModal(actionUser, "reset-password");
                    setActionUser(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
                >
                  <Key className="w-5 h-5" />
                  Reset Password
                </motion.button>

                {/* View Activity Logs */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    openActionModal(actionUser, "view-logs");
                    setActionUser(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                >
                  <Eye className="w-5 h-5" />
                  View Activity Logs
                </motion.button>

                {/* Export User Data */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    openActionModal(actionUser, "export-data");
                    setActionUser(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                >
                  <Download className="w-5 h-5" />
                  Export User Data
                </motion.button>

                {/* Enable/Disable 2FA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    openActionModal(actionUser, "toggle-2fa");
                    setActionUser(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                >
                  <Lock className="w-5 h-5" />
                  {actionUser.isTwoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-gray-300 hover:bg-slate-800/70 transition font-semibold"
                onClick={() => setActionUser(null)}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {actionModal && actionUser && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActionModal(false)}
          >
            <motion.div
              className="bg-slate-900/30 backdrop-blur-xl rounded-2xl shadow-2xl p-6 relative max-w-md w-full border border-slate-800"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                {selectedAction === "suspend" && <Ban className="w-5 h-5 text-red-400" />}
                {selectedAction === "activate" && <CheckCircle className="w-5 h-5 text-green-400" />}
                {selectedAction === "reset-password" && <Key className="w-5 h-5 text-yellow-400" />}
                {selectedAction === "view-logs" && <Eye className="w-5 h-5 text-blue-400" />}
                {selectedAction === "export-data" && <Download className="w-5 h-5 text-purple-400" />}
                {selectedAction === "toggle-2fa" && <Lock className="w-5 h-5 text-indigo-400" />}
                {selectedAction === "suspend" && "Confirm Suspension"}
                {selectedAction === "activate" && "Confirm Activation"}
                {selectedAction === "reset-password" && "Reset Password"}
                {selectedAction === "view-logs" && "View Activity Logs"}
                {selectedAction === "export-data" && "Export User Data"}
                {selectedAction === "toggle-2fa" && "2FA Settings"}
              </h3>

              <p className="text-gray-300 mb-6">
                {selectedAction === "suspend" && `Are you sure you want to suspend ${actionUser.FullName}? They will not be able to login.`}
                {selectedAction === "activate" && `Are you sure you want to activate ${actionUser.FullName}? They will be able to login again.`}
                {selectedAction === "reset-password" && `A password reset link will be sent to ${actionUser.email}. They will need to set a new password.`}
                {selectedAction === "view-logs" && `View login history and activity logs for ${actionUser.FullName}.`}
                {selectedAction === "export-data" && `Export all data for ${actionUser.FullName} including profile, activity logs, and transactions.`}
                {selectedAction === "toggle-2fa" && `${actionUser.isTwoFactorEnabled ? "Disable" : "Enable"} two-factor authentication for ${actionUser.FullName}.`}
              </p>

              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActionModal(false)}
                  className="px-6 py-2.5 bg-slate-700 rounded-xl hover:bg-slate-600 text-white font-semibold transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAction}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg ${selectedAction === "suspend" ? "bg-red-600 hover:bg-red-700" :
                      selectedAction === "activate" ? "bg-green-600 hover:bg-green-700" :
                        "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                >
                  {selectedAction === "suspend" && "Suspend"}
                  {selectedAction === "activate" && "Activate"}
                  {selectedAction === "reset-password" && "Send Reset Link"}
                  {selectedAction === "view-logs" && "View Logs"}
                  {selectedAction === "export-data" && "Export"}
                  {selectedAction === "toggle-2fa" && (actionUser.isTwoFactorEnabled ? "Disable" : "Enable")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Admin;