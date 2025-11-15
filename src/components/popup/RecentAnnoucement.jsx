import React, { useState, useRef, useEffect } from "react";
import { Megaphone } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllAnnouncements } from "../../redux/announcementSlice";

function RecentAnnouncement() {
    const [visible, setVisible] = useState(false);
    const popupRef = useRef(null);

    const dispatch = useDispatch();

    // Fetch raw announcements from Redux
    const announcementsData = useSelector(
        (state) => state.announcements.announcements || []
    );

    // Convert DB format → Popup display format
    const formattedAnnouncements = announcementsData.map((a) => ({
        _id: a._id,
        message: a.title || "No Title",
        date: new Date(a.createdAt).toLocaleDateString(),
        icon: "📢",
        isUnread: false, // You can modify with your logic
    }));

    const hasUnread = formattedAnnouncements.some((a) => a.isUnread);

    useEffect(() => {
        dispatch(fetchAllAnnouncements());
    }, [dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative">
            {/* Button */}
            <div
                onClick={() => setVisible(!visible)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[#282e3c61] cursor-pointer hover:bg-[#3a3f4f] transition"
            >
                <Megaphone className="text-white" />

                {hasUnread && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
            </div>

            {/* Popup */}
            <AnimatePresence>
                {visible && (
                    <motion.div
                        ref={popupRef}
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl border border-[#2e3135] bg-[#111113]/95 backdrop-blur-md fixed top-[60px] right-5 
                                   w-[420px] max-h-[550px] shadow-2xl z-50 p-4 overflow-hidden"
                    >
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Recent Announcements
                        </h3>

                        <div className="border-t border-gray-600 mt-2 pt-3 space-y-3 max-h-[450px] overflow-y-auto pr-2">
                            {formattedAnnouncements.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-4">
                                    No announcements available.
                                </p>
                            ) : (
                                formattedAnnouncements.map((item, index) => (
                                    <motion.div
                                        key={item._id || index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="flex items-start gap-3 p-2 bg-[#1a1c22] rounded-lg hover:bg-[#22242c] transition"
                                    >
                                        <div className="text-xl">
                                            {item.icon}
                                        </div>

                                        <div>
                                            <p className="text-gray-200">{item.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {item.date}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default RecentAnnouncement;
