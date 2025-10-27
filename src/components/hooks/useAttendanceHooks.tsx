import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getUserAttendance } from "../../redux/attendenceSlice";
import axios from "axios";

// Constants
const INITIAL_PAGE_SIZE = 10;

// Interfaces
interface BreakCounts {
  smoke: number;
  wc: number;
  lunch: number;
  lastReset: string;
}

interface BreakRecord {
  id?: string;
  userId: string;
  type: "smoke" | "wc" | "lunch";
  startTime: string;
  endTime?: string;
  duration?: number;
  date: string;
}

interface DayOffForm {
  date: string;
  reason: string;
  attachmentType: "medical" | "personal" | "emergency";
}

interface AttendanceRecord {
  _id: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  workingHours?: string;
  smokeStart?: string;
  smokeEnd?: string;
  wcStart?: string;
  wcEnd?: string;
  breakStart?: string;
  breakEnd?: string;
}

interface Stats {
  todayWorkedHours: string;
  todayStatus: string;
  daysWorked: number;
  totalHoursWorked: string;
  avgDailyHours: string;
  overtimeHours: string;
  totalWorkTime: string;
  totalWcBreak: string;
  totalSmokeBreak: string;
  totalLunchBreak: string;
  hasPendingPunchOut: boolean;
  currentStreak: number;
  lastPunchIn: string;
  efficiency: string;
  pieData: Array<{ name: string; value: number }>;
}

interface RootState {
  auth: {
    data?: {
      _id: string;
    };
  };
  attendance: {
    attendanceList: AttendanceRecord[];
    isLoading: boolean;
  };
}

interface Timer {
  type: "smoke" | "wc" | "lunch";
  startTime: Date;
}

interface AttendanceDashboardHook {
  userId: string | undefined;
  attendanceList: AttendanceRecord[];
  isLoading: boolean;
  activeTimer: Timer | null;
  timeLeft: number;
  breakCounts: BreakCounts;
  breakHistory: BreakRecord[];
  showDayOffModal: boolean;
  dayOffForm: DayOffForm;
  error: string | null;
  currentStatus: string;
  stats: Stats;
  isSmokeBreakDisabled: boolean;
  isWcBreakDisabled: boolean;
  isLunchBreakDisabled: boolean;
  handleRefresh: () => void;
  startBreak: (type: "smoke" | "wc" | "lunch") => Promise<void>;
  endBreak: () => Promise<void>;
  setShowDayOffModal: (show: boolean) => void;
  setDayOffForm: (form: DayOffForm) => void;
  handleDayOffSubmit: (e: React.FormEvent) => void;
  formatTime: (seconds: number) => string;
  formatDate: (dateStr: string | undefined) => string;
  formatTimeDisplay: (timeStr: string | undefined) => string;
  calculateBreakTime: (
    start: string | undefined,
    end: string | undefined,
    rowDate: string
  ) => string;
  calculateWcBreakTime: (
    start: string | undefined,
    end: string | undefined,
    rowDate: string
  ) => string;
  calculateLunchBreakTime: (
    start: string | undefined,
    end: string | undefined,
    rowDate: string
  ) => string;
}

// Helper functions for localStorage
const getStoredBreakCounts = (): BreakCounts => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(`breakCounts_${today}`);
  if (stored) {
    return JSON.parse(stored) as BreakCounts;
  }
  return { smoke: 0, wc: 0, lunch: 0, lastReset: today };
};

const setStoredBreakCounts = (counts: BreakCounts): void => {
  const today = new Date().toDateString();
  localStorage.setItem(
    `breakCounts_${today}`,
    JSON.stringify({ ...counts, lastReset: today })
  );
};

const getStoredBreakHistory = (): BreakRecord[] => {
  const stored = localStorage.getItem("breakHistory");
  return stored ? (JSON.parse(stored) as BreakRecord[]) : [];
};

const addToBreakHistory = (breakRecord: BreakRecord): void => {
  const history = getStoredBreakHistory();
  const updatedHistory = [breakRecord, ...history].slice(0, 50);
  localStorage.setItem("breakHistory", JSON.stringify(updatedHistory));
};

// API calls for breaks
const api = axios.create({
  baseURL: "/api",
});

const saveBreakRecord = async (breakRecord: BreakRecord): Promise<unknown> => {
  try {
    const response = await api.post("/attendance/break", breakRecord);
    return response.data;
  } catch (error) {
    console.error("Error saving break record:", error);
    throw error;
  }
};

const fetchBreakRecords = async (
  userId: string,
  date: string
): Promise<BreakRecord[]> => {
  try {
    const response = await api.get(`/attendance/breaks/${userId}?date=${date}`);
    return response.data as BreakRecord[];
  } catch (error) {
    console.error("Error fetching break records:", error);
    return [];
  }
};

export const useAttendanceDashboard = (): AttendanceDashboardHook => {
  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.auth.data?._id);
  const { attendanceList, isLoading } = useSelector(
    (state: RootState) => state.attendance
  );

  // States
  const [activeTimer, setActiveTimer] = useState<Timer | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [breakCounts, setBreakCounts] = useState<BreakCounts>(() =>
    getStoredBreakCounts()
  );
  const [breakHistory, setBreakHistory] = useState<BreakRecord[]>(() =>
    getStoredBreakHistory()
  );
  const [showDayOffModal, setShowDayOffModal] = useState<boolean>(false);
  const [dayOffForm, setDayOffForm] = useState<DayOffForm>({
    date: "",
    reason: "",
    attachmentType: "medical",
  });
  const [error, setError] = useState<string | null>(null);

  // Load break counts and history from backend
  const loadBreakData = useCallback(async () => {
    if (!userId) return;
    const today = new Date().toISOString().split("T")[0];
    try {
      const breaks = await fetchBreakRecords(userId, today);
      const counts: BreakCounts = {
        smoke: 0,
        wc: 0,
        lunch: 0,
        lastReset: today,
      };
      breaks.forEach((record: BreakRecord) => {
        if (record.type === "smoke") counts.smoke++;
        else if (record.type === "wc") counts.wc++;
        else if (record.type === "lunch") counts.lunch++;
      });
      setBreakCounts(counts);
      setStoredBreakCounts(counts);
      setBreakHistory(breaks);
      addToBreakHistory(
        breaks[0] || { userId, type: "smoke", startTime: "", date: today }
      );
    } catch (err) {
      console.error("Failed to load break data, using localStorage", err);
      setBreakCounts(getStoredBreakCounts());
      setBreakHistory(getStoredBreakHistory());
    }
  }, [userId]);

  // Check and reset break counts daily
  useEffect(() => {
    const today = new Date().toDateString();
    if (breakCounts.lastReset !== today) {
      const resetCounts: BreakCounts = {
        smoke: 0,
        wc: 0,
        lunch: 0,
        lastReset: today,
      };
      setBreakCounts(resetCounts);
      setStoredBreakCounts(resetCounts);
    }
  }, [breakCounts.lastReset]);

  // Load attendance and break data on mount
  useEffect(() => {
    const loadData = async () => {
      setError(null);
      if (!userId) return;
      try {
        await dispatch(
          (getUserAttendance as any)({
            userId,
            page: 1,
            limit: INITIAL_PAGE_SIZE,
          })
        ).unwrap();
        await loadBreakData();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
    };
    loadData();
  }, [dispatch, userId, loadBreakData]);

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
  }, [activeTimer]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check punch status
  const hasPunchedOutToday = useMemo(() => {
    if (!Array.isArray(attendanceList) || attendanceList.length === 0)
      return false;
    const today = new Date().toISOString().split("T")[0];
    const todayRecord = attendanceList.find((row) => {
      const rowDate = new Date(row.date).toISOString().split("T")[0];
      return rowDate === today;
    });
    return todayRecord?.clockOut !== undefined;
  }, [attendanceList]);

  const hasPunchedInToday = useMemo(() => {
    if (!Array.isArray(attendanceList) || attendanceList.length === 0)
      return false;
    const today = new Date().toISOString().split("T")[0];
    const todayRecord = attendanceList.find((row) => {
      const rowDate = new Date(row.date).toISOString().split("T")[0];
      return rowDate === today;
    });
    return todayRecord?.clockIn !== undefined;
  }, [attendanceList]);

  const currentStatus = useMemo(() => {
    if (hasPunchedOutToday) return "Punched Out";
    if (activeTimer)
      return `On ${
        activeTimer.type.charAt(0).toUpperCase() + activeTimer.type.slice(1)
      } Break`;
    if (hasPunchedInToday) return "Currently Working";
    return "Ready";
  }, [hasPunchedOutToday, activeTimer, hasPunchedInToday]);

  // Start break
  const startBreak = async (type: "smoke" | "wc" | "lunch"): Promise<void> => {
    if (hasPunchedOutToday) {
      alert(
        "You have already punched out for today. Breaks are not allowed after punch out."
      );
      return;
    }
    if (!hasPunchedInToday) {
      alert("Please punch in first before taking a break.");
      return;
    }
    const limits: { [key: string]: number } = { smoke: 3, wc: 3, lunch: 1 };
    if (breakCounts[type] >= limits[type]) {
      alert(`Maximum ${type} breaks (${limits[type]}) reached for today!`);
      return;
    }
    if (activeTimer) {
      alert(`Please finish your ${activeTimer.type} break first!`);
      return;
    }
    const duration = type === "lunch" ? 3600 : 300;
    const newTimer: Timer = { type, startTime: new Date() };
    setActiveTimer(newTimer);
    setTimeLeft(duration);

    const today = new Date().toISOString().split("T")[0];
    const breakRecord: BreakRecord = {
      userId: userId!,
      type,
      startTime: newTimer.startTime.toISOString(),
      date: today,
    };

    try {
      await saveBreakRecord(breakRecord);
    } catch (err) {
      console.error("Failed to save break start:", err);
      addToBreakHistory({ ...breakRecord, id: Date.now().toString() });
      setBreakHistory(getStoredBreakHistory());
    }
  };

  // End break
  const endBreak = async (): Promise<void> => {
    if (!activeTimer) return;
    const breakType = activeTimer.type;
    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - activeTimer.startTime.getTime()) / 1000
    );

    const breakRecord: BreakRecord = {
      userId: userId!,
      type: breakType,
      startTime: activeTimer.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      date: new Date().toISOString().split("T")[0],
    };

    setBreakCounts((prev) => {
      const newCounts: BreakCounts = {
        ...prev,
        [breakType]: prev[breakType] + 1,
      };
      setStoredBreakCounts(newCounts);
      return newCounts;
    });

    try {
      await saveBreakRecord(breakRecord);
      const updatedBreaks = await fetchBreakRecords(userId!, breakRecord.date);
      setBreakHistory(updatedBreaks);
    } catch (err) {
      console.error("Failed to save break end:", err);
      addToBreakHistory({ ...breakRecord, id: Date.now().toString() });
      setBreakHistory(getStoredBreakHistory());
    }

    setActiveTimer(null);
    setTimeLeft(300);
  };

  // Calculate break time from history
  const calculateBreakTimeFromHistory = (
    rowDate: string,
    breakType: "smoke" | "wc" | "lunch"
  ): string => {
    const dateBreaks = breakHistory.filter(
      (record) => record.date === rowDate && record.type === breakType
    );
    if (dateBreaks.length > 0) {
      const totalSeconds = dateBreaks.reduce(
        (total, record) => total + (record.duration || 0),
        0
      );
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}m ${seconds}s`;
    }
    return "-";
  };

  // Break time calculations
  const calculateBreakTime = (
    start: string | undefined,
    end: string | undefined,
    rowDate: string
  ): string => {
    if (!start || !end) return calculateBreakTimeFromHistory(rowDate, "smoke");
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return calculateBreakTimeFromHistory(rowDate, "smoke");
      }
      const diff = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60)
      );
      return `${diff} min`;
    } catch {
      return calculateBreakTimeFromHistory(rowDate, "smoke");
    }
  };

  const calculateWcBreakTime = (
    start: string | undefined,
    end: string | undefined,
    rowDate: string
  ): string => {
    if (!start || !end) return calculateBreakTimeFromHistory(rowDate, "wc");
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return calculateBreakTimeFromHistory(rowDate, "wc");
      }
      const diff = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60)
      );
      return `${diff} min`;
    } catch {
      return calculateBreakTimeFromHistory(rowDate, "wc");
    }
  };

  const calculateLunchBreakTime = (
    start: string | undefined,
    end: string | undefined,
    rowDate: string
  ): string => {
    if (!start || !end) return calculateBreakTimeFromHistory(rowDate, "lunch");
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return calculateBreakTimeFromHistory(rowDate, "lunch");
      }
      const diff = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60)
      );
      return `${diff} min`;
    } catch {
      return calculateBreakTimeFromHistory(rowDate, "lunch");
    }
  };

  // Handle day off request
  const handleDayOffSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!dayOffForm.date || !dayOffForm.reason) {
      alert("Please fill in all required fields");
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
        ...(localStorage.getItem("dayOffRequests")
          ? JSON.parse(localStorage.getItem("dayOffRequests")!)
          : []),
      ])
    );
    alert("Day off request submitted successfully!");
    setDayOffForm({ date: "", reason: "", attachmentType: "medical" });
    setShowDayOffModal(false);
  };

  // Real-time statistics
  const stats = useMemo<Stats>(() => {
    if (!Array.isArray(attendanceList) || attendanceList.length === 0) {
      return {
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
    }

    let totalWorkMinutes = 0;
    let totalWcMinutes = 0;
    let totalSmokeMinutes = 0;
    let totalLunchMinutes = 0;
    let pendingPunchOutToday = false;
    let daysWithWork = 0;
    let todayWorkMinutes = 0;
    const today = new Date().toISOString().split("T")[0];
    let lastPunchInTime: Date | null = null;
    let consecutiveDays = 0;
    const last7Days = new Set<string>();

    attendanceList.forEach((row: AttendanceRecord) => {
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
            (new Date(row.smokeEnd).getTime() -
              new Date(row.smokeStart).getTime()) /
              (1000 * 60)
          );
          totalSmokeMinutes += diff;
        } catch {}
      }
      if (row.wcStart && row.wcEnd) {
        try {
          const diff = Math.floor(
            (new Date(row.wcEnd).getTime() - new Date(row.wcStart).getTime()) /
              (1000 * 60)
          );
          totalWcMinutes += diff;
        } catch {}
      }
      if (row.breakStart && row.breakEnd) {
        try {
          const diff = Math.floor(
            (new Date(row.breakEnd).getTime() -
              new Date(row.breakStart).getTime()) /
              (1000 * 60)
          );
          totalLunchMinutes += diff;
        } catch {}
      }

      if (!row.clockOut && rowDate === today) pendingPunchOutToday = true;
      if (
        row.clockIn &&
        (!lastPunchInTime || new Date(row.clockIn) > lastPunchInTime)
      ) {
        lastPunchInTime = new Date(row.clockIn);
      }
      last7Days.add(rowDate);
    });

    breakHistory.forEach((record: BreakRecord) => {
      if (record.date === today) {
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

    const formatTime = (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins.toString().padStart(2, "0")}m`;
    };

    const formatShortTime = (minutes: number): string => {
      const hours = (minutes / 60).toFixed(1);
      return `${hours}h`;
    };

    const avgDailyMinutes =
      daysWithWork > 0 ? totalWorkMinutes / daysWithWork : 0;
    const standardHoursPerDay = 8 * 60;
    const overtimeMinutes = Math.max(
      0,
      totalWorkMinutes - daysWithWork * standardHoursPerDay
    );
    const totalBreakMinutes =
      totalWcMinutes + totalSmokeMinutes + totalLunchMinutes;
    const totalAvailableMinutes = totalWorkMinutes + totalBreakMinutes;
    const efficiency =
      totalAvailableMinutes > 0
        ? Math.round((totalWorkMinutes / totalAvailableMinutes) * 100)
        : 0;

    let todayStatus = "No work today";
    if (todayWorkMinutes > 0) {
      if (pendingPunchOutToday) todayStatus = "Working...";
      else if (todayWorkMinutes >= standardHoursPerDay)
        todayStatus = "Completed";
      else todayStatus = "Partial";
    }

    const lastPunchInFormatted = lastPunchInTime
      ? new Date(lastPunchInTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
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

  const handleRefresh = (): void => {
    loadBreakData();
    dispatch((getUserAttendance as any)({ userId, page: 1, limit: INITIAL_PAGE_SIZE }));
  };

  const formatDate = (dateStr: string | undefined): string => {
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
  };

  const formatTimeDisplay = (timeStr: string | undefined): string => {
    if (!timeStr) return "-";
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "-";
    }
  };

  const isSmokeBreakDisabled =
    activeTimer !== null ||
    breakCounts.smoke >= 3 ||
    hasPunchedOutToday ||
    !hasPunchedInToday;
  const isWcBreakDisabled =
    activeTimer !== null ||
    breakCounts.wc >= 3 ||
    hasPunchedOutToday ||
    !hasPunchedInToday;
  const isLunchBreakDisabled =
    activeTimer !== null ||
    breakCounts.lunch >= 1 ||
    hasPunchedOutToday ||
    !hasPunchedInToday;

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
