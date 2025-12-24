import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense } from "react";

import {
  Login,
  Layout,
  NotRequireAuth,
  RequireAuth,
  Denied,
  Dashboard,
  Settings,
  UserDashboard,
  CheckerDashboard,
  DailyTimeRecord,
  PerformanceDashboard,
  Announcement,
  UserReport,
  Department,
  NonQuota,
  OverallAttendance,
  ActivityLogs,
  Storage,
  Report,
  EmployeeOfTheMonthAdmin,
  DataStoragePage,
  NonQuotaDepartment,
  Admin,
  EmployeeDirectory,
  LoginCredentials,
  ShiftManagement,
  TeamLeaderDashboard,
  AttendanceRecords,
  RestDay,
  Performance,
  CheckReport,
  InternalMailingPage,
  LeaveRequest,
  FileSharing,
  Calender,
  DayOffRequestsPage,
  AuditTrailSection
} from "./routes/index";

const NoLoader = () => null;

function App() {
  return (
    <Suspense fallback={<NoLoader />}>
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
            <Route path="setting" element={<Settings />} />
            <Route path="login" element={<LoginCredentials />} />
            <Route path="storage" element={<Storage />} />
            <Route path="calender" element={<Calender />} />
            <Route path="file-sharing" element={<FileSharing />} />
            <Route path="Internal-mailing" element={<InternalMailingPage />} />
            <Route path="audit-trial" element={<AuditTrailSection />} />
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
            <Route path="setting" element={<Settings />} />
            <Route path="report" element={<CheckReport />} />
            <Route path="file-sharing" element={<FileSharing />} />
            <Route path="calender" element={<Calender />} />
            <Route path="storage" element={<Storage />} />
            <Route path="attendance" element={<UserDashboard />} />
            <Route path="attendancerecords" element={<AttendanceRecords />} />
            <Route path="shift-management" element={<ShiftManagement />} />
            <Route path="overallAttendance" element={<OverallAttendance />} />
            <Route path="Internal-mailing" element={<InternalMailingPage />} />
            <Route path="daily-time-record" element={<DailyTimeRecord />} />
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
            <Route path="attandance" element={<UserDashboard />} />
            <Route path="leave-request" element={<LeaveRequest />} />
            <Route path="report" element={<CheckReport />} />
            <Route path="file-sharing" element={<FileSharing />} />
            <Route path="calender" element={<Calender />} />
            <Route path="Internal-mailing" element={<InternalMailingPage />} />
            <Route path="shift-management" element={<ShiftManagement />} />
            <Route path="daily-time-record" element={<DailyTimeRecord />} />
          </Route>
        </Route>

        {/* USER ROUTES */}
        <Route element={<RequireAuth allowedRoles={["User"]} />}>
          <Route path="/user" element={<Layout />}>
            <Route index element={<UserDashboard />} />
            <Route path="daily-time-record" element={<DailyTimeRecord />} />
            <Route path="performance" element={<PerformanceDashboard />} />
            <Route path="announcement" element={<Announcement />} />
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
            <Route path="storage" element={<Storage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="/denied" element={<Denied />} />
        <Route path="*" element={<Navigate to="/denied" />} />
      </Routes>
    </Suspense>
  );
}

export default App;