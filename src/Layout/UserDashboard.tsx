import AttendanceDashboard from "../components/Dashboard/UserDashboard/AttendanceDashboard";
import DialogsProvider from "../components/hooks/useDialogs/DialogsProvider";
import NotificationsProvider from "../components/hooks/useNotifications/NotificationsProvider";


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
