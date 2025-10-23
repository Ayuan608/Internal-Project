import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, Search, Edit2, Trash2, Eye, EyeOff, User } from 'lucide-react';
import { deleteUser, getAllUsers } from '../../../redux/authSlice';
import { motion, AnimatePresence } from "framer-motion";
import toast from 'react-hot-toast';

function LoginCredentials() {
    const dispatch = useDispatch();
    const { users } = useSelector((state) => state?.auth);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState({});
    const [selectedUser, setSelectedUser] = useState(null); // 👈 For individual QR modal

    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    // Filter users based on search
    const filteredUsers = users?.filter(user =>
        user?.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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
            toast.success("Admin deleted successfully!");
            dispatch(getAllUsers());
        } else {
            toast.error(response?.payload || "Failed to delete admin");
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="rounded-2xl shadow-xl p-2 md:p-6 mb-6">
                <div className="flex justify-end">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                        />
                    </div>
                </div>
            </div>

            {/* Credentials Table */}
            <div className="bg-[#3b83f60b] rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 md:p-6 flex items-center justify-between border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Employee Credentials</h2>
                    <div className="bg-purple-600/50 px-4 py-1.5 rounded-full flex items-center gap-2">
                        <User size={20} />
                        <span className="text-white font-semibold">{filteredUsers.length} Credentials</span>
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-gray-300 font-semibold uppercase text-sm">Name</th>
                                <th className="text-left p-4 text-gray-300 font-semibold uppercase text-sm">Username</th>
                                <th className="text-left p-4 text-gray-300 font-semibold uppercase text-sm">Password</th>
                                <th className="text-left p-4 text-gray-300 font-semibold uppercase text-sm">Google Authenticator</th>
                                <th className="text-left p-4 text-gray-300 font-semibold uppercase text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="border-b border-white/5 hover:bg-[#3b83f610] transition-colors">
                                    <td className="p-4 text-white font-semibold uppercase">{user.FullName}</td>
                                    <td className="p-4 text-gray-300">{user.username}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-mono">
                                                {showPassword[user._id] ? user.password : '••••••••••••'}
                                            </span>
                                            <button
                                                onClick={() => togglePassword(user._id)}
                                                className="text-white px-2 py-1 rounded transition-colors"
                                            >
                                                {showPassword[user._id] ? <EyeOff /> : <Eye />}
                                            </button>
                                        </div>
                                    </td>

                                    {/* ✅ Each user has own QR Modal */}
                                    <td className="p-4">
                                        <div
                                            onClick={() => setSelectedUser(user)}
                                            className="cursor-pointer inline-block rounded-lg hover:scale-105 transition-all"
                                        >
                                            <img
                                                src={user.qrCode || "https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=No+QR"}
                                                alt="QR Code"
                                                className="w-16 h-16 object-contain"
                                            />
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </button>

                                            <button onClick={() => handleDelete(user._id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
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

            {/* ✅ Single QR Modal (per user) */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        className="fixed inset-0 bg-black/30 flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedUser(null)}
                    >
                        <motion.div
                            className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-center relative"
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.5, opacity: 0, y: 50 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg font-semibold mb-4">
                                {selectedUser.FullName} — QR Code
                            </h2>
                            <img
                                src={selectedUser.qrCode}
                                alt="Full QR Code"
                                className="w-64 h-64 object-contain mx-auto border rounded-xl"
                            />
                            <div className="text-gray-700 text-sm leading-relaxed mt-3">
                                <h3 className="font-semibold text-gray-800 mb-2">How to use:</h3>
                                <ol className="text-left list-decimal list-inside space-y-1">
                                    <li>Open Google Authenticator app</li>
                                    <li>Tap "+" to add a new account</li>
                                    <li>Select "Scan a QR code"</li>
                                    <li>Scan this code</li>
                                </ol>
                            </div>

                            <button
                                className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
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
