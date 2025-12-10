import React, { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ShowOffDay from "../../popup/ShowOffDay";

const MOCK_REQUESTS = [
  {
    id: "DO-2025-1205-001",
    requestedAt: "2025-12-05 09:14",
    dayOffDate: "2025-12-10",
    typeOfLeave: "Rest Day",
    status: "PENDING",
    approver: null,
    lastUpdated: "2025-12-05 09:14",
    reason: "Family event in the afternoon.",
  },
  {
    id: "DO-2025-1201-002",
    requestedAt: "2025-12-01 10:02",
    dayOffDate: "2025-12-03",
    typeOfLeave: "Rest Day",
    status: "APPROVED",
    approver: "Suraj (Team Lead)",
    lastUpdated: "2025-12-01 15:47",
    reason: "Medical appointment.",
  },
  {
    id: "DO-2025-1128-003",
    requestedAt: "2025-11-28 16:20",
    dayOffDate: "2025-11-30",
    typeOfLeave: "Rest Day",
    status: "REJECTED",
    approver: "HR Desk",
    lastUpdated: "2025-11-29 11:05",
    reason: "Team already at minimum staffing.",
  },
  {
    id: "DO-2025-1120-004",
    requestedAt: "2025-11-20 13:05",
    dayOffDate: "2025-11-22",
    typeOfLeave: "Rest Day",
    status: "CANCELLED",
    approver: null,
    lastUpdated: "2025-11-21 09:30",
    reason: "User cancelled request.",
  },
];

const statusMeta = {
  PENDING: {
    label: "Pending",
    badgeClass: "border-amber-400/70 bg-amber-500/10 text-amber-200",
    dotClass: "bg-amber-400",
  },
  APPROVED: {
    label: "Approved",
    badgeClass: "border-emerald-400/70 bg-emerald-500/10 text-emerald-200",
    dotClass: "bg-emerald-400",
  },
  REJECTED: {
    label: "Rejected",
    badgeClass: "border-rose-400/70 bg-rose-500/10 text-rose-200",
    dotClass: "bg-rose-400",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "border-slate-500/70 bg-slate-700/40 text-slate-200",
    dotClass: "bg-slate-400",
  },
};

const statusFilters = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
  { id: "CANCELLED", label: "Cancelled" },
];

const DayOffRequestsPage = () => {
  const [filter, setFilter] = useState("ALL");

  // 🔥 Day-Off Modal Form State
  const [showDayOffModal, setShowDayOffModal] = useState(false);
  const [dayOffForm, setDayOffForm] = useState({
    date: "",
    reason: "",
    type: "Rest Day",
  });

  const filteredRequests = useMemo(() => {
    if (filter === "ALL") return MOCK_REQUESTS;
    return MOCK_REQUESTS.filter((r) => r.status === filter);
  }, [filter]);

  const counters = useMemo(() => {
    return MOCK_REQUESTS.reduce(
      (acc, r) => {
        acc[r.status] += 1;
        return acc;
      },
      {
        PENDING: 0,
        APPROVED: 0,
        REJECTED: 0,
        CANCELLED: 0,
      }
    );
  }, []);

  // 🔥 Submit Request
  const handleDayOffSubmit = () => {
    console.log("Submitting:", dayOffForm);
    setShowDayOffModal(false);
    setDayOffForm({ date: "", reason: "", type: "Rest Day" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-full p-4">

        {/* ---------------- HEADER ---------------- */}
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="flex items-start gap-4">

            {/* Back Button */}
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-300" />
            </button>

            {/* Title */}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
                My Day-Off Requests
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Track the status of your submitted day-off requests.
              </p>
            </div>

          </div>

          <button
            onClick={() => setShowDayOffModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm border border-sky-600/60 bg-slate-900/70 text-sky-100 hover:bg-sky-500/20 hover:border-sky-400 transition-all"
          >
            + Request Day Off
          </button>
        </header>

        {/* ---------------- SUMMARY CARDS ---------------- */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <SummaryCard label="Pending" value={counters.PENDING} helper="Waiting for approval" />
          <SummaryCard label="Approved" value={counters.APPROVED} helper="Granted day off" />
          <SummaryCard label="Rejected" value={counters.REJECTED} helper="Not approved" />
          <SummaryCard label="Cancelled" value={counters.CANCELLED} helper="Withdrawn requests" />
        </section>

        {/* ---------------- FILTERS ---------------- */}
        <section className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Status filter:
          </span>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((s) => {
              const isActive = filter === s.id;

              return (
                <button
                  key={s.id}
                  onClick={() => setFilter(s.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    isActive
                      ? "border-sky-400 bg-sky-500/20 text-sky-100"
                      : "border-slate-600 bg-slate-900/60 text-slate-300 hover:border-sky-400/70 hover:text-sky-100"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------------- TABLE ---------------- */}
        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-slate-950/60">

          {/* Desktop */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-slate-800/80 text-sm">
              <thead className="bg-slate-900/80">
                <tr>
                  <Th>Date Requested</Th>
                  <Th>Day-Off Date</Th>
                  <Th>Type of Leave</Th>
                  <Th>Status</Th>
                  <Th>Approver</Th>
                  <Th>Last Update</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-slate-400">
                      No requests found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((r) => {
                    const meta = statusMeta[r.status];

                    return (
                      <tr key={r.id} className="hover:bg-slate-900/80 transition">
                        <Td>{r.requestedAt}</Td>
                        <Td>{r.dayOffDate}</Td>
                        <Td>{r.typeOfLeave}</Td>

                        <Td>
                          <span className="inline-flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badgeClass}`}>
                              {meta.label}
                            </span>
                          </span>
                        </Td>

                        <Td>{r.approver ?? "—"}</Td>
                        <Td>{r.lastUpdated}</Td>

                        <Td className="text-right">
                          <button
                            onClick={() => alert(`Show details for ${r.id}`)}
                            className="text-xs font-medium text-sky-300 hover:text-sky-100"
                          >
                            View Details
                          </button>
                        </Td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </section>

        <p className="mt-4 text-xs text-slate-500">
          Only day-off requests submitted from your account are shown here.
        </p>

      </div>

      {/* ---------------- MODAL HERE ---------------- */}
      {showDayOffModal && (
        <ShowOffDay
          dayOffForm={dayOffForm}
          setDayOffForm={setDayOffForm}
          handleDayOffSubmit={handleDayOffSubmit}
          setShowDayOffModal={setShowDayOffModal}
        />
      )}
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */

const Th = ({ children, className = "", ...rest }) => (
  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 ${className}`} {...rest}>
    {children}
  </th>
);

const Td = ({ children, className = "", ...rest }) => (
  <td className={`px-4 py-3 align-top text-sm text-slate-100 ${className}`} {...rest}>
    {children}
  </td>
);

const SummaryCard = ({ label, value, helper }) => (
  <div className="rounded-xl border bg-slate-900/60 px-4 py-3 shadow shadow-slate-950/60">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-2xl font-semibold text-slate-50">{value}</p>
    <p className="mt-1 text-[11px] text-slate-400">{helper}</p>
  </div>
);

export default DayOffRequestsPage;
