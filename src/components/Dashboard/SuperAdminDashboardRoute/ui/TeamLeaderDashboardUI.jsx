import { Search } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import TeamLeaderStats from "./TeamLeaderStats";
import ExampleIosSwitch from './Switch';
import ShiftChart from './ShiftChart';
import QuotaManagement from './QuotaManagement';

export default function TeamLeaderDashboardUI({
    dashboardData,
    teamLeaderStats,
    isRefreshing,
    department,
    timeFilter,
    setTimeFilter,
    shiftChartData,
    quotaManagementData
}) {

    // Chart helpers - FIXED COLOR CODES
    const createChartData = (met, nonMet) => ({
        labels: ["Quota Met", "Quota Not Met"],
        datasets: [{
            data: [met, nonMet],
            backgroundColor: ["#3b82f6", "#ef4444"],
            borderColor: "#1f2937",
            borderWidth: 2,
            hoverOffset: 8,
        }],
    });

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "#e5e7eb",
                    font: { size: 12 },
                    padding: 15,
                    usePointStyle: true,
                }
            },
            title: {
                display: true,
                color: "#f8fafc",
                font: { size: 16, weight: "bold" },
                padding: { bottom: 10 }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        return `${label}: ${value}%`;
                    }
                }
            }
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

    const getFilterText = () => {
        switch (timeFilter) {
            case 'daily': return 'Today';
            case 'weekly': return 'This Week';
            case 'monthly': return 'This Month';
            default: return 'Today';
        }
    };

    const chartTitle = getChartTitle();
    const quotaData = getQuotaData();



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
                        {/* Time Filter Buttons */}
                        <div className="flex bg-black rounded-lg p-1 border border-gray-600">
                            {['daily', 'weekly', 'monthly'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setTimeFilter(filter)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${timeFilter === filter
                                        ? 'bg-gray-800 backdrop-blur-2xl text-white shadow-lg transform scale-105'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="text-sm text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-600">
                            {department} Team Leader • {getFilterText()}
                        </div>
                        {isRefreshing && (
                            <div className="text-sm text-green-400 bg-green-900/30 px-3 py-1 rounded-full border border-green-600">
                                🔄 Refreshing data...
                            </div>
                        )}
                        <ExampleIosSwitch />
                    </div>
                </div>

                <div className="p-2 bg-[#282e3c38] rounded-xl mb-4">
                    <TeamLeaderStats
                        title={`${department} Performance Trends - ${getFilterText()}`}
                        data={teamLeaderStats}
                        SecondaryTitle={`Real-time ${department} metrics • ${getFilterText()} • ${new Date().toLocaleTimeString()}`}
                    />
                </div>
            </div>

            <div className="flex gap-6 mt-2 overflow-y-auto px-2">
                <ShiftChart
                    timeFilter={timeFilter}
                    data={shiftChartData}
                    title={`Shift Performance - ${getFilterText()}`}
                />

                <div className="rounded-xl p-6 shadow-lg border border-gray-700 bg-gray-900/50">
                    <div className="h-72 w-72 items-center justify-center">
                        <Doughnut
                            data={createChartData(quotaData.met, quotaData.nonMet)}
                            options={{
                                ...chartOptions,
                                plugins: {
                                    ...chartOptions.plugins,
                                    title: {
                                        ...chartOptions.plugins.title,
                                        text: `${chartTitle} - ${getFilterText()}`
                                    },
                                },
                            }}
                        />
                    </div>
                    <div className="text-center mt-4 text-sm text-gray-400">
                        <div className="flex justify-center items-center gap-4">
                            <span className="flex items-center">
                                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                {quotaData.met}% Met
                            </span>
                            <span className="flex items-center">
                                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                {quotaData.nonMet}% Not Met
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <QuotaManagement
                timeFilter={timeFilter}
                data={quotaManagementData}
                title={`Quota Management - ${getFilterText()}`}
            />
        </div>
    );
}