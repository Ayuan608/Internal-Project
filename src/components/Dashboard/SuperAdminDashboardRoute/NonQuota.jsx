import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import NonQuotaMembersTable from "./ui/NonQuotaMembersTable";

const NonQuota = ({ department = "CSR" }) => {
  const [nonQuotaStats, setNonQuotaStats] = useState({
    totalNonQuota: 0,
    totalAgents: 0
  });

  const [nonQuotaMembers, setNonQuotaMembers] = useState([]);

  const { data: reduxData } = useSelector((state) => state.combinedQuota);

  // Calculate non-quota statistics - UPDATED FOR REAL DATA
  useEffect(() => {
    if (reduxData && reduxData.length > 0) {
      let totalAgents = 0;
      let nonQuotaCount = 0;
      const nonQuotaMembersList = [];

      reduxData.forEach((row) => {
        if (!Array.isArray(row) || row.length < 3) return;

        const dept = row[0]?.toString()?.trim();
        const memberName = row[2]?.toString()?.trim();

        // Skip if not current department or invalid data
        if (dept !== department || !memberName ||
          memberName.toLowerCase().includes('member') ||
          memberName.toLowerCase().includes('total') ||
          memberName.toLowerCase().includes('shift') ||
          memberName === '') {
          return;
        }

        totalAgents += 1;

        let output = 0;
        let quota = 0;

        if (department === "CSR") {
          output = parseFloat(row[3]) || 0;
          quota = 530;
        } else if (department === "Deposit") {
          output = parseFloat(row[9]?.toString()?.replace(/,/g, '')) || 0;
          quota = 530;
        } else if (department === "Withdrawal") {
          output = parseFloat(row[7]?.toString()?.replace(/,/g, '')) || 0;
          quota = 1500;
        }

        const quotaPercentage = quota > 0 ? (output / quota) * 100 : 0;

        if (quotaPercentage < 70 && output > 0) {
          nonQuotaCount += 1;

          // Add to non-quota members list
          nonQuotaMembersList.push({
            name: memberName,
            department: department,
            output: output,
            target: quota,
            quotaPercentage: Math.round(quotaPercentage),
            variance: output - quota
          });
        }
      });

      // Log non-quota members to console
      console.log(`=== NON-QUOTA MEMBERS - ${department} DEPARTMENT ===`);
      console.log(`Total Non-Quota Agents: ${nonQuotaCount}`);
      console.log(`Total Agents: ${totalAgents}`);

      if (nonQuotaMembersList.length > 0) {
        console.table(nonQuotaMembersList);
        nonQuotaMembersList.forEach((member, index) => {
          console.log(`${index + 1}. ${member.name}: ${member.output}/${member.target} (${member.quotaPercentage}%)`);
        });
      } else {
        console.log("No non-quota members found.");
      }
      console.log("==========================================");

      setNonQuotaStats({
        totalNonQuota: nonQuotaCount,
        totalAgents: totalAgents
      });

      setNonQuotaMembers(nonQuotaMembersList);
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

      {/* Display non-quota members in UI */}
      {nonQuotaMembers.length > 0 && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
          <h3 className="text-white font-semibold mb-3">
            Non-Quota Members ({nonQuotaMembers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {nonQuotaMembers.map((member, index) => (
              <div key={index} className="bg-red-800/20 p-3 rounded border border-red-700/20">
                <div className="text-white font-medium">{member.name}</div>
                <div className="text-red-300 text-sm">
                  Output: {member.output} | Target: {member.target}
                </div>
                <div className="text-red-400 text-sm font-semibold">
                  Completion: {member.quotaPercentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table for Active Department */}
      <NonQuotaMembersTable department={department} />
    </div>
  );
};

export default NonQuota;