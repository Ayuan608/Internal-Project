import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getUserAttendance } from "../../redux/attendenceSlice";
import axios from "axios";
import { toast } from "react-hot-toast";

// Constants
const INITIAL_PAGE_SIZE = 10;

// Helper functions for localStorage
const getStoredBreakCounts = () => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(`breakCounts_${today}`);
  return stored ? JSON.parse(stored) : { smoke: 0, wc: 0, lunch: 0, lastReset: today };
};

const setStoredBreakCounts = (counts) => {
  const today = new Date().toDateString();
  localStorage.setItem(`breakCounts_${today}`, JSON.stringify({ ...counts, lastReset: today }));
};

const getStoredBreakHistory = () => {
  const stored = localStorage.getItem("breakHistory");
  return stored ? JSON.parse(stored) : [];
};

const addToBreakHistory = (breakRecord) => {
  const history = getStoredBreakHistory();
  const updatedHistory = [breakRecord, ...history].slice(0, 50);
  localStorage.setItem("breakHistory", JSON.stringify(updatedHistory));
};

// Clear localStorage for breaks when database is reset
const clearBreakStorage = () => {
  const today = new Date().toDateString();
  localStorage.removeItem(`breakCounts_${today}`);
  localStorage.removeItem("breakHistory");
};

// API calls for breaks
const api = axios.create({
  baseURL: "/api",
});

const saveBreakRecord = async (breakRecord) => {
  try {
    const response = await api.post("/attendance/break", breakRecord);
    return response.data;
  } catch (error) {
    console.error("Error saving break record:", error);
    throw error;
  }
};

const fetchBreakRecords = async (userId, date) => {
  try {
    const response = await api.get(`/attendance/breaks/${userId}?date=${date}`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching break records:", error);
    return [];
  }
};

export const useAttendanceDashboard = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.data?._id, (a, b) => a === b);
  const { attendanceList, isLoading } = useSelector(
    (state) => state.attendance,
    (a, b) => a.attendanceList === b.attendanceList && a.isLoading === b.isLoading
  );

  // States
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [breakCounts, setBreakCounts] = useState(() => getStoredBreakCounts());
  const [breakHistory, setBreakHistory] = useState(() => getStoredBreakHistory());
  const [showDayOffModal, setShowDayOffModal] = useState(false);
  const [dayOffForm, setDayOffForm] = useState({
    date: "",
    reason: "",
    attachmentType: "medical",
  });
  const [error, setError] = useState(null);

  // Memoized loadBreakData
  const loadBreakData = useCallback(async () => {
    if (!userId) return;
    const today = new Date().toISOString().split("T")[0];
    try {
      const breaks = await fetchBreakRecords(userId, today);
      const counts = {
        smoke: 0,
        wc: 0,
        lunch: 0,
        lastReset: today,
      };
      breaks.forEach((record) => {
        if (record.type === "smoke" && record.endTime) counts.smoke++;
        else if (record.type === "wc" && record.endTime) counts.wc++;
        else if (record.type === "lunch" && record.endTime) counts.lunch++;
      });
      setBreakCounts((prev) => {
        if (
          prev.smoke === counts.smoke &&
          prev.wc === counts.wc &&
          prev.lunch === counts.lunch &&
          prev.lastReset === counts.lastReset
        ) {
          return prev;
        }
        setStoredBreakCounts(counts);
        return counts;
      });
      setBreakHistory((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(breaks)) return prev;
        return breaks;
      });
      if (breaks.length > 0) {
        addToBreakHistory(breaks[0]);
      }
    } catch (err) {
      console.error("Failed to load break data, using localStorage", err);
      setBreakCounts((prev) => {
        const stored = getStoredBreakCounts();
        if (JSON.stringify(prev) === JSON.stringify(stored)) return prev;
        return stored;
      });
      setBreakHistory((prev) => {
        const stored = getStoredBreakHistory();
        if (JSON.stringify(prev) === JSON.stringify(stored)) return prev;
        return stored;
      });
    }
  }, [userId]);

  // Check punch status
  const hasPunchedOutToday = useMemo(() => {
    if (!Array.isArray(attendanceList) || attendanceList.length === 0) return false;
    const today = new Date().toISOString().split("T")[0];
    const todayRecord = attendanceList.find((row) => {
      const rowDate = new Date(row.date).toISOString().split("T")[0];
      return rowDate === today;
    });
    return todayRecord?.clockOut && todayRecord.clockOut !== "";
  }, [attendanceList]);

  const hasPunchedInToday = useMemo(() => {
    if (!Array.isArray(attendanceList) || attendanceList.length === 0) return false;
    const today = new Date().toISOString().split("T")[0];
    const todayRecord = attendanceList.find((row) => {
      const rowDate = new Date(row.date).toISOString().split("T")[0];
      return rowDate === today;
    });
    return todayRecord?.clockIn && todayRecord.clockIn !== "";
  }, [attendanceList]);

  // Format time for display
  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0
      ? `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      : `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // End break - Moved before useEffect
  const endBreak = useCallback(async () => {
    if (!activeTimer) return;
    const breakType = activeTimer.type;
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeTimer.startTime.getTime()) / 1000);

    const breakRecord = {
      userId,
      type: breakType,
      startTime: activeTimer.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      date: new Date().toISOString().split("T")[0],
    };

    setBreakCounts((prev) => {
      const newCounts = { ...prev, [breakType]: prev[breakType] + 1 };
      setStoredBreakCounts(newCounts);
      return newCounts;
    });

    try {
      const savedBreak = await saveBreakRecord(breakRecord);
      const updatedBreaks = await fetchBreakRecords(userId, breakRecord.date);
      setBreakHistory(updatedBreaks);
      addToBreakHistory({ ...breakRecord, id: savedBreak._id || Date.now().toString() });
    } catch (err) {
      console.error("Failed to save break end:", err);
      addToBreakHistory({ ...breakRecord, id: Date.now().toString() });
      setBreakHistory(getStoredBreakHistory());
    }

    setActiveTimer(null);
    setTimeLeft(300);
  }, [activeTimer, userId]);

  // Timer countdown effect
  useEffect(() => {
    if (!activeTimer) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          endBreak();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimer, endBreak]); // Added endBreak to dependencies

  // Check and reset break counts daily
  useEffect(() => {
    const today = new Date().toDateString();
    if (breakCounts.lastReset !== today) {
      const resetCounts = {
        smoke: 0,
        wc: 0,
        lunch: 0,
        lastReset: today,
      };
      setBreakCounts(resetCounts);
      setStoredBreakCounts(resetCounts);
      setBreakHistory([]);
      clearBreakStorage();
    }
  }, [breakCounts.lastReset]);

  // Load attendance and break data on mount
  useEffect(() => {
    const loadData = async () => {
      setError(null);
      if (!userId) return;
      try {
        await dispatch(
          getUserAttendance({
            userId,
            page: 1,
            limit: INITIAL_PAGE_SIZE,
          })
        ).unwrap();
        await loadBreakData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
    };
    loadData();
  }, [dispatch, userId, loadBreakData]);

  const currentStatus = useMemo(() => {
    if (hasPunchedOutToday) return "Punched Out";
    if (activeTimer)
      return `On ${activeTimer.type.charAt(0).toUpperCase() + activeTimer.type.slice(1)} Break`;
    if (hasPunchedInToday) return "Currently Working";
    return "Ready";
  }, [hasPunchedOutToday, activeTimer, hasPunchedInToday]);

  // Start break
  const startBreak = useCallback(
    async (type) => {
      if (hasPunchedOutToday) {
        toast.error("You have already punched out for today. Breaks are not allowed after punch out.");
        return;
      }
      if (!hasPunchedInToday) {
        toast.error("Please punch in first before taking a break.");
        return;
      }
      const limits = { smoke: 3, wc: 3, lunch: 1 };
      if (breakCounts[type] >= limits[type]) {
        toast.error(`Maximum ${type} breaks (${limits[type]}) reached for today!`);
        return;
      }
      if (activeTimer) {
        toast.error(`Please finish your ${activeTimer.type} break first!`);
        return;
      }
      const duration = type === "lunch" ? 3600 : 300;
      const newTimer = { type, startTime: new Date() };
      setActiveTimer(newTimer);
      setTimeLeft(duration);

      const today = new Date().toISOString().split("T")[0];
      const breakRecord = {
        userId,
        type,
        startTime: newTimer.startTime.toISOString(),
        date: today,
      };

      try {
        const savedBreak = await saveBreakRecord(breakRecord);
        addToBreakHistory({ ...breakRecord, id: savedBreak._id || Date.now().toString() });
        setBreakHistory(getStoredBreakHistory());
      } catch (err) {
        console.error("Failed to save break start:", err);
        addToBreakHistory({ ...breakRecord, id: Date.now().toString() });
        setBreakHistory(getStoredBreakHistory());
      }
    },
    [hasPunchedOutToday, hasPunchedInToday, breakCounts, activeTimer, userId]
  );

  // Calculate break time from history
  const calculateBreakTimeFromHistory = useCallback((rowDate, breakType) => {
    const dateBreaks = breakHistory.filter((record) => record.date === rowDate && record.type === breakType);
    if (dateBreaks.length > 0) {
      const totalSeconds = dateBreaks.reduce((total, record) => total + (record.duration || 0), 0);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}m ${seconds}s`;
    }
    return "-";
  }, [breakHistory]);

  // Break time calculations
  const calculateBreakTime = useCallback(
    (start, end, rowDate) => {
      if (!start || !end) return calculateBreakTimeFromHistory(rowDate, "smoke");
      try {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return calculateBreakTimeFromHistory(rowDate, "smoke");
        }
        const diff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
        return `${diff} min`;
      } catch {
        return calculateBreakTimeFromHistory(rowDate, "smoke");
      }
    },
    [calculateBreakTimeFromHistory]
  );

  const calculateWcBreakTime = useCallback(
    (start, end, rowDate) => {
      if (!start || !end) return calculateBreakTimeFromHistory(rowDate, "wc");
      try {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return calculateBreakTimeFromHistory(rowDate, "wc");
        }
        const diff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
        return `${diff} min`;
      } catch {
        return calculateBreakTimeFromHistory(rowDate, "wc");
      }
    },
    [calculateBreakTimeFromHistory]
  );

  const calculateLunchBreakTime = useCallback(
    (start, end, rowDate) => {
      if (!start || !end) return calculateBreakTimeFromHistory(rowDate, "lunch");
      try {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return calculateBreakTimeFromHistory(rowDate, "lunch");
        }
        const diff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
        return `${diff} min`;
      } catch {
        return calculateBreakTimeFromHistory(rowDate, "lunch");
      }
    },
    [calculateBreakTimeFromHistory]
  );

  // Handle day off request
  const handleDayOffSubmit = useCallback((e) => {
    e.preventDefault();
    if (!dayOffForm.date || !dayOffForm.reason) {
      toast.error("Please fill in all required fields");
      return;
    }
    const request = {
      id: Date.now().toString(),
      date: dayOffForm.date,
      reason: dayOffForm.reason,
      attachmentType: dayOffForm.attachmentType,
      requestedOn: new Date().toISOString(),
      status: "pending",
    };
    localStorage.setItem(
      "dayOffRequests",
      JSON.stringify([
        request,
        ...(localStorage.getItem("dayOffRequests") ? JSON.parse(localStorage.getItem("dayOffRequests")) : []),
      ])
    );
    toast.success("Day off request submitted successfully!");
    setDayOffForm({ date: "", reason: "", attachmentType: "medical" });
    setShowDayOffModal(false);
  }, [dayOffForm]);

  // Real-time statistics
  const stats = useMemo(() => {
    const defaultStats = {
      todayWorkedHours: "0h 0m",
      todayStatus: "No data",
      daysWorked: 0,
      totalHoursWorked: "0h 0m",
      avgDailyHours: "0h 0m",
      overtimeHours: "0h 0m",
      totalWorkTime: "0h 0m",
      totalWcBreak: "0 min",
      totalSmokeBreak: "0 min",
      totalLunchBreak: "0 min",
      hasPendingPunchOut: false,
      currentStreak: 0,
      lastPunchIn: "No data",
      efficiency: "0%",
      pieData: [],
    };

    if (!Array.isArray(attendanceList) || attendanceList.length === 0) {
      return defaultStats;
    }

    let totalWorkMinutes = 0;
    let totalWcMinutes = 0;
    let totalSmokeMinutes = 0;
    let totalLunchMinutes = 0;
    let pendingPunchOutToday = false;
    let daysWithWork = 0;
    let todayWorkMinutes = 0;
    const today = new Date().toISOString().split("T")[0];
    let lastPunchInTime = null;
    let consecutiveDays = 0;
    const last7Days = new Set();

    attendanceList.forEach((row) => {
      const rowDate = new Date(row.date).toISOString().split("T")[0];
      if (row.workingHours) {
        const match = row.workingHours.match(/(\d+)h (\d+)m/);
        if (match) {
          const minutes = parseInt(match[1]) * 60 + parseInt(match[2]);
          totalWorkMinutes += minutes;
          daysWithWork++;
          if (rowDate === today) todayWorkMinutes = minutes;
        }
      }

      if (row.smokeStart && row.smokeEnd) {
        try {
          const diff = Math.floor(
            (new Date(row.smokeEnd).getTime() - new Date(row.smokeStart).getTime()) / (1000 * 60)
          );
          totalSmokeMinutes += diff;
        } catch { }
      }
      if (row.wcStart && row.wcEnd) {
        try {
          const diff = Math.floor(
            (new Date(row.wcEnd).getTime() - new Date(row.wcStart).getTime()) / (1000 * 60)
          );
          totalWcMinutes += diff;
        } catch { }
      }
      if (row.breakStart && row.breakEnd) {
        try {
          const diff = Math.floor(
            (new Date(row.breakEnd).getTime() - new Date(row.breakStart).getTime()) / (1000 * 60)
          );
          totalLunchMinutes += diff;
        } catch { }
      }

      if (!row.clockOut && rowDate === today) pendingPunchOutToday = true;
      if (row.clockIn && (!lastPunchInTime || new Date(row.clockIn) > lastPunchInTime)) {
        lastPunchInTime = new Date(row.clockIn);
      }
      last7Days.add(rowDate);
    });

    breakHistory.forEach((record) => {
      if (record.date === today && record.endTime) {
        const minutes = Math.floor((record.duration || 0) / 60);
        if (record.type === "wc") totalWcMinutes += minutes;
        else if (record.type === "smoke") totalSmokeMinutes += minutes;
        else if (record.type === "lunch") totalLunchMinutes += minutes;
      }
    });

    const todayDate = new Date();
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(todayDate.getDate() - i);
      const checkDateStr = checkDate.toISOString().split("T")[0];
      if (last7Days.has(checkDateStr)) consecutiveDays++;
      else break;
    }

    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins.toString().padStart(2, "0")}m`;
    };

    const formatShortTime = (minutes) => {
      const hours = (minutes / 60).toFixed(1);
      return `${hours}h`;
    };

    const avgDailyMinutes = daysWithWork > 0 ? totalWorkMinutes / daysWithWork : 0;
    const standardHoursPerDay = 8 * 60;
    const overtimeMinutes = Math.max(0, totalWorkMinutes - daysWithWork * standardHoursPerDay);
    const totalBreakMinutes = totalWcMinutes + totalSmokeMinutes + totalLunchMinutes;
    const totalAvailableMinutes = totalWorkMinutes + totalBreakMinutes;
    const efficiency =
      totalAvailableMinutes > 0 ? Math.round((totalWorkMinutes / totalAvailableMinutes) * 100) : 0;

    const todayStatus = todayWorkMinutes > 0
      ? pendingPunchOutToday
        ? "Working..."
        : todayWorkMinutes >= standardHoursPerDay
          ? "Completed"
          : "Partial"
      : "No work today";

    const lastPunchInFormatted = lastPunchInTime
      ? new Date(lastPunchInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
      : "No data";

    const pieData = [
      { name: "Work", value: totalWorkMinutes },
      { name: "WC Break", value: totalWcMinutes },
      { name: "Smoke Break", value: totalSmokeMinutes },
      { name: "Lunch Break", value: totalLunchMinutes },
    ].filter((item) => item.value > 0);

    return {
      todayWorkedHours: formatTime(todayWorkMinutes),
      todayStatus,
      daysWorked: daysWithWork,
      totalHoursWorked: formatTime(totalWorkMinutes),
      avgDailyHours: formatShortTime(avgDailyMinutes),
      overtimeHours: formatTime(overtimeMinutes),
      totalWorkTime: formatTime(totalWorkMinutes),
      totalWcBreak: `${totalWcMinutes} min`,
      totalSmokeBreak: `${totalSmokeMinutes} min`,
      totalLunchBreak: `${totalLunchMinutes} min`,
      hasPendingPunchOut: pendingPunchOutToday,
      currentStreak: consecutiveDays,
      lastPunchIn: lastPunchInFormatted,
      efficiency: `${efficiency}%`,
      pieData,
    };
  }, [attendanceList, breakHistory]);

  const handleRefresh = useCallback(() => {
    clearBreakStorage();
    setBreakCounts({ smoke: 0, wc: 0, lunch: 0, lastReset: new Date().toDateString() });
    setBreakHistory([]);
    dispatch(getUserAttendance({ userId, page: 1, limit: INITIAL_PAGE_SIZE }));
    loadBreakData();
  }, [dispatch, userId, loadBreakData]);

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "-";
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);
      return `${day}/${month}/${year}`;
    } catch {
      return "-";
    }
  }, []);

  const formatTimeDisplay = useCallback((timeStr) => {
    if (!timeStr) return "-";
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return "-";
    }
  }, []);

  const isSmokeBreakDisabled = useMemo(
    () => activeTimer !== null || breakCounts.smoke >= 3 || !hasPunchedInToday,
    [activeTimer, breakCounts.smoke, hasPunchedInToday]
  );
  const isWcBreakDisabled = useMemo(
    () => activeTimer !== null || breakCounts.wc >= 3 || !hasPunchedInToday,
    [activeTimer, breakCounts.wc, hasPunchedInToday]
  );
  const isLunchBreakDisabled = useMemo(
    () => activeTimer !== null || breakCounts.lunch >= 1 || !hasPunchedInToday,
    [activeTimer, breakCounts.lunch, hasPunchedInToday]
  );

  // Enhanced debugging logs
  useEffect(() => {
    console.log("AttendanceDashboard Hook State:", {
      userId,
      attendanceList,
      breakCounts,
      breakHistory,
      currentStatus,
      stats,
      isSmokeBreakDisabled,
      isWcBreakDisabled,
      isLunchBreakDisabled,
      hasPunchedInToday,
      hasPunchedOutToday,
    });
  }, [userId, attendanceList, breakCounts, breakHistory, currentStatus, stats, isSmokeBreakDisabled, isWcBreakDisabled, isLunchBreakDisabled, hasPunchedInToday, hasPunchedOutToday]);

  return {
    userId,
    attendanceList,
    isLoading,
    activeTimer,
    timeLeft,
    breakCounts,
    breakHistory,
    showDayOffModal,
    dayOffForm,
    error,
    currentStatus,
    stats,
    isSmokeBreakDisabled,
    isWcBreakDisabled,
    isLunchBreakDisabled,
    hasPunchedInToday,
    handleRefresh,
    startBreak,
    endBreak,
    setShowDayOffModal,
    setDayOffForm,
    handleDayOffSubmit,
    formatTime,
    formatDate,
    formatTimeDisplay,
    calculateBreakTime,
    calculateWcBreakTime,
    calculateLunchBreakTime,
  };
};