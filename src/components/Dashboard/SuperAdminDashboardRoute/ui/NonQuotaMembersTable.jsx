import React, { useState, useEffect } from "react";
import { Download, Filter, X, Mail, Plus } from "lucide-react";
import { useSelector } from "react-redux";

const NonQuotaMembersTable = ({ department = "CSR" }) => {

  const { role } = useSelector((state) => state.auth);
  const { data: reduxData } = useSelector((state) => state.combinedQuota);

  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    to: "",
    cc: "",
    message: "Dear [Employee],\n\nI wanted to reach out regarding your performance metrics for today. I noticed that your output was below the target quota.",
    priority: "Medium"
  });

  // Function to get non-quota agents from Redux data - UPDATED FOR REAL DATA
  const getNonQuotaAgents = () => {
    if (!reduxData || reduxData.length === 0) return [];

    const nonQuotaAgents = [];

    reduxData.forEach((row, index) => {
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

      // Extract performance data based on department
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

      // Only include agents with output > 0 and quota < 70%
      if (quotaPercentage < 70 && output > 0) {
        nonQuotaAgents.push({
          date: new Date().toLocaleDateString(),
          name: memberName,
          department: department,
          output: output,
          target: quota,
          variance: output - quota,
          quotaPercentage: Math.round(quotaPercentage),
          email: `${memberName.toLowerCase().replace(/\s+/g, ".")}@company.com`,
          originalData: row,
          index,
        });
      }
    });

    // Log detailed non-quota information to console
    console.log(`📊 Non-Quota Table Data for ${department}:`);
    console.log(`Found ${nonQuotaAgents.length} non-quota agents`);

    nonQuotaAgents.forEach((agent, idx) => {
      console.log(
        `🔴 ${idx + 1}. ${agent.name} | Output: ${agent.output} | Target: ${agent.target} | Completion: ${agent.quotaPercentage}% | Variance: ${agent.variance}`
      );
    });

    return nonQuotaAgents;
  };

  // Update filtered data when department or reduxData changes
  useEffect(() => {
    if (reduxData && reduxData.length > 0) {
      const nonQuotaAgents = getNonQuotaAgents();
      setFilteredData(nonQuotaAgents);

      // Additional console log for debugging
      if (nonQuotaAgents.length > 0) {
        console.log("🎯 Non-Quota Agents Summary:");
        nonQuotaAgents.forEach(agent => {
          const status = agent.quotaPercentage < 50 ? "CRITICAL" : "WARNING";
          console.log(
            `   ${status}: ${agent.name} - ${agent.quotaPercentage}% of quota (${agent.output}/${agent.target})`
          );
        });
      }
    } else {
      setFilteredData([]);
      console.log("No Redux data available for non-quota calculation");
    }
  }, [reduxData, department]);

  const handleCreateCase = (employee) => {
    console.log(`📧 Creating case for: ${employee.name}`);
    console.log(`   Email: ${employee.email}`);
    console.log(`   Performance: ${employee.output}/${employee.target} (${employee.quotaPercentage}%)`);

    setSelectedEmployee(employee);
    setFormData({
      to: employee.email,
      cc: "manager@company.com",
      message: `Dear ${employee.name},\n\nI wanted to reach out regarding your performance metrics for today. I noticed that your output was below the target quota.\n\nYour Output: ${employee.output}\nTarget: ${employee.target}\nCompletion: ${employee.quotaPercentage}%`,
      priority: "Medium"
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("❌ Case creation modal closed");
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSendEmail = () => {
    console.log(`✉️ Email sent to: ${selectedEmployee.name}`);
    console.log(`   To: ${formData.to}`);
    console.log(`   CC: ${formData.cc}`);
    console.log(`   Priority: ${formData.priority}`);

    alert(`Email sent to ${selectedEmployee.name}!`);
    handleCloseModal();
  };

  const handleSaveDraft = () => {
    console.log(`💾 Draft saved for: ${selectedEmployee.name}`);
    alert(`Draft saved for ${selectedEmployee.name}!`);
    handleCloseModal();
  };

  const exportToExcel = () => {
    console.log("📊 Exporting non-quota data to Excel");
    console.log("Data to export:", filteredData);
    alert("Excel export functionality");
  };

  const exportToCSV = () => {
    console.log("📄 Exporting non-quota data to CSV");
    console.log("Data to export:", filteredData);
    alert("CSV export functionality");
  };

  const exportToPDF = () => {
    console.log("📑 Exporting non-quota data to PDF");
    alert("PDF export functionality");
  };

  // Format number function
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    } else {
      return num.toString();
    }
  };

  return (
    <div className="shadow-md rounded-lg px-3 w-full">
      {/* Header */}
      <div className="flex items-center lg:flex-row lg:items-center gap-4 mb-4 mt-4 justify-end">
        <div className="flex sm:flex-row gap-3 w-full lg:w-auto ">
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="bg-[rgba(59,130,246,0.03)] border border-gray-700 text-white px-3 py-2 rounded-md text-sm flex items-center gap-1 transition-all hover:bg-[rgba(59,130,246,0.1)]"
            >
              <Download size={14} />
              Excel
            </button>
            <button
              onClick={exportToCSV}
              className="bg-[rgba(59,130,246,0.03)] border border-gray-700 text-white px-3 py-2 rounded-md text-sm flex items-center gap-1 transition-all hover:bg-[rgba(59,130,246,0.1)]"
            >
              <Download size={14} />
              CSV
            </button>
            <button
              onClick={exportToPDF}
              className="bg-[rgba(59,130,246,0.03)] border border-gray-700 text-white px-3 py-2 rounded-md text-sm flex items-center gap-1 transition-all hover:bg-[rgba(59,130,246,0.1)]"
            >
              <Download size={14} />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-white">
        Showing {filteredData.length} non-quota agents in {department} department
        <span className="ml-2 px-2 py-1 bg-red-900/30 text-red-300 rounded text-xs">
          Quota Not Met
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left rounded-lg whitespace-nowrap">
          <thead className="text-white font-semibold">
            <tr>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">DATE</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">NAME</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">DEPARTMENT</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">OUTPUT</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">TARGET</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">COMPLETION</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">VARIANCE</th>
              {
                role === "Team-Leader" && <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">ACTION</th>
              }
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={role === "Team-Leader" ? "8" : "7"} className="px-4 py-4 text-center text-white border-b border-[#9e9fa74d]/40">
                  {reduxData ? `No non-quota agents found for ${department} department` : "Loading data..."}
                </td>
              </tr>
            ) : (
              filteredData.map((member, index) => (
                <tr key={index} className="hover:bg-[#1a1f3664] transition-colors">
                  <td className="px-4 py-4 border-b border-[#9e9fa74d]/40 text-white-300">{member.date}</td>
                  <td className="px-4 py-4 border-b border-[#9e9fa74d]/40 font-medium text-white">
                    {member.name}
                  </td>
                  <td className="px-4 py-4 border-b border-[#9e9fa74d]/40">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.department === "CSR"
                      ? "bg-blue-900/30 text-blue-300"
                      : member.department === "Deposit"
                        ? "bg-green-900/30 text-green-300"
                        : "bg-orange-900/30 text-orange-300"
                      }`}>
                      {member.department}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b border-[#9e9fa74d]/40 font-semibold text-white">
                    {formatNumber(member.output)}
                  </td>
                  <td className="px-4 py-2 border-b border-[#9e9fa74d]/40 text-white-300">
                    {formatNumber(member.target)}
                  </td>
                  <td className="px-4 py-2 border-b border-[#9e9fa74d]/40">
                    <span className={`font-bold ${member.quotaPercentage < 50 ? "text-red-400" : "text-yellow-400"}`}>
                      {member.quotaPercentage}%
                    </span>
                  </td>
                  <td
                    className={`px-4 py-2 border-b border-[#9e9fa74d]/40 font-bold ${member.variance < 0 ? "text-red-400" : "text-green-400"
                      }`}
                  >
                    {member.variance > 0 ? `+${formatNumber(member.variance)}` : formatNumber(member.variance)}
                  </td>
                  {
                    role === "Team-Leader" && <td className="px-4 py-2 border-b border-[#9e9fa74d]/40">
                      <button
                        onClick={() => handleCreateCase(member)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Plus size={12} />
                        Create Case
                      </button>
                    </td>
                  }
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[rgba(59,130,246,0.03)] backdrop-blur-xl border border-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">
                Create Case - Non-Quota Performance
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Employee Info */}
              <div className="bg-[rgba(59,130,246,0.03)] p-4 rounded-lg">
                <div className="text-sm text-white">
                  <span className="font-semibold text-white-900">Employee:</span> {selectedEmployee.name}
                </div>
                <div className="text-sm text-white mt-1">
                  <span className="font-semibold text-white-900">Output:</span> {formatNumber(selectedEmployee.output)} |
                  <span className="font-semibold text-white-900"> Target:</span> {formatNumber(selectedEmployee.target)} |
                  <span className={`font-semibold ${selectedEmployee.quotaPercentage < 50 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {' '}Completion: {selectedEmployee.quotaPercentage}%
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={`Non-Quota Performance Discussion - ${selectedEmployee.name}`}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-800 rounded-lg bg-[rgba(59,130,246,0.03)] text-white-700"
                />
              </div>

              {/* To (Employee Email) */}
              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  To (Employee Email)
                </label>
                <input
                  type="email"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* CC (Optional) */}
              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  CC (Optional)
                </label>
                <input
                  type="email"
                  value={formData.cc}
                  onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                  placeholder="manager@company.com"
                  className="w-full px-3 py-2 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Attach File */}
              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  Attach File (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 border border-slate-800 rounded-lg text-sm text-white-700 hover:bg-[rgba(59,130,246,0.03)] transition-colors">
                    Choose File
                  </button>
                  <span className="text-sm text-white-500">No file chosen</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-[rgba(59,130,246,0.03)]">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-white-700 hover:bg-gray-200 hover:text-black rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-gray-400 text-slate-900 text-white-700 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Save as Draft
              </button>
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NonQuotaMembersTable;