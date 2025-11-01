import * as App from "./exports";

function AppComponent() {
  console.log("==========app entry point")
  App.useEffect(() => {
    App.requestForToken();

    App.onMessageListener().then((payload) => {
      console.log("🎯 Notification Received in Foreground:", payload);
      alert(`${payload.notification.title}\n${payload.notification.body}`);
    });
  }, []);

  return (
    <App.Routes>
      <App.Route path="/" element={<App.Navigate to="/login" replace />} />
      <App.Route path="notification" element={<App.SendNotificationForm />} />

      {/* Public Routes */}
      <App.Route element={<App.NotRequireAuth />}>
        <App.Route path="/login" element={<App.Login />} />
      </App.Route>

      {/* SUPER-ADMIN ROUTES */}
      <App.Route element={<App.RequireAuth allowedRoles={["Super-Admin"]} />}>
        <App.Route path="/dashboard" element={<App.Layout />}>
          <App.Route index element={<App.Dashboard />} />
          <App.Route path="department" element={<App.Department />} />
          <App.Route path="nonQuta" element={<App.NonQuota />} />
          <App.Route path="quotaSetting" element={<App.QuotaSetting />} />
          <App.Route path="add" element={<App.Admin />} />
          <App.Route path="announcement" element={<App.Announcement />} />
          <App.Route path="EmployeeOfTheMonthAdmin" element={<App.EmployeeOfTheMonthAdmin />} />
          <App.Route path="report" element={<App.Report />} />
          <App.Route path="overallAttendance" element={<App.OverallAttendance />} />
          <App.Route path="activityLogs" element={<App.ActivityLogs />} />
          <App.Route path="setting" element={<App.Setting />} />
          <App.Route path="login" element={<App.LoginCredentials />} />
          <App.Route path="storage" element={<App.Storage />} />
          <App.Route path="ip-address" element={<App.IPWhitelistDashboard />} />
        </App.Route>
      </App.Route>

      {/* ADMIN ROUTES */}
      <App.Route element={<App.RequireAuth allowedRoles={["Admin"]} />}>
        <App.Route path="/admin" element={<App.Layout />}>
          <App.Route index element={<App.Dashboard />} />
          <App.Route path="login" element={<App.LoginCredentials />} />
          <App.Route path="department" element={<App.Department />} />
          <App.Route path="quotaSetting" element={<App.QuotaSetting />} />
          <App.Route path="directory" element={<App.Admin />} />
          <App.Route path="announcement" element={<App.Announcement />} />
          <App.Route path="setting" element={<App.Setting />} />
          <App.Route path="report" element={<App.CheckReport />} />
          <App.Route path="shift-management" element={<App.ShiftManagement />} />
          <App.Route path="overallAttendance" element={<App.OverallAttendance />} />
          <App.Route path="ip-address" element={<App.IPWhitelistDashboard />} />
        </App.Route>
      </App.Route>

      {/* USER ROUTES */}
      <App.Route element={<App.RequireAuth allowedRoles={["User"]} />}>
        <App.Route path="/user" element={<App.Layout />}>
          <App.Route index element={<App.UserDashboard />} />
          <App.Route path="daily-time-record" element={<App.DailyTimeRecord />} />
          {/* <App.Route path="performance" element={<App.PerformanceDashboard />} /> */}
          <App.Route path="announcement" element={<App.Announcement />} />
          <App.Route path="setting" element={<App.Setting />} />
          <App.Route path="report" element={<App.UserReport />} />
        </App.Route>
      </App.Route>

      {/* CHECKER ROUTES */}
      <App.Route element={<App.RequireAuth allowedRoles={["Checker"]} />}>
        <App.Route path="/checker" element={<App.Layout />}>
          <App.Route index element={<App.CheckerDashboard />} />
          <App.Route path="report" element={<App.CheckReport />} />
          <App.Route path="setting" element={<App.Setting />} />
        </App.Route>
      </App.Route>

      {/* TEAM LEADER ROUTES */}
      <App.Route element={<App.RequireAuth allowedRoles={["Team-Leader"]} />}>
        <App.Route path="/team" element={<App.Layout />}>
          <App.Route index element={<App.TeamLeaderDashboard />} />
          <App.Route path="employeeDirectory" element={<App.EmployeeDirectory />} />
          <App.Route path="restday" element={<App.RestDay />} />
          <App.Route path="non-quotamember" element={<App.NonQuota />} />
          <App.Route path="attendancerecords" element={<App.AttendanceRecords />} />
          <App.Route path="Performance" element={<App.Performance />} />
          <App.Route path="setting" element={<App.Setting />} />
          <App.Route path="report" element={<App.CheckReport />} />
          <App.Route path="shift-management" element={<App.ShiftManagement />} />
        </App.Route>
      </App.Route>

      {/* 404 and Denied */}
      <App.Route path="/denied" element={<App.Denied />} />
      <App.Route path="*" element={<App.Navigate to="/denied" />} />
    </App.Routes>
  );
}

export default AppComponent;
