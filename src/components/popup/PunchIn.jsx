import React, { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import Switch from "@mui/material/Switch";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  getUserAttendance,
} from "../../redux/attendenceSlice";

const PunchIn = ({ popupRef, visible }) => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state?.auth?.data?._id);
  const todayAttendance = useSelector(
    (state) => state.attendance?.todayAttendance
  );
  const [loading, setLoading] = useState({
    work: false,
    break: false,
    wc: false,
    smoke: false,
    off: false,
  });
  const [toggles, setToggles] = useState({
    work: false,
    break: false,
    wc: false,
    smoke: false,
    off: false,
  });

  useEffect(() => {
    if (todayAttendance) {
      setToggles({
        work: !!todayAttendance.punchIn && !todayAttendance.punchOut,
        off: !!todayAttendance.punchOut,
      });
    }
  }, [todayAttendance]);

  const handleToggle = async (key) => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    setLoading((prev) => ({ ...prev, [key]: true }));

    try {

      // Refresh attendance data
      await dispatch(
        getUserAttendance({
          userId,
          page: 1,
          limit: 10,
        })
      );

      setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    } catch (error) {
      toast.error(error?.message || "Action failed");
      console.error("Punch action error:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div
      ref={popupRef}
      className={`
        rounded-[10px] border bg-[#15161a] border-[#2e3135] fixed min-w-[300px] pb-6 -translate-x-20
        z-50 right-5 mt-2 
        border-b border-b-[#43484e]
        transition-all duration-500 ease-in-out
        ${visible
          ? "translate-y-[88px] opacity-100"
          : "translate-y-[0px] opacity-0 pointer-events-none"
        }
      `}
      style={{ top: "50px" }}
    >
      <div className="flex justify-between items-center px-4 border-b border-b-[#2e3135]">
        <div className="font-semibold text-white mb-2 py-3">Punch-In/Out</div>
        <Inbox />
      </div>

      <div className="text-sm text-[#cbd5e1] px-4 mt-3 space-y-2">
        {[
          ["work", "Punch/In"],
          ["off", "Punch/Out"],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center justify-between w-full">
            <p className="text-lg font-semibold">{label}</p>
            <Switch
              checked={toggles[key]}
              onChange={() => handleToggle(key)}
              disabled={loading[key]}
              color="success"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PunchIn;
