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

  const calculateBreakTime = (attendance) => {
    let totalBreakMinutes = 0;
    const addBreakMinutes = (start, end) => {
      if (start && end) {
        const startTime = new Date(start);
        const endTime = new Date(end);
        if (!isNaN(startTime) && !isNaN(endTime) && endTime > startTime) {
          return (endTime - startTime) / (1000 * 60);
        }
      }
      return 0;
    };
    totalBreakMinutes += addBreakMinutes(attendance.smokeStart, attendance.smokeEnd);
    totalBreakMinutes += addBreakMinutes(attendance.wcStart, attendance.wcEnd);
    totalBreakMinutes += addBreakMinutes(attendance.breakStart, attendance.breakEnd);
    return Math.round(totalBreakMinutes);
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
        .filter((item) => item.clockIn !== null)
        .map((item) => new Date(item.date).toISOString().split('T')[0])
    );
    const daysPresent = uniqueDays.size;
    const totalWorkedMinutes = filteredData.reduce(
      (total, item) => total + parseHoursToMinutes(item.workingHours),
      0
    );
    const totalBreakMinutes = filteredData.reduce(
      (total, item) => total + calculateBreakTime(item),
      0
    );
    const totalDaysInPeriod =
      view === "weekly" ? 7 : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const attendanceRate = totalDaysInPeriod > 0 ? `${Math.round((daysPresent / totalDaysInPeriod) * 100)}%` : "0%";
    return {
      daysPresent,
      hoursWorked: formatMinutesToHours(totalWorkedMinutes),
      breaks: formatMinutesToHours(totalBreakMinutes),
      attendance: attendanceRate,
    };
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log("Raw attendanceList:", attendanceList);
      console.log("Number of records in attendanceList:", attendanceList?.length || 0);
      console.log("Sample record:", attendanceList?.[0]);
    }
    if (attendanceList && attendanceList.length > 0) {
      const filteredRecords = filterDataByView(attendanceList, view);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Filtered ${view} records:`, filteredRecords);
        console.log(`Number of filtered ${view} records:`, filteredRecords.length);
        console.log("Filtered record dates:", filteredRecords.map(item => item.date));
      }
      const summary = calculateSummary(filteredRecords);
      if (process.env.NODE_ENV !== 'production') {
        console.log("Calculated summary:", summary);
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