// src/components/DailyTimeRecord.jsx
import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Coffee, Lock, GitCompare, FileDown, Info, Eye, List,
  Calendar, Download, Clock, CheckCircle, XCircle, AlertTriangle,
  Filter, ChevronDown, RefreshCw, ExternalLink, Search,
  ChevronLeft, ChevronRight, BarChart3, Users
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import {
  getUserAttendance,
  getTodayBreaks,
  getAttendanceStats
} from '../../../redux/attendenceSlice';
import BreakHistoryChart from './BreakHistoryChart';
import { Link } from "react-router-dom";

// Break Details Modal Component
const BreakDetailsModal = ({
  visible,
  onClose,
  breakHistory,
  breakCounts,
  selectedDate
}) => {
  if (!visible) return null;

  // Fix: Ensure breakHistory is an array
  const safeBreakHistory = Array.isArray(breakHistory) ? breakHistory : [];

  const getBreakTypeIcon = (type) => {
    switch (type) {
      case 'smoke': return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'wc': return <Coffee className="w-4 h-4 text-blue-400" />;
      case 'lunch': return <Coffee className="w-4 h-4 text-emerald-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBreakTypeLabel = (type) => {
    switch (type) {
      case 'smoke': return 'Smoke Break';
      case 'wc': return 'WC Break';
      case 'lunch': return 'Lunch Break';
      default: return 'Break';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '—';
    try {
      return new Date(timeString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return '—';
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '0m';
    try {
      const startTime = new Date(start);
      const endTime = new Date(end);
      const diffMinutes = Math.round((endTime - startTime) / (1000 * 60));

      if (diffMinutes >= 60) {
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        if (minutes > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${hours}h`;
      }

      return `${diffMinutes}m`;
    } catch {
      return '0m';
    }
  };

  const filteredBreaks = selectedDate
    ? safeBreakHistory.filter(b => {
      try {
        if (!b.date) return false;
        const breakDate = new Date(b.date).toDateString();
        const selectedDateStr = new Date(selectedDate).toDateString();
        return breakDate === selectedDateStr;
      } catch {
        return false;
      }
    })
    : safeBreakHistory;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div
        className="absolute inset-0"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-4xl max-h-[90vh] p-6 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-50">
              {selectedDate ? `Break Details - ${new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}` : 'All Break Details'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Complete history of all breaks taken
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <XCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="w-5 h-5 text-amber-400" />
              <span className="text-slate-200 font-medium">Smoke Breaks</span>
            </div>
            <div className="text-2xl font-bold text-slate-50">{breakCounts?.smoke || 0}</div>
            <div className="text-xs text-slate-400">Used / 3 allowed per day</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="w-5 h-5 text-blue-400" />
              <span className="text-slate-200 font-medium">WC Breaks</span>
            </div>
            <div className="text-2xl font-bold text-slate-50">{breakCounts?.wc || 0}</div>
            <div className="text-xs text-slate-400">Used / 3 allowed per day</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-200 font-medium">Lunch Breaks</span>
            </div>
            <div className="text-2xl font-bold text-slate-50">{breakCounts?.lunch || 0}</div>
            <div className="text-xs text-slate-400">Used / 2 allowed per day</div>
          </div>
        </div>

        {/* Chart Component */}
        <div className="mb-6">
          <BreakHistoryChart breakData={filteredBreaks} />
        </div>

        {/* Break History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60">
                <th className="text-left font-medium px-4 py-3 text-slate-300">Date</th>
                <th className="text-left font-medium px-4 py-3 text-slate-300">Type</th>
                <th className="text-left font-medium px-4 py-3 text-slate-300">Start Time</th>
                <th className="text-left font-medium px-4 py-3 text-slate-300">End Time</th>
                <th className="text-left font-medium px-4 py-3 text-slate-300">Duration</th>
                <th className="text-left font-medium px-4 py-3 text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBreaks.length > 0 ? (
                filteredBreaks.map((breakItem, index) => {
                  // Extract break type from the object
                  let breakType = 'unknown';
                  if (breakItem.type) {
                    breakType = breakItem.type;
                  } else if (breakItem.breakType) {
                    breakType = breakItem.breakType;
                  }

                  return (
                    <tr
                      key={index}
                      className="border-b border-slate-800/40 hover:bg-slate-800/20"
                    >
                      <td className="px-4 py-3 text-slate-200">
                        {breakItem.date ? new Date(breakItem.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getBreakTypeIcon(breakType)}
                          <span className="text-slate-200">{getBreakTypeLabel(breakType)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        {formatTime(breakItem.start || breakItem.startTime)}
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        {breakItem.end || breakItem.endTime ? formatTime(breakItem.end || breakItem.endTime) : 'Not Ended'}
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        {calculateDuration(breakItem.start || breakItem.startTime, breakItem.end || breakItem.endTime)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-xs ${(breakItem.end || breakItem.endTime)
                          ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/40'
                          : 'bg-amber-500/20 text-amber-100 border border-amber-400/40'
                          }`}>
                          {(breakItem.end || breakItem.endTime) ? 'Completed' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Coffee className="w-8 h-8 text-slate-600" />
                      <div>No break history found</div>
                      <div className="text-xs text-slate-500">
                        {selectedDate ? 'No breaks taken on this date' : 'Start taking breaks to see history here'}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-medium border border-slate-600 bg-slate-800/80 text-slate-100 hover:bg-slate-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Main DTR Component
export default function DailyTimeRecord() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.data);
  const userId = user?._id;

  // State
  const [view, setView] = useState('weekly');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [selectedDateForBreaks, setSelectedDateForBreaks] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [data, setData] = useState({
    attendanceList: [],
    breakHistory: [],
    stats: {
      totalDaysPresent: 0,
      totalHoursWorked: '0h 00m',
      totalBreaks: '0m 0s',
      attendanceRate: 0,
      scheduledDays: 26
    },
    breakCounts: {
      smoke: 0,
      wc: 0,
      lunch: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get date range based on view
  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;

    if (view === 'weekly') {
      // Start from Monday (0 = Sunday, 1 = Monday)
      const currentDay = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
      startDate = startOfWeek.toISOString().split('T')[0];

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endDate = endOfWeek.toISOString().split('T')[0];
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString().split('T')[0];
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        .toISOString().split('T')[0];
    }

    return { startDate, endDate };
  };

  // Initialize date range
  useEffect(() => {
    const { startDate, endDate } = getDateRange();
    setDateFrom(startDate);
    setDateTo(endDate);
  }, [view]);

  // Fetch DTR data
  const fetchDTRData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch attendance data
      const attendanceResult = await dispatch(getUserAttendance({
        userId,
        startDate: dateFrom,
        endDate: dateTo,
        page: 1,
        limit: 100
      })).unwrap();

      // Calculate break counts from attendance data
      const breakCounts = calculateBreakCounts(attendanceResult.attendance || []);

      // Calculate total breaks time with proper format
      const totalBreaksTime = calculateTotalBreaksTime(attendanceResult.attendance || []);

      // Calculate total hours worked
      const totalHoursWorked = calculateTotalHoursWorked(attendanceResult.attendance || []);

      // Calculate attendance rate
      const attendanceRate = calculateAttendanceRate(
        attendanceResult.attendance || [],
        data.stats.scheduledDays
      );

      // Generate break history from attendance records
      const breakHistory = generateBreakHistory(attendanceResult.attendance || []);

      setData({
        attendanceList: attendanceResult.attendance || [],
        breakHistory: breakHistory,
        stats: {
          ...data.stats,
          totalDaysPresent: (attendanceResult.attendance || []).filter(record =>
            record.clockIn || record.clockOut
          ).length,
          totalHoursWorked: totalHoursWorked,
          totalBreaks: totalBreaksTime,
          attendanceRate: attendanceRate
        },
        breakCounts: breakCounts
      });

    } catch (err) {
      console.error('Error fetching DTR data:', err);
      setError(err.message || 'Failed to load DTR data');
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    if (userId && dateFrom && dateTo) {
      fetchDTRData();
    }
  }, [userId, dateFrom, dateTo]);

  // Helper functions
  const calculateBreakCounts = (attendanceList) => {
    const counts = { smoke: 0, wc: 0, lunch: 0 };

    attendanceList.forEach(record => {
      counts.smoke += record.smokeBreaks?.filter(b => b && b.end).length || 0;
      counts.wc += record.wcBreaks?.filter(b => b && b.end).length || 0;
      counts.lunch += record.lunchBreaks?.filter(b => b && b.end).length || 0;
    });

    return counts;
  };

  const generateBreakHistory = (attendanceList) => {
    const history = [];

    attendanceList.forEach(record => {
      const recordDate = record.date;

      // Process smoke breaks
      if (record.smokeBreaks && Array.isArray(record.smokeBreaks)) {
        record.smokeBreaks.forEach(breakItem => {
          if (breakItem && breakItem.start) {
            history.push({
              date: recordDate,
              type: 'smoke',
              start: breakItem.start,
              end: breakItem.end,
              startTime: breakItem.start,
              endTime: breakItem.end
            });
          }
        });
      }

      // Process WC breaks
      if (record.wcBreaks && Array.isArray(record.wcBreaks)) {
        record.wcBreaks.forEach(breakItem => {
          if (breakItem && breakItem.start) {
            history.push({
              date: recordDate,
              type: 'wc',
              start: breakItem.start,
              end: breakItem.end,
              startTime: breakItem.start,
              endTime: breakItem.end
            });
          }
        });
      }

      // Process lunch breaks
      if (record.lunchBreaks && Array.isArray(record.lunchBreaks)) {
        record.lunchBreaks.forEach(breakItem => {
          if (breakItem && breakItem.start) {
            history.push({
              date: recordDate,
              type: 'lunch',
              start: breakItem.start,
              end: breakItem.end,
              startTime: breakItem.start,
              endTime: breakItem.end
            });
          }
        });
      }
    });

    return history;
  };

  const calculateTotalBreaksTime = (attendanceList) => {
    let totalMinutes = 0;

    attendanceList.forEach(record => {
      // Calculate smoke breaks
      if (record.smokeBreaks && Array.isArray(record.smokeBreaks)) {
        record.smokeBreaks.forEach(breakItem => {
          if (breakItem && breakItem.start && breakItem.end) {
            try {
              const start = new Date(breakItem.start);
              const end = new Date(breakItem.end);
              totalMinutes += Math.round((end - start) / (1000 * 60));
            } catch (e) {
              console.error('Error calculating smoke break duration:', e);
            }
          }
        });
      }

      // Calculate WC breaks
      if (record.wcBreaks && Array.isArray(record.wcBreaks)) {
        record.wcBreaks.forEach(breakItem => {
          if (breakItem && breakItem.start && breakItem.end) {
            try {
              const start = new Date(breakItem.start);
              const end = new Date(breakItem.end);
              totalMinutes += Math.round((end - start) / (1000 * 60));
            } catch (e) {
              console.error('Error calculating WC break duration:', e);
            }
          }
        });
      }

      // Calculate lunch breaks
      if (record.lunchBreaks && Array.isArray(record.lunchBreaks)) {
        record.lunchBreaks.forEach(breakItem => {
          if (breakItem && breakItem.start && breakItem.end) {
            try {
              const start = new Date(breakItem.start);
              const end = new Date(breakItem.end);
              totalMinutes += Math.round((end - start) / (1000 * 60));
            } catch (e) {
              console.error('Error calculating lunch break duration:', e);
            }
          }
        });
      }
    });

    // Format the total time
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      if (minutes > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${hours}h`;
    }

    return `${totalMinutes}m`;
  };

  const calculateTotalHoursWorked = (attendanceList) => {
    let totalMinutes = 0;

    attendanceList.forEach(record => {
      if (record.clockIn && record.clockOut) {
        try {
          const start = new Date(record.clockIn);
          const end = new Date(record.clockOut);
          totalMinutes += Math.round((end - start) / (1000 * 60));
        } catch (e) {
          console.error('Error calculating working hours:', e);
        }
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  const calculateAttendanceRate = (attendanceList, scheduledDays) => {
    const presentDays = attendanceList.filter(record =>
      record.clockIn || record.clockOut
    ).length;

    if (scheduledDays === 0) return 0;

    return Math.round((presentDays / scheduledDays) * 100);
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '-';
    }
  };

  // Get breaks for specific date with proper format
  const getBreaksForDate = (dateStr) => {
    if (!data.attendanceList || data.attendanceList.length === 0) return "0m";

    const record = data.attendanceList.find(
      r => {
        try {
          const recordDate = new Date(r.date).toISOString().split('T')[0];
          return recordDate === dateStr;
        } catch {
          return false;
        }
      }
    );

    if (!record) return "0m";

    let totalMinutes = 0;
    let breakTypes = [];

    // Calculate smoke breaks
    if (record.smokeBreaks && Array.isArray(record.smokeBreaks)) {
      const smokeMinutes = record.smokeBreaks.reduce((sum, breakItem) => {
        if (breakItem && breakItem.start && breakItem.end) {
          try {
            const start = new Date(breakItem.start);
            const end = new Date(breakItem.end);
            return sum + Math.round((end - start) / (1000 * 60));
          } catch {
            return sum;
          }
        }
        return sum;
      }, 0);

      if (smokeMinutes > 0) {
        totalMinutes += smokeMinutes;
        breakTypes.push('Smoke');
      }
    }

    // Calculate WC breaks
    if (record.wcBreaks && Array.isArray(record.wcBreaks)) {
      const wcMinutes = record.wcBreaks.reduce((sum, breakItem) => {
        if (breakItem && breakItem.start && breakItem.end) {
          try {
            const start = new Date(breakItem.start);
            const end = new Date(breakItem.end);
            return sum + Math.round((end - start) / (1000 * 60));
          } catch {
            return sum;
          }
        }
        return sum;
      }, 0);

      if (wcMinutes > 0) {
        totalMinutes += wcMinutes;
        breakTypes.push('WC');
      }
    }

    // Calculate lunch breaks
    if (record.lunchBreaks && Array.isArray(record.lunchBreaks)) {
      const lunchMinutes = record.lunchBreaks.reduce((sum, breakItem) => {
        if (breakItem && breakItem.start && breakItem.end) {
          try {
            const start = new Date(breakItem.start);
            const end = new Date(breakItem.end);
            return sum + Math.round((end - start) / (1000 * 60));
          } catch {
            return sum;
          }
        }
        return sum;
      }, 0);

      if (lunchMinutes > 0) {
        totalMinutes += lunchMinutes;
        breakTypes.push('Lunch');
      }
    }

    // Format the result
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      let result = '';
      if (hours > 0) result += `${hours}h `;
      if (minutes > 0) result += `${minutes}m`;

      if (breakTypes.length > 0) {
        result += ` (${breakTypes.join(' + ')})`;
      }

      return result.trim();
    }

    if (totalMinutes > 0) {
      let result = `${totalMinutes}m`;
      if (breakTypes.length > 0) {
        result += ` (${breakTypes.join(' + ')})`;
      }
      return result;
    }

    return "0m";
  };

  // Get status for attendance record
  const getStatus = (record) => {
    if (!record.clockIn) return 'Missed Punch IN';
    if (!record.clockOut) return 'Missed Punch OUT';

    // Calculate working hours
    try {
      const start = new Date(record.clockIn);
      const end = new Date(record.clockOut);
      const hours = (end - start) / (1000 * 60 * 60);

      if (hours >= 8) return 'Normal';
      if (hours >= 4) return 'Half Day';
      return 'Under Time';
    } catch {
      return 'Normal';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Normal': 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/70',
      'Half Day': 'bg-sky-500/20 text-sky-100 border border-sky-400/70',
      'Under Time': 'bg-amber-500/20 text-amber-100 border border-amber-400/70',
      'Missed Punch IN': 'bg-rose-500/25 text-rose-100 border border-rose-400/70',
      'Missed Punch OUT': 'bg-amber-500/25 text-amber-100 border border-amber-400/70',
      'Absent': 'bg-slate-700/70 text-slate-100 border border-slate-500/80'
    };
    return colors[status] || 'bg-slate-700/70 text-slate-100 border border-slate-500/80';
  };

  // Filter data based on status
  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return data.attendanceList;
    return data.attendanceList.filter(record => getStatus(record) === statusFilter);
  }, [data.attendanceList, statusFilter]);

  // Handle export to Excel
  const handleExport = () => {
    if (data.attendanceList.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      // Prepare data for export
      const exportData = data.attendanceList.map(record => ({
        Date: record.date ? new Date(record.date).toLocaleDateString('en-US') : '-',
        'Punch In': record.clockIn ? formatTime(record.clockIn) : '-',
        'Punch Out': record.clockOut ? formatTime(record.clockOut) : '-',
        'Breaks': getBreaksForDate(new Date(record.date).toISOString().split('T')[0]),
        'Total Hours': record.workingHours || '0h 00m',
        'Status': getStatus(record),
        'Smoke Breaks': record.smokeBreaks?.filter(b => b && b.end).length || 0,
        'WC Breaks': record.wcBreaks?.filter(b => b && b.end).length || 0,
        'Lunch Breaks': record.lunchBreaks?.filter(b => b && b.end).length || 0
      }));

      // Add summary data
      const summaryData = [
        ['DTR SUMMARY REPORT'],
        ['Generated On:', new Date().toLocaleString()],
        ['Total Days Present:', data.stats.totalDaysPresent],
        ['Total Hours Worked:', data.stats.totalHoursWorked],
        ['Total Breaks:', data.stats.totalBreaks],
        ['Attendance Rate:', `${data.stats.attendanceRate}%`],
        ['Scheduled Days:', data.stats.scheduledDays],
        [],
        ['BREAKS SUMMARY'],
        ['Smoke Breaks:', data.breakCounts.smoke],
        ['WC Breaks:', data.breakCounts.wc],
        ['Lunch Breaks:', data.breakCounts.lunch]
      ];

      // Create worksheets
      const wsData = XLSX.utils.json_to_sheet(exportData);
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsData, 'DTR Report');
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      // Generate Excel file
      const fileName = `DTR_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('DTR exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export DTR');
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchDTRData();
    toast.success('Refreshing data...');
  };

  // Handle view break details for specific date
  const handleViewBreakDetails = (date) => {
    setSelectedDateForBreaks(date);
    setShowBreakModal(true);
  };

  // Handle view all break details
  const handleViewAllBreakDetails = () => {
    setSelectedDateForBreaks(null);
    setShowBreakModal(true);
  };

  return (
    <div className="min-h-screen text-slate-200 bg-[#020617] bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.65)_0%,_rgba(2,6,23,1)_65%)]">
      <div className="w-full px-4 py-6 max-w-full mx-auto">
        {/* Page Header */}
        <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Daily Time Record (DTR)
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              View your weekly or monthly attendance summary, breaks and DTR history. Read-only.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 border border-sky-700/70 px-3 py-1.5 text-sky-100">
              <Coffee className="w-3.5 h-3.5" />
              <span>Total Breaks: {data.stats.totalBreaks}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1.5 text-slate-300">
              <Lock className="w-3.5 h-3.5" />
              <span>Read-only · Cannot be edited</span>
            </span>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Top controls row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* View toggle */}
          <div className="inline-flex rounded-xl bg-slate-900/80 border border-slate-700/80 p-1">
            <button
              onClick={() => setView('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'weekly'
                ? 'bg-sky-500 text-white'
                : 'text-slate-300 hover:bg-slate-800/80'
                }`}
            >
              Weekly View
            </button>
            <button
              onClick={() => setView('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'monthly'
                ? 'bg-sky-500 text-white'
                : 'text-slate-300 hover:bg-slate-800/80'
                }`}
            >
              Monthly View
            </button>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 hidden sm:inline">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <span className="text-slate-400 hidden sm:inline">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Status</option>
            <option value="Normal">Normal</option>
            <option value="Halfday">Halfday</option>
            <option value="Undertime">Undertime</option>
            <option value="Suspended">Suspended</option>
            <option value="Overbreak">Overbreak</option>
            <option value="Missed Punch IN">Missed Punch IN</option>
            <option value="Missed Punch OUT">Missed Punch OUT</option>
            <option value="Absent">Absent</option>
          </select>

          {/* Compare weeks */}
          <button className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm border border-slate-700/80 bg-slate-900/80 text-slate-100 hover:bg-slate-800/80 transition">
            <GitCompare className="w-4 h-4" />
            <span className="hidden sm:inline">Compare Weeks</span>
          </button>

          <div className="flex-1"></div>

          {/* Break details + Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewAllBreakDetails}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm border border-violet-500/70 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25 transition"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Break Details</span>
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm border border-emerald-600/70 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25 transition"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Days Present */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-sky-500/30 p-5 hover:border-sky-500/50 transition-colors shadow-lg">
            <p className="text-xs uppercase tracking-wide text-sky-400">
              Total Days Present
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50">
              {data.stats.totalDaysPresent}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Out of <span className="font-medium text-slate-100">{data.stats.scheduledDays}</span> scheduled work days.
            </p>
          </div>

          {/* Total Hours Worked */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-emerald-500/30 p-5 hover:border-emerald-500/50 transition-colors shadow-lg">
            <p className="text-xs uppercase tracking-wide text-emerald-400">
              Total Hours Worked
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50">
              {data.stats.totalHoursWorked}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Based on your punch in / punch out for this period.
            </p>
          </div>

          {/* Total Breaks */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-amber-500/30 p-5 hover:border-amber-500/50 transition-colors shadow-lg">
            <p className="text-xs uppercase tracking-wide text-amber-400">
              Total Breaks
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-50">
              {data.stats.totalBreaks}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Sum of Smoke, WC and Lunch breaks in this selected period.
            </p>
          </div>

          {/* Attendance Rate */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-emerald-500/30 p-5 hover:border-emerald-500/50 transition-colors shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-emerald-400">
                Attendance Rate
              </p>
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/30 w-7 h-7">
                <Eye className="w-4 h-4 text-emerald-300" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-emerald-400">
              {data.stats.attendanceRate}%
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Based on present days vs {data.stats.scheduledDays} scheduled days.
            </p>
          </div>
        </div>

        {/* DTR Table */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900/80 border border-slate-700/60 overflow-hidden shadow-xl">
          {/* Table header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-sky-500/15 to-blue-500/15 text-sky-200 border border-sky-500/40">
                {view === 'weekly' ? 'Weekly DTR – Current Week' : ' Monthly DTR – Current Month'}
              </span>
              <span className="text-xs text-slate-400">
                Showing {filteredData.length} records
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link to={'/user/DayOffRequestsPage'}  className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/60 bg-blue-500/15 px-3 py-1.5 text-xs text-blue-200">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                Leave Data
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/60 bg-violet-500/15 px-3 py-1.5 text-xs text-violet-200">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>
                    Smoke {data.breakCounts.smoke}/3 ·
                    WC {data.breakCounts.wc}/3 ·
                    Lunch {data.breakCounts.lunch}/1
                  </span>
                </span>
              </div>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs border border-slate-600 bg-slate-800/80 text-slate-100 hover:bg-slate-700 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-900/80 to-slate-800/60 text-slate-300 sticky top-0">
                <tr>
                  <th className="text-left font-medium px-5 py-4 border-b border-slate-700">Date</th>
                  <th className="text-left font-medium px-5 py-4 border-b border-slate-700">Punch In</th>
                  <th className="text-left font-medium px-5 py-4 border-b border-slate-700">Breaks</th>
                  <th className="text-left font-medium px-5 py-4 border-b border-slate-700">Punch Out</th>
                  <th className="text-left font-medium px-5 py-4 border-b border-slate-700">Total Hours</th>
                  <th className="text-left font-medium px-5 py-4 border-b border-slate-700">Status</th>
                  <th className="text-left font-medium px-5 py-4 border-b border-slate-700">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-400 mx-auto"></div>
                      <p className="mt-3 text-slate-400">Loading attendance data...</p>
                    </td>
                  </tr>
                ) : !filteredData || filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="w-8 h-8 text-slate-600" />
                        <div>No attendance records found for this period</div>
                        <div className="text-xs text-slate-500">
                          Start working to see attendance records here
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((record, index) => {
                    let recordDate;
                    try {
                      recordDate = new Date(record.date).toISOString().split('T')[0];
                    } catch {
                      recordDate = '';
                    }

                    const status = getStatus(record);
                    const breaksText = getBreaksForDate(recordDate);

                    return (
                      <tr
                        key={record._id || index}
                        className={`border-b border-slate-800/50 hover:bg-slate-800/20 transition ${index % 2 === 0 ? 'bg-slate-900/20' : 'bg-slate-950/40'
                          }`}
                      >
                        <td className="px-5 py-4 text-slate-100 font-medium">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-slate-200 ${!record.clockIn ? 'text-rose-400' : ''}`}>
                            {formatTime(record.clockIn)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300">{breaksText}</span>
                            {breaksText !== "0m" && (
                              <button
                                onClick={() => handleViewBreakDetails(record.date)}
                                className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-slate-200 ${!record.clockOut ? 'text-amber-400' : ''}`}>
                            {formatTime(record.clockOut)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-slate-100 font-semibold">
                            {record.workingHours || '0h 00m'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleViewBreakDetails(record.date)}
                            className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                            title="View Break Details"
                          >
                            <Eye className="w-4 h-4 text-slate-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer line */}
          <div className="px-5 py-3 text-xs text-slate-500 border-t border-slate-800 bg-slate-950/60">
            Showing {filteredData.length} records · {view === 'weekly' ? 'Weekly' : 'Monthly'} view · Date range: {dateFrom} to {dateTo}
          </div>
        </div>

        {/* Footer note */}
        <div className="py-6 text-center text-sm text-slate-500">
          This DTR page is for shows your login time, breaks and basic WFH context.
        </div>

        {/* Info Bar */}
        <div className="border-l-4 border-blue-500 text-slate-200 bg-gradient-to-r from-blue-500/5 to-transparent px-5 py-4 rounded-xl flex items-center gap-3">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-400" />
          <div>
            <p className="text-sm">
              <span className="font-semibold text-blue-300">Information:</span> This is your official Daily Time Record. All entries are automatically recorded by the system and cannot be modified. If you notice any discrepancies, please contact your Team Leader or HR department.
            </p>

          </div>
        </div>
      </div>

      {/* Break Details Modal */}
      <BreakDetailsModal
        visible={showBreakModal}
        onClose={() => {
          setShowBreakModal(false);
          setSelectedDateForBreaks(null);
        }}
        breakHistory={data.breakHistory}
        breakCounts={data.breakCounts}
        selectedDate={selectedDateForBreaks}
      />
    </div>
  );
}