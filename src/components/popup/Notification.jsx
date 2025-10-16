import { useEffect, useRef, useState } from "react";
import { Inbox } from "lucide-react";

const NotificationPopup = () => {
  const [visible, setVisible] = useState(true);
  const popupRef = useRef(null);

  // Close popup if clicked outside
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

  if (!visible) return null; // Don't render if not visible

  return (
    <div
      ref={popupRef}
      className={`
        rounded-[10px] border bg-[#111113] border-[#2e3135] fixed min-w-[380px] h-[165px] top-0
        z-50 right-5 mt-2 
        border-b border-b-[#43484e]
        transition-all duration-500 ease-in-out
        ${
          visible
            ? "translate-y-[50px] opacity-100"
            : "translate-y-[0px] opacity-0"
        }
      `}
    >
      <div className="flex justify-between items-center px-4 border-b border-b-[#2e3135]">
        <div className="font-semibold text-white mb-2 py-3">Notification</div>
        <Inbox />
      </div>
      <div className="text-sm text-[#cbd5e1] px-4 flex items-center justify-between mt-3">
        <p>New Notification</p>
        <div className="text-xs text-right text-gray-500">
          {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
