import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./Layout/Layout";
import Dashboard from "./components/Dashboard/Dashboard";
import NotRequireAuth from "./components/Auth/NotRequireAuth";
import RequireAuth from "./components/Auth/RequireAuth";
import Report from "./components/Report/Report";
import Admin from "./components/Add Employee/Admin";
import Setting from "./pages/Setting";
import Data from "./components/Data/Data";
import UserDashboard from "./Layout/UserDashboard";
import Denied from "./pages/404/Denied";
import Annoucement from "./components/Dashboard/UserDashboard/Annoucement";
import DashboardRoutes from "./components/Dashboard/SuperAdminDashboardRoute/DashboardRoutes";
import CheckerDashboard from "./Layout/CheckerDashboard";
import Alert from "./components/Dashboard/CheckerDashboard/Alert";
import Notification from "./components/popup/Notification";
import SendNotificationForm from "./components/popup/SendNotificationForm";
import DailyTimeRecord from "./components/Dashboard/UserDashboard/DailyTimeRecord";
import PerformanceDashboard from "./components/Dashboard/UserDashboard/PerformanceDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="notification" element={<SendNotificationForm />} />
      <Route element={<NotRequireAuth />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route
        element={<RequireAuth allowedRoles={["Team-Leader", "Super-Admin"]} />}
      >
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="data" element={<Data />} />
          <Route path="report" element={<Report />} />
          <Route path="add" element={<Admin />} />
          <Route path="setting" element={<Setting />} />

          {DashboardRoutes()}
        </Route>
      </Route>

      <Route element={<RequireAuth allowedRoles={["User"]} />}>
        <Route path="/user" element={<Layout />}>
          <Route index element={<UserDashboard />} />
          <Route path="daily-time-record" element={<DailyTimeRecord />} />
          <Route path="performance" element={<PerformanceDashboard />} />
          <Route path="announcement" element={<Annoucement />} />
          <Route path="setting" element={<Setting />} />
        </Route>
      </Route>
      <Route element={<RequireAuth allowedRoles={["Checker"]} />}>
        <Route path="/checker" element={<Layout />}>
          <Route index element={<CheckerDashboard />} />
          <Route path="alert" element={<Alert />} />
        </Route>
      </Route>
      {/* 404 and Denied */}
      <Route path="/denied" element={<Denied />} />
      <Route path="*" element={<Navigate to="/denied" />} />
    </Routes>
  );
}

export default App;
