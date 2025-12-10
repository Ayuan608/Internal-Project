// src/components/Dashboard/CheckerDashboard/WCBreakHistory.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Coffee, 
  Utensils, 
  Droplets,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../../../redux/attendenceSlice';

const WCBreakHistory = ({ detailed = false }) => {
  const dispatch = useDispatch();
  const { allAttendance, isLoading } = useSelector((state) => state.attendance);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBreakType, setFilterBreakType] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});

  // Mock break data - in production, this would come from backend
  const [breakData, setBreakData] = useState([]);

  useEffect(() => {
    // Simulate fetching break data from attendance records
    if (allAttendance.length > 0) {
      const processedBreaks = processBreakData(allAttendance);
      setBreakData(processedBreaks);
    }
  }, [allAttendance]);

  const processBreakData = (attendance) => {
    const breaks = [];
    
    attendance.forEach(record => {
      const employeeBreaks = [
        ...(record.smokeBreaks || []).map(b => ({
          ...b,
          type: 'smoke',
          employeeName: record.user?.FullName,
          department: record.user?.department,
          date: record.date
        })),
        ...(record.wcBreaks || []).map(b => ({
          ...b,
          type: 'wc',
          employeeName: record.user?.FullName,
          department: record.user?.department,
          date: record.date
        })),
        ...(record.lunchBreaks || []).map(b => ({
          ...b,
          type: 'lunch',
          employeeName: record.user?.FullName,
          department: record.user?.department,
          date: record.date
        }))
      ];
      
      breaks.push(...employeeBreaks);
    });
    
    return breaks;
  };

  const getBreakDuration = (start, end) => {
    if (!start || !end) return '0m';
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = Math.round((endTime - startTime) / (1000 * 60)); // minutes
    return `${diff}m`;
  };

  const getBreakIcon = (type) => {
    switch (type) {
      case 'smoke': return <Coffee size={16} className="text-amber-500" />;
      case 'wc': return <Droplets size={16} className="text-blue-500" />;
      case 'lunch': return <Utensils size={16} className="text-emerald-500" />;
      default: return <Clock size={16} className="text-slate-400" />;
    }
  };

  const getBreakColor = (type) => {
    switch (type) {
      case 'smoke': return 'bg-amber-500/10 text-amber-500';
      case 'wc': return 'bg-blue-500/10 text-blue-500';
      case 'lunch': return 'bg-emerald-500/10 text-emerald-500';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  const filteredBreaks = breakData.filter(breakItem => {
    const matchesSearch = 
      breakItem.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      breakItem.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBreakType = 
      filterBreakType === 'all' || breakItem.type === filterBreakType;
    
    const matchesDepartment = 
      filterDepartment === 'all' || breakItem.department === filterDepartment;
    
    return matchesSearch && matchesBreakType && matchesDepartment;
  });

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const calculateBreakStats = () => {
    const stats = {
      smoke: { count: 0, totalTime: 0 },
      wc: { count: 0, totalTime: 0 },
      lunch: { count: 0, totalTime: 0 }
    };

    breakData.forEach(breakItem => {
      if (breakItem.start && breakItem.end) {
        const duration = Math.round((new Date(breakItem.end) - new Date(breakItem.start)) / (1000 * 60));
        stats[breakItem.type].count++;
        stats[breakItem.type].totalTime += duration;
      }
    });

    return stats;
  };

  const stats = calculateBreakStats();

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
            <Clock size={20} />
            WC Break History
          </h2>
          <p className="text-sm text-slate-400">
            Track all break activities across departments
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search employee or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 w-full md:w-64"
            />
          </div>
          
          <select
            value={filterBreakType}
            onChange={(e) => setFilterBreakType(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white cursor-pointer"
          >
            <option value="all">All Break Types</option>
            <option value="smoke">Smoke</option>
            <option value="wc">WC</option>
            <option value="lunch">Lunch</option>
          </select>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="CSR">CSR</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Deposit">Deposit</option>
          </select>
          
          {detailed && (
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700/50 transition-colors">
              <Download size={16} />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Coffee className="text-amber-500" size={20} />
              <span className="text-sm text-slate-300">Smoke Breaks</span>
            </div>
            <span className="text-lg font-bold text-white">{stats.smoke.count}</span>
          </div>
          <div className="text-xs text-slate-400">
            Total time: {stats.smoke.totalTime}m
          </div>
        </div>
        
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplets className="text-blue-500" size={20} />
              <span className="text-sm text-slate-300">WC Breaks</span>
            </div>
            <span className="text-lg font-bold text-white">{stats.wc.count}</span>
          </div>
          <div className="text-xs text-slate-400">
            Total time: {stats.wc.totalTime}m
          </div>
        </div>
        
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Utensils className="text-emerald-500" size={20} />
              <span className="text-sm text-slate-300">Lunch Breaks</span>
            </div>
            <span className="text-lg font-bold text-white">{stats.lunch.count}</span>
          </div>
          <div className="text-xs text-slate-400">
            Total time: {stats.lunch.totalTime}m
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Break Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                {detailed && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredBreaks.length > 0 ? (
                filteredBreaks.map((breakItem, index) => (
                  <React.Fragment key={index}>
                    <tr 
                      className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                      onClick={() => toggleRow(index)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold text-sm">
                            {breakItem.employeeName?.charAt(0) || 'E'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">
                              {breakItem.employeeName || 'Unknown'}
                            </div>
                            <div className="text-xs text-slate-400">
                              {new Date(breakItem.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-300">
                          {breakItem.department || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getBreakColor(breakItem.type)}`}>
                          {getBreakIcon(breakItem.type)}
                          {breakItem.type.charAt(0).toUpperCase() + breakItem.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {breakItem.start 
                          ? new Date(breakItem.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'N/A'
                        }
                        {breakItem.end && (
                          <>
                            <span className="mx-2">→</span>
                            {new Date(breakItem.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-white">
                          {getBreakDuration(breakItem.start, breakItem.end)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          breakItem.end 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {breakItem.end ? 'Completed' : 'Active'}
                        </span>
                      </td>
                      {detailed && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {expandedRows[index] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                      )}
                    </tr>
                    
                    {expandedRows[index] && (
                      <tr className="bg-slate-800/20">
                        <td colSpan={detailed ? 7 : 6} className="px-6 py-4">
                          <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-slate-400 mb-1">Break ID</div>
                                <div className="text-white font-mono">BRK_{index.toString().padStart(4, '0')}</div>
                              </div>
                              <div>
                                <div className="text-slate-400 mb-1">Date</div>
                                <div className="text-white">
                                  {new Date(breakItem.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-400 mb-1">Start Time</div>
                                <div className="text-white">
                                  {breakItem.start ? new Date(breakItem.start).toLocaleTimeString() : 'Not recorded'}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-400 mb-1">End Time</div>
                                <div className="text-white">
                                  {breakItem.end ? new Date(breakItem.end).toLocaleTimeString() : 'Ongoing'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={detailed ? 7 : 6} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Clock size={48} className="mb-2" />
                      <p>No break records found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-slate-300">Smoke Break</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-slate-300">WC Break</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-slate-300">Lunch Break</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-slate-300">Over Break</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-slate-300">Shift Change</span>
        </div>
      </div>
    </div>
  );
};

export default WCBreakHistory;