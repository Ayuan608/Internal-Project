import { useState, useEffect } from "react";
import { Upload, Plus, Download } from "lucide-react";
import AddMemberModal from "./popup/AddMemberModal";
import SetQuotaModal from "./popup/SetQuotaModal";

const TeamQuotaTable = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  const handleSave = (quotas) => {
    console.log("Saved quotas:", quotas);
  };

  // Simulate fetching data
  useEffect(() => {
    setTimeout(() => {
      setData([
        {
          name: "Jane Smith",
          shift: "Morning",
          role: "CSR",
          hours: "8h",
          department: "Customer Service",
          completed: 60,
          effective: 54,
          messages: 210,
          missed: 1,
          online: 490,
          frt: 35,
          positive: 94,
          negative: 2,
          mistakes: 0,
          quota: 50,
        },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="border bg-[#f5f6fa09] border-gray-700 rounded-xl min-h-screen max-w-screen overflow-auto ">
      <AddMemberModal isOpen={showModal} onClose={() => setShowModal(false)} />
      <SetQuotaModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        onSave={handleSave}
      />

      <div className="border bg-[#f5f6fa09] border-gray-700 rounded-xl p-6 w-full overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Members & Quotas</h2>
          <div className="flex space-x-2">
            <button className="flex items-center gap-2 cursor-pointer text-sm px-3 py-1 hover:bg-black/50 rounded shadow-sm border border-gray-700 transition">
              <Upload size={16} />
              Upload File
            </button>
            <button className="flex items-center gap-2 cursor-pointer text-sm px-3 py-1 hover:bg-black/50 rounded shadow-sm border border-gray-700 transition">
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 cursor-pointer text-sm px-3 py-1 hover:bg-black/50 rounded shadow-sm border border-gray-700 transition"
            >
              <Plus size={16} />
              Add Member
            </button>
            <button
              onClick={() => setShowQuotaModal(true)}
              className="text-sm border px-3 py-1 rounded border-gray-700 hover:bg-black/50 cursor-pointer transition"
            >
              Set Quota
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {/* Spinner */}
            <div className="flex items-center justify-center mb-2">
              <svg
                className="animate-spin h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>

            {/* Skeleton Rows */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-15 gap-2 border-b border-gray-700 animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <table className="min-w-full text-sm text-left text-white">
            <thead className="bg-black/50 text-xs uppercase text-white">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Shift</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Working Hours</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Completed</th>
                <th className="px-3 py-2">Effective</th>
                <th className="px-3 py-2">Messages</th>
                <th className="px-3 py-2">Missed</th>
                <th className="px-3 py-2">Online (mins)</th>
                <th className="px-3 py-2">FRT (secs)</th>
                <th className="px-3 py-2">Positive %</th>
                <th className="px-3 py-2">Negative %</th>
                <th className="px-3 py-2">Mistakes</th>
                <th className="px-3 py-2">Quota (Conv)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((member, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-700 text-center"
                >
                  <td className="px-3 py-2 font-medium">{member.name}</td>
                  <td className="px-3 py-2">{member.shift}</td>
                  <td className="px-3 py-2">{member.role}</td>
                  <td className="px-3 py-2">{member.hours}</td>
                  <td className="px-3 py-2">{member.department}</td>
                  <td className="px-3 py-2">{member.completed}</td>
                  <td className="px-3 py-2">{member.effective}</td>
                  <td className="px-3 py-2">{member.messages}</td>
                  <td className="px-3 py-2">{member.missed}</td>
                  <td className="px-3 py-2">{member.online}</td>
                  <td className="px-3 py-2">{member.frt}</td>
                  <td className="px-3 py-2">{member.positive}%</td>
                  <td className="px-3 py-2">{member.negative}%</td>
                  <td className="px-3 py-2">{member.mistakes}</td>
                  <td className="px-3 py-2">{member.quota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeamQuotaTable;
