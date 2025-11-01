import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardPlus,
  Plus,
  Settings,
  ChartLine,
  Megaphone,
  ChartColumnIncreasing,
  FileText,
  Proportions,
} from "lucide-react";
import logo from "../assets/logo.png";
import UserMenu from "./User";
import { getUserData } from "../redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import DraftTemplate from "./DraftTemplate";
import {
  AdminRoutes,
  CheckerButtons,
  superAdminButtons,
  TeamButtons,
} from "../Helpers/Helper";

const Menus = ({ toggle, onTitleChange }) => {
  const contentRef = useRef(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [showDraftPopup, setShowDraftPopup] = useState(false);

  const toggleContent = () => {
    setIsAnnouncementOpen((prev) => !prev);
    const content = contentRef.current;
    content.classList.toggle("open");
  };

  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state?.auth?.data);
  const role = useSelector((state) => state?.auth?.role);

  const wrapperRef = useRef(null);
  const userRef = useRef(null);
  const [openUser, setOpenUser] = useState(false);

  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);

  const navItems = [
    // user
    ...(role === "User"
      ? [{ to: "/user", label: "Attendence", icon: <FileText /> }]
      : []),
    ...(role === "User"
      ? [
        {
          to: "/user/daily-time-record",
          label: "Daily Time Record",
          icon: <ChartColumnIncreasing />,
        },
      ]
      : []),
 

    ...(role === "User"
      ? [
        {
          to: "/user/announcement",
          label: "Announcement",
          icon: <Megaphone />,
        },
      ]
      : []), ...(role === "User"
      ? [
        {
          to: "/user/report",
          label: "Report",
          icon: <Proportions />,
        },
      ]
      : []),
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpenUser(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {toggle ? (
        <div className="flex flex-col justify-between h-screen px-2.5 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-[0%] left-[20%] w-36 h-36 rounded-full bg-[#3B82F6] opacity-60 blur-[70px]" />
            <div className="absolute top-1/2 right-[30%] w-72 h-72 rounded-full bg-[#3B82F6] opacity-40 blur-[90px] -translate-y-1/2" />
            <div className="absolute bottom-[-5%] left-[20%] w-36 h-36 rounded-full bg-[#3B82F6] opacity-70 blur-[70px]" />
          </div>
          <div>
            <Link className="flex items-center gap-2 py-3 mt-2 px-4 border-b border-[#9E9FA74D]">
              <ArrowLeft
                className="text-white opacity-80 bg-[#3b83f61a] rounded-full"
                size={20}
              />
              <h1 className="text-white text-[14px] font-semibold">
                {role} Dashboard
              </h1>
            </Link>

            <div className="text-white text-base mt-1 space-y-[10px]">
              {navItems.map(({ to, label, icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => onTitleChange(label)}
                    className={`flex items-center space-x-[12px] cursor-pointer px-[12px] py-[10px] rounded-lg transition-all duration-200
                      ${isActive
                        ? "border-l-2 border-blue-500 bg-[#3b83f60e] font-medium"
                        : "text-[#778092] hover:bg-[#3b83f605] hover:border-l-2 hover:border-blue-500"
                      }`}
                  >
                    <span className="text-[20px]">{icon}</span>
                    <span className="text-[16px]">{label}</span>
                  </Link>
                );
              })}

              {role === "Super-Admin" && (
                <div className="mt-4 space-y-2">
                  {superAdminButtons.map(({ to, label, icon: Icon }) => {
                    const isActive = location.pathname === to;
                    return (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => onTitleChange(label)}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200
                          ${isActive
                            ? "border-l-2 border-blue-500 bg-[#3b83f60e] font-medium"
                            : "text-[#778092] hover:bg-[#3b83f605] hover:border-l-2 hover:border-blue-500"
                          }`}
                      >
                        <Icon className="text-[20px]" />
                        <span className="text-[16px] ml-2">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {role === "Admin" && (
                <div className="mt-4 space-y-2">
                  {AdminRoutes.map(({ to, label, icon: Icon }) => {
                    const isActive = location.pathname === to;
                    return (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => onTitleChange(label)}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200
                          ${isActive
                            ? "border-l-2 border-blue-500 bg-[#3b83f60e] font-medium"
                            : "text-[#778092] hover:bg-[#3b83f605] hover:border-l-2 hover:border-blue-500"
                          }`}
                      >
                        <Icon className="text-[20px]" />
                        <span className="text-[16px] ml-2">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {role === "Checker" && (
                <div className="mt-4 space-y-2">
                  {CheckerButtons.map(({ to, label, icon: Icon }) => {
                    const isActive = location.pathname === to;
                    return (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => onTitleChange(label)}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200
                          ${isActive
                            ? "border-l-2 border-blue-500 bg-[#3b83f60e] font-medium"
                            : "text-[#778092] hover:bg-[#3b83f605] hover:border-l-2 hover:border-blue-500"
                          }`}
                      >
                        <Icon className="text-[20px]" />
                        <span className="text-[16px] ml-2">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {role === "Team-Leader" && (
                <div className="mt-4 space-y-2">
                  {TeamButtons.map(({ to, label, icon: Icon }) => {
                    const isActive = location.pathname === to;
                    return (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => onTitleChange(label)}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200
                          ${isActive
                            ? "border-l-2 border-blue-500 bg-[#3b83f60e] font-medium"
                            : "text-[#778092] hover:bg-[#3b83f605] hover:border-l-2 hover:border-blue-500"
                          }`}
                      >
                        <Icon className="text-[20px]" />
                        <span className="text-[16px] ml-2">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            {role === "Super-Admin" && (

              <div className="mt-2 space-y-2">
                <button
                  onClick={toggleContent}
                  className="w-full flex cursor-pointer items-center gap-2 px-4 py-2 rounded-full bg-[#3b83f60a] text-white text-sm transition-all duration-200 hover:bg-[#3b83f620]"
                >
                  <Plus size={18} /> Announcement
                </button>

                <div ref={contentRef} className="hidden-content">
                  <div className="draft-template">
                    <button
                      className="w-full flex cursor-pointer items-center gap-2 px-4 py-2 rounded-full bg-[#3b83f60a] text-white text-sm hover:bg-[#3b83f620]"
                      onClick={() => setShowDraftPopup(true)}
                    >
                      <ClipboardPlus size={18} /> Draft Template
                    </button>

                    <DraftTemplate
                      showDraftPopup={showDraftPopup}
                      setShowDraftPopup={setShowDraftPopup}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 border-t border-gray-700 px-4 py-3">
            <div ref={userRef} className="flex items-center gap-3 mb-3">
              <img
                src={userData?.avatar?.url}
                alt="user-avatar"
                className="h-9 w-9 rounded-full border border-gray-600 shadow-sm"
              />
              <div
                className="flex flex-col relative"
                onMouseEnter={() => setOpenUser(true)}
                onMouseLeave={() => setOpenUser(false)}
              >
                <p className="text-[16px] font-medium text-white capitalize">
                  {userData.FullName}
                </p>
                <UserMenu openUser={openUser} userData={userData} />
                <span className="text-xs capitalize text-white bg-[#198477] rounded-md px-2 py-[1px] w-fit">
                  {role}
                </span>
              </div>
            </div>

            {toggle && (
              <Link
                to={
                  role === "User"
                    ? "/user/setting"
                    : role === "Admin"
                      ? "/admin/setting"
                      : role === "Super-Admin"
                        ? "/dashboard/setting"
                        : role === "Team-Leader"
                          ? "/team/setting"
                          : role === "Checker"
                            ? "/checker/setting"
                            : "/default/setting"
                }
                onClick={() => { }}
                className="flex px-2 items-center gap-4 font-medium text-white cursor-pointer transition-colors duration-200"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm">Settings</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="py-2">
          <div className="absolute inset-0 -z-10"></div>
          <Link
            to={"/"}
            className="flex justify-center items-center mt-10 z-10"
          >
            <img
              src={logo}
              alt="communication-center"
              className="h-8 w-8 object-contain hidden dark:block"
            />
          </Link>
          {navItems.map(({ to, icon }) => (
            <div
              className="text-white relative flex items-center mt-3 cursor-pointer p-1 ml-4 z-10"
              key={to}
            >
              <Link to={to}>
                <div className="p-2 hover:bg-[#3b83f61a] text-white rounded-lg">
                  {icon}
                </div>
              </Link>
            </div>
          ))}

          <div className="absolute bottom-4 left-6 flex justify-center items-center z-10">
            <div className="flex flex-col gap-4 relative">
              <Link to={"setting"}>
                <Settings className="cursor-pointer rounded-full text-white hover:bg-[#1c1c27a9]" />
              </Link>
              <div ref={wrapperRef} className="relative">
                <img
                  src={
                    userData?.avatar?.url ||
                    "https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg"
                  }
                  alt=""
                  className="rounded-lg h-9 w-9"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Menus;
