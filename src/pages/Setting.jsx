import { ArrowRight, Eye, EyeOff, Lock, LogOut, Trash2, TriangleAlert, User, Settings as SettingsIcon, UserCircle, PieChart, Shield, Bell, Mail, Building2, Wallet, CreditCard, RefreshCw, AlertCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { changePassword, getUserData, logout, updateProfile } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

function Settings() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const userData = useSelector((state) => state?.auth?.data)
   const [activeDept, setActiveDept] = useState("CSR");
    const [activeTab, setActiveTab] = useState("basic-details");
    const [twoFA, setTwoFA] = useState(true);
    const [previewImage, setImagePreview] = useState(userData?.avatar || "");
    const [userPassword, setUserPassword] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [userInfo, setUserInfo] = useState({
        FullName: userData?.FullName || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
        avatar: undefined,
        userID: userData?._id,
    });

    // Password handling functions
    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setUserPassword(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    const [quotas, setQuotas] = useState({
        CSR: {
            morning9: 500,
            night5: 600
        },
        Deposit: {
            morning9: 530,
            night5: 450
        },
        Withdrawal: {
            morning9: 1400,
            night5: 900
        }
    });

    // Default quotas function
    const getDefaultQuota = (dept, shift) => {
        if (dept === "CSR") {
            if (shift === "morning9") return 500;
            if (shift === "night5") return 600;
            return 560;
        } else if (dept === "Deposit") {
            if (shift === "morning9") return 530;
            if (shift === "night5") return 450;
            return 560;
        } else if (dept === "Withdrawal") {
            if (shift === "morning9") return 900;
            if (shift === "night5") return 1000;
            return 1500;
        }
        return 0;
    };

    // Department colors
    const deptColors = {
        CSR: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        Deposit: "bg-green-500/20 text-green-300 border-green-500/30",
        Withdrawal: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        Marketing: "bg-orange-500/20 text-orange-300 border-orange-500/30"
    };

    // Handle quota change
    const handleQuotaChange = (dept, shift, value) => {
        setQuotas(prev => ({
            ...prev,
            [dept]: {
                ...prev[dept],
                [shift]: parseInt(value) || 0
            }
        }));
    };
    const handleSaveQuota = (dept) => {
        toast.success(`${dept} department quotas saved successfully!`);
        // Here you would typically save to backend
    };
    const handleResetAll = () => {
        setQuotas({
            CSR: {
                morning9: getDefaultQuota("CSR", "morning9"),
                night5: getDefaultQuota("CSR", "night5")
            },
            Deposit: {
                morning9: getDefaultQuota("Deposit", "morning9"),
                night5: getDefaultQuota("Deposit", "night5")
            },
            Withdrawal: {
                morning9: getDefaultQuota("Withdrawal", "morning9"),
                night5: getDefaultQuota("Withdrawal", "night5")
            }
        });
        toast.success("All quotas reset to default values!");
    };

    const departments = [
        {
            id: "CSR",
            name: "CSR Department",
            icon: <Building2 size={20} />,
            shifts: [
                { id: "morning9", label: "Morning 9th Quota" },
                { id: "night5", label: "Night 5th Quota" }
            ]
        },
        {
            id: "Deposit",
            name: "Deposit Department",
            icon: <Wallet size={20} />,
            shifts: [
                { id: "morning9", label: "Morning 9th Quota" },
                { id: "night5", label: "Night 5th Quota" }
            ]
        },
        {
            id: "Withdrawal",
            name: "Withdrawal Department",
            icon: <CreditCard size={20} />,
            shifts: [
                { id: "morning9", label: "Morning 9th Quota" },
                { id: "night5", label: "Night 5th Quota" }
            ]
        }
    ];
    const handleLogoutSession = async () => {
        const res = await dispatch(logout());
        if (res?.payload?.success) navigate("/");
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: 'Weak', color: 'bg-red-500' };

        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        score = Object.values(checks).filter(Boolean).length;

        if (score <= 2) {
            return { strength: score, label: 'Weak', color: 'bg-red-500' };
        } else if (score <= 3) {
            return { strength: score, label: 'Medium', color: 'bg-yellow-500' };
        } else {
            return { strength: score, label: 'Strong', color: 'bg-green-500' };
        }
    };

    const passwordStrength = getPasswordStrength(userPassword.newPassword)

    // Image upload handler
    const handleImageUpload = (event) => {
        const uploadedImage = event.target.files[0];
        if (!uploadedImage) return;

        if (uploadedImage.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setUserInfo(prev => ({
            ...prev,
            avatar: uploadedImage,
        }));

        const fileReader = new FileReader();
        fileReader.readAsDataURL(uploadedImage);
        fileReader.onload = function () {
            setImagePreview(this.result);
        };
    };

    const handleUserInfoChange = (event) => {
        const { name, value } = event.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (event) => {
        event.preventDefault();

        if (!userInfo.FullName.trim()) {
            toast.error("Name is required");
            return;
        }

        if (userInfo.FullName.length < 3) {
            toast.error("Name should have at least 3 characters");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", userInfo.name);
            formData.append("phone", userInfo.phone);
            if (userInfo.avatar) {
                formData.append("avatar", userInfo.avatar);
            }

            const res = await dispatch(updateProfile([userInfo.userID, formData]));

            if (res?.payload?.success) {
                toast.success("Profile updated successfully!");
                await dispatch(getUserData());
            } else {
                toast.error(res?.payload?.message || "Failed to update profile");
            }
        } catch (error) {
            toast.error("Something went wrong!");
        }
    };

    const handleUpdatePassword = async (event) => {
        event.preventDefault();

        if (!userPassword.currentPassword || !userPassword.newPassword) {
            toast.error("All fields are mandatory");
            return;
        }

        if (userPassword.newPassword !== userPassword.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }

        if (userPassword.newPassword.length < 6) {
            toast.error("Password should be at least 6 characters long");
            return;
        }

        if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(userPassword.newPassword)) {
            toast.error("Password must contain at least one uppercase letter and one special character");
            return;
        }

        const res = await dispatch(changePassword({
            currentPassword: userPassword.currentPassword,
            newPassword: userPassword.newPassword
        }));

        if (res?.payload?.success) {
            toast.success("Password updated successfully!");
            setUserPassword({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } else {
            toast.error(res?.payload?.message || "Failed to update password");
        }
    };

    // Quota management
    const [quotaRequest, setQuotaRequest] = useState({
        amount: "",
        reason: ""
    });

    const handleQuotaRequest = async () => {
        if (!quotaRequest.amount || !quotaRequest.reason) {
            toast.error("Please fill all fields");
            return;
        }

        toast.success("Quota increase request submitted!");
        setQuotaRequest({ amount: "", reason: "" });
    };

    // Settings Menu Items
    const settingsMenu = [
        { id: "basic-details", label: "Basic Details", icon: <UserCircle size={20} /> },
        { id: "change-quota", label: "Change Quota", icon: <PieChart size={20} /> },
        { id: "security", label: "Security", icon: <Shield size={20} /> },
    ];

    return (
        <div className="min-h-screen  text-white p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <SettingsIcon className="text-blue-400" size={28} />
                    <h2 className="text-2xl font-bold text-white">Settings</h2>
                </div>
                <div className="text-sm text-gray-400">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:w-1/4">
                    <div className="bg-[#9696a814] border border-gray-700 rounded-xl p-4 sticky top-6">
                        <h3 className="text-lg font-semibold text-gray-300 mb-4 px-2">Navigation</h3>
                        <div className="space-y-1">
                            {settingsMenu.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.id
                                        ? "bg-gray-700 text-blue-400 shadow-lg"
                                        : "text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                                        }`}
                                >
                                    <div className={`p-1.5 rounded ${activeTab === item.id ? 'bg-blue-900/30' : 'bg-gray-700'
                                        }`}>
                                        {item.icon}
                                    </div>
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:w-3/4">
                    {/* Basic Details Section */}
                    {activeTab === "basic-details" && (
                        <div className="space-y-6">
                            {/* Profile Card */}
                            <div className="bg-[#9696a814] border border-gray-700 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Basic Details</h3>
                                    <div className="text-sm text-gray-400">
                                        User ID: <span className="font-mono text-gray-300">{userInfo.userID?.substring(0, 8)}...</span>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile}>
                                    <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                                        {/* Avatar Upload */}
                                        <div className="flex flex-col items-center">
                                            <label className="cursor-pointer group" htmlFor="avatar-upload">
                                                <div className="relative">
                                                    {previewImage ? (
                                                        <img
                                                            className="w-32 h-32 rounded-full border-4 border-gray-700 shadow-lg object-cover"
                                                            src={previewImage}
                                                            alt="Profile"
                                                        />
                                                    ) : (
                                                        <div className="w-32 h-32 rounded-full border-4 border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg flex items-center justify-center">
                                                            <User className="w-16 h-16 text-gray-500" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-sm font-medium">Change</span>
                                                    </div>
                                                </div>
                                            </label>
                                            <input
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                type="file"
                                                id="avatar-upload"
                                                accept="image/*"
                                            />
                                            <p className="text-sm text-gray-400 mt-3 text-center">
                                                Click to upload (Max 5MB)<br />
                                                JPG, PNG, GIF supported
                                            </p>
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <label className="block text-gray-300 font-medium mb-2">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={userInfo.FullName}
                                                    onChange={handleUserInfoChange}
                                                    placeholder="Enter your full name"
                                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                                                    <Mail size={16} /> Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={userInfo.email}
                                                    disabled
                                                    className="w-full bg-[#9696a814] border border-gray-600 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                            </div>

                                            <div>
                                                <label className="block text-gray-300 font-medium mb-2">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={userInfo.phone}
                                                    onChange={handleUserInfoChange}
                                                    placeholder="Enter phone number"
                                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUserInfo({
                                                    name: userData?.name || "",
                                                    email: userData?.email || "",
                                                    phone: userData?.phone || "",
                                                    avatar: undefined,
                                                    userID: userData?._id,
                                                });
                                                setImagePreview(userData?.avatar || "");
                                            }}
                                            className="px-5 py-2.5 border border-gray-600 rounded-lg font-medium text-gray-300 hover:bg-gray-700 transition"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!userInfo?.FullName?.trim()}
                                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Security Section */}
                            <div className="bg-[#9696a814] border border-gray-700 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Security</h3>
                                        <p className="text-gray-400">Enhanced account security</p>
                                    </div>
                                </div>

                                {/* Two-Factor Authentication */}
                                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-900/30 rounded-lg">
                                            <Shield className="text-blue-400" size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Two-Factor Authentication</h4>
                                            <p className="text-sm text-gray-400">Enhanced account security</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={twoFA}
                                            onChange={() => setTwoFA(!twoFA)}
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <p className="text-gray-400 text-sm mb-4 px-2">
                                    Enable 2FA for extra security. You'll need a verification code from your authentication app to sign in.
                                </p>
                                {twoFA && (
                                    <div className="mt-4 p-4 bg-green-900/20 border border-green-800/50 rounded-lg">
                                        <div className="flex items-center gap-2 text-green-400">
                                            <Shield size={16} />
                                            <span className="font-medium">2FA is active</span>
                                        </div>
                                        <p className="text-sm text-green-500 mt-1">
                                            Your account is protected with two-factor authentication
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Change Password */}
                            <form onSubmit={handleUpdatePassword} className="bg-[#9696a814] border border-gray-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-900/30 rounded-lg">
                                        <Lock className="text-blue-400" size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Change Password</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-gray-300 font-medium mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? "text" : "password"}
                                                name="currentPassword"
                                                value={userPassword.currentPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter current password"
                                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                                className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300"
                                            >
                                                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 font-medium mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                name="newPassword"
                                                value={userPassword.newPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter new password"
                                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300"
                                            >
                                                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {userPassword.newPassword && (
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-gray-400">Strength:</span>
                                                    <span className={`text-sm font-medium ${passwordStrength.label === 'Weak' ? 'text-red-400' :
                                                        passwordStrength.label === 'Medium' ? 'text-yellow-400' :
                                                            'text-green-400'
                                                        }`}>
                                                        {passwordStrength.label}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={`h-1.5 flex-1 rounded-full ${level <= passwordStrength.strength
                                                                ? passwordStrength.color
                                                                : 'bg-gray-700'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-gray-300 font-medium mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                name="confirmPassword"
                                                value={userPassword.confirmPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Confirm new password"
                                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300"
                                            >
                                                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {userPassword.confirmPassword && userPassword.newPassword !== userPassword.confirmPassword && (
                                            <p className="text-red-400 text-sm mt-1">Passwords don't match</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={
                                            !userPassword.currentPassword ||
                                            !userPassword.newPassword ||
                                            !userPassword.confirmPassword ||
                                            userPassword.newPassword !== userPassword.confirmPassword
                                        }
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>

                            {/* Danger Zone */}
                            <div className="bg-[#9696a814] border border-red-900/50 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <TriangleAlert className="text-red-400" size={24} />
                                    <h3 className="text-xl font-bold text-red-400">Danger Zone</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-red-900/30 rounded-lg bg-red-900/10">
                                        <div className="mb-4 md:mb-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <LogOut className="text-red-400" size={18} />
                                                <h4 className="font-bold text-red-300">Logout All Sessions</h4>
                                            </div>
                                            <p className="text-sm text-red-400/80">
                                                Logout from all devices except this one
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleLogoutSession}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
                                        >
                                            Logout All
                                        </button>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-red-900/30 rounded-lg bg-red-900/10">
                                        <div className="mb-4 md:mb-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Trash2 className="text-red-400" size={18} />
                                                <h4 className="font-bold text-red-300">Delete Account</h4>
                                            </div>
                                            <p className="text-sm text-red-400/80">
                                                Permanently delete your account and all data
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toast.error("Account deletion not implemented yet")}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center gap-2 transition"
                                        >
                                            Delete Account
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Change Quota Section */}
                    {activeTab === "change-quota" && (
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="bg-[#9696a814] border border-gray-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <PieChart className="text-blue-400" size={24} />
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Quota Settings</h3>
                                        <p className="text-gray-400">Configure quota targets for each department and shift</p>
                                    </div>
                                </div>
                            </div>

                            {/* Department Selection Tabs */}
                            <div className="bg-[#9696a814] border border-gray-700 rounded-xl p-4">
                                <div className="flex flex-wrap gap-2">
                                    {departments.map((dept) => (
                                        <button
                                            key={dept.id}
                                            onClick={() => setActiveDept(dept.id)}
                                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeDept === dept.id
                                                ? deptColors[dept.id]
                                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                                }`}
                                        >
                                            {dept.icon}
                                            <span>{dept.name.split(" ")[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Department Quota Configuration */}
                            <div className="space-y-6">
                                {departments.map((dept) => (
                                    <div
                                        key={dept.id}
                                        className={`bg-[#9696a814] border border-gray-700 rounded-xl p-6 ${activeDept !== dept.id ? 'hidden' : ''}`}
                                    >
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-6 ${deptColors[dept.id]}`}>
                                            {dept.icon}
                                            <h4 className="text-lg font-bold">{dept.name}</h4>
                                        </div>

                                        <div className="space-y-6">
                                            {dept.shifts.map((shift) => (
                                                <div key={shift.id} className="bg-gray-900/30 rounded-lg p-4">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div>
                                                            <h5 className="font-bold text-white mb-1">{shift.label}</h5>
                                                            <div className="text-sm text-gray-400">
                                                                Current target: <span className="text-blue-400 font-semibold">{quotas[dept.id][shift.id]}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={quotas[dept.id][shift.id]}
                                                                    onChange={(e) => handleQuotaChange(dept.id, shift.id, e.target.value)}
                                                                    className="w-32 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                                {dept.id === "Deposit" && (
                                                                    <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleQuotaChange(dept.id, shift.id, getDefaultQuota(dept.id, shift.id))}
                                                                className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
                                                            >
                                                                Reset
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Save Changes Button */}
                                            <div className="pt-4 border-t border-gray-700">
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleSaveQuota(dept.name)}
                                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
                                                    >
                                                        Save Changes
                                                        <ArrowRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reset All Button */}
                            <div className="bg-[#9696a814] border border-gray-700 rounded-xl p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="text-yellow-400" size={24} />
                                        <div>
                                            <h4 className="font-bold text-white">Reset All to Default</h4>
                                            <p className="text-sm text-gray-400">Reset all quotas to their default values</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleResetAll}
                                        className="px-5 py-2.5 border border-yellow-600 text-yellow-400 hover:bg-yellow-600/10 rounded-lg font-medium flex items-center gap-2 transition"
                                    >
                                        <RefreshCw size={18} />
                                        Reset All
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === "security" && (
                        <div className="bg-[#9696a814] border border-gray-700 rounded-xl p-6">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">Security Settings</h3>
                                <p className="text-gray-400">Manage your account security and authentication</p>
                            </div>

                            <div className="space-y-6">
                                {/* Session Management */}
                                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                                    <h4 className="text-lg font-bold text-white mb-4">Active Sessions</h4>
                                    <div className="space-y-3">
                                        {[
                                            { device: "Chrome on Windows", location: "Mumbai, IN", current: true, time: "Now" },
                                            { device: "Safari on iPhone", location: "Delhi, IN", current: false, time: "2 hours ago" },
                                            { device: "Firefox on Mac", location: "Bangalore, IN", current: false, time: "1 day ago" }
                                        ].map((session, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-[#9696a814] rounded-lg">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-white">{session.device}</span>
                                                        {session.current && (
                                                            <span className="bg-green-900/30 text-green-400 text-xs px-2 py-0.5 rounded">Current</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {session.location} • {session.time}
                                                    </div>
                                                </div>
                                                {!session.current && (
                                                    <button className="text-red-400 hover:text-red-300 text-sm font-medium">
                                                        Revoke
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Security Settings */}
                                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                                    <h4 className="text-lg font-bold text-white mb-4">Security Preferences</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-white">Login Notifications</div>
                                                <div className="text-sm text-gray-400">Get notified for new logins</div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-white">Password Reset Protection</div>
                                                <div className="text-sm text-gray-400">Require email confirmation for password reset</div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Settings;