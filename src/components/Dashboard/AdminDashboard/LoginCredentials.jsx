import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Edit2, Trash2, Eye, EyeOff, User, Calendar, Filter } from 'lucide-react';
import { deleteUser, getAllUsers } from '../../../redux/authSlice';
import { motion, AnimatePresence } from "framer-motion";
import toast from 'react-hot-toast';

function LoginCredentials() {
    const dispatch = useDispatch();
    const { users } = useSelector((state) => state?.auth);
    console.log(users, "ashidjhs")
    const [searchTerm, setSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    // Department color mapping
    const departmentColors = {
        'CSR': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        'Deposit': 'bg-green-500/20 text-green-300 border-green-500/30',
        'Withdraw': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        'Marketing': 'bg-red-500/20 text-red-300 border-red-500/30',
        'Support': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    };

    const filteredUsers = users?.filter(user => {
        const matchesSearch = user?.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user?.username?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = selectedDepartment === 'all' || user?.department === selectedDepartment;

        let matchesDate = true;
        if (startDate || endDate) {
            const userDate = new Date(user?.createdAt || user?.dateAdded);
            if (startDate) matchesDate = matchesDate && userDate >= new Date(startDate);
            if (endDate) matchesDate = matchesDate && userDate <= new Date(endDate);
        }

        return matchesSearch && matchesDepartment && matchesDate;
    }) || [];

    const departments = ['all', ...new Set(users?.map(u => u?.department).filter(Boolean))];

    const togglePassword = (userId) => {
        setShowPassword(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this data?");
        if (!confirmDelete) return;
        const response = await dispatch(deleteUser(id));

        if (response?.payload?.success) {
            toast.success("Employee deleted successfully!");
            dispatch(getAllUsers());
        } else {
            toast.error(response?.payload || "Failed to delete employee");
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen p-4">
            {/* Filters Section */}
            <div className=" rounded-2xl shadow-2xl p-4 md:p-6 mb-6 border border-slate-800/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5  border border-slate-800/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                        />
                    </div>

                    {/* Department Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5  border border-slate-800/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none cursor-pointer"
                        >
                            <option className='bg-slate-900  hover:bg-slate-900/20 border border-slate-800/60' value="all">All Departments</option>
                            {departments.filter(d => d !== 'all').map(dept => (
                                <option className='bg-slate-900 hover:bg-slate-900/20 border border-slate-800/60' key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-9 pr-2 py-2.5 border border-slate-800/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
                            />
                        </div>
                        <div className="relative flex-1">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-9 pr-2 py-2.5 border border-slate-800/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Department Stats */}
                <div className="flex flex-wrap justify-end gap-3 mt-4">
                    {['CSR', 'Deposit', 'Withdraw', 'Marketing'].map(dept => {
                        const count = users?.filter(u => u?.department === dept).length || 0;
                        const colors = {
                            'CSR': 'bg-blue-500/20 text-blue-300 border-blue-500',
                            'Deposit': 'bg-green-500/20 text-green-300 border-green-500',
                            'Withdraw': 'bg-purple-500/20 text-purple-300 border-purple-500',
                            'Marketing': 'bg-red-500/20 text-red-300 border-red-500'
                        };
                        return (
                            <div key={dept} className={`px-4 py-2 rounded-lg border-2 ${colors[dept]} font-semibold`}>
                                {dept}: {count}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Table Section */}
            <div className=" rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
                <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-800/50">
                    <h2 className="text-xl font-bold text-white">Employee Credentials</h2>
                    <div className="bg-blue-600/50 px-4 py-1.5 rounded-full flex items-center gap-2">
                        <User size={20} className="text-white" />
                        <span className="text-white font-semibold">{filteredUsers.length} Users</span>
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-800/50">
                                <th className="text-left p-4 text-gray-300 font-semibold uppercase text-sm">Name</th>
                                <th className="text-left p-4 text-gray-300 font-semibold uppercase text-sm">Department</th>
                                <th className="text-left p-4 text-gray-300 font-semibold uppercase text-sm">Username</th>
                                <th className="text-left p-4 text-gray-300 font-semibold uppercase text-sm">Password</th>
                                <th className="text-left p-4 text-gray-300 font-semibold uppercase text-sm">Date Added</th>
                                <th className="text-left p-4 text-gray-300 font-semibold uppercase text-sm">QR Code</th>
                                <th className="text-left p-4 text-gray-300 font-semibold uppercase text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors">
                                    <td className="p-4 text-white font-semibold capitalize">{user.FullName}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-lg text-[16px] font-bold border ${departmentColors[user.department] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                                            {user.department || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-300">{user.username}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-mono">
                                                {showPassword[user._id] ? user.password.slice(0, 8) : '••••••••••••'}
                                            </span>
                                            <button
                                                onClick={() => togglePassword(user._id)}
                                                className="text-gray-300 hover:text-white px-2 py-1 rounded transition-colors"
                                            >
                                                {showPassword[user._id] ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300">
                                        {formatDate(user.createdAt || user.dateHired)}
                                    </td>
                                    <td className="p-4">
                                        <div
                                            onClick={() => setSelectedUser(user)}
                                            className="cursor-pointer inline-block rounded-lg hover:scale-105 transition-all"
                                        >
                                            <img
                                                src={user.qrCode || "https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=No+QR"}
                                                alt="QR Code"
                                                className="w-16 h-16 object-contain bg-white rounded p-1"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg">
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-gray-400 text-lg">No credentials found</p>
                    </div>
                )}
            </div>

            {/* QR Code Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        className="fixed inset-0 bg-black/30 backdrop-blur-md    flex justify-center items-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedUser(null)}
                    >
                        <motion.div
                            className="bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 text-center relative max-w-md w-full border border-slate-800/50"
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.5, opacity: 0, y: 50 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-2 capitalize text-white">
                                {selectedUser.FullName}
                            </h2>
                            <label htmlFor="">Department : </label>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-4 ${departmentColors[selectedUser.department] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                                {selectedUser.department || 'N/A'}
                            </span>
                            <img
                                src={selectedUser.qrCode}
                                alt="Full QR Code"
                                className="w-64 h-64 object-contain mx-auto bg-white rounded-xl p-4"
                            />
                            <div className="text-gray-300 text-sm leading-relaxed mt-4 bg-slate-900/60 rounded-lg p-4">
                                <h3 className="font-semibold text-white mb-2">How to use:</h3>
                                <ol className="text-left list-decimal list-inside space-y-1">
                                    <li>Open Google Authenticator app</li>
                                    <li>Tap "+" to add a new account</li>
                                    <li>Select "Scan a QR code"</li>
                                    <li>Scan this code</li>
                                </ol>
                            </div>
                            <button
                                className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg"
                                onClick={() => setSelectedUser(null)}
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default LoginCredentials;