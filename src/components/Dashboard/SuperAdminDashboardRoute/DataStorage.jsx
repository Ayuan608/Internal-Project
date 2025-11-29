import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Download, Activity, AlertCircle, ArrowLeft } from "lucide-react";
import { fetchCombinedDepartmentsHistory } from "../../../redux/combinedQuotaSlice";

const safeInt = (v) => {
    const n = Number(String(v || "").replace(/,/g, ""));
    return Number.isFinite(n) ? Math.floor(n) : 0;
};
const safeFloat = (v) => {
    const n = Number(String(v || "").replace(/,/g, "").replace("%", ""));
    return Number.isFinite(n) ? n : 0;
};
const fmt = (v) => {
    // if it's number-like
    if (v === null || v === undefined) return "0";
    if (typeof v === "number" && !isNaN(v)) return v.toLocaleString();
    // try parse
    const n = Number(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n.toLocaleString() : String(v);
};
const fmtPercent = (v) => {
    if (v === null || v === undefined) return "0%";
    if (typeof v === "string" && v.trim().endsWith("%")) return v.trim();
    const n = safeFloat(v);
    return `${n.toFixed(2)}%`;
};

const DataStoragePage = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { history, historyLoading, historyError } = useSelector((state) => state.combinedQuota || {});
    const passedDepartment = location.state?.department;

    const [selectedView, setSelectedView] = useState("date");
    const [selectedDepartment, setSelectedDepartment] = useState(passedDepartment || "CSR");
    const [selectedDateRange, setSelectedDateRange] = useState(30);

    useEffect(() => {
        dispatch(fetchCombinedDepartmentsHistory({ days: selectedDateRange }));
    }, [dispatch, selectedDateRange]);

    // Group by period (date or month) — robust for both object-with-date and array rows
    const groupDataByPeriod = (data, viewType) => {
        const grouped = {};
        if (!Array.isArray(data)) return grouped;

        data.forEach((item) => {
            let dateRaw = null;

            if (item && typeof item === "object" && !Array.isArray(item) && item.date) {
                dateRaw = item.date;
            } else if (Array.isArray(item) && item.length > 1) {
                // some of your rows show date at index 1
                dateRaw = item[1];
            } else if (item && item.formattedDate) {
                dateRaw = item.formattedDate;
            }

            if (!dateRaw) return;

            const currentYear = new Date().getFullYear();
            // attempts to handle "11/01" or "Nov 1" etc.
            let parsed;
            if (typeof dateRaw === "string" && dateRaw.includes("/")) {
                // e.g. "11/01"
                const parts = dateRaw.split("/");
                if (parts.length === 2) {
                    const [m, d] = parts;
                    parsed = new Date(`${currentYear}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
                }
            }
            if (!parsed) {
                parsed = new Date(`${dateRaw} ${currentYear}`);
            }
            if (isNaN(parsed)) return;

            const key = viewType === "month"
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
        const safeFloat = (v) => parseFloat(v) || 0;

        // ------------------------------------------
        // CSR
        // ------------------------------------------
        if (department === "CSR") {
            // Senior ko filter out karne ke conditions
            const isSenior = (agentName) => {
                const name = String(agentName || "").toLowerCase();
                if (name.includes("senior")) return true;
                const seniorNames = ["manager", "supervisor", "lead", "head"];
                if (seniorNames.some(senior => name.includes(senior))) return true;
                return false;
            };

            // Function to convert "10.30 47" format to seconds
            const timeToSeconds = (timeStr) => {
                if (!timeStr || timeStr === "0.00 00") return 0;

                const [hoursPart, secondsPart] = String(timeStr).split(" ");
                const hours = parseFloat(hoursPart) || 0;
                const wholeHours = Math.floor(hours);
                const decimalMinutes = (hours - wholeHours) * 100;
                const seconds = parseInt(secondsPart) || 0;

                return wholeHours * 3600 + decimalMinutes * 60 + seconds;
            };

            const clean = allRows.filter(r => {
                if (!Array.isArray(r) || r.length < 9) return false;

                const name = String(r[0] || "").toLowerCase();
                const onlineTimeStr = r[5]; // This contains "10.30 47" format

                const bad = ["member", "shift", "total", "ave", "highlight", "failed", "assigned", "reached"];

                if (isSenior(name)) return false;
                if (timeToSeconds(onlineTimeStr) === 0) return false; // Exclude zero times

                return name.trim() !== "" && !bad.some(b => name.includes(b));
            });

            const count = clean.length;
            console.log("👥 CSR Agent Count (Senior & 00:00:00 excluded):", count);

            if (count === 0) {
                return {
                    completed: 0,
                    effective: 0,
                    messages: 0,
                    missed: 0,
                    online: "0.00",
                    onlineFormatted: "0.00h",
                    avgOnline: "0h 0m 0s",
                    positive: 0,
                    positiveFormatted: "0%",
                    negative: 0,
                    negativeFormatted: "0%",
                    offline: 0
                };
            }

            const completed = clean.reduce((s, r) => s + safeInt(r[1]), 0);
            const effective = clean.reduce((s, r) => s + safeInt(r[2]), 0);
            const message = clean.reduce((s, r) => s + safeInt(r[3]), 0);
            const missed = clean.reduce((s, r) => s + safeInt(r[4]), 0);

            // Calculate total online time in seconds
            const totalSeconds = clean.reduce((s, r) => s + timeToSeconds(r[5]), 0);

            // Convert total seconds to hours for display
            const totalOnlineHours = totalSeconds / 3600;

            // Average online time in seconds
            const avgSeconds = count > 0 ? totalSeconds / count : 0;

            // Format average online time from seconds
            const formatTimeFromSeconds = (totalSeconds) => {
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = Math.floor(totalSeconds % 60);
                return `${hours}h ${minutes}m ${seconds}s`;
            };

            const positiveAvg = count > 0
                ? (clean.reduce((s, r) => s + safeFloat(r[6]), 0) / count).toFixed(2)
                : 0;

            const negativeAvg = count > 0
                ? (clean.reduce((s, r) => s + safeFloat(r[7]), 0) / count).toFixed(2)
                : 0;

            const offline = clean.reduce((s, r) => s + safeInt(r[8]), 0);

            return {
                completed,
                effective,
                messages: message,
                missed,
                online: totalOnlineHours.toFixed(2),
                onlineFormatted: `${totalOnlineHours.toFixed(2)}h`,
                avgOnline: formatTimeFromSeconds(avgSeconds),
                positive: positiveAvg,
                positiveFormatted: `${positiveAvg}%`,
                negative: negativeAvg,
                negativeFormatted: `${negativeAvg}%`,
                offline
            };
        }

        // ------------------------------------------
        // Deposit
        // ------------------------------------------
        if (department === "Deposit") {
            const clean = allRows.filter((r) => Array.isArray(r) && r.length >= 7);
            console.log("🧹 Clean Deposit Rows:", clean);

            return {
                live: clean.reduce((s, r) => s + safeInt(r[1]), 0),
                first: clean.reduce((s, r) => s + safeInt(r[2]), 0),
                second: clean.reduce((s, r) => s + safeInt(r[3]), 0),
                paycheck: clean.reduce((s, r) => s + safeInt(r[4]), 0),
                records: clean.reduce((s, r) => s + safeInt(r[5]), 0),
                offline: clean.reduce((s, r) => s + safeInt(r[6]), 0)
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
        if (!sortedPeriods.length) {
            alert("No data to export");
            return;
        }

        const csvRows = [];
        csvRows.push(departmentHeaders[selectedDepartment].join(","));

        for (const dt of sortedPeriods) {
            const metrics = calculateMetrics(grouped[dt], selectedDepartment);
            if (!metrics) continue;

            if (selectedDepartment === "CSR") {
                csvRows.push([
                    dt,
                    metrics.completed,
                    metrics.effective,
                    metrics.messages,
                    metrics.missed,
                    metrics.online, // Use decimal value for CSV
                    metrics.positive, // Use decimal value for CSV
                    metrics.negative, // Use decimal value for CSV
                    metrics.offline
                ].join(","));
            } else if (selectedDepartment === "Deposit") {
                csvRows.push([
                    dt,
                    metrics.live,
                    metrics.first,
                    metrics.second,
                    metrics.paycheck,
                    metrics.records,
                    metrics.offline
                ].join(","));
            } else if (selectedDepartment === "Withdraw") {
                csvRows.push([
                    dt,
                    metrics.passed,
                    metrics.passedAmt,
                    metrics.rejected,
                    metrics.rejectedAmt,
                    metrics.processing,
                    metrics.processingAmt
                ].join(","));
            }
        }

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedDepartment}_history.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };


    function formatTime(decimalHours) {
        const totalSeconds = Math.floor(decimalHours * 3600);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours}h ${minutes}m ${seconds}s`;
    }


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

                                // prepare rows safe
                                if (selectedDepartment === "CSR") {
                                    const r = [
                                        period,
                                        fmt(metrics.completed),
                                        fmt(metrics.effective),
                                        fmt(metrics.messages),
                                        fmt(metrics.missed),
                                        metrics.avgOnline,    // Yaha direct use karo - already calculated
                                        metrics.positiveFormatted, // Formatted percentage use karo
                                        metrics.negativeFormatted, // Formatted percentage use karo
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
