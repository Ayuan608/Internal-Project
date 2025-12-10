// src/components/Dashboard/CheckerDashboard/AttendanceChart.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock,
  Calendar,
  Download
} from 'lucide-react';

const AttendanceChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    // Process data for chart
    if (data && data.length > 0) {
      processChartData();
    }
  }, [data, timeRange]);

  const processChartData = () => {
    // This would process your actual attendance data
    // For now, we'll generate mock data based on timeRange
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const mockData = [];
    
    for (let i = 0; i < days; i++) {
      const present = Math.floor(Math.random() * 50) + 30;
      const absent = Math.floor(Math.random() * 10) + 2;
      const late = Math.floor(Math.random() * 8) + 1;
      const onBreak = Math.floor(Math.random() * 5) + 1;
      
      mockData.push({
        date: `Day ${i + 1}`,
        present,
        absent,
        late,
        onBreak,
        total: present + absent
      });
    }
    
    setChartData(mockData);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg shadow-xl">
          <p className="text-sm font-bold text-white mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-slate-300">{entry.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate statistics
  const calculateStats = () => {
    if (chartData.length === 0) return {};
    
    const totalPresent = chartData.reduce((sum, day) => sum + day.present, 0);
    const totalAbsent = chartData.reduce((sum, day) => sum + day.absent, 0);
    const totalLate = chartData.reduce((sum, day) => sum + day.late, 0);
    
    return {
      avgAttendance: Math.round(totalPresent / chartData.length),
      attendanceRate: Math.round((totalPresent / (totalPresent + totalAbsent)) * 100),
      avgLate: Math.round(totalLate / chartData.length),
      peakAttendance: Math.max(...chartData.map(day => day.present))
    };
  };

  const stats = calculateStats();

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users size={20} />
            Attendance Overview
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Daily attendance trends and patterns
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
            {['week', 'month', 'quarter'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors ${
                  timeRange === range 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
            {['line', 'area', 'bar'].map(type => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors ${
                  chartType === type 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Avg. Attendance</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.avgAttendance || 0}</div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Attendance Rate</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.attendanceRate || 0}%</div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Avg. Late Arrivals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.avgLate || 0}</div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Peak Attendance</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.peakAttendance || 0}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => value.replace('Day ', '')}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="present" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ stroke: '#22c55e', strokeWidth: 2, r: 3 }}
                name="Present"
              />
              <Line 
                type="monotone" 
                dataKey="absent" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ stroke: '#ef4444', strokeWidth: 2, r: 3 }}
                name="Absent"
              />
              <Line 
                type="monotone" 
                dataKey="late" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ stroke: '#f59e0b', strokeWidth: 2, r: 3 }}
                name="Late"
              />
              <Line 
                type="monotone" 
                dataKey="onBreak" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 3 }}
                name="On Break"
              />
            </LineChart>
          ) : chartType === 'area' ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="present" 
                stroke="#22c55e" 
                fill="#22c55e"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Present"
              />
              <Area 
                type="monotone" 
                dataKey="absent" 
                stroke="#ef4444" 
                fill="#ef4444"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Absent"
              />
              <Area 
                type="monotone" 
                dataKey="late" 
                stroke="#f59e0b" 
                fill="#f59e0b"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Late"
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="present" fill="#22c55e" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
              <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Late" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm">
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
          <span className="text-slate-300">On Break</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-slate-300">Shift Change</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;