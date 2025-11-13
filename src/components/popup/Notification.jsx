import { Bell, CheckCircle2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markNotificationAsRead,
  clearNotifications,
} from "../../redux/NotificationSlice";

const NotificationPopup = ({ userId }) => {
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading, error } = useSelector(
    (state) => state.notifications
  );

  const popupRef = useRef();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (userId && !hasFetchedRef.current) {
      console.log("Fetching notifications for user:", userId);
      dispatch(fetchNotifications(userId));
      hasFetchedRef.current = true;
    }
  }, [dispatch, userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) {
        console.log("Auto-refreshing notifications...");
        dispatch(fetchNotifications(userId));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch, userId]);

  return (
    <div className="relative" ref={popupRef}>
      <motion.div
        onClick={() => setVisible((prev) => !prev)}
        whileTap={{ scale: 0.9 }}
        className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[#282e3c61] cursor-pointer hover:bg-[#3a3f4f] transition"
      >
        <Bell className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500"></span>
        )}
      </motion.div>

      <AnimatePresence>
        {visible && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="rounded-xl border border-[#2e3135] bg-[#111113]/95 backdrop-blur-md fixed top-[65px] right-5 w-[380px] max-h-[500px] overflow-y-auto shadow-2xl z-50 p-4 text-white custom-scrollbar"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <button
                onClick={() => dispatch(clearNotifications())}
                className="text-sm text-gray-400 hover:text-red-400 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {loading ? (
              <p className="text-gray-400 text-center py-4">Loading...</p>
            ) : notifications.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 text-center py-4"
              >
                No notifications yet 
              </motion.p>
            ) : (
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                {notifications.map((n) => (
                  <motion.li
                    key={n._id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg border ${
                      n.isRead
                        ? " border-[#25272b]"
                        : "bg-[#282e3c1d] border-slate-800/30"
                    } transition flex justify-between items-start`}
                  >
                    <div>
                      <p className="font-medium text-white text-sm">
                        {n.title}
                      </p>
                      <p className="text-gray-400 text-sm">{n.body}</p>
                      {n.details && (
                        <p className="text-gray-400 text-xs italic mt-1 line-clamp-2 leading-snug">
                          {n.details}
                        </p>
                      )}
                      <small className="text-gray-500 text-[11px] block mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </small>
                    </div>

                    {!n.isRead && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          dispatch(markNotificationAsRead(n._id))
                        }
                        className="text-blue-400 hover:text-blue-500 ml-3"
                      >
                        <CheckCircle2 size={18} />
                      </motion.button>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPopup;