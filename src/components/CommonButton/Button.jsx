import React, { useState, useRef, useEffect } from "react";
import { Upload, CalendarClock, ChevronDown } from "lucide-react";
import PunchIn from "../popup/PunchIn";
import CustomDatePicker from "./CustomCalendar";

export const Button = ({ label, Icon, onClick, iconSize = "w-4 h-4" }) => (
  <div
    className="bg-[#10101B] px-4 py-2 rounded-[36px] flex items-center justify-center gap-3 cursor-pointer hover:bg-[#1a1a28] transition"
    onClick={onClick}
  >
    <div className="text-white text-sm whitespace-nowrap">{label}</div>
    {Icon && <Icon className={iconSize} />}
  </div>
);

export const ButtonGroup = () => {
  const [punchVisible, setPunchVisible] = useState(false);

  const punchRef = useRef(null);
  const leaveRef = useRef(null);

  const togglePunch = () => setPunchVisible((prev) => !prev);

  // 🧠 Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (punchRef.current && !punchRef.current.contains(event.target)) {
        setPunchVisible(false);
      }

    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🚫 Disable body scroll when any popup is visible
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [punchVisible]);

  return (
    <div className="relative">
      <div className="flex gap-4 items-center flex-wrap">

        <Button
          label={"Punch-In/Out"}
          Icon={ChevronDown}
          onClick={togglePunch}
        />
        <div>
          <CustomDatePicker />
        </div>
      </div>

      {/* Overlay */}
      {(punchVisible) && (
        <div className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300" />
      )}

      {/* Punch In Popup */}
      <div
        ref={punchRef}
        className={`transition-all duration-300 absolute right-0 -top-50 z-50 ${punchVisible
          ? "opacity-100 translate-y-[100px] scale-100"
          : "opacity-0 pointer-events-none scale-95"
          }`}
      >
        <PunchIn visible={punchVisible} />
      </div>


    </div>
  );
};
