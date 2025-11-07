// hooks/useAttendanceHooks.js
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { getUserAttendance } from "../../redux/attendenceSlice";
import axios from "axios";
import { toast } from "react-hot-toast";

// Constants
const INITIAL_PAGE_SIZE = 10;
const SMOKE_WC_DURATION = 300; // seconds
const LUNCH_DURATION = 3600; // seconds
const MAX_STALE_TIMER_MINUTES = 5;

// FIXED: User-specific localStorage helpers
const getStoredBreakCounts = (userId) => {
  if (!userId) return { smoke: 0, wc: 0, lunch: 0, lastReset: new Date().toDateString() };

  const today = new Date().toDateString();
  const stored = localStorage.getItem(`breakCounts_${userId}_${today}`);
  return stored ? JSON.parse(stored) : {
    smoke: 0,
    wc: 0,
    lunch: 0,
    lastReset: today,
    userId: userId
  };
};

const setStoredBreakCounts = (counts, userId) => {
  if (!userId) return;
  const today = new Date().toDateString();
  localStorage.setItem(`breakCounts_${userId}_${today}`, JSON.stringify({
    ...counts,
    lastReset: today,
    userId: userId
  }));
};

// FIXED: User-specific break history
const getStoredBreakHistory = (userId) => {
  if (!userId) return [];
  const stored = localStorage.getItem(`breakHistory_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

const addToBreakHistory = (breakRecord, userId) => {
  if (!userId) return;
  const history = getStoredBreakHistory(userId);
  const updatedHistory = [breakRecord, ...history].slice(0, 50);
  localStorage.setItem(`breakHistory_${userId}`, JSON.stringify(updatedHistory));
};

// FIXED: User-specific active timer
const getStoredActiveTimer = (userId) => {
  if (!userId) return null;
  const key = `activeTimer_${userId}`;
  const stored = localStorage.getItem(key);
  if (!stored) return null;

  try {
    const timer = JSON.parse(stored);
    const now = new Date();
    const startTime = new Date(timer.startTime); // Parse string to Date
    const elapsedMinutes = (now - startTime) / (1000 * 60);

    if (elapsedMinutes > MAX_STALE_TIMER_MINUTES) {
      console.log("Discarding stale timer:", timer);
      localStorage.removeItem(key);
      return null;
    }

    return { ...timer, startTime }; // Return Date object
  } catch (error) {
    console.error("Error parsing active timer:", error);
    localStorage.removeItem(key);
    return null;
  }
};

const setStoredActiveTimer = (timer, userId) => {
  if (!userId) return;
  const key = `activeTimer_${userId}`;
  if (timer) {
    localStorage.setItem(key, JSON.stringify({
      ...timer,
      startTime: timer.startTime.toISOString() // Store as ISO string
    }));
  } else {
    localStorage.removeItem(key);
  }
};
// FIXED: User-specific storage clearing
const clearBreakStorage = (userId) => {
  if (!userId) return;
  const today = new Date().toDateString();
  localStorage.removeItem(`breakCounts_${userId}_${today}`);
  localStorage.removeItem(`breakHistory_${userId}`);
  localStorage.removeItem(`activeTimer_${userId}`);
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

  // FIXED: Add user change detection
  const [previousUserId, setPreviousUserId] = useState(null);

  const { attendanceList, isLoading } = useSelector(
    (state) => state.attendance,
    (a, b) => a.attendanceList === b.attendanceList && a.isLoading === b.isLoading
  );

  // States - FIXED: Initialize with userId
  const [activeTimer, setActiveTimer] = useState(() => getStoredActiveTimer(userId));
  const [timeLeft, setTimeLeft] = useState(300);
  const [breakCounts, setBreakCounts] = useState(() => getStoredBreakCounts(userId));
  const [breakHistory, setBreakHistory] = useState(() => getStoredBreakHistory(userId));
  const [showDayOffModal, setShowDayOffModal] = useState(false);
  const [dayOffForm, setDayOffForm] = useState({
    date: "",
    reason: "",
    attachmentType: "medical",
  });
  const [error, setError] = useState(null);
  const [warningShown, setWarningShown] = useState(false);
  const timerIntervalRef = useRef(null);

  // FIXED: Check punch status - MOVE THIS BEFORE startBreak function
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

  // FIXED: Detect user change and reset data
  useEffect(() => {
    if (userId && userId !== previousUserId) {
      console.log("User changed from", previousUserId, "to", userId, "- Resetting break data");

      // Clear previous user's timer
      if (previousUserId) {
        setStoredActiveTimer(null, previousUserId);
      }

      // Reset states for new user
      setActiveTimer(getStoredActiveTimer(userId));
      setBreakCounts(getStoredBreakCounts(userId));
      setBreakHistory(getStoredBreakHistory(userId));
      setTimeLeft(300);
      setWarningShown(false);

      setPreviousUserId(userId);
    }
  }, [userId, previousUserId]);

  // FIXED: Update timeLeft based on activeTimer with userId
  useEffect(() => {
    if (!activeTimer) {
      setTimeLeft(300);
      setWarningShown(false);
      return;
    }

    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - new Date(activeTimer.startTime).getTime()) / 1000);
    const duration = activeTimer.type === "lunch" ? LUNCH_DURATION : SMOKE_WC_DURATION;
    const remaining = duration - elapsedSeconds;

    setTimeLeft(remaining);
    setWarningShown(remaining <= 0);

    if (remaining <= 0 && !warningShown) {
      toast.error(`Your ${activeTimer.type} break time has already exceeded! Please end the break immediately.`);
      setWarningShown(true);
    }
  }, [activeTimer, warningShown]);

  // FIXED: loadBreakData with userId
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
        userId: userId
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
        setStoredBreakCounts(counts, userId);
        return counts;
      });

      setBreakHistory((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(breaks)) return prev;
        return breaks;
      });

      if (breaks.length > 0) {
        addToBreakHistory(breaks[0], userId);
      }
    } catch (err) {
      console.error("Failed to load break data, using localStorage", err);
      setBreakCounts((prev) => {
        const stored = getStoredBreakCounts(userId);
        if (JSON.stringify(prev) === JSON.stringify(stored)) return prev;
        return stored;
      });
      setBreakHistory((prev) => {
        const stored = getStoredBreakHistory(userId);
        if (JSON.stringify(prev) === JSON.stringify(stored)) return prev;
        return stored;
      });
    }
  }, [userId]);

  // FIXED: Check and reset break counts daily with userId
  useEffect(() => {
    if (!userId) return;

    const today = new Date().toDateString();
    if (breakCounts.lastReset !== today) {
      console.log("Resetting break counts for new day for user:", userId);
      const resetCounts = {
        smoke: 0,
        wc: 0,
        lunch: 0,
        lastReset: today,
        userId: userId
      };
      setBreakCounts(resetCounts);
      setStoredBreakCounts(resetCounts, userId);
      setBreakHistory([]);
      clearBreakStorage(userId);
    }
  }, [breakCounts.lastReset, userId]);

  // FIXED: endBreak with userId
  const endBreak = useCallback(async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (!activeTimer || !userId) return;
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
      setStoredBreakCounts(newCounts, userId);
      return newCounts;
    });

    try {
      const savedBreak = await saveBreakRecord(breakRecord);
      const updatedBreaks = await fetchBreakRecords(userId, breakRecord.date);
      setBreakHistory(updatedBreaks);
      addToBreakHistory({ ...breakRecord, id: savedBreak._id || Date.now().toString() }, userId);
    } catch (err) {
      console.error("Failed to save break end:", err);
      addToBreakHistory({ ...breakRecord, id: Date.now().toString() }, userId);
      setBreakHistory(getStoredBreakHistory(userId));
    }

    setStoredActiveTimer(null, userId);
    setActiveTimer(null);
    setTimeLeft(300);
    setWarningShown(false);
  }, [activeTimer, userId]);

  // FIXED: startBreak with userId - NOW hasPunchedOutToday is defined
  const startBreak = useCallback(
    async (type) => {
      if (!userId) {
        toast.error("User not found. Please login again.");
        return;
      }

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

      const duration = type === "lunch" ? LUNCH_DURATION : SMOKE_WC_DURATION;
      const newTimer = { type, startTime: new Date() };
      setActiveTimer(newTimer);
      setTimeLeft(duration);
      setWarningShown(false);

      setStoredActiveTimer(newTimer, userId);

      const today = new Date().toISOString().split("T")[0];
      const breakRecord = {
        userId,
        type,
        startTime: newTimer.startTime.toISOString(),
        date: today,
      };

      try {
        const savedBreak = await saveBreakRecord(breakRecord);
        addToBreakHistory({ ...breakRecord, id: savedBreak._id || Date.now().toString() }, userId);
        setBreakHistory(getStoredBreakHistory(userId));
      } catch (err) {
        console.error("Failed to save break start:", err);
        addToBreakHistory({ ...breakRecord, id: Date.now().toString() }, userId);
        setBreakHistory(getStoredBreakHistory(userId));
      }
    },
    [hasPunchedOutToday, hasPunchedInToday, breakCounts, activeTimer, userId]
  );

  // Timer countdown effect - UPDATED to allow negative and show warning
  useEffect(() => {
    if (!activeTimer) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    // Clear any existing interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        // Show warning only once when it first hits 0 or below
        if (newTime <= 0 && prev > 0 && !warningShown) {
          toast.error(`Your ${activeTimer.type} break time has exceeded! Please end the break immediately.`);
          setWarningShown(true);
        }
        return newTime; // Allow negative
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [activeTimer, warningShown]);

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

  // Calculate total break time for a record
  const calculateTotalBreakTime = useCallback((row) => {
    let totalBreakMinutes = 0;

    // Calculate WC break time
    if (row.wcStart && row.wcEnd) {
      try {
        const start = new Date(row.wcStart);
        const end = new Date(row.wcEnd);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          totalBreakMinutes += Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
        }
      } catch (error) {
        console.error("Error calculating WC break time:", error);
      }
    }

    // Calculate Smoke break time
    if (row.smokeStart && row.smokeEnd) {
      try {
        const start = new Date(row.smokeStart);
        const end = new Date(row.smokeEnd);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          totalBreakMinutes += Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
        }
      } catch (error) {
        console.error("Error calculating Smoke break time:", error);
      }
    }

    // Calculate Lunch break time
    if (row.lunchStart && row.lunchEnd) {
      try {
        const start = new Date(row.lunchStart);
        const end = new Date(row.lunchEnd);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          totalBreakMinutes += Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
        }
      } catch (error) {
        console.error("Error calculating Lunch break time:", error);
      }
    }

    // Also check break history for additional breaks
    if (row.date) {
      const dateBreaks = breakHistory.filter(record => record.date === row.date);
      dateBreaks.forEach(record => {
        if (record.duration) {
          totalBreakMinutes += Math.floor(record.duration / 60);
        }
      });
    }

    return totalBreakMinutes;
  }, [breakHistory]);

  // Format breaks display with types and total time
  const formatBreaksDisplay = useCallback((row) => {
    const breaks = [];
    let totalBreakMinutes = calculateTotalBreakTime(row);

    // Check which breaks were taken
    if (row.wcStart && row.wcEnd) breaks.push("WC");
    if (row.smokeStart && row.smokeEnd) breaks.push("Smoke");
    if (row.lunchStart && row.lunchEnd) breaks.push("Lunch");

    // Also check break history
    if (row.date) {
      const dateBreaks = breakHistory.filter(record => record.date === row.date);
      dateBreaks.forEach(record => {
        if (!breaks.includes(record.type.charAt(0).toUpperCase() + record.type.slice(1))) {
          breaks.push(record.type.charAt(0).toUpperCase() + record.type.slice(1));
        }
      });
    }

    if (breaks.length === 0) {
      return "-";
    }

    const breakTypes = breaks.join(", ");

    // Format total time
    let totalTimeDisplay = "";
    if (totalBreakMinutes > 0) {
      if (totalBreakMinutes >= 60) {
        const hours = Math.floor(totalBreakMinutes / 60);
        const minutes = totalBreakMinutes % 60;
        totalTimeDisplay = minutes > 0
          ? ` (${hours}h ${minutes}m)`
          : ` (${hours}h)`;
      } else {
        totalTimeDisplay = ` (${totalBreakMinutes}m)`;
      }
    }

    return `${breakTypes}${totalTimeDisplay}`;
  }, [calculateTotalBreakTime, breakHistory]);

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
      totalAllBreaks: "0 min",
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

      // Calculate break times from attendance records
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

    // Add break times from break history
    breakHistory.forEach((record) => {
      if (record.endTime) {
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

    const formatBreakTime = (minutes) => {
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
      }
      return `${minutes}m`;
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
      totalWcBreak: formatBreakTime(totalWcMinutes),
      totalSmokeBreak: formatBreakTime(totalSmokeMinutes),
      totalLunchBreak: formatBreakTime(totalLunchMinutes),
      totalAllBreaks: formatBreakTime(totalBreakMinutes),
      hasPendingPunchOut: pendingPunchOutToday,
      currentStreak: consecutiveDays,
      lastPunchIn: lastPunchInFormatted,
      efficiency: `${efficiency}%`,
      pieData,
    };
  }, [attendanceList, breakHistory]);

  // FIXED: handleRefresh with userId
  const handleRefresh = useCallback(() => {
    if (!userId) return;

    clearBreakStorage(userId);
    const resetCounts = {
      smoke: 0,
      wc: 0,
      lunch: 0,
      lastReset: new Date().toDateString(),
      userId: userId
    };
    setBreakCounts(resetCounts);
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

  const formatTime = useCallback((seconds) => {
    const absSeconds = Math.abs(seconds);
    const hours = Math.floor(absSeconds / 3600);
    const mins = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;
    const sign = seconds < 0 ? "-" : "";
    const timeStr = hours > 0
      ? `${sign}${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      : `${sign}${mins}:${secs.toString().padStart(2, "0")}`;
    return timeStr;
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
    hasPunchedOutToday,
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
    calculateTotalBreakTime,
    formatBreaksDisplay,
  };
};




// FIXED: Updated useAttendanceAnnouncement hook
export const useAttendanceAnnouncement = () => {
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const attendanceList = useSelector((state) => state.attendance.attendanceList);
  const userId = useSelector((state) => state.auth.data?._id);

  const today = new Date().toISOString().split("T")[0];

  const hasPunchedInToday = useMemo(() => {
    if (!Array.isArray(attendanceList) || attendanceList.length === 0) {
      return false;
    }
    const todayRecord = attendanceList.find((row) => {
      const rowDate = new Date(row.date).toISOString().split("T")[0];
      return rowDate === today;
    });
    return todayRecord?.clockIn && todayRecord.clockIn !== "";
  }, [attendanceList, today]);

  const hasPunchedOutToday = useMemo(() => {
    if (!Array.isArray(attendanceList) || attendanceList.length === 0) return false;
    const todayRecord = attendanceList.find((row) => {
      const rowDate = new Date(row.date).toISOString().split("T")[0];
      return rowDate === today;
    });
    return todayRecord?.clockOut && todayRecord.clockOut !== "";
  }, [attendanceList, today]);

  // FIXED: User-specific break history for announcement
  const totalTodayBreakMinutes = useMemo(() => {
    if (!userId) return 0;
    const history = getStoredBreakHistory(userId);
    const todayBreaks = history.filter((record) => record.date === today);
    const totalSeconds = todayBreaks.reduce((sum, record) => sum + (record.duration || 0), 0);
    return Math.floor(totalSeconds / 60);
  }, [today, userId]);

  const isAfter630PM = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isAfter = (hours > 17) || (hours === 17 && minutes >= 34);
    return isAfter;
  }, []);

  const forgotPunchIn = !hasPunchedInToday;
  const forgotPunchOut = hasPunchedInToday && !hasPunchedOutToday;
  const excessiveBreaks = totalTodayBreakMinutes > 60;
  const latePunchOut = isAfter630PM && !hasPunchedOutToday;

  const shouldShow = forgotPunchIn || forgotPunchOut || excessiveBreaks || latePunchOut;

  useEffect(() => {
    // FIXED: User-specific hide preference
    const hide = localStorage.getItem(`hideAttendanceAnnouncement_${userId}`) === "true";
    if (hide) {
      setShowAnnouncement(false);
      return;
    }

    setShowAnnouncement(shouldShow);
  }, [forgotPunchIn, forgotPunchOut, excessiveBreaks, latePunchOut, shouldShow, userId]);

  return {
    showAnnouncement,
    setShowAnnouncement,
    hasPunchedIn: hasPunchedInToday,
    hasPunchedOut: hasPunchedOutToday,
    forgotPunchIn,
    forgotPunchOut,
    excessiveBreaks,
    latePunchOut,
    totalBreakMinutes: totalTodayBreakMinutes,
  };
};