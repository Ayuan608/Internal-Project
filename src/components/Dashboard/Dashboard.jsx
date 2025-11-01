import Charts from "./Chart";
import TeamLeaderStats from "./SuperAdminDashboardRoute/ui/TeamLeaderStats";
import { TeamStats } from "../../Helpers/Helper";
import CustomizedDataGrid from "./SuperAdminDashboardRoute/ui/data/CustomizedDataGrid";
import ExampleIosSwitch from "./SuperAdminDashboardRoute/ui/Switch";
import { useState } from 'react';
import { useEffect } from 'react';
import { checkNotificationPermission, initializeNotifications } from "../../services/notificationService";

import { useSelector } from "react-redux";


export default function Dashboard() {
  const [teamLeaderData, setTeamLeaderData] = useState([]);
  const [fcmToken, setFcmToken] = useState(null);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Check current notification permission
    setPermission(checkNotificationPermission());

    // Initialize FCM
    const initFCM = async () => {
      const token = await initializeNotifications();
      if (token) {
        setFcmToken(token);
      }
    };

    initFCM();
  }, []);

  const userId = useSelector((state) => state.auth?.data?._id);


  return (
    <>

      <div className="min-h-screen text-gray-100 bg-black">
        <div
          className=" top-0 rounded-lg p-2 z-auto backdrop-blur-3xl "
          style={{ zIndex: 9 }}
        >
          <div className="flex justify-end p-2 ">

            <ExampleIosSwitch />
          </div>

          <div className="p-2 bg-[#282e3c38] rounded-xl mb-4 w-full">
            <TeamLeaderStats
              title="Dashboard Overview"
              SecondaryTitle="Monitor real-time metrics and performance across all departments"
              data={teamLeaderData}
            />
          </div>
        </div>
        <div className="flex gap-6 mt-2 overflow-y-auto px-2">
          <Charts />
        </div>

        <CustomizedDataGrid onStatsUpdate={setTeamLeaderData} />
      </div>
    </>
  );
}
