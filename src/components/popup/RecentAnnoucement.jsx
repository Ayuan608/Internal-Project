import React, { useState, useRef, useEffect } from "react";
import { Megaphone } from "lucide-react";

function RecentAnnoucement() {
    const [visible, setVisible] = useState(false);
    const popupRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative">
            <div
                onClick={() => setVisible(!visible)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[#282e3c61] cursor-pointer hover:bg-[#3a3f4f]"
            >
                <Megaphone className="text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
            </div>

            {visible && (
                <div
                    ref={popupRef}
                    className="rounded-xl border border-[#2e3135] bg-[#111113]/95 backdrop-blur-sm fixed top-[60px] right-5 w-[420px] max-h-[550px] overflow-hidden shadow-2xl z-50 animate-fade p-4 text-white"
                >
                    <h3 className="text-lg font-semibold mb-2">Recent Announcements</h3>
                    <div className="space-y-4  py-4  text-sm text-gray-300 border-t border-gray-500 w-full">
                        <p>📢 New feature released: Notification Center added!</p>
                        <p>🛠️ Server maintenance scheduled for tomorrow.</p>
                        <p>🎉 Welcome to our latest update!</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RecentAnnoucement;
