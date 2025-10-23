import React, { useState, useEffect } from 'react';
import { Search, Plus, Phone, Mail, MoreVertical, Edit, Trash, QrCode, X, Download, FileText } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addAdminAccount, deleteUser, getAllUsers } from '../../../redux/authSlice';



function EmployeeDirectory() {
    const dispatch = useDispatch();
    const { users } = useSelector((state) => state?.auth);
    const role = useSelector((state) => state.auth?.role);

    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrCodeImage, setQrCodeImage] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showMenu, setShowMenu] = useState(null);

    const [addUser, setAddUser] = useState({
        FullName: '',
        username: '',
        password: '',
        email: '',
        phone: '',
        department: '',
        dateHired: '',
        role: '',
        salary: '',
        workingHour: '',
        Shift: ''
    });

    // Fetch all users on component mount
    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    // Filter logic
    useEffect(() => {
        if (!users) return;

        let filtered = [...users];

        if (selectedDepartment !== 'All') {
            filtered = filtered.filter(emp => emp.department === selectedDepartment);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(emp =>
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
        setAddUser(prev => ({ ...prev, [name]: value }));
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();

        const { FullName, username, email, password, phone, department, dateHired, role, salary, workingHour, Shift } = addUser;

        if (!FullName || !username || !email || !department || !phone || !dateHired || !role || !salary || !workingHour || !Shift) {
            alert('Please fill all the details');
            return;
        }

        if (FullName.length < 5) {
            alert('Name should be at least 5 characters');
            return;
        }

        if (!isEditMode && !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/)) {
            alert('Password must have 8+ chars, Uppercase, Lowercase, Number');
            return;
        }

        const response = await dispatch(addAdminAccount(addUser));

        if (response?.payload?.success) {
            alert('Employee added successfully!');
            resetForm();
            dispatch(getAllUsers());
        } else {
            alert(response?.payload?.message || 'Failed to add employee');
        }
    };

    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        setAddUser({
            FullName: employee.FullName,
            username: employee.username,
            password: '',
            email: employee.email,
            phone: employee.phone,
            department: employee.department,
            dateHired: employee.dateHired?.split('T')[0] || '',
            role: employee.role,
            salary: employee.salary,
            workingHour: employee.workingHour,
            Shift: employee.Shift
        });
        setIsEditMode(true);
        setIsDialogOpen(true);
        setShowMenu(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;

        const response = await dispatch(deleteUser(id));

        if (response?.payload?.success) {
            alert('Employee deleted successfully!');
            dispatch(getAllUsers());
        } else {
            alert(response?.payload?.message || 'Failed to delete employee');
        }
        setShowMenu(null);
    };

    const handleQRCode = (employee) => {
        if (employee?.qrCode) {
            setQrCodeImage(employee.qrCode);
            setQrModalOpen(true);
        } else {
            alert('QR Code not available for this user');
        }
        setShowMenu(null);
    };

    const resetForm = () => {
        setAddUser({
            FullName: '',
            username: '',
            password: '',
            email: '',
            phone: '',
            department: '',
            dateHired: '',
            role: '',
            salary: '',
            workingHour: '',
            Shift: ''
        });
        setIsEditMode(false);
        setSelectedEmployee(null);
        setIsDialogOpen(false);
    };

    const exportToCSV = () => {
        if (!filteredEmployees.length) {
            alert('No data to export');
            return;
        }

        const headers = ['Name', 'Email', 'Phone', 'Department', 'Role', 'Shift', 'Salary', 'Status'];
        const rows = filteredEmployees.map(emp => [
            emp.FullName,
            emp.email,
            emp.phone,
            emp.department,
            emp.role,
            emp.Shift,
            emp.salary,
            emp.status
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const activeEmployees = users?.filter(emp => emp.status === 'Active').length || 0;
    const withdrawnEmployees = users?.filter(emp => emp.status === 'Withdrawn').length || 0;
    const totalEmployees = users?.length || 0;

    const rolePermissions = {
        'Super-Admin': ['Team-Leader', 'Admin', 'User', 'Checker'],
        'Admin': ['Team-Leader', 'User', 'Checker'],
    };
    const allowedRoles = rolePermissions[role] || [];

    return (
        <div className="min-h-screen  p-6">
            {/* Header */}
            <div className="bg-[#f5f6fa13] rounded-2xl shadow-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-WHITE flex items-center gap-2">
                            Employee Directory
                        </h1>
                        <p className="text-gray-600 mt-1">Manage your team members and their information</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={exportToCSV}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg"
                        >
                            <Download size={18} />
                            Export CSV
                        </button>
                        <button
                            onClick={() => setIsDialogOpen(true)}
                            className="bg-[#3B82F6] text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg"
                        >
                            <Plus size={18} />
                            Add Employee
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex gap-4 flex-wrap">
                    {/* <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              </div> */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 "
                        />
                    </div>
                    <div className="flex gap-2">
                        {['All', 'CSR', 'Deposit', 'Withdraw'].map(dept => (
                            <button
                                key={dept}
                                onClick={() => setSelectedDepartment(dept)}
                                className={`px-4 py-2 rounded-lg transition-all ${selectedDepartment === dept
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Employees</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{totalEmployees}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-3xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Employees</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{activeEmployees}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Withdrawn</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{withdrawnEmployees}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
        </div>
      </div> */}

            {/* Employee Table */}
            <div className=" rounded-xl border border-[var(--box-border)]  shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#f5f6fa13] text-white">
                            <tr>
                                <th className="px-6 py-4 text-left">Avatar</th>
                                <th className="px-6 py-4 text-left">Name</th>
                                <th className="px-6 py-4 text-left">Working Hours</th>
                                <th className="px-6 py-4 text-left">Salary</th>
                                <th className="px-6 py-4 text-left">Department</th>
                                <th className="px-6 py-4 text-left">Role</th>
                                <th className="px-6 py-4 text-left">Shift</th>
                                <th className="px-6 py-4 text-left">Phone</th>
                                <th className="px-6 py-4 text-left">Email</th>
                                <th className="px-6 py-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!users || users.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center py-12 text-gray-500">
                                        <FileText size={48} className="mx-auto mb-3 text-gray-300" />
                                        <p className="text-lg">No employees found</p>
                                        <p className="text-sm">Add your first employee to get started</p>
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center py-12 text-gray-500">
                                        <Search size={48} className="mx-auto mb-3 text-gray-300" />
                                        <p className="text-lg">No matching employees</p>
                                        <p className="text-sm">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp, index) => (
                                    <tr key={emp._id} className={`border-b border-[var(--box-border)] hover:bg-[#3b83f610] transition-colors ${index % 2 === 0 ? 'bg-[#3b83f60b]' : 'bg-[#3b83f60b]'}`}>
                                        <td className="px-6 py-4">
                                            <img
                                                src={emp.avatar?.url || '/default-avatar.png'}
                                                alt={emp.FullName}
                                                className="w-12 h-12 rounded-full border-2 border-[var(--box-border)] object-cover"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white capitalize">{emp.FullName}</td>
                                        <td className="px-6 py-4 text-white">{emp.workingHour || 'N/A'}</td>
                                        <td className="px-6 py-4 text-white font-semibold">{emp.salary || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${emp.department === 'CSR' ? 'bg-blue-100 text-blue-700' :
                                                    emp.department === 'Deposit' ? 'bg-green-100 text-green-700' :
                                                        'bg-orange-100 text-orange-700'
                                                }`}>
                                                {emp.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white">{emp.Shift || 'N/A'}</td>
                                        <td className="px-6 py-4 text-white">+91 {emp.phone}</td>
                                        <td className="px-6 py-4 text-white text-sm">{emp.email}</td>
                                        <td className="px-6 py-4 relative">
                                            <button
                                                onClick={() => setShowMenu(showMenu === emp._id ? null : emp._id)}
                                                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg "
                                            >
                                                <MoreVertical size={20} />
                                            </button>

                                            {showMenu === emp._id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-[#3b83f60b] rounded-lg shadow-xl border border-gray-200 z-10">
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
                                                    {role !== 'Team-Leader' && (
                                                        <button
                                                            onClick={() => handleDelete(emp._id)}
                                                            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#3b83f610] text-left text-red-600"
                                                        >
                                                            <Trash size={16} />
                                                            <span>Delete</span>
                                                        </button>
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

            {/* Add/Edit Employee Modal */}
            {isDialogOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {isEditMode ? 'Edit Employee' : 'Add Employee'}
                            </h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Full Name *</label>
                                    <input
                                        type="text"
                                        name="FullName"
                                        value={addUser.FullName}
                                        onChange={handleUserInput}
                                        placeholder="Enter full name"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Username *</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={addUser.username}
                                        onChange={handleUserInput}
                                        placeholder="Enter username"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={addUser.email}
                                        onChange={handleUserInput}
                                        placeholder="Enter email"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Password {!isEditMode && '*'}</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={addUser.password}
                                        onChange={handleUserInput}
                                        placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Phone *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={addUser.phone}
                                        onChange={handleUserInput}
                                        placeholder="9168636883"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Department *</label>
                                    <select
                                        name="department"
                                        value={addUser.department}
                                        onChange={handleUserInput}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        <option value="CSR">CSR Department</option>
                                        <option value="Deposit">Deposit Department</option>
                                        <option value="Withdraw">Withdraw Department</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Role *</label>
                                    <select
                                        name="role"
                                        value={addUser.role}
                                        onChange={handleUserInput}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
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
                                    <label className="block text-gray-700 mb-2 font-medium">Date Hired *</label>
                                    <input
                                        type="date"
                                        name="dateHired"
                                        value={addUser.dateHired}
                                        onChange={handleUserInput}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Salary *</label>
                                    <input
                                        type="text"
                                        name="salary"
                                        value={addUser.salary}
                                        onChange={handleUserInput}
                                        placeholder="$45,000"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Working Hours *</label>
                                    <input
                                        type="text"
                                        name="workingHour"
                                        value={addUser.workingHour}
                                        onChange={handleUserInput}
                                        placeholder="9:00 AM - 5:00 PM"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Shift *</label>
                                    <select
                                        name="Shift"
                                        value={addUser.Shift}
                                        onChange={handleUserInput}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Shift</option>
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                        <option value="Night">Night</option>
                                        <option value="Rotational">Rotational</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg"
                                >
                                    {isEditMode ? 'Update' : 'Add Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {qrModalOpen && qrCodeImage && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Employee QR Code</h2>
                        <div className="bg-gray-50 p-4 rounded-xl mb-6">
                            <img src={qrCodeImage} alt="QR Code" className="w-full h-auto" />
                        </div>
                        <button
                            onClick={() => setQrModalOpen(false)}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployeeDirectory;