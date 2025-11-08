// useTeamLeaderDashboard.js
import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";

const formatCompactNumber = (num, decimals = 1) => {
    if (typeof num !== "number" || isNaN(num)) return "0";
    const abs = Math.abs(num);
    const sign = num < 0 ? "-" : "";
    if (abs >= 1e9) return sign + (abs / 1e9).toFixed(decimals) + "B";
    if (abs >= 1e6) return sign + (abs / 1e6).toFixed(decimals) + "M";
    if (abs >= 1e3) return sign + (abs / 1e3).toFixed(decimals) + "K";
    return sign + abs.toString();
};

const formatNumberSmart = (num) => {
    if (typeof num !== "number" || isNaN(num)) return "0";
    const abs = Math.abs(num);
    if (abs >= 1e6) return formatCompactNumber(num, 1);
    if (abs >= 1e4) return formatCompactNumber(num, 0);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const safeDivide = (a, b, fallback = 0) => (b > 0 ? a / b : fallback);




export const useTeamLeaderDashboard = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [timeFilter, setTimeFilter] = useState("daily");

    const [dashboardData, setDashboardData] = useState({
        totalCases: 0,
        activeAgents: 0,
        avgResponseTime: 0,
        successRate: 0,
        csrQuota: { met: 0, nonMet: 100 },
        depositQuota: { met: 0, nonMet: 100 },
        withdrawalQuota: { met: 0, nonMet: 100 },
        totalConversations: 0,
        totalTransactions: 0,
        positiveRate: 0,
        firstResponseTime: 0,
    });

    const [teamLeaderStats, setTeamLeaderStats] = useState([]);
    const [filteredStats, setFilteredStats] = useState([]);
    const [shiftChartData, setShiftChartData] = useState({});
    const [quotaManagementData, setQuotaManagementData] = useState([]);

    const { data, loading: combinedQuotaLoading } = useSelector(
        (state) => state.combinedQuota
    );
    const { department } = useSelector((state) => state.auth?.data || {});



    const parseTimeToSeconds = (timeStr) => {
        if (!timeStr || typeof timeStr !== "string") return 0;
        const parts = timeStr.split(":").map((p) => parseInt(p, 10) || 0);
        return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    };

    const parsePercentage = (str) => {
        if (!str || typeof str !== "string") return 0;
        return parseFloat(str.replace("%", "").trim()) || 0;
    };


    const calculateFilteredValues = (baseValue, filter) => {
        const multipliers = { daily: 1, weekly: 7, monthly: 30 };
        return Math.round(baseValue * (multipliers[filter] || 1));
    };

    const generateFilteredSparkline = (base, variation = 0.2, filter) => {
        const length = filter === "daily" ? 24 : filter === "weekly" ? 7 : 30;
        return Array.from({ length }, () =>
            Math.max(0, Math.round(base * (1 + Math.random() * variation * 2 - variation)))
        );
    };

    const generateShiftChartData = (totalValue, filter) => {
        const morning = Math.round(totalValue * 0.3);
        const afternoon = Math.round(totalValue * 0.45);
        const night = Math.round(totalValue * 0.25);
        const rand = (v) => Math.round(v * (0.7 + Math.random() * 0.6));

        if (filter === "daily") {
            return {
                labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"],
                datasets: [
                    {
                        label: "Morning Shift (6AM-2PM)",
                        data: [
                            rand(morning * 0.1),
                            rand(morning * 0.3),
                            rand(morning * 0.8),
                            rand(morning * 1.0),
                            rand(morning * 0.6),
                            rand(morning * 0.2),
                            rand(morning * 0.05),
                        ],
                        borderColor: "rgb(59, 130, 246)",
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                        tension: 0.4,
                        fill: true,
                    },

                    {
                        label: "Night Shift (10PM-6AM)",
                        data: [
                            rand(night * 0.6),
                            rand(night * 0.8),
                            rand(night * 0.3),
                            rand(night * 0.1),
                            rand(night * 0.2),
                            rand(night * 0.7),
                            rand(night * 1.0),
                        ],
                        borderColor: "rgb(168, 85, 247)",
                        backgroundColor: "rgba(168, 85, 247, 0.2)",
                        tension: 0.4,
                        fill: true,
                    },
                ],
            };
        }

        const days = filter === "weekly" ? 7 : 4;
        const labels =
            filter === "weekly"
                ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                : ["Week 1", "Week 2", "Week 3", "Week 4"];

        return {
            labels,
            datasets: [
                {
                    label: "Morning Shift",
                    data: Array.from({ length: days }, () => rand(morning)),
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    tension: 0.4,
                    fill: true,
                },

                {
                    label: "Night Shift",
                    data: Array.from({ length: days }, () => rand(night)),
                    borderColor: "rgb(168, 85, 247)",
                    backgroundColor: "rgba(168, 85, 247, 0.2)",
                    tension: 0.4,
                    fill: true,
                },
            ],
        };
    };

    const generateQuotaManagementData = (totalValue, filter, activeAgents) => {
        const agents = activeAgents.length > 0 ? activeAgents : ["No agents"];
        const multiplier = { daily: 1, weekly: 7, monthly: 30 }[filter] || 1;
        const baseQuota = agents.length > 0 ? Math.round(totalValue / agents.length / multiplier) : 0;

        return agents.map((agent) => {
            const variance = 0.7 + Math.random() * 0.5; // 70%–120%
            const achieved = Math.round(baseQuota * variance * multiplier);
            const quota = Math.round(baseQuota * multiplier);
            const performance = quota > 0 ? Math.min(100, Math.round((achieved / quota) * 100)) : 0;
            return { agent, quota, achieved, performance };
        });
    };


    const processCSRDataForTeamLeader = useCallback(
        (apiData, filter = "daily") => {
            if (!apiData || !Array.isArray(apiData)) return { stats: [], agents: [] };

            let totalCompleted = 0,
                totalEffective = 0,
                totalFirstRespSec = 0,
                totalPosRate = 0,
                agents = 0;
            const activeAgents = [];

            apiData.forEach((row) => {
                if (!Array.isArray(row) || row.length < 9) return;
                const type = row[0]?.toString().trim();
                const name = row[1]?.toString().trim();

                if (
                    type === "CSR" &&
                    name &&
                    !name.toLowerCase().includes("shift") &&
                    !name.toLowerCase().includes("trainee") &&
                    !name.includes("HIGHLIGHTS") &&
                    name !== "Member"
                ) {
                    const completed = parseInt(row[2], 10) || 0;
                    const effective = parseInt(row[3], 10) || 0;
                    const frtStr = row[7]?.toString() || "0:00:00";
                    const posStr = row[8]?.toString() || "0%";

                    if (completed > 0) {
                        totalCompleted += completed;
                        totalEffective += effective;
                        totalFirstRespSec += parseTimeToSeconds(frtStr);
                        totalPosRate += parsePercentage(posStr);
                        agents++;
                        activeAgents.push(name);
                    }
                }
            });

            if (agents === 0) return { stats: [], agents: [] };

            const avgFirstRespSec = safeDivide(totalFirstRespSec, agents);
            const avgPosRate = safeDivide(totalPosRate, agents);
            const efficiency = totalCompleted > 0 ? safeDivide(totalEffective, totalCompleted) * 100 : 0;

            const minutes = (avgFirstRespSec / 60).toFixed(1);
            const seconds = Math.round(avgFirstRespSec % 60);

            const baseDaily = totalCompleted > 0 ? totalCompleted / 30 : 100;
            const filteredConvo = calculateFilteredValues(baseDaily, filter);
            const filteredPos = filter === "daily" ? avgPosRate : Math.min(100, avgPosRate * (filter === "weekly" ? 1.1 : 1.2));
            const filteredEff = filter === "daily" ? efficiency : Math.min(100, efficiency * (filter === "weekly" ? 1.05 : 1.1));

            const stats = [
                {
                    title: "Total Conversations",
                    value: formatCompactNumber(filteredConvo),
                    interval: filter === "daily" ? "Today" : filter === "weekly" ? "This week" : "This month",
                    trend:
                        filteredConvo > (filter === "daily" ? 1000 : filter === "weekly" ? 7000 : 30000)
                            ? "up"
                            : filteredConvo > (filter === "daily" ? 500 : filter === "weekly" ? 3500 : 15000)
                                ? "neutral"
                                : "down",
                    data: generateFilteredSparkline(filteredConvo / (filter === "daily" ? 24 : filter === "weekly" ? 7 : 30), 0.3, filter),
                    difference: formatCompactNumber(filteredConvo),
                    role: "teamLeader",
                },
                {
                    title: "Positive Rate",
                    value: `${filteredPos.toFixed(1)}%`,
                    interval: "Team average",
                    trend: filteredPos > 5 ? "up" : filteredPos > 3 ? "neutral" : "down",
                    data: generateFilteredSparkline(filteredPos, 0.1, filter),
                    difference: `${filteredPos.toFixed(1)}%`,
                    role: "teamLeader",
                },
                {
                    title: "First Response Time",
                    value: `${minutes}m`,
                    interval: "Avg per agent",
                    trend: avgFirstRespSec < 30 ? "down" : avgFirstRespSec < 60 ? "neutral" : "up",
                    data: generateFilteredSparkline(avgFirstRespSec / 60, 0.2, filter),
                    difference: `${minutes}m ${seconds}s`,
                    role: "teamLeader",
                },
            ];

            setDashboardData((prev) => ({
                ...prev,
                totalCases: filteredConvo,
                activeAgents: agents,
                avgResponseTime: Number(minutes),
                successRate: filteredEff,
                totalConversations: filteredConvo,
                positiveRate: filteredPos,
                firstResponseTime: Number(minutes),
                csrQuota: { met: Math.round(filteredEff), nonMet: Math.max(0, 100 - Math.round(filteredEff)) },
            }));

            const quotaData = generateQuotaManagementData(filteredConvo, filter, activeAgents);
            setQuotaManagementData(quotaData);
            setShiftChartData(generateShiftChartData(filteredConvo, filter));

            return { stats, agents: activeAgents };
        },
        []
    );


    const processDepositDataForTeamLeader = useCallback(
        (apiData, filter = "daily") => {
            if (!apiData || !Array.isArray(apiData)) return { stats: [], agents: [] };

            let totalTx = 0,
                totalSuccess = 0;
            const activeAgents = [];

            apiData.forEach((row) => {
                if (!Array.isArray(row) || row.length < 9) return;
                const type = row[0]?.toString().trim();
                const name = row[1]?.toString().trim();

                if (type === "Deposit" && name && name !== "Member" && !name.includes("Morning")) {
                    const tx = parseInt(row[8], 10) || 0;
                    const success = parseInt(row[3], 10) || 0;
                    if (tx > 0) {
                        totalTx += tx;
                        totalSuccess += success;
                        if (!activeAgents.includes(name)) activeAgents.push(name);
                    }
                }
            });

            const agentCount = activeAgents.length;
            const successRate = totalTx > 0 ? safeDivide(totalSuccess, totalTx) * 100 : 0;

            const baseDaily = totalTx > 0 ? totalTx / 30 : 5000;
            const filteredTx = calculateFilteredValues(baseDaily, filter);
            const filteredRate = Math.min(100, successRate * (filter === "weekly" ? 1.05 : filter === "monthly" ? 1.1 : 1));

            const stats = [
                {
                    title: "Total Transactions",
                    value: formatCompactNumber(filteredTx),
                    interval: filter === "daily" ? "Today" : filter === "weekly" ? "This week" : "This month",
                    trend: filteredTx > (filter === "daily" ? 5000 : filter === "weekly" ? 35000 : 150000) ? "up" : "neutral",
                    data: generateFilteredSparkline(filteredTx / (filter === "daily" ? 24 : filter === "weekly" ? 7 : 30), 0.3, filter),
                    difference: formatCompactNumber(filteredTx),
                    role: "teamLeader",
                },
                {
                    title: "Success Rate",
                    value: `${filteredRate.toFixed(1)}%`,
                    interval: "Transaction success rate",
                    trend: filteredRate > 80 ? "up" : "down",
                    data: generateFilteredSparkline(filteredRate, 0.1, filter),
                    difference: `${(filteredRate - 80).toFixed(1)}%`,
                    role: "teamLeader",
                },
                {
                    title: "Active Agents",
                    value: agentCount,
                    interval: "Processing transactions",
                    trend: "up",
                    data: generateFilteredSparkline(agentCount, 0.1, filter),
                    difference: `${agentCount}`,
                    role: "teamLeader",
                },
            ];

            setDashboardData((prev) => ({
                ...prev,
                totalTransactions: filteredTx,
                activeAgents: agentCount,
                successRate: filteredRate,
                depositQuota: { met: Math.round(filteredRate), nonMet: Math.max(0, 100 - Math.round(filteredRate)) },
            }));

            const quotaData = generateQuotaManagementData(filteredTx, filter, activeAgents);
            setQuotaManagementData(quotaData);
            setShiftChartData(generateShiftChartData(filteredTx, filter));

            return { stats, agents: activeAgents };
        },
        []
    );


    const processWithdrawalDataForTeamLeader = useCallback(
        (apiData, filter = "daily") => {
            if (!apiData || !Array.isArray(apiData)) return { stats: [], agents: [] };

            let totalWd = 0,
                totalComp = 0;
            const activeAgents = [];

            apiData.forEach((row) => {
                if (!Array.isArray(row) || row.length < 6) return;
                const type = row[0]?.toString().trim();
                const name = row[1]?.toString().trim();

                if (
                    (type === "Withdrawal" || type === "Withdraw") &&
                    name &&
                    name !== "Member" &&
                    !name.toLowerCase().includes("shift")
                ) {
                    const total = parseInt(row[5], 10) || parseInt(row[4], 10) || 0;
                    const comp = parseInt(row[2], 10) || 0;
                    if (total > 0) {
                        totalWd += total;
                        totalComp += comp;
                        if (!activeAgents.includes(name)) activeAgents.push(name);
                    }
                }
            });

            const agentCount = activeAgents.length;
            const successRate = totalWd > 0 ? safeDivide(totalComp, totalWd) * 100 : 0;

            const baseDaily = totalWd > 0 ? totalWd / 30 : 3000;
            const filteredWd = calculateFilteredValues(baseDaily, filter);
            const filteredRate = Math.min(100, successRate * (filter === "weekly" ? 1.05 : filter === "monthly" ? 1.1 : 1));

            const stats = [
                {
                    title: "Total Withdrawals",
                    value: formatCompactNumber(filteredWd),
                    interval: filter === "daily" ? "Today" : filter === "weekly" ? "This week" : "This month",
                    trend: filteredWd > (filter === "daily" ? 3000 : filter === "weekly" ? 21000 : 90000) ? "up" : "neutral",
                    data: generateFilteredSparkline(filteredWd / (filter === "daily" ? 24 : filter === "weekly" ? 7 : 30), 0.3, filter),
                    difference: formatCompactNumber(filteredWd),
                    role: "teamLeader",
                },
                {
                    title: "Success Rate",
                    value: `${filteredRate.toFixed(1)}%`,
                    interval: "Completion rate",
                    trend: filteredRate > 85 ? "up" : "down",
                    data: generateFilteredSparkline(filteredRate, 0.1, filter),
                    difference: `${(filteredRate - 80).toFixed(1)}%`,
                    role: "teamLeader",
                },
                {
                    title: "Active Agents",
                    value: agentCount,
                    interval: "Processing withdrawals",
                    trend: "up",
                    data: generateFilteredSparkline(agentCount, 0.1, filter),
                    difference: `${agentCount}`,
                    role: "teamLeader",
                },
            ];

            setDashboardData((prev) => ({
                ...prev,
                totalTransactions: filteredWd,
                activeAgents: agentCount,
                successRate: filteredRate,
                withdrawalQuota: { met: Math.round(filteredRate), nonMet: Math.max(0, 100 - Math.round(filteredRate)) },
            }));

            const quotaData = generateQuotaManagementData(filteredWd, filter, activeAgents);
            setQuotaManagementData(quotaData);
            setShiftChartData(generateShiftChartData(filteredWd, filter));

            return { stats, agents: activeAgents };
        },
        []
    );


    const processRealData = useCallback(
        (apiData, userDept, filter = "daily") => {
            if (!apiData || !userDept) return;

            let result = { stats: [], agents: [] };

            if (userDept === "CSR") {
                result = processCSRDataForTeamLeader(apiData, filter);
            } else if (userDept === "Deposit") {
                result = processDepositDataForTeamLeader(apiData, filter);
            } else if (userDept === "Withdrawal" || userDept === "Withdraw") {
                result = processWithdrawalDataForTeamLeader(apiData, filter);
            } else {
                const base = calculateFilteredValues(100, filter);
                result.stats = [
                    {
                        title: "Total Transactions",
                        value: formatCompactNumber(base),
                        interval: filter === "daily" ? "Today" : filter === "weekly" ? "This week" : "This month",
                        trend: "up",
                        data: generateFilteredSparkline(base / (filter === "daily" ? 24 : filter === "weekly" ? 7 : 30), 0.3, filter),
                        difference: formatCompactNumber(base),
                        role: "teamLeader",
                    },
                    {
                        title: "Success Rate",
                        value: "75%",
                        interval: "Team average",
                        trend: "neutral",
                        data: generateFilteredSparkline(75, 0.1, filter),
                        difference: "5%",
                        role: "teamLeader",
                    },
                    {
                        title: "Active Agents",
                        value: 8,
                        interval: "Currently working",
                        trend: "up",
                        data: generateFilteredSparkline(8, 0.1, filter),
                        difference: "8",
                        role: "teamLeader",
                    },
                ];
                setDashboardData((prev) => ({
                    ...prev,
                    withdrawalQuota: { met: 75, nonMet: 25 },
                }));
                setShiftChartData(generateShiftChartData(base, filter));
                setQuotaManagementData(generateQuotaManagementData(base, filter, []));
            }

            setTeamLeaderStats(result.stats);
            setFilteredStats(result.stats);
        },
        [
            processCSRDataForTeamLeader,
            processDepositDataForTeamLeader,
            processWithdrawalDataForTeamLeader,
        ]
    );


    useEffect(() => {
        if (data && data.length > 0 && department) {
            processRealData(data, department, timeFilter);
        }
    }, [timeFilter, data, department, processRealData]);


    return {
        dashboardData,
        teamLeaderStats: filteredStats,
        filteredStats,
        isInitialized,
        isRefreshing,
        combinedQuotaLoading,
        department,
        processRealData,
        setIsInitialized,
        setIsRefreshing,
        timeFilter,
        setTimeFilter,
        shiftChartData,
        quotaManagementData,
    };
};