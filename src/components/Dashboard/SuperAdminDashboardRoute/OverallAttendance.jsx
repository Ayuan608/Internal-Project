import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Download,
  Search,
  BarChart3,
  Grid3x3,
  List,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Eye,
  EyeOff,
  Target,
  Coffee,
  Activity,
  Wifi,
  Battery,
  UserCheck,
  LogOut
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import html2canvas from "html2canvas";
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../../../redux/attendenceSlice';
import AttendanceDashboard from '../TeamLeaderDashboard/RestDay';
import ManpowerStatusSection from './ManpowerStatusSection';

const COLORS = {
  present: '#10B981',
  absent: '#EF4444',
  late: '#F59E0B',
  leave: '#8B5CF6',
  halfDay: '#EC4899',
  overbreak: '#06B6D4',
  working: '#10B981',
  onBreak: '#F59E0B'
};

const departments = [
  { label: "CSR Department", value: "CSR" },
  { label: "Deposit Department", value: "Deposit" },
  { label: "Withdraw Department", value: "Withdraw" },
  { label: "Marketing Department", value: "Marketing" }
];

const OverallAttendanceDashboard = () => {
  const popupRef = useRef();
  const [viewMode, setViewMode] = useState('analytics');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCharts, setShowCharts] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const dispatch = useDispatch();
  const { allAttendance, isLoading, pagination, stats: checkerStats } = useSelector((state) => state.attendance);

  // Fetch data on mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        // Fetch detailed attendance
        await dispatch(getAllAttendance({
          startDate: startDate || today,
          endDate: endDate || today,
          department: selectedDept !== 'All' ? selectedDept : undefined,
          page: 1,
          limit: 100
        })).unwrap();
      } catch (error) {
        console.error('Failed to fetch attendance data:', error);
      }
    };
    fetchData();
  }, [dispatch, startDate, endDate, selectedDept]);
  useEffect(() => {
    if (viewMode !== "manpower") {
      const today = new Date().toISOString().split("T")[0];

      dispatch(getAllAttendance({
        startDate: startDate || today,
        endDate: endDate || today,
        department: selectedDept !== "All" ? selectedDept : undefined,
        page: 1,
        limit: 100
      }));
    }
  }, [viewMode]);

  const downloadCard = async () => {
    const card = popupRef.current;
    const canvas = await html2canvas(card, { scale: 3 });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `attendance_${selectedCard.user?.FullName}_${selectedCard._id}.png`;
    link.click();
  };

  const statuses = useMemo(() => {
    const backendStatuses = new Set(allAttendance?.map(item => item.alert).filter(Boolean));
    const staticStatuses = [
      "Missed Punch-In",
      "Missed Punch-Out",
      "Late Arrival",
      "Early Leave",
      "System Error",
      "Work-error",
      "Other"
    ];
    return ["All", ...new Set([...backendStatuses, ...staticStatuses])];
  }, [allAttendance]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    if (!allAttendance) return [];
    return allAttendance.filter(emp => {
      const matchesSearch = emp.user?.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp._id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'All' || emp.user?.department === selectedDept;
      const matchesStatus = selectedStatus === 'All' || emp.alert === selectedStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [allAttendance, searchTerm, selectedDept, selectedStatus]);

  const weeklyTrendData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      present: Math.floor(Math.random() * 30) + 60,
      absent: Math.floor(Math.random() * 10) + 5,
      late: Math.floor(Math.random() * 8) + 2,
      onTime: Math.floor(Math.random() * 25) + 50,
    }));
  }, []);

  // Department-wise analytics from filtered data
  const deptAnalytics = useMemo(() => {
    return departments.slice(1).map(dept => {
      const deptEmps = allAttendance?.filter(e => e.user?.department === dept) || [];
      const present = deptEmps.filter(e => e.alert === 'Present' || e.alert === 'Normal').length;
      const absent = deptEmps.filter(e => e.alert === 'Absent').length;
      const late = deptEmps.filter(e => e.alert === 'Late').length;

      return {
        name: dept,
        total: deptEmps.length,
        present,
        absent,
        late,
      };
    });
  }, [allAttendance, departments]);

  // Calculate statistics for LIVE DASHBOARD (like in image)
  const liveDashboardStats = useMemo(() => {
    if (!allAttendance || allAttendance.length === 0) {
      return {
        totalStaff: 0,
        working: 0,
        onBreak: 0,
        leave: 0,
        absent: 0,
        onlineRate: '0%',
        avgNetWork: '00:00:00',
        avgBreakUsed: '00:00:00',
        lateArrivals: 0,
        missedPunches: 0,
        dayOffTaken: 0,
        activeWorkforce: '0%',
        breakUtilization: '0%',
        attendanceRate: '0%',
        totalWorkHours: '0h',
        totalBreakHours: '0h',
        avgSessionTime: '00:00:00'
      };
    }

    const totalStaff = allAttendance.length;
    const working = allAttendance.filter(a =>
      a.status === 'Work' || a.alert === 'Present' || a.alert === 'Normal'
    ).length;
    const onBreak = allAttendance.filter(a =>
      a.status === 'Break' || (a.breakUsed && a.breakUsed !== '00:00:00' && a.breakUsed !== '000000')
    ).length;
    const leave = allAttendance.filter(a =>
      a.status === 'Leave' || a.alert === 'Leave'
    ).length;
    const absent = allAttendance.filter(a =>
      a.status === 'Absent' || a.alert === 'Absent' || (!a.clockIn && !a.clockOut)
    ).length;

    // Calculate late arrivals
    const lateArrivals = allAttendance.filter(a => {
      if (!a.clockIn) return false;
      const clockIn = new Date(a.clockIn);
      const hour = clockIn.getHours();
      const minute = clockIn.getMinutes();
      return hour > 9 || (hour === 9 && minute > 30);
    }).length;

    // Count missed punches
    const missedPunches = allAttendance.filter(a => {
      return (!a.clockIn && a.clockOut) ||
        (a.clockIn && !a.clockOut) ||
        a.alert === 'Missed Punch-In' ||
        a.alert === 'Missed Punch-Out';
    }).length;

    // Calculate work hours and break hours
    let totalWorkSeconds = 0;
    let totalBreakSeconds = 0;
    let workingCount = 0;

    allAttendance.forEach(a => {
      // Calculate net work time
      if (a.netWork && a.netWork !== '000000') {
        const timeStr = a.netWork.length === 6 ?
          `${a.netWork.substr(0, 2)}:${a.netWork.substr(2, 2)}:${a.netWork.substr(4, 2)}` :
          a.netWork;
        const [h, m, s] = timeStr.split(':').map(Number);
        totalWorkSeconds += (h * 3600 + m * 60 + s);
      }

      // Calculate break time
      if (a.breakUsed && a.breakUsed !== '000000') {
        const breakStr = a.breakUsed.length === 6 ?
          `${a.breakUsed.substr(0, 2)}:${a.breakUsed.substr(2, 2)}:${a.breakUsed.substr(4, 2)}` :
          a.breakUsed;
        const [h, m, s] = breakStr.split(':').map(Number);
        totalBreakSeconds += (h * 3600 + m * 60 + s);
      }

      if (a.status === 'Work' || a.alert === 'Present') {
        workingCount++;
      }
    });

    // Format time function
    const formatSeconds = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Calculate averages
    const avgNetWork = workingCount > 0 ? formatSeconds(totalWorkSeconds / workingCount) : '00:00:00';
    const avgBreakUsed = totalStaff > 0 ? formatSeconds(totalBreakSeconds / totalStaff) : '00:00:00';

    // Calculate percentages
    const onlineRate = totalStaff > 0 ?
      ((working - leave) / (totalStaff - leave) * 100).toFixed(1) : 0;

    const activeWorkforce = totalStaff > 0 ?
      Math.round((working / totalStaff) * 100) : 0;

    const breakUtilization = totalStaff > 0 ?
      Math.round((onBreak / totalStaff) * 100) : 0;

    const attendanceRate = totalStaff > 0 ?
      Math.round(((totalStaff - absent) / totalStaff) * 100) : 0;

    return {
      totalStaff,
      working,
      onBreak,
      leave,
      absent,
      onlineRate: `${onlineRate}%`,
      avgNetWork,
      avgBreakUsed,
      totalWorkHours: `${Math.floor(totalWorkSeconds / 3600)}h`,
      totalBreakHours: `${Math.floor(totalBreakSeconds / 3600)}h`,
      lateArrivals,
      missedPunches,
      dayOffTaken: leave,
      activeWorkforce: `${activeWorkforce}%`,
      breakUtilization: `${breakUtilization}%`,
      attendanceRate: `${attendanceRate}%`,
      avgSessionTime: avgNetWork
    };
  }, [allAttendance]);

  // Calculate statistics for original dashboard
  const stats = useMemo(() => {
    if (!allAttendance || allAttendance.length === 0) {
      return { total: 0, present: 0, absent: 0, late: 0, onTime: 0, avgHours: '0.00', attendanceRate: '0' };
    }

    const total = allAttendance.length;
    const present = allAttendance.filter(e => e.alert === 'Present' || e.alert === 'Normal').length;
    const absent = allAttendance.filter(e => e.alert === 'Absent').length;
    const late = allAttendance.filter(e => e.alert === 'Late').length;
    const onTime = present - late;
    const avgHours = (allAttendance.reduce((acc, e) => {
      const hours = parseFloat(e.workingHours) || 0;
      return acc + hours;
    }, 0) / total).toFixed(2);

    return {
      total,
      present,
      absent,
      late,
      onTime,
      avgHours,
      attendanceRate: ((present / total) * 100).toFixed(1)
    };
  }, [allAttendance]);

  // Working hours distribution
  const hoursDistribution = useMemo(() => {
    if (!allAttendance) return [];
    return [
      {
        range: '0-4h', count: allAttendance.filter(e => {
          const hours = parseFloat(e.workingHours) || 0;
          return hours >= 0 && hours < 4;
        }).length
      },
      {
        range: '4-6h', count: allAttendance.filter(e => {
          const hours = parseFloat(e.workingHours) || 0;
          return hours >= 4 && hours < 6;
        }).length
      },
      {
        range: '6-8h', count: allAttendance.filter(e => {
          const hours = parseFloat(e.workingHours) || 0;
          return hours >= 6 && hours < 8;
        }).length
      },
      {
        range: '8-9h', count: allAttendance.filter(e => {
          const hours = parseFloat(e.workingHours) || 0;
          return hours >= 8 && hours < 9;
        }).length
      },
      {
        range: '9h+', count: allAttendance.filter(e => {
          const hours = parseFloat(e.workingHours) || 0;
          return hours >= 9;
        }).length
      },
    ];
  }, [allAttendance]);

  // Punch in time distribution
  const punchDistribution = useMemo(() => {
    if (!allAttendance) return [];
    return [
      {
        time: '08:00-08:30', count: allAttendance.filter(e => {
          if (!e.clockIn) return false;
          const hour = new Date(e.clockIn).getHours();
          const min = new Date(e.clockIn).getMinutes();
          return hour === 8 && min < 30;
        }).length
      },
      {
        time: '08:30-09:00', count: allAttendance.filter(e => {
          if (!e.clockIn) return false;
          const hour = new Date(e.clockIn).getHours();
          const min = new Date(e.clockIn).getMinutes();
          return (hour === 8 && min >= 30) || (hour === 9 && min < 0);
        }).length
      },
      {
        time: '09:00-09:30', count: allAttendance.filter(e => {
          if (!e.clockIn) return false;
          const hour = new Date(e.clockIn).getHours();
          const min = new Date(e.clockIn).getMinutes();
          return hour === 9 && min < 30;
        }).length
      },
      {
        time: '09:30+', count: allAttendance.filter(e => {
          if (!e.clockIn) return false;
          const hour = new Date(e.clockIn).getHours();
          const min = new Date(e.clockIn).getMinutes();
          return hour >= 9 && min >= 30;
        }).length
      },
    ];
  }, [allAttendance]);

  // Break time analysis
  const calculateDynamicStatus = (row) => {
    const clockIn = row.clockIn ? new Date(row.clockIn) : null;
    const clockOut = row.clockOut ? new Date(row.clockOut) : null;

    if (!clockIn && !clockOut) return "Absent";

    if (!clockIn) return "Missed Punch-In";

    if (!clockOut) return "Missed Punch-Out";

    // Late arrival logic → After 9:30 AM
    const lateLimit = new Date(row.date);
    lateLimit.setHours(9, 30, 0, 0);
    if (clockIn > lateLimit) return "Late Arrival";

    // Early Leave logic (example: before 6 PM)
    const shiftEnd = new Date(row.date);
    shiftEnd.setHours(18, 0, 0, 0);
    if (clockOut < shiftEnd) return "Early Leave";

    return row.alert || "Normal";
  };

  const getStatusColor = (status) => {
    const styles = {
      "Normal": "bg-emerald-900/40 border border-emerald-700 text-emerald-300",
      "Missed Punch-Out": "bg-orange-900/40 border border-orange-700 text-orange-300",
      "No Punch Out": "bg-orange-900/40 border border-orange-700 text-orange-300",
      "Missed Punch-In": "bg-red-900/40 border border-red-700 text-red-300",
      "Late Arrival": "bg-yellow-900/40 border border-yellow-700 text-yellow-300",
      "Early Leave": "bg-amber-900/40 border border-amber-700 text-amber-300",
      "System Error": "bg-purple-900/40 border border-purple-700 text-purple-300",
      "Work-error": "bg-indigo-900/40 border border-indigo-700 text-indigo-300",
      "Other": "bg-gray-900/40 border border-gray-700 text-gray-300",
      "Work": "bg-emerald-900/40 border border-emerald-700 text-emerald-300",
      "Break": "bg-amber-900/40 border border-amber-700 text-amber-300",
      "Leave": "bg-purple-900/40 border border-purple-700 text-purple-300",
      "Absent": "bg-red-900/40 border border-red-700 text-red-300"
    };

    return styles[status] || "bg-gray-900/40 border border-gray-700 text-gray-300";
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Department', 'Date', 'Punch In', 'Punch Out', 'Hours', 'Status', 'Shift'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row =>
        `"${row._id}","${row.user?.FullName}","${row.user?.department}","${new Date(row.date).toLocaleDateString()}","${row.clockIn ? new Date(row.clockIn).toLocaleTimeString() : '-'}","${row.clockOut ? new Date(row.clockOut).toLocaleTimeString() : '-'}","${row.workingHours}","${row.alert}","${row.shift}"`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDept('All');
    setSelectedStatus('All');
    setStartDate('');
    setEndDate('');
  };

  // Refresh data
  const refreshData = () => {
    const today = new Date().toISOString().split('T')[0];
    dispatch(getCheckerStats({
      startDate: today,
      endDate: today,
      department: selectedDept !== 'All' ? selectedDept : undefined
    }));
    dispatch(getAllAttendance({
      startDate: startDate || today,
      endDate: endDate || today,
      department: selectedDept !== 'All' ? selectedDept : undefined,
      page: 1,
      limit: 100
    }));
  };

  const radarData = useMemo(() => {
    if (!allAttendance || allAttendance.length === 0) return [];

    const total = allAttendance.length;
    const present = allAttendance.filter(e => e.alert === 'Present' || e.alert === 'Normal').length;
    const onTime = allAttendance.filter(e => {
      if (!e.clockIn) return false;
      const t = new Date(e.clockIn);
      return t.getHours() < 9 || (t.getHours() === 9 && t.getMinutes() < 30);
    }).length;
    const avgHours = allAttendance.reduce(
      (acc, e) => acc + (parseFloat(e.workingHours) || 0),
      0
    ) / total;

    return [
      { metric: 'Attendance', value: (present / total) * 100, fullMark: 100 },
      { metric: 'Punctuality', value: (onTime / total) * 100, fullMark: 100 },
      { metric: 'Avg Hours', value: (avgHours / 9) * 100, fullMark: 100 },
      { metric: 'Consistency', value: 82, fullMark: 100 },
      { metric: 'Compliance', value: 93, fullMark: 100 },
    ];
  }, [allAttendance]);

  const CardRow = ({ label, value }) => (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-200">{value}</span>
    </div>
  );

  // Format time for display
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr || timeStr === '000000') return '00:00:00';
    if (timeStr.length === 6) {
      return `${timeStr.substr(0, 2)}:${timeStr.substr(2, 2)}:${timeStr.substr(4, 2)}`;
    }
    return timeStr;
  };

  // Calculate break left (assuming 2 hours total break)
  const calculateBreakLeft = (breakUsed) => {
    const totalBreakSeconds = 2 * 3600; // 2 hours

    if (breakUsed && breakUsed !== '000000') {
      const [h, m, s] = formatTimeDisplay(breakUsed).split(':').map(Number);
      const usedSeconds = h * 3600 + m * 60 + s;
      const leftSeconds = Math.max(0, totalBreakSeconds - usedSeconds);

      const leftH = Math.floor(leftSeconds / 3600);
      const leftM = Math.floor((leftSeconds % 3600) / 60);
      const leftS = leftSeconds % 60;

      return `${leftH.toString().padStart(2, '0')}:${leftM.toString().padStart(2, '0')}:${leftS.toString().padStart(2, '0')}`;
    }

    return '02:00:00';
  };

  return (
    <div className="min-h-screen text-white p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Attendance Dashboard</h1>
            <p className="text-blue-300">Real-time employee tracking & analytics</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${viewMode === 'analytics' ? 'bg-blue-600 text-white' : 'bg-[rgba(59,130,246,0.03)] border border-slate-800/30 text-gray-300 hover:bg-slate-700'}`}
            >
              <BarChart3 size={18} />
              Analytics
            </button>
            <button
              onClick={() => setViewMode('manpower')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${viewMode === 'manpower' ? 'bg-blue-600 text-white' : 'bg-[rgba(59,130,246,0.03)] border border-slate-800/30 text-gray-300 hover:bg-slate-700'}`}
            >
              <Users size={18} />
              ManPower
            </button>
            <button
              onClick={() => setViewMode('live')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${viewMode === 'live'
                ? 'bg-green-600 text-white'
                : 'bg-[rgba(34,197,94,0.15)] border border-slate-800/30 text-gray-300 hover:bg-green-900/30'
                }`}
            >
              <Activity size={18} />
              Live Dashboard
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-[rgba(59,130,246,0.03)] border border-slate-800/30 text-gray-300 hover:bg-slate-700'}`}
            >
              <List size={18} />
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-[rgba(59,130,246,0.03)] border border-slate-800/30 text-gray-300 hover:bg-slate-700'}`}
            >
              <Grid3x3 size={18} />
              Cards
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${viewMode === 'dashboard'
                ? 'bg-purple-600 text-white'
                : 'bg-[rgba(128,90,213,0.15)] border border-slate-800/30 text-gray-300 hover:bg-purple-900/30'
                }`}
            >
              <Grid3x3 size={18} />
              Dashboard
            </button>
          </div>
        </div>

        {/* LIVE DASHBOARD VIEW - EXACTLY LIKE IMAGE */}
        {viewMode === 'live' && (
          <div className="space-y-6">
            {/* Live Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* TOTAL STAFF */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 rounded-xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-300 mb-1">TOTAL STAFF</p>
                    <p className="text-3xl font-bold text-white">{liveDashboardStats.totalStaff}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-400">All registered agents</p>
              </div>

              {/* WORKING */}
              <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-emerald-300 mb-1">WORKING</p>
                    <p className="text-3xl font-bold text-emerald-100">{liveDashboardStats.working}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <p className="text-xs text-emerald-400">Currently on duty</p>
              </div>

              {/* ON BREAK */}
              <div className="bg-gradient-to-br from-amber-900/40 to-amber-900/10 border border-amber-500/30 rounded-xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-amber-300 mb-1">ON BREAK</p>
                    <p className="text-3xl font-bold text-amber-100">{liveDashboardStats.onBreak}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Coffee className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <p className="text-xs text-amber-400">Any break type</p>
              </div>

              {/* LEAVE */}
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/10 border border-purple-500/30 rounded-xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-purple-300 mb-1">LEAVE</p>
                    <p className="text-3xl font-bold text-purple-100">{liveDashboardStats.leave}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <p className="text-xs text-purple-400">Approved leave today</p>
              </div>

              {/* ABSENT */}
              <div className="bg-gradient-to-br from-red-900/40 to-red-900/10 border border-red-500/30 rounded-xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-red-300 mb-1">ABSENT</p>
                    <p className="text-3xl font-bold text-red-100">{liveDashboardStats.absent}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                </div>
                <p className="text-xs text-red-400">Marked as absent</p>
              </div>

              {/* ONLINE RATE */}
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/10 border border-blue-500/30 rounded-xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-blue-300 mb-1">ONLINE RATE</p>
                    <p className="text-3xl font-bold text-blue-100">{liveDashboardStats.onlineRate}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <p className="text-xs text-blue-400">Working / (Total - Leave)</p>
              </div>

              {/* AVG NET WORK */}
              <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-900/10 border border-cyan-500/30 rounded-xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-cyan-300 mb-1">AVG NET WORK</p>
                    <p className="text-3xl font-bold text-cyan-100">{liveDashboardStats.avgNetWork}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <p className="text-xs text-cyan-400">Per staff today</p>
              </div>

              {/* AVG BREAK USED */}
              <div className="bg-gradient-to-br from-pink-900/40 to-pink-900/10 border border-pink-500/30 rounded-xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-pink-300 mb-1">AVG BREAK USED</p>
                    <p className="text-3xl font-bold text-pink-100">{liveDashboardStats.avgBreakUsed}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                    <Coffee className="w-6 h-6 text-pink-400" />
                  </div>
                </div>
                <p className="text-xs text-pink-400">Per staff today</p>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Violation Analysis */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Violation Analysis
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">Late Arrivals</span>
                      <span className="text-amber-400 font-bold">{liveDashboardStats.lateArrivals}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${(liveDashboardStats.lateArrivals / liveDashboardStats.totalStaff) * 100 || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">Missed Punches</span>
                      <span className="text-red-400 font-bold">{liveDashboardStats.missedPunches}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(liveDashboardStats.missedPunches / liveDashboardStats.totalStaff) * 100 || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">Day Off Taken</span>
                      <span className="text-purple-400 font-bold">{liveDashboardStats.dayOffTaken}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(liveDashboardStats.dayOffTaken / liveDashboardStats.totalStaff) * 100 || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Productivity Metrics */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Productivity Metrics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">Active Workforce</span>
                      <span className="text-emerald-400 font-bold">{liveDashboardStats.activeWorkforce}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: liveDashboardStats.activeWorkforce }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">Break Utilization</span>
                      <span className="text-amber-400 font-bold">{liveDashboardStats.breakUtilization}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: liveDashboardStats.breakUtilization }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">Attendance Rate</span>
                      <span className="text-cyan-400 font-bold">{liveDashboardStats.attendanceRate}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ width: liveDashboardStats.attendanceRate }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Metrics */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Time Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-gray-300">Total Work Hours</span>
                    <span className="text-blue-400 font-bold">{liveDashboardStats.totalWorkHours}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-gray-300">Total Break Hours</span>
                    <span className="text-pink-400 font-bold">{liveDashboardStats.totalBreakHours}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-gray-300">Avg Session Time</span>
                    <span className="text-cyan-400 font-bold">{liveDashboardStats.avgSessionTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agents Status – Live Table */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-700/50">
                <h2 className="text-xl font-bold text-white">Agents status – live</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">UID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Clock-In</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Net Work</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Break Used</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Break Left</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">BreakCnt</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">OverBit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {isLoading ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-8 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-8 text-center text-gray-400">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((agent) => (
                        <tr key={agent.uid || agent._id} className="hover:bg-slate-800/30">
                          <td className="px-6 py-4 text-sm font-mono text-gray-300">
                            {agent.uid || agent._id?.slice(-10)}
                          </td>
                          <td className="px-6 py-4 text-sm text-white font-medium">
                            {agent.user?.FullName || agent.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(agent.status || agent.alert)}`}>
                              {agent.status || agent.alert}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {agent.clockIn ? new Date(agent.clockIn).toLocaleString() : '--'}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-cyan-400">
                            {formatTimeDisplay(agent.netWork)}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-pink-400">
                            {formatTimeDisplay(agent.breakUsed)}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-emerald-400">
                            {calculateBreakLeft(agent.breakUsed)}
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-gray-300">
                            {agent.breakCount || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-gray-300">
                            {agent.overBit || 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORIGINAL ANALYTICS VIEW */}
        {viewMode === 'analytics' && (
          <div className="space-y-6">
            {/* Original KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border border-emerald-500/30 rounded-lg p-4 hover:border-emerald-500/60 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-300 mb-1">Present</p>
                    <p className="text-3xl font-bold text-emerald-100">{stats.present}</p>
                    <p className="text-xs text-emerald-400 mt-2">{stats.attendanceRate}%</p>
                  </div>
                  <Users className="w-10 h-10 text-emerald-500/60" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-900/40 to-red-900/10 border border-red-500/30 rounded-lg p-4 hover:border-red-500/60 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-300 mb-1">Absent</p>
                    <p className="text-3xl font-bold text-red-100">{stats.absent}</p>
                    <p className="text-xs text-red-400 mt-2">No check-in</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-500/60" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-900/10 border border-yellow-500/30 rounded-lg p-4 hover:border-yellow-500/60 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-300 mb-1">Late</p>
                    <p className="text-3xl font-bold text-yellow-100">{stats.late}</p>
                    <p className="text-xs text-yellow-400 mt-2">After 9:30 AM</p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-500/60" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/10 border border-blue-500/30 rounded-lg p-4 hover:border-blue-500/60 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300 mb-1">On Time</p>
                    <p className="text-3xl font-bold text-blue-100">{stats.onTime}</p>
                    <p className="text-xs text-blue-400 mt-2">Before 9:30 AM</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-500/60" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/10 border border-purple-500/30 rounded-lg p-4 hover:border-purple-500/60 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Avg Hours</p>
                    <p className="text-3xl font-bold text-purple-100">{stats.avgHours}</p>
                    <p className="text-xs text-purple-400 mt-2">Per employee</p>
                  </div>
                  <Clock className="w-10 h-10 text-purple-500/60" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-900/10 border border-cyan-500/30 rounded-lg p-4 hover:border-cyan-500/60 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyan-300 mb-1">Total Staff</p>
                    <p className="text-3xl font-bold text-cyan-100">{stats.total}</p>
                    <p className="text-xs text-cyan-400 mt-2">Registered</p>
                  </div>
                  <Users className="w-10 h-10 text-cyan-500/60" />
                </div>
              </div>
            </div>

            {/* Original Analytics Charts */}
            <div className="flex justify-end mb-4">

            </div>


          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="space-y-6">
            {/* Charts Row 1 */}

            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowCharts(prev => !prev)}
                className="px-4 py-2 rounded-lg flex items-center gap-2 transition bg-slate-800 border border-slate-700 text-gray-300 hover:bg-slate-700"
              >
                {showCharts ? <EyeOff size={18} /> : <Eye size={18} />}
                {showCharts ? "Hide Charts" : "Show Charts"}
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Trend Chart */}
              <div className="bg-[#0B1221] border border-[#1B2335] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/10">
                      <TrendingUp size={18} className="text-blue-400" />
                    </div>
                    Weekly Attendance Trend
                  </h3>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                      <span className="text-slate-300">Present</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <span className="text-slate-300">Absent</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <span className="text-slate-300">Late</span>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={330}>
                  <AreaChart data={weeklyTrendData}>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="10%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="90%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />

                    <XAxis
                      dataKey="day"
                      stroke="#64748B"
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                    />

                    <YAxis
                      stroke="#64748B"
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0F172A",
                        border: "1px solid #334155",
                        borderRadius: "10px",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />

                    {/* main curve */}
                    <Area
                      type="monotone"
                      dataKey="present"
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#colorPresent)"
                      dot={{ r: 6, fill: "#10B981", stroke: "#0F172A", strokeWidth: 2 }}
                      activeDot={{ r: 8, strokeWidth: 2, stroke: "#10B981" }}
                    />

                    {/* late */}
                    <Line
                      type="monotone"
                      dataKey="late"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      dot={{ r: 6, fill: "#F59E0B", stroke: "#0F172A", strokeWidth: 2 }}
                    />

                    {/* absent */}
                    <Line
                      type="monotone"
                      dataKey="absent"
                      stroke="#EF4444"
                      strokeWidth={3}
                      dot={{ r: 6, fill: "#EF4444", stroke: "#0F172A", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Department Analytics */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur">
                <h3 className="text-lg font-semibold text-white mb-4">Department Performance</h3>
                <ResponsiveContainer style={{ background: "transparent" }} width="100%" height={300}>
                  <BarChart data={deptAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404860" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #404860' }} />
                    <Legend />
                    <Bar dataKey="Present" fill={COLORS.present} />
                    <Bar dataKey="Absent" fill={COLORS.absent} />
                    <Bar dataKey="Late" fill={COLORS.late} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div
              className={`transition-all duration-500 overflow-hidden ${showCharts ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-[#0B1221] border border-[#1B2335] rounded-2xl p-6 shadow-xl hover:shadow-[#6D28D9]/20 transition-all duration-300">

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                      <Target size={22} className="text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white">Performance Metrics</h3>
                  </div>

                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>

                      <PolarGrid
                        stroke="#334155"
                        strokeOpacity={0.5}
                      />

                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: "#94A3B8", fontSize: 13, fontWeight: 600 }}
                      />

                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: "#64748B", fontSize: 11 }}
                        stroke="#334155"
                      />

                      <Radar
                        name="Metrics"
                        dataKey="value"
                        stroke="#A78BFA"
                        fill="#A78BFA"
                        fillOpacity={0.45}
                        strokeWidth={3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>

                </div>

                {/* Working Hours Distribution */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur">
                  <h3 className="text-lg font-semibold text-white mb-4">Hours Distribution</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={hoursDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#404860" />
                      <XAxis type="number" stroke="#9CA3AF" />
                      <YAxis dataKey="range" type="category" stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #404860' }} />
                      <Bar dataKey="count" fill={COLORS.present} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Punch In Pattern */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur">
                  <h3 className="text-lg font-semibold text-white mb-4">Punch In Pattern</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={punchDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404860" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #404860' }} />
                      <Area type="monotone" dataKey="count" fill={COLORS.present} stroke={COLORS.present} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

        )}

        {viewMode === 'table' && (
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl backdrop-blur overflow-hidden">
            {/* Filters */}
            <div className="p-6 border-b border-slate-700/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2  border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                {/* department */}


                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-4 py-2  border border-slate-600 rounded-lg text-white"
                  >
                    <option className="bg-[#0d1b2af3] text-gray-300" value="All">All</option>

                    {departments.map((d, idx) => (
                      <option className="bg-[#0d1b2af3] text-gray-300" key={idx} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Status</label>
                  <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-4 py-2  border  border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    {statuses.map(status => (
                      <option className="bg-slate-900" key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">From Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2  border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">To Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2  border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="text-sm text-gray-400">
                  Showing {filteredData.length} of {allAttendance?.length || 0} records
                </div>
                <div className="flex gap-2">
                  <button onClick={clearFilters} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition">
                    Clear Filters
                  </button>
                  <button onClick={exportToCSV} disabled={filteredData.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
                    <Download size={18} />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">ID</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">Name</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">Department</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">Date</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">Punch In</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">Punch Out</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">Hours</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {isLoading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row) => (
                      <tr key={row._id} className="hover:bg-slate-800/30 text-center transition">
                        <td className="px-6 py-4 text-sm text-white">{row._id?.slice(0, 8)}</td>
                        <td className="px-6 py-4 text-sm text-white font-medium">{row.user?.FullName}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{row.user?.department}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{new Date(row.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{row.clockIn ? new Date(row.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{row.clockOut ? new Date(row.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{row.workingHours || '0'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${getStatusColor(calculateDynamicStatus(row))}`}>
                            {calculateDynamicStatus(row)}
                          </span>

                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {viewMode === 'cards' && (
          <div className="space-y-6">

            {/* Filters */}
            <div className="p-5 bg-[#0C1120]/70 border border-[#1E293B] rounded-xl shadow-md backdrop-blur">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                      type="text"
                      placeholder="Name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#111827] border border-slate-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-4 py-2 bg-[#111827] border border-slate-600 rounded-lg text-white"
                  >
                    <option className="bg-[#111827] text-gray-300" value="All">All</option>

                    {departments.map((d, idx) => (
                      <option className="bg-[#111827] text-gray-300" key={idx} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-[#111827] border border-slate-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-[#1F2937] text-gray-300 rounded-lg hover:bg-[#374151] transition font-medium"
                  >
                    Clear
                  </button>
                </div>

              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Loading */}
              {isLoading ? (
                <div className="col-span-full flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="col-span-full text-center text-gray-400 py-10">
                  No records found
                </div>
              ) : (
                filteredData.map((emp) => (
                  <div
                    key={emp._id}
                    onClick={() => setSelectedCard(emp)}
                    className="bg-[#0F172A]/60 border border-[#1E293B] rounded-2xl p-6 shadow-xl backdrop-blur hover:border-blue-500/50 hover:shadow-blue-500/20 transition-all duration-300"
                  >

                    {/* Header */}
                    <div className="flex justify-between items-start pb-4 border-b border-slate-700/50 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{emp.user?.FullName}</h3>
                        <p className="text-sm text-blue-300">{emp.user?.department}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-md text-xs font-semibold ${getStatusColor(emp.alert)}`}>
                        {emp.alert}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <CardRow label="Date" value={new Date(emp.date).toLocaleDateString()} />
                      <CardRow label="Punch In" value={emp.clockIn ? new Date(emp.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} />
                      <CardRow label="Punch Out" value={emp.clockOut ? new Date(emp.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} />

                      {/* Hours Highlight */}
                      <div className="flex justify-between items-center bg-blue-900/20 p-3 rounded-lg border border-blue-700/20 shadow-inner">
                        <span className="text-sm text-gray-300">Hours</span>
                        <span className="text-lg font-bold text-blue-400">{emp.workingHours}h</span>
                      </div>

                      <CardRow label="Shift" value={emp.shift || 'N/A'} />
                    </div>

                    {/* Footer */}
                    <div className="mt-5 pt-4 border-t border-slate-700/50">
                      <p className="text-xs text-gray-400 font-mono">ID: {emp._id?.slice(0, 8)}</p>
                    </div>

                  </div>
                ))
              )}

            </div>

          </div>
        )}

        {
          viewMode === 'dashboard' && (
            <AttendanceDashboard />
          )
        }
        {viewMode === 'manpower' && (
          <ManpowerStatusSection />
        )}
        {selectedCard && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

            <div
              ref={popupRef}
              id="captureCard"
              style={{
                background: "#0F172A",
                border: "1px solid #1E293B",
                borderRadius: "16px",
                padding: "24px",
                width: "350px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                  borderBottom: "1px solid #2D3748"
                }}
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {selectedCard.user?.FullName}
                  </h3>
                  <p className="text-sm" style={{ color: "#60A5FA" }}>
                    {selectedCard.user?.department}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${getStatusColor(
                    selectedCard.alert
                  )}`}
                >
                  {selectedCard.alert}
                </span>
              </div>

              {/* Card Info */}
              <div className="space-y-3 text-gray-200">
                <CardRow
                  label="Date"
                  value={new Date(selectedCard.date).toLocaleDateString()}
                />
                <CardRow
                  label="Punch In"
                  value={
                    selectedCard.clockIn
                      ? new Date(selectedCard.clockIn).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                      : "--"
                  }
                />
                <CardRow
                  label="Punch Out"
                  value={
                    selectedCard.clockOut
                      ? new Date(selectedCard.clockOut).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                      : "--"
                  }
                />

                {/* Hours Box */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "rgba(29,78,216,0.2)",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(29,78,216,0.3)"
                  }}
                >
                  <span className="text-sm">Hours</span>
                  <span className="text-lg font-bold text-blue-400">
                    {selectedCard.workingHours}h
                  </span>
                </div>

                <CardRow label="Shift" value={selectedCard.shift || "N/A"} />
              </div>

              {/* Footer */}
              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "16px",
                  borderTop: "1px solid #2D3748",
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <button
                  onClick={() => setSelectedCard(null)}
                  style={{
                    padding: "8px 16px",
                    background: "rgba(220,38,38,0.2)",
                    color: "#F87171",
                    borderRadius: "8px",
                    border: "1px solid rgba(220,38,38,0.3)"
                  }}
                >
                  Close
                </button>

                <button
                  onClick={downloadCard}
                  style={{
                    padding: "8px 16px",
                    background: "#2563EB",
                    color: "white",
                    borderRadius: "8px"
                  }}
                >
                  Download Image
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Pagination Info */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-400">
          <div>
            Total Records: {pagination?.total || allAttendance?.length || 0}
          </div>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>



    </div>
  );
};

export default OverallAttendanceDashboard;