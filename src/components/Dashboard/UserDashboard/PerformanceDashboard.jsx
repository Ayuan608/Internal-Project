import React, { useState } from 'react';
import { Download, TrendingUp, TrendingDown, Clock, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

function PerformanceDashboard() {
  const [viewType, setViewType] = useState('weekly');
  const [showStats, setShowStats] = useState(true);

  const weeklyData = [
    { date: 'Mon, Oct 14', completed: 48, effective: 45, messages: 236, missed: 3, online: 480, frt: 12, positive: 94.5, negative: 5.5, mistakes: 2, quota: 50 },
    { date: 'Tue, Oct 15', completed: 52, effective: 50, messages: 258, missed: 2, online: 485, frt: 10, positive: 96.2, negative: 3.8, mistakes: 1, quota: 50 },
    { date: 'Wed, Oct 16', completed: 45, effective: 42, messages: 221, missed: 5, online: 475, frt: 15, positive: 91.3, negative: 8.7, mistakes: 3, quota: 50 },
    { date: 'Thu, Oct 17', completed: 50, effective: 48, messages: 245, missed: 2, online: 490, frt: 11, positive: 95.8, negative: 4.2, mistakes: 1, quota: 50 },
    { date: 'Fri, Oct 18', completed: 47, effective: 44, messages: 232, missed: 4, online: 482, frt: 13, positive: 93.1, negative: 6.9, mistakes: 2, quota: 50 },
  ];

  const monthlyData = [
    { date: 'Week 1', completed: 235, effective: 220, messages: 1150, missed: 15, online: 2380, frt: 12.5, positive: 94.2, negative: 5.8, mistakes: 8, quota: 250 },
    { date: 'Week 2', completed: 242, effective: 229, messages: 1192, missed: 16, online: 2412, frt: 12.2, positive: 94.2, negative: 5.8, mistakes: 9, quota: 250 },
    { date: 'Week 3', completed: 228, effective: 215, messages: 1105, missed: 18, online: 2350, frt: 13.1, positive: 93.5, negative: 6.5, mistakes: 11, quota: 250 },
    { date: 'Week 4', completed: 250, effective: 238, messages: 1220, missed: 12, online: 2450, frt: 11.8, positive: 95.1, negative: 4.9, mistakes: 7, quota: 250 },
  ];

  const currentData = viewType === 'weekly' ? weeklyData : monthlyData;

  const calculateTotal = (field) => {
    return currentData.reduce((sum, row) => sum + row[field], 0);
  };

  const calculateAverage = (field) => {
    const total = currentData.reduce((sum, row) => sum + row[field], 0);
    return (total / currentData.length).toFixed(1);
  };

  const todayData = weeklyData[weeklyData.length - 1];
  const yesterdayData = weeklyData[weeklyData.length - 2];

  const comparisonStats = [
    {
      label: 'COMPLETED',
      value: todayData.completed,
      change: todayData.completed - yesterdayData.completed,
      comparison: yesterdayData.completed,
    },
    {
      label: 'EFFECTIVE',
      value: todayData.effective,
      change: todayData.effective - yesterdayData.effective,
      comparison: yesterdayData.effective,
    },
    {
      label: 'MESSAGES',
      value: todayData.messages,
      change: todayData.messages - yesterdayData.messages,
      comparison: yesterdayData.messages,
    },
    {
      label: 'FRT (SECS)',
      value: todayData.frt,
      change: todayData.frt - yesterdayData.frt,
      comparison: yesterdayData.frt,
      inverse: true,
    },
    {
      label: 'POSITIVE %',
      value: `${todayData.positive}%`,
      change: (todayData.positive - yesterdayData.positive).toFixed(1),
      comparison: yesterdayData.positive,
    },
    {
      label: 'MISTAKES',
      value: todayData.mistakes,
      change: todayData.mistakes - yesterdayData.mistakes,
      comparison: yesterdayData.mistakes,
      inverse: true,
    },
  ];

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Daily Time Record</h1>
            <p className="text-slate-500 mt-1">Performance Dashboard - Current {viewType === 'weekly' ? 'Week' : 'Month'}</p>
          </div>
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md">
            <Download size={18} />
            Export Performance
          </button>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setViewType('weekly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewType === 'weekly'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Weekly View
          </button>
          <button
            onClick={() => setViewType('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewType === 'monthly'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Monthly View
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className={`ml-auto px-6 py-2 rounded-lg font-medium transition-all ${
              showStats
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
        </div>

        {/* Comparison Stats */}
        {showStats && viewType === 'weekly' && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Performance Trends & Analysis</h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  Today vs Previous
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Today (Oct 18) vs Yesterday (Oct 17)</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {comparisonStats.map((stat, idx) => {
                  const isPositive = stat.inverse ? stat.change < 0 : stat.change > 0;
                  return (
                    <div key={idx} className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-lg border border-slate-200">
                      <div className="text-xs text-slate-500 font-medium mb-2">{stat.label}</div>
                      <div className="text-2xl font-bold text-slate-800 mb-2">{stat.value}</div>
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded ${
                          isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {Math.abs(stat.change)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">vs {stat.comparison} yesterday</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics Cards */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle size={32} />
                <span className="text-blue-100 text-sm font-medium">Total</span>
              </div>
              <div className="text-3xl font-bold mb-1">{calculateTotal('completed')}</div>
              <div className="text-blue-100 text-sm">Completed Tasks</div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <MessageSquare size={32} />
                <span className="text-emerald-100 text-sm font-medium">Total</span>
              </div>
              <div className="text-3xl font-bold mb-1">{calculateTotal('messages')}</div>
              <div className="text-emerald-100 text-sm">Messages Handled</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Clock size={32} />
                <span className="text-purple-100 text-sm font-medium">Average</span>
              </div>
              <div className="text-3xl font-bold mb-1">{calculateAverage('frt')}s</div>
              <div className="text-purple-100 text-sm">Response Time</div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle size={32} />
                <span className="text-amber-100 text-sm font-medium">Average</span>
              </div>
              <div className="text-3xl font-bold mb-1">{calculateAverage('positive')}%</div>
              <div className="text-amber-100 text-sm">Positive Rate</div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-[#3b83f60c] rounded-xl shadow-md overflow-hidden border border-gray-500">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className=''>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Effective</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Messages</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Missed</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Online (Min)</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">FRT (Sec)</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Positive %</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Negative %</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Mistakes</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Quota</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.date}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-700">{row.completed}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-700">{row.effective}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-700">{row.messages}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                        row.missed > 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {row.missed}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-700">{row.online}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                        row.frt > 12 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {row.frt}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-sm font-medium">
                        {row.positive}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-sm font-medium">
                        {row.negative}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                        row.mistakes > 2 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {row.mistakes}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-700">{row.quota}</td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 font-bold border-t-2 border-slate-300">
                  <td className="px-6 py-4 text-sm text-slate-800">{viewType === 'weekly' ? 'Weekly' : 'Monthly'} Total</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-800">{calculateTotal('completed')}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-800">{calculateTotal('effective')}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-800">{calculateTotal('messages')}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-800">{calculateTotal('missed')}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-800">{calculateTotal('online')}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-800">{calculateAverage('frt')}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-800">{calculateAverage('positive')}%</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-800">{calculateAverage('negative')}%</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-800">{calculateTotal('mistakes')}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-800">{calculateTotal('quota')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

     
      </div>
    </div>
  );
}

export default PerformanceDashboard;