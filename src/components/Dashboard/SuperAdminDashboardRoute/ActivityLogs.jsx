import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  MapPin,
  Clock,
  User,
  Globe,
  Shield,
} from "lucide-react";

const ActivityLogs = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchLoginActivities();
    const interval = setInterval(fetchLoginActivities, 30000);

    return () => clearInterval(interval);
  }, [filter]);

  const fetchLoginActivities = async () => {
    try {
      // Mock data — replace with backend API call
      const mockData = [
        {
          _id: "1",
          userId: { name: "John Doe", email: "john@example.com" },
          timestamp: new Date(Date.now() - 5000),
          loginAttempt: "Success",
          ipAddress: "192.168.1.100",
          location: { city: "New York", country: "USA", region: "NY" },
          terminated: false,
        },
        {
          _id: "2",
          userId: { name: "Jane Smith", email: "jane@example.com" },
          timestamp: new Date(Date.now() - 120000),
          loginAttempt: "Failed",
          ipAddress: "203.0.113.45",
          location: { city: "London", country: "UK", region: "England" },
          terminated: false,
        },
        {
          _id: "3",
          userId: { name: "Bob Johnson", email: "bob@example.com" },
          timestamp: new Date(Date.now() - 300000),
          loginAttempt: "Success",
          ipAddress: "198.51.100.78",
          location: { city: "Tokyo", country: "Japan", region: "Kanto" },
          terminated: false,
        },
        {
          _id: "4",
          userId: { name: "Alice Williams", email: "alice@example.com" },
          timestamp: new Date(Date.now() - 600000),
          loginAttempt: "Success",
          ipAddress: "192.0.2.123",
          location: { city: "Sydney", country: "Australia", region: "NSW" },
          terminated: false,
        },
      ];

      const filtered =
        filter === "all"
          ? mockData
          : mockData.filter(
              (a) => a.loginAttempt.toLowerCase() === filter
            );

      setActivities(filtered);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setLoading(false);
    }
  };

  const handleTerminate = async (sessionId) => {
    if (!window.confirm("Are you sure you want to terminate this session?"))
      return;

    setActivities(
      activities.map((a) =>
        a._id === sessionId ? { ...a, terminated: true } : a
      )
    );
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-full mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Login Activity Monitor
          </h1>
          <p className="text-slate-400">
            Real-time tracking of employee login activities and locations
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900/40 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Total Logins</p>
                <p className="text-2xl font-bold text-white">
                  {activities.length}
                </p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Successful</p>
                <p className="text-2xl font-bold text-green-600">
                  {activities.filter((a) => a.loginAttempt === "Success")
                    .length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {activities.filter((a) => a.loginAttempt === "Failed")
                    .length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Active Now</p>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    activities.filter((a) => {
                      const diff =
                        Date.now() - new Date(a.timestamp).getTime();
                      return diff < 900000 && a.loginAttempt === "Success";
                    }).length
                  }
                </p>
              </div>
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Activities
            </button>

            <button
              onClick={() => setFilter("success")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "success"
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Successful
            </button>

            <button
              onClick={() => setFilter("failed")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "failed"
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Failed
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900/40 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Date & Time</th>
                  <th className="px-6 py-3 text-left">Login Attempt</th>
                  <th className="px-6 py-3 text-left">IP Address</th>
                  <th className="px-6 py-3 text-left">Location</th>
                  <th className="px-6 py-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-900">
                {activities.map((activity) => (
                  <tr key={activity._id} className="hover:bg-slate-900/40">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">
                          {activity.userId.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {activity.userId.email}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                        <div>
                          <div>
                            {new Date(
                              activity.timestamp
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(
                              activity.timestamp
                            ).toLocaleTimeString()}{" "}
                            ({formatTime(activity.timestamp)})
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          activity.loginAttempt === "Success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {activity.loginAttempt}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      {activity.ipAddress}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                        <div>
                          {activity.location.city},{" "}
                          {activity.location.country}
                          <div className="text-xs text-slate-500">
                            {activity.location.region}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {activity.loginAttempt === "Success" &&
                        !activity.terminated && (
                          <button
                            onClick={() =>
                              handleTerminate(activity._id)
                            }
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                          >
                            Terminate
                          </button>
                        )}

                      {activity.terminated && (
                        <span className="text-sm text-slate-500">
                          Terminated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ActivityLogs;
