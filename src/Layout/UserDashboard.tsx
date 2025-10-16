import DialogsProvider from "../components/hooks/useDialogs/DialogsProvider";
import NotificationsProvider from "../components/hooks/useNotifications/NotificationsProvider";
import AttendanceDashboard from "./../components/Dashboard/UserDashboard/AttendanceDashboard";

const UserDashboard = () => {
  return (
    <DialogsProvider>
      <NotificationsProvider>
        <AttendanceDashboard />
      </NotificationsProvider>
    </DialogsProvider>
  );
};

export default UserDashboard;
