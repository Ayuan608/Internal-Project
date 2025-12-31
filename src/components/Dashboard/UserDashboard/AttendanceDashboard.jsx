// src/components/AttendanceDashboard.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Coffee,
  Droplets,
  Utensils,
  AlertTriangle,
  CalendarPlus,
  Clock4,
  Home as HomeIcon,
  RefreshCw,
  Clock,
  User,
  LogOut,
  LogIn,
  X // Add this import
} from "lucide-react";
import {
  punchIn,
  punchOut,
  getUserAttendance,
  getTodayAttendance,
  startBreak,
  endBreak,
  getTodayBreaks,
} from "../../../redux/attendenceSlice";
import ShowOffDay from "../../popup/ShowOffDay";
import AttendanceAnnouncementPopup from "../../popup/AttendanceAnnouncementPopup";
import CustomDatePicker from "../../CommonButton/CustomCalendar";
import { toast } from "react-hot-toast";
import { reportWfhIssue } from "../../../redux/attendenceSlice";
import AttendancePunchReminder from "../../popup/AttendancePunchReminder";

// Stats card component
const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-slate-900/70 border border-slate-700/60",
    green: "bg-slate-900/70 border border-emerald-500/30",
    orange: "bg-slate-900/70 border border-amber-500/30",
    purple: "bg-slate-900/70 border border-purple-500/30",
  };
  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`rounded-2xl backdrop-blur-xl p-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)] ${selectedColor}`}>
      {Icon && <Icon className="mb-2 text-slate-400" size={20} />}
      <p className="text-xs text-slate-400 uppercase tracking-wide">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-50">{value}</p>
      {subtitle && <p className="mt-3 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};

const AttendanceDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.data);

  const userId = user?._id;


  // Redux state
  const reduxAttendanceList = useSelector((state) => state.attendance?.attendanceList) || [];
  const todayAttendance = useSelector((state) => state.attendance?.todayAttendance);
  const todayBreaks = useSelector((state) => state.attendance?.todayBreaks);
  const isLoading = useSelector((state) => state.attendance?.isLoading);
  const breaksLoading = useSelector((state) => state.attendance?.breaksLoading);

  // Local state
  // const [currentTime, setCurrentTime] = useState(new Date());


  const [showPunchOutModal, setShowPunchOutModal] = useState(false);
  const [showWFHModal, setShowWFHModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showDayOffModal, setShowDayOffModal] = useState(false);
  const [hiddenTimerType, setHiddenTimerType] = useState(null)
  const [showAbsentModal, setShowAbsentModal] = useState(false);



  const [dayOffForm, setDayOffForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    type: "",
    duration: "single",
  });
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [breakCounts, setBreakCounts] = useState({
    smoke: 0,
    wc: 0,
    lunch: 0
  });
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [breakModal, setBreakModal] = useState({
    open: false,
    type: "",
    breaks: [],
    date: null
  });

  const openBreakDetails = (type, breaks, date) => {
    setBreakModal({
      open: true,
      type,
      breaks: breaks || [],
      date
    });
  };


  const PH_TIMEZONE = "Asia/Manila";

  // Get today's date in Philippines timezone (YYYY-MM-DD)
  const getTodayPHDate = () => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: PH_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  };

  const getPHNow = () => {
    return new Date(
      new Intl.DateTimeFormat("en-US", {
        timeZone: PH_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date())
    );
  };

  // Format time in Philippines timezone
  const formatTimePH = (timeString) => {
    if (!timeString) return "-";
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleTimeString("en-PH", {
      timeZone: PH_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date in Philippines timezone (DD/MM/YYYY)
  const formatDatePH = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-GB", {
      timeZone: PH_TIMEZONE,
    });
  };

  // Update live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if user is online (has punched in but not out)
  const isOnline = todayAttendance?.clockIn && !todayAttendance?.clockOut;
  const canPunchIn = !todayAttendance?.clockIn;
  const canPunchOut = todayAttendance?.clockIn && !todayAttendance?.clockOut;

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "-";
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return "-";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'N/A';
    }
  };

  // Calculate break duration
  const calculateBreakDuration = (start, end) => {
    if (!start || !end) return "0m";
    try {
      const startTime = new Date(start);
      const endTime = new Date(end);
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return "0m";
      const diffMinutes = Math.round((endTime - startTime) / (1000 * 60));
      return `${diffMinutes}m`;
    } catch {
      return "0m";
    }
  };

  // Format break timer
  const formatBreakTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load initial data - FIXED: बार-बार नहीं चलेगा
  useEffect(() => {
    const loadData = async () => {
      if (userId && !dataLoaded) {
        try {

          // Load today's attendance
          const todayResult = await dispatch(getTodayAttendance(userId)).unwrap();
          console.log("todayResult", todayResult.attendance.actualWorkingHours)
          const actualWorkingHours = todayResult.attendance.actualWorkingHours

          // Load attendance history
          const historyResult = await dispatch(getUserAttendance({
            userId,
            page: 1,
            limit: 10
          })).unwrap();


          // Load today's breaks
          const breaksResult = await dispatch(getTodayBreaks(userId)).unwrap();

          setDataLoaded(true);

        } catch (error) {
          console.error("❌ Failed to load data:", error);
        }
      }
    };

    loadData();
  }, [dispatch, userId, dataLoaded]);

  // Update break counts from today's attendance - FIXED
  useEffect(() => {
    if (todayAttendance) {
      const smokeBreaks = todayAttendance.smokeBreaks || [];
      const wcBreaks = todayAttendance.wcBreaks || [];
      const lunchBreaks = todayAttendance.lunchBreaks || [];

      const counts = {
        smoke: smokeBreaks.filter(b => b && b.end).length || 0,
        wc: wcBreaks.filter(b => b && b.end).length || 0,
        lunch: lunchBreaks.filter(b => b && b.end).length || 0,
      };

      setBreakCounts(counts);
    } else {
      setBreakCounts({ smoke: 0, wc: 0, lunch: 0 });
    }
  }, [todayAttendance]);

  // Check for active breaks and start timer - FIXED
  // Update break counts from today's attendance - FIXED
  useEffect(() => {
    if (!todayAttendance) {
      setActiveTimer(null);
      setShowBreakModal(false);
      return;
    }

    const findActiveBreak = (type) => {
      const arr = todayAttendance[`${type}Breaks`] || [];
      const active = arr.find(b => b && !b.end);
      return active
        ? { type, startTime: new Date(active.start) }
        : null;
    };

    const active =
      findActiveBreak("smoke") ||
      findActiveBreak("wc") ||
      findActiveBreak("lunch");

    if (active) {
      setActiveTimer(active);
      setShowBreakModal(true);
    } else {
      setActiveTimer(null);
      setShowBreakModal(false);
    }
  }, [todayAttendance]);

  const getPhilippinesTime = () =>
    new Date(
      new Intl.DateTimeFormat("en-US", {
        timeZone: PH_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date())
    );



  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getPhilippinesTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (activeTimer) {
      const breakLimit =
        activeTimer.type === "lunch" ? 30 * 60 : 5 * 60;

      const startTime = new Date(activeTimer.startTime).getTime();
      const currentTime = Date.now();

      const elapsedSeconds = Math.floor(
        (currentTime - startTime) / 1000
      );

      const remainingSeconds = Math.max(
        0,
        breakLimit - elapsedSeconds
      );

      setTimeLeft(remainingSeconds);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeTimer]);

  const [currentTime, setCurrentTime] = useState(getPhilippinesTime());
  // Handle Punch In
  const MISSED_MESSAGES = [
    "You have already missed punch-in for today.",
    "Punch-in after working hours is not allowed. You are marked absent."
  ];

  const MISSED_CODES = [
    "MISSED_PUNCH_IN",
    "PUNCH_AFTER_SHIFT"
  ];
  const handlePunchIn = async () => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    try {
      const result = await dispatch(
        punchIn({ userId, shift: "Day" })
      ).unwrap();

      // ⚠️ Show modal for ANY non-normal case
      if (
        result?.alert === "Late" ||
        result?.alert === "AfterShift" ||
        result?.alert === "Absent"
      ) {
        setShowAbsentModal(true);
      }

      toast.success("Punched in successfully!");

      await Promise.all([
        dispatch(getTodayAttendance(userId)),
        dispatch(getUserAttendance({ userId, page: 1, limit: 10 })),
        dispatch(getTodayBreaks(userId)),
      ]);

    } catch (error) {
      toast.error("Punch in failed");
    }
  };




  // Handle Punch Out
  const handlePunchOut = async () => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    try {
      const result = await dispatch(punchOut(userId)).unwrap();

      setShowPunchOutModal(false);
      toast.success("Punched out successfully!");

      // Refresh data - FIXED: timeout remove kiya
      await Promise.all([
        dispatch(getTodayAttendance(userId)),
        dispatch(getUserAttendance({ userId, page: 1, limit: 10 })),
        dispatch(getTodayBreaks(userId))
      ]);

    } catch (error) {
      console.error("❌ Punch out failed:", error);
      toast.error(error.message || "Punch out failed");
    }
  };

  // Handle Start Break - FIXED: WC और Lunch के लिए conditions सही की
  const handleStartBreak = async (breakType) => {
    if (hasAnyActiveBreak()) {
      toast.error("Finish current break first");
      return;
    }
    if (!isBreakAvailable(breakType)) {
      toast.error("You have n't any active break");
      return;
    }
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    if (!todayAttendance?.clockIn) {
      toast.error("Please punch in first to take a break");
      return;
    }


    // Check if break is already active - FIXED: Array based check
    const breaksArray = todayAttendance?.[`${breakType}Breaks`] || [];
    if (breaksArray.length > 0) {
      const lastBreak = breaksArray[breaksArray.length - 1];
      if (lastBreak && !lastBreak.end) {
        toast.error(`${breakType.charAt(0).toUpperCase() + breakType.slice(1)} break already active`);
        return;
      }
    }

    try {
      const result = await dispatch(startBreak({ userId, breakType })).unwrap();

      toast.success(`${breakType.charAt(0).toUpperCase() + breakType.slice(1)} break started`);

      // Refresh data - FIXED: Immediate refresh without timeout
      await Promise.all([
        dispatch(getTodayBreaks(userId)),
        dispatch(getTodayAttendance(userId))
      ]);

    } catch (error) {
      console.error(`❌ Failed to start ${breakType} break:`, error);
      toast.error(error.message || `Failed to start ${breakType} break`);
    }
  };

  // Handle End Break
  const handleEndBreak = async () => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    if (!activeTimer) {
      toast.error("No active break found");
      return;
    }

    try {
      const result = await dispatch(endBreak({
        userId,
        breakType: activeTimer.type
      })).unwrap();

      toast.success(`${activeTimer.type.charAt(0).toUpperCase() + activeTimer.type.slice(1)} break ended`);

      // Refresh data - FIXED: Immediate refresh
      await Promise.all([
        dispatch(getTodayBreaks(userId)),
        dispatch(getTodayAttendance(userId)),
        dispatch(getUserAttendance({ userId, page: 1, limit: 10 }))
      ]);

      setActiveTimer(null);
      setShowBreakModal(false);

    } catch (error) {
      console.error("❌ Failed to end break:", error);
      toast.error(error.message || "Failed to end break");
    }
  };

  // Refresh all data - FIXED: सिर्फ एक बार refresh होगा
  const handleRefresh = async () => {
    if (!userId) return;

    try {
      toast.success("Refreshing data...");

      // सिर्फ एक बार Promise.all call करें
      await Promise.all([
        dispatch(getTodayAttendance(userId)),
        dispatch(getUserAttendance({ userId, page: 1, limit: 10 })),
        dispatch(getTodayBreaks(userId))
      ]);

      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("❌ Refresh failed:", error);
      toast.error("Failed to refresh data");
    }
  };

  // Calculate today's worked hours
  const calculateTodayWorkedHours = () => {
    if (!todayAttendance?.clockIn) return "0h 00m";

    try {
      const endTime = todayAttendance?.clockOut
        ? new Date(todayAttendance.clockOut)
        : new Date();

      const startTime = new Date(todayAttendance.clockIn);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return "0h 00m";
      }

      const diffMs = endTime - startTime;
      if (diffMs < 0) return "0h 00m";

      const totalMinutes = Math.round(diffMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    } catch (error) {
      console.error("Error calculating hours:", error);
      return "0h 00m";
    }
  };

  // Calculate total break time today - FIXED: Array based calculation
  const calculateTotalBreakTime = () => {
    let totalMinutes = 0;

    // Smoke breaks
    const smokeBreaks = todayAttendance?.smokeBreaks || [];
    smokeBreaks.forEach(breakItem => {
      if (breakItem.start && breakItem.end) {
        const start = new Date(breakItem.start);
        const end = new Date(breakItem.end);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          totalMinutes += Math.round((end - start) / 60000);
        }
      }
    });

    // WC breaks
    const wcBreaks = todayAttendance?.wcBreaks || [];
    wcBreaks.forEach(breakItem => {
      if (breakItem.start && breakItem.end) {
        const start = new Date(breakItem.start);
        const end = new Date(breakItem.end);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          totalMinutes += Math.round((end - start) / 60000);
        }
      }
    });

    // Lunch breaks
    const lunchBreaks = todayAttendance?.lunchBreaks || [];
    lunchBreaks.forEach(breakItem => {
      if (breakItem.start && breakItem.end) {
        const start = new Date(breakItem.start);
        const end = new Date(breakItem.end);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          totalMinutes += Math.round((end - start) / 60000);
        }
      }
    });

    return totalMinutes > 0 ? `${totalMinutes}m` : "0m";
  };

  // Get status text
  const getStatusText = () => {
    if (!todayAttendance) return "Not Punched In";
    if (todayAttendance.clockOut) return "Punched Out";
    return "Currently Working";
  };

  // Check break availability - FIXED
  const isBreakAvailable = (breakType) => {
    if (!todayAttendance?.clockIn || todayAttendance?.clockOut) return false;

    // ❌ If ANY break is active → block all
    if (hasAnyActiveBreak()) return false;

    const breaksArray = todayAttendance?.[`${breakType}Breaks`] || [];

    const maxLimits = {
      smoke: 3,
      wc: 3,
      lunch: 2,
    };

    const completedBreaks = breaksArray.filter(b => b?.end).length;
    return completedBreaks < maxLimits[breakType];
  };



  // Handle day off submit
  const handleDayOffSubmit = async () => {
    // Implement day off request API call here
    setShowDayOffModal(false);
    setDayOffForm({ date: "", reason: "", type: "Rest Day" });
  };

  const calculateTotalFromBreakArray = (breakArray = []) => {
    let total = 0;
    breakArray.forEach(b => {
      if (b && b.start && b.end) {
        total += Math.round((new Date(b.end) - new Date(b.start)) / 60000);
      }
    });
    return total > 0 ? `${total}m` : "0m";
  };

  // Get table data for attendance history - FIXED: Debug logs added
  useEffect(() => {
    const todayPH = getTodayPHDate(); // YYYY-MM-DD (PH)

    if (reduxAttendanceList && reduxAttendanceList.length > 0) {
      const formattedData = reduxAttendanceList
        .filter(record => {
          if (!record?.date) return false;

          const recordPHDate = new Intl.DateTimeFormat("en-CA", {
            timeZone: PH_TIMEZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(record.date));

          return recordPHDate === todayPH;
        })
        .map(record => ({
          id: record._id,
          date: formatDatePH(record.date),
          punchIn: formatTimePH(record.clockIn),
          punchOut: formatTimePH(record.clockOut),
          wcBreak: calculateTotalFromBreakArray(record.wcBreaks),
          smokeBreak: calculateTotalFromBreakArray(record.smokeBreaks),
          lunchBreak: calculateTotalFromBreakArray(record.lunchBreaks),
          hours: record.workingHours || "0h 00m",
          status: getRecordStatus(record),
          fullRecord: record,
        }));

      setTableData(formattedData);
    } else {
      setTableData([]);
    }
  }, [reduxAttendanceList]);

  useEffect(() => {
    console.log("TableData updated:", tableData);
  }, [tableData]);

  const calculateHours = (timeRangeString) => {
    // Split the string into start and end times
    const [startTimeStr, endTimeStr] = timeRangeString.split(' - ');

    // Helper function to convert "HH:MM AM/PM" string to a Date object relative to today
    const getTimeAsDate = (timeStr) => {
      const date = new Date();
      // Use an arbitrary past date to handle overnight ranges (e.g., 10 PM - 6 AM)
      date.setFullYear(2000, 0, 1);

      // Split the time and AM/PM part
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      // Adjust hours for PM times
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      }
      // Adjust hours for 12 AM (midnight)
      if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    const startTime = getTimeAsDate(startTimeStr);
    const endTime = getTimeAsDate(endTimeStr);

    // If the end time is earlier than the start time, it means the period crosses midnight.
    // Add a day to the end time date.
    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    // Calculate the difference in milliseconds and convert to hours
    const diffInMilliseconds = endTime - startTime;
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

    return diffInHours;
  }
  // const timeRange = tableData[0]?.fullRecord?.actualWorkingHours;
  // console.log(timeRange)

  // const hours = calculateHours(timeRange);
  // console.log(hours, "hours")

  // Get record status for table
  const getRecordStatus = (record) => {
    if (!record.clockIn) return {
      text: 'Missed Punch IN',
      class: 'bg-rose-500/25 text-rose-100 border border-rose-400/70'
    };
    if (!record.clockOut) return {
      text: 'Missed Punch OUT',
      class: 'bg-amber-500/20 text-amber-100 border border-amber-400/60'
    };
    return {
      text: 'Complete',
      class: 'bg-sky-500/15 text-sky-100 border border-sky-500/60'
    };
  };



  // Add this to your existing state declarations:
  const [wfhFormData, setWfhFormData] = useState({
    issueType: 'Internet issue',
    startTime: '',
    endTime: '',
    note: ''
  });

  // Add these handler functions after your existing handlers (like handleRefresh, handleStartBreak, etc.)

  // Handle WFH form change
  const handleWFHFormChange = (e) => {
    const { id, value } = e.target;
    setWfhFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle WFH issue save
  // Replace your handleWFHSave function with this:
  const handleWFHSave = async () => {
    if (!wfhFormData.startTime) {
      toast.error("Start time is required");
      return;
    }

    if (!wfhFormData.issueType) {
      toast.error("Issue type is required");
      return;
    }

    try {

      // Dispatch the WFH issue action
      await dispatch(
        reportWfhIssue({
          userId: currentUser.id,
          issueType: wfhFormData.issueType,
          startTime: wfhFormData.startTime,
          endTime: wfhFormData.endTime || null,
          note: wfhFormData.note || "",
        })
      ).unwrap();

      toast.success("WFH issue reported successfully!");
      setShowWFHModal(false);

      // Reset form
      setWfhFormData({
        issueType: 'Internet issue',
        startTime: '',
        endTime: '',
        note: ''
      });

    } catch (error) {
      console.error("❌ Failed to report WFH issue:", error);
      toast.error(error?.message || "Failed to report WFH issue");
    }
  };

  // Handle WFH issue send to Team Leader
  const handleWFHSendToTL = async () => {
    if (!wfhFormData.startTime) {
      toast.error("Start time is required");
      return;
    }

    if (!wfhFormData.issueType) {
      toast.error("Issue type is required");
      return;
    }

    try {
      // Dispatch the WFH issue action (same as save, but you might want to add a flag for TL notification)
      await dispatch(
        reportWfhIssue({
          issueType: wfhFormData.issueType,
          startTime: wfhFormData.startTime,
          endTime: wfhFormData.endTime || null,
          note: wfhFormData.note || "",
        })
      ).unwrap();

      toast.success("WFH issue sent to Team Leader successfully! 🎉");
      setShowWFHModal(false);

      // Reset form
      setWfhFormData({
        issueType: 'Internet issue',
        startTime: '',
        endTime: '',
        note: ''
      });

    } catch (error) {
      console.error("❌ Failed to send WFH issue:", error);
      toast.error(error?.message || "Failed to send WFH issue to Team Leader");
    }
  };

  // ... rest of your state

  const handleTimer = () => {
    setShowBreakModal(false)
    setHiddenTimerType(activeTimer.type)
  }

  const handleShowTimer = () => {
    setShowBreakModal(true)
    setHiddenTimerType(null)
  }





  // Converts "05:00 AM", "5:00 PM" → Date (today)
  function parseTimeStringToDate(timeStr, baseDate) {
    if (!timeStr) return null;

    const clean = timeStr.replace(/\s+/g, " ").trim().toUpperCase();
    const [time, meridian] = clean.split(" ");

    let [h, m] = time.split(":").map(Number);

    if (meridian === "PM" && h !== 12) h += 12;
    if (meridian === "AM" && h === 12) h = 0;

    const d = new Date(baseDate);
    d.setHours(h, m, 0, 0);
    return d;
  }

  function parsePunchIn(punchIn, attendanceDate) {
    return parseTimeStringToDate(punchIn, attendanceDate);
  }


  function formatDuration(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  }
  const [now, setNow] = useState(getPHNow());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getPHNow());
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  function calculateLiveRemainingTime(
    shiftRange,
    punchIn,
    attendanceDate,
    now
  ) {
    if (!shiftRange?.includes(" - ")) return "0h 0m 0s";

    const [startStr, endStr] = shiftRange.split(" - ");

    const shiftStart = parseTimeStringToDate(startStr, attendanceDate);
    let shiftEnd = parseTimeStringToDate(endStr, attendanceDate);

    if (shiftEnd <= shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    const clockIn = parsePunchIn(punchIn, attendanceDate);
    if (!clockIn) return "0h 0m 0s";

    const effectiveStart = new Date(
      Math.max(shiftStart.getTime(), clockIn.getTime())
    );

    if (now < effectiveStart) {
      return formatDuration((shiftEnd - effectiveStart) / 1000);
    }

    if (now >= shiftEnd) return "0h 0m 0s";

    return formatDuration((shiftEnd - now) / 1000);
  }



  const liveTimeLeft = useMemo(() => {
    if (!tableData?.[0]?.fullRecord?.actualWorkingHours) return "—";

    return calculateLiveRemainingTime(
      tableData[0].fullRecord.actualWorkingHours,
      tableData[0].punchIn,
      tableData[0].fullRecord.date,
      now
    );
  }, [now, tableData]);

  const hasAnyActiveBreak = () => {
    if (!todayAttendance) return false;

    const allBreaks = [
      ...(todayAttendance.smokeBreaks || []),
      ...(todayAttendance.wcBreaks || []),
      ...(todayAttendance.lunchBreaks || []),
    ];

    return allBreaks.some(b => b && !b.end);
  };


  return (
    <div className="min-h-screen p-4 text-slate-200 bg-[#020617] ">
      <div className="mx-auto max-w-full px-5 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
              My Attendance
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Check your daily WFH login time, breaks and history in one simple place.
            </p>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
              <Clock size={12} />
              {currentTime.toLocaleString()}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 justify-end mt-4 md:mt-0">
              <CustomDatePicker />

              {/* Punch buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePunchIn}
                  disabled={!canPunchIn}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${!canPunchIn
                    ? "bg-slate-700 cursor-not-allowed text-slate-400"
                    : "bg-sky-500/80 text-slate-950 hover:bg-sky-400"
                    }`}
                >
                  <LogIn size={16} />
                  Punch In
                </button>


                <button
                  onClick={() => setShowPunchOutModal(true)}
                  disabled={!canPunchOut}

                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${!canPunchOut
                    ? "bg-slate-700 cursor-not-allowed text-slate-400"
                    : "bg-rose-500/90 text-slate-50 hover:bg-rose-400"
                    }`}
                >
                  <LogOut size={16} />
                  Punch Out
                </button>

              </div>

              {/* Day off button */}
              <button
                onClick={() => setShowDayOffModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm border border-sky-600/60 bg-slate-900/70 text-sky-100 hover:bg-sky-500/20 hover:border-sky-400 transition-all"
              >
                <CalendarPlus size={16} />
                Request Day Off
              </button>
            </div>
            <div className="flex justify-end pt-4">
              {liveTimeLeft ? <div className='flex justify-center items-baseline-last gap-2'><Clock size={12} />
                Time Left:
                <span className="font-mono">{liveTimeLeft}</span>

              </div> : <div className='flex justify-center items-baseline-last gap-2'><Clock size={12} />
                Time Left:
                <span className="font-mono">-</span>

              </div>}
            </div>
          </div>

        </div>

        {/* WFH Status Strip */}
        <div className="mt-5 p-3 rounded-2xl bg-slate-900/70 border border-sky-700/60 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.9)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`inline-flex h-2.5 w-2.5 rounded-full animate-pulse ${isOnline ? "bg-sky-400" : "bg-rose-400"
                }`}
            ></span>
            <span className="font-medium text-slate-100">
              {isOnline ? "You are currently Online (WFH)" : "You are currently Offline"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1">
              <HomeIcon size={16} />
              <span>Mode: WFH</span>
            </div>
            <div className="flex items-center gap-1">
              <User size={16} />
              <span>{user?.FullName || user?.username || "User"}</span>
            </div>
          </div>
        </div>

        {/* Today summary */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Clock}
            title="Today – Logged Hours"
            value={calculateTodayWorkedHours()}
            subtitle={getStatusText()}
            color="blue"
          />
          <div className="rounded-2xl bg-slate-900/70 border border-slate-700/60 backdrop-blur-xl p-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Today's First Login</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">
              {formatTimePH(todayAttendance?.clockIn) || "—"}
            </p>
            <p className="mt-3 text-xs text-slate-400">
              {todayAttendance?.clockIn ? "Your login time" : "Not punched in yet"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 border border-slate-700/60 backdrop-blur-xl p-4 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Today – Idle / Break Time</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">
              {calculateTotalBreakTime()}
            </p>
            <p className="mt-3 text-xs text-slate-400">Approximate break time (for reference only)</p>
          </div>
        </div>

        {/* Punch Out confirmation modal */}
        {showPunchOutModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3">
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="relative w-full sm:max-w-md p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-[0_24px_60px_rgba(15,23,42,0.95)] backdrop-blur-2xl">
              <h3 className="text-lg font-semibold text-slate-50">Confirm Punch Out</h3>
              <p className="mt-2 text-sm text-slate-300">
                Are you sure you want to punch out now?
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowPunchOutModal(false)}
                  className="rounded-xl px-3.5 py-2 text-sm border border-slate-600 bg-slate-900/80 text-slate-100 hover:bg-slate-800 hover:border-slate-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePunchOut}
                  className="rounded-xl px-3.5 py-2 text-sm font-medium bg-sky-500/90 text-slate-950 hover:bg-sky-400 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Break Countdown Modal */}
        {showBreakModal && activeTimer && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3">
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="relative w-full sm:max-w-sm p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-2xl shadow-[0_24px_60px_rgba(15,23,42,0.95)]">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Current Break</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-50">
                {activeTimer.type === 'smoke' ? 'Smoke Break' :
                  activeTimer.type === 'wc' ? 'WC Break' : 'Lunch Break'}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                {activeTimer.type === 'lunch' ?
                  'You have 30:00 minutes for this break.' :
                  'You have 05:00 minutes for this break.'}
              </p>

              <div className="mt-4 flex flex-col items-center gap-1">
                <div className={`text-4xl font-mono font-semibold ${timeLeft <= 30
                  ? "text-red-500"
                  : timeLeft <= 60
                    ? "text-amber-400"
                    : "text-slate-50"
                  }`}
                >
                  {formatBreakTimer(timeLeft)}
                </div>
                {timeLeft <= 0 && (
                  <div className="text-xs text-amber-400">
                    Time limit exceeded. Please click "Back from Break" when you return.
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  onClick={handleTimer}
                  className="rounded-xl px-3.5 py-2 text-sm border border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:border-slate-400 transition-all"
                >
                  Hide Timer
                </button>
                <button
                  onClick={handleEndBreak}
                  className="rounded-xl px-3.5 py-2 text-sm font-medium bg-sky-500/90 text-slate-950 hover:bg-sky-400 transition-all"
                >
                  Back from Break
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Break controls */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/70 border border-slate-700/60 shadow-[0_18px_45px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/15 text-sky-200 border border-sky-500/50">
                Today's Status
              </span>
              <span className="text-slate-200">
                {isOnline
                  ? "You are punched in and working from home."
                  : todayAttendance?.clockOut
                    ? "You have punched out for today."
                    : "You have not punched in yet."}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button
                onClick={() => setShowWFHModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm border border-sky-500/60 bg-slate-950/70 text-sky-100 hover:bg-sky-500/20 hover:border-sky-400 transition-all"
              >
                <AlertTriangle size={16} />
                Report WFH Issue
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm border border-emerald-600/60 bg-slate-950/70 text-emerald-100 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all"
              >
                <RefreshCw size={16} />
                Refresh Data
              </button>
            </div>
          </div>



          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => handleStartBreak('smoke')}
              disabled={!isBreakAvailable('smoke')}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-all ${!isBreakAvailable('smoke')
                ? "border border-slate-700 bg-slate-900/50 text-slate-500"
                : "border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800 hover:border-slate-500"
                }`}
            >
              <Coffee size={16} />
              <span>Smoke Break ({breakCounts.smoke}/3 • 5m)</span>
              {hiddenTimerType === 'smoke' && <button
                onClick={handleShowTimer}
                className="ms-4 rounded-xl px-2 py-1 text-sm border border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:border-slate-400 transition-all text-xs"
              >
                Show Timer
              </button>
              }
            </div>



            <div
              onClick={() => handleStartBreak('wc')}
              disabled={!isBreakAvailable('wc')}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-all ${!isBreakAvailable('wc')
                ? "border border-slate-700 bg-slate-900/50 text-slate-500 "
                : "border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800 hover:border-slate-500"
                }`}
            >
              <Droplets size={16} />
              <span>WC Break ({breakCounts.wc}/3 • 5m)</span>
              {hiddenTimerType === 'wc' && <button
                onClick={handleShowTimer}
                className="ms-9 rounded-xl px-3.5 py-2 text-sm border border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:border-slate-400 transition-all"
              >
                Show Timer
              </button>
              }
            </div>

            <div
              onClick={() => handleStartBreak('lunch')}
              disabled={!isBreakAvailable('lunch')}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-all ${!isBreakAvailable('lunch')
                ? "border border-slate-700 bg-slate-900/50 text-slate-500 "
                : "border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800 hover:border-slate-500"
                }`}
            >
              <Utensils size={16} />
              <span>Lunch Break ({breakCounts.lunch}/2 • 30m)</span>
              {hiddenTimerType === 'lunch' && <button
                onClick={handleShowTimer}
                className="ms-9 rounded-xl px-3.5 py-2 text-sm border border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:border-slate-400 transition-all"
              >
                Show Timer
              </button>
              }
            </div>

          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-4 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
          <div className="text-xs text-slate-400 mb-2">Attendance Info:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-slate-500">User:</span>
              <span className="ml-2 text-slate-300">{user?.FullName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>
              <span className={`ml-2 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Today's Login:</span>
              <span className="ml-2 text-slate-300">{formatTime(todayAttendance?.clockIn) || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500">Active Breaks:</span>
              <span className="ml-2 text-slate-300">
                {activeTimer ? `${activeTimer.type} (${formatBreakTimer(timeLeft)})` : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Attendance table */}
        <div className="mt-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-[0_22px_55px_rgba(15,23,42,0.95)] backdrop-blur-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/15 text-sky-200 border border-sky-500/40">
                My Records
              </span>
              <span>Attendance History</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs border border-emerald-600/60 bg-slate-900/70 text-emerald-100 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>
          </div>

          <div className="max-h-[360px] overflow-auto">
            <table className="w-full text-sm border-t border-slate-800/80">
              <thead className="sticky top-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-300 shadow-[0_6px_18px_rgba(15,23,42,0.9)]">
                <tr>
                  <th className="text-left font-medium px-4 py-2 border-b border-slate-800/80">Date</th>
                  <th className="text-left font-medium px-4 py-2 border-b border-slate-800/80">Punch In</th>
                  <th className="text-left font-medium px-4 py-2 border-b border-slate-800/80">Punch Out</th>
                  <th className="text-left font-medium px-4 py-2 border-b border-slate-800/80">WC Break</th>
                  <th className="text-left font-medium px-4 py-2 border-b border-slate-800/80">Smoke Break</th>
                  <th className="text-left font-medium px-4 py-2 border-b border-slate-800/80">Lunch Break</th>
                  <th className="text-left font-medium px-4 py-2 border-b border-slate-800/80">Hours</th>
                  <th className="text-left font-medium px-4 py-2 border-b border-slate-800/80">Status</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((record, index) => (
                    <tr
                      key={record.id || index}
                      className="border-b border-slate-800/70 bg-slate-900/60 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-100 font-medium">{record.date}</td>
                      <td className="px-4 py-3 text-slate-200">{record.punchIn}</td>
                      <td className="px-4 py-3 text-slate-200">{record.punchOut}</td>
                      <td className="px-4 py-3 text-slate-300">

                        {record.fullRecord?.wcBreaks?.length > 0 ? (
                          <button
                            onClick={() =>
                              openBreakDetails(
                                "WC",
                                record.fullRecord?.wcBreaks,
                                record.fullRecord?.date
                              )
                            }

                            className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 
      border border-purple-500/30 rounded-lg text-xs transition"
                          >
                            See Details
                          </button>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-300">
                        {record.fullRecord?.smokeBreaks?.length > 0 ? (
                          <button
                            onClick={() =>
                              openBreakDetails(
                                "SMOKE",
                                record.fullRecord?.smokeBreaks,
                                record.fullRecord?.date
                              )
                            }

                            className="px-3 py-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 
      border border-pink-500/30 rounded-lg text-xs transition"
                          >
                            See Details
                          </button>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-300">

                        {record.fullRecord?.lunchBreaks?.length > 0 ? (
                          <button
                            onClick={() =>
                              openBreakDetails(
                                "LUNCH",
                                record.fullRecord?.lunchBreaks,
                                record.fullRecord?.date
                              )
                            }

                            className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 
      border border-blue-500/30 rounded-lg text-xs transition"
                          >
                            See Details
                          </button>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-200 font-semibold">{record.hours}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-[11px] font-medium ${record.status.class}`}>
                          {record.status.text}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <Clock size={48} className="text-slate-600" />
                        <div>No attendance records found</div>
                        <div className="text-xs text-slate-500">Start by punching in today!</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="py-8 text-center text-sm text-slate-500">
          This page shows only your login time, breaks and basic WFH context.
          It does not track your private content or personal browsing.
        </div>
      </div>
      {/* WFH Issue Modal */}
      {
        showWFHModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3">

            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setShowWFHModal(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full sm:max-w-xl p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-[0_24px_60px_rgba(15,23,42,0.95)] backdrop-blur-2xl">

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-3xl font-semibold text-slate-50">
                    Report WFH Issue
                  </h3>
                  <p className="mt-1 text-xl text-slate-300">
                    Log power or internet problems so your attendance has proper context.
                  </p>
                </div>
                <button
                  onClick={() => setShowWFHModal(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">

                {/* Issue Type */}
                <div>
                  <label className="block text-base text-slate-400 mb-2">
                    Issue Type
                  </label>
                  <select
                    id="issueType"
                    value={wfhFormData.issueType}
                    onChange={handleWFHFormChange}
                    className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-base text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  >
                    <option value="Internet issue">Internet issue</option>
                    <option value="Power cut">Power cut</option>
                    <option value="System issue">System issue</option>
                    <option value="Personal emergency">Personal emergency</option>
                    <option value="Network problems">Network problems</option>
                    <option value="Software issue">Software issue</option>
                  </select>
                </div>

                {/* Time Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Start Time
                    </label>
                    <input
                      id="startTime"
                      type="time"
                      value={wfhFormData.startTime}
                      onChange={handleWFHFormChange}
                      className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-base text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      End Time (optional)
                    </label>
                    <input
                      id="endTime"
                      type="time"
                      value={wfhFormData.endTime}
                      onChange={handleWFHFormChange}
                      className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-base text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Note (optional)
                  </label>
                  <textarea
                    id="note"
                    value={wfhFormData.note}
                    onChange={handleWFHFormChange}
                    rows="3"
                    placeholder="Example: Internet down from 3:10–3:40 PM, using mobile hotspot after that."
                    className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-base text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none transition-all"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-3 gap-2">

                <button
                  onClick={() => setShowWFHModal(false)}
                  className="rounded-xl px-3.5 py-2 text-base border border-slate-600 bg-slate-900/80 text-slate-100 hover:bg-slate-800 hover:border-slate-400 transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={handleWFHSave}
                  className="rounded-xl px-3.5 py-2 text-base font-medium bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Save Issue
                </button>

                <button
                  onClick={handleWFHSendToTL}
                  className="rounded-xl px-3.5 py-2 text-base font-medium bg-sky-500/90 text-slate-950 hover:bg-sky-400 transition-all"
                >
                  Send to Team Leader
                </button>

              </div>
            </div>
          </div>
        )
      }

      {
        breakModal.open && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-xl p-6 w-full max-w-2xl text-white shadow-2xl">

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-wide">
                  {breakModal.type} Break Details
                </h2>
                <button
                  onClick={() => setBreakModal({ open: false })}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <table className="w-full rounded-lg">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">
                      DATE
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">
                      START
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">
                      END
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">
                      TOTAL
                    </th>
                  </tr>
                </thead>


                <tbody>
                  {breakModal.breaks.length > 0 ? (
                    breakModal.breaks.map((b, index) => (
                      <tr key={index} className="border-t border-slate-700">
                        <td className="px-4 py-3 text-sm">
                          {breakModal.date
                            ? new Date(breakModal.date).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-4 py-3 text-sm">
                          {b.start ? new Date(b.start).toLocaleTimeString() : "—"}
                        </td>

                        <td className="px-4 py-3 text-sm">
                          {b.end ? new Date(b.end).toLocaleTimeString() : "—"}
                        </td>

                        <td className="px-4 py-3 text-sm text-blue-400 font-semibold">
                          {b.start && b.end
                            ? (() => {
                              const diffSeconds = Math.round((new Date(b.end) - new Date(b.start)) / 1000);
                              const minutes = Math.floor(diffSeconds / 60);
                              const seconds = diffSeconds % 60;
                              return `${minutes}m ${seconds}s`;
                            })()
                            : "—"}
                        </td>


                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-slate-400">
                        No break records found
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>

            </div>
          </div>
        )
      }

      {/* Day Off Modal */}
      {
        showDayOffModal && (
          <ShowOffDay
            handleDayOffSubmit={handleDayOffSubmit}
            setShowDayOffModal={setShowDayOffModal}
            setDayOffForm={setDayOffForm}
            dayOffForm={dayOffForm}
          />
        )
      }

      <AttendancePunchReminder
        open={showAbsentModal}
        onClose={() => setShowAbsentModal(false)}
      />


      {/* Announcement Popup (simplified) */}
      <AttendanceAnnouncementPopup
        visible={showAnnouncement}
        onClose={() => setShowAnnouncement(false)}
        onProceed={() => setShowAnnouncement(false)}
        userHasPunchedInToday={!!todayAttendance?.clockIn}
        userHasPunchedOutToday={!!todayAttendance?.clockOut}
        forgotPunchIn={false}
        forgotPunchOut={false}
        excessiveBreaks={false}
        latePunchOut={false}
        totalBreakMinutes={calculateTotalBreakTime().replace('m', '')}
      />
    </div >
  );
};

export default AttendanceDashboard;


