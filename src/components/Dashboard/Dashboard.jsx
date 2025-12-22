import TeamLeaderStats from "./SuperAdminDashboardRoute/ui/TeamLeaderStats";
import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import PerformanceTrendCard from "../ModernChart/PerformanceTrendCard";
import CustomizedDataGrid from "./SuperAdminDashboardRoute/ui/data/CustomizedDataGrid";
import { onMessageListener, requestForToken } from "../../services/firebase/firebase";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";
export default function Dashboard() {
  const [teamLeaderData, setTeamLeaderData] = useState([]);
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
    <>
      <div className="min-h-screen text-gray-100 p-4">
        <div
          className=" top-0 rounded-lg p-2 z-auto backdrop-blur-3xl "
          style={{ zIndex: 9 }}
        >
          <div className="p-4 bg-[#282e3c38] rounded-xl mb-4 w-full">
            <TeamLeaderStats
              title="Dashboard Overview"
              SecondaryTitle="Monitor real-time metrics and performance across all departments"
              data={teamLeaderData}
            />
          </div>
        </div>

        <div className="flex gap-6 mt-2 overflow-y-auto px-2">
          <PerformanceTrendCard
            title="Monthly Performance Overview"
            height={400}
            showFullMonth={true}
          />
        </div>

        <CustomizedDataGrid onStatsUpdate={setTeamLeaderData} />
      </div>
    </>
  );
}