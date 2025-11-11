import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./Layout/Layout";
import Dashboard from "./components/Dashboard/Dashboard";
import NotRequireAuth from "./components/Auth/NotRequireAuth";
import RequireAuth from "./components/Auth/RequireAuth";
import Setting from "./pages/Setting";
import UserDashboard from "./Layout/UserDashboard";
import Denied from "./pages/404/Denied";
import CheckerDashboard from "./Layout/CheckerDashboard";
import DailyTimeRecord from "./components/Dashboard/UserDashboard/DailyTimeRecord";
import PerformanceDashboard from "./components/Dashboard/UserDashboard/PerformanceDashboard";
import Department from "./components/Dashboard/SuperAdminDashboardRoute/Department";
import NonQuota from "./components/Dashboard/SuperAdminDashboardRoute/NonQuota";
import QuotaSetting from "./components/Dashboard/SuperAdminDashboardRoute/QuotaSetting";
import OverallAttendance from "./components/Dashboard/SuperAdminDashboardRoute/OverallAttendance";
import ActivityLogs from "./components/Dashboard/SuperAdminDashboardRoute/ActivityLogs";
import Admin from "./components/Add Employee/Admin";
import LoginCredentials from "./components/Dashboard/AdminDashboard/LoginCredentials";
import EmployeeDirectory from "./components/Dashboard/AdminDashboard/EmployeeDirectory";
import Announcement from "./components/Dashboard/UserDashboard/Annoucement";
import TeamLeaderDashboard from "./components/Dashboard/TeamLeaderDashboard/TeamLeaderDashboard";
import RestDay from './components/Dashboard/TeamLeaderDashboard/RestDay';
import AttendanceRecords from "./components/Dashboard/TeamLeaderDashboard/AttendanceRecords";
import Performance from "./components/Dashboard/TeamLeaderDashboard/Performance";
import CheckReport from "./components/Dashboard/CheckerDashboard/CheckReport";
import Storage from "./components/Dashboard/SuperAdminDashboardRoute/Storage";
import EmployeeOfTheMonthAdmin from "./components/Dashboard/SuperAdminDashboardRoute/ui/EmployeeOfTheMonth";
import Report from "./components/Dashboard/SuperAdminDashboardRoute/Report";
import ShiftManagement from "./components/Dashboard/AdminDashboard/shift-management";
import IPWhitelistDashboard from "./components/Dashboard/AdminDashboard/ip-whiteList";
import UserReport from "./components/Dashboard/UserDashboard/UserReport";
import { useEffect } from "react";
import { onMessageListener, requestForToken } from "./services/firebase/firebase";
import { useTranslation } from "react-i18next";

function App() {
  useEffect(() => {
    requestForToken();
    onMessageListener().then((payload) => {
      console.log("🎯 Notification Received in Foreground:", payload);
      alert(`${payload.notification.title}\n${payload.notification.body}`);
    });
  }, []);
  const { i18n: i18nextInstance } = useTranslation();

  useEffect(() => {
    const savedLang = localStorage.getItem("language") || "en";
    i18nextInstance.changeLanguage(savedLang);
  }, [i18nextInstance]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<NotRequireAuth />}>
        <Route path="/login" element={<Login />} />
      </Route>
      {/* SUPER-ADMIN ROUTES */}
      <Route element={<RequireAuth allowedRoles={["Super-Admin"]} />}>
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="department" element={<Department />} />
          <Route path="nonQuta" element={<NonQuota />} />
          <Route path="quotaSetting" element={<QuotaSetting />} />
          <Route path="add" element={<Admin />} />
          <Route path="announcement" element={<Announcement />} />
          <Route path="EmployeeOfTheMonthAdmin" element={<EmployeeOfTheMonthAdmin />} />
          <Route path="report" element={<Report />} />
          <Route path="overallAttendance" element={<OverallAttendance />} />
          <Route path="activityLogs" element={<ActivityLogs />} />
          <Route path="setting" element={<Setting />} />
          <Route path="login" element={<LoginCredentials />} />
          <Route path="storage" element={<Storage />} />
          <Route path="ip-address" element={<IPWhitelistDashboard />} />
        </Route>
      </Route>
      {/* ADMIN ROUTES */}
      <Route element={<RequireAuth allowedRoles={["Admin"]} />}>
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="login" element={<LoginCredentials />} />
          <Route path="department" element={<Department />} />
          <Route path="quotaSetting" element={<QuotaSetting />} />
          <Route path="directory" element={<Admin />} />
          <Route path="announcement" element={<Announcement />} />
          <Route path="setting" element={<Setting />} />
          <Route path="report" element={<CheckReport />} />
          <Route path="shift-management" element={<ShiftManagement />} />
          <Route path="overallAttendance" element={<OverallAttendance />} />
          <Route path="ip-address" element={<IPWhitelistDashboard />} />
        </Route>
      </Route>
      {/* USER ROUTES */}
      <Route element={<RequireAuth allowedRoles={["User"]} />}>
        <Route path="/user" element={<Layout />}>
          <Route index element={<UserDashboard />} />
          <Route path="daily-time-record" element={<DailyTimeRecord />} />
          <Route path="performance" element={<PerformanceDashboard />} />
          <Route path="announcement" element={<Announcement />} />
          <Route path="setting" element={<Setting />} />
          <Route path="report" element={<UserReport />} />
        </Route>
      </Route>
      {/* CHECKER ROUTES */}
      <Route element={<RequireAuth allowedRoles={["Checker"]} />}>
        <Route path="/checker" element={<Layout />}>
          <Route index element={<CheckerDashboard />} />
          <Route path="report" element={<CheckReport />} />
          <Route path="setting" element={<Setting />} />
        </Route>
      </Route>
      {/* TEAM LEADER ROUTES */}
      <Route element={<RequireAuth allowedRoles={["Team-Leader"]} />}>
        <Route path="/team" element={<Layout />}>
          <Route index element={<TeamLeaderDashboard />} />
          <Route path="employeeDirectory" element={<EmployeeDirectory />} />
          <Route path="restday" element={<RestDay />} />
          <Route path="non-quotamember" element={<NonQuota />} />
          <Route path="attendancerecords" element={<AttendanceRecords />} />
          <Route path="Performance" element={<Performance />} />
          <Route path="setting" element={<Setting />} />
          <Route path="report" element={<CheckReport />} />
          <Route path="shift-management" element={<ShiftManagement />} />
        </Route>
      </Route>
      {/* 404 and Denied */}
      <Route path="/denied" element={<Denied />} />
      <Route path="*" element={<Navigate to="/denied" />} />
    </Routes>
  );
}

export default App;