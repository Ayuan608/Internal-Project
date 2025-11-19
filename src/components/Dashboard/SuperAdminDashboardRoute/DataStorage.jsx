import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    Activity,
    TrendingUp,
    AlertCircle,
    ArrowLeft,
    Target,
    MessageCircle
} from 'lucide-react';
import { fetchCombinedDepartmentsHistory } from '../../../redux/combinedQuotaSlice';

const DataStoragePage = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { history, historyLoading, historyError } = useSelector(state => state.combinedQuota);

    const passedDepartment = location.state?.department;

    const [selectedView, setSelectedView] = useState('date');
    const [selectedDepartment, setSelectedDepartment] = useState(passedDepartment || 'CSR');
    const [selectedDateRange, setSelectedDateRange] = useState(30);
    const [expandedDates, setExpandedDates] = useState({});

    useEffect(() => {
        dispatch(fetchCombinedDepartmentsHistory({ days: selectedDateRange }));
    }, [dispatch, selectedDateRange]);

    // Auto-expand all dates when data loads
    useEffect(() => {
        if (history[selectedDepartment]?.length > 0) {
            const groupedData = groupDataByPeriod(history[selectedDepartment] || [], selectedView);
            const allDates = {};
            Object.keys(groupedData).forEach(date => {
                allDates[date] = true;
            });
            setExpandedDates(allDates);
        }
    }, [history, selectedDepartment, selectedView]);

    const groupDataByPeriod = (data, viewType) => {
        const grouped = {};

        if (!Array.isArray(data) || data.length === 0) {
            return grouped;
        }

        data.forEach(row => {
            let dateStr;

            if (typeof row === "object" && row !== null && row.date) {
                let dateStrRaw = row.date.trim();
                const currentYear = new Date().getFullYear();

                if (dateStrRaw.includes("/")) {
                    const parts = dateStrRaw.split("/");
                    if (parts.length === 2) {
                        const [month, day] = parts;
                        if (month && day) {
                            dateStr = `${currentYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
                        }
                    }
                } else {
                    const parsed = new Date(`${row.date} ${currentYear}`);
                    if (!isNaN(parsed)) {
                        const m = String(parsed.getMonth() + 1).padStart(2, "0");
                        const d = String(parsed.getDate()).padStart(2, "0");
                        dateStr = `${currentYear}-${m}-${d}`;
                    }
                }
            } else if (Array.isArray(row)) {
                dateStr = row[1];
            }

            if (!dateStr) return;

            let key;
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return;

                if (viewType === 'month') {
                    key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                } else {
                    key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                }
            } catch (e) {
                return;
            }

            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(row);
        });

        return grouped;
    };

    const calculateMetrics = (data, department) => {
        if (!data || data.length === 0) return null;

        const getAllRows = (dataArray) => {
            let allRows = [];
            dataArray.forEach(item => {
                if (item && item.rows && Array.isArray(item.rows)) {
                    allRows = allRows.concat(item.rows);
                } else if (Array.isArray(item)) {
                    allRows.push(item);
                }
            });
            return allRows;
        };

        const allRows = getAllRows(data);

        if (department === 'CSR') {
            const agentRows = allRows.filter(row => {
                if (!Array.isArray(row) || row.length < 2) return false;
                const name = String(row[0] || '');
                const nameLower = name.toLowerCase();

                return name.trim() !== '' &&
                    name !== 'Member' &&
                    !nameLower.includes('shift') &&
                    !nameLower.includes('total') &&
                    !nameLower.includes('ave.') &&
                    !nameLower.includes('highlights') &&
                    !nameLower.includes('failed') &&
                    !nameLower.includes('assigned') &&
                    !nameLower.includes('reached') &&
                    !nameLower.includes('half data');
            });

            return {
                agents: agentRows.length,
                completed: agentRows.reduce((sum, row) => sum + (parseInt(row[1]) || 0), 0),
                effective: agentRows.reduce((sum, row) => sum + (parseInt(row[2]) || 0), 0),
                messages: agentRows.reduce((sum, row) => sum + (parseInt(row[3]) || 0), 0),
                missed: agentRows.reduce((sum, row) => sum + (parseInt(row[4]) || 0), 0)
            };
        }

        if (department === 'Deposit') {
            const agentRows = allRows.filter(row => {
                if (!Array.isArray(row) || row.length < 2) return false;
                const name = String(row[0] || '');
                const nameLower = name.toLowerCase();

                return name.trim() !== '' &&
                    !nameLower.includes('shift') &&
                    !nameLower.includes('total') &&
                    !nameLower.includes('ave.');
            });

            return {
                agents: agentRows.length,
                liveChecks: agentRows.reduce((sum, row) => sum + (parseInt(row[1]) || 0), 0),
                firstChecks: agentRows.reduce((sum, row) => sum + (parseInt(row[2]) || 0), 0),
                secondThirdChecks: agentRows.reduce((sum, row) => sum + (parseInt(row[3]) || 0), 0),
                paycheck: agentRows.reduce((sum, row) => sum + (parseInt(row[4]) || 0), 0),
                records: agentRows.reduce((sum, row) => sum + (parseInt(row[5]) || 0), 0),
                offline: agentRows.reduce((sum, row) => sum + (parseInt(row[6]) || 0), 0)
            };
        }

        if (department === 'Withdraw') {
            const memberRows = allRows.filter(row => {
                if (!Array.isArray(row) || row.length < 2) return false;
                const name = String(row[0] || '');
                const nameLower = name.toLowerCase();

                return name !== 'Member' &&
                    name.trim() !== '' &&
                    !nameLower.includes('total') &&
                    !nameLower.includes('reject');
            });

            return {
                members: memberRows.length,
                passed: memberRows.reduce((sum, row) => {
                    const val = String(row[1] || '0').replace(/,/g, '');
                    return sum + (parseInt(val) || 0);
                }, 0),
                passedAmount: memberRows.reduce((sum, row) => {
                    const val = String(row[2] || '0').replace(/,/g, '');
                    return sum + (parseInt(val) || 0);
                }, 0),
                rejected: memberRows.reduce((sum, row) => {
                    const val = String(row[3] || '0').replace(/,/g, '');
                    return sum + (parseInt(val) || 0);
                }, 0),
                rejectedAmount: memberRows.reduce((sum, row) => {
                    const val = String(row[4] || '0').replace(/,/g, '');
                    return sum + (parseInt(val) || 0);
                }, 0),
                processing: memberRows.reduce((sum, row) => {
                    const val = String(row[5] || '0').replace(/,/g, '');
                    return sum + (parseInt(val) || 0);
                }, 0),
                processingAmount: memberRows.reduce((sum, row) => {
                    const val = String(row[6] || '0').replace(/,/g, '');
                    return sum + (parseInt(val) || 0);
                }, 0)
            };
        }

        return null;
    };

    const exportData = () => {
        const exportableData = history[selectedDepartment] || [];
        if (exportableData.length === 0) {
            alert('No data to export');
            return;
        }

        const csv = exportableData.map(row =>
            Array.isArray(row) ? row.join(',') : Object.values(row).join(',')
        ).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedDepartment}_History_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const departmentData = history[selectedDepartment] || [];
    const groupedData = groupDataByPeriod(departmentData, selectedView);
    const sortedPeriods = Object.keys(groupedData).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
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
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportData}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 px-6 py-3 rounded-lg font-semibold text-lg cursor-pointer transition-all ease-in-out duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <Download size={20} />
                        Export
                    </motion.button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 justify-between flex-wrap">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">View By</label>
                        <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedView('date')}
                                className={`px-4 py-2 rounded font-medium transition-all ${selectedView === 'date'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                Date
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedView('month')}
                                className={`px-4 py-2 rounded font-medium transition-all ${selectedView === 'month'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                Month
                            </motion.button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mt-2 uppercase">Date Range</label>
                        <select
                            value={selectedDateRange}
                            onChange={(e) => setSelectedDateRange(Number(e.target.value))}
                            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={14}>Last 14 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={60}>Last 60 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Loading State */}
            {historyLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-lg p-12 text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Activity className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-slate-300 text-lg">Loading historical data...</p>
                </motion.div>
            )}

            {/* Error State */}
            {historyError && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 backdrop-blur-sm rounded-2xl border border-red-500/30 shadow-lg p-6"
                >
                    <div className="flex items-center gap-3 text-red-400">
                        <AlertCircle size={24} />
                        <p className="text-lg">{historyError}</p>
                    </div>
                </motion.div>
            )}

            {/* Data Display - Auto Expanded */}
            {!historyLoading && !historyError && (
                <div className="space-y-4">
                    {sortedPeriods.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[rgba(59,130,246,0.03)] backdrop-blur-sm rounded-2xl border border-slate-700 shadow-lg p-12 text-center"
                        >
                            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-300 text-lg font-medium">No data available</p>
                            <p className="text-slate-500 text-sm mt-2">Try selecting a different date range</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.1 }}
                            className="space-y-4"
                        >
                            {sortedPeriods.map((period, index) => {
                                const periodData = groupedData[period];
                                const metrics = calculateMetrics(periodData, selectedDepartment);

                                return (
                                    <motion.div
                                        key={period}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-[rgba(59,130,246,0.03)] rounded-xl border border-slate-800/40 p-5 hover:shadow-lg transition-all"
                                    >
                                        {/* MAIN ROW → LEFT DATE BOX | RIGHT DATA BOX */}
                                        <div className="flex  gap-6">

                                            {/* LEFT SIDE — DATE BOX */}
                                            <div className="w-52  min-w-[180px] px-4 py-4 bg-slate-800/60 border border-slate-800 rounded-xl">
                                                <h2 className="text-xl font-bold text-white">{period}</h2>
                                                <p className="text-slate-400 text-xs mt-1">
                                                    {selectedDepartment} • {periodData.length} records
                                                </p>
                                            </div>

                                            {/* RIGHT SIDE — METRICS BOX */}
                                            <div className="flex-1  rounded-xl ">

                                                {metrics ? (
                                                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                                                        {/* CSR */}
                                                        {selectedDepartment === 'CSR' && (
                                                            <>
                                                                <MetricCard icon={CheckCircle} label="Completed" value={metrics.completed.toLocaleString()} color="green" />
                                                                <MetricCard icon={Target} label="Effective" value={metrics.effective.toLocaleString()} color="blue" />
                                                                <MetricCard icon={MessageCircle} label="Messages" value={metrics.messages.toLocaleString()} color="cyan" />
                                                                <MetricCard icon={XCircle} label="Missed" value={metrics.missed.toLocaleString()} color="red" />
                                                            </>
                                                        )}

                                                        {/* Deposit */}
                                                        {selectedDepartment === 'Deposit' && (
                                                            <>
                                                                <MetricCard icon={Activity} label="Live Checks" value={metrics.liveChecks.toLocaleString()} color="blue" />
                                                                <MetricCard icon={CheckCircle} label="1st Checks" value={metrics.firstChecks.toLocaleString()} color="green" />
                                                                <MetricCard icon={Target} label="2nd/3rd Checks" value={metrics.secondThirdChecks.toLocaleString()} color="cyan" />
                                                                <MetricCard icon={DollarSign} label="Paycheck" value={metrics.paycheck.toLocaleString()} color="yellow" />
                                                                <MetricCard icon={Activity} label="Records" value={metrics.records.toLocaleString()} color="indigo" />
                                                                <MetricCard icon={XCircle} label="Offline" value={metrics.offline.toLocaleString()} color="red" />
                                                            </>
                                                        )}

                                                        {/* Withdraw */}
                                                        {selectedDepartment === 'Withdraw' && (
                                                            <>
                                                                <MetricCard icon={CheckCircle} label="Passed" value={metrics.passed.toLocaleString()} color="green" />
                                                                <MetricCard icon={DollarSign} label="Passed Amount" value={`₹${(metrics.passedAmount / 1000).toFixed(0)}K`} color="emerald" />
                                                                <MetricCard icon={XCircle} label="Rejected" value={metrics.rejected.toLocaleString()} color="red" />
                                                                <MetricCard icon={TrendingUp} label="Rejected Amount" value={`₹${(metrics.rejectedAmount / 1000).toFixed(0)}K`} color="orange" />
                                                                <MetricCard icon={Clock} label="Processing" value={metrics.processing.toLocaleString()} color="blue" />
                                                                <MetricCard icon={DollarSign} label="Processing Amount" value={`₹${(metrics.processingAmount / 1000).toFixed(0)}K`} color="indigo" />
                                                            </>
                                                        )}

                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6">
                                                        <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                                        <p className="text-slate-400">No metrics available</p>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </motion.div>

                                );
                            })}
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ icon: Icon, label, value, color }) => {
    const colorMap = {
        purple: { bg: 'from-purple-600 to-purple-700', icon: 'text-purple-400' },
        green: { bg: 'from-green-600 to-emerald-600', icon: 'text-green-400' },
        blue: { bg: 'from-blue-600 to-cyan-600', icon: 'text-blue-400' },
        cyan: { bg: 'from-cyan-600 to-teal-600', icon: 'text-cyan-400' },
        red: { bg: 'from-red-600 to-orange-600', icon: 'text-red-400' },
        yellow: { bg: 'from-yellow-600 to-orange-600', icon: 'text-yellow-400' },
        indigo: { bg: 'from-indigo-600 to-purple-600', icon: 'text-indigo-400' },
        emerald: { bg: 'from-emerald-600 to-green-600', icon: 'text-emerald-400' },
        orange: { bg: 'from-orange-600 to-red-600', icon: 'text-orange-400' }
    };

    const colors = colorMap[color];

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-3 border border-slate-700 transition-all flex flex-col justify-between"
        >
            <div>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center mb-2`}>
                    <Icon size={18} className="text-white" />
                </div>
                <p className="text-lg font-bold text-white">{value}</p>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">{label}</p>
        </motion.div>
    );
};

export default DataStoragePage;