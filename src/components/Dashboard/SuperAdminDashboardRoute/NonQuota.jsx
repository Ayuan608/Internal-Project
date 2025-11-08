import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import NonQuotaMembersTable from "./ui/NonQuotaMembersTable";

const NonQuota = ({ department = "CSR" }) => {
  const [nonQuotaStats, setNonQuotaStats] = useState({
    totalNonQuota: 0,
    totalAgents: 0
  });

  const { data: reduxData } = useSelector((state) => state.combinedQuota);

  // Calculate non-quota statistics
  useEffect(() => {
    if (reduxData && reduxData.length > 0) {
      let currentDepartment = "";
      let currentMonth = "";
      let totalAgents = 0;
      let nonQuotaCount = 0;

      reduxData.forEach((row) => {
        // Detect department
        if (row[0] && typeof row[0] === 'string') {
          const firstItem = row[0].toLowerCase();
          if (firstItem.includes('csr')) currentDepartment = "CSR";
          else if (firstItem.includes('deposit')) currentDepartment = "Deposit";
          else if (firstItem.includes('withdraw')) currentDepartment = "Withdrawal";
        }

        // Detect month
        if (row[2] && typeof row[2] === 'string') {
          const monthName = row[2].toLowerCase();
          if (monthName.includes('october')) currentMonth = "October";
        }

        // Process data for current department
        if (currentMonth === "October" && currentDepartment === department && row.length > 5) {
          const isHeaderRow =
            row[1] === 'Member' ||
            row[1] === '' ||
            row[0]?.toLowerCase().includes('shift') ||
            row[0]?.toLowerCase().includes('trainee') ||
            row[1]?.toLowerCase().includes('shift') ||
            row[1]?.toLowerCase().includes('trainee') ||
            !row[1] ||
            row[1] === 'HIGHLIGHTS' ||
            row[1] === 'TOTAL';

          if (!isHeaderRow && row[1] && row[1] !== '') {
            totalAgents += 1;

            // Extract performance data
            let output = 0;
            let quota = 0;

            if (department === "CSR") {
              output = parseInt(row[2]) || 0;
              quota = 100;
            } else if (department === "Deposit") {
              output = parseInt(row[8]) || 0;
              quota = 530;
            } else if (department === "Withdrawal") {
              output = parseInt(row[8]) || 0;
              quota = 1500;
            }

            const quotaPercentage = quota > 0 ? (output / quota) * 100 : 0;

            if (quotaPercentage < 70 && output > 0) {
              nonQuotaCount += 1;
            }
          }
        }
      });

      setNonQuotaStats({
        totalNonQuota: nonQuotaCount,
        totalAgents: totalAgents
      });
    }
  }, [reduxData, department]);

  return (
    <div className="h-full rounded-2xl p-4">
      <div className="flex justify-between items-start mb-6">
        <div className="px-3">
          <div className="text-white text-xl font-bold mb-2">
            Non-Quota Dashboard - {department} Department
          </div>
          <div className="text-white/70 mb-2">
            Track members who haven't met their quota targets
          </div>
          <div className="flex gap-4 mt-3">
            <div className="bg-red-900/30 px-3 py-1 rounded-lg border border-red-700/50">
              <span className="text-red-300 text-sm">
                {nonQuotaStats.totalNonQuota} Non-Quota Agents
              </span>
            </div>
            <div className="bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-700/50">
              <span className="text-blue-300 text-sm">
                {nonQuotaStats.totalAgents} Total Agents
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table for Active Department */}
      <NonQuotaMembersTable department={department} />
    </div>
  );
};

export default NonQuota;