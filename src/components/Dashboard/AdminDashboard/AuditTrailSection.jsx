import React, { useEffect, useMemo, useState } from "react";
import { Download, Search, Filter, Calendar, User, Settings, FileText, Shield, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAuditTrail } from "../../../redux/auditTrailSlice";

// const MOCK_AUDIT_LOGS = [
//   {
//     id: "1",
//     timestamp: "2025-12-08T09:05:10",
//     actorName: "Lekh Raj",
//     actorRole: "Admin",
//     module: "Directory",
//     eventType: "MANPOWER_CREATE",
//     entityType: "User",
//     entityLabel: "Rahul Sharma (CSR Department)",
//     details: "Added new manpower record with role CSR and day shift.",
//   },
//   {
//     id: "2",
//     timestamp: "2025-12-08T09:22:34",
//     actorName: "Lekh Raj",
//     actorRole: "Admin",
//     module: "OverallAttendance",
//     eventType: "ATTENDANCE_STATUS_UPDATE",
//     entityType: "Attendance",
//     entityLabel: "Attendance for Rahul Sharma on 2025-12-08",
//     details: "Status changed from Late to Half Day with remark: approved by Admin.",
//   },
//   {
//     id: "3",
//     timestamp: "2025-12-08T09:40:02",
//     actorName: "Lekh Raj",
//     actorRole: "Admin",
//     module: "LoginCredentials",
//     eventType: "CREDENTIAL_UPDATE",
//     entityType: "Credentials",
//     entityLabel: "Login for user EMP-102 (Simran Kaur)",
//     details: "Updated login email from simran.old@example.com to simran.new@example.com.",
//   },
//   {
//     id: "4",
//     timestamp: "2025-12-08T09:55:18",
//     actorName: "Lekh Raj",
//     actorRole: "Admin",
//     module: "LoginCredentials",
//     eventType: "CREDENTIAL_DELETE",
//     entityType: "Credentials",
//     entityLabel: "Login for user EMP-099 (Meera Joshi)",
//     details: "Disabled login after resignation (soft deactivation).",
//   },
//   {
//     id: "5",
//     timestamp: "2025-12-08T10:10:45",
//     actorName: "Lekh Raj",
//     actorRole: "Admin",
//     module: "Announcements",
//     eventType: "ANNOUNCEMENT_CREATE",
//     entityType: "Announcement",
//     entityLabel: "Dec 2025 – Attendance Policy Reminder",
//     details: "Created announcement targeting all departments.",
//   },
//   {
//     id: "6",
//     timestamp: "2025-12-08T10:12:30",
//     actorName: "Lekh Raj",
//     actorRole: "Admin",
//     module: "Announcements",
//     eventType: "ANNOUNCEMENT_SEND",
//     entityType: "Announcement",
//     entityLabel: "Dec 2025 – Attendance Policy Reminder",
//     details: "Published announcement to CSR, Deposit, Withdrawal, Marketing.",
//   },
//   {
//     id: "7",
//     timestamp: "2025-12-08T11:05:00",
//     actorName: "Lekh Raj",
//     actorRole: "Admin",
//     module: "Reports",
//     eventType: "REPORT_CREATE",
//     entityType: "Report",
//     entityLabel: "CSR Monthly Attendance Summary – Nov 2025",
//     details: "Created monthly attendance and violation summary for CSR department.",
//   },
//   {
//     id: "8",
//     timestamp: "2025-12-08T11:06:40",
//     actorName: "Lekh Raj",
//     actorRole: "Admin",
//     module: "Reports",
//     eventType: "REPORT_SEND_TO_SUPER_ADMIN",
//     entityType: "Report",
//     entityLabel: "CSR Monthly Attendance Summary – Nov 2025",
//     details: "Sent report to Super Admin for review.",
//   },
//   {
//     id: "9",
//     timestamp: "2025-12-08T11:30:15",
//     actorName: "Lekh Raj",
//     actorRole: "Admin",
//     module: "ShiftingManagement",
//     eventType: "SHIFT_CHANGE",
//     entityType: "Shift",
//     entityLabel: "All CSR Department members",
//     details: "Changed shift from 09:30–18:30 to 10:00–19:00 effective 2025-12-15.",
//   },
//   {
//     id: "10",
//     timestamp: "2025-12-08T12:05:55",
//     actorName: "Chandan Kumar",
//     actorRole: "Checker",
//     module: "OverallAttendance",
//     eventType: "FILE_EXPORT",
//     entityType: "Export",
//     entityLabel: "overall-attendance-2025-12-08.csv",
//     details: "Exported overall attendance with filters: Dept: CSR, Date: 2025-12-08, Status: Absent, Late.",
//   },
//   {
//     id: "11",
//     timestamp: "2025-12-08T12:15:20",
//     actorName: "Chandan Kumar",
//     actorRole: "Checker",
//     module: "DailyPunchRecord",
//     eventType: "FILE_EXPORT",
//     entityType: "Export",
//     entityLabel: "punch-record-CSR-2025-12-07.csv",
//     details: "Exported daily punch record for CSR department (view-only permission).",
//   },
//   {
//     id: "12",
//     timestamp: "2025-12-08T13:05:05",
//     actorName: "Rahul Sharma",
//     actorRole: "Team Leader – CSR",
//     module: "ScheduleRestday",
//     eventType: "DAYOFF_APPROVE",
//     entityType: "DayOffRequest",
//     entityLabel: "Day off request REQ-CSR-145 (Simran Kaur)",
//     details: "Approved day off on 2025-12-10 (Type: Vacation) for CSR member Simran Kaur.",
//   },
//   {
//     id: "13",
//     timestamp: "2025-12-08T13:25:30",
//     actorName: "Rahul Sharma",
//     actorRole: "Team Leader – CSR",
//     module: "DailyPunchRecord",
//     eventType: "WARNING_LETTER_SEND",
//     entityType: "WarningLetter",
//     entityLabel: "Warning letter WL-2025-077 (Deepak Singh)",
//     details: "Sent warning letter for 3 consecutive late punches (2025-12-01 to 2025-12-03).",
//   },
//   {
//     id: "14",
//     timestamp: "2025-12-08T14:00:10",
//     actorName: "Rahul Sharma",
//     actorRole: "Team Leader – CSR",
//     module: "ShiftingManagement",
//     eventType: "SHIFT_CHANGE",
//     entityType: "Shift",
//     entityLabel: "CSR Department members: EMP-101, EMP-102, EMP-103",
//     details: "Changed shift from 12:00–21:00 to 14:00–23:00 for selected CSR team members.",
//   },
//   {
//     id: "15",
//     timestamp: "2025-12-08T15:10:00",
//     actorName: "Suraj Sharma",
//     actorRole: "Super Admin",
//     module: "Files",
//     eventType: "FILE_DELETE",
//     entityType: "File",
//     entityLabel: "old-audit-backup-2025-10.csv",
//     details: "Deleted outdated audit log backup file.",
//   },
//   {
//     id: "16",
//     timestamp: "2025-12-08T15:20:45",
//     actorName: "Suraj Sharma",
//     actorRole: "Super Admin",
//     module: "Exports",
//     eventType: "FILE_EXPORT",
//     entityType: "Export",
//     entityLabel: "full-audit-trail-2025-12-08.csv",
//     details: "Exported full audit trail for daily governance review and backup.",
//   },
// ];

const moduleOptions = [
  "All Modules",
  "Directory",
  "Manpower",
  "Attendance",
  "OverallAttendance",
  "Files",
  "Exports",
  "Announcements",
  "LoginCredentials",
  "Reports",
  "ShiftingManagement",
  "ScheduleRestday",
  "DailyPunchRecord",
];

const eventTypeOptions = [
  "All Events",
  "MANPOWER_CREATE",
  "USER_UPDATE",
  "ATTENDANCE_STATUS_UPDATE",
  "FILE_DELETE",
  "FILE_EXPORT",
  "ANNOUNCEMENT_CREATE",
  "ANNOUNCEMENT_SEND",
  "CREDENTIAL_UPDATE",
  "CREDENTIAL_DELETE",
  "REPORT_CREATE",
  "REPORT_SEND_TO_SUPER_ADMIN",
  "SHIFT_CHANGE",
  "DAYOFF_APPROVE",
  "WARNING_LETTER_SEND",
];

const AuditTrailSection = () => {
  const dispatch = useDispatch()
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Modules");
  const [eventTypeFilter, setEventTypeFilter] = useState("All Events");
  const [actorFilter, setActorFilter] = useState("All Users");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  // const [auditTrail, setAuditTrail] = useState([]);
  const { auditTrails = [] } = useSelector(state => state.auditTrail || {});

  useEffect(() => {
    dispatch(getAuditTrail());
  }, []);


  const actorOptions = useMemo(() => {
    const set = new Set(auditTrails.map((l) => l.actorName));
    return ["All Users", ...Array.from(set)];
  }, []);

  const filteredLogs = useMemo(() => {
    return auditTrails.filter((log) => {
      const dateOnly = log.timestamp.slice(0, 10);
      let matchDate = true;
      if (dateFrom && dateOnly < dateFrom) matchDate = false;
      if (dateTo && dateOnly > dateTo) matchDate = false;

      const matchModule =
        moduleFilter === "All Modules" || log.module === moduleFilter;
      const matchEvent =
        eventTypeFilter === "All Events" || log.eventType === eventTypeFilter;
      const matchActor =
        actorFilter === "All Users" || log.actorName === actorFilter;

      const q = search.trim().toLowerCase();
      const matchSearch = !q
        ? true
        : [log.actorName, log.actorRole, log.entityLabel, log.details, log.module]
          .join(" ")
          .toLowerCase()
          .includes(q);

      return matchDate && matchModule && matchEvent && matchActor && matchSearch;
    }).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }, [dateFrom, dateTo, moduleFilter, eventTypeFilter, actorFilter, search]);

  const handleExport = () => {
    const header = [
      "Timestamp",
      "Actor",
      "Role",
      "Module",
      "Event Type",
      "Entity",
      "Details",
    ];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.actorName,
      l.actorRole,
      l.module,
      l.eventType,
      l.entityLabel,
      l.details,
    ]);
    const csvContent = [header, ...rows]
      .map((cols) =>
        cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    console.log("filterd", filteredLogs);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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

  const formatTimestamp = (ts) => {
    return ts.replace("T", " ").slice(0, 16);
  };

  const renderEventLabel = (type) => {
    switch (type) {
      case "MANPOWER_CREATE":
        return "Added new manpower";
      case "USER_UPDATE":
        return "Updated user";
      case "ATTENDANCE_STATUS_UPDATE":
        return "Updated attendance status";
      case "FILE_DELETE":
        return "Deleted file";
      case "FILE_EXPORT":
        return "Exported file";
      case "ANNOUNCEMENT_CREATE":
        return "Created announcement";
      case "ANNOUNCEMENT_SEND":
        return "Sent announcement";
      case "CREDENTIAL_UPDATE":
        return "Updated login credentials";
      case "CREDENTIAL_DELETE":
        return "Deleted login credentials";
      case "REPORT_CREATE":
        return "Created report";
      case "REPORT_SEND_TO_SUPER_ADMIN":
        return "Sent report to Super Admin";
      case "SHIFT_CHANGE":
        return "Changed shift";
      case "DAYOFF_APPROVE":
        return "Approved day off";
      case "WARNING_LETTER_SEND":
        return "Sent warning letter";
      default:
        return type;
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "MANPOWER_CREATE":
      case "USER_UPDATE":
        return <User className="h-4 w-4" />;
      case "ATTENDANCE_STATUS_UPDATE":
        return <Clock className="h-4 w-4" />;
      case "FILE_DELETE":
        return <XCircle className="h-4 w-4" />;
      case "FILE_EXPORT":
        return <Download className="h-4 w-4" />;
      case "ANNOUNCEMENT_CREATE":
      case "ANNOUNCEMENT_SEND":
        return <AlertCircle className="h-4 w-4" />;
      case "CREDENTIAL_UPDATE":
      case "CREDENTIAL_DELETE":
        return <Shield className="h-4 w-4" />;
      case "REPORT_CREATE":
      case "REPORT_SEND_TO_SUPER_ADMIN":
        return <FileText className="h-4 w-4" />;
      case "DAYOFF_APPROVE":
        return <CheckCircle className="h-4 w-4" />;
      case "WARNING_LETTER_SEND":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getEventColor = (type) => {
    if (type.includes("DELETE") || type.includes("WARNING")) return "text-red-400 bg-red-500/10";
    if (type.includes("APPROVE") || type.includes("CREATE")) return "text-green-400 bg-green-500/10";
    if (type.includes("UPDATE")) return "text-blue-400 bg-blue-500/10";
    if (type.includes("EXPORT")) return "text-purple-400 bg-purple-500/10";
    return "text-cyan-400 bg-cyan-500/10";
  };

  return (
    <div className="min-h-screen  p-6">
      <div className="mx-auto max-w-full">
        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg bg-gray-800 shadow-blue-500/30">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="bg-white bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                Audit Trail
              </h1>
            </div>
            <p className="ml-15 text-sm text-slate-400">
              Comprehensive oversight for Admin, Checker and Team Leader across directory, attendance, shifts, credentials, announcements, reports and exports
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-900/50"
          >
            <Download className="h-4 w-4" />
            Export Logs
          </button>
        </div>

        {/* Search Bar & Filter Toggle */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, entity, module, or details..."
              className="h-12 w-full rounded-xl border border-slate-700/50 bg-slate-900/60 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 shadow-inner backdrop-blur-sm transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-6 text-sm font-medium transition-all ${showFilters
              ? "border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/20"
              : "border-slate-700/50 bg-slate-900/60 text-slate-400 hover:bg-slate-800/60"
              }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
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
                  Module
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
                  Event Type
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
                  <User className="h-3.5 w-3.5" />
                  User
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

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing <span className="font-semibold text-blue-400">{auditTrails.length}</span> of{" "}
            <span className="font-semibold text-slate-300">{auditTrails.length}</span> records
          </p>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-700/50  shadow-2xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/50">
                  <Th className="w-40">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Timestamp
                    </div>
                  </Th>
                  <Th className="w-48">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User
                    </div>
                  </Th>
                  <Th className="w-32">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Module
                    </div>
                  </Th>
                  <Th className="w-48">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Action
                    </div>
                  </Th>
                  <Th className="w-64">Target</Th>
                  <Th>Details</Th>
                </tr>
              </thead>
              <tbody>
                {auditTrails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50">
                          <AlertCircle className="h-8 w-8 text-slate-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                          No audit records match the current filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  auditTrails.map((log, idx) => (
                    <tr
                      key={log.id}
                      className="group border-b border-slate-800/50 transition-colors hover:bg-slate-800/30"
                    >
                      <Td>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5 text-slate-600" />
                          {formatTimestamp(log.date)}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-3">

                          <div>
                            <div className="text-sm font-medium text-slate-200">{log.userName}</div>
                            <div className="text-xs text-slate-500">{log.actorRole}</div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/50 px-2.5 py-1 text-xs font-medium text-slate-300">
                          {log.action}
                        </span>
                      </Td>
                      <Td>
                        <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${getEventColor(log.details)}`}>
                          {getEventIcon(log.details)}
                          {renderEventLabel(log.details)}
                        </div>
                      </Td>
                      <Td>
                        <div className="text-sm font-medium text-slate-300">{log.target}</div>
                      </Td>
                      <Td>
                        <div className="text-sm text-slate-400">{log.details}</div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-blue-400">Security Notice:</span> Super admins can use this audit trail to review sensitive changes and exports for compliance and governance purposes.
          </p>
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