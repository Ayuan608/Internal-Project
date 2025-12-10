// src/components/Dashboard/CheckerDashboard/MonthlyBreakdown.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance, getAttendanceStats } from '../../../redux/attendenceSlice';

const MonthlyBreakdown = () => {
  const dispatch = useDispatch();
  const { allAttendance, isLoading } = useSelector((state) => state.attendance);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewType, setViewType] = useState('attendance'); // attendance, breaks, patterns

  // Format month for display
  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Navigation functions
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Calculate monthly statistics
  const calculateMonthlyStats = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthAttendance = allAttendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= monthStart && recordDate <= monthEnd;
    });

    const stats = {
      totalDays: getDaysInMonth(currentMonth),
      workingDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateArrivals: 0,
      totalBreaks: 0,
      avgBreakTime: 0
    };

    // Process attendance data
    const employeeMap = {};
    
    monthAttendance.forEach(record => {
      const employeeId = record.user?._id;
      if (!employeeMap[employeeId]) {
        employeeMap[employeeId] = {
          present: 0,
          absent: 0,
          late: 0,
          breaks: 0
        };
      }

      if (record.clockIn) {
        employeeMap[employeeId].present++;
        stats.presentDays++;
        
        // Check for late arrival
        const punchIn = new Date(record.clockIn);
        const lateThreshold = new Date(punchIn);
        lateThreshold.setHours(10, 30, 0, 0);
        
        if (punchIn > lateThreshold) {
          employeeMap[employeeId].late++;
          stats.lateArrivals++;
        }
      } else {
        employeeMap[employeeId].absent++;
        stats.absentDays++;
      }

      // Count breaks
      const breakCount = 
        (record.smokeBreaks?.length || 0) + 
        (record.wcBreaks?.length || 0) + 
        (record.lunchBreaks?.length || 0);
      
      employeeMap[employeeId].breaks += breakCount;
      stats.totalBreaks += breakCount;
    });

    // Calculate working days (assuming 5-day work week)
    stats.workingDays = Math.floor(stats.totalDays * 5 / 7);
    
    // Calculate average breaks per day
    const totalEmployees = Object.keys(employeeMap).length;
    stats.avgBreakTime = totalEmployees > 0 ? Math.round(stats.totalBreaks / stats.workingDays) : 0;

    return { stats, employeeMap };
  };

  const { stats, employeeMap } = calculateMonthlyStats();

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const days = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        dayOfWeek: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i).getDay(),
        isWeekend: [0, 6].includes(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i).getDay())
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Stats cards
  const monthlyStats = [
    {
      title: 'Working Days',
      value: stats.workingDays,
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-blue-500/10 text-blue-500',
      change: '+2'
    },
    {
      title: 'Present Days',
      value: stats.presentDays,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-emerald-500/10 text-emerald-500',
      change: '+15%'
    },
    {
      title: 'Absent Days',
      value: stats.absentDays,
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'bg-red-500/10 text-red-500',
      change: '-5%'
    },
    {
      title: 'Total Breaks',
      value: stats.totalBreaks,
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-purple-500/10 text-purple-500',
      change: '+8%'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={20} />
            Monthly Breakdown - {formatMonth(currentMonth)}
          </h2>
          <p className="text-sm text-slate-400">
            Attendance patterns and analytics for {formatMonth(currentMonth)}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setViewType('attendance')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewType === 'attendance' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setViewType('breaks')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewType === 'breaks' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Breaks
            </button>
            <button
              onClick={() => setViewType('patterns')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewType === 'patterns' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Patterns
            </button>
          </div>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="CSR">CSR</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Deposit">Deposit</option>
            <option value="Admin">Admin</option>
          </select>
          
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white hover:bg-slate-700/50 transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {monthlyStats.map((stat, index) => (
          <div
            key={index}
            className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.change.startsWith('+') 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-slate-400">
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar View */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-2">Monthly Calendar View</h3>
          <p className="text-sm text-slate-400">Day-by-day attendance and break patterns</p>
        </div>
        
        <div className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(day => {
              // Simulate attendance data for each day
              const isPresent = Math.random() > 0.3;
              const hasLate = isPresent && Math.random() > 0.7;
              const breakCount = Math.floor(Math.random() * 5);
              
              return (
                <div
                  key={day.date}
                  className={`min-h-24 p-2 rounded-lg border ${
                    day.isWeekend
                      ? 'bg-slate-800/20 border-slate-700/30'
                      : 'bg-slate-800/10 border-slate-700/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-medium ${
                      day.isWeekend ? 'text-red-400' : 'text-white'
                    }`}>
                      {day.date}
                    </span>
                    {isPresent && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        ✓
                      </span>
                    )}
                  </div>
                  
                  {isPresent ? (
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">
                        {breakCount} breaks
                      </div>
                      {hasLate && (
                        <div className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                          Late
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 mt-4">
                      -
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Department Performance</h3>
          <div className="space-y-4">
            {['CSR', 'Withdrawal', 'Deposit', 'Admin'].map(dept => {
              const attendanceRate = Math.floor(Math.random() * 20) + 80;
              const breakCount = Math.floor(Math.random() * 50) + 20;
              
              return (
                <div key={dept} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-white">{dept}</div>
                    <div className="text-xs text-slate-400">{breakCount} total breaks</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{attendanceRate}%</div>
                    <div className="text-xs text-slate-400">Attendance</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Attendance Trend</h3>
          <div className="space-y-4">
            {Array.from({ length: 6 }, (_, i) => {
              const weekNumber = i + 1;
              const attendance = Math.floor(Math.random() * 20) + 80;
              const breaks = Math.floor(Math.random() * 30) + 10;
              
              return (
                <div key={weekNumber} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Week {weekNumber}</span>
                    <span className="text-white font-medium">{attendance}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${attendance}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400">
                    Avg. {breaks} breaks per employee
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-slate-300">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-slate-300">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-slate-300">Late Arrival</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-slate-300">Working Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-slate-300">Weekend/Holiday</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyBreakdown;