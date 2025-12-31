import React, { useEffect, useMemo, useState } from "react";
import {
  Download, Search, Filter, Calendar, User, Settings, FileText,
  Shield, AlertCircle, CheckCircle, XCircle, Clock, Mail, Users,
  FileUp, FileDown, Bell, Key,
  WifiOff, Stethoscope, Home, Building, Database, Upload,
  Trash2, Edit, Send, Eye, FileCheck, CalendarDays
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAuditTrail } from "../../../redux/auditTrailSlice";

const AuditTrailSection = () => {
  const dispatch = useDispatch();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Modules");
  const [eventTypeFilter, setEventTypeFilter] = useState("All Events");
  const [actorFilter, setActorFilter] = useState("All Users");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Get data from Redux - Dynamic from backend
  const { auditTrails = [], loading = false } = useSelector(state => state.auditTrail || {});
  console.log(auditTrails)
  useEffect(() => {
    dispatch(getAuditTrail());
  }, [dispatch]);

  // DYNAMIC FUNCTIONS - Auto-detect from backend data

  // Extract all unique modules from backend data
  const moduleOptions = useMemo(() => {
    if (!auditTrails || auditTrails.length === 0) return ["All Modules"];
    const modules = new Set(auditTrails.map(log => log.module || log.action || "Other"));
    return ["All Modules", ...Array.from(modules).sort()];
  }, [auditTrails]);

  // Extract all unique event types from backend data
  const eventTypeOptions = useMemo(() => {
    if (!auditTrails || auditTrails.length === 0) return ["All Events"];
    const events = new Set(auditTrails.map(log =>
      log.eventType || log.details || log.action || "Unknown"
    ));
    return ["All Events", ...Array.from(events).sort()];
  }, [auditTrails]);

  // Extract all unique departments from backend data
  const departmentOptions = useMemo(() => {
    if (!auditTrails || auditTrails.length === 0) return ["All Departments"];
    const depts = new Set(auditTrails.map(log =>
      log.department || log.actorRole || log.role || "Unknown"
    ));
    return ["All Departments", ...Array.from(depts).sort()];
  }, [auditTrails]);

  // Extract all unique users from backend data
  const actorOptions = useMemo(() => {
    if (!auditTrails || auditTrails.length === 0) return ["All Users"];
    const users = new Set(auditTrails.map(log =>
      log.userName || log.actorName || log.user || "Unknown"
    ));
    return ["All Users", ...Array.from(users).sort()];
  }, [auditTrails]);

  // Convert to Philippine time zone (UTC+8)
  const convertToPhilippineTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;

      // Convert to Philippines time (UTC+8)
      const phTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
      return phTime.toISOString().replace('T', ' ').slice(0, 19);
    } catch (error) {
      return timestamp;
    }
  };

  // DYNAMIC COLOR AND ICON MAPPING
  const getEventConfig = (eventType, module) => {
    const eventStr = String(eventType || "").toLowerCase();
    const moduleStr = String(module || "").toLowerCase();

    // Priority: Specific event types first
    if (eventStr.includes("sick") || eventStr.includes("medical")) {
      return {
        icon: <Stethoscope className="h-4 w-4" />,
        color: "text-red-400 bg-red-500/10",
        badgeColor: "bg-red-500/20 border-red-500/30",
        typeLabel: "Sick Leave"
      };
    }

    if (eventStr.includes("internet") || eventStr.includes("network") || eventStr.includes("wifi")) {
      return {
        icon: <WifiOff className="h-4 w-4" />,
        color: "text-orange-400 bg-orange-500/10",
        badgeColor: "bg-orange-500/20 border-orange-500/30",
        typeLabel: "Internet Issue"
      };
    }

    if (eventStr.includes("warning") || eventStr.includes("letter")) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        color: "text-red-500 bg-red-600/10",
        badgeColor: "bg-red-600/20 border-red-600/30",
        typeLabel: "Warning Letter"
      };
    }

    if (eventStr.includes("dayoff") || eventStr.includes("leave") || eventStr.includes("vacation")) {
      return {
        icon: <Sun className="h-4 w-4" />,
        color: "text-green-400 bg-green-500/10",
        badgeColor: "bg-green-500/20 border-green-500/30",
        typeLabel: "Day Off"
      };
    }

    if (eventStr.includes("shift") || eventStr.includes("schedule")) {
      return {
        icon: <Shift className="h-4 w-4" />,
        color: "text-blue-400 bg-blue-500/10",
        badgeColor: "bg-blue-500/20 border-blue-500/30",
        typeLabel: "Shift Change"
      };
    }

    if (eventStr.includes("export") || eventStr.includes("download")) {
      return {
        icon: <Download className="h-4 w-4" />,
        color: "text-purple-400 bg-purple-500/10",
        badgeColor: "bg-purple-500/20 border-purple-500/30",
        typeLabel: "Export"
      };
    }

    if (eventStr.includes("delete") || eventStr.includes("remove")) {
      return {
        icon: <Trash2 className="h-4 w-4" />,
        color: "text-red-300 bg-red-400/10",
        badgeColor: "bg-red-400/20 border-red-400/30",
        typeLabel: "Deletion"
      };
    }

    if (eventStr.includes("create") || eventStr.includes("add")) {
      return {
        icon: <FileUp className="h-4 w-4" />,
        color: "text-green-300 bg-green-400/10",
        badgeColor: "bg-green-400/20 border-green-400/30",
        typeLabel: "Creation"
      };
    }

    if (eventStr.includes("update") || eventStr.includes("edit")) {
      return {
        icon: <Edit className="h-4 w-4" />,
        color: "text-yellow-400 bg-yellow-500/10",
        badgeColor: "bg-yellow-500/20 border-yellow-500/30",
        typeLabel: "Update"
      };
    }

    if (eventStr.includes("report") || moduleStr.includes("report")) {
      return {
        icon: <ReportMedical className="h-4 w-4" />,
        color: "text-indigo-400 bg-indigo-500/10",
        badgeColor: "bg-indigo-500/20 border-indigo-500/30",
        typeLabel: "Report"
      };
    }

    if (eventStr.includes("attendance") || moduleStr.includes("attendance")) {
      return {
        icon: <Clock className="h-4 w-4" />,
        color: "text-cyan-400 bg-cyan-500/10",
        badgeColor: "bg-cyan-500/20 border-cyan-500/30",
        typeLabel: "Attendance"
      };
    }

    if (eventStr.includes("backup") || moduleStr.includes("backup")) {
      return {
        icon: <Database className="h-4 w-4" />,
        color: "text-gray-400 bg-gray-500/10",
        badgeColor: "bg-gray-500/20 border-gray-500/30",
        typeLabel: "Backup"
      };
    }

    if (eventStr.includes("contact") || moduleStr.includes("contact")) {
      return {
        icon: <Users className="h-4 w-4" />,
        color: "text-pink-400 bg-pink-500/10",
        badgeColor: "bg-pink-500/20 border-pink-500/30",
        typeLabel: "Contact"
      };
    }

    // Default based on module
    if (moduleStr.includes("csr") || moduleStr.includes("team")) {
      return {
        icon: <Users className="h-4 w-4" />,
        color: "text-blue-300 bg-blue-400/10",
        badgeColor: "bg-blue-400/20 border-blue-400/30",
        typeLabel: "CSR Team"
      };
    }

    if (moduleStr.includes("admin") || moduleStr.includes("super")) {
      return {
        icon: <Shield className="h-4 w-4" />,
        color: "text-purple-300 bg-purple-400/10",
        badgeColor: "bg-purple-400/20 border-purple-400/30",
        typeLabel: "Admin"
      };
    }

    // Ultimate fallback
    return {
      icon: <Settings className="h-4 w-4" />,
      color: "text-slate-400 bg-slate-500/10",
      badgeColor: "bg-slate-500/20 border-slate-500/30",
      typeLabel: eventType || "Event"
    };
  };

  // DYNAMIC USER COLOR MAPPING
  const getUserConfig = (userName, role) => {
    const name = String(userName || "").toLowerCase();
    const roleStr = String(role || "").toLowerCase();

    if (name.includes("sung") || roleStr.includes("super admin")) {
      return {
        avatarColor: "bg-gradient-to-r from-purple-600 to-indigo-600",
        textColor: "text-purple-300",
        roleColor: "text-purple-400",
        icon: <Shield className="h-4 w-4" />
      };
    }

    if (name.includes("ra") || roleStr.includes("Team-Leader")) {
      return {
        avatarColor: "bg-gradient-to-r from-blue-600 to-cyan-600",
        textColor: "text-blue-300",
        roleColor: "text-blue-400",
        icon: <Users className="h-4 w-4" />
      };
    }

    if (name.includes("chandan") || roleStr.includes("checker")) {
      return {
        avatarColor: "bg-gradient-to-r from-green-600 to-emerald-600",
        textColor: "text-green-300",
        roleColor: "text-green-400",
        icon: <FileCheck className="h-4 w-4" />
      };
    }

    if (name.includes("lakh") || roleStr.includes("Admin")) {
      return {
        avatarColor: "bg-gradient-to-r from-gray-600 to-slate-600",
        textColor: "text-gray-300",
        roleColor: "text-gray-400",
        icon: <Settings className="h-4 w-4" />
      };
    }

    if (roleStr.includes("csr")) {
      return {
        avatarColor: "bg-gradient-to-r from-cyan-600 to-blue-500",
        textColor: "text-cyan-300",
        roleColor: "text-cyan-400",
        icon: <User className="h-4 w-4" />
      };
    }

    // Default
    return {
      avatarColor: "bg-gradient-to-r from-slate-600 to-gray-600",
      textColor: "text-slate-300",
      roleColor: "text-slate-400",
      icon: <User className="h-4 w-4" />
    };
  };

  // Filter logs dynamically
  const filteredLogs = useMemo(() => {
    if (!auditTrails || auditTrails.length === 0) return [];

    return auditTrails.filter((log) => {
      // Extract date
      let logDate;
      try {
        const dateObj = new Date(log.timestamp || log.date || log.createdAt);
        logDate = !isNaN(dateObj.getTime())
          ? dateObj.toISOString().slice(0, 10)
          : (log.timestamp || log.date || "").slice(0, 10);
      } catch {
        logDate = (log.timestamp || log.date || "").slice(0, 10);
      }

      // Date filter
      let matchDate = true;
      if (dateFrom && logDate < dateFrom) matchDate = false;
      if (dateTo && logDate > dateTo) matchDate = false;

      // Module filter
      const logModule = log.module || log.action || log.category || "";
      const matchModule = moduleFilter === "All Modules" || logModule === moduleFilter;

      // Event type filter
      const logEventType = log.eventType || log.details || log.action || "";
      const matchEvent = eventTypeFilter === "All Events" || logEventType === eventTypeFilter;

      // Actor filter
      const logActor = log.userName || log.actorName || log.user || "";
      const matchActor = actorFilter === "All Users" || logActor === actorFilter;

      // Department filter
      const logDept = log.department || log.actorRole || log.role || "";
      const matchDept = departmentFilter === "All Departments" || logDept === departmentFilter;

      // Search filter
      const q = search.trim().toLowerCase();
      const matchSearch = !q ? true : (
        (logActor || "").toLowerCase().includes(q) ||
        (logDept || "").toLowerCase().includes(q) ||
        (log.target || log.entityLabel || log.entity || "").toLowerCase().includes(q) ||
        (log.details || log.description || "").toLowerCase().includes(q) ||
        (logModule || "").toLowerCase().includes(q) ||
        (logEventType || "").toLowerCase().includes(q) ||
        (log.remarks || "").toLowerCase().includes(q)
      );

      return matchDate && matchModule && matchEvent && matchActor && matchDept && matchSearch;
    }).sort((a, b) => {
      const timeA = new Date(a.timestamp || a.date || a.createdAt || 0).getTime();
      const timeB = new Date(b.timestamp || b.date || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [auditTrails, dateFrom, dateTo, moduleFilter, eventTypeFilter, actorFilter, departmentFilter, search]);

  // Generate dynamic remarks based on log data
  const generateRemark = (log) => {
    const module = log.module || log.action || "";
    const eventType = log.eventType || log.details || "";
    const target = log.target || log.entityLabel || "";
    const user = log.userName || log.actorName || "";
    const dept = log.department || log.actorRole || "";
    const details = log.details || log.description || "";

    // Custom remarks based on content
    if (details.includes("sick") || eventType.includes("SICK")) {
      return `🚑 ${user} marked sick leave - Medical case reported`;
    }

    if (details.includes("internet") || eventType.includes("INTERNET")) {
      return `📶 ${user} reported internet connectivity issues`;
    }

    if (details.includes("warning letter") || eventType.includes("WARNING")) {
      return `⚠️ ${user} issued warning letter to ${target}`;
    }

    if (details.includes("day off") || eventType.includes("DAYOFF")) {
      return `🌴 ${user} approved day off for ${target}`;
    }

    if (details.includes("shift change") || eventType.includes("SHIFT")) {
      return `🔄 ${user} changed shift schedule for ${target}`;
    }

    if (details.includes("export") || eventType.includes("EXPORT")) {
      return `📥 ${user} exported ${target} data`;
    }

    if (details.includes("backup")) {
      return `💾 ${user} performed backup operation`;
    }

    if (details.includes("CSR") || dept.includes("CSR")) {
      return `👥 ${user} performed CSR team operation: ${eventType}`;
    }

    // Generic remark
    return `${user} performed ${eventType} in ${module} module`;
  };

  // Export function
  const handleExport = () => {
    if (filteredLogs.length === 0) {
      alert("No data to export");
      return;
    }

    const header = [
      "Timestamp (PH Time)",
      "User",
      "Role/Department",
      "Module",
      "Event Type",
      "Target/Entity",
      "Details",
      "Remarks",
      "Status"
    ];

    const rows = filteredLogs.map((log) => [
      convertToPhilippineTime(log.timestamp || log.date || log.createdAt),
      log.userName || log.actorName || "Unknown",
      log.department || log.actorRole || log.role || "Unknown",
      log.module || log.action || "Unknown",
      log.eventType || log.details || "Unknown",
      log.target || log.entityLabel || log.entity || "N/A",
      log.details || log.description || "No details",
      generateRemark(log),
      log.status || "Completed"
    ]);

    const csvContent = [header, ...rows]
      .map((cols) => cols.map(c => `"${String(c || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `audit-trail-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const phTime = convertToPhilippineTime(timestamp);
    return phTime.slice(0, 16); // Date and time
  };

  // Format for table - full timestamp
  const formatTimestampForTable = (timestamp) => {
    return convertToPhilippineTime(timestamp);
  };

  // Render event label dynamically
  const renderEventLabel = (eventType) => {
    if (!eventType) return "Unknown Event";

    // Convert to readable format
    return eventType
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-full">
        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-gray-800 to-slate-900 shadow-lg shadow-blue-500/30">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Audit Trail
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Dynamic Logs • Real-time Tracking • Department-wise
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Comprehensive oversight with dynamic filtering, color-coded events, and Philippine timezone
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Export Logs ({filteredLogs.length})
          </button>
        </div>

        {/* Search Bar & Filter Toggle */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, department, module, remarks, or details..."
              className="h-12 w-full rounded-xl border border-slate-700/50 bg-slate-900/60 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 shadow-inner backdrop-blur-sm transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium transition-all ${showFilters
              ? "border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/20"
              : "border-slate-700/50 bg-slate-900/60 text-slate-400 hover:bg-slate-800/60"
              }`}
          >
            <Filter className="h-4 w-4" />
            Filters ({showFilters ? "Hide" : "Show"})
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300">
                Dynamic Filters • Auto-detected from Data
              </h3>
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setModuleFilter("All Modules");
                  setEventTypeFilter("All Events");
                  setActorFilter("All Users");
                  setDepartmentFilter("All Departments");
                  setSearch("");
                }}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Clear All Filters
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-700/50 bg-slate-950/60 px-3 text-sm text-slate-200 transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-700/50 bg-slate-950/60 px-3 text-sm text-slate-200 transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Settings className="h-3.5 w-3.5" />
                  Module ({moduleOptions.length - 1})
                </label>
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-700/50 bg-slate-950/60 px-3 text-sm text-slate-200 transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {moduleOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <FileText className="h-3.5 w-3.5" />
                  Event Type ({eventTypeOptions.length - 1})
                </label>
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-700/50 bg-slate-950/60 px-3 text-sm text-slate-200 transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {eventTypeOptions.map((et) => (
                    <option key={et} value={et}>
                      {et === "All Events" ? "All Events" : renderEventLabel(et)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Building className="h-3.5 w-3.5" />
                  Department ({departmentOptions.length - 1})
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-700/50 bg-slate-950/60 px-3 text-sm text-slate-200 transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <User className="h-3.5 w-3.5" />
                  User ({actorOptions.length - 1})
                </label>
                <select
                  value={actorFilter}
                  onChange={(e) => setActorFilter(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-700/50 bg-slate-950/60 px-3 text-sm text-slate-200 transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {actorOptions.map((actor) => (
                    <option key={actor} value={actor}>
                      {actor}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Count and Stats */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-400">
              Showing <span className="font-semibold text-blue-400">{filteredLogs.length}</span> of{" "}
              <span className="font-semibold text-slate-300">{auditTrails.length}</span> records
              {loading && <span className="ml-2 text-yellow-400"> (Loading...)</span>}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-slate-500">Sick/Delete</span>
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
              <span className="text-xs text-slate-500">Internet Issue</span>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-slate-500">Day Off/Create</span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Timezone: Philippine Standard Time (UTC+8)
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-700/50 shadow-2xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80">
                  <Th className="w-48">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Timestamp (PH Time)
                    </div>
                  </Th>
                  <Th className="w-56">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User & Department
                    </div>
                  </Th>
                  <Th className="w-40">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Module
                    </div>
                  </Th>
                  <Th className="w-48">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Event Type
                    </div>
                  </Th>
                  <Th className="w-64">Target/Entity</Th>
                  <Th className="w-80">Remarks</Th>
                  <Th>Details</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                        <p className="text-sm font-medium text-slate-400">
                          Loading dynamic audit trail data...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50">
                          <Database className="h-8 w-8 text-slate-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                          {auditTrails.length === 0
                            ? "No audit records available from backend"
                            : "No records match the current filters"}
                        </p>
                        {auditTrails.length > 0 && (
                          <button
                            onClick={() => {
                              setDateFrom("");
                              setDateTo("");
                              setModuleFilter("All Modules");
                              setEventTypeFilter("All Events");
                              setActorFilter("All Users");
                              setDepartmentFilter("All Departments");
                              setSearch("");
                            }}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                          >
                            Clear all filters to see {auditTrails.length} records
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const userConfig = getUserConfig(
                      log.userName || log.actorName,
                      log.department || log.actorRole
                    );
                    const eventConfig = getEventConfig(
                      log.eventType || log.details,
                      log.module || log.action
                    );
                    const remark = generateRemark(log);

                    return (
                      <tr
                        key={log.id || `${log.timestamp}-${log.userName}`}
                        className="group border-b border-slate-800/50 transition-all hover:bg-slate-800/20"
                      >
                        <Td>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                            <div>
                              <div className="text-sm font-medium text-slate-300">
                                {formatTimestamp(log.timestamp || log.date)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {formatTimestampForTable(log.timestamp || log.date).slice(11)}
                              </div>
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-3">

                            <div>
                              {/* Name + Role (single line) */}
                              <div
                                className={`text-sm font-semibold ${userConfig.textColor} whitespace-nowrap flex items-center gap-1`}
                              >
                                <span className="truncate">
                                  {log?.userId?.name || log?.userName || log?.actorName || "Unknown"}
                                </span>
                                <span className="text-xs opacity-70 shrink-0">
                                  ({log?.userId?.role || log?.actorRole || log?.role || "N/A"})
                                </span>
                              </div>

                              {/* Department */}
                              <div className={`text-xs mt-0.5 ${userConfig.roleColor}`}>
                                {log?.userId?.department || "Unknown Department"}
                              </div>
                            </div>


                          </div>
                        </Td>
                        <Td>
                          <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border ${eventConfig.badgeColor}`}>
                            {log.module || log.action || "Unknown"}
                          </span>
                        </Td>
                        <Td>
                          <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${eventConfig.color}`}>
                            {eventConfig.icon}
                            {eventConfig.typeLabel}
                          </div>
                        </Td>
                        <Td>
                          <div className="max-w-xs truncate text-sm font-medium text-slate-300"
                            title={log.target || log.entityLabel || log.entity || ""}>
                            {log.target || log.entityLabel || log.entity || "N/A"}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {log.entityId || log.targetId || ""}
                          </div>
                        </Td>
                        <Td>
                          <div className="max-w-md text-sm text-slate-300 capitalize">
                            {remark}
                          </div>
                        </Td>
                        <Td>
                          <div className="max-w-lg text-sm text-slate-400"
                            title={log.details || log.description || ""}>
                            {log.details || log.description || "No details provided"}
                          </div>
                        </Td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <Database className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{auditTrails.length}</div>
                <div className="text-xs text-slate-400">Total Records</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/20 p-2">
                <Users className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{actorOptions.length - 1}</div>
                <div className="text-xs text-slate-400">Unique Users</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/20 p-2">
                <Building className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{departmentOptions.length - 1}</div>
                <div className="text-xs text-slate-400">Departments</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-cyan-500/20 p-2">
                <Clock className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">UTC+8</div>
                <div className="text-xs text-slate-400">Philippine Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 p-4">
          <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
          <div className="flex-1">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-blue-400">Dynamic System:</span> This audit trail automatically adapts to your backend data structure. All colors, icons, and filters are generated dynamically based on actual log data.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>• Auto-detects modules from data</div>
              <div>• Dynamic color coding for events</div>
              <div>• Intelligent remarks generation</div>
              <div>• Philippine timezone conversion</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Th = ({ children, className = "", ...rest }) => (
  <th
    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 ${className}`}
    {...rest}
  >
    {children}
  </th>
);

const Td = ({ children, className = "", ...rest }) => (
  <td className={`px-6 py-4 text-sm ${className}`} {...rest}>
    {children}
  </td>
);

export default AuditTrailSection;