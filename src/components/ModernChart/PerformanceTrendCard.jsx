import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Activity as ActivityIcon, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { DepartmentGoalChart } from './ChartComponents';
import { fetchCombinedDepartmentsHistory, loadFromCache } from '../../redux/combinedQuotaSlice';

const GlassCard = ({ children, className = '' }) => (
    <div className={`backdrop-blur-xl bg-[#282e3c38] rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 ${className}`}>
        {children}
    </div>
);

export const PerformanceTrendCard = ({
    height = 400,
}) => {

    const dispatch = useDispatch();
    const [selectedDept, setSelectedDept] = useState('csr');

    const historyState = useSelector((state) => state.combinedQuota.history);
    const historyLoading = useSelector((state) => state.combinedQuota.historyLoading);
    console.log(
        "his", historyState
    )
    useEffect(() => {
        dispatch(loadFromCache());
        setTimeout(() => {
            dispatch(fetchCombinedDepartmentsHistory({ days: 31 }));
        }, 100);
    }, [dispatch]);

    // const getDailyTotals = useMemo(() => {
    //     if (!historyState) return [];

    //     const result = [];
    //     const totalDays = historyState?.CSR?.length || 0;

    //     for (let i = 0; i < totalDays; i++) {
    //         const csrDay = historyState.CSR[i];
    //         const depositDay = historyState.Deposit[i];
    //         const withdrawDay = historyState.Withdraw[i];

    //         let dailyCSR = 0;
    //         let dailyDeposit = 0;
    //         let dailyWithdraw = 0;

    //         // CSR total
    //         csrDay?.rows?.forEach((row) => {
    //             if (
    //                 row[0] &&
    //                 row[1] &&
    //                 !row[0].includes("shift") &&
    //                 !row[0].includes("TOTAL") &&
    //                 !row[0].includes("FAILED") &&
    //                 !isNaN(parseInt(row[1]?.replace(/,/g, "")))
    //             ) {
    //                 dailyCSR += parseInt(row[1].replace(/,/g, ""));
    //             }
    //         });

    //         // Deposit total (col 7)
    //         depositDay?.rows?.forEach((row) => {
    //             if (
    //                 row[7] &&
    //                 !row[0].includes("Total") &&
    //                 !isNaN(parseInt(row[7]?.replace(/,/g, "")))
    //             ) {
    //                 dailyDeposit += parseInt(row[7].replace(/,/g, ""));
    //             }
    //         });

    //         // Withdraw total (col 5)
    //         withdrawDay?.rows?.forEach((row) => {
    //             if (
    //                 row[5] &&
    //                 !row[0].includes("TOTAL") &&
    //                 !row[0].includes("reject") &&
    //                 !isNaN(parseInt(row[5]?.replace(/,/g, "")))
    //             ) {
    //                 dailyWithdraw += parseInt(row[5].replace(/,/g, ""));
    //             }
    //         });

    //         result.push({
    //             day: i + 1,
    //             dateLabel: csrDay?.dateKey ? new Date(csrDay.dateKey).toLocaleDateString("en-GB") : `Day ${i + 1}`,
    //             csr: dailyCSR,
    //             deposit: dailyDeposit,
    //             withdraw: dailyWithdraw,
    //             dateKey: csrDay?.dateKey,
    //         });
    //     }

    //     return result;
    // }, [historyState]);
    const getDailyTotals = useMemo(() => {
        if (!historyState) return [];

        // Step 1: Current month ke total days
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        // Full days array: 1–30 or 1–31
        const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const result = allDays.map((day) => {
            const apiIndex = day - 1;
            const csrDay = historyState?.CSR?.[apiIndex];
            const depositDay = historyState?.Deposit?.[apiIndex];
            const withdrawDay = historyState?.Withdraw?.[apiIndex];

            // If API data exists → calculate
            if (csrDay) {
                let dailyCSR = 0;
                csrDay.rows.forEach((row) => {
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

                let dailyDeposit = 0;
                if (depositDay) {
                    depositDay.rows.forEach((row) => {
                        if (
                            row[7] &&
                            !row[0].includes("Total") &&
                            !isNaN(parseInt(row[7]?.replace(/,/g, "")))
                        ) {
                            dailyDeposit += parseInt(row[7].replace(/,/g, ""));
                        }
                    });
                }

                let dailyWithdraw = 0;
                if (withdrawDay) {
                    withdrawDay.rows.forEach((row) => {
                        if (
                            row[5] &&
                            !row[0].includes("TOTAL") &&
                            !row[0].includes("reject") &&
                            !isNaN(parseInt(row[5]?.replace(/,/g, "")))
                        ) {
                            dailyWithdraw += parseInt(row[5].replace(/,/g, ""));
                        }
                    });
                }


                return {
                    day,
                    dateLabel: csrDay.formattedDate,
                    csr: dailyCSR,
                    deposit: dailyDeposit,
                    withdraw: dailyWithdraw,
                };
            }

            // Missing days → Null (NO ZERO DROP!)
            return {
                day,
                dateLabel: `${day}/${now.getMonth() + 1}`,
                csr: null,
                deposit: null,
                withdraw: null,
            };
        });

        return result;
    }, [historyState]);

    const chartData = getDailyTotals
        .filter((d, i, arr) => arr.findIndex(e => e.dateLabel === d.dateLabel) === i)
        .sort((a, b) => a.day - b.day);



    // Define goals
    const goals = useMemo(() => ({
        csr: 10000,
        deposit: 15000,
        withdraw: 5000
    }), []);

    // Department configurations - Pass full data with dateLabel
    const departments = {
        csr: {
            name: 'CSR Conversions',
            color: '#3B82F6',
            bgColor: 'bg-[oklch(62.3%_0.214_259.815)]/10',
            borderColor: 'border-[oklch(62.3%_0.214_259.815)]/30',
            textColor: 'text-[oklch(62.3%_0.214_259.815)]',
            labelColor: 'text-[oklch(62.3%_0.214_259.815)]',
            goal: goals.csr,
            currency: '',
            data: chartData.map(d => ({ day: d.day, value: d.csr, dateLabel: d.dateLabel }))
        },
        deposit: {
            name: 'Deposit Performance',
            color: '#10B981',
            bgColor: 'bg-[oklch(72.3%_0.219_149.579)]/10',
            borderColor: 'border-[oklch(72.3%_0.219_149.579)]/30',
            textColor: 'text-[oklch(72.3%_0.219_149.579)]',
            labelColor: 'text-[oklch(72.3%_0.219_149.579)]',
            goal: goals.deposit,
            currency: '₹',
            data: chartData.map(d => ({ day: d.day, value: d.deposit, dateLabel: d.dateLabel }))
        },
        withdraw: {
            name: 'Withdraw Transactions',
            color: '#A855F7',
            bgColor: 'bg-[oklch(62.7%_0.265_303.9)]/10',
            borderColor: 'border-[oklch(62.7%_0.265_303.9)]/30',
            textColor: 'text-[oklch(62.7%_0.265_303.9)]',
            labelColor: 'text-[oklch(62.7%_0.265_303.9)]',
            goal: goals.withdraw,
            currency: '₹',
            data: chartData.map(d => ({ day: d.day, value: d.withdraw, dateLabel: d.dateLabel }))
        }
    };

    const currentDept = departments[selectedDept];

    const stats = useMemo(() => {
        if (!chartData.length) {
            return {
                CSR: { total: 0, avg: 0, max: 0, min: 0, aboveGoal: 0 },
                Deposit: { total: 0, avg: 0, max: 0, min: 0, aboveGoal: 0 },
                Withdraw: { total: 0, avg: 0, max: 0, min: 0, aboveGoal: 0 }
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
                min: csrValues.length ? Math.min(...csrValues) : 0,
                aboveGoal: chartData.filter(d => d.csr >= goals.csr).length
            },
            Deposit: {
                total: Math.round(totals.Deposit),
                avg: Math.round(totals.Deposit / chartData.length),
                max: depositValues.length ? Math.max(...depositValues) : 0,
                min: depositValues.length ? Math.min(...depositValues) : 0,
                aboveGoal: chartData.filter(d => d.deposit >= goals.deposit).length
            },
            Withdraw: {
                total: Math.round(totals.Withdraw),
                avg: Math.round(totals.Withdraw / chartData.length),
                max: withdrawValues.length ? Math.max(...withdrawValues) : 0,
                min: withdrawValues.length ? Math.min(...withdrawValues) : 0,
                aboveGoal: chartData.filter(d => d.withdraw >= goals.withdraw).length
            }
        };
    }, [chartData, goals]);
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

            <div className="w-full mb-6 flex flex-col gap-4">

                {/* TOP ROW — LEFT: TITLE, RIGHT: 3 CARDS */}
                <div className="flex justify-between items-start w-full">

                    {/* LEFT: Month + Heading */}
                    <div className="flex flex-col">
                        <span className="text-xl text-gray-400">{monthName}</span>
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            <ActivityIcon className="text-blue-400" />
                            Monthly Performance
                        </h3>
                    </div>

                    {/* RIGHT: 3 CARDS — CLICKABLE & COLORED */}
                    <div className="flex gap-3">

                        {/* CSR CARD */}
                        <button
                            onClick={() => setSelectedDept("csr")}
                            className={`px-4 py-3 rounded-xl border min-w-[160px] transition-all duration-300
                    ${selectedDept === "csr"
                                    ? "bg-[oklch(62.3%_0.214_259.815)]/20 border-[oklch(62.3%_0.214_259.815)] shadow-[0_10px_30px_oklch(62.3%_0.214_259.815/0.4)]"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                }`}
                        >
                            <div className="text-xs mb-1" style={{ color: "oklch(62.3% 0.214 259.815)" }}>
                                CSR Conversions
                            </div>
                            <div className="text-xl font-bold" style={{ color: "oklch(62.3% 0.214 259.815)" }}>
                                {stats.CSR.avg.toLocaleString()}
                            </div>
                        </button>

                        {/* DEPOSIT CARD */}
                        <button
                            onClick={() => setSelectedDept("deposit")}
                            className={`px-4 py-3 rounded-xl border min-w-[160px] transition-all duration-300
                    ${selectedDept === "deposit"
                                    ? "bg-[oklch(72.3%_0.219_149.579)]/20 border-[oklch(72.3%_0.219_149.579)] shadow-[0_10px_30px_oklch(72.3%_0.219_149.579/0.4)]"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                }`}
                        >
                            <div className="text-xs mb-1" style={{ color: "oklch(72.3% 0.219 149.579)" }}>
                                Deposit Performance
                            </div>
                            <div className="text-xl font-bold" style={{ color: "oklch(72.3% 0.219 149.579)" }}>
                                ₹{stats.Deposit.avg.toLocaleString()}
                            </div>
                        </button>

                        {/* WITHDRAW CARD */}
                        <button
                            onClick={() => setSelectedDept("withdraw")}
                            className={`px-4 py-3 rounded-xl border min-w-[160px] transition-all duration-300
                    ${selectedDept === "withdraw"
                                    ? "bg-[oklch(62.7%_0.265_303.9)]/20 border-[oklch(62.7%_0.265_303.9)] shadow-[0_10px_30px_oklch(62.7%_0.265_303.9/0.4)]"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                }`}
                        >
                            <div className="text-xs mb-1" style={{ color: "oklch(62.7% 0.265 303.9)" }}>
                                Withdraw Transactions
                            </div>
                            <div className="text-xl font-bold" style={{ color: "oklch(62.7% 0.265 303.9)" }}>
                                ₹{stats.Withdraw.avg.toLocaleString()}
                            </div>
                        </button>

                    </div>
                </div>



            </div>


            {/* Department Tabs */}
            {chartData.length > 0 ? (
                <div className="relative">
                    {/* Chart Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs text-gray-400 ">
                                Goal: {currentDept.currency}{currentDept.goal.toLocaleString()}/day
                            </p>
                        </div>
                    </div>

                    {/* Chart with smooth transition */}
                    <div className="transition-all duration-500 ease-in-out">
                        <DepartmentGoalChart
                            // dateLabel={dateLabel}
                            data={currentDept.data}
                            goalValue={currentDept.goal}
                            metricName={selectedDept.toUpperCase()}
                            color={currentDept.color}
                            height={height}
                            currency={currentDept.currency}
                        />
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center mt-4 gap-6 text-xs text-gray-300">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{
                                backgroundColor: currentDept.color,
                                boxShadow: `0 0 8px ${currentDept.color}60`
                            }}></div>
                            <span>{currentDept.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400 rounded"></div>
                            <span>Goal Line</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500/60 rounded-sm"></div>
                            <span>Above Goal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500/60 rounded-sm"></div>
                            <span>Below Goal</span>
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
        </GlassCard>
    );
};

export default PerformanceTrendCard;