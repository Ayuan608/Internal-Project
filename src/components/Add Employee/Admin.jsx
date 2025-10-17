import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  X,
  MoreVertical,
  QrCode,
  Edit,
  Trash,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addAdminAccount,
  deleteUser,
  getAllUsers,
} from "../../redux/authSlice";
import toast from "react-hot-toast";
import { DataGrid } from "@mui/x-data-grid";

import MetaData from "../../more/MetaData";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import TeamLeaderStats from "../Dashboard/SuperAdminDashboardRoute/ui/TeamLeaderStats";
import { UserStats } from "./../../Helpers/Helper";
import countries from "../../Helpers/countriles";

function Admin() {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state?.auth);
  const role = useSelector((state) => state.auth?.role);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const open = Boolean(anchorEl);

  const [addUser, setAddUser] = useState({
    FullName: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    department: "",
    dateHired: "",
    role: "",
  });
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((c) => c.dialCode === "+63")
  );
  const rolePermissions = {
    'Super-Admin': ['Team-Leader', 'User', 'Checker'],
    'Team-Leader': ['User'],
  };
  const allowedRoles = rolePermissions[role] || [];
  useEffect(() => {
    console.log("Current User Role:", role);
    console.log("Allowed Roles:", allowedRoles);
  }, [role, allowedRoles]);

  if (!allowedRoles.length) {
    return (
      <div className="text-red-500 text-center p-4">
        You don't have permission to add users
      </div>
    );
  }
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleUserInput = (e) => {
    const { name, value } = e.target;
    setAddUser({ ...addUser, [name]: value });
  };

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleQRCodeClick = () => {
    if (selectedRow?.qrCode) {
      setQrCodeImage(selectedRow.qrCode);
      setQrModalOpen(true);
      handleMenuClose();
    } else {
      toast.error(`QR Code not available for this user`);
      handleMenuClose();
    }
  };
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this data?"
    );
    if (!confirmDelete) return;
    const response = await dispatch(deleteUser(id));

    if (response?.payload?.success) {
      toast.success("Admin deleted successfully!");
      dispatch(getAllUsers());
    } else {
      toast.error(response?.payload || "Failed to delete admin");
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const { FullName, username, email, password, phone, department, dateHired, role } =
      addUser;

    if (
      !FullName ||
      !username ||
      !password ||
      !email ||
      !department ||
      !phone ||
      !dateHired ||
      !role
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
    console.log("Submitting user:", addUser);

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
        role: ""
      });
      setIsDialogOpen(false);
      dispatch(getAllUsers());
    }
  };

  const columns = [
    {
      field: "avatar",
      headerName: "Avatar",
      width: 90,
      renderCell: (params) => (
        <img
          src={params.row.avatar?.url || "/default-avatar.png"}
          alt={params.row.FullName}
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
      sortable: false,
      filterable: false,
    },
    { field: "FullName", headerName: "Name", flex: 1 },
    { field: "username", headerName: "Username", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      renderCell: (params) => (
        <span className="text-white">+91{params?.row?.phone || "N/A"}</span>
      ),
    },
    {
      field: "dateHired",
      headerName: "Date Hired",
      flex: 1,
      renderCell: (params) => {
        const date = params?.row?.dateHired;
        const formattedDate = date
          ? new Date(date).toLocaleDateString("en-IN")
          : "N/A";
        return <span className="text-white">{formattedDate}</span>;
      },
    },

    { field: "department", headerName: "Department", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${params.row.status === "Active"
            ? "bg-green-500/20 text-green-400"
            : "bg-yellow-500/20 text-yellow-400"
            }`}
        >
          {params.row.status}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 90,
      renderCell: (params) => (
        <button
          onClick={(e) => handleMenuOpen(e, params.row)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <MoreVertical size={20} />
        </button>
      ),
      sortable: false,
      filterable: false,
    },
  ];
  const rows = (users || []).map((user, index) => ({
    id: user?._id ?? index,
    ...user,
  }));

  return (
    <div className="min-h-[92.7vh] pt-5 flex flex-col gap-6 text-white bg-gradient-to-br">
      <MetaData title="Admin Dashboard - User Management" />

      {/* Header and Filters */}
      <div className="overflow-x-auto rounded-xl shadow-2xl px-4 py-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-400">
            Manage your users and employees and their permissions
          </p>
        </div>

        <div className="flex items-center justify-end gap-4 w-full max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Filter by name/role/department..."
              className="bg-[#f5f6fa13] text-white rounded-full pl-9 pr-3 py-3 w-full text-sm focus:outline-none placeholder:text-white"
            />
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-white" />
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 px-4 py-1.5 rounded-lg font-semibold text-lg cursor-pointer transition-all ease-in-out duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Plus className="inline w-4 h-4" />
            Add User
          </button>
        </div>
      </div>
      {/* <DashboardStats /> */}
      <TeamLeaderStats title="User" data={UserStats} />
      {/* DataGrid Table */}

      <div className="h-full w-full rounded-sm overflow-hidden shadow-xl">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          className:
            "bg-[#1e1f26] text-white rounded-lg shadow-lg border border-gray-700",
          style: { minWidth: 180 },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleQRCodeClick}>
          <ListItemIcon>
            <QrCode size={16} className="text-white" />
          </ListItemIcon>
          <ListItemText primary="QR Code" />
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Edit size={16} className="text-white" />
          </ListItemIcon>
          <ListItemText primary="Edit User" />
        </MenuItem>
        {role !== 'Team-Leader' && (
          <MenuItem onClick={() => handleDelete(selectedRow?._id)}>
            <ListItemIcon>
              <Trash size={16} className="text-white" />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        )}
      </Menu>

      {/* QR Code Modal */}
      {qrModalOpen && qrCodeImage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#2e303759] p-6 backdrop-blur-3xl rounded-2xl shadow-2xl text-center border border-gray-700 max-w-sm w-full mx-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                QR Code Scanner
              </h2>
              <p className="text-gray-400">
                Scan this code to access user privileges
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl mb-6">
              <img
                src={qrCodeImage}
                alt="QR Code"
                className="w-64 h-64 object-contain mx-auto"
              />
            </div>
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={() => setQrModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add User Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2e303759] backdrop-blur-3xl rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] border border-[#9E9FA74D] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6">
              <h2 className="text-2xl font-bold text-white">Add Employee</h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-400 rounded-full p-0.5 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form
              noValidate
              onSubmit={handleAddAdmin}
              className="p-4 space-y-4"
            >
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  name="FullName"
                  value={addUser.FullName}
                  onChange={handleUserInput}
                  placeholder="Enter employee name"
                  className="w-full bg-[#2e303759] border border-gray-600 rounded-full px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Email
                </label>
                <input
                  required
                  type="text"
                  name="email"
                  value={addUser.email}
                  onChange={handleUserInput}
                  placeholder="Enter employee email"
                  className="w-full bg-[#2e303759] border border-gray-600 rounded-full px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={addUser.username}
                    onChange={handleUserInput}
                    placeholder="Enter username na"
                    className="w-full bg-[#2e303759] border border-gray-600 rounded-full px-4 py-3 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={addUser.password}
                    onChange={handleUserInput}
                    placeholder="Enter password na"
                    className="w-full bg-[#2e303759] border border-gray-600 rounded-full px-4 py-3 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  <div className="flex items-center bg-[#2e303759] border border-gray-600 rounded-full px-4 py-3 text-white w-full">
                    {/* Country Selector */}
                    <div className="relative flex items-center mr-2 min-w-[85px]">
                      <select
                        value={selectedCountry.dialCode}
                        onChange={(e) => {
                          const country = countries.find((c) => c.dialCode === e.target.value);
                          setSelectedCountry(country);
                        }}
                        className="bg-transparent text-white outline-none text-sm cursor-pointer appearance-none  w-full"
                      >
                        {countries.map((country, index) => (
                          <option
                            key={index}
                            value={country.dialCode}
                            className="text-black"
                          >
                            {country.flag} {country.dialCode}
                          </option>
                        ))}
                      </select>

                      {/* Custom Arrow */}
                      <span className="absolute right-6 text-white pointer-events-none text-sm">▼</span>
                    </div>

                    {/* Phone Input */}
                    <input
                      type="tel"
                      name="phone"
                      value={addUser.phone}
                      onChange={(e) => {
                        const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setAddUser({ ...addUser, phone: onlyDigits });
                      }}
                      placeholder="9168636883"
                      className="bg-transparent outline-none w-full text-white placeholder-gray-400"
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Department
                  </label>
                  <select
                    name="department"
                    value={addUser.department}
                    onChange={handleUserInput}
                    className="w-full bg-[#2e303759] border border-gray-600 rounded-full px-4 py-3 text-white"
                  >
                    <option value="">Select Department</option>
                    <option value="CSR">CSR Deparment</option>
                    <option value="Deposit">Deposit Department</option>
                    <option value="Withdraw">WithDraw Department</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Role
                  </label>
                  <select
                    name="role"
                    value={addUser.role}
                    onChange={handleUserInput}
                    className="w-full bg-[#2e303759] border border-gray-600 rounded-full px-4 py-3 text-white"
                  >
                    <option value="">Select Role</option>
                    {allowedRoles.map(roleOption => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Date Hired
                  </label>
                  <input
                    type="date"
                    name="dateHired"
                    value={addUser.dateHired}
                    onChange={handleUserInput}
                    className="w-full bg-[#2e303759] border border-gray-600 rounded-full px-4 py-3 text-white"
                  />
                </div>
              </div>


              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-6 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
