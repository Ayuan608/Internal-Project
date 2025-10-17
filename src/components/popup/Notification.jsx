import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Inbox, X, Bell, Wifi, WifiOff, Send } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  markNotificationAsRead,
  fetchUserNotifications,
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
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state?.notifications
  );


console.log(notifications)

  const userId = useSelector((state) => state.auth?.data?._id);

  // Initialize socket connection - MEMOIZED
  const socketConfig = useMemo(() => ({
    autoConnect: true,
    enableNotifications: true,
    onConnectionChange: (status) => {
      // Connection status handled automatically
    },
  }), []);

  const {
    connectionStatus,
    isConnected,
    markNotificationAsRead: markAsReadSocket,
    fetchNotificationsFallback,
    error: socketError,
  } = useSocket(userId, socketConfig);

  // Remove excessive debug logs

  // Toggle popup - MEMOIZED
  const togglePopup = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  // Mark as read - MEMOIZED
  const handleMarkAsRead = useCallback(async (id) => {
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
  }, [isConnected, markAsReadSocket, dispatch]);

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

  // Remove duplicate handleMarkAsRead function

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
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSendForm(true)}
                className="text-xs text-green-400 hover:text-green-300 px-2 py-1 rounded"
                title="Send notification"
              >
                <Send size={16} />
              </button>
              {!isConnected && userId && (
                <button
                  onClick={() => dispatch(fetchUserNotifications(userId))}
                  className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded"
                  title="Refresh notifications"
                >
                  ↻
                </button>
              )}
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
              <div className="p-4 text-gray-400 text-center">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-gray-400 text-center">
                No notifications
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
                    </div>

                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="text-xs text-blue-400 hover:text-blue-300 ml-2"
                      >
                        ✓ Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
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
