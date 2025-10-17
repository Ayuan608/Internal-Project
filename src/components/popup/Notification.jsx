import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Inbox, X, Bell, Wifi, WifiOff, Send } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  markNotificationAsRead,
  fetchUserNotifications,
  getAllNotifications,
} from "../../redux/NotificationSlice";
import toast from "react-hot-toast";
import useSocket from "../../hooks/useSocket";
import NotificationSendForm from "../NotificationSendForm";

const NotificationPopup = () => {
  const [visible, setVisible] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const popupRef = useRef(null);
  const dispatch = useDispatch();

  // Memoize selectors to prevent unnecessary renders
  const { notifications, unreadCount, loading, error } = useSelector(
    (state) => state?.notifications
  );

  const userId = useSelector((state) => state.auth?.data?._id);
  const userRole = useSelector((state) => state.auth?.role);

  // Debug fetch results
  useEffect(() => {
  
    console.log("User ID:", userId);
    console.log("User Role:", userRole);
    console.log("Notifications:", notifications);
    console.log("Unread Count:", unreadCount);
    console.log("Loading:", loading);
    console.log("Error:", error);
    console.log("Total notifications:", notifications?.length);
   
  }, [notifications, unreadCount, loading, error, userId, userRole]);

  const socketConfig = useMemo(
    () => ({
      autoConnect: true,
      enableNotifications: true,
      onConnectionChange: (status) => {
        // Connection status handled automatically
      },
    }),
    []
  );

  const {
    connectionStatus,
    isConnected,
    markNotificationAsRead: markAsReadSocket,
    requestNotificationHistory,
    fetchNotificationsFallback,
    error: socketError,
  } = useSocket(userId, socketConfig);

  // Toggle popup - MEMOIZED
  const togglePopup = useCallback(() => {
    if (!visible) {
      // Fetch notifications when opening popup
      if (userRole === "admin" || userRole === "Admin") {
        console.log("🔄 Fetching ALL notifications for admin...");
        dispatch(getAllNotifications());
      } else if (userId) {
        console.log("🔄 Fetching USER notifications...");
        dispatch(fetchUserNotifications(userId));
      } else {
        console.log("🔄 No user ID, fetching ALL notifications...");
        dispatch(getAllNotifications());
      }
    }
    setVisible((prev) => !prev);
  }, [visible, userId, userRole, dispatch]);

  // Mark as read - MEMOIZED
  const handleMarkAsRead = useCallback(
    async (id) => {
      try {
        if (isConnected) {
          markAsReadSocket(id);
          toast.success("Marked as read");
        } else {
          await dispatch(markNotificationAsRead(id)).unwrap();
          toast.success("Marked as read");
        }
      } catch (err) {
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

  // Fetch notifications on mount/connection change
  useEffect(() => {
    if (!userId) {
      console.log(
        "🔄 No user ID found, fetching ALL notifications on mount..."
      );
      dispatch(getAllNotifications());
      return;
    }

    if (isConnected) {
      requestNotificationHistory(50);
    } else if (userRole === "admin" || userRole === "Admin") {
      console.log("🔄 Admin user, fetching ALL notifications...");
      dispatch(getAllNotifications());
    } else {
      dispatch(fetchUserNotifications(userId));
    }
  }, [userId, isConnected, userRole, requestNotificationHistory, dispatch]);

  // Also refresh when popup is opened if using API (not socket)
  useEffect(() => {
    if (visible && !isConnected) {
      if (userRole === "admin" || userRole === "Admin") {
        console.log("🔄 Refreshing ALL notifications for admin...");
        dispatch(getAllNotifications());
      } else if (userId) {
        dispatch(fetchUserNotifications(userId));
      } else {
        dispatch(getAllNotifications());
      }
    }
  }, [visible, userId, isConnected, userRole, dispatch]);

  // Show toast on incoming real-time notifications
  const prevCountRef = useRef(notifications.length);
  useEffect(() => {
    if (notifications.length > prevCountRef.current && isConnected) {
      const latest = notifications[0];
      if (latest) {
        toast.success(latest.title || "New notification");
      }
    }
    prevCountRef.current = notifications.length;
  }, [notifications, isConnected]);

  // Update document title with unread count for better visibility/SEO
  useEffect(() => {
    const base = "Dashboard";
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${base}`;
    } else {
      document.title = base;
    }
  }, [unreadCount]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    if (userRole === "admin" || userRole === "Admin") {
      console.log("🔄 Manual refresh: Fetching ALL notifications...");
      dispatch(getAllNotifications());
    } else if (userId) {
      console.log("🔄 Manual refresh: Fetching user notifications...");
      dispatch(fetchUserNotifications(userId));
    } else {
      console.log("🔄 Manual refresh: Fetching ALL notifications...");
      dispatch(getAllNotifications());
    }
    toast.success("Refreshing notifications...");
  }, [userId, userRole, dispatch]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={togglePopup}
        className="relative text-white focus:outline-none w-10 h-10 flex items-center justify-center rounded-full bg-[#282e3c61] cursor-pointer"
        aria-label="Notifications"
        title={`Notifications ${isConnected ? "(Real-time)" : "(API)"}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        {/* Connection Status Indicator */}
        <div className="absolute -bottom-1 -right-1">
          {isConnected ? (
            <Wifi
              size={12}
              className="text-green-400"
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
          className="rounded-xl border border-[#2e3135] bg-[#111113]/95 fixed top-[60px] right-5 w-[380px] max-h-[400px] overflow-y-auto shadow-2xl z-50 animate-fadeIn"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-[#2e3135]">
            <div className="font-semibold text-white flex items-center gap-2">
              <Inbox size={18} /> Notifications
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isConnected
                    ? "bg-green-500/20 text-green-400"
                    : "bg-orange-500/20 text-orange-400"
                }`}
              >
                {isConnected ? "Live" : "API"}
              </span>
              {(userRole === "admin" || userRole === "Admin") && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSendForm(true)}
                className="text-xs text-green-400 hover:text-green-300 px-2 py-1 rounded"
                title="Send notification"
              >
                <Send size={16} />
              </button>
              <button
                onClick={handleRefresh}
                className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded"
                title="Refresh notifications"
              >
                ↻
              </button>
              <button
                onClick={() => setVisible(false)}
                className="text-gray-400 hover:text-gray-200 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="divide-y divide-[#2e3135]">
            {loading ? (
              <div className="p-4 text-gray-400 text-center">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="p-4 text-red-400 text-center">
                Error: {error}
                <button
                  onClick={handleRefresh}
                  className="block mx-auto mt-2 text-xs text-blue-400 hover:text-blue-300"
                >
                  Try Again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-gray-400 text-center">
                No notifications found
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`px-4 py-3 transition ${
                    notif.isRead
                      ? "bg-transparent hover:bg-[#1b1b1f]"
                      : "bg-[#1b1b1f] hover:bg-[#232329]"
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{notif.title}</h4>
                      {notif.nature && (
                        <p className="text-gray-400 text-xs">{notif.nature}</p>
                      )}
                      <p className="text-gray-300 text-sm mt-1">
                        {notif.message}
                      </p>
                      {notif.sender?.name && (
                        <p className="text-xs text-gray-500 mt-1">
                          From: {notif.sender.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                      {/* Debug info */}
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {notif._id?.substring(0, 8)}... | Read:{" "}
                        {notif.isRead ? "Yes" : "No"} | Type:{" "}
                        {notif.type || "default"}
                      </p>
                    </div>

                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="text-xs text-blue-400 hover:text-blue-300 ml-2 self-start"
                      >
                        ✓ Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with debug info */}
          <div className="px-4 py-2 border-t border-[#2e3135] text-xs text-gray-500">
            Total: {notifications.length} | Unread: {unreadCount} | Mode:{" "}
            {userRole === "admin" || userRole === "Admin" ? "All" : "User"} |
            Source: {isConnected ? "Socket" : "API"}
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
    </div>
  );
};

export default NotificationPopup;
