import React from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useSelector } from "react-redux";

const NonQuotaMembersTable = () => {
  const { nonQuotaUsers } = useSelector((state) => state.quota);
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
  ];

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Non-Quota Members");
    XLSX.writeFile(workbook, "NonQuotaMembers.xlsx");
  };

  // Export to CSV
  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
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
      body: data.map((item) => [
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
    <div className=" shadow-md rounded-lg p-6 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Non-Quota Members</h2>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Excel
          </button>
          <button
            onClick={exportToCSV}
            className="bg-[#17a2b8] hover:bg-[#138496] text-white px-3 py-1 rounded-md text-sm"
          >
            CSV
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
          >
            PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border_gray rounded-lg">
          <thead className="text-white font-semibold">
            <tr>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]">DATE</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]">NAME</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]">ROLE</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]">DEPARTMENT</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]">OUTPUT</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]">TARGET</th>
              <th className="px-4 py-2 border-b border-[#9e9fa74d]">VARIANCE</th>
            </tr>
          </thead>
          <tbody>
            {data.map((member, index) => (
              <tr key={index} className="">
                <td className="px-4 py-2 border-b border-[#9e9fa74d]">{member.date}</td>
                <td className="px-4 py-2 border-b border-[#9e9fa74d]">{member.name}</td>
                <td className="px-4 py-2 border-b border-[#9e9fa74d]">{member.role}</td>
                <td className="px-4 py-2 border-b border-[#9e9fa74d]">{member.department}</td>
                <td className="px-4 py-2 border-b border-[#9e9fa74d]">{member.output}</td>
                <td className="px-4 py-2 border-b border-[#9e9fa74d]">{member.target}</td>
                <td
                  className={`px-4 py-2 border-b border-[#9e9fa74d] font-medium ${member.variance < 0 ? "text-red-500" : "text-green-600"
                    }`}
                >
                  {member.variance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NonQuotaMembersTable;
