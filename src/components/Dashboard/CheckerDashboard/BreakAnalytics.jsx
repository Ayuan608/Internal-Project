// src/components/Dashboard/CheckerDashboard/BreakAnalytics.jsx
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Coffee, 
  Utensils, 
  Droplets,
  Download,
  Filter,
  Calendar,
  Users,
  AlertTriangle
} from 'lucide-react';

const BreakAnalytics = ({ detailed = false }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [chartType, setChartType] = useState('bar');

  // Mock data - in production, this would come from your API
  const [breakAnalytics, setBreakAnalytics] = useState({
    daily: [],
    byType: [],
    byDepartment: [],
    trends: []
  });

  useEffect(() => {
    // Generate mock data based on time range
    generateMockData();
  }, [timeRange, selectedDepartment]);

  const generateMockData = () => {
    // Daily break data
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const dailyData = [];
    
    for (let i = 0; i < days; i++) {
      dailyData.push({
        date: `Day ${i + 1}`,
        smoke: Math.floor(Math.random() * 20) + 5,
        wc: Math.floor(Math.random() * 15) + 3,
        lunch: Math.floor(Math.random() * 10) + 2,
        total: 0
      });
      
      dailyData[i].total = dailyData[i].smoke + dailyData[i].wc + dailyData[i].lunch;
    }

    // Break type distribution
    const typeData = [
      { name: 'Smoke', value: 45, color: '#f59e0b' },
      { name: 'WC', value: 30, color: '#3b82f6' },
      { name: 'Lunch', value: 25, color: '#10b981' }
    ];

    // Department breakdown
    const departmentData = [
      { department: 'CSR', smoke: 120, wc: 85, lunch: 40, total: 245 },
      { department: 'Withdrawal', smoke: 95, wc: 70, lunch: 35, total: 200 },
      { department: 'Deposit', smoke: 110, wc: 75, lunch: 45, total: 230 },
      { department: 'Admin', smoke: 60, wc: 40, lunch: 30, total: 130 }
    ];

    // Trends
    const trendsData = Array.from({ length: 12 }, (_, i) => ({
      month: `M${i + 1}`,
      avgDuration: Math.floor(Math.random() * 15) + 10,
      frequency: Math.floor(Math.random() * 50) + 30,
      overbreaks: Math.floor(Math.random() * 10)
    }));

    setBreakAnalytics({
      daily: dailyData,
      byType: typeData,
      byDepartment: departmentData,
      trends: trendsData
    });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-sm font-medium text-white mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Stats cards
  const stats = [
    {
      title: 'Total Breaks Today',
      value: '142',
      change: '+12%',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      title: 'Avg Break Duration',
      value: '8.5m',
      change: '-5%',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-emerald-500/10 text-emerald-500'
    },
    {
      title: 'Over Breaks',
      value: '7',
      change: '+3',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'bg-red-500/10 text-red-500'
    },
    {
      title: 'Most Breaks Dept',
      value: 'CSR',
      change: '45 breaks',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-purple-500/10 text-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp size={20} />
            Break Analytics
          </h2>
          <p className="text-sm text-slate-400">
            Detailed analysis of break patterns and trends
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
            {['bar', 'line', 'area'].map(type => (
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
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="CSR">CSR</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Deposit">Deposit</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white hover:bg-slate-700/50 transition-colors">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Breaks Chart */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Daily Break Frequency</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Smoke</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>WC</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>Lunch</span>
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={breakAnalytics.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <Tooltip cursor={{ fill: "transparent" }}  content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="smoke" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="wc" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lunch" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={breakAnalytics.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="smoke" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ stroke: '#f59e0b', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="wc" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lunch" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ stroke: '#10b981', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={breakAnalytics.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="smoke" 
                    stroke="#f59e0b" 
                    fill="#f59e0b"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="wc" 
                    stroke="#3b82f6" 
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lunch" 
                    stroke="#10b981" 
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Break Type Distribution */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Break Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakAnalytics.byType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {breakAnalytics.byType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            {breakAnalytics.byType.map((type, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{type.value}%</div>
                <div className="text-sm text-slate-400 flex items-center justify-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: type.color }}
                  />
                  {type.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      {detailed && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Break Analysis by Department</h3>
            <span className="text-sm text-slate-400">Total breaks by type</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Smoke</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">WC</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Lunch</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Avg/Employee</th>
                </tr>
              </thead>
              <tbody>
                {breakAnalytics.byDepartment.map((dept, index) => (
                  <tr key={index} className="border-b border-slate-700/30 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold">
                          {dept.department.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-white">{dept.department}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-amber-400 font-medium">{dept.smoke}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-blue-400 font-medium">{dept.wc}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-emerald-400 font-medium">{dept.lunch}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-white">{dept.total}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-300">
                        {Math.round(dept.total / 5)} {/* Assuming 5 employees per dept */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Coffee size={14} className="text-amber-500" />
          <span className="text-slate-300">Smoke Break</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets size={14} className="text-blue-500" />
          <span className="text-slate-300">WC Break</span>
        </div>
        <div className="flex items-center gap-2">
          <Utensils size={14} className="text-emerald-500" />
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

export default BreakAnalytics;