import React, { useState, useMemo, useEffect } from 'react';
import { Edit2, Save, X, Download, FileText, Search, Trash2, Filter } from 'lucide-react';
import { updateAttendance, getDepartmentWiseUsers } from '../../../redux/attendenceSlice';
import { useDispatch } from 'react-redux';
// Department wise colors
const DEPARTMENT_COLORS = {
  'CSR': { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-700/30' },
  'Withdraw': { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-700/30' },
  'Deposit': { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-700/30' },
  'Marketing': { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-700/30' },
  'default': { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-700/30' }
};

const Shift_COLORS = {
  Day: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-300',
    border: 'border-yellow-700/30',
  },
  Night: {
    bg: 'bg-green-500/20',
    text: 'text-green-300',
    border: 'border-green-700/30',
  },
  Mid: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-300',
    border: 'border-gray-700/30',
  },
  default: {
    bg: 'bg-slate-500/20',
    text: 'text-slate-300',
    border: 'border-slate-700/30',
  },
};

// Backend → Frontend (for display)
const BACKEND_TO_FRONTEND_STATUS = {
  D: 'D',
  M: 'M',
  N: 'N',
  PS: 'PS',
  // R: 'RD',
  RD: 'RD'
};

// Frontend → Backend (for saving)
const FRONTEND_TO_BACKEND_STATUS = {
  D: 'D',
  M: 'M',
  N: 'N',
  PS: 'PS',
  RD: 'RD'
};


// Frontend status mapping - ONLY 5 STATUSES
const FRONTEND_STATUS_MAP = {
  D: {
    label: 'D',
    className: 'bg-yellow-400 text-black',
    fullName: 'Day Shift',
    backendValue: 'D',
  },
  M: {
    label: 'M',
    className: 'bg-white text-black',
    fullName: 'Mid Shift',
    backendValue: 'M',
  },
  N: {
    label: 'N',
    className: 'bg-green-600 text-white',
    fullName: 'Night Shift',
    backendValue: 'N',
  },
  PS: {
    label: 'PS',
    className: 'bg-blue-600 text-white',
    fullName: 'Probation',
    backendValue: 'PS', // Backend में 'PS' है Probation
  },
  RD: {
    label: 'RD',
    className: 'bg-red-600 text-white',
    fullName: 'Rest Day',
    backendValue: "RD",  // Backend में 2 है Rest Day
  },
};

// Get current month and year
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(), // 0-indexed
    currentDay: now.getDate() // Current day of month
  };
};

export default function AttendanceTable({
  data = [],
  role = 'Team-Leader',
  selectedMonth,
  daysInMonth,
  monthLabel,
  onEmployeeDeleted = () => { },
  onAttendanceUpdated = () => { }
}) {

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [showStatusMenu, setShowStatusMenu] = useState({
    show: false,
    dayIndex: null,
    x: 0,
    y: 0,
    empId: null
  });
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMonthInfo, setCurrentMonthInfo] = useState(getCurrentMonthYear());
  const isRoleAccess =
    role === "Super-Admin" || role === "Admin";
  const dispatch = useDispatch();

  // Update current date every day
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMonthInfo(getCurrentMonthYear());
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);


  const today = new Date();

  const daysToShow = useMemo(() => {
    const selectedYear = selectedMonth.getFullYear();
    const selectedMonthIndex = selectedMonth.getMonth();

    const currentYear = today.getFullYear();
    const currentMonthIndex = today.getMonth();

    const totalDaysInSelectedMonth = new Date(
      selectedYear,
      selectedMonthIndex + 1,
      0
    ).getDate();


    if (
      selectedYear < currentYear ||
      (selectedYear === currentYear && selectedMonthIndex < currentMonthIndex)
    ) {
      return Array.from({ length: totalDaysInSelectedMonth }, (_, i) => i + 1);
    }


    if (
      selectedYear === currentYear &&
      selectedMonthIndex === currentMonthIndex
    ) {
      return Array.from({ length: today.getDate() }, (_, i) => i + 1);
    }

    return [];
  }, [selectedMonth]);

  console.log(daysToShow)

  const hasEditAccess = useMemo(() => {
    return role === 'Admin' || role === 'Super-Admin';
  }, [role]);


  // Convert backend pattern to frontend status
  const convertBackendPattern = (backendPattern) => {

    if (!Array.isArray(backendPattern)) return [];

    return backendPattern.map(code => {
      // Convert to string first
      const codeStr = code.toString();

      // If it's already a frontend code (D, M, N, PS, RD), return as is
      if (Object.keys(FRONTEND_STATUS_MAP).includes(codeStr)) {
        return codeStr;
      }

      // Convert backend numeric codes
      return FRONTEND_TO_BACKEND_STATUS[code] || 'D'; // Default to Day
    });
  };

  const filteredEmployees = useMemo(() => {
    return data.filter(emp => {
      const matchesSearch =
        emp.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        selectedDept === "All Departments" ||
        emp.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [data, searchTerm, selectedDept]);


  const calculateTotals = (patternByDay = {}) => {
    const totals = {
      totalDayShift: 0,
      totalMidShift: 0,
      totalNightShift: 0,
      totalProbation: 0,
      totalRestDay: 0,
      totalAbsent: 0,
      totalLeave: 0,
      totalAttendance: 0,
    };

    for (const day of daysToShow) {
      const status = patternByDay?.[day];

      switch (status) {
        case 'D':
          totals.totalDayShift++;
          break;
        case 'M':
          totals.totalMidShift++;
          break;
        case 'N':
          totals.totalNightShift++;
          break;
        case 'PS':
          totals.totalProbation++;
          break;
        case 'RD':
          totals.totalRestDay++;
          break;
        case 'A':
          totals.totalAbsent++;
          break;
        case 'L':
          totals.totalLeave++;
          break;
        default:
          break;
      }
    }

    totals.totalAttendance =
      totals.totalDayShift +
      totals.totalMidShift +
      totals.totalNightShift;

    return totals;
  };



  const stats = useMemo(() => {
    let dayShift = 0,
      midShift = 0,
      nightShift = 0,
      probation = 0,
      restDay = 0,
      absent = 0,
      leave = 0,
      totalAttendance = 0;

    filteredEmployees.forEach(emp => {
      const totals = calculateTotals(emp.patternByDay);

      dayShift += totals.totalDayShift;
      midShift += totals.totalMidShift;
      nightShift += totals.totalNightShift;
      probation += totals.totalProbation;
      restDay += totals.totalRestDay;
      absent += totals.totalAbsent;
      leave += totals.totalLeave;
      totalAttendance += totals.totalAttendance;
    });

    return {
      dayShift,
      midShift,
      nightShift,
      probation,
      restDay,
      absent,
      leave,
      totalAttendance,
      totalEmployees: filteredEmployees.length,
    };
  }, [filteredEmployees, daysToShow]);


  const legendStats = useMemo(() => {
    const stats = {
      D: { count: 0, percentage: 0 },
      M: { count: 0, percentage: 0 },
      N: { count: 0, percentage: 0 },
      PS: { count: 0, percentage: 0 },
      RD: { count: 0, percentage: 0 },
    };

    let totalStatuses = 0;

    filteredEmployees.forEach(emp => {
      const patternByDay = emp.patternByDay || {};

      for (const day of daysToShow) {
        const status = patternByDay[day];

        if (stats[status]) {
          stats[status].count++;
          totalStatuses++;
        }
      }
    });

    Object.keys(stats).forEach(key => {
      stats[key].percentage =
        totalStatuses > 0
          ? ((stats[key].count / totalStatuses) * 100).toFixed(1)
          : 0;
    });

    return stats;
  }, [filteredEmployees, daysToShow]);


  const getDepartmentColor = (department) => {
    const dept = department || '';
    const deptKey = Object.keys(DEPARTMENT_COLORS).find(key =>
      dept.toLowerCase().includes(key.toLowerCase())
    );
    return DEPARTMENT_COLORS[deptKey] || DEPARTMENT_COLORS.default;
  };
  const getShiftColor = (Shift) => {
    const shift = Shift || '';
    const shiftKey = Object.keys(Shift_COLORS).find(key =>
      shift.toLowerCase().includes(key.toLowerCase())
    );
    return Shift_COLORS[shiftKey] || Shift_COLORS.default;
  };

  const handleStartEdit = (empId) => {
    const emp = data.find(e => e._id === empId);

    const totals = calculateTotals(emp.patternByDay);

    const patternByDay = {};
    (emp.pattern || []).forEach((status, index) => {
      const day = index + 1;
      patternByDay[day] = FRONTEND_TO_BACKEND_STATUS[status] || 'D';
    });

    setEditData({
      _id: emp._id,
      patternByDay,
      remarks: emp.remarks || '',
      schedule: emp.workingHour || '',
      ...totals
    });

    setEditingId(empId);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
    setShowStatusMenu({ show: false, dayIndex: null, x: 0, y: 0, empId: null });
  };


  // };
  const handleSaveEdit = async () => {
    // console.log(editData)
    if (!editData) return;

    const { _id, patternByDay, remarks } = editData;


    const originalUser = filteredEmployees.find(
      emp => emp._id === _id
    );
    // console.log(originalUser)
    if (!originalUser) return;


    const isRemarksChanged =
      remarks !== (originalUser.remarks || "");

    const isPatternChanged = Object.entries(patternByDay).some(
      ([day, status]) =>
        status !== originalUser.patternByDay?.[day]
    );

    if (isRemarksChanged && !isPatternChanged) {
      await dispatch(
        updateAttendance({
          user: _id,
          remarks,
          workingHour: editData?.schedule
        })
      );

      dispatch(getDepartmentWiseUsers());
      setEditingId(null);
      setEditData(null);
      return;
    }


    for (const [day, frontendStatus] of Object.entries(patternByDay)) {
      const backendStatus =
        FRONTEND_TO_BACKEND_STATUS[frontendStatus];


      if (backendStatus === originalUser.patternByDay?.[day]) {
        continue;
      }

      await dispatch(
        updateAttendance({
          user: _id,
          date: `${currentMonthInfo.year}-${String(
            currentMonthInfo.month + 1
          ).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          pattern: backendStatus,
          workingHour: editData.schedule,
          remarks, // optional
        })
      );
    }

    dispatch(getDepartmentWiseUsers());
    setEditingId(null);
    setEditData(null);
  };






  const handleDayClick = (day, empId, event) => {
    if (!hasEditAccess || editingId !== empId) return;

    const rect = event.currentTarget.getBoundingClientRect();

    setShowStatusMenu({
      show: true,
      dayIndex: day,
      empId,
      x: rect.left,
      y: rect.bottom + 5
    });
  };


  const handleStatusChange = (statusKey) => {
    const day = showStatusMenu.dayIndex;

    setEditData(prev => ({
      ...prev,
      patternByDay: {
        ...prev.patternByDay,
        [day]: statusKey
      }
    }));

    setShowStatusMenu({ show: false });
  };



  // Handle remarks change
  const handleRemarksChange = (e) => {
    setEditData({ ...editData, remarks: e.target.value });
  };

  // Handle manual total change
  const handleManualTotalChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setEditData({ ...editData, [field]: numValue });
  };

  // Handle schedule change
  const handleScheduleChange = (e) => {
    setEditData({ ...editData, schedule: e.target.value });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Head Count',
      'Name',
      'Username',
      'Department',
      'Schedule',
      'Remarks',
      ...daysToShow.map(day => day.toString().padStart(2, '0')),
      'Day Shift',
      'Mid Shift',
      'Night Shift',
      'Probation',
      'Rest Day',
      'Total Attendance'
    ];

    const rows = filteredEmployees.map((emp, index) => {
      const pattern = emp.pattern || [];
      const frontendPattern = convertBackendPattern(pattern);
      const totals = calculateTotals(pattern);

      // Ensure pattern has correct length
      const displayPattern = frontendPattern.length >= daysToShow.length
        ? frontendPattern.slice(0, daysToShow.length)
        : [...frontendPattern, ...Array(daysToShow.length - frontendPattern.length).fill('D')];

      return [
        index + 1,
        emp.FullName || 'N/A',
        emp.username || 'N/A',
        emp.department || 'N/A',
        emp.workingHour || '8:00 AM - 5:00 PM',
        emp.remarks || '',
        ...displayPattern.map(code => {
          const status = FRONTEND_STATUS_MAP[code];
          return status ? status.label : 'D'; // Default to 'D'
        }),
        totals.totalDayShift,
        totals.totalMidShift,
        totals.totalNightShift,
        totals.totalProbation,
        totals.totalRestDay,
        totals.totalAttendance
      ].map(cell => `"${cell}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${monthLabel.replace(' ', '_')}_day${currentMonthInfo.currentDay}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };
  const departmentOptions = useMemo(() => {
    const set = new Set();

    filteredEmployees.forEach(emp => {
      if (emp.department) {
        set.add(emp.department);
      }
    });

    return ["All Departments", ...Array.from(set)];
  }, [filteredEmployees]);




  return (
    <div className="min-h-screen text-slate-100">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Attendance Table - {monthLabel} (Day {daysToShow.length}/{daysInMonth})
            </h1>
            <p className="text-slate-400">
              Role: <span className="text-blue-400 font-semibold">{role}</span> -
              {hasEditAccess ? ' Full access to edit, delete and manage' : ' View-only access'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition"
              disabled={filteredEmployees.length === 0}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <div className="text-xs text-blue-300 mb-1">Total Employees</div>
            <div className="text-2xl font-bold text-white">{stats.totalEmployees}</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
            <div className="text-xs text-emerald-300 mb-1">Total Attendance</div>
            <div className="text-2xl font-bold text-white">{stats.totalAttendance}</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <div className="text-xs text-yellow-300 mb-1">Day Shifts</div>
            <div className="text-2xl font-bold text-white">{stats.dayShift}</div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/40 to-orange-900/20 border border-orange-700/50 rounded-lg p-4">
            <div className="text-xs text-orange-300 mb-1">Mid Shifts</div>
            <div className="text-2xl font-bold text-white">{stats.midShift}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-700/50 rounded-lg p-4">
            <div className="text-xs text-purple-300 mb-1">Night Shifts</div>
            <div className="text-2xl font-bold text-white">{stats.nightShift}</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/40 to-blue-500/20 border border-blue-700/50 rounded-lg p-4">
            <div className="text-xs text-blue-300 mb-1">Probation</div>
            <div className="text-2xl font-bold text-white">{stats.probation}</div>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-green-900/20 border border-green-700/50 rounded-lg p-4">
            <div className="text-xs text-green-300 mb-1">Rest Days</div>
            <div className="text-2xl font-bold text-white">{stats.restDay}</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, username, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          {isRoleAccess && (
            <div className="relative p-1">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-9 rounded-lg border border-slate-700 bg-slate-900/80 pl-6 pr-3 text-xs text-slate-200 outline-none ring-0 focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              >

                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="text-sm text-slate-400 whitespace-nowrap">
            Showing {filteredEmployees.length} of {data.length} employees
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">Username</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">Shift</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">Schedule</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">Remarks</th>

                {/* Dynamic Day Headers - Current Month Days */}
                {daysToShow.map(day => (
                  <th key={day} className="px-1 py-3 text-center text-xs font-semibold text-slate-300 uppercase">
                    {day}
                  </th>
                ))}

                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">Day</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">Mid</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">Night</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">Prob</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">Rest</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">Total</th>

                {/* Actions column for Admin/SuperAdmin */}
                {hasEditAccess && (
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={daysToShow.length + 13} className="px-4 py-8 text-center text-slate-400">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => {
                  const isEditing = editingId === (emp._id || emp.id);
                  const pattern = isEditing ? editData?.pattern : (emp.pattern || []);
                  const frontendPattern = convertBackendPattern(pattern);

                  const totals = calculateTotals(emp.patternByDay);
                  // console.log(totals)
                  const deptColor = getDepartmentColor(emp.department);

                  const shiftColor = getShiftColor(emp?.Shift);

                  return (
                    <tr key={emp._id || emp.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 text-sm text-slate-300">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-white whitespace-nowrap">
                        {emp.FullName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                        {emp.username || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${deptColor.bg} ${deptColor.text} border ${deptColor.border}`}>
                          {emp.department || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap 
  ${shiftColor.bg} ${shiftColor.text} border ${shiftColor.border}`}
                        >
                          {emp?.Shift || 'N/A'}
                        </span>
                      </td>
                      {/* Schedule Column */}
                      <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData?.schedule || emp.workingHour || '8:00 AM - 5:00 PM'}
                            onChange={handleScheduleChange}
                            className="w-32 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                            placeholder="e.g., 8:00 AM - 5:00 PM"
                          />
                        ) : (
                          emp.workingHour || '8:00 AM - 5:00 PM'
                        )}
                      </td>

                      {/* Remarks Column */}
                      <td className="px-4 py-3 text-sm">
                        {isEditing ? (
                          <textarea
                            value={editData?.remarks || ''}
                            onChange={handleRemarksChange}
                            className="w-48 min-h-[60px] px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                            placeholder="Add remarks..."
                          />
                        ) : (
                          <div className="text-xs text-slate-400 max-w-xs">
                            {emp.remarks || '-'}
                          </div>
                        )}
                      </td>

                      {daysToShow.map(day => {
                        const statusCode = isEditing
                          ? editData?.patternByDay?.[day] ?? emp.patternByDay?.[day]
                          : emp.patternByDay?.[day] ?? 'D';

                        const statusInfo = FRONTEND_STATUS_MAP[statusCode];
                        return (
                          <td key={day} className="px-1 py-3">
                            <div
                              onClick={(e) => handleDayClick(day, emp._id, e)}
                              className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold
          ${statusInfo?.className}
          ${hasEditAccess && isEditing ? 'cursor-pointer hover:ring-2' : ''}
        `}
                            >
                              {statusInfo?.label}
                            </div>
                          </td>
                        );
                      })}



                      <td className="px-4 py-3 text-center">

                        <span className="text-sm font-medium text-yellow-300">{totals?.totalDayShift}</span>
                        {/* )} */}
                      </td>

                      <td className="px-4 py-3 text-center">

                        <span className="text-sm font-medium text-orange-300">{totals?.totalMidShift}</span>
                        {/* )} */}
                      </td>

                      <td className="px-4 py-3 text-center">

                        <span className="text-sm font-medium text-purple-300">{totals?.totalNightShift}</span>
                        {/* )} */}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {/* {isEditing ? (
                          <input
                            type="number" // value={editData?.totalProbation || 0}
                            onChange={(e) => handleManualTotalChange('totalProbation', e.target.value)}
                            className="w-12 px-1 py-1 bg-slate-800 border border-slate-600 rounded text-center text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                        ) : ( */}
                        <span className="text-sm font-medium text-blue-300">{totals?.totalProbation}</span>
                        {/* )} */}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {/* {isEditing ? (
                          <input
                            type="number"
                            value={editData?.totalRestDay || 0}
                            onChange={(e) => handleManualTotalChange('totalRestDay', e.target.value)}
                            className="w-12 px-1 py-1 bg-slate-800 border border-slate-600 rounded text-center text-sm text-white focus:outline-none focus:border-green-500"
                          />
                        ) : ( */}
                        <span className="text-sm font-medium text-green-300">{totals?.totalRestDay}</span>
                        {/* )} */}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {/* {isEditing ? (
                          <input
                            type="number"
                            value={editData?.totalAttendance || 0}
                            onChange={(e) => handleManualTotalChange('totalAttendance', e.target.value)}
                            className="w-12 px-1 py-1 bg-slate-800 border border-slate-600 rounded text-center text-sm text-white focus:outline-none focus:border-emerald-500"
                          />
                        ) : ( */}
                        <span className="text-sm font-bold text-emerald-300">{totals?.totalAttendance}</span>
                        {/* )} */}
                      </td>

                      {/* Action Buttons - Only for Admin/SuperAdmin */}
                      {hasEditAccess && (
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Save changes"
                              >
                                <Save className="w-3 h-3" />
                                {isSaving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 bg-slate-600 hover:bg-slate-700 rounded text-white text-sm flex items-center gap-1"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleStartEdit(emp._id || emp.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm flex items-center gap-1"
                                title="Edit attendance"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(emp._id || emp.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm flex items-center gap-1"
                                title="Delete employee"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Menu - Only shows for Admin/SuperAdmin in edit mode */}
      {showStatusMenu.show && hasEditAccess && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowStatusMenu({ show: false, dayIndex: null, x: 0, y: 0, empId: null })}

          />
          <div
            className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-2 min-w-[220px]"
            style={{ left: showStatusMenu.x, top: showStatusMenu.y }}
          >
            <div className="text-xs font-semibold text-slate-300 px-3 py-2 mb-1 border-b border-slate-700">
              Select Status - Day {showStatusMenu.dayIndex}
            </div>
            {Object.entries(FRONTEND_STATUS_MAP).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleStatusChange(key)}
                className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded flex items-center gap-3 transition"
              >
                <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${value.className}`}>
                  {value.label}
                </span>
                <span className="text-sm text-slate-200">{value.fullName}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Legend - ONLY 5 STATUSES */}
      <div className="mt-6 bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Legend - Status Codes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(FRONTEND_STATUS_MAP).map(([key, value]) => {


            const stat = legendStats[key];

            return (
              <div
                key={key}
                className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold ${value.className}`}>
                    {value.label}
                  </span>
                  <div>
                    <div className="text-sm text-slate-300 font-medium">{value.fullName}</div>
                    <div className="text-xs text-slate-500">
                      Count: <span className="text-slate-300 font-semibold">{stat?.count || 0}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {stat?.percentage || 0}% of total
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend Description */}
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">🟨</span>
              <span className="text-sm text-slate-300">D – Day shift (Yellow)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">🟧</span>
              <span className="text-sm text-slate-300">M – Mid shift (Orange)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-lg">🟪</span>
              <span className="text-sm text-slate-300">N – Night shift (Purple)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 text-lg">🔵</span>
              <span className="text-sm text-slate-300">PS – Probation (Blue)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">🟩</span>
              <span className="text-sm text-slate-300">RD – Rest day (Green)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions for Admin/SuperAdmin */}
      {(role === 'Admin' || role === 'SuperAdmin') && (
        <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {role === 'SuperAdmin' ? 'Super Admin' : 'Admin'} Instructions
          </h3>
          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            <li>Click <strong>Edit</strong> button to modify employee attendance records</li>
            <li>Click <strong>Delete</strong> button to remove employees from the system</li>
            <li>Click on individual day cells to change attendance status</li>
            <li>Manually adjust <strong>total counts</strong> in the respective columns</li>
            <li>Add <strong>remarks</strong> for special notes (late, undertime, shift changes, etc.)</li>
            <li>Click <strong>Save</strong> to apply changes or <strong>Cancel</strong> to discard</li>
            <li>Use <strong>Export CSV</strong> to download attendance records</li>
            <li>Days automatically increase as month progresses (Current: Day {daysToShow.length}/{daysInMonth})</li>
            <li className="text-yellow-400 font-semibold">
              {role === 'SuperAdmin' ? 'SUPER ADMIN HAS FULL ACCESS TO ALL FEATURES!' : 'Admin has full access to edit and manage attendance'}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}