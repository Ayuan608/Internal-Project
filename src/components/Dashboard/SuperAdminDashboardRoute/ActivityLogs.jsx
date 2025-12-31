import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  MapPin,
  Clock,
  User,
  Globe,
  Shield,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { activateStatus, getAllActivities, recordLogin, terminateSession } from "../../../redux/activitylogSlice";


const ActivityLogs = () => {
  const dispatch = useDispatch();
  const { activities } = useSelector((state) => state.activity);
  const [filter, setFilter] = useState("all");


  useEffect(() => {
    dispatch(getAllActivities());
    const interval = setInterval(() => {
      dispatch(getAllActivities());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch, filter]);



  const handleActivityStatus = (activity) => {
    if (!activity || !activity.userId) return;

    if (window.confirm("Are you sure?")) {
      const newStatus = activity.terminated ? "active" : "terminate";

      dispatch(
        activateStatus({
          id: activity.userId?._id || activity.userId,
          status: newStatus,
        })
      ).then(() => {
        dispatch(getAllActivities());
      });
    }
  };



  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  // ✅ Filter logic for successful/failed
  const filteredActivities =
    filter === "all"
      ? activities
      : activities.filter(
        (a) => a.loginAttempt?.toLowerCase() === filter.toLowerCase()
      );
  return (
    <div className="min-h-screen p-6">
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
          {/* Total Logins */}
          <div className="bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Total Logins</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          {/* Successful */}
          <div className="bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Successful</p>
                <p className="text-2xl font-bold">
                  {activities.filter((a) => a.loginAttempt === "Success").length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </div>

          {/* Failed */}
          <div className="bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Failed</p>
                <p className="text-2xl font-bold">
                  {activities.filter((a) => a.loginAttempt === "Failed").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          {/* Active Now */}
          <div className="bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Active Now</p>
                <p className="text-2xl font-bold">
                  {
                    activities.filter((a) => {
                      const diff = Date.now() - new Date(a.createdAt).getTime();
                      return diff < 900000 && a.loginAttempt === "Success";
                    }).length
                  }
                </p>
              </div>
              <Globe className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>


        {/* Filters */}
        <div className="bg-slate-900/40 border border-slate-800/40 rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
            >
              All Activities
            </button>

            <button
              onClick={() => setFilter("Success")}
              className={`px-4 py-2 rounded-lg font-medium transition ${filter === "Success"
                ? "bg-green-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
            >
              Successful
            </button>

            <button
              onClick={() => setFilter("Failed")}
              className={`px-4 py-2 rounded-lg font-medium transition ${filter === "Failed"
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
                {filteredActivities.map((activity) => (
                  <tr key={activity._id} className="hover:bg-slate-900/40">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium  capitalize text-white">
                          {activity.user?.FullName || "Unknown"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {activity.user?.department || "N/A"} —{" "}
                          {activity.user?.role || "N/A"}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                        <div>
                          <div>
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(activity.createdAt).toLocaleTimeString()}{" "}
                            ({formatTime(activity.createdAt)})
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${activity.loginAttempt === "Success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {activity.loginAttempt}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-white">
                      {activity.ipAddress}
                    </td>

                    <td className="px-6 py-4 text-white">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                        <div>
                          {activity.location?.city || "Unknown"},{" "}
                          {activity.location?.country || "Unknown"}
                          <div className="text-xs text-slate-500">
                            {activity.location?.region || ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">

                      {activity.terminated === false ? (
                        <button
                          onClick={() => handleActivityStatus(activity)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                        >
                          Terminate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivityStatus(activity)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                        >
                          Activate
                        </button>
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
