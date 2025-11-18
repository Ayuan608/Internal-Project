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

    useEffect(() => {
        dispatch(loadFromCache());
        setTimeout(() => {
            dispatch(fetchCombinedDepartmentsHistory({ days: 31 })); // Full month ke liye
        }, 100);
    }, [dispatch]);



    const getDailyTotals = useMemo(() => {
        if (!historyState) return [];

        const result = [];

        const totalDays = historyState?.CSR?.length || 0;

        for (let i = 0; i < totalDays; i++) {
            const csrDay = historyState.CSR[i];
            const depositDay = historyState.Deposit[i];
            const withdrawDay = historyState.Withdraw[i];

            let dailyCSR = 0;
            let dailyDeposit = 0;
            let dailyWithdraw = 0;

            // CSR total
            csrDay?.rows?.forEach((row) => {
                if (
                    row[0] &&
                    row[1] &&
                    !row[0].includes("shift") &&
                    !row[0].includes("TOTAL") &&
                    !row[0].includes("FAILED") &&
                    !isNaN(parseInt(row[1]?.replace(/,/g, "")))
                ) {
                    dailyCSR += parseInt(row[1].replace(/,/g, ""));
                }
            });

            // Deposit total (col 7)
            depositDay?.rows?.forEach((row) => {
                if (
                    row[7] &&
                    !row[0].includes("Total") &&
                    !isNaN(parseInt(row[7]?.replace(/,/g, "")))
                ) {
                    dailyDeposit += parseInt(row[7].replace(/,/g, ""));
                }
            });

            // Withdraw total (col 2)
            withdrawDay?.rows?.forEach((row) => {
                if (
                    row[2] &&
                    !row[0].includes("TOTAL") &&
                    !row[0].includes("reject") &&
                    !isNaN(parseInt(row[5]?.replace(/,/g, "")))
                ) {
                    dailyWithdraw += parseInt(row[5].replace(/,/g, ""));
                }
            });
            result.push({
                day: i + 1,
                csr: dailyCSR,
                deposit: dailyDeposit,
                withdraw: dailyWithdraw,
                dateKey: csrDay?.dateKey,
            });
        }

        return result;
    }, [historyState]);


    const chartData = getDailyTotals


    const stats = useMemo(() => {
        if (!chartData.length) {
            return {
                CSR: { total: 0, avg: 0, max: 0, min: 0 },
                Deposit: { total: 0, avg: 0, max: 0, min: 0 },
                Withdraw: { total: 0, avg: 0, max: 0, min: 0 }
            };
        }

        const csrValues = chartData.map(day => day.csr || 0).filter(val => val > 0);
        const depositValues = chartData.map(day => day.deposit || 0).filter(val => val > 0);
        const withdrawValues = chartData.map(day => day.withdraw || 0).filter(val => val > 0);

        const totals = chartData.reduce(
            (acc, day) => ({
                CSR: acc.CSR + (day.csr || 0),
                Deposit: acc.Deposit + (day.deposit || 0),
                Withdraw: acc.Withdraw + (day.withdraw || 0),
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



    // 2) Fix month name crash
    const monthName = useMemo(() => {
        if (!chartData.length) return "";

        const monthIndex = new Date().getMonth();

        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return months[monthIndex];
    }, [chartData]);

    return (
        <GlassCard className="p-6 mb-8 w-full">
            <div className="flex items-center justify-between w-full mb-6">

                {/* LEFT SIDE */}
                <div className="flex flex-col">
                    <span className="text-xl  text-gray-400">{monthName}</span>

                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="text-blue-400" />
                        Monthly Performance
                    </h3>
                </div>

                {/* RIGHT SIDE → Days + Stats */}
                <div className="flex items-center gap-4">


                    {/* CSR CARD */}
                    <div className="bg-blue-500/10 rounded-lg px-4 py-3 border border-blue-500/20 w-40">
                        <div className="text-xs text-blue-400 mb-1">CSR Conversions</div>
                        <div className="text-xl font-bold text-blue-300">
                            {stats?.CSR?.avg?.toLocaleString()}
                        </div>
                    </div>

                    {/* DEPOSIT CARD */}
                    <div className="bg-green-500/10 rounded-lg px-4 py-3 border border-green-500/20 w-40">
                        <div className="text-xs text-green-400 mb-1">Deposit Performance</div>
                        <div className="text-xl font-bold text-green-300">
                            ₹{stats?.Deposit?.avg?.toLocaleString()}
                        </div>
                    </div>

                    {/* WITHDRAW CARD */}
                    <div className="bg-purple-500/10 rounded-lg px-4 py-3 border border-purple-500/20 w-40">
                        <div className="text-xs text-purple-400 mb-1">Withdraw Transaction</div>
                        <div className="text-xl font-bold text-purple-300">
                            ₹{stats?.Withdraw?.avg?.toLocaleString()}
                        </div>
                    </div>

                </div>
            </div>


            {/* Chart */}
            {chartData.length > 0 ? (
                <div className="relative">

                    {/* CHART */}
                    <PerformanceTrendChart
                        data={chartData}          // full data for tooltip
                        csrData={chartData.map(d => d.csr)}
                        depositData={chartData.map(d => d.deposit)}
                        withdrawData={chartData.map(d => d.withdraw)}
                        height={height}
                    />

                    {/* LEGENDS */}
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

                    {/* DAYS BADGE → RIGHT SIDE OVERLAY */}
                    {chartData.length > 0 && (
                        <div className="absolute top-0 right-0 flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-3 py-2 rounded-lg border border-white/10 shadow">
                            <Calendar size={16} className="text-gray-300" />
                            <span>{chartData.length} days data</span>
                        </div>
                    )}

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
            {/* {chartData.length > 0 && (
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
            )} */}
        </GlassCard>
    );
};

export default PerformanceTrendCard;