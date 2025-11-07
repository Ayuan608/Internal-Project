import { Search } from "lucide-react";
import TeamLeaderStats from "../SuperAdminDashboardRoute/ui/TeamLeaderStats";
import ExampleIosSwitch from "../SuperAdminDashboardRoute/ui/Switch";
import ShiftChart from "../SuperAdminDashboardRoute/ui/ShiftChart";
import { Doughnut } from "react-chartjs-2";
import { useCallback, useEffect, useState } from "react";
import QuotaManagement from "../SuperAdminDashboardRoute/ui/QuotaManagement";
import { fetchCombinedDepartmentsData } from "../../../redux/combinedQuotaSlice";
import { useDispatch, useSelector } from "react-redux";

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

export default function TeamLeaderDashboard() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const dispatch = useDispatch();
  const { data, loading: combinedQuotaLoading } = useSelector(
    (state) => state.combinedQuota
  );

  const { department } = useSelector((state) => state.auth?.data || {});
  console.log("User Department:", department);

  // FIXED: Parse time string like "0:00:12" to seconds
  const parseTimeToSeconds = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  };

  // FIXED: Parse percentage like "4.51%" to float
  const parsePercentage = (str) => {
    if (!str || typeof str !== 'string') return 0;
    return parseFloat(str.replace('%', '').trim()) || 0;
  };

  // FIXED: Process CSR data - Use row[7] = First Response, row[8] = Positive Rate
  const processCSRDataForTeamLeader = useCallback((apiData) => {
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
      // Skip header rows (0-2) and invalid rows
      if (index < 3 || !Array.isArray(row) || row.length < 9) return;

      const rowType = row[0]?.toString().trim();
      const agentName = row[1]?.toString().trim();

      // Only process valid CSR agent rows
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

    // Format first response time
    const avgResponseMinutes = (avgFirstResponseSeconds / 60).toFixed(1);
    const avgResponseSeconds = Math.round(avgFirstResponseSeconds % 60);

    console.log("CSR Averages:", {
      totalAgents,
      avgFirstResponseSeconds,
      avgPositiveRate: avgPositiveRate.toFixed(2),
      efficiencyRate: efficiencyRate.toFixed(1)
    });

    // Generate realistic sparkline
    const generateSparkline = (base, variation = 0.2) =>
      Array.from({ length: 30 }, () => Math.round(base * (1 + (Math.random() * variation * 2 - variation))));

    const stats = [
      {
        title: "Total Conversations",
        value: formatCompactNumber(totalCompletedConvo),
        interval: "This month",
        trend: totalCompletedConvo > 10000 ? "up" : totalCompletedConvo > 5000 ? "neutral" : "down",
        data: generateSparkline(totalCompletedConvo / 30, 0.3),
        difference: formatCompactNumber(totalCompletedConvo),
        role: "teamLeader"
      },
      {
        title: "Positive Rate",
        value: `${avgPositiveRate.toFixed(1)}%`,
        interval: "Team average",
        trend: avgPositiveRate > 5 ? "up" : avgPositiveRate > 3 ? "neutral" : "down",
        data: generateSparkline(avgPositiveRate, 0.1),
        difference: `${(avgPositiveRate - 4).toFixed(1)}%`,
        role: "teamLeader"
      },
      {
        title: "First Response Time",
        value: `${avgResponseMinutes}m ${avgResponseSeconds}s`,
        interval: "Avg per agent",
        trend: avgFirstResponseSeconds < 30 ? "down" : avgFirstResponseSeconds < 60 ? "neutral" : "up",
        data: generateSparkline(avgFirstResponseSeconds / 60, 0.2),
        difference: `${avgResponseMinutes}m`,
        role: "teamLeader"
      }
    ];

    // Update dashboard
    setDashboardData(prev => ({
      ...prev,
      totalCases: totalCompletedConvo,
      activeAgents: totalAgents,
      avgResponseTime: avgResponseMinutes,
      successRate: efficiencyRate,
      totalConversations: totalCompletedConvo,
      positiveRate: avgPositiveRate,
      firstResponseTime: avgResponseMinutes,
      csrQuota: {
        met: efficiencyRate > 85 ? 85 : Math.round(efficiencyRate),
        nonMet: efficiencyRate > 85 ? 15 : 100 - Math.round(efficiencyRate)
      }
    }));

    return stats;
  }, []);

  // Process Deposit data (unchanged)
  const processDepositDataForTeamLeader = useCallback((apiData) => {
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

    const generateSparkline = (base, variation = 0.2) =>
      Array.from({ length: 30 }, () => Math.round(base * (1 + (Math.random() * variation * 2 - variation))));

    const stats = [
      {
        title: "Total Transactions",
        value: `$${formatCompactNumber(totalTransactions, 1)}`,
        interval: "This month",
        trend: totalTransactions > 0 ? "up" : "neutral",
        data: generateSparkline(totalTransactions / 30, 0.3),
        difference: formatCompactNumber(totalTransactions),
        role: "teamLeader"
      },
      {
        title: "Success Rate",
        value: `${successRate}%`,
        interval: "Transaction success rate",
        trend: successRate > 80 ? "up" : "down",
        data: generateSparkline(successRate, 0.1),
        difference: `${successRate - 80}%`,
        role: "teamLeader"
      },
      {
        title: "Active Agents",
        value: formatNumberSmart(totalAgents),
        interval: "Processing transactions",
        trend: "up",
        data: generateSparkline(totalAgents, 0.1),
        difference: `${totalAgents}`,
        role: "teamLeader"
      }
    ];

    setDashboardData(prev => ({
      ...prev,
      totalTransactions,
      activeAgents: totalAgents,
      successRate,
      depositQuota: {
        met: successRate > 80 ? 80 : successRate,
        nonMet: successRate > 80 ? 20 : 100 - successRate
      }
    }));

    return stats;
  }, []);

  // Main data processor
  const processRealData = useCallback((apiData, userDept) => {
    if (!apiData || !Array.isArray(apiData)) return;

    let stats = [];
    if (userDept === 'CSR') {
      stats = processCSRDataForTeamLeader(apiData);
    } else if (userDept === 'Deposit') {
      stats = processDepositDataForTeamLeader(apiData);
    }

    setTeamLeaderStats(stats);
  }, [processCSRDataForTeamLeader, processDepositDataForTeamLeader]);

  // Initialize
  const initializeData = useCallback(async () => {
    if (!isInitialized && !combinedQuotaLoading && department) {
      setIsRefreshing(true);
      try {
        await dispatch(fetchCombinedDepartmentsData());
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [dispatch, isInitialized, combinedQuotaLoading, department]);

  // Process when data changes
  useEffect(() => {
    if (data && data.length > 0 && department) {
      processRealData(data, department);
    }
  }, [data, department, processRealData]);

  // Initialize on mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInitialized && department) {
        dispatch(fetchCombinedDepartmentsData());
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [dispatch, isInitialized, department]);

  // Chart helpers
  const createChartData = (met, nonMet) => ({
    labels: ["Quota Met", "Quota Not Met"],
    datasets: [{
      data: [met, nonMet],
      backgroundColor: ["#3b82f6", "#f53)h3a"],
      borderColor: "#1f2937",
      borderWidth: 2,
      hoverOffset: 8,
    }],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: "#e5e7eb", font: { size: 12 }, padding: 15 } },
      title: { display: true, color: "#f8fafc", font: { size: 16, weight: "bold" }, padding: { bottom: 10 } },
    },
    cutout: "60%",
  };

  const getChartTitle = () => {
    switch (department) {
      case 'CSR': return "CSR Quota Performance";
      case 'Deposit': return "Deposit Quota Performance";
      case 'Withdrawal': case 'Withdraw': return "Withdrawal Quota Performance";
      default: return "Quota Performance";
    }
  };

  const getQuotaData = () => {
    switch (department) {
      case 'CSR': return dashboardData.csrQuota;
      case 'Deposit': return dashboardData.depositQuota;
      case 'Withdrawal': case 'Withdraw': return dashboardData.withdrawalQuota;
      default: return dashboardData.csrQuota;
    }
  };

  const chartTitle = getChartTitle();
  const quotaData = getQuotaData();

  if (combinedQuotaLoading && !isInitialized) {
    return (
      <div className="min-h-screen text-gray-100 bg-black flex items-center justify-center">
        <div className="text-xl">Loading dashboard data...</div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="min-h-screen text-gray-100 bg-black flex items-center justify-center">
        <div className="text-xl">Department information not available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 bg-black">
      <div className="top-0 rounded-lg p-2 z-auto backdrop-blur-3xl" style={{ zIndex: 9 }}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex justify-start w-[25%]">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search contacts, deals, campaigns..."
                className="bg-[#f5f6fa13] text-white rounded-full pl-9 pr-3 py-2 w-full text-sm focus:outline-none placeholder:text-white"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full">
              {department} Team Leader
            </div>
            {isRefreshing && <div className="text-sm text-green-400">Refreshing data...</div>}
            <ExampleIosSwitch />
          </div>
        </div>

        <div className="p-2 bg-[#282e3c38] rounded-xl mb-4">
          <TeamLeaderStats
            title={`${department} Performance Trends`}
            data={teamLeaderStats}
            SecondaryTitle={`Real-time ${department} metrics • ${new Date().toLocaleTimeString()}`}
          />
        </div>
      </div>

      <div className="flex gap-6 mt-2 overflow-y-auto px-2">
        <ShiftChart />

        <div className="rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="h-72 w-72 items-center justify-center">
            <Doughnut
              data={createChartData(quotaData.met, quotaData.nonMet)}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { ...chartOptions.plugins.title, text: chartTitle },
                },
              }}
            />
          </div>
          <div className="text-center mt-4 text-sm text-gray-400">
            {quotaData.met}% Met • {quotaData.nonMet}% Not Met
          </div>
        </div>
      </div>

      <QuotaManagement />
    </div>
  );
}