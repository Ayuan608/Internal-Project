import React, { useState } from "react";
import {
  CheckCircle,
  MessageSquare,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

const PerformanceDashboard = () => {
  const [viewMode, setViewMode] = useState("weekly");
  const [showStats, setShowStats] = useState(true);

  const weeklyData = [
    { date: "Mon, Oct 14", completed: 48, effective: 45, messages: 236, missed: 3, online: 480, frt: 12, positive: 94.5, negative: 5.5, mistakes: 2, quota: 50 },
    { date: "Tue, Oct 15", completed: 52, effective: 50, messages: 258, missed: 2, online: 485, frt: 10, positive: 96.2, negative: 3.8, mistakes: 1, quota: 50 },
    { date: "Wed, Oct 16", completed: 45, effective: 42, messages: 221, missed: 5, online: 475, frt: 15, positive: 91.3, negative: 8.7, mistakes: 3, quota: 50 },
    { date: "Thu, Oct 17", completed: 50, effective: 48, messages: 245, missed: 2, online: 490, frt: 11, positive: 95.8, negative: 4.2, mistakes: 1, quota: 50 },
    { date: "Fri, Oct 18", completed: 47, effective: 44, messages: 232, missed: 4, online: 482, frt: 13, positive: 93.1, negative: 6.9, mistakes: 2, quota: 50 },
  ];

  const weeklyTotal = {
    date: "Weekly Total",
    completed: 242,
    effective: 229,
    messages: 1192,
    missed: 16,
    online: 2412,
    frt: 12.2,
    positive: 94.2,
    negative: 5.8,
    mistakes: 9,
    quota: 250,
  };

  const comparisonData = [
    { label: "COMPLETED", value: 47, change: -3, previous: 50 },
    { label: "EFFECTIVE", value: 44, change: -4, previous: 48 },
    { label: "MESSAGES", value: 232, change: -13, previous: 245 },
    { label: "FRT (SECS)", value: 13, change: 2, previous: 11 },
    { label: "POSITIVE %", value: "93.1%", change: -2.7, previous: 95.8 },
    { label: "MISTAKES", value: 2, change: 1, previous: 1 },
  ];

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                viewMode === "weekly"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "bg-slate-800/50 backdrop-blur-sm text-slate-300 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
              }`}
            >
              Weekly View
            </button>

            <button
              onClick={() => setViewMode("monthly")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                viewMode === "monthly"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "bg-slate-800/50 backdrop-blur-sm text-slate-300 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
              }`}
            >
              Monthly View
            </button>
          </div>

          <button
            onClick={() => setShowStats(!showStats)}
            className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm text-slate-300 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 font-semibold"
          >
            {showStats ? "Hide Stats" : "Show Stats"}
          </button>
        </div>

        {/* Stats Cards */}
        {showStats && (
          <div className="grid grid-cols-4 gap-5">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-emerald-400" strokeWidth={2.5} />
                </div>
                <span className="text-slate-400 text-sm font-medium">Total</span>
              </div>
              <h3 className="text-5xl font-bold text-white mb-2 tracking-tight">242</h3>
              <p className="text-slate-400 font-medium">Completed Tasks</p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <MessageSquare className="w-8 h-8 text-blue-400" strokeWidth={2.5} />
                </div>
                <span className="text-slate-400 text-sm font-medium">Total</span>
              </div>
              <h3 className="text-5xl font-bold text-white mb-2 tracking-tight">1192</h3>
              <p className="text-slate-400 font-medium">Messages Handled</p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Clock className="w-8 h-8 text-purple-400" strokeWidth={2.5} />
                </div>
                <span className="text-slate-400 text-sm font-medium">Average</span>
              </div>
              <h3 className="text-5xl font-bold text-white mb-2 tracking-tight">12.2s</h3>
              <p className="text-slate-400 font-medium">Response Time</p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-amber-400" strokeWidth={2.5} />
                </div>
                <span className="text-slate-400 text-sm font-medium">Average</span>
              </div>
              <h3 className="text-5xl font-bold text-white mb-2 tracking-tight">94.2%</h3>
              <p className="text-slate-400 font-medium">Positive Rate</p>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50 bg-slate-800/40">
                  <th className="text-left px-6 py-4 text-slate-200 font-bold text-xs uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="text-center px-4 py-4 text-slate-200 font-bold text-xs uppercase tracking-wider">
                    COMPLETED
                  </th>
                  <th className="text-center px-4 py-4 text-slate-200 font-bold text-xs uppercase tracking-wider">
                    EFFECTIVE
                  </th>
                  <th className="text-center px-4 py-4 text-slate-200 font-bold text-xs uppercase tracking-wider">
                    MESSAGES
                  </th>
                  <th className="text-center px-4 py-4 text-slate-200 font-bold text-xs uppercase tracking-wider">
                    MISSED
                  </th>
                  <th className="text-center px-4 py-4 text-slate-200 font-bold text-xs uppercase tracking-wider">
                    ONLINE (MIN)
                  </th>
                  <th className="text-center px-4 py-4 text-slate-200 font-bold text-xs uppercase tracking-wider">
                    FRT (SEC)
                  </th>
                  <th className="text-center px-4 py-4 text-slate-200 font-bold text-xs uppercase tracking-wider">
                    POSITIVE %
                  </th>
                  <th className="text-center px-4 py-4 text-slate-200 font-bold text-xs uppercase tracking-wider">
                    NEGATIVE %
                  </th>
                  <th className="text-center px-4 py-4 text-slate-200 font-bold text-xs uppercase tracking-wider">
                    MISTAKES
                  </th>
                  <th className="text-center px-4 py-4 text-slate-200 font-bold text-xs uppercase tracking-wider">
                    QUOTA
                  </th>
                </tr>
              </thead>

              <tbody>
                {weeklyData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-800/30 hover:bg-slate-700/20 transition-all duration-200"
                  >
                    <td className="px-6 py-5 text-white font-semibold">
                      {row.date}
                    </td>
                    <td className="px-4 py-5 text-center text-slate-200 font-medium">
                      {row.completed}
                    </td>
                    <td className="px-4 py-5 text-center text-slate-200 font-medium">
                      {row.effective}
                    </td>
                    <td className="px-4 py-5 text-center text-slate-200 font-medium">
                      {row.messages}
                    </td>
                    <td className="px-4 py-5 text-center text-slate-200 font-medium">
                      {row.missed}
                    </td>
                    <td className="px-4 py-5 text-center text-slate-200 font-medium">
                      {row.online}
                    </td>
                    <td className="px-4 py-5 text-center text-slate-200 font-medium">
                      {row.frt}
                    </td>
                    <td className="px-4 py-5 text-center text-slate-200 font-medium">
                      {row.positive}%
                    </td>
                    <td className="px-4 py-5 text-center text-slate-200 font-medium">
                      {row.negative}%
                    </td>
                    <td className="px-4 py-5 text-center text-slate-200 font-medium">
                      {row.mistakes}
                    </td>
                    <td className="px-4 py-5 text-center text-slate-200 font-medium">
                      {row.quota}
                    </td>
                  </tr>
                ))}

                <tr className="border-t-0 border-slate-800 bg-slate-900/40">
                  <td className="px-6 py-5 text-white font-bold text-lg">
                    {weeklyTotal.date}
                  </td>
                  <td className="px-4 py-5 text-center text-white font-bold text-lg">
                    {weeklyTotal.completed}
                  </td>
                  <td className="px-4 py-5 text-center text-white font-bold text-lg">
                    {weeklyTotal.effective}
                  </td>
                  <td className="px-4 py-5 text-center text-white font-bold text-lg">
                    {weeklyTotal.messages}
                  </td>
                  <td className="px-4 py-5 text-center text-white font-bold text-lg">
                    {weeklyTotal.missed}
                  </td>
                  <td className="px-4 py-5 text-center text-white font-bold text-lg">
                    {weeklyTotal.online}
                  </td>
                  <td className="px-4 py-5 text-center text-white font-bold text-lg">
                    {weeklyTotal.frt}
                  </td>
                  <td className="px-4 py-5 text-center text-white font-bold text-lg">
                    {weeklyTotal.positive}%
                  </td>
                  <td className="px-4 py-5 text-center text-white font-bold text-lg">
                    {weeklyTotal.negative}%
                  </td>
                  <td className="px-4 py-5 text-center text-white font-bold text-lg">
                    {weeklyTotal.mistakes}
                  </td>
                  <td className="px-4 py-5 text-center text-white font-bold text-lg">
                    {weeklyTotal.quota}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">
              Performance Trends & Analysis
            </h2>
            <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30">
              Today vs Previous
            </button>
          </div>

          <p className="text-slate-400 font-medium">
            Today (Oct 18) vs Yesterday (Oct 17)
          </p>

          <div className="grid grid-cols-6 gap-4">
            {comparisonData.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 hover:shadow-lg transition-all duration-300"
              >
                <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-4">
                  {item.label}
                </p>

                <h3 className="text-4xl font-bold text-white mb-4 tracking-tight">
                  {item.value}
                </h3>

                <div className="space-y-1">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                      item.change < 0
                        ? "bg-red-500/15 border border-red-500/20"
                        : "bg-green-500/15 border border-green-500/20"
                    }`}
                  >
                    {item.change < 0 ? (
                      <TrendingDown
                        className="w-3.5 h-3.5 text-red-400"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <TrendingUp
                        className="w-3.5 h-3.5 text-green-400"
                        strokeWidth={2.5}
                      />
                    )}

                    <span
                      className={`text-sm font-bold ${
                        item.change < 0 ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {Math.abs(item.change)}
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs font-medium">
                    vs {item.previous} yesterday
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerformanceDashboard;
