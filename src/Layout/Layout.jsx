import { useEffect, useRef, useState } from "react";
import { Ban, ChevronsLeft, ChevronsRight, LogOut, User } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import Menus from "../Menus/SubMenus";
import NotificationPopup from "../components/popup/Notification";
import { useDispatch, useSelector } from "react-redux";
import BindGoogleModal from "./BIndGoogle";
import RecentAnnoucement from "../components/popup/RecentAnnoucement";
import { logout } from "../redux/authSlice";
import ProfileModal from "../components/popup/ProfileModal";

const Layout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const menuRef = useRef(null);
    const [toggle, setToggle] = useState(true);
    const [activeTab, setActiveTab] = useState("CSR");
    const [isOpen, setIsOpen] = useState(false);
    const { role } = useSelector((state) => state.auth);
    const userData = useSelector((state) => state?.auth?.data);
    const [isBindModalOpen, setBindModalOpen] = useState(false);
    const [open, setOpen] = useState(false);

    const handleToggle = () => {
        setToggle(!toggle);
    };

    const handleBindGoogleClick = () => {
        if (userData?.qrCode) {
            setBindModalOpen(true);
        } else {
            alert("QR code not found. Contact admin.");
        }
    };

    useEffect(() => {
        const onClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);
    const handleLogout = async (event) => {
        event.preventDefault();
        const res = await dispatch(logout());
        if (res?.payload?.success) navigate("/");
    }

    const sidebarWidth = toggle ? 240 : 80;

    return (
        <>
            <div className="relative w-screen h-screen overflow-hidden text-white bg-black">
                {/* Sidebar */}
                <div
                    className="fixed top-0 left-0 h-full transition-all duration-300 z-10 flex flex-col bg-white dark:bg-[#00010B]"
                    style={{ width: `${sidebarWidth}px` }}
                >
                    <div className="absolute top-2 right-2 cursor-pointer text-[#1C2B49] dark:text-gray-300 dark:hover:text-white transition z-20">
                        {toggle ? (
                            <ChevronsLeft size={22} onClick={handleToggle} />
                        ) : (
                            <ChevronsRight size={22} onClick={handleToggle} />
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
                        <Menus toggle={toggle} />
                    </div>
                </div>

                {/* Main Content */}
                <div
                    className="flex flex-col h-full transition-all duration-300"
                    style={{
                        marginLeft: `${sidebarWidth}px`,
                        width: `calc(100% - ${sidebarWidth}px)`,
                    }}
                >
                    {/* Header */}
                    <div className="h-[60px] flex items-center justify-between px-4 border-b border-gray-700 shrink-0 sticky top-0 z-10 bg-black">
                        {role !== "Admin" && role !== "Super-Admin" && (
                            <h1 className="text-sm font-semibold text-white">
                                CRM Dashboard - Contacts & Customer Management
                            </h1>
                        )}
                        {(role === "Admin" || role === "Super-Admin") && (
                            <div className="flex gap-2 bg-[#f5f6fa09] max-w-[255px] p-1 rounded-full">
                                {["CSR", "WithDraw", "Deposit"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === tab
                                            ? "bg-[#d9d9d935] rounded-full text-white"
                                            : "bg-transparent text-gray-400 hover:text-gray-300"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            {/* Simply use NotificationPopup component */}
                            <NotificationPopup />

                            <RecentAnnoucement />
                            <div className="flex items-center gap-3" ref={menuRef}>
                                <button
                                    onClick={() => setIsOpen((o) => !o)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#282e3c61] cursor-pointer"
                                >
                                    <User size={20} />
                                </button>

                                {isOpen && (
                                    <div className="absolute right-0 top-[60px] animate-fadeIn w-40 border bg-[#111113]/95 backdrop-blur-3xl border-[#2e3135] text-white rounded-xl shadow-xl z-50">
                                        <div
                                            onClick={() => setOpen(true)}
                                            onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
                                            tabIndex={0}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-[#2e303759] cursor-pointer"
                                        >
                                            <User /> Profile
                                        </div>
                                        <div
                                            onClick={handleBindGoogleClick}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-[#2e303759] cursor-pointer"
                                        >
                                            <Ban size={20} /> Bind Google
                                        </div>
                                        <div
                                            onClick={(e) => handleLogout(e)}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-[#2e303759] cursor-pointer"
                                        >
                                            <LogOut size={20} />
                                            Logout
                                        </div>
                                    </div>
                                )}
                                <ProfileModal
                                    isOpen={open}
                                    onClose={() => setOpen(false)}
                                    user={userData}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Page Content */}
                    <div className="flex-1 overflow-auto px-1 min-h-0">
                        <Outlet />
                    </div>
                </div>

                {/* Light Effects in one wrapper */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-2/3 left-[40%] w-[600px] h-[600px] rounded-full bg-[#3B82F6] opacity-20 blur-[200px] transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute -top-[10%] -right-[5%] w-96 h-96 rounded-full bg-[#3B82F6] opacity-20 blur-[110px]"></div>
                    <div className="absolute -bottom-[5%] -right-[5%] w-96 h-96 rounded-full bg-[#3B82F6] opacity-20 blur-[100px]"></div>
                </div>
            </div>
            <BindGoogleModal
                isOpen={isBindModalOpen}
                onClose={() => setBindModalOpen(false)}
                qrCodeUrl={userData?.qrCode}
            />
        </>
    );
};

export default Layout;
