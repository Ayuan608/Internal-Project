import React, { useState, useEffect } from "react";
import { Download, Filter, X, Mail, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { data } from "../../../../Helpers/Helper";

const NonQuotaMembersTable = ({ department = "CSR" }) => {
  const { role } = useSelector((state) => state.auth)
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    to: "",
    cc: "",
    message: "Dear [Employee],\n\nI wanted to reach out regarding your performance metrics for today. I noticed that your output was below the target quota.",
    priority: "Medium"
  });


  useEffect(() => {
    if (department === "All") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => item.department === department);
      setFilteredData(filtered);
    }
  }, [department]);

  const handleCreateCase = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      to: employee.email,
      cc: "manager@mytechliance.com",
      message: `Dear [Employee],\n\nI wanted to reach out regarding your performance metrics for today. I noticed that your output was below the target quota.`,
      priority: "Medium"
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSendEmail = () => {
    alert(`Email sent to ${selectedEmployee.name}!`);
    handleCloseModal();
  };

  const handleSaveDraft = () => {
    alert(`Draft saved for ${selectedEmployee.name}!`);
    handleCloseModal();
  };

  const exportToExcel = () => {
    alert("Excel export functionality");
  };

  const exportToCSV = () => {
    alert("CSV export functionality");
  };

  const exportToPDF = () => {
    alert("PDF export functionality");
  };

  return (
    <div className="shadow-md rounded-lg px-3 w-full">
      {/* Header - Remove the department filter from here since it's coming from parent */}
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
        Showing {filteredData.length} of {data.length} records
        {/* <span className="ml-2 px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
          Department: 
        </span> */}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left  rounded-lg whitespace-nowrap">
          <thead className="text-white font-semibold">
            <tr>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">DATE</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">NAME</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">ROLE</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">DEPARTMENT</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">OUTPUT</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">TARGET</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">VARIANCE</th>
              {
                role === "Team-Leader" && <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">ACTION</th>
              }
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-4 text-center text-white border-b border-[#9e9fa74d]/40">
                  No records found for {department} department
                </td>
              </tr>
            ) : (
              filteredData.map((member, index) => (
                <tr key={index} className="hover:bg-[#1a1f3664] transition-colors">
                  <td className="px-4 py-4 border-b border-[#9e9fa74d]/40 text-white-300">{member.date}</td>
                  <td className="px-4 py-4 border-b border-[#9e9fa74d]/40 font-medium text-white">
                    {member.name}
                  </td>
                  <td className="px-4 py-4 border-b border-[#9e9fa74d]/40 text-white-300">{member.role}</td>
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
                    {member.output}
                  </td>
                  <td className="px-4 py-2 border-b border-[#9e9fa74d]/40 text-white-300">
                    {member.target}
                  </td>
                  <td
                    className={`px-4 py-2 border-b border-[#9e9fa74d]/40 font-bold ${member.variance < 0 ? "text-red-400" : "text-green-400"
                      }`}
                  >
                    {member.variance > 0 ? `+${member.variance}` : member.variance}
                  </td>
                  {
                    role === "Team-Leader" && <td className="px-4 py-2 border-b border-[#9e9fa74d]/40">
                      <button
                        onClick={() => handleCreateCase(member)}
                        className="bg-[var(--button-color)] hover:bg-[var(--hover-color)] text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center gap-1"
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

      {/* Modal - Remains exactly the same */}
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
                  <span className="font-semibold text-white-900">Output:</span> {selectedEmployee.output} |
                  <span className="font-semibold text-white-900"> Target:</span> {selectedEmployee.target} |
                  <span className={`font-semibold ${selectedEmployee.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {' '}Variance: {selectedEmployee.variance}
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
                  placeholder="manager@mytechliance.com"
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
                className="px-4 py-2 bg-[var(--button-color)] text-white hover:bg-[var(--hover-color)] rounded-lg transition-colors"
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