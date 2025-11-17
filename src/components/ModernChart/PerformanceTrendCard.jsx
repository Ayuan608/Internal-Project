import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Activity } from 'lucide-react';
import { PerformanceTrendChart } from './ChartComponents';
import { fetchCombinedDepartmentsHistory, loadFromCache } from '../../redux/combinedQuotaSlice';

const GlassCard = ({ children, className = '' }) => (
    <div className={`backdrop-blur-xl bg-[#282e3c38] rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 ${className}`}>
        {children}
    </div>
);

export const PerformanceTrendCard = ({
    title = "30-Day Performance Trend (Real Data)",
    height = 300,
    days = 30
}) => {

    const dispatch = useDispatch();

    const historyState = useSelector((state) => state.combinedQuota.history);
    const historyLoading = useSelector((state) => state.combinedQuota.historyLoading);

    const CSR = historyState?.CSR || [];
    const Deposit = historyState?.Deposit || [];
    const Withdraw = historyState?.Withdraw || [];
    const fromCache = historyState?.fromCache || false;

    useEffect(() => {
        dispatch(loadFromCache());
        setTimeout(() => {
            dispatch(fetchCombinedDepartmentsHistory({ days }));
        }, 100);
    }, [dispatch, days]);

    const chartData = useMemo(() => {
        if (!CSR.length && !Deposit.length && !Withdraw.length) return [];

        const dateMap = new Map();

        const extractTotal = (dayData, department) => {
            if (!dayData?.rows?.length) return 0;

            let total = 0;

            dayData.rows.forEach((row) => {
                if (!Array.isArray(row)) return;

                let value = 0;
                if (department === "CSR") {
                    value = Number(row[1]) || 0;
                } else {
                    const rawValue = String(row[2] || '0').replace(/,/g, '');
                    value = Number(rawValue) || 0;
                }

                total += value;
            });

            return total;
        };

        // CSR
        CSR.forEach((day, i) => {
            const date = day.formattedDate || `Day ${i + 1}`;
            if (!dateMap.has(date)) dateMap.set(date, { date, CSR: 0, Deposit: 0, Withdraw: 0 });
            dateMap.get(date).CSR = extractTotal(day, "CSR");
        });

        // Deposit
        Deposit.forEach((day, i) => {
            const date = day.formattedDate || `Day ${i + 1}`;
            if (!dateMap.has(date)) dateMap.set(date, { date, CSR: 0, Deposit: 0, Withdraw: 0 });
            dateMap.get(date).Deposit = extractTotal(day, "Deposit");
        });

        // Withdraw
        Withdraw.forEach((day, i) => {
            const date = day.formattedDate || `Day ${i + 1}`;
            if (!dateMap.has(date)) dateMap.set(date, { date, CSR: 0, Deposit: 0, Withdraw: 0 });
            dateMap.get(date).Withdraw = extractTotal(day, "Withdraw");
        });

        return Array.from(dateMap.values());
    }, [CSR, Deposit, Withdraw]);

    const stats = useMemo(() => {
        if (!chartData.length) {
            return {
                CSR: { total: 0, avg: 0 },
                Deposit: { total: 0, avg: 0 },
                Withdraw: { total: 0, avg: 0 }
            };
        }

        const totals = chartData.reduce(
            (acc, day) => ({
                CSR: acc.CSR + (day.CSR || 0),
                Deposit: acc.Deposit + (day.Deposit || 0),
                Withdraw: acc.Withdraw + (day.Withdraw || 0),
            }),
            { CSR: 0, Deposit: 0, Withdraw: 0 }
        );

        return {
            CSR: { total: totals.CSR, avg: Math.round(totals.CSR / chartData.length) },
            Deposit: { total: totals.Deposit, avg: Math.round(totals.Deposit / chartData.length) },
            Withdraw: { total: totals.Withdraw, avg: Math.round(totals.Withdraw / chartData.length) }
        };
    }, [chartData]);

    return (
        <GlassCard className="p-6 mb-8 w-full">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Activity className="text-blue-400" /> {title}
                    </h3>

                    {fromCache && !historyLoading && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                            Cached
                        </span>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className='flex items-center gap-4 mb-6'>
                <div className="flex-1 bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="text-xs text-blue-400 mb-1">CSR Avg/Day</div>
                    <div className="text-2xl font-bold text-blue-300">{stats.CSR.avg}</div>
                    <div className="text-xs text-gray-400 mt-1">Total: {stats.CSR.total}</div>
                </div>

                <div className="flex-1 bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <div className="text-xs text-green-400 mb-1">Deposit Avg/Day</div>
                    <div className="text-2xl font-bold text-green-300">₹{stats.Deposit.avg}</div>
                    <div className="text-xs text-gray-400 mt-1">Total: ₹{stats.Deposit.total}</div>
                </div>

                <div className="flex-1 bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                    <div className="text-xs text-purple-400 mb-1">Withdraw Avg/Day</div>
                    <div className="text-2xl font-bold text-purple-300">₹{stats.Withdraw.avg}</div>
                    <div className="text-xs text-gray-400 mt-1">Total: ₹{stats.Withdraw.total}</div>
                </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 ? (
                <PerformanceTrendChart data={chartData} height={height} />
            ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                    {historyLoading ? "Loading..." : "No performance data available"}
                </div>
            )}
        </GlassCard>
    );
};

export default PerformanceTrendCard;
