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
import toast from "react-hot-toast";
import { Bell } from "lucide-react";
import NonQuotaDepartment from "./components/Dashboard/SuperAdminDashboardRoute/ui/NonQuotaDepartment";
import DataStoragePage from "./components/Dashboard/SuperAdminDashboardRoute/DataStorage";
import InternalMailingPage from "./pages/Internal Mailing/InternalMailingPages";

function App() {
  useEffect(() => {
    requestForToken();

    onMessageListener()
      .then((payload) => {
      

        const notification = payload?.notification;
        const title = notification?.title || "New Notification";
        const body = notification?.body || "You have a new message.";

        toast.custom((t) => (
          <div
            className={`${t.visible ? "animate-custom-enter" : "animate-leave"
              }  max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <Bell className="h-10 w-10 rounded-fullv" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="mt-1 text-sm text-gray-500">{body}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        ));
      })
      .catch((err) => console.error("Error receiving notification:", err));
  }, []);


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
          <Route path="data-storage" element={<DataStoragePage />} />
          <Route path="department" element={<Department />} />
          <Route path="nonQuta" element={<NonQuota />} />
          <Route path="add" element={<Admin />} />
          <Route path="announcement" element={<Announcement />} />
          <Route path="EmployeeOfTheMonthAdmin" element={<EmployeeOfTheMonthAdmin />} />
          <Route path="report" element={<Report />} />
          <Route path="overallAttendance" element={<OverallAttendance />} />
          <Route path="activityLogs" element={<ActivityLogs />} />
          <Route path="setting" element={<Setting />} />
          <Route path="login" element={<LoginCredentials />} />
          <Route path="storage" element={<Storage />} />
          <Route path="Internal-mailing" element={<InternalMailingPage />} />
          <Route path="ip-address" element={<IPWhitelistDashboard />} />
        </Route>
      </Route>
      {/* ADMIN ROUTES */}
      <Route element={<RequireAuth allowedRoles={["Admin"]} />}>
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="login" element={<LoginCredentials />} />
          <Route path="department" element={<Department />} />
          <Route path="directory" element={<Admin />} />
          <Route path="announcement" element={<Announcement />} />
          <Route path="setting" element={<Setting />} />
          <Route path="report" element={<CheckReport />} />
          <Route path="attendancerecords" element={<AttendanceRecords />} />
          <Route path="shift-management" element={<ShiftManagement />} />
          <Route path="overallAttendance" element={<OverallAttendance />} />
          <Route path="Internal-mailing" element={<InternalMailingPage />} />
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
          <Route path="non-quotamember" element={<NonQuotaDepartment />} />
          <Route path="attendancerecords" element={<AttendanceRecords />} />
          <Route path="Performance" element={<Performance />} />
          <Route path="setting" element={<Setting />} />
          <Route path="report" element={<CheckReport />} />
          <Route path="Internal-mailing" element={<InternalMailingPage />} />
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