import React, { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import Switch from "@mui/material/Switch";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  getUserAttendance,
  punchIn,
  punchOut,
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
      switch (key) {
        case "work":
          if (!toggles.work) {
            // Punch In
            await dispatch(punchIn({ userId, shift: "day" })).unwrap();
            toast.success("Punched In successfully!");
          } else {
            // Note: Work toggle off should be handled by "off" toggle
            toast.info("Use 'Off Work' to punch out");
            setLoading((prev) => ({ ...prev, [key]: false }));
            return;
          }
          break;

        case "break":
          if (!toggles.break) {
            // Start Break
            await dispatch(punchIn({ userId, shift: "break" })).unwrap();
            toast.success("Break started!");
          } else {
            // End Break
            await dispatch(punchOut(userId)).unwrap();
            toast.success("Break ended!");
          }
          break;

        case "wc":
          if (!toggles.wc) {
            // Start WC
            await dispatch(punchIn({ userId, shift: "wc" })).unwrap();
            toast.success("WC break started!");
          } else {
            // End WC
            await dispatch(punchOut(userId)).unwrap();
            toast.success("WC break ended!");
          }
          break;

        case "smoke":
          if (!toggles.smoke) {
            // Start Smoke
            await dispatch(punchIn({ userId, shift: "smoke" })).unwrap();
            toast.success("Smoke break started!");
          } else {
            // End Smoke
            await dispatch(punchOut(userId)).unwrap();
            toast.success("Smoke break ended!");
          }
          break;

        case "off":
          // Punch Out
          await dispatch(punchOut(userId)).unwrap();
          toast.success("Punched Out successfully!");
          setToggles({
            work: false,
            break: false,
            wc: false,
            smoke: false,
            off: true,
          });
          break;

        default:
          break;
      }

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
        ${
          visible
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
