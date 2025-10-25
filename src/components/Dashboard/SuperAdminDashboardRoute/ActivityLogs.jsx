import React from "react";

const ActivityLogs = () => {
  const activities = [
    {
      timestamp: "2025-10-17 14:30:22",
      user: "Super Admin",
      action: "Quota Update",
      details: "Updated CSR morning quota to 50"
    },
    {
      timestamp: "2025-10-17 13:15:10",
      user: "David Chen",
      action: "Login",
      details: "Successfully logged in from 192.168.1.100"
    },
    {
      timestamp: "2025-10-17 12:45:33",
      user: "Super Admin",
      action: "User Added",
      details: "Added new team leader: Lisa Martinez"
    }
  ];

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Activity Logs</h1>
          <p className="text-gray-600">Track all system activities and changes</p>
        </div>

        <div className="bg-[rgba(59,131,246,0.06)] rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activities</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-800 text-white">
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y w-full divide-slate-800">
                  {activities.map((activity, index) => (
                    <tr key={index} className=" transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {activity.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {activity.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {activity.action}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {activity.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;