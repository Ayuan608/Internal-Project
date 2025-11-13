import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  X,
  Shield,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  DollarSign,
  QrCode,
  Trash,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  addAdminAccount,
  deleteUser,
  getAllUsers,
  updateUserRole,
} from "../../redux/authSlice";
import toast from "react-hot-toast";
import MetaData from "../../more/MetaData";
import countries from "../../Helpers/countriles";
import { useTranslation } from "react-i18next";

function Admin() {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state?.auth);
  const role = useSelector((state) => state.auth?.role);
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleModal, setRoleModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [actionMenuUser, setActionMenuUser] = useState(null);

  const [addUser, setAddUser] = useState({
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

  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((c) => c.dialCode === "+63")
  );

  const rolePermissions = {
    "Super-Admin": ["Team-Leader", "Admin", "User", "Checker"],
    "Admin": ["Team-Leader", "User", "Checker"],
  };
  const allowedRoles = rolePermissions[role] || [];

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Department colors
  const departmentColors = {
    CSR: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Deposit: "bg-green-500/20 text-green-300 border-green-500/30",
    Withdraw: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    Marketing: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  };

  // Role colors
  const roleColors = {
    "Super-Admin": "bg-red-500/20 text-red-300 border-red-500/30",
    "Admin": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "Team-Leader": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    "User": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    "Checker": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  };

  // Shift colors
  const shiftColors = {
    Morning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Evening: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    Night: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    Rotational: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  };

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter(user => {
      const matchesSearch = searchTerm === "" ||
        user.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "" || user.role === roleFilter;
      const matchesDepartment = departmentFilter === "" || user.department === departmentFilter;

      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [users, searchTerm, roleFilter, departmentFilter]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(user => user?.status === "active").length;

    // Department distribution
    const departmentCount = filteredUsers.reduce((acc, user) => {
      acc[user?.department] = (acc[user?.department] || 0) + 1;
      return acc;
    }, {});

    // Recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentHires = filteredUsers.filter(user => {
      if (!user || !user.dateHired) return false;
      const hiredDate = new Date(user.dateHired);
      return hiredDate >= thirtyDaysAgo;
    }).length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      departmentCount,
      recentHires,
      activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
    };
  }, [filteredUsers]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!users) return { roles: [], departments: [] };

    const roles = [...new Set(users.map(user => user?.role).filter(Boolean))];
    const departments = [...new Set(users.map(user => user?.department).filter(Boolean))];

    return { roles, departments };
  }, [users]);

  const handleUserInput = (e) => {
    const { name, value } = e.target;
    setAddUser({ ...addUser, [name]: value });
  };

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

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const {
      FullName,
      username,
      email,
      password,
      phone,
      department,
      dateHired,
      role,
      salary,
      workingHour,
      Shift,
    } = addUser;

    if (
      !FullName ||
      !username ||
      !password ||
      !email ||
      !department ||
      !phone ||
      !dateHired ||
      !role ||
      !salary ||
      !workingHour ||
      !Shift
    ) {
      toast.error("Please fill all the details");
      return;
    }

    if (FullName.length < 5) {
      toast.error("Name should be at least 5 characters");
      return;
    }

    if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/)) {
      toast.error("Password must have 8+ chars, Uppercase, Lowercase, Number");
      return;
    }

    const response = await dispatch(addAdminAccount(addUser));

    if (response?.payload?.success) {
      toast.success("User/employee added successfully!");
      setAddUser({
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
      setIsDialogOpen(false);
      dispatch(getAllUsers());
    }
  };

  if (!allowedRoles.length) {
    return (
      <div className="text-red-500 text-center p-4">
        You don't have permission to add users
      </div>
    );
  }

  return (
    <div className="min-h-[92.7vh]  p-6">
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
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add User
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
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Avatar</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Shift</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Salary</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
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
                  <td className="px-6 py-4">
                    <img
                      src={user?.avatar?.url}
                      alt={user?.FullName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                    />
                  </td>
                  <td className="px-6 py-4 text-white font-medium capitalize">{user?.FullName}</td>
                  <td className="px-6 py-4 text-gray-300">{user?.username}</td>
                  <td className="px-6 py-4 text-gray-300">{user?.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-300">+91{user?.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${departmentColors[user?.department] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                      {user?.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${roleColors[user?.role] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                      {user?.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${shiftColors[user?.Shift] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                      {user?.Shift}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {user?.salary ? `${parseInt(user.salary).toLocaleString()}` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${user?.status === "active"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-red-500/20 text-red-300"
                      }`}>
                      {user?.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedUser(user)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all"
                        title="View QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setActionMenuUser(user);
                          setNewRole(user.role);
                          setRoleModal(true);
                        }}
                        className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all"
                        title="Change Role"
                      >
                        <Shield className="w-4 h-4" />
                      </motion.button>
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

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUser(null)}
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
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ml-2 ${departmentColors[selectedUser.department] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                  {selectedUser.department || 'N/A'}
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

              <div className="text-gray-300 text-sm leading-relaxed mt-6 bg-slate-800/60 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  How to use:
                </h3>
                <ol className="text-left list-decimal list-inside space-y-2">
                  <li>Open Google Authenticator app</li>
                  <li>Tap "+" to add a new account</li>
                  <li>Select "Scan a QR code"</li>
                  <li>Scan this code</li>
                </ol>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-semibold shadow-lg w-full"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsDialogOpen(false)}
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
                  <User className="w-6 h-6" />
                  Add New Employee
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsDialogOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2  rounded-lg"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Form */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        Full Name *
                      </label>
                      <input
                        required
                        type="text"
                        name="FullName"
                        value={addUser.FullName}
                        onChange={handleUserInput}
                        placeholder="Enter employee name"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        Email *
                      </label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={addUser.email}
                        onChange={handleUserInput}
                        placeholder="Enter employee email"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        Username *
                      </label>
                      <input
                        required
                        type="text"
                        name="username"
                        value={addUser.username}
                        onChange={handleUserInput}
                        placeholder="Enter username"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        Password *
                      </label>
                      <input
                        required
                        type="password"
                        name="password"
                        value={addUser.password}
                        onChange={handleUserInput}
                        placeholder="Enter password"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

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
                              setSelectedCountry(country);
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
                          value={addUser.phone}
                          onChange={(e) => {
                            const onlyDigits = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);
                            setAddUser({ ...addUser, phone: onlyDigits });
                          }}
                          placeholder="9168636883"
                          className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        Department *
                      </label>
                      <select
                        name="department"
                        value={addUser.department}
                        onChange={handleUserInput}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option className="bg-slate-800" value="">Select Department</option>
                        <option className="bg-slate-800" value="CSR">CSR Department</option>
                        <option className="bg-slate-800" value="Deposit">Deposit Department</option>
                        <option className="bg-slate-800" value="Withdraw">Withdraw Department</option>
                        <option className="bg-slate-800" value="Marketing">Marketing Department</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        Role *
                      </label>
                      <select
                        name="role"
                        value={addUser.role}
                        onChange={handleUserInput}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option className="bg-slate-800" value="">Select Role</option>
                        {allowedRoles.map((roleOption) => (
                          <option key={roleOption} value={roleOption} className="bg-slate-800">
                            {roleOption}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        Date Hired *
                      </label>
                      <input
                        type="date"
                        name="dateHired"
                        value={addUser.dateHired}
                        onChange={handleUserInput}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        Salary *
                      </label>
                      <input
                        type="number"
                        name="salary"
                        value={addUser.salary}
                        onChange={handleUserInput}
                        placeholder="Enter salary"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        Working Hours *
                      </label>
                      <input
                        type="text"
                        name="workingHour"
                        value={addUser.workingHour}
                        onChange={handleUserInput}
                        placeholder="e.g., 9 AM - 5 PM"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        Shift *
                      </label>
                      <select
                        name="Shift"
                        value={addUser.Shift}
                        onChange={handleUserInput}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option className="bg-slate-800" value="">Select Shift</option>
                        <option className="bg-slate-800" value="Morning">Morning</option>
                        <option className="bg-slate-800" value="Night">Night</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 ">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsDialogOpen(false)}
                      className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all shadow-lg"
                    >
                      Add Employee
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Change Modal */}
      <AnimatePresence>
        {roleModal && actionMenuUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setRoleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-slate-900/30 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-slate-800 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Change Role
              </h2>
              <p className="text-gray-400 mb-6">
                Update role for <span className="text-white font-semibold">{actionMenuUser?.FullName}</span>
              </p>

              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {allowedRoles.map((roleOption) => (
                  <option key={roleOption} value={roleOption} className="bg-slate-800">
                    {roleOption}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRoleModal(false)}
                  className="px-6 py-2.5 bg-slate-700 rounded-xl hover:bg-slate-600 text-white font-semibold transition-all"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    await dispatch(
                      updateUserRole({ id: actionMenuUser?._id, role: newRole })
                    );
                    dispatch(getAllUsers());
                    setRoleModal(false);
                    setActionMenuUser(null);
                    toast.success("Role updated successfully!");
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all shadow-lg"
                >
                  Save Changes
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