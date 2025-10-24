import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MoreVertical,
  Edit,
  Trash,
  QrCode,
  X,
  Download,
  FileText,
  UserX,
  Calendar,
  UserCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addAdminAccount,
  deleteUser,
  getAllUsers,
} from "../../../redux/authSlice";

function EmployeeDirectory() {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state?.auth);
  const role = useSelector((state) => state.auth?.role);

  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showMenu, setShowMenu] = useState(null);

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

  // Fetch all users on component mount
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Filter logic
  useEffect(() => {
    if (!users) return;

    let filtered = [...users];

    if (selectedDepartment !== "All") {
      filtered = filtered.filter(
        (emp) => emp.department === selectedDepartment
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.FullName?.toLowerCase().includes(query) ||
          emp.role?.toLowerCase().includes(query) ||
          emp.department?.toLowerCase().includes(query) ||
          emp.email?.toLowerCase().includes(query)
      );
    }

    setFilteredEmployees(filtered);
  }, [searchQuery, selectedDepartment, users]);

  const handleUserInput = (e) => {
    const { name, value } = e.target;
    setAddUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async (e) => {
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
      !email ||
      !department ||
      !phone ||
      !dateHired ||
      !role ||
      !salary ||
      !workingHour ||
      !Shift
    ) {
      alert("Please fill all the details");
      return;
    }

    if (FullName.length < 5) {
      alert("Name should be at least 5 characters");
      return;
    }

    if (
      !isEditMode &&
      !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/)
    ) {
      alert("Password must have 8+ chars, Uppercase, Lowercase, Number");
      return;
    }

    const response = await dispatch(addAdminAccount(addUser));

    if (response?.payload?.success) {
      alert("Employee added successfully!");
      resetForm();
      dispatch(getAllUsers());
    } else {
      alert(response?.payload?.message || "Failed to add employee");
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setAddUser({
      FullName: employee.FullName,
      username: employee.username,
      password: "",
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      dateHired: employee.dateHired?.split("T")[0] || "",
      role: employee.role,
      salary: employee.salary,
      workingHour: employee.workingHour,
      Shift: employee.Shift,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
    setShowMenu(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;

    const response = await dispatch(deleteUser(id));

    if (response?.payload?.success) {
      alert("Employee deleted successfully!");
      dispatch(getAllUsers());
    } else {
      alert(response?.payload?.message || "Failed to delete employee");
    }
    setShowMenu(null);
  };

  const handleQRCode = (employee) => {
    if (employee?.qrCode) {
      setQrCodeImage(employee.qrCode);
      setQrModalOpen(true);
    } else {
      alert("QR Code not available for this user");
    }
    setShowMenu(null);
  };

  // Team Leader specific functions
  const handleDeactivate = (employee) => {
    // Implement deactivate functionality
    alert(`Deactivating employee: ${employee.FullName}`);
    setShowMenu(null);
  };

  const handleRestDay = (employee) => {
    // Implement rest day functionality
    alert(`Setting rest day for: ${employee.FullName}`);
    setShowMenu(null);
  };

  const resetForm = () => {
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
    setIsEditMode(false);
    setSelectedEmployee(null);
    setIsDialogOpen(false);
  };

  const exportToCSV = () => {
    if (!filteredEmployees.length) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Department",
      "Role",
      "Shift",
      "Salary",
      "Status",
    ];
    const rows = filteredEmployees.map((emp) => [
      emp.FullName,
      emp.email,
      emp.phone,
      emp.department,
      emp.role,
      emp.Shift,
      emp.salary,
      emp.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };



  const rolePermissions = {
    "Super-Admin": ["Team-Leader", "Admin", "User", "Checker"],
    Admin: ["Team-Leader", "User", "Checker"],
  };
  const allowedRoles = rolePermissions[role] || [];

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-WHITE flex items-center gap-2">
              Employee Directory
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your team members and their information
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 flex-wrap">

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 "
            />
          </div>
     
        </div>
      </div>

      {/* Employee Table */}
      <div className=" rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Avatar</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left whitespace-nowrap">Working Hours</th>
                <th className="px-6 py-4 text-left">Salary</th>
                <th className="px-6 py-4 text-left">Department</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left">Shift</th>
                {/* Status column added for Team Leader */}
                {role === "Team-Leader" && (
                  <th className="px-6 py-4 text-left">Status</th>
                )}
                <th className="px-6 py-4 text-left">Phone</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!users || users.length === 0 ? (
                <tr>
                  <td colSpan={role === "Team-Leader" ? "11" : "10"} className="text-center py-12 text-gray-500">
                    <FileText
                      size={48}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <p className="text-lg">No employees found</p>
                    <p className="text-sm">
                      Add your first employee to get started
                    </p>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={role === "Team-Leader" ? "11" : "10"} className="text-center py-12 text-gray-500">
                    <Search size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-lg">No matching employees</p>
                    <p className="text-sm">
                      Try adjusting your search or filters
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => (
                  <tr
                    key={emp._id}
                    className={`border-b border-slate-800 text-[14px] font-semibold hover:bg-[#3b83f610] transition-colors ${index % 2 === 0 ? "bg-[#3b83f60b]" : "bg-[#3b83f60b]"
                      }`}
                  >
                    <td className="px-6 py-4">
                      <img
                        src={emp.avatar?.url || "/default-avatar.png"}
                        alt={emp.FullName}
                        className="w-12 h-12 rounded-full border-2 border-[var(--box-border)] object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-white capitalize">
                      {emp.FullName}
                    </td>
                    <td className="px-6 py-4 text-white whitespace-nowrap">
                      {emp.workingHour || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">
                      {emp.salary || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${emp.department === "CSR"
                          ? "bg-blue-100 text-blue-700"
                          : emp.department === "Deposit"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                          }`}
                      >
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs whitespace-nowrap font-semibold bg-purple-100 text-purple-700">
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {emp.Shift || "N/A"}
                    </td>
                    {/* Status field for Team Leader */}
                    {role === "Team-Leader" && (
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${emp.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-green-100 text-green-700"
                            }`}
                        >
                          {emp.status || "Active"}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-white">+91 {emp.phone}</td>
                    <td className="px-6 py-4 text-white text-sm">
                      {emp.email}
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        onClick={() =>
                          setShowMenu(showMenu === emp._id ? null : emp._id)
                        }
                        className="text-gray-500 hover:text-white p-2 rounded-lg "
                      >
                        <MoreVertical size={20} />
                      </button>

                      {showMenu === emp._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#3b83f60b] rounded-lg shadow-xl border border-gray-200 z-10">
                          {/* For Team Leader - Show different menu */}
                          {role === "Team-Leader" ? (
                            <>
                              <button
                                onClick={() => handleEdit(emp)}
                                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#3b83f610] text-left"
                              >
                                <Edit size={16} className="text-blue-500" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeactivate(emp)}
                                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#3b83f610] text-left"
                              >
                                <UserX size={16} className="text-orange-500" />
                                <span>Deactivate</span>
                              </button>
                              <button
                                onClick={() => handleRestDay(emp)}
                                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#3b83f610] text-left"
                              >
                                <Calendar size={16} className="text-green-500" />
                                <span>Rest Day</span>
                              </button>
                            </>
                          ) : (
                            /* For other roles - Show original menu */
                            <>
                              <button
                                onClick={() => handleEdit(emp)}
                                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#3b83f610] text-left"
                              >
                                <Edit size={16} className="text-blue-500" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleQRCode(emp)}
                                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#3b83f610] text-left"
                              >
                                <QrCode size={16} className="text-green-500" />
                                <span>QR Code</span>
                              </button>
                              {role !== "Team-Leader" && (
                                <button
                                  onClick={() => handleDelete(emp._id)}
                                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#3b83f610] text-left text-red-600"
                                >
                                  <Trash size={16} />
                                  <span>Delete</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>



    </div>
  );
}

export default EmployeeDirectory;