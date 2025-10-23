import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Inbox, X, Bell, Wifi, WifiOff, Send, RefreshCw } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  markNotificationAsRead,
  getAllNotifications,
} from "../../redux/NotificationSlice";
import toast from "react-hot-toast";
import useSocket from "../../hooks/useSocket";
import NotificationSendForm from "../NotificationSendForm";

const NotificationPopup = () => {
  const [visible, setVisible] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const popupRef = useRef(null);
  const dispatch = useDispatch();

  // Redux state
  const { notifications, unreadCount, loading, error } = useSelector(
    (state) => state?.notifications
  );

  const userId = useSelector((state) => state.auth?.data?._id);
  const userRole = useSelector((state) => state.auth?.role);

  const socketConfig = useMemo(
    () => ({
      autoConnect: true,
      enableNotifications: true,
      onConnectionChange: (status) => {
        console.log("🔌 Socket connection status:", status);
      },
    }),
    []
  );

  const {
    connectionStatus,
    isConnected,
    markNotificationAsRead: markAsReadSocket,
    requestNotificationHistory,
  } = useSocket(userId, socketConfig);

  // Primary function to fetch ALL notifications
  const fetchAllNotifications = useCallback(() => {
    dispatch(getAllNotifications());
  }, [dispatch]);

  // Toggle popup
  const togglePopup = useCallback(() => {
    console.log("🔔 Toggling popup. Current visible state:", visible);

    if (!visible) {
      // Always fetch ALL notifications when opening popup
      console.log("📂 Opening popup - Fetching all notifications...");
      fetchAllNotifications();
    }

    setVisible((prev) => !prev);
  }, [visible, fetchAllNotifications]);

  // Mark as read
  const handleMarkAsRead = useCallback(
    async (id) => {
      console.log("📝 Attempting to mark notification as read:", id);

      try {
        if (isConnected) {
          console.log("🔌 Using socket to mark as read");
          markAsReadSocket(id);
          toast.success("Marked as read");
        } else {
          console.log("📡 Using API to mark as read");
          await dispatch(markNotificationAsRead(id)).unwrap();
          toast.success("Marked as read");
        }
      } catch (err) {
        console.error("❌ Error marking as read:", err);
        toast.error("Failed to mark as read");
      }
    },
    [isConnected, markAsReadSocket, dispatch]
  );

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setVisible(false);
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible]);

  // Initial fetch on mount
  useEffect(() => {
    console.log("🚀 Component mounted - Fetching all notifications...");
    fetchAllNotifications();
  }, [fetchAllNotifications]);

  // Fetch from socket if connected, otherwise use API
  useEffect(() => {
    if (isConnected && userId) {
      console.log("🔌 Socket connected - Requesting notification history...");
      requestNotificationHistory(100);
    } else if (!isConnected) {
      console.log("📡 Socket not connected - Using API fallback...");
      fetchAllNotifications();
    }
  }, [isConnected, userId, requestNotificationHistory, fetchAllNotifications]);

  // Auto-refresh when popup is opened and not using socket
  useEffect(() => {
    if (visible && !isConnected) {
      console.log("🔄 Popup opened (API mode) - Refreshing notifications...");
      fetchAllNotifications();
    }
  }, [visible, isConnected, fetchAllNotifications]);

  // Show toast for new notifications
  const prevCountRef = useRef(notifications.length);
  useEffect(() => {
    if (notifications.length > prevCountRef.current && isConnected) {
      const latest = notifications[0];
      if (latest && !latest.isRead) {
        console.log("🔔 New notification received:", latest.title);
        toast.success(latest.title || "New notification", {
          icon: "🔔",
          duration: 4000,
        });
      }
    }
    prevCountRef.current = notifications.length;
  }, [notifications, isConnected]);

  // Update document title with unread count
  useEffect(() => {
    const base = "Dashboard";
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${base}`;
    } else {
      document.title = base;
    }
  }, [unreadCount]);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    console.log("🔄 Manual refresh triggered");
    setIsRefreshing(true);

    try {
      await dispatch(getAllNotifications()).unwrap();
      console.log("✅ Manual refresh successful");
      toast.success("Notifications refreshed!", { icon: "✅" });
    } catch (err) {
      console.error("❌ Refresh error:", err);
      toast.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={togglePopup}
        className="relative text-white focus:outline-none w-10 h-10 flex items-center justify-center rounded-full bg-[#282e3c61] hover:bg-[#282e3c] cursor-pointer transition-all duration-200"
        aria-label="Notifications"
        title={`Notifications ${isConnected ? "(Real-time)" : "(API)"}`}
      >
        <Bell size={20} className={unreadCount > 0 ? "" : ""} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        <div className="absolute -bottom-1 -right-1">
          {isConnected ? (
            <Wifi
              size={12}
              className="text-green-400 drop-shadow-lg"
              title="Real-time connected"
            />
          ) : (
            <WifiOff
              size={12}
              className="text-orange-400"
              title="Using API fallback"
            />
          )}
        </div>
      </button>

      {/* Popup */}
      {visible && (
        <div
          ref={popupRef}
          className="rounded-xl border border-[#2e3135] bg-[#111113]/95 backdrop-blur-sm fixed top-[60px] right-5 w-[420px] max-h-[550px] overflow-hidden shadow-2xl z-50 animate-fadeIn"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-[#2e3135] bg-[#1a1a1c] sticky top-0 z-10">
            <div className="font-semibold text-white flex items-center gap-2">
              <Inbox size={18} />
              <span>All Notifications</span>

              {/* Status Badges */}
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  isConnected
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                }`}
              >
                {isConnected ? "🟢 Live" : "🟠 API"}
              </span>

              {(userRole === "admin" || userRole === "Admin") && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full border border-purple-500/30">
                  👑 Admin
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {(userRole === "admin" || userRole === "Super-Admin") && (
                <button
                  onClick={() => setShowSendForm(true)}
                  className="text-green-400 hover:text-green-300 transition p-1.5 rounded-lg hover:bg-green-500/10"
                  title="Send notification"
                >
                  <Send size={16} />
                </button>
              )}

              <button
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
                className={`text-blue-400 hover:text-blue-300 transition p-1.5 rounded-lg hover:bg-blue-500/10 ${
                  isRefreshing || loading ? "animate-spin" : ""
                }`}
                title="Refresh notifications"
              >
                <RefreshCw size={16} />
              </button>

              <button
                onClick={() => setVisible(false)}
                className="text-gray-400 hover:text-gray-200 transition p-1.5 rounded-lg hover:bg-gray-500/10"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[430px] overflow-y-auto divide-y divide-[#2e3135] custom-scrollbar">
            {loading ? (
              <div className="p-8 text-gray-400 text-center">
                <div className="animate-pulse flex flex-col items-center gap-3">
                  <RefreshCw size={32} className="animate-spin text-blue-400" />
                  <p>Loading all notifications...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-400 mb-3 text-lg">❌ Error</div>
                <div className="text-gray-400 mb-4">{error}</div>
                <button
                  onClick={handleRefresh}
                  className="text-sm text-blue-400 hover:text-blue-300 px-4 py-2 rounded-lg border border-blue-400/30 hover:border-blue-400 hover:bg-blue-500/10 transition"
                >
                  Try Again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-gray-400 text-center">
                <Inbox size={64} className="mx-auto mb-3 opacity-30" />
                <div className="text-lg mb-2">No notifications yet</div>
                <p className="text-sm text-gray-500 mb-4">
                  You're all caught up! 🎉
                </p>
                <button
                  onClick={handleRefresh}
                  className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 rounded border border-blue-400/30 hover:border-blue-400"
                >
                  Refresh
                </button>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={notif._id || index}
                  className={`px-4 py-3 transition-all duration-200 ${
                    notif.isRead
                      ? "bg-transparent hover:bg-[#1b1b1f]"
                      : "bg-[#1b1b1f] hover:bg-[#232329] border-l-3 border-blue-500"
                  }`}
                >
                  <div className="flex justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title with unread indicator */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                          {notif.title}
                          {!notif.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          )}
                        </h4>
                      </div>

                      {/* Nature/Category */}
                      {notif.nature && (
                        <p className="text-blue-400 text-xs mb-1 uppercase tracking-wider font-medium">
                          📌 {notif.nature}
                        </p>
                      )}

                      {/* Message */}
                      <p className="text-gray-300 text-sm mt-1 break-words leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Sender */}
                      {notif.sender?.name && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <span>👤</span>
                          <span>From: {notif.sender.name}</span>
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                        <span>
                          🕒 {new Date(notif.createdAt).toLocaleString()}
                        </span>
                        {notif.type && (
                          <>
                            <span>•</span>
                            <span className="text-gray-500">{notif.type}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Mark as Read Button */}
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="flex-shrink-0 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-all border border-blue-400/20 hover:border-blue-400"
                        title="Mark as read"
                      >
                        ✓ Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[#2e3135] bg-[#1a1a1c] text-xs flex justify-between items-center sticky bottom-0">
            <div className="flex items-center gap-3">
              <span className="text-gray-400">
                Total:{" "}
                <span className="text-white font-semibold">
                  {notifications.length}
                </span>
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">
                Unread:{" "}
                <span className="text-blue-400 font-semibold">
                  {unreadCount}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              {isConnected ? "🟢 Real-time" : "🟠 API Mode"}
            </div>
          </div>
        </div>
      )}

      {/* Send Form Modal */}
      {showSendForm && (
        <NotificationSendForm
          onClose={() => setShowSendForm(false)}
          currentUserId={userId}
        />
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1c;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2e3135;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3e4145;
        }
      `}</style>
    </div>
  );
};

export default NotificationPopup;
