import { useEffect, useRef, useState } from "react";
import { Inbox, X, Bell } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  markNotificationAsRead,
  fetchUserNotifications,
} from "../../redux/NotificationSlice";
import toast from "react-hot-toast";

const NotificationPopup = () => {
  const [visible, setVisible] = useState(false);
  const popupRef = useRef(null);
  const dispatch = useDispatch();

  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notifications
  );



  // Get user ID from auth state
  const userId = useSelector((state) => state.auth?.data?._id);

  console.log("Notifications:", notifications);
  console.log("User ID:", userId);

  // Toggle popup and fetch notifications when opening
  const togglePopup = () => {
    if (!visible && userId) {
      // Fetch notifications when opening popup
      dispatch(fetchUserNotifications(userId));
    }
    setVisible((prev) => !prev);
  };

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

  // Mark notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await dispatch(markNotificationAsRead(id)).unwrap();
      toast.success("Marked as read");
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={togglePopup}
        className="relative text-white focus:outline-none w-10 h-10 flex items-center justify-center rounded-full bg-[#282e3c61] cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
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
            </div>
            <button
              onClick={() => setVisible(false)}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              <X size={18} />
            </button>
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
    </div>
  );
};

export default NotificationPopup;
