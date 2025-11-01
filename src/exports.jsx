// src/exports.js

// ✅ React Core
export { useEffect } from "react";

// ✅ React Router
export { Navigate, Route, Routes } from "react-router-dom";

// ✅ Firebase
export { onMessageListener, requestForToken } from "./services/firebase/firebase";

// ✅ Layouts
export { default as Layout } from "./Layout/Layout";
export { default as UserDashboard } from "./Layout/UserDashboard";
export { default as CheckerDashboard } from "./Layout/CheckerDashboard";
export { default as TeamLeaderDashboard } from "./components/Dashboard/TeamLeaderDashboard/TeamLeaderDashboard";

// ✅ Authentication Components
export { default as NotRequireAuth } from "./components/Auth/NotRequireAuth";
export { default as RequireAuth } from "./components/Auth/RequireAuth";

// ✅ Pages
export { default as Login } from "./pages/Login";
export { default as Setting } from "./pages/Setting";
export { default as Denied } from "./pages/404/Denied";

// ✅ Popups
export { default as SendNotificationForm } from "./components/popup/SendNotificationForm";

// ✅ Super Admin Dashboard
export { default as Dashboard } from "./components/Dashboard/Dashboard";
export { default as Department } from "./components/Dashboard/SuperAdminDashboardRoute/Department";
export { default as NonQuota } from "./components/Dashboard/SuperAdminDashboardRoute/NonQuota";
export { default as QuotaSetting } from "./components/Dashboard/SuperAdminDashboardRoute/QuotaSetting";
export { default as OverallAttendance } from "./components/Dashboard/SuperAdminDashboardRoute/OverallAttendance";
export { default as ActivityLogs } from "./components/Dashboard/SuperAdminDashboardRoute/ActivityLogs";
export { default as Storage } from "./components/Dashboard/SuperAdminDashboardRoute/Storage";
export { default as EmployeeOfTheMonthAdmin } from "./components/Dashboard/SuperAdminDashboardRoute/ui/EmployeeOfTheMonth";
export { default as Report } from "./components/Dashboard/SuperAdminDashboardRoute/Report";

// ✅ Admin Dashboard
export { default as Admin } from "./components/Add Employee/Admin";
export { default as LoginCredentials } from "./components/Dashboard/AdminDashboard/LoginCredentials";
export { default as EmployeeDirectory } from "./components/Dashboard/AdminDashboard/EmployeeDirectory";
export { default as ShiftManagement } from "./components/Dashboard/AdminDashboard/shift-management";
export { default as IPWhitelistDashboard } from "./components/Dashboard/AdminDashboard/ip-whiteList";

// ✅ User Dashboard
export { default as DailyTimeRecord } from "./components/Dashboard/UserDashboard/DailyTimeRecord";
export { default as PerformanceDashboard } from "./components/Dashboard/UserDashboard/PerformanceDashboard";
export { default as Announcement } from "./components/Dashboard/UserDashboard/Annoucement";
export { default as UserReport } from "./components/Dashboard/UserDashboard/UserReport";

// ✅ Team Leader Dashboard
export { default as RestDay } from "./components/Dashboard/TeamLeaderDashboard/RestDay";
export { default as AttendanceRecords } from "./components/Dashboard/TeamLeaderDashboard/AttendanceRecords";
export { default as Performance } from "./components/Dashboard/TeamLeaderDashboard/Performance";

// ✅ Checker Dashboard
export { default as CheckReport } from "./components/Dashboard/CheckerDashboard/CheckReport";
