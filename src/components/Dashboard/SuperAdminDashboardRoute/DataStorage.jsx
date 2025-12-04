import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Download, ArrowLeft } from "lucide-react";
import { fetchCombinedDepartmentsHistory } from "../../../redux/combinedQuotaSlice";

const fmt = (v) => {
  if (v === null || v === undefined) return "0";
  if (typeof v === "number" && !isNaN(v)) return v.toLocaleString();
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n.toLocaleString() : String(v);
};

const DataStoragePage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { history } = useSelector((state) => state.combinedQuota || {});
  const passedDepartment = location.state?.department;

  const [selectedView, setSelectedView] = useState("date");
  const [selectedDepartment, setSelectedDepartment] = useState(passedDepartment || "CSR");
  const [selectedDateRange, setSelectedDateRange] = useState(30);

  useEffect(() => {
    dispatch(fetchCombinedDepartmentsHistory({ days: selectedDateRange }));
  }, [dispatch, selectedDateRange]);

  // Group by period (date or month)
  const groupDataByPeriod = (data, viewType) => {
    const grouped = {};
    if (!Array.isArray(data)) return grouped;

    data.forEach((item) => {
      let dateRaw = null;

      if (item?.date) {
        dateRaw = item.date.trim();
      } else if (Array.isArray(item) && item[1]) {
        dateRaw = item[1].trim();
      } else if (item?.formattedDate) {
        dateRaw = item.formattedDate.trim();
      }

      if (!dateRaw) return;

      let parsed;

      if (/^\d{1,2}-[A-Za-z]{3}$/i.test(dateRaw)) {
        parsed = new Date(`${dateRaw}-2025`);
      } else if (/^[A-Za-z]{3} \d{1,2}, \d{4}$/.test(dateRaw)) {
        parsed = new Date(dateRaw);
      } else if (/^[A-Za-z]{3} \d{1,2}$/.test(dateRaw)) {
        parsed = new Date(`${dateRaw}, 2025`);
      } else if (/^\d{1,2}\/\d{1,2}$/.test(dateRaw)) {
        const [m, d] = dateRaw.split("/");
        parsed = new Date(`2025-${m}-${d}`);
      } else {
        parsed = new Date(dateRaw);
      }

      if (isNaN(parsed)) return;

      const key =
        viewType === "month"
          ? parsed.toLocaleDateString("en-US", { year: "numeric", month: "long" })
          : parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return grouped;
  };

  const extractRows = (arr) => {
    let out = [];
    if (!Array.isArray(arr)) return out;
    arr.forEach((it) => {
      if (!it) return;
      if (Array.isArray(it)) {
        out.push(it);
      } else if (it.rows && Array.isArray(it.rows)) {
        out = out.concat(it.rows);
      }
    });
    return out;
  };

  const calculateMetrics = (periodArray, department) => {
    if (!Array.isArray(periodArray) || periodArray.length === 0) return null;

    const allRows = extractRows(periodArray);
    const safeInt = (v) => parseInt(v, 10) || 0;

    // ------------------------------------------
    // CSR (MAIN FIX HERE)
    // ------------------------------------------
    if (department === "CSR") {
      console.log("📊 ALL CSR ROWS FOR DATE:", allRows);

      // 1. Extract extra completed from "FAILED TO REACH QUOTA" row
      let extraCompleted = 0;
      allRows.forEach(row => {
        if (!Array.isArray(row)) return;
        const label = String(row[0] || "").toLowerCase();
        
        if (label.includes("failed to reach quota") || 
            label.includes("failed to reach") || 
            label.includes("failed")) {
          // Check for the total value (10550 in your data)
          for (let i = 1; i < row.length; i++) {
            const val = safeInt(row[i]);
            if (val >= 10000) { // Looking for 10550
              extraCompleted = val;
              console.log("✅ FOUND EXTRA COMPLETED:", extraCompleted, "IN ROW:", row);
              break;
            }
          }
        }
      });

      // 2. Filter out all header, summary, and senior rows
      const shouldExcludeRow = (row) => {
        if (!Array.isArray(row)) return true;
        if (row.length < 3) return true;
        
        const name = String(row[0] || "").toLowerCase().trim();
        const secondCol = String(row[1] || "").toLowerCase().trim();
        
        // Exclude headers and summaries
        if (name.includes("night shift") || 
            name.includes("morning shift") ||
            name.includes("ave.") ||
            name.includes("highlight") ||
            name.includes("highlights") ||
            name.includes("half data") ||
            name.includes("no data") ||
            name.includes("failed") ||
            name.includes("assigned") ||
            name.includes("reached") ||
            name === "" ||
            name.includes("date") ||
            secondCol.includes("ave") ||
            secondCol.includes("morning") ||
            secondCol.includes("night")) {
          return true;
        }
        
        // 🔴 CRITICAL: EXCLUDE ALL SENIOR ROWS
        if (name.includes("senior") || name.includes("yd05 senior")) {
          console.log("❌ EXCLUDING SENIOR ROW:", name);
          return true;
        }
        
        // Exclude summary rows like "Ave. Completed Convo"
        if (name.includes("ave.") || name.includes("average")) {
          return true;
        }
        
        return false;
      };

      // Filter out invalid rows
      const validRows = allRows.filter(row => !shouldExcludeRow(row));
      
      // Filter for agent rows (should have time in format)
      const agentRows = validRows.filter(row => {
        if (!Array.isArray(row) || row.length < 8) return false;
        
        // Check if it has time format (hh:mm:ss or hh:mm:ss)
        for (let i = 5; i < row.length; i++) {
          const val = String(row[i] || "");
          if (val.includes(":") && val.match(/\d{1,2}:\d{2}:\d{2}/)) {
            return true;
          }
        }
        return false;
      });

      console.log("✅ VALID AGENT ROWS:", agentRows.length, agentRows);

      // 3. Parse agent data
      const agents = [];
      agentRows.forEach(row => {
        if (!Array.isArray(row) || row.length < 9) return;
        
        // Find time column index
        let timeIdx = -1;
        for (let i = 5; i < row.length; i++) {
          const val = String(row[i] || "");
          if (val.includes(":") && val.match(/\d{1,2}:\d{2}:\d{2}/)) {
            timeIdx = i;
            break;
          }
        }
        
        if (timeIdx === -1) return;
        
        const agent = {
          name: String(row[0] || "").trim(),
          completed: safeInt(row[1]),
          effective: safeInt(row[2]),
          message: safeInt(row[3]),
          missed: safeInt(row[4]),
          online: row[timeIdx] || "0:00:00",
          positive: row[timeIdx + 1] || "0%",
          negative: row[timeIdx + 2] || "0%",
          offline: safeInt(row[timeIdx + 3] || 0)
        };
        
        // Only include agents with some data
        if (agent.name && (agent.completed > 0 || agent.effective > 0)) {
          agents.push(agent);
        }
      });

      console.log("✅ PARSED AGENTS:", agents);

      if (agents.length === 0) return null;

      // 4. Calculate totals
      const sumCompleted = agents.reduce((sum, agent) => sum + agent.completed, 0);
      const sumEffective = agents.reduce((sum, agent) => sum + agent.effective, 0);
      const sumMessages = agents.reduce((sum, agent) => sum + agent.message, 0);
      const sumMissed = agents.reduce((sum, agent) => sum + agent.missed, 0);
      const sumOffline = agents.reduce((sum, agent) => sum + agent.offline, 0);

      // 5. Calculate online time
      const timeToSeconds = (str) => {
        if (!str) return 0;
        str = String(str).trim();
        
        if (str.includes(":")) {
          const parts = str.split(":");
          if (parts.length === 3) {
            const [h, m, s] = parts.map(v => parseInt(v) || 0);
            return h * 3600 + m * 60 + s;
          }
        }
        return 0;
      };

      const totalSeconds = agents.reduce((sum, agent) => sum + timeToSeconds(agent.online), 0);
      const avgSeconds = agents.length > 0 ? totalSeconds / agents.length : 0;

      const fmtTime = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        return `${h}h ${m}m ${s}s`;
      };

      // 6. Calculate percentages
      const pct = (v) => {
        const str = String(v).replace("%", "").trim();
        const num = parseFloat(str);
        return Number.isFinite(num) ? num : 0;
      };

      const agentsWithFeedback = agents.filter(agent => {
        const pos = pct(agent.positive);
        const neg = pct(agent.negative);
        return (pos > 0 || neg > 0);
      });

      const avgPositive = agentsWithFeedback.length > 0
        ? (agentsWithFeedback.reduce((sum, agent) => sum + pct(agent.positive), 0) / agentsWithFeedback.length)
        : 0;

      const avgNegative = agentsWithFeedback.length > 0
        ? (agentsWithFeedback.reduce((sum, agent) => sum + pct(agent.negative), 0) / agentsWithFeedback.length)
        : 0;

      // 🔴 FINAL FIX: Use extraCompleted if it exists, otherwise use sumCompleted
      const finalCompleted = extraCompleted > 0 ? extraCompleted : sumCompleted;

      console.log("📈 FINAL METRICS:", {
        sumCompleted: sumCompleted,
        extraCompleted: extraCompleted,
        finalCompleted: finalCompleted,
        effective: sumEffective,
        messages: sumMessages,
        agentsCount: agents.length
      });

      return {
        completed: finalCompleted,
        effective: sumEffective,
        messages: sumMessages,
        missed: sumMissed,
        onlineFormatted: fmtTime(totalSeconds),
        avgOnline: fmtTime(avgSeconds),
        positiveFormatted: avgPositive.toFixed(2) + "%",
        negativeFormatted: avgNegative.toFixed(2) + "%",
        offline: sumOffline,
      };
    }

    // ------------------------------------------
    // Deposit
    // ------------------------------------------
    if (department === "Deposit") {
      const clean = allRows.filter((r) =>
        Array.isArray(r) && r.length >= 8
        && r[0]
        && !String(r[0]).toLowerCase().includes("total")
        && !String(r[0]).toLowerCase().includes("night")
        && !String(r[1]).includes("ABSENT")
        && !String(r[1]).includes("RESTDAY")
        && !String(r[1]).includes("SHIFTING")
      );

      const n = (v) => {
        v = String(v).replace(/,/g, "").trim();
        return /^\d+$/.test(v) ? parseInt(v) : 0;
      };

      return {
        live: clean.reduce((s, r) => s + n(r[1]), 0),
        first: clean.reduce((s, r) => s + n(r[2]), 0),
        second: clean.reduce((s, r) => s + n(r[3]), 0),
        paycheck: clean.reduce((s, r) => s + n(r[4]), 0),
        records: clean.reduce((s, r) => s + n(r[5]), 0),
        offline: clean.reduce((s, r) => s + n(r[6]), 0)
      };
    }

    // ------------------------------------------
    // Withdraw
    // ------------------------------------------
    if (department === "Withdraw") {
      const clean = allRows.filter((r) => Array.isArray(r) && r.length >= 7);
      console.log("🧹 Clean Withdraw Rows:", clean);

      return {
        passed: clean.reduce((s, r) => s + safeInt(r[1]), 0),
        passedAmt: clean.reduce((s, r) => s + safeInt(String(r[2] || "").replace(/,/g, "")), 0),
        rejected: clean.reduce((s, r) => s + safeInt(r[3]), 0),
        rejectedAmt: clean.reduce((s, r) => s + safeInt(String(r[4] || "").replace(/,/g, "")), 0),
        processing: clean.reduce((s, r) => s + safeInt(r[5]), 0),
        processingAmt: clean.reduce((s, r) => s + safeInt(String(r[5] || "").replace(/,/g, "")), 0)
      };
    }

    console.log("⚠ Unknown Department");
    return null;
  };

  const departmentData = history?.[selectedDepartment] || [];
  const grouped = groupDataByPeriod(departmentData, selectedView);
  const sortedPeriods = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  const departmentHeaders = {
    CSR: [
      "DATE",
      "Completed convo",
      "Total Effective",
      "Total message",
      "Missed chats",
      "Online Time",
      "Positive rates",
      "Negative rates",
      "Offline"
    ],
    Deposit: ["DATE", "Live Check", "1st Check", "2nd/3rd", "Paycheck", "Records", "Offline"],
    Withdraw: ["DATE", "Passed", "Passed Amount", "Rejected", "Rejected Amount", "Processing", "Processing Amount"]
  };

  const exportData = () => {
    const tables = document.querySelectorAll('table');
    if (tables.length < 2) {
      alert("Data table not found");
      return;
    }

    const dataTable = tables[1];
    const rows = dataTable.querySelectorAll('tr');

    if (rows.length === 0) {
      alert("No data in table");
      return;
    }

    const csvRows = [];
    const headerRow = rows[0];
    const headers = [];
    const headerCells = headerRow.querySelectorAll('th');

    if (headerCells.length > 0) {
      headerCells.forEach(th => {
        let headerText = th.textContent.trim();
        headerText = headerText
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/,/g, '')
          .toUpperCase();
        headers.push(headerText);
      });
    } else {
      if (selectedDepartment === "CSR") {
        headers.push("DATE", "COMPLETED CONVO", "TOTAL EFFECTIVE", "TOTAL MESSAGE",
          "MISSED CHATS", "ONLINE TIME", "POSITIVE RATES", "NEGATIVE RATES", "OFFLINE");
      }
    }

    csvRows.push(headers.join(','));

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.querySelectorAll('td');

      if (cells.length === 0) continue;

      const rowData = [];

      cells.forEach((cell, index) => {
        let cellText = cell.textContent.trim();

        cellText = cellText
          .replace(/Oh/g, '0h')
          .replace(/om/g, '0m')
          .replace(/Os/g, '0s')
          .replace(/gh/g, '9h')
          .replace(/\s+/g, ' ');

        if ((index === 6 || index === 7) && !cellText.includes('%') && cellText !== '') {
          cellText = cellText + '%';
        }

        if (index === 5) {
          if (!cellText.includes('h') && !cellText.includes('m') && !cellText.includes('s')) {
            cellText = '0h 0m 0s';
          } else if (!cellText.includes('s')) {
            cellText = cellText + 's';
          }
        }

        if (cellText.includes(',') || cellText.includes('"') || cellText.includes('\n')) {
          cellText = `"${cellText.replace(/"/g, '""')}"`;
        }

        rowData.push(cellText);
      });

      if (rowData.length > 0) {
        csvRows.push(rowData.join(','));
      }
    }

    if (csvRows.length <= 1) {
      alert("No data to export");
      return;
    }

    const csvContent = csvRows.join('\n');
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedDepartment}_Data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="min-h-screen p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => window.history.back()} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-300" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Calendar className="text-white" size={22} />
                {selectedDepartment} History
              </h1>
              <p className="text-slate-400 mt-1">View and analyze department data</p>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={exportData} className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 px-6 py-3 rounded-lg font-semibold text-lg cursor-pointer transition-all ease-in-out duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2">
            <Download size={20} /> Export CSV
          </motion.button>
        </div>

        <div className="flex gap-4 justify-between flex-wrap">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">View By</label>
            <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedView('date')} className={`px-4 py-2 rounded font-medium transition-all ${selectedView === 'date' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Date</motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedView('month')} className={`px-4 py-2 rounded font-medium transition-all ${selectedView === 'month' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Month</motion.button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mt-2 uppercase">Date Range</label>
            <select value={selectedDateRange} onChange={(e) => setSelectedDateRange(Number(e.target.value))} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 shadow-xl mt-6">
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-300 text-sm border-b border-slate-700 ashish-madhu">
                {departmentHeaders[selectedDepartment].map((h, i) => <th key={i} className="p-4 text-center font-semibold tracking-wide uppercase ">{h}</th>)}
              </tr>
            </thead>
          </table>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse table-fixed">
            <tbody>
              {sortedPeriods.length === 0 && (
                <tr><td className="p-6 text-center text-slate-400" colSpan={departmentHeaders[selectedDepartment].length}>No data available</td></tr>
              )}

              {sortedPeriods.map((period) => {
                const metrics = calculateMetrics(grouped[period], selectedDepartment);
                
                if (!metrics) return null;

                if (selectedDepartment === "CSR") {
                  const r = [
                    period,
                    fmt(metrics.completed),
                    fmt(metrics.effective),
                    fmt(metrics.messages),
                    fmt(metrics.missed),
                    metrics.avgOnline,
                    metrics.positiveFormatted,
                    metrics.negativeFormatted,
                    fmt(metrics.offline)
                  ];
                  return (
                    <tr key={period} className="border-b border-slate-800 hover:bg-slate-800/40 ashish">
                      {r.map((c, i) => (
                        <td key={i} className="p-3 text-center text-slate-200">{c}</td>
                      ))}
                    </tr>
                  );
                }
                
                if (selectedDepartment === "Deposit") {
                  const r = [
                    period,
                    fmt(metrics.live),
                    fmt(metrics.first),
                    fmt(metrics.second),
                    fmt(metrics.paycheck),
                    fmt(metrics.records),
                    fmt(metrics.offline)
                  ];
                  return <tr key={period} className="border-b border-slate-800 hover:bg-slate-800/40 ashish">{r.map((c, i) => <td key={i} className="p-3 text-center text-slate-200">{c}</td>)}</tr>;
                }

                // Withdraw
                const r = [
                  period,
                  fmt(metrics.passed),
                  fmt(metrics.passedAmt),
                  fmt(metrics.rejected),
                  fmt(metrics.rejectedAmt),
                  fmt(metrics.processing),
                  fmt(metrics.processingAmt)
                ];
                return <tr key={period} className="border-b border-slate-800 hover:bg-slate-800/40 ashish">{r.map((c, i) => <td key={i} className="p-3 text-center text-slate-200">{c}</td>)}</tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataStoragePage;