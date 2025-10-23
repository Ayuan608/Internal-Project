import React, { useState } from "react";
import {
  FileText,
  Download,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import SuperAdminData from "../SuperAdminDashboardRoute/ui/SuperAdminData";

const CaseReport = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  const handleStatusChange = (e) => setSelectedStatus(e.target.value);
  const handlePriorityChange = (e) => setSelectedPriority(e.target.value);

  const caseData = [
    {
      id: "#CR001",
      sender: "Ashish Prabhakar",
      date: "2025-10-15",
      caseName: "Customer Complaint - Unauthorized Transaction",
      time: "14:30",
    },
    {
      id: "#CR002",
      sender: "Lisa Martinez",
      date: "2025-10-16",
      caseName: "System Error - Deposit Not Reflecting",
      time: "11:15",
    },
    {
      id: "#CR003",
      sender: "Robert Taylor",
      date: "2025-10-17",
      caseName: "Customer Request - Account Verification Issue",
      time: "09:45",
    },
    {
      id: "#CR004",
      sender: "David Chen",
      date: "2025-10-18",
      caseName: "Security Concern - Multiple Failed Login Attempts",
      time: "16:20",
    },
  ];

  // 🟩 Reports Grid Data (added missing fields)
  const reportsList = [
    {
      id: 1,
      icon: FileText,
      title: "Customer Complaints Report",
      description:
        "Detailed summary of all customer complaints received this month.",
      color: "blue",
    },
    {
      id: 2,
      icon: AlertCircle,
      title: "System Error Logs",
      description: "List of system errors reported in the last 7 days.",
      color: "red",
    },
    {
      id: 3,
      icon: CheckCircle,
      title: "Resolved Cases Report",
      description: "Cases successfully resolved by the team this quarter.",
      color: "green",
    },
    {
      id: 4,
      icon: TrendingUp,
      title: "Performance Insights",
      description:
        "Analytics on case handling efficiency and response times.",
      color: "purple",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="bg-[#3b83f60e] backdrop-blur-sm rounded-lg p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8 text-white" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Reports & Export Center
                </h1>
              </div>
              <p className="text-slate-400 text-sm md:text-base">
                Generate comprehensive reports for all departments and export
                data
              </p>
            </div>
          </div>
        </div>

        <SuperAdminData />

        {/* Filters Section */}
        <div className="bg-[#3b83f60e] backdrop-blur-sm rounded-lg p-4 md:p-6 mb-6 border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-white">
                Filter by Status:
              </h2>
            </div>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Cases</option>
              <option value="open">Open</option>
              <option value="inprogress">In Progress</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority Dropdown */}
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Priority:</h2>
              <select
                value={selectedPriority}
                onChange={handlePriorityChange}
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* New Case Report Button */}
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-semibold shadow-md transition-all  ease-in-out duration-300  hover:shadow-xl transform hover:-translate-y-0.5">
            + New Case Report
          </button>
        </div>

        {/* Report Types Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Available Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {reportsList.map((report) => {
              const Icon = report.icon;
              return (
                <div
                  key={report.id}
                  className="bg-[#3b83f60e]backdrop-blur-sm rounded-lg p-6 border border-[var(--box-border)] hover:border-slate-600 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg border ${colorClasses[report.color]}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-slate-400 text-sm mb-3">
                        {report.description}
                      </p>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                        Generate Report
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Exports */}
        <div className="bg-[#3b83f60e] backdrop-blur-sm rounded-lg p-4 md:p-6 border border-[var(--box-border)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Exports</h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--main-color)] text-white">
                  <th className="py-3 px-4 text-sm font-semibold">CASE ID</th>
                  <th className="py-3 px-4 text-sm font-semibold">SENDER</th>
                  <th className="py-3 px-4 text-sm font-semibold">DATE</th>
                  <th className="py-3 px-4 text-sm font-semibold">CASE NAME</th>
                  <th className="py-3 px-4 text-sm font-semibold">
                    TIME OF INCIDENT
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-center">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {caseData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${
                      index % 2 === 0 ? "bg-white/5" : "bg-transparent"
                    } border-b border-[var(--box-border)] hover:bg-slate-700/30 transition-colors`}
                  >
                    <td className="py-4 px-4 text-blue-400 font-medium">
                      {item.id}
                    </td>
                    <td className="py-4 px-4 text-white text-sm">
                      {item.sender}
                    </td>
                    <td className="py-4 px-4 text-white text-sm">
                      {item.date}
                    </td>
                    <td className="py-4 px-4 text-white text-sm">
                      {item.caseName}
                    </td>
                    <td className="py-4 px-4 text-white text-sm">{item.time}</td>
                    <td className="py-4 px-4 text-center">
                      <button className="bg-[var(--main-color)] hover:underline text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-blue-600">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseReport;
