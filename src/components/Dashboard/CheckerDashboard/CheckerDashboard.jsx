// src/components/Dashboard/CheckerDashboard/CheckerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './UI/Tabs';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Clock, 
  Download,
  TrendingUp,
  AlertCircle,
  Coffee,
  Droplets,
  Utensils,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getDepartmentWiseUsers } from '../../../redux/attendenceSlice';

// Import components
import WCBreakHistory from './WCBreakHistory';
import MonthlyBreakdown from './MonthlyBreakdown';
import BreakAnalytics from './BreakAnalytics';
import AttendanceChart from './AttendanceChart';
import AttendanceTable from './AttendanceTable';

const CheckerDashboard = () => {
  const dispatch = useDispatch();
  const { 
    departmentAttendance = [], 
    isLoading,
    department,
    departmentCount 
  } = useSelector((state) => state.attendance);
  
  console.log("✅ Checker data loaded:", {
    recordCount: departmentAttendance.length,
    department,
    departmentCount,
    sample: departmentAttendance[0]
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch data on mount
  useEffect(() => {
    dispatch(getDepartmentWiseUsers());
  }, [dispatch]);

  // Calculate real stats
  const calculateStats = () => {
    if (!departmentAttendance || departmentAttendance.length === 0) {
      return {
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        totalBreaks: 0
      };
    }

    const presentToday = departmentAttendance.filter(user => 
      user.status === "Present" || user.clockIn
    ).length;
    
    const absentToday = departmentAttendance.filter(user => 
      user.status === "Absent" || !user.clockIn
    ).length;
    
    const lateToday = departmentAttendance.filter(user => 
      user.alert === "Late" || user.alert === "Missed Punch"
    ).length;
    
    const totalBreaks = departmentAttendance.reduce((sum, user) => {
      const breaks = user.breaks || {};
      return sum + (breaks.smoke || 0) + (breaks.wc || 0) + (breaks.lunch || 0);
    }, 0);

    return {
      totalEmployees: departmentAttendance.length,
      presentToday,
      absentToday,
      lateToday,
      totalBreaks
    };
  };

  const stats = calculateStats();

  // Get unique departments
  const departments = ['all', ...new Set(departmentAttendance.map(user => user.department).filter(Boolean))];
  
  // Filter data
  const filteredData = departmentAttendance.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || 
      user.department === filterDepartment;
    
    const matchesStatus = filterStatus === 'all' || 
      user.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Stats cards
  const statsCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: <Users className="w-5 h-5" />,
      color: 'bg-blue-500/10 text-blue-500',
      border: 'border-blue-500/20'
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-green-500/10 text-green-500',
      border: 'border-green-500/20'
    },
    {
      title: 'Absent Today',
      value: stats.absentToday,
      icon: <XCircle className="w-5 h-5" />,
      color: 'bg-red-500/10 text-red-500',
      border: 'border-red-500/20'
    },
    {
      title: 'Total Breaks',
      value: stats.totalBreaks,
      icon: <Coffee className="w-5 h-5" />,
      color: 'bg-purple-500/10 text-purple-500',
      border: 'border-purple-500/20'
    }
  ];

  // Break stats
  const breakStats = [
    {
      title: 'Smoke Breaks',
      value: departmentAttendance.reduce((sum, user) => sum + (user.breaks?.smoke || 0), 0),
      icon: <Coffee className="w-4 h-4" />,
      color: 'bg-amber-500/10 text-amber-500'
    },
    {
      title: 'WC Breaks',
      value: departmentAttendance.reduce((sum, user) => sum + (user.breaks?.wc || 0), 0),
      icon: <Droplets className="w-4 h-4" />,
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      title: 'Lunch Breaks',
      value: departmentAttendance.reduce((sum, user) => sum + (user.breaks?.lunch || 0), 0),
      icon: <Utensils className="w-4 h-4" />,
      color: 'bg-emerald-500/10 text-emerald-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen  p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Checker Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.65)_0%,_rgba(2,6,23,1)_35%)] p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <User size={28} />
              Checker Dashboard
            </h1>
            <p className="text-slate-400">
              {department || 'All Departments'} • {filteredData.length} employees
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => dispatch(getDepartmentWiseUsers())}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700/50 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white"
              />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search employee or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white cursor-pointer focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Departments</option>
                {departments.filter(dept => dept !== 'all').map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white cursor-pointer focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className={`bg-slate-800/30 backdrop-blur-sm border ${stat.border} rounded-xl p-4 hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="text-sm text-slate-400">{stat.title}</div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Break Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {breakStats.map((breakStat, index) => (
            <div
              key={index}
              className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${breakStat.color}`}>
                    {breakStat.icon}
                  </div>
                  <span className="text-sm text-slate-300">{breakStat.title}</span>
                </div>
                <span className="text-lg font-bold text-white">{breakStat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-slate-700/50">
            <TabsList className="bg-transparent p-4">
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800">
                <BarChart3 size={18} className="mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="breaks" className="data-[state=active]:bg-slate-800">
                <Coffee size={18} className="mr-2" />
                Break History
              </TabsTrigger>
              <TabsTrigger value="attendance" className="data-[state=active]:bg-slate-800">
                <Users size={18} className="mr-2" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="monthly" className="data-[state=active]:bg-slate-800">
                <Calendar size={18} className="mr-2" />
                Monthly
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-800">
                <TrendingUp size={18} className="mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <div className="p-4 md:p-6">
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <AttendanceChart data={filteredData} />
                </div>
                <div>
                  <WCBreakHistory allAttendance={filteredData} />
                </div>
                <div>
                  <BreakAnalytics allAttendance={filteredData} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="breaks" className="mt-0">
              <WCBreakHistory allAttendance={filteredData} detailed={true} />
            </TabsContent>

            <TabsContent value="attendance" className="mt-0">
              <AttendanceTable data={filteredData} />
            </TabsContent>

            <TabsContent value="monthly" className="mt-0">
              <MonthlyBreakdown allAttendance={filteredData} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <BreakAnalytics allAttendance={filteredData} detailed={true} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default CheckerDashboard;