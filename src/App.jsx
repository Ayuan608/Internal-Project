import "./App.css"
import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";

import Login from "./pages/Login";
import Layout from "./Layout/Layout";
import NotRequireAuth from "./components/Auth/NotRequireAuth";
import RequireAuth from "./components/Auth/RequireAuth";
import Denied from "./pages/404/Denied";

import Dashboard from "./components/Dashboard/Dashboard";
import Setting from "./pages/Setting";
import UserDashboard from "./Layout/UserDashboard";
import CheckerDashboard from "./components/Dashboard/CheckerDashboard/CheckerDashboard";

import DailyTimeRecord from "./components/Dashboard/UserDashboard/DailyTimeRecord";
import PerformanceDashboard from "./components/Dashboard/UserDashboard/PerformanceDashboard";
import Announcement from "./components/Dashboard/UserDashboard/Annoucement";
import UserReport from "./components/Dashboard/UserDashboard/UserReport";

import Department from "./components/Dashboard/SuperAdminDashboardRoute/Department";
import NonQuota from "./components/Dashboard/SuperAdminDashboardRoute/NonQuota";
import OverallAttendance from "./components/Dashboard/SuperAdminDashboardRoute/OverallAttendance";
import ActivityLogs from "./components/Dashboard/SuperAdminDashboardRoute/ActivityLogs";
import Storage from "./components/Dashboard/SuperAdminDashboardRoute/Storage";
import Report from "./components/Dashboard/SuperAdminDashboardRoute/Report";
import EmployeeOfTheMonthAdmin from "./components/Dashboard/SuperAdminDashboardRoute/ui/EmployeeOfTheMonth";
import DataStoragePage from "./components/Dashboard/SuperAdminDashboardRoute/DataStorage";
import NonQuotaDepartment from "./components/Dashboard/SuperAdminDashboardRoute/ui/NonQuotaDepartment";

import Admin from "./components/Add Employee/Admin";
import EmployeeDirectory from "./components/Dashboard/AdminDashboard/EmployeeDirectory";
import LoginCredentials from "./components/Dashboard/AdminDashboard/LoginCredentials";
import ShiftManagement from "./components/Dashboard/AdminDashboard/shift-management";

import TeamLeaderDashboard from "./components/Dashboard/TeamLeaderDashboard/TeamLeaderDashboard";
import AttendanceRecords from "./components/Dashboard/TeamLeaderDashboard/AttendanceRecords";
import RestDay from "./components/Dashboard/TeamLeaderDashboard/RestDay";
import Performance from "./components/Dashboard/TeamLeaderDashboard/Performance";

import CheckReport from "./components/Dashboard/CheckerDashboard/CheckReport";

import InternalMailingPage from "./pages/Internal Mailing/InternalMailingPages";
import LeaveRequest from "./pages/LeaveRequest";
import FileSharing from "./pages/File Sharing/FileSharing";
import Calender from "./pages/Calendar/Calender";

import { onMessageListener, requestForToken } from "./services/firebase/firebase";
import DayOffRequestsPage from "./components/Dashboard/UserDashboard/day_off_requests_dashboard";
import AuditTrailSection from "./components/Dashboard/AdminDashboard/AuditTrailSection";

function App() {

  useEffect(() => {
    requestForToken();

    onMessageListener()
      .then((payload) => {
        const { title, body } = payload?.notification || {};

        toast.custom((t) => (
          <div className={`${t.visible ? "animate-custom-enter" : "animate-leave"}
            max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <Bell className="h-10 w-10" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {title || "New Notification"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {body || "You have a new message."}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="p-4 text-indigo-600 hover:text-indigo-500"
            >
              Close
            </button>
          </div>
        ));
      })
      .catch((err) => console.error("Notification Error:", err));
  }, []);

  return (
    <Routes>

      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* PUBLIC ROUTES */}
      <Route element={<NotRequireAuth />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* SUPER ADMIN ROUTES */}
      <Route element={<RequireAuth allowedRoles={["Super-Admin"]} />}>
        <Route path="/dashboard" element={<Layout />}>

          <Route index element={<Dashboard />} />
          <Route path="data-storage" element={<DataStoragePage />} />
          <Route path="department" element={<Department />} />
          <Route path="nonQuta" element={<NonQuota />} />
          <Route path="add" element={<Admin />} />
          <Route path="announcement" element={<Announcement />} />
          <Route path="EmployeeOfTheMonthAdmin" element={<EmployeeOfTheMonthAdmin />} />
          <Route path="report" element={<Report />} />
          <Route path="overallAttendance" element={<OverallAttendance />} />
          <Route path="activityLogs" element={<ActivityLogs />} />
          <Route path="attendancerecords" element={<AttendanceRecords />} />
          <Route path="setting" element={<Setting />} />
          <Route path="login" element={<LoginCredentials />} />
          <Route path="storage" element={<Storage />} />
          <Route path="calender" element={<Calender />} />
          <Route path="file-sharing" element={<FileSharing />} />
          <Route path="Internal-mailing" element={<InternalMailingPage />} />
          <Route path="audit-trial" element={<AuditTrailSection />}/>
        </Route>
      </Route>

      {/* ADMIN ROUTES */}
      <Route element={<RequireAuth allowedRoles={["Admin"]} />}>
        <Route path="/admin" element={<Layout />}>

          <Route index element={<Dashboard />} />
          <Route path="login" element={<LoginCredentials />} />
          <Route path="department" element={<Department />} />
          <Route path="directory" element={<Admin />} />
          <Route path="data-storage" element={<DataStoragePage />} />
          <Route path="announcement" element={<Announcement />} />
          <Route path="setting" element={<Setting />} />
          <Route path="report" element={<CheckReport />} />
          <Route path="file-sharing" element={<FileSharing />} />
          <Route path="calender" element={<Calender />} />
          <Route path="storage" element={<Storage />} />
          <Route path="attendance" element={<UserDashboard />} />
          <Route path="attendancerecords" element={<AttendanceRecords />} />
          <Route path="shift-management" element={<ShiftManagement />} />
          <Route path="overallAttendance" element={<OverallAttendance />} />
          <Route path="Internal-mailing" element={<InternalMailingPage />} />
        </Route>
      </Route>

      {/* TEAM LEADER ROUTES */}
      <Route element={<RequireAuth allowedRoles={["Team-Leader"]} />}>
        <Route path="/team" element={<Layout />}>

          <Route index element={<TeamLeaderDashboard />} />
          <Route path="employeeDirectory" element={<EmployeeDirectory />} />
          <Route path="restday" element={<RestDay />} />
          <Route path="non-quotamember" element={<NonQuotaDepartment />} />
          <Route path="attendancerecords" element={<AttendanceRecords />} />
          <Route path="Performance" element={<Performance />} />
          <Route path="setting" element={<Setting />} />
          <Route path="attandance" element={<UserDashboard />} />
          <Route path="leave-request" element={<LeaveRequest />} />
          <Route path="report" element={<CheckReport />} />
          <Route path="file-sharing" element={<FileSharing />} />
          <Route path="calender" element={<Calender />} />
          <Route path="Internal-mailing" element={<InternalMailingPage />} />
          <Route path="shift-management" element={<ShiftManagement />} />

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
          <Route path="DayOffRequestsPage" element={<DayOffRequestsPage />} />
          <Route path="calender" element={<Calender />} />
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

      {/* 404 */}
      <Route path="/denied" element={<Denied />} />
      <Route path="*" element={<Navigate to="/denied" />} />

    </Routes>
  );
}

export default App;
