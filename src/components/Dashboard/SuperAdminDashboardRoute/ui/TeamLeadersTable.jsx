import React, { useState } from "react";

const TeamLeadersTable = () => {
  const [members, setMembers] = useState([
    {
      name: "David Chen",
      role: "Team Leader",
      department: "CSR",
      date: "2025-01-15",
    },
    {
      name: "Lisa Martinez",
      role: "Team Leader",
      department: "Deposit",
      date: "2025-02-20",
    },
    {
      name: "Robert Taylor",
      role: "Team Leader",
      department: "Withdrawal",
      date: "2025-03-10",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
    role: "Team Leader",
    department: "CSR",
  });

  const handleAddMember = () => {
    const date = new Date().toISOString().split("T")[0];
    setMembers([...members, { ...newMember, date }]);
    setNewMember({
      name: "",
      email: "",
      password: "",
      role: "Team Leader",
      department: "CSR",
    });
    setShowModal(false);
  };

  const handleTerminate = (index) => {
    const updated = [...members];
    updated.splice(index, 1);
    setMembers(updated);
  };

  return (
    <div className=" min-h-screen text-gray-200 p-6">
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Team Leaders</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            + Add Member
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-700 rounded-lg">
            <thead className="bg-gray-700 text-gray-300 font-semibold">
              <tr>
                <th className="px-4 py-2 border-b border-gray-700">NAME</th>
                <th className="px-4 py-2 border-b border-gray-700">ROLE</th>
                <th className="px-4 py-2 border-b border-gray-700">
                  DEPARTMENT
                </th>
                <th className="px-4 py-2 border-b border-gray-700">
                  DATE CREATED
                </th>
                <th className="px-4 py-2 border-b border-gray-700">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr key={index} className="hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-2 border-b border-gray-700">
                    {member.name}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700">
                    {member.role}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700">
                    {member.department}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700">
                    {member.date}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs mr-2">
                      Edit
                    </button>
                    <button
                      onClick={() => handleTerminate(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs"
                    >
                      Terminate
                    </button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-400">
                    No team leaders available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-gray-100 rounded-lg w-[400px] p-6 shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-200 text-xl"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">Add New Member</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                  className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <input
                  type="password"
                  value={newMember.password}
                  onChange={(e) =>
                    setNewMember({ ...newMember, password: e.target.value })
                  }
                  className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) =>
                    setNewMember({ ...newMember, role: e.target.value })
                  }
                  className="w-full p-2 rounded-md bg-gray-700 border border-gray-600"
                >
                  <option>Team Leader</option>
                  <option>Agent</option>
                  <option>Supervisor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Department</label>
                <select
                  value={newMember.department}
                  onChange={(e) =>
                    setNewMember({ ...newMember, department: e.target.value })
                  }
                  className="w-full p-2 rounded-md bg-gray-700 border border-gray-600"
                >
                  <option>CSR</option>
                  <option>Deposit</option>
                  <option>Withdrawal</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-5 gap-2">
              <button
                onClick={handleAddMember}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Add Member
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeadersTable;
