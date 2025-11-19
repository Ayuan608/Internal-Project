import React, { useState, useMemo, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
  Award,
  Target,
  AlertCircle,
} from "lucide-react";

const QuotaManagement = ({ timeFilter, data, title }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const inputRef = useRef(null);

  const quotaData = (data && Array.isArray(data) && data.length > 0) ? data : data;

  // Pagination Logic
  const totalPages = Math.ceil(quotaData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return quotaData.slice(start, end);
  }, [quotaData, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    if (p !== currentPage) setCurrentPage(p);
  };

  const handlePageInput = (e) => {
    if (e.key !== "Enter") return;
    const value = e.target.value.trim();
    if (!value) return;
    const numbers = value.match(/\d+/g)?.map(Number) || [];
    if (numbers.length === 0) return;
    goToPage(numbers[0]);
    e.target.value = "";
  };

  // Helper functions
  const getPerformanceColor = (performance) => {
    if (performance >= 90) return "text-green-400";
    if (performance >= 75) return "text-yellow-400";
    return "text-red-400";
  };

  const getPerformanceBgColor = (performance) => {
    if (performance >= 90) return "bg-green-500/20 border-green-500/30";
    if (performance >= 75) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  const getPerformanceIcon = (performance) => {
    if (performance >= 90) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (performance >= 75) return <Minus className="w-4 h-4 text-yellow-400" />;
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  // Calculate totals
  const totalQuota = quotaData.reduce((sum, item) => sum + item.quota, 0);
  const totalAchieved = quotaData.reduce((sum, item) => sum + item.achieved, 0);
  const avgPerformance =
    quotaData.length > 0
      ? (quotaData.reduce((sum, item) => sum + item.performance, 0) / quotaData.length).toFixed(1)
      : 0;

  // Summary Stats
  const highPerformers = quotaData.filter((item) => item.performance >= 90).length;
  const averagePerformers = quotaData.filter((item) => item.performance >= 75 && item.performance < 90).length;
  const needsSupport = quotaData.filter((item) => item.performance < 75).length;

  return (
    <div className="mt-6 px-2">
      <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">


        {/* ====== UPGRADED SUMMARY CARDS ====== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
          {/* High Performers */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600/20 via-teal-700/10 to-cyan-800/20 border border-emerald-500/30 cursor-pointer p-6 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-6 h-6 text-emerald-400 animate-pulse" />
                  <p className="text-emerald-300 text-sm font-medium">High Performers</p>
                </div>
                <p className="text-4xl font-bold text-white">{highPerformers}</p>
                <p className="text-xs text-emerald-400 mt-1">≥90% Performance</p>
              </div>
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-800"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="url(#gradient1)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(highPerformers / quotaData.length) * 213.6 || 0} 213.6`}
                    className="text-emerald-400 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-400">
                    {quotaData.length > 0 ? Math.round((highPerformers / quotaData.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
            <svg className="absolute -bottom-10 -right-10 w-32 h-32 text-emerald-500/10">
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Average Performers */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600/20 via-orange-700/10 to-yellow-800/20 border border-amber-500/30 cursor-pointer p-6 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-6 h-6 text-amber-400" />
                  <p className="text-amber-300 text-sm font-medium">Average Performers</p>
                </div>
                <p className="text-4xl font-bold text-white">{averagePerformers}</p>
                <p className="text-xs text-amber-400 mt-1">75–89% Performance</p>
              </div>
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-800" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="url(#gradient2)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(averagePerformers / quotaData.length) * 213.6 || 0} 213.6`}
                    className="text-amber-400 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-amber-400">
                    {quotaData.length > 0 ? Math.round((averagePerformers / quotaData.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
            <svg className="absolute -bottom-10 -right-10 w-32 h-32 text-amber-500/10">
              <defs>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Needs Support */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600/20 via-rose-700/10 to-pink-800/20 border border-red-500/30 cursor-pointer p-6 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <p className="text-red-300 text-sm font-medium">Needs Support</p>
                </div>
                <p className="text-4xl font-bold text-white">{needsSupport}</p>
                <p className="text-xs text-red-400 mt-1">&lt;75% Performance</p>
              </div>
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-800" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="url(#gradient3)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(needsSupport / quotaData.length) * 213.6 || 0} 213.6`}
                    className="text-red-400 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-red-400">
                    {quotaData.length > 0 ? Math.round((needsSupport / quotaData.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
            <svg className="absolute -bottom-10 -right-10 w-32 h-32 text-red-500/10">
              <defs>
                <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f87171" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h3 className="text-white text-lg font-semibold flex items-center gap-2">
            Quota Management
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="text-gray-400">
              <span className="text-gray-500">Total Quota:</span>{" "}
              <span className="text-white font-semibold">{formatNumber(totalQuota)}</span>
            </div>
            <div className="text-gray-400">
              <span className="text-gray-500">Total Achieved:</span>{" "}
              <span className="text-white font-semibold">{formatNumber(totalAchieved)}</span>
            </div>
            <div className="text-gray-400">
              <span className="text-gray-500">Avg Performance:</span>{" "}
              <span className={`font-semibold ${getPerformanceColor(parseFloat(avgPerformance))}`}>
                {avgPerformance}%
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Agent Name</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Quota Target</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Achieved</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Performance</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Progress</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.agent}`}
                        alt="avatar"
                        className="w-12 h-12 rounded-full"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />

                      <div
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                     items-center justify-center text-white text-xs font-bold hidden"
                      >
                        {item.agent.split(" ").map((n) => n[0].toUpperCase()).join("")}
                      </div>

                      <span className="text-white font-medium">{item.agent}</span>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4 text-gray-300 font-medium">{formatNumber(item.quota)}</td>
                  <td className="text-center py-4 px-4 text-white font-semibold">{formatNumber(item.achieved)}</td>
                  <td className="text-center py-4 px-4">
                    <span className={`font-bold text-lg ${getPerformanceColor(item.performance)}`}>
                      {item.performance}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${item.performance >= 90 ? "bg-green-500" : item.performance >= 75 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                          style={{ width: `${Math.min(item.performance, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-12 text-right">{item.performance}%</span>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getPerformanceBgColor(item.performance)}`}>
                      {getPerformanceIcon(item.performance)}
                      <span className={`text-xs font-semibold ${getPerformanceColor(item.performance)}`}>
                        {item.performance >= 90 ? "Excellent" : item.performance >= 75 ? "Good" : "Needs Improvement"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-700 gap-4">
            <div className="text-sm text-gray-400 order-2 sm:order-1">
              Showing <span className="font-semibold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, quotaData.length)}</span> of{" "}
              <span className="font-semibold text-white">{quotaData.length}</span> agents
            </div>

            <div className="flex items-center gap-2 order-1 sm:order-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Go to page..."
                className="w-28 px-2 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={handlePageInput}
              />
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-gray-800 border border-gray-700 disabled:opacity-50 hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page;
                if (totalPages <= 7) page = i + 1;
                else if (currentPage <= 4) page = i + 1;
                else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                else page = currentPage - 3 + i;
                return page >= 1 && page <= totalPages ? (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700"
                      }`}
                  >
                    {page}
                  </button>
                ) : null;
              }).filter(Boolean)}

              {totalPages > 7 && currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-gray-800 border border-gray-700 disabled:opacity-50 hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default QuotaManagement