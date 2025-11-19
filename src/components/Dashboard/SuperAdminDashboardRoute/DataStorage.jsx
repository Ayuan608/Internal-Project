import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Download,
    Users,
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
    const { history, historyLoading, historyError } = useSelector(state => state.combinedQuota);
    
    const [selectedView, setSelectedView] = useState('date');
    const [selectedDepartment, setSelectedDepartment] = useState('CSR');
    const [selectedDateRange, setSelectedDateRange] = useState(30);
    const [expandedDates, setExpandedDates] = useState({});

    useEffect(() => {
        dispatch(fetchCombinedDepartmentsHistory({ days: selectedDateRange }));
    }, [dispatch, selectedDateRange]);

    // Group data by date
    const groupDataByPeriod = (data, viewType) => {
        const grouped = {};
        
        if (!Array.isArray(data) || data.length === 0) {
            console.log("⚠️ No data to group");
            return grouped;
        }

        console.log("📊 Sample row:", data[0]);

        data.forEach(row => {
            let dateStr;
            
            // Handle different data formats
            if (Array.isArray(row)) {
                dateStr = row[1]; // Array format
            } else if (typeof row === 'object' && row !== null) {
                // Object format - try different possible date field names
                dateStr = row.date || row.Date || row.createdAt || row.created_at || row.Date;
            }
            
            if (!dateStr) return;
            
            let key;
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) {
                    console.log("⚠️ Invalid date:", dateStr);
                    return;
                }
                
                if (viewType === 'month') {
                    key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                } else {
                    key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                }
            } catch (e) {
                console.log("❌ Date parsing error:", e);
                return;
            }
            
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(row);
        });

        console.log("✅ Grouped periods:", Object.keys(grouped));
        return grouped;
    };

    // Calculate metrics from grouped data
    const calculateMetrics = (data, department) => {
        if (!data || data.length === 0) return null;

        // Helper to get value from row (works with both array and object)
        const getValue = (row, arrayIndex, objectKey, fallback = 0) => {
            if (Array.isArray(row)) {
                return row[arrayIndex] || fallback;
            } else if (typeof row === 'object') {
                return row[objectKey] || row[arrayIndex] || fallback;
            }
            return fallback;
        };

        if (department === 'CSR') {
            // Filter valid agent rows
            const agentRows = data.filter(row => {
                const name = getValue(row, 2, 'agent', '') || getValue(row, 2, 'name', '');
                if (typeof name !== 'string') return false;
                const nameLower = name.toLowerCase();
                return name.trim() !== '' && 
                       !nameLower.includes('shift') &&
                       !nameLower.includes('total') &&
                       !nameLower.includes('ave');
            });

            const metrics = {
                agents: agentRows.length,
                completed: agentRows.reduce((sum, row) => sum + (parseInt(getValue(row, 3, 'completed', 0)) || 0), 0),
                effective: agentRows.reduce((sum, row) => sum + (parseInt(getValue(row, 4, 'effective', 0)) || 0), 0),
                messages: agentRows.reduce((sum, row) => sum + (parseInt(getValue(row, 5, 'messages', 0)) || 0), 0),
                missed: agentRows.reduce((sum, row) => sum + (parseInt(getValue(row, 6, 'missed', 0)) || 0), 0)
            };

            console.log("CSR Metrics:", metrics);
            return metrics;
        }

        if (department === 'Deposit') {
            const agentRows = data.filter(row => {
                const name = getValue(row, 2, 'agent', '') || getValue(row, 2, 'name', '');
                if (typeof name !== 'string') return false;
                const nameLower = name.toLowerCase();
                return name.trim() !== '' && 
                       !nameLower.includes('shift') &&
                       !nameLower.includes('total');
            });

            return {
                agents: agentRows.length,
                liveChecks: agentRows.reduce((sum, row) => sum + (parseInt(getValue(row, 3, 'liveChecks', 0)) || 0), 0),
                firstChecks: agentRows.reduce((sum, row) => sum + (parseInt(getValue(row, 4, 'firstChecks', 0)) || 0), 0),
                secondThirdChecks: agentRows.reduce((sum, row) => sum + (parseInt(getValue(row, 5, 'secondThirdChecks', 0)) || 0), 0),
                paycheck: agentRows.reduce((sum, row) => sum + (parseInt(getValue(row, 6, 'paycheck', 0)) || 0), 0),
                records: agentRows.reduce((sum, row) => sum + (parseInt(getValue(row, 7, 'records', 0)) || 0), 0),
                offline: agentRows.reduce((sum, row) => sum + (parseInt(getValue(row, 8, 'offline', 0)) || 0), 0)
            };
        }

        if (department === 'Withdraw') {
            const memberRows = data.filter(row => {
                const name = getValue(row, 2, 'member', '') || getValue(row, 2, 'name', '');
                if (typeof name !== 'string') return false;
                const nameLower = name.toLowerCase();
                return name !== 'Member' &&
                       name.trim() !== '' &&
                       !nameLower.includes('total') &&
                       !nameLower.includes('reject');
            });

            return {
                members: memberRows.length,
                passed: memberRows.reduce((sum, row) => {
                    const val = String(getValue(row, 3, 'passed', '0')).replace(/,/g, '');
                    return sum + (parseInt(val) || 0);
                }, 0),
                passedAmount: memberRows.reduce((sum, row) => {
                    const val = String(getValue(row, 4, 'passedAmount', '0')).replace(/,/g, '');
                    return sum + (parseInt(val) || 0);
                }, 0),
                rejected: memberRows.reduce((sum, row) => {
                    const val = String(getValue(row, 5, 'rejected', '0')).replace(/,/g, '');
                    return sum + (parseInt(val) || 0);
                }, 0),
                rejectedAmount: memberRows.reduce((sum, row) => {
                    const val = String(getValue(row, 6, 'rejectedAmount', '0')).replace(/,/g, '');
                    return sum + (parseInt(val) || 0);
                }, 0),
                processing: memberRows.reduce((sum, row) => {
                    const val = String(getValue(row, 7, 'processing', '0')).replace(/,/g, '');
                    return sum + (parseInt(val) || 0);
                }, 0),
                processingAmount: memberRows.reduce((sum, row) => {
                    const val = String(getValue(row, 8, 'processingAmount', '0')).replace(/,/g, '');
                    return sum + (parseInt(val) || 0);
                }, 0)
            };
        }

        return null;
    };

    // Export function
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

    // Get department data
    const departmentData = history[selectedDepartment] || [];
    const groupedData = groupDataByPeriod(departmentData, selectedView);
    const sortedPeriods = Object.keys(groupedData)

    console.log("Department Data:", departmentData.length, "rows");
    console.log("Sorted Periods:", sortedPeriods);

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-xl bg-[#1a1f2e]/80 rounded-2xl border border-purple-500/20 shadow-2xl p-6 mb-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-purple-400" />
                        </motion.button>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-purple-400" />
                            Data Storage History
                        </h1>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportData}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white transition-all shadow-lg"
                    >
                        <Download size={20} />
                        Export
                    </motion.button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">View By</label>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedView('date')}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                                    selectedView === 'date'
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                                }`}
                            >
                                Date
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedView('month')}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                                    selectedView === 'month'
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                                }`}
                            >
                                Month
                            </motion.button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-purple-500/30 rounded-lg text-white font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        >
                            <option value="CSR">Customer Service (CSR)</option>
                            <option value="Deposit">Deposit</option>
                            <option value="Withdraw">Withdrawal</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                        <select
                            value={selectedDateRange}
                            onChange={(e) => setSelectedDateRange(Number(e.target.value))}
                            className="w-full px-4 py-2.5 bg-[#1a1f2e] border border-purple-500/30 rounded-lg text-white font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
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
                    className="backdrop-blur-xl bg-[#1a1f2e]/80 rounded-2xl border border-purple-500/20 shadow-2xl p-12 text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Activity className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-gray-300 text-lg">Loading historical data...</p>
                </motion.div>
            )}

            {/* Error State */}
            {historyError && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="backdrop-blur-xl bg-red-500/10 rounded-2xl border border-red-500/30 shadow-2xl p-6"
                >
                    <div className="flex items-center gap-3 text-red-400">
                        <AlertCircle size={24} />
                        <p className="text-lg">{historyError}</p>
                    </div>
                </motion.div>
            )}

            {/* Data Display - NEW LAYOUT: DATE LEFT, DATA RIGHT */}
            {!historyLoading && !historyError && (
                <div className="space-y-4">
                    {sortedPeriods.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="backdrop-blur-xl bg-[#1a1f2e]/80 rounded-2xl border border-purple-500/20 shadow-2xl p-12 text-center"
                        >
                            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg font-medium">No data available for selected period</p>
                            <p className="text-gray-500 text-sm mt-2">Try selecting a different date range or department</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-12 gap-6">
                            {/* LEFT SIDE - DATE LIST */}
                            <div className="col-span-3 space-y-3">
                                {sortedPeriods.map((period, index) => {
                                    const isExpanded = expandedDates[period];
                                    return (
                                        <motion.button
                                            key={period}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => setExpandedDates({ [period]: !isExpanded })}
                                            className={`w-full p-4 rounded-xl text-left transition-all ${
                                                isExpanded
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg scale-105'
                                                    : 'bg-[#1a1f2e]/80 border border-purple-500/20 hover:border-purple-500/40'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Calendar size={20} className={isExpanded ? 'text-white' : 'text-purple-400'} />
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    isExpanded ? 'bg-white/20 text-white' : 'bg-purple-500/20 text-purple-300'
                                                }`}>
                                                    {groupedData[period].length} records
                                                </span>
                                            </div>
                                            <h3 className={`text-lg font-bold ${isExpanded ? 'text-white' : 'text-gray-200'}`}>
                                                {period}
                                            </h3>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* RIGHT SIDE - DATA DISPLAY */}
                            <div className="col-span-9">
                                <AnimatePresence mode="wait">
                                    {sortedPeriods.map((period) => {
                                        const isExpanded = expandedDates[period];
                                        if (!isExpanded) return null;

                                        const periodData = groupedData[period];
                                        const metrics = calculateMetrics(periodData, selectedDepartment);

                                        return (
                                            <motion.div
                                                key={period}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="backdrop-blur-xl bg-[#1a1f2e]/80 rounded-2xl border border-purple-500/20 shadow-2xl p-6"
                                            >
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-white mb-1">{period}</h2>
                                                        <p className="text-gray-400">{selectedDepartment} Department - {periodData.length} records</p>
                                                    </div>
                                                </div>

                                                {metrics ? (
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                        {selectedDepartment === 'CSR' && (
                                                            <>
                                                                <MetricCard icon={Users} label="Agents" value={metrics.agents} color="purple" />
                                                                <MetricCard icon={CheckCircle} label="Completed" value={metrics.completed.toLocaleString()} color="green" />
                                                                <MetricCard icon={Target} label="Effective" value={metrics.effective.toLocaleString()} color="blue" />
                                                                <MetricCard icon={MessageCircle} label="Messages" value={metrics.messages.toLocaleString()} color="cyan" />
                                                                <MetricCard icon={XCircle} label="Missed" value={metrics.missed.toLocaleString()} color="red" />
                                                            </>
                                                        )}
                                                        {selectedDepartment === 'Deposit' && (
                                                            <>
                                                                <MetricCard icon={Users} label="Agents" value={metrics.agents} color="purple" />
                                                                <MetricCard icon={Activity} label="Live Checks" value={metrics.liveChecks.toLocaleString()} color="blue" />
                                                                <MetricCard icon={CheckCircle} label="1st Checks" value={metrics.firstChecks.toLocaleString()} color="green" />
                                                                <MetricCard icon={Target} label="2nd/3rd Checks" value={metrics.secondThirdChecks.toLocaleString()} color="cyan" />
                                                                <MetricCard icon={DollarSign} label="Paycheck" value={metrics.paycheck.toLocaleString()} color="yellow" />
                                                                <MetricCard icon={Activity} label="Records" value={metrics.records.toLocaleString()} color="indigo" />
                                                                <MetricCard icon={XCircle} label="Offline" value={metrics.offline.toLocaleString()} color="red" />
                                                            </>
                                                        )}
                                                        {selectedDepartment === 'Withdraw' && (
                                                            <>
                                                                <MetricCard icon={Users} label="Members" value={metrics.members} color="purple" />
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
                                                    <div className="text-center py-8">
                                                        <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                                        <p className="text-gray-400">No metrics available for this period</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>

                                {/* Show message when no date is selected */}
                                {!sortedPeriods.some(p => expandedDates[p]) && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="backdrop-blur-xl bg-[#1a1f2e]/80 rounded-2xl border border-purple-500/20 shadow-2xl p-12 text-center"
                                    >
                                        <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-white mb-2">Select a Date</h3>
                                        <p className="text-gray-400">Click on a date from the left to view detailed metrics</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ icon: Icon, label, value, color }) => {
    const colorMap = {
        purple: { bg: 'from-purple-600 to-purple-700', border: 'border-purple-500/30', shadow: 'shadow-purple-500/20' },
        green: { bg: 'from-green-600 to-emerald-600', border: 'border-green-500/30', shadow: 'shadow-green-500/20' },
        blue: { bg: 'from-blue-600 to-cyan-600', border: 'border-blue-500/30', shadow: 'shadow-blue-500/20' },
        cyan: { bg: 'from-cyan-600 to-teal-600', border: 'border-cyan-500/30', shadow: 'shadow-cyan-500/20' },
        red: { bg: 'from-red-600 to-orange-600', border: 'border-red-500/30', shadow: 'shadow-red-500/20' },
        yellow: { bg: 'from-yellow-600 to-orange-600', border: 'border-yellow-500/30', shadow: 'shadow-yellow-500/20' },
        indigo: { bg: 'from-indigo-600 to-purple-600', border: 'border-indigo-500/30', shadow: 'shadow-indigo-500/20' },
        emerald: { bg: 'from-emerald-600 to-green-600', border: 'border-emerald-500/30', shadow: 'shadow-emerald-500/20' },
        orange: { bg: 'from-orange-600 to-red-600', border: 'border-orange-500/30', shadow: 'shadow-orange-500/20' }
    };

    const colors = colorMap[color];

    return (
        <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className={`backdrop-blur-xl bg-[#1a1f2e]/80 rounded-xl border ${colors.border} p-4 shadow-lg ${colors.shadow}`}
        >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon size={22} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-xs text-gray-400 font-medium">{label}</p>
        </motion.div>
    );
};

export default DataStoragePage;