import React, { useState, useEffect } from "react";
import { Download, Filter } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useSelector } from "react-redux";

const NonQuotaMembersTable = () => {
  const { nonQuotaUsers } = useSelector((state) => state.quota);

  const [filteredData, setFilteredData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const data = [
    {
      date: "2025-10-17",
      name: "John Smith",
      role: "Agent",
      department: "CSR",
      output: 45,
      target: 50,
      variance: -5,
    },
    {
      date: "2025-10-17",
      name: "Sarah Johnson",
      role: "Agent",
      department: "Withdrawal",
      output: 28,
      target: 35,
      variance: -7,
    },
    {
      date: "2025-10-16",
      name: "Mike Davis",
      role: "Agent",
      department: "Deposit",
      output: 38,
      target: 45,
      variance: -7,
    },
    {
      date: "2025-10-16",
      name: "Emily Wilson",
      role: "Agent",
      department: "CSR",
      output: 42,
      target: 50,
      variance: -8,
    },
    {
      date: "2025-10-15",
      name: "David Brown",
      role: "Agent",
      department: "Withdrawal",
      output: 32,
      target: 35,
      variance: -3,
    },
    {
      date: "2025-10-15",
      name: "Lisa Taylor",
      role: "Agent",
      department: "Deposit",
      output: 44,
      target: 45,
      variance: -1,
    },
  ];

  // Get unique departments for filter options
  const departments = ["All", ...new Set(data.map(item => item.department))];

  // Filter data based on selected department
  useEffect(() => {
    if (selectedDepartment === "All") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => item.department === selectedDepartment);
      setFilteredData(filtered);
    }
  }, [selectedDepartment]);

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Non-Quota Members");
    XLSX.writeFile(workbook, "NonQuotaMembers.xlsx");
  };

  // Export to CSV
  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    XLSX.writeFile(
      { Sheets: { data: worksheet }, SheetNames: ["data"] },
      "NonQuotaMembers.csv"
    );
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Non-Quota Members", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [
        ["DATE", "NAME", "ROLE", "DEPARTMENT", "OUTPUT", "TARGET", "VARIANCE"],
      ],
      body: filteredData.map((item) => [
        item.date,
        item.name,
        item.role,
        item.department,
        item.output,
        item.target,
        item.variance,
      ]),
    });
    doc.save("NonQuotaMembers.pdf");
  };

  return (
    <div className="shadow-md rounded-lg px-3 w-full">
      {/* Header with Filters and Export Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
        <h2 className="text-lg font-semibold text-white">Non-Quota Members</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-2 bg-[#1a1f36] rounded-lg px-3 py-2 border border-gray-700">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none focus:ring-0 appearance-none"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept} className="bg-[#10131f]">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="bg-[rgba(59,130,246,0.03)] border_gray text-white px-3 py-2 rounded-md text-sm flex items-center gap-1 transition-all"
            >
              <Download size={14} />
              Excel
            </button>
            <button
              onClick={exportToCSV}
              className="bg-[rgba(59,130,246,0.03)] border_gray text-white px-3 py-2 rounded-md text-sm flex items-center gap-1 transition-all"
            >
              <Download size={14} />
              CSV
            </button>
            <button
              onClick={exportToPDF}
              className="bg-[rgba(59,130,246,0.03)] border_gray text-white px-3 py-2 rounded-md text-sm flex items-center gap-1 transition-all"
            >
              <Download size={14} />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-400">
        Showing {filteredData.length} of {data.length} records
        {selectedDepartment !== "All" && (
          <span className="ml-2 px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
            Department: {selectedDepartment}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-slate-900 rounded-lg whitespace-nowrap">
          <thead className="text-white font-semibold">
            <tr>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">DATE</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">NAME</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">ROLE</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">DEPARTMENT</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">OUTPUT</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">TARGET</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]/40">VARIANCE</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-4 text-center text-gray-400 border-b border-[#9e9fa74d]/40">
                  No records found for the selected department
                </td>
              </tr>
            ) : (
              filteredData.map((member, index) => (
                <tr key={index} className="hover:bg-[#1a1f3664] transition-colors">
                  <td className="px-4 py-2 border-b border-[#9e9fa74d]/40">{member.date}</td>
                  <td className="px-4 py-2 border-b border-[#9e9fa74d]/40 font-medium text-white">
                    {member.name}
                  </td>
                  <td className="px-4 py-2 border-b border-[#9e9fa74d]/40">{member.role}</td>
                  <td className="px-4 py-2 border-b border-[#9e9fa74d]/40">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.department === "CSR"
                        ? "bg-blue-900/30 text-blue-300"
                        : member.department === "Deposit"
                          ? "bg-green-900/30 text-green-300"
                          : "bg-orange-900/30 text-orange-300"
                      }`}>
                      {member.department}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b border-[#9e9fa74d]/40 font-semibold">
                    {member.output}
                  </td>
                  <td className="px-4 py-2 border-b border-[#9e9fa74d]/40">
                    {member.target}
                  </td>
                  <td
                    className={`px-4 py-2 border-b border-[#9e9fa74d]/40 font-bold ${member.variance < 0 ? "text-red-400" : "text-green-400"
                      }`}
                  >
                    {member.variance > 0 ? `+${member.variance}` : member.variance}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Department Quick Filter Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-400 mr-2">Quick filter:</span>
        {departments.filter(dept => dept !== "All").map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDepartment(dept)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedDepartment === dept
                ? dept === "CSR"
                  ? "bg-blue-500 text-white"
                  : dept === "Deposit"
                    ? "bg-green-500 text-white"
                    : "bg-orange-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
          >
            {dept}
          </button>
        ))}
        <button
          onClick={() => setSelectedDepartment("All")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedDepartment === "All"
              ? "bg-purple-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
        >
          All Departments
        </button>
      </div>
    </div>
  );
};

export default NonQuotaMembersTable;