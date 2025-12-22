// src/routes/index.jsx
import { lazy } from 'react';

// Auth Components
export const Login = lazy(() => import('../pages/Login'));
export const NotRequireAuth = lazy(() => import('../components/Auth/NotRequireAuth'));
export const RequireAuth = lazy(() => import('../components/Auth/RequireAuth'));
export const Denied = lazy(() => import('../pages/404/Denied'));

// Layout Components
export const Layout = lazy(() => import('../Layout/Layout'));
export const UserDashboard = lazy(() => import('../Layout/UserDashboard'));

// Dashboard Components
export const Dashboard = lazy(() => import('../components/Dashboard/Dashboard'));
export const CheckerDashboard = lazy(() => import('../components/Dashboard/CheckerDashboard/CheckerDashboard'));
export const TeamLeaderDashboard = lazy(() => import('../components/Dashboard/TeamLeaderDashboard/TeamLeaderDashboard'));

// User Dashboard Components
export const DailyTimeRecord = lazy(() => import('../components/Dashboard/UserDashboard/DailyTimeRecord'));
export const PerformanceDashboard = lazy(() => import('../components/Dashboard/UserDashboard/PerformanceDashboard'));
export const Announcement = lazy(() => import('../components/Dashboard/UserDashboard/Annoucement'));
export const UserReport = lazy(() => import('../components/Dashboard/UserDashboard/UserReport'));
export const DayOffRequestsPage = lazy(() => import('../components/Dashboard/UserDashboard/day_off_requests_dashboard'));

// Super Admin Components
export const Department = lazy(() => import('../components/Dashboard/SuperAdminDashboardRoute/Department'));
export const NonQuota = lazy(() => import('../components/Dashboard/SuperAdminDashboardRoute/NonQuota'));
export const OverallAttendance = lazy(() => import('../components/Dashboard/SuperAdminDashboardRoute/OverallAttendance'));
export const ActivityLogs = lazy(() => import('../components/Dashboard/SuperAdminDashboardRoute/ActivityLogs'));
export const Storage = lazy(() => import('../components/Dashboard/SuperAdminDashboardRoute/Storage'));
export const Report = lazy(() => import('../components/Dashboard/SuperAdminDashboardRoute/Report'));
export const EmployeeOfTheMonthAdmin = lazy(() => import('../components/Dashboard/SuperAdminDashboardRoute/ui/EmployeeOfTheMonth'));
export const DataStoragePage = lazy(() => import('../components/Dashboard/SuperAdminDashboardRoute/DataStorage'));
export const NonQuotaDepartment = lazy(() => import('../components/Dashboard/SuperAdminDashboardRoute/ui/NonQuotaDepartment'));

// Admin Components
export const Admin = lazy(() => import('../components/Add Employee/Admin'));
export const EmployeeDirectory = lazy(() => import('../components/Dashboard/AdminDashboard/EmployeeDirectory'));
export const LoginCredentials = lazy(() => import('../components/Dashboard/AdminDashboard/LoginCredentials'));
export const ShiftManagement = lazy(() => import('../components/Dashboard/AdminDashboard/shift-management'));
export const AuditTrailSection = lazy(() => import('../components/Dashboard/AdminDashboard/AuditTrailSection'));

// Team Leader Components
export const AttendanceRecords = lazy(() => import('../components/Dashboard/TeamLeaderDashboard/AttendanceRecords'));
export const RestDay = lazy(() => import('../components/Dashboard/TeamLeaderDashboard/RestDay'));
export const Performance = lazy(() => import('../components/Dashboard/TeamLeaderDashboard/Performance'));

// Checker Components
export const CheckReport = lazy(() => import('../components/Dashboard/CheckerDashboard/CheckReport'));

// Common Pages
export const Setting = lazy(() => import('../pages/Setting'));
export const InternalMailingPage = lazy(() => import('../pages/Internal Mailing/InternalMailingPages'));
export const LeaveRequest = lazy(() => import('../pages/LeaveRequest'));
export const FileSharing = lazy(() => import('../pages/File Sharing/FileSharing'));
export const Calender = lazy(() => import('../pages/Calendar/Calender'));