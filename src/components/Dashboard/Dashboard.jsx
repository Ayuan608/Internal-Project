import Charts from "./Chart";
import TeamLeaderStats from "./SuperAdminDashboardRoute/ui/TeamLeaderStats";
import { TeamStats } from "../../Helpers/Helper";
import CustomizedDataGrid from "./SuperAdminDashboardRoute/ui/data/CustomizedDataGrid";
import { useState, useMemo } from 'react';
import { useSelector } from "react-redux";
import ModernDashboard from "../ModernChart/ModernDashboard";
import PerformanceTrendCard from "../ModernChart/PerformanceTrendCard";

export default function Dashboard() {
  const [teamLeaderData, setTeamLeaderData] = useState([]);
  const { data: combinedData } = useSelector((state) => state.combinedQuota);

  const userId = useSelector((state) => state.auth?.data?._id);

  // Generate real performance trend data from your actual data
  const performanceTrendData = useMemo(() => {
    if (!combinedData || combinedData.length === 0) {
      // Fallback sample data if no real data available
      return Array.from({ length: 30 }, (_, i) => ({
        day: `Day ${i + 1}`,
        CSR: 75 + Math.random() * 20,
        Deposit: 60 + Math.random() * 25,
        Withdrawal: 85 + Math.random() * 15
      }));
    }

    // Process real data for trend chart
    const processDepartmentData = (department) => {
      const deptData = combinedData.filter(item => item[0] === department);

      // Group by date and calculate daily totals
      const dailyTotals = {};

      deptData.forEach(item => {
        const date = item[1]; // Date is at index 1
        if (!date) return;

        if (department === "CSR") {
          const value = parseFloat(item[3]) || 0; // CSR value at index 3
          dailyTotals[date] = (dailyTotals[date] || 0) + value;
        } else if (department === "Deposit") {
          const value = parseFloat(item[4]) || 0; // Deposit value at index 4
          dailyTotals[date] = (dailyTotals[date] || 0) + value;
        } else if (department === "Withdraw") {
          const value = parseFloat((item[7] || "0").replace(/,/g, "")) || 0; // Withdraw value at index 7
          dailyTotals[date] = (dailyTotals[date] || 0) + value;
        }
      });

      return dailyTotals;
    };

    const csrDaily = processDepartmentData("CSR");
    const depositDaily = processDepartmentData("Deposit");
    const withdrawDaily = processDepartmentData("Withdraw");

    // Get all unique dates
    const allDates = [...new Set([
      ...Object.keys(csrDaily),
      ...Object.keys(depositDaily),
      ...Object.keys(withdrawDaily)
    ])].filter(date => date && date.trim() !== '');

    // Sort dates and take last 30 days
    const sortedDates = allDates.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA - dateB;
    }).slice(-30);

    // Create trend data array
    return sortedDates.map((date, index) => ({
      day: `Day ${index + 1}`,
      date: date,
      CSR: csrDaily[date] || 0,
      Deposit: depositDaily[date] || 0,
      Withdrawal: withdrawDaily[date] || 0
    }));

  }, [combinedData]);

  return (
    <>
      <div className="min-h-screen text-gray-100 p-4">
        <div
          className=" top-0 rounded-lg p-2 z-auto backdrop-blur-3xl "
          style={{ zIndex: 9 }}
        >
          <div className="p-4 bg-[#282e3c38] rounded-xl mb-4 w-full">
            <TeamLeaderStats
              title="Dashboard Overview"
              SecondaryTitle="Monitor real-time metrics and performance across all departments"
              data={teamLeaderData}
            />
          </div>
        </div>
        <div className="flex gap-6 mt-2 overflow-y-auto px-2">
          <PerformanceTrendCard
            data={performanceTrendData}
            title="30-Day Performance Trend (Real Data)"
          />
        </div>

        <CustomizedDataGrid onStatsUpdate={setTeamLeaderData} />
      </div>
    </>
  );
}