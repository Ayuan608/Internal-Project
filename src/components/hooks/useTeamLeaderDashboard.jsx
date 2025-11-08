import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";

// Number formatting utility functions
const formatCompactNumber = (num, decimals = 1) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    if (absNum >= 1000000000) return sign + (absNum / 1000000000).toFixed(decimals) + 'B';
    if (absNum >= 1000000) return sign + (absNum / 1000000).toFixed(decimals) + 'M';
    if (absNum >= 1000) return sign + (absNum / 1000).toFixed(decimals) + 'K';
    return sign + absNum.toString();
};

const formatNumberSmart = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    const absNum = Math.abs(num);
    if (absNum >= 1000000) return formatCompactNumber(num, 1);
    if (absNum >= 10000) return formatCompactNumber(num, 0);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const useTeamLeaderDashboard = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [timeFilter, setTimeFilter] = useState('daily');

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
    const [quotaManagementData, setQuotaManagementData] = useState({});

    const { data, loading: combinedQuotaLoading } = useSelector(
        (state) => state.combinedQuota
    );

    const { department } = useSelector((state) => state.auth?.data || {});

    // Parse time string like "0:00:12" to seconds
    const parseTimeToSeconds = (timeStr) => {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        const parts = timeStr.split(':').map(p => parseInt(p) || 0);
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    };

    // Parse percentage like "4.51%" to float
    const parsePercentage = (str) => {
        if (!str || typeof str !== 'string') return 0;
        return parseFloat(str.replace('%', '').trim()) || 0;
    };

    // Calculate filtered values based on time filter
    const calculateFilteredValues = (baseValue, filter) => {
        const multipliers = {
            daily: 1,
            weekly: 7,
            monthly: 30
        };
        const multiplier = multipliers[filter] || 1;
        return Math.round(baseValue * multiplier);
    };

    // Generate filtered sparkline data
    const generateFilteredSparkline = (base, variation = 0.2, filter) => {
        const length = filter === 'daily' ? 24 : filter === 'weekly' ? 7 : 30;
        return Array.from({ length }, () =>
            Math.max(0, Math.round(base * (1 + (Math.random() * variation * 2 - variation))))
        );
    };

    // Generate shift chart data based on time filter
    const generateShiftChartData = (baseData, filter) => {
        const baseShifts = [
            { name: 'Morning Shift', value: baseData.morningShift || 150 },
            { name: 'Afternoon Shift', value: baseData.afternoonShift || 200 },
            { name: 'Night Shift', value: baseData.nightShift || 180 }
        ];

        const multipliers = {
            daily: 1,
            weekly: [0.8, 1.2, 0.9, 1.1, 1.3, 0.7, 1.0], // Different multiplier for each day
            monthly: 4.3 // Average weeks in month
        };

        if (filter === 'daily') {
            return baseShifts;
        } else if (filter === 'weekly') {
            return baseShifts.map(shift => ({
                ...shift,
                value: Math.round(shift.value * 7 * (0.9 + Math.random() * 0.2))
            }));
        } else { // monthly
            return baseShifts.map(shift => ({
                ...shift,
                value: Math.round(shift.value * 30 * (0.85 + Math.random() * 0.3))
            }));
        }
    };

    // Generate quota management data based on time filter
    const generateQuotaManagementData = (baseData, filter) => {
        const baseQuotas = [
            { agent: 'John Doe', quota: 100, achieved: 85, performance: 85 },
            { agent: 'Jane Smith', quota: 100, achieved: 92, performance: 92 },
            { agent: 'Mike Johnson', quota: 100, achieved: 78, performance: 78 },
            { agent: 'Sarah Wilson', quota: 100, achieved: 95, performance: 95 },
            { agent: 'Tom Brown', quota: 100, achieved: 88, performance: 88 }
        ];

        const multipliers = {
            daily: 1,
            weekly: 7,
            monthly: 30
        };

        const multiplier = multipliers[filter] || 1;

        return baseQuotas.map(agent => ({
            ...agent,
            quota: Math.round(agent.quota * multiplier),
            achieved: Math.round(agent.achieved * multiplier * (0.9 + Math.random() * 0.2)),
            performance: Math.min(100, Math.round((agent.achieved * multiplier * (0.9 + Math.random() * 0.2)) / (agent.quota * multiplier) * 100))
        }));
    };

    // Process CSR data with time filter
    const processCSRDataForTeamLeader = useCallback((apiData, filter = 'daily') => {
        if (!apiData || !Array.isArray(apiData)) {
            console.log("No CSR data to process");
            return [];
        }

        let totalCompletedConvo = 0;
        let totalEffective = 0;
        let totalMessages = 0;
        let totalMissedChats = 0;
        let totalFirstResponseSeconds = 0;
        let totalPositiveRate = 0;
        let totalAgents = 0;

        apiData.forEach((row, index) => {
            if (index < 3 || !Array.isArray(row) || row.length < 9) return;

            const rowType = row[0]?.toString().trim();
            const agentName = row[1]?.toString().trim();

            if (
                rowType === 'CSR' &&
                agentName &&
                !agentName.toLowerCase().includes('shift') &&
                !agentName.toLowerCase().includes('trainee') &&
                !agentName.includes('HIGHLIGHTS') &&
                agentName !== 'Member'
            ) {
                const completedConvo = parseInt(row[2]) || 0;
                const effective = parseInt(row[3]) || 0;
                const messages = parseInt(row[4]) || 0;
                const missedChats = parseInt(row[5]) || 0;
                const firstResponseTimeStr = row[7]?.toString() || "0:00:00";
                const positiveRateStr = row[8]?.toString() || "0%";

                if (completedConvo > 0) {
                    totalCompletedConvo += completedConvo;
                    totalEffective += effective;
                    totalMessages += messages;
                    totalMissedChats += missedChats;
                    totalFirstResponseSeconds += parseTimeToSeconds(firstResponseTimeStr);
                    totalPositiveRate += parsePercentage(positiveRateStr);
                    totalAgents++;
                }
            }
        });

        if (totalAgents === 0) {
            console.log("No valid CSR agents found");
            return [];
        }

        const avgFirstResponseSeconds = totalFirstResponseSeconds / totalAgents;
        const avgPositiveRate = totalPositiveRate / totalAgents;
        const efficiencyRate = totalCompletedConvo > 0 ? (totalEffective / totalCompletedConvo) * 100 : 0;

        const avgResponseMinutes = (avgFirstResponseSeconds / 60).toFixed(1);
        const avgResponseSeconds = Math.round(avgFirstResponseSeconds % 60);

        // Apply time filter to values
        const baseDailyConvo = totalCompletedConvo > 0 ? totalCompletedConvo / 30 : 100;
        const filteredCompletedConvo = calculateFilteredValues(baseDailyConvo, filter);

        const filteredPositiveRate = filter === 'daily' ? avgPositiveRate :
            filter === 'weekly' ? Math.min(100, avgPositiveRate * 1.1) :
                Math.min(100, avgPositiveRate * 1.2);

        const filteredEfficiencyRate = filter === 'daily' ? efficiencyRate :
            filter === 'weekly' ? Math.min(100, efficiencyRate * 1.05) :
                Math.min(100, efficiencyRate * 1.1);

        const stats = [
            {
                title: "Total Conversations",
                value: formatCompactNumber(filteredCompletedConvo),
                interval: filter === 'daily' ? "Today" : filter === 'weekly' ? "This week" : "This month",
                trend: filteredCompletedConvo > (filter === 'daily' ? 1000 : filter === 'weekly' ? 7000 : 30000) ? "up" :
                    filteredCompletedConvo > (filter === 'daily' ? 500 : filter === 'weekly' ? 3500 : 15000) ? "neutral" : "down",
                data: generateFilteredSparkline(filteredCompletedConvo / (filter === 'daily' ? 24 : filter === 'weekly' ? 7 : 30), 0.3, filter),
                difference: formatCompactNumber(filteredCompletedConvo),
                role: "teamLeader"
            },
            {
                title: "Positive Rate",
                value: `${filteredPositiveRate.toFixed(1)}%`,
                interval: "Team average",
                trend: filteredPositiveRate > 5 ? "up" : filteredPositiveRate > 3 ? "neutral" : "down",
                data: generateFilteredSparkline(filteredPositiveRate, 0.1, filter),
                difference: `${(filteredPositiveRate - 4).toFixed(1)}%`,
                role: "teamLeader"
            },
            {
                title: "First Response Time",
                value: `${avgResponseMinutes}m ${avgResponseSeconds}s`,
                interval: "Avg per agent",
                trend: avgFirstResponseSeconds < 30 ? "down" : avgFirstResponseSeconds < 60 ? "neutral" : "up",
                data: generateFilteredSparkline(avgFirstResponseSeconds / 60, 0.2, filter),
                difference: `${avgResponseMinutes}m`,
                role: "teamLeader"
            }
        ];

        // Update all dashboard data
        setDashboardData(prev => ({
            ...prev,
            totalCases: filteredCompletedConvo,
            activeAgents: totalAgents,
            avgResponseTime: avgResponseMinutes,
            successRate: filteredEfficiencyRate,
            totalConversations: filteredCompletedConvo,
            positiveRate: filteredPositiveRate,
            firstResponseTime: avgResponseMinutes,
            csrQuota: {
                met: Math.round(filteredEfficiencyRate),
                nonMet: 100 - Math.round(filteredEfficiencyRate)
            }
        }));

        // Generate shift chart data
        const newShiftChartData = generateShiftChartData({
            morningShift: filteredCompletedConvo * 0.3,
            afternoonShift: filteredCompletedConvo * 0.4,
            nightShift: filteredCompletedConvo * 0.3
        }, filter);

        setShiftChartData(newShiftChartData);

        // Generate quota management data
        const newQuotaManagementData = generateQuotaManagementData({}, filter);
        setQuotaManagementData(newQuotaManagementData);

        return stats;
    }, []);

    // Process Deposit data with time filter
    const processDepositDataForTeamLeader = useCallback((apiData, filter = 'daily') => {
        if (!apiData || !Array.isArray(apiData)) return [];

        let totalTransactions = 0;
        let totalFeedback = 0;
        let totalSpreadsheet1st = 0;
        let totalSpreadsheet2nd = 0;
        let totalPaycheck = 0;
        let activeAgents = new Set();

        apiData.forEach((row, index) => {
            if (index < 56 || !Array.isArray(row) || row.length < 9) return;
            const rowType = row[0]?.toString().trim();
            const agentName = row[1]?.toString().trim();

            if (rowType === 'Deposit' && agentName && agentName !== 'Member' && !agentName.includes('Morning')) {
                const total = parseInt(row[8]) || 0;
                if (total > 0) {
                    totalTransactions += total;
                    totalFeedback += parseInt(row[2]) || 0;
                    totalSpreadsheet1st += parseInt(row[3]) || 0;
                    totalSpreadsheet2nd += parseInt(row[4]) || 0;
                    totalPaycheck += parseInt(row[5]) || 0;
                    activeAgents.add(agentName);
                }
            }
        });

        const totalAgents = activeAgents.size;
        const successRate = totalTransactions > 0 ? Math.round((totalSpreadsheet1st / totalTransactions) * 100) : 0;

        // Apply time filter to values
        const baseDailyTransactions = totalTransactions > 0 ? totalTransactions / 30 : 5000;
        const filteredTransactions = calculateFilteredValues(baseDailyTransactions, filter);

        const filteredSuccessRate = filter === 'daily' ? successRate :
            filter === 'weekly' ? Math.min(100, successRate * 1.05) :
                Math.min(100, successRate * 1.1);

        const stats = [
            {
                title: "Total Transactions",
                value: `$${formatCompactNumber(filteredTransactions, 1)}`,
                interval: filter === 'daily' ? "Today" : filter === 'weekly' ? "This week" : "This month",
                trend: filteredTransactions > (filter === 'daily' ? 5000 : filter === 'weekly' ? 35000 : 150000) ? "up" : "neutral",
                data: generateFilteredSparkline(filteredTransactions / (filter === 'daily' ? 24 : filter === 'weekly' ? 7 : 30), 0.3, filter),
                difference: formatCompactNumber(filteredTransactions),
                role: "teamLeader"
            },
            {
                title: "Success Rate",
                value: `${filteredSuccessRate.toFixed(1)}%`,
                interval: "Transaction success rate",
                trend: filteredSuccessRate > 80 ? "up" : "down",
                data: generateFilteredSparkline(filteredSuccessRate, 0.1, filter),
                difference: `${(filteredSuccessRate - 80).toFixed(1)}%`,
                role: "teamLeader"
            },
            {
                title: "Active Agents",
                value: formatNumberSmart(totalAgents),
                interval: "Processing transactions",
                trend: "up",
                data: generateFilteredSparkline(totalAgents, 0.1, filter),
                difference: `${totalAgents}`,
                role: "teamLeader"
            }
        ];

        setDashboardData(prev => ({
            ...prev,
            totalTransactions: filteredTransactions,
            activeAgents: totalAgents,
            successRate: filteredSuccessRate,
            depositQuota: {
                met: Math.round(filteredSuccessRate),
                nonMet: 100 - Math.round(filteredSuccessRate)
            }
        }));

        // Generate shift chart data for Deposit department
        const newShiftChartData = generateShiftChartData({
            morningShift: filteredTransactions * 0.35,
            afternoonShift: filteredTransactions * 0.45,
            nightShift: filteredTransactions * 0.2
        }, filter);

        setShiftChartData(newShiftChartData);

        // Generate quota management data
        const newQuotaManagementData = generateQuotaManagementData({}, filter);
        setQuotaManagementData(newQuotaManagementData);

        return stats;
    }, []);

    // Main data processor with time filter
    const processRealData = useCallback((apiData, userDept, filter = 'daily') => {
        if (!apiData || !Array.isArray(apiData)) return;

        let stats = [];
        if (userDept === 'CSR') {
            stats = processCSRDataForTeamLeader(apiData, filter);
        } else if (userDept === 'Deposit') {
            stats = processDepositDataForTeamLeader(apiData, filter);
        } else {
            // Default data for other departments
            const baseData = {
                totalCases: calculateFilteredValues(100, filter),
                activeAgents: 8,
                successRate: 75
            };

            const defaultStats = [
                {
                    title: "Total Cases",
                    value: formatCompactNumber(baseData.totalCases),
                    interval: filter === 'daily' ? "Today" : filter === 'weekly' ? "This week" : "This month",
                    trend: "up",
                    data: generateFilteredSparkline(baseData.totalCases / (filter === 'daily' ? 24 : filter === 'weekly' ? 7 : 30), 0.3, filter),
                    difference: formatCompactNumber(baseData.totalCases),
                    role: "teamLeader"
                },
                {
                    title: "Success Rate",
                    value: `${baseData.successRate}%`,
                    interval: "Team average",
                    trend: "neutral",
                    data: generateFilteredSparkline(baseData.successRate, 0.1, filter),
                    difference: `${baseData.successRate - 70}%`,
                    role: "teamLeader"
                },
                {
                    title: "Active Agents",
                    value: formatNumberSmart(baseData.activeAgents),
                    interval: "Currently working",
                    trend: "up",
                    data: generateFilteredSparkline(baseData.activeAgents, 0.1, filter),
                    difference: `${baseData.activeAgents}`,
                    role: "teamLeader"
                }
            ];
            stats = defaultStats;
        }

        setTeamLeaderStats(stats);
        setFilteredStats(stats);
    }, [processCSRDataForTeamLeader, processDepositDataForTeamLeader]);

    // Update filtered stats when time filter changes
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
        quotaManagementData
    };
};