
import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ShowOffDay from "../../popup/ShowOffDay";
import { useDispatch, useSelector } from "react-redux";
import { getDayOffRequests } from "../../../redux/attendenceSlice";

/* ---------------- STATUS META ---------------- */

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

};

const statusFilters = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },

];

/* ---------------- MAIN COMPONENT ---------------- */

const DayOffRequestsPage = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state?.auth?.data);
  const userId = user?._id;

  const { dayOffRequests, isLoading } = useSelector(
    (state) => state.attendance
  );

  const [filter, setFilter] = useState("ALL");
  const [showDayOffModal, setShowDayOffModal] = useState(false);

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    if (userId) {
      dispatch(getDayOffRequests({ userId }));
    }
  }, [dispatch, userId]);

  /* ---------------- HELPERS ---------------- */

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "—";

  const leaves = dayOffRequests || [];
  console.log(leaves, "leaves")

  const filteredRequests = useMemo(() => {
    if (filter === "ALL") return leaves;
    return leaves.filter((r) => r.status === filter);
  }, [filter, leaves]);

  console.log("filtered", filteredRequests)
  const counters = useMemo(() => {
    const base = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,

    };

    leaves.forEach((r) => {
      if (base[r.status] !== undefined) {
        base[r.status]++;
      }
    });

    return base;
  }, [leaves]);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-full p-4">

        {/* HEADER */}
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-300" />
            </button>

            <div>
              <h1 className="text-2xl font-semibold">My Day-Off Requests</h1>
              <p className="mt-1 text-sm text-slate-400">
                Track the status of your submitted requests
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDayOffModal(true)}
            className="rounded-xl px-4 py-2 text-sm border border-sky-600/60 bg-slate-900/70 text-sky-100 hover:bg-sky-500/20"
          >
            + Request Day Off
          </button>
        </header>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Pending */}
          <div className="border border-yellow-400 rounded-lg p-4">
            <p className="text-xs text-yellow-400 uppercase mb-1">Pending</p>
            <h2 className="text-2xl font-bold text-yellow-400">0</h2>
          </div>

          {/* Approved */}
          <div className="border border-emerald-400 rounded-lg p-4">
            <p className="text-xs text-emerald-400 uppercase mb-1">Approved</p>
            <h2 className="text-2xl font-bold text-emerald-400">1</h2>
          </div>

          {/* Rejected */}
          <div className="border border-rose-400 rounded-lg p-4">
            <p className="text-xs text-rose-400 uppercase mb-1">Rejected</p>
            <h2 className="text-2xl font-bold text-rose-400">0</h2>
          </div>

        </div>


        {/* FILTERS */}
        <section className="mb-4 flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={`rounded-full px-3 py-1 text-xs border ${filter === s.id
                ? "border-sky-400 bg-sky-500/20"
                : "border-slate-600 bg-slate-900/60"
                }`}
            >
              {s.label}
            </button>
          ))}
        </section>

        {/* TABLE */}
        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <Th>Requested At</Th>
                <Th>Day-Off Dates</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Approved By</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => {
                  const meta = statusMeta[r.status] || statusMeta.PENDING;

                  return (
                    <tr key={r.requestId}>
                      <Td>{formatDate(r.startDate)}</Td>

                      <Td>
                        {formatDate(r.startDate)}
                        {r.duration === "multiple" &&
                          ` → ${formatDate(r.endDate)}`}
                      </Td>

                      <Td>{r.attachmentType}</Td>

                      <Td>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs ${meta.badgeClass}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${meta.dotClass}`}
                          />
                          {meta.label}
                        </span>
                      </Td>
                      <Td>
                        <span
                          className="capitalize"
                        // className={`inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs ${meta.badgeClass}`}
                        >
                          {r.approvedBy}
                        </span>
                      </Td>


                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      </div>

      {/* MODAL */}
      {showDayOffModal && (
        <ShowOffDay
          userId={userId}
          setShowDayOffModal={setShowDayOffModal} />
      )}
    </div>
  );
};

/* ---------------- SMALL COMPONENTS ---------------- */

const Th = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">
    {children}
  </th>
);

const Td = ({ children }) => (
  <td className="px-4 py-3 text-slate-100">{children}</td>
);

const SummaryCard = ({ label, value, className = '' }) => (
  <div className={`rounded-xl border bg-slate-900/60 px-4 py-3 ${className}`} >
    <p className={`text-xs uppercase text-slate-400 ${className}`} > {label}</p >
    <p className={`text-2xl font-semibold ${className}`} > {value}</p>
  </div >
);

export default DayOffRequestsPage;
