import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Activity, Calendar } from 'lucide-react';
import { PerformanceTrendChart } from './ChartComponents';
import { fetchCombinedDepartmentsHistory, loadFromCache } from '../../redux/combinedQuotaSlice';

const GlassCard = ({ children, className = '' }) => (
    <div className={`backdrop-blur-xl bg-[#282e3c38] rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 ${className}`}>
        {children}
    </div>
);

export const PerformanceTrendCard = ({
    title = "Monthly Performance Trend",
    height = 400,
    showFullMonth = true
}) => {

    const dispatch = useDispatch();

    const historyState = useSelector((state) => state.combinedQuota.history);
    const historyLoading = useSelector((state) => state.combinedQuota.historyLoading);

    const CSR = historyState?.CSR || [];
    const Deposit = historyState?.Deposit || [];
    const Withdraw = historyState?.Withdraw || [];
    const fromCache = historyState?.fromCache || false;

    console.log(CSR, "csr data")
    console.log(Deposit, "Deposit data")
    console.log(Withdraw, "Withdraw data")

    useEffect(() => {
        dispatch(loadFromCache());
        setTimeout(() => {
            dispatch(fetchCombinedDepartmentsHistory({ days: 31 })); // Full month ke liye
        }, 100);
    }, [dispatch]);

    const chartData = useMemo(() => {
        if (!CSR.length && !Deposit.length && !Withdraw.length) return [];

        const dateMap = new Map();

        // CSR Data Extraction - "TOTAL EFFECTIVE CONVO" values
        CSR.forEach((day) => {
            const date = day.formattedDate || day.date;
            if (!date) return;

            let csrTotal = 0;

            day.rows.forEach((row) => {
                if (Array.isArray(row) && row.length >= 8) {
                    if (row[0] === "" && row[1]?.includes("Ave. Completed Convo")) {
                        const msValue = parseFloat(String(row[1] || '0').replace(/,/g, '')) || 0;
                        const nsValue = parseFloat(String(row[6] || '0').replace(/,/g, '')) || 0;
                        csrTotal = msValue + nsValue;
                    }
                }
            });

            if (!dateMap.has(date)) {
                dateMap.set(date, {
                    date,
                    CSR: 0,
                    Deposit: 0,
                    Withdraw: 0,
                    day: `Day ${date.split('/')[1]}`
                });
            }
            dateMap.get(date).CSR = csrTotal;
        });

        // Deposit Data Extraction - "Total" row se
        Deposit.forEach((day) => {
            const date = day.formattedDate || day.date;
            if (!date) return;

            let depositTotal = 0;

            // "Total" row mein se data extract karna
            day.rows.forEach((row) => {
                if (Array.isArray(row) && row[0] === "Total" && row.length >= 8) {
                    depositTotal = parseFloat(String(row[7] || '0').replace(/,/g, '')) || 0;
                }
            });

            if (!dateMap.has(date)) {
                dateMap.set(date, {
                    date,
                    CSR: 0,
                    Deposit: 0,
                    Withdraw: 0,
                    day: `Day ${date.split('/')[1]}`
                });
            }
            dateMap.get(date).Deposit = depositTotal;
        });

        // Withdraw Data Extraction - "TOTAL" rows se "Total amount passed"
        Withdraw.forEach((day) => {
            const date = day.formattedDate || day.date;
            if (!date) return;

            let withdrawTotal = 0;

            // "TOTAL" rows mein se "Total amount passed" extract karna
            day.rows.forEach((row) => {
                if (Array.isArray(row) && row[0] === "TOTAL" && row.length >= 6) {
                    const amountPassed = parseFloat(String(row[5] || '0').replace(/,/g, '')) || 0;
                    withdrawTotal += amountPassed;
                }
            });

            if (!dateMap.has(date)) {
                dateMap.set(date, {
                    date,
                    CSR: 0,
                    Deposit: 0,
                    Withdraw: 0,
                    day: `Day ${date.split('/')[1]}`
                });
            }
            dateMap.get(date).Withdraw = withdrawTotal;
        });

        // Date ke hisaab se sort karna (month/day format)
        const sortedData = Array.from(dateMap.values()).sort((a, b) => {
            const getDateValue = (dateStr) => {
                if (!dateStr) return 0;
                const parts = dateStr.split('/');
                if (parts.length === 2) {
                    return parseInt(parts[0]) * 100 + parseInt(parts[1]);
                }
                return 0;
            };
            return getDateValue(a.date) - getDateValue(b.date);
        });

        return sortedData;
    }, [CSR, Deposit, Withdraw]);

    const stats = useMemo(() => {
        if (!chartData.length) {
            return {
                CSR: { total: 0, avg: 0, max: 0, min: 0 },
                Deposit: { total: 0, avg: 0, max: 0, min: 0 },
                Withdraw: { total: 0, avg: 0, max: 0, min: 0 }
            };
        }

        const csrValues = chartData.map(day => day.CSR || 0).filter(val => val > 0);
        const depositValues = chartData.map(day => day.Deposit || 0).filter(val => val > 0);
        const withdrawValues = chartData.map(day => day.Withdraw || 0).filter(val => val > 0);

        const totals = chartData.reduce(
            (acc, day) => ({
                CSR: acc.CSR + (day.CSR || 0),
                Deposit: acc.Deposit + (day.Deposit || 0),
                Withdraw: acc.Withdraw + (day.Withdraw || 0),
            }),
            { CSR: 0, Deposit: 0, Withdraw: 0 }
        );

        return {
            CSR: {
                total: Math.round(totals.CSR),
                avg: Math.round(totals.CSR / chartData.length),
                max: csrValues.length ? Math.max(...csrValues) : 0,
                min: csrValues.length ? Math.min(...csrValues) : 0
            },
            Deposit: {
                total: Math.round(totals.Deposit),
                avg: Math.round(totals.Deposit / chartData.length),
                max: depositValues.length ? Math.max(...depositValues) : 0,
                min: depositValues.length ? Math.min(...depositValues) : 0
            },
            Withdraw: {
                total: Math.round(totals.Withdraw),
                avg: Math.round(totals.Withdraw / chartData.length),
                max: withdrawValues.length ? Math.max(...withdrawValues) : 0,
                min: withdrawValues.length ? Math.min(...withdrawValues) : 0
            }
        };
    }, [chartData]);

    const monthName = useMemo(() => {
        if (!chartData.length) return '';
        const firstDate = chartData[0].date;
        const [month] = firstDate.split('/');
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[parseInt(month) - 1] || '';
    }, [chartData]);

    return (
        <GlassCard className="p-6 mb-8 w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Activity className="text-blue-400" />
                        {monthName ? `${monthName} ${title}` : title}
                    </h3>

                    {fromCache && !historyLoading && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                            Cached
                        </span>
                    )}
                </div>

                {chartData.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar size={16} />
                        <span>{chartData.length} days data</span>
                    </div>
                )}
            </div>

            {/* Enhanced Stats */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="text-xs text-blue-400 mb-2">CSR Performance</div>
                    <div className="text-2xl font-bold text-blue-300">{stats.CSR.avg}</div>
                    <div className="text-xs text-gray-400 mt-1">Avg: {stats.CSR.avg}</div>
                    <div className="text-xs text-gray-400">Total: {stats.CSR.total.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Range: {stats.CSR.min}-{stats.CSR.max}</div>
                </div>

                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <div className="text-xs text-green-400 mb-2">Deposit Performance</div>
                    <div className="text-2xl font-bold text-green-300">₹{stats.Deposit.avg}</div>
                    <div className="text-xs text-gray-400 mt-1">Avg: ₹{stats.Deposit.avg}</div>
                    <div className="text-xs text-gray-400">Total: ₹{stats.Deposit.total.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Range: ₹{stats.Deposit.min}-{stats.Deposit.max}</div>
                </div>

                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                    <div className="text-xs text-purple-400 mb-2">Withdraw Performance</div>
                    <div className="text-2xl font-bold text-purple-300">₹{stats.Withdraw.avg}</div>
                    <div className="text-xs text-gray-400 mt-1">Avg: ₹{stats.Withdraw.avg}</div>
                    <div className="text-xs text-gray-400">Total: ₹{stats.Withdraw.total.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Range: ₹{stats.Withdraw.min}-{stats.Withdraw.max}</div>
                </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 ? (
                <div className="relative">
                    <PerformanceTrendChart
                        data={chartData}
                        height={height}
                        showFullMonth={showFullMonth}
                    />
                    <div className="flex justify-center mt-4 gap-6 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-1 bg-blue-500 rounded"></div>
                            <span>CSR Conversations</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-1 bg-green-500 rounded"></div>
                            <span>Deposit Amount</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-1 bg-purple-500 rounded"></div>
                            <span>Withdraw Amount</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-gray-500">
                    {historyLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                            <div>Loading monthly performance data...</div>
                        </>
                    ) : (
                        "No monthly performance data available"
                    )}
                </div>
            )}

            {/* Data Summary */}
            {chartData.length > 0 && (
                <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Monthly Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                            <div className="text-gray-400">Total Days</div>
                            <div className="text-white">{chartData.length}</div>
                        </div>
                        <div>
                            <div className="text-gray-400">Active CSR Days</div>
                            <div className="text-white">{chartData.filter(day => day.CSR > 0).length}</div>
                        </div>
                        <div>
                            <div className="text-gray-400">Active Deposit Days</div>
                            <div className="text-white">{chartData.filter(day => day.Deposit > 0).length}</div>
                        </div>
                        <div>
                            <div className="text-gray-400">Active Withdraw Days</div>
                            <div className="text-white">{chartData.filter(day => day.Withdraw > 0).length}</div>
                        </div>
                    </div>
                </div>
            )}
        </GlassCard>
    );
};

export default PerformanceTrendCard;