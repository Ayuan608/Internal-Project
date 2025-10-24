import React from "react";



export default function RestDay() {
  const kpis = {
    rules_per_day: 324,
    sla_hit_pct: 97.6,
    rule_failures: 2,
    avg_action_latency_ms: 420,
  };

  const attendance = Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    headCount: i + 1,
    dateHired: ["14-Feb-25", "7-Mar-25", "16-Nov-24", "12-Jan-25", "20-Aug-24"][i],
    team: ["Deposit", "Deposit", "CSR", "CSR", "Withdrawal"][i],
    position: ["Staff", "Staff", "Agent", "Senior", "Staff"][i],
    name: ["Ashish Prabhakar", "Lekn Raj", "Chandan Aheer", "Harish Kumar", "Sukhminder Singh"][i],
    schedule: "16:00 - 04:00",
    remark: "12 hrs",
    pattern: new Array(31).fill(0).map((__, idx) => {
      const v = (i + idx) % 4; // 0=Day,1=Night,2=Rest,3=Holiday
      return v;
    }),
  }));

  const nonQuota = [
    { date: "2025-10-17", name: "John Smith", role: "Agent", dept: "CSR", output: 45, target: 50 },
    { date: "2025-10-17", name: "Sarah Johnson", role: "Agent", dept: "Withdrawal", output: 28, target: 35 },
    { date: "2025-10-16", name: "Mike Davis", role: "Agent", dept: "Deposit", output: 38, target: 45 },
    { date: "2025-10-16", name: "Emily Wilson", role: "Agent", dept: "CSR", output: 42, target: 50 },
  ];

  return (
    <div className="min-h-screen  text-slate-100">
      {/* subtle radial glow to mimic screenshot */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-2/3 h-2/3 mx-auto rounded-full opacity-10 blur-3xl bg-teal-500/30 mt-8" />
      </div>

      <div className="relative z-10 flex">
 

        {/* Main content */}
        <main className="flex-1 p-6 lg:pl-8">
   

          {/* KPI strip */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Rules / day" value={kpis.rules_per_day} delta="+12%" />
            <MetricCard label="SLA Hit" value={`${kpis.sla_hit_pct}%`} delta="-0.4%" />
            <MetricCard label="Rule Failures" value={kpis.rule_failures} delta="0" />
            <MetricCard label="Avg Action Latency" value={`${kpis.avg_action_latency_ms} ms`} delta="-5%" />
          </section>

          {/* Attendance grid card */}
          <section className="mb-6">
            <div className="bg-slate-900/40 rounded-2xl p-4 backdrop-blur-sm border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-md font-semibold">Schedule & Attendance</h2>
                <div className="flex items-center gap-2">
      
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-xs text-slate-400">
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Date Hired</th>
            
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Schedule</th>
                      <th className="px-3 py-2 text-left">Remarks</th>
                      <th className="px-3 py-2 text-left">Pattern (31 days)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((r) => (
                      <tr key={r.id} className="odd:bg-slate-900/20">
                        <td className="px-3 py-2 text-sm">{r.headCount}</td>
                        <td className="px-3 py-2 text-sm">{r.dateHired}</td>
              
                        <td className="px-3 py-2 text-sm">{r.name}</td>
                        <td className="px-3 py-2 text-sm">{r.schedule}</td>
                        <td className="px-3 py-2 text-sm">{r.remark}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1 flex gap-1 w-full flex-wrap justify-between ">
                            {r.pattern.map((p, i) => (
                              <div
                                key={i}
                                className={`w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-semibold ${
                                  p === 0 ? "bg-yellow-300 text-black" : p === 1 ? "bg-green-300 text-black" : p === 2 ? "bg-sky-400 text-white" : "bg-red-600 text-white"
                                }`}
                                title={`Day ${i + 1}`}>
                                {p === 0 ? "D" : p === 1 ? "N" : p === 2 ? "RD" : "A"}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-xs text-slate-400">Legend: <span className="ml-2 px-2 py-1 rounded bg-yellow-300 text-black">D - Day</span> <span className="ml-2 px-2 py-1 rounded bg-green-300 text-black">N - Night</span> <span className="ml-2 px-2 py-1 rounded bg-sky-400 text-white">RD - Rest Day</span> <span className="ml-2 px-2 py-1 rounded bg-red-600 text-white">A - Absent</span></div>
            </div>
          </section>

          {/* Non-Quota Dashboard */}
         
        </main>
      </div>

      {/* Footer spacing */}
      <div className="h-12" />
    </div>
  );
}


/* ---------- Small sub-components ---------- */
function MetricCard({ label, value, delta }) {
  return (
    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400">{label}</div>
          <div className="text-xl font-semibold mt-1">{value}</div>
        </div>
        <div className="text-sm text-slate-300 flex items-center gap-1">
          <svg width="48" height="28" viewBox="0 0 48 28" fill="none" aria-hidden>
            <path d="M2 20c6-8 20-8 30 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
          </svg>
          <div className="text-xs text-slate-400">{delta}</div>
        </div>
      </div>
    </div>
  );
}

function ExportButton({ format }) {
  return (
    <button className="px-3 py-2 rounded-md bg-slate-800/60 hover:bg-slate-800 text-sm border border-slate-700 flex items-center gap-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 21H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {format}
    </button>
  );
}
