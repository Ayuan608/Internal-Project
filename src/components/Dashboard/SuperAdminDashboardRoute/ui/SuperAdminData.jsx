import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const SuperAdminData = ({ view, setView }) => {
  const dispatch = useDispatch();
  const { attendanceList } = useSelector((state) => state.attendance);
  const [currentData, setCurrentData] = useState({
    summary: { daysPresent: 0, hoursWorked: "0h 00m", breaks: "0h 00m", attendance: "0%" },
    records: [],
  });

  const filterDataByView = (data, viewType) => {
    if (!data || data.length === 0) return [];
    const now = new Date();
    let startDate, endDate;
    if (viewType === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }
    return data.filter((item) => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      if (isNaN(itemDate)) return false;
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const parseHoursToMinutes = (timeStr) => {
    if (!timeStr || timeStr === "0h 0m" || !timeStr.includes('h')) return 0;
    try {
      const [hours, minutes] = timeStr.split('h ').map((part) => parseInt(part.replace('m', '')) || 0);
      return hours * 60 + minutes;
    } catch (error) {
      console.error(`Error parsing time string: ${timeStr}`, error);
      return 0;
    }
  };

  const formatMinutesToHours = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  // Function to calculate break duration in minutes - MOVED HERE
  const calculateBreakDuration = (start, end) => {
    if (start && end) {
      try {
        const startTime = new Date(start);
        const endTime = new Date(end);
        if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime()) && endTime > startTime) {
          const durationMs = endTime.getTime() - startTime.getTime();
          return Math.round(durationMs / (1000 * 60)); // Convert to minutes
        }
      } catch (error) {
        console.error("Error calculating break duration:", error);
      }
    }
    return 0;
  };

  // IMPROVED: Calculate total break time from all break types
  const calculateTotalBreakTime = (attendance) => {
    let totalBreakMinutes = 0;

    // Calculate all break types
    totalBreakMinutes += calculateBreakDuration(attendance.smokeStart, attendance.smokeEnd);
    totalBreakMinutes += calculateBreakDuration(attendance.wcStart, attendance.wcEnd);
    totalBreakMinutes += calculateBreakDuration(attendance.breakStart, attendance.breakEnd);
    totalBreakMinutes += calculateBreakDuration(attendance.lunchStart, attendance.lunchEnd);

    // Also check for break history data if available
    if (attendance.breakHistory && Array.isArray(attendance.breakHistory)) {
      attendance.breakHistory.forEach(breakRecord => {
        if (breakRecord.startTime && breakRecord.endTime) {
          totalBreakMinutes += calculateBreakDuration(breakRecord.startTime, breakRecord.endTime);
        } else if (breakRecord.duration) {
          // If duration is already calculated in seconds
          totalBreakMinutes += Math.floor(breakRecord.duration / 60);
        }
      });
    }

    return totalBreakMinutes;
  };

  // NEW: Calculate break time from individual break records
  const calculateBreakTimeFromRecords = (records) => {
    let totalBreakMinutes = 0;

    records.forEach(record => {
      totalBreakMinutes += calculateTotalBreakTime(record);
    });

    return totalBreakMinutes;
  };

  const calculateSummary = (filteredData) => {
    if (!filteredData || filteredData.length === 0) {
      return {
        daysPresent: 0,
        hoursWorked: "0h 00m",
        breaks: "0h 00m",
        attendance: "0%",
      };
    }

    const uniqueDays = new Set(
      filteredData
        .filter((item) => item.clockIn !== null && item.clockIn !== "")
        .map((item) => new Date(item.date).toISOString().split('T')[0])
    );

    const daysPresent = uniqueDays.size;

    // Calculate total worked minutes
    const totalWorkedMinutes = filteredData.reduce(
      (total, item) => total + parseHoursToMinutes(item.workingHours || "0h 0m"),
      0
    );

    // Calculate total break minutes using the improved function
    const totalBreakMinutes = calculateBreakTimeFromRecords(filteredData);

    // Calculate attendance rate
    const totalDaysInPeriod = view === "weekly"
      ? 7
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    const attendanceRate = totalDaysInPeriod > 0
      ? `${Math.round((daysPresent / totalDaysInPeriod) * 100)}%`
      : "0%";

    if (process.env.NODE_ENV !== 'production') {
      console.log("Summary Calculation:", {
        totalRecords: filteredData.length,
        daysPresent,
        totalWorkedMinutes,
        totalBreakMinutes,
        attendanceRate,
        sampleBreakCalculation: filteredData.length > 0 ? calculateTotalBreakTime(filteredData[0]) : 0
      });
    }

    return {
      daysPresent,
      hoursWorked: formatMinutesToHours(totalWorkedMinutes),
      breaks: formatMinutesToHours(totalBreakMinutes),
      attendance: attendanceRate,
    };
  };

  // NEW: Debug function to show break details
  const debugBreakCalculation = (record) => {
    if (!record) return {};

    const breaks = {
      smoke: calculateBreakDuration(record.smokeStart, record.smokeEnd),
      wc: calculateBreakDuration(record.wcStart, record.wcEnd),
      lunch: calculateBreakDuration(record.breakStart, record.breakEnd) || calculateBreakDuration(record.lunchStart, record.lunchEnd),
      total: calculateTotalBreakTime(record)
    };

    return breaks;
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log("Raw attendanceList:", attendanceList);
      console.log("Number of records in attendanceList:", attendanceList?.length || 0);

      if (attendanceList && attendanceList.length > 0) {
        console.log("Sample record break analysis:", debugBreakCalculation(attendanceList[0]));
        console.log("Sample record:", {
          date: attendanceList[0].date,
          smokeStart: attendanceList[0].smokeStart,
          smokeEnd: attendanceList[0].smokeEnd,
          wcStart: attendanceList[0].wcStart,
          wcEnd: attendanceList[0].wcEnd,
          breakStart: attendanceList[0].breakStart,
          breakEnd: attendanceList[0].breakEnd,
          lunchStart: attendanceList[0].lunchStart,
          lunchEnd: attendanceList[0].lunchEnd,
          workingHours: attendanceList[0].workingHours
        });
      }
    }

    if (attendanceList && attendanceList.length > 0) {
      const filteredRecords = filterDataByView(attendanceList, view);

      if (process.env.NODE_ENV !== 'production') {
        console.log(`Filtered ${view} records:`, filteredRecords.length);
        console.log("Filtered record dates:", filteredRecords.map(item => item.date));

        // Debug break calculation for first few records
        filteredRecords.slice(0, 3).forEach((record, index) => {
          console.log(`Record ${index} break details:`, debugBreakCalculation(record));
        });
      }

      const summary = calculateSummary(filteredRecords);

      if (process.env.NODE_ENV !== 'production') {
        console.log("Final Summary:", summary);
      }

      setCurrentData({ summary, records: filteredRecords });
    } else {
      console.log("No attendance data available");
      setCurrentData({
        summary: { daysPresent: 0, hoursWorked: "0h 00m", breaks: "0h 00m", attendance: "0%" },
        records: [],
      });
    }
  }, [attendanceList, view]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-bold">Attendance Summary</h2>
      </div>

      {process.env.NODE_ENV !== 'production' && (
        <div className="text-xs text-gray-400 mb-2">
          Total Records: {attendanceList?.length || 0} | Filtered: {currentData?.records?.length || 0} | View: {view}
          {currentData.records.length > 0 && (
            <div className="mt-1">
              Break Details: Smoke({debugBreakCalculation(currentData.records[0]).smoke}m) +
              WC({debugBreakCalculation(currentData.records[0]).wc}m) +
              Lunch({debugBreakCalculation(currentData.records[0]).lunch}m) =
              Total({debugBreakCalculation(currentData.records[0]).total}m)
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#3b83f60e] rounded-lg shadow-[0_0_10px_black] p-4 border-l-4 border-[var(--box-border)]">
          <p className="text-sm text-white mb-1">TOTAL DAYS PRESENT</p>
          <p className="text-4xl font-bold text-white mb-2">{currentData.summary.daysPresent}</p>
          <p className="text-sm text-gray-500">{view === "weekly" ? "This week" : "This month"}</p>
        </div>
        <div className="bg-[#3b83f60e] rounded-lg shadow-[0_0_10px_black] p-6 border-l-4 border-[var(--box-border)]">
          <p className="text-sm text-white mb-1">TOTAL HOURS WORKED</p>
          <p className="text-4xl font-bold text-white mb-2">{currentData.summary.hoursWorked}</p>
          <p className="text-sm text-gray-500">{view === "weekly" ? "This week" : "This month"}</p>
        </div>
        <div className="bg-[#3b83f60e] rounded-lg shadow-[0_0_10px_black] p-6 border-l-4 border-[var(--box-border)]">
          <p className="text-sm text-white mb-1">TOTAL BREAKS</p>
          <p className="text-4xl font-bold text-white mb-2">{currentData.summary.breaks}</p>
          <p className="text-sm text-gray-500">{view === "weekly" ? "This week" : "This month"}</p>
        </div>
        <div className="bg-[#3b83f60e] rounded-lg shadow-[0_0_10px_black] p-6 border-l-4 border-[var(--box-border)]">
          <p className="text-sm text-white mb-1">ATTENDANCE RATE</p>
          <p className="text-4xl font-bold text-white mb-2">{currentData.summary.attendance}</p>
          <p className="text-sm text-gray-500">Overall performance</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminData;