// src/components/popup/NotificationPopup.jsx
import { Bell } from "lucide-react";
import { useState } from "react";


function NotificationPopup() {
  const [visible, setVisible] = useState(false);


  return (
    <div
      onClick={() => setVisible(!visible)}
      className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[#282e3c61] cursor-pointer hover:bg-[#3a3f4f] transition"
    >
      <Bell className="text-white" />
      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>

      {visible && (
        <div className="rounded-xl border border-[#2e3135] bg-[#111113]/95 backdrop-blur-sm fixed top-[60px] right-5 w-[380px] max-h-[500px] overflow-y-auto shadow-2xl z-50 p-4 text-white custom-scrollbar">
          <h3 className="text-lg font-semibold mb-3 text-white">Notifications</h3>
          {/* Map notifications from Redux here later */}
        </div>
      )}
    </div>
  );
}

export default NotificationPopup;
