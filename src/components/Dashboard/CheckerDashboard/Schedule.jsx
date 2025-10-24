import React, { useState } from 'react';
import { Calendar, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const EmployeeSchedule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  // Schedule data
  const scheduleData = [
    { id: 1, name: 'Ashish Prabhakar', dateHired: '14-Feb-25', team: 'Deposit', position: 'Staff', schedule: '16:00 - 04:00', remarks: '12 hrs', shifts: generateShifts(['D', 'N', 'N', 'D', 'D', 'RD', 'N', 'D', 'N', 'D', 'N', 'RD', 'N', 'D', 'N', 'D', 'N']) },
    { id: 2, name: 'Lekh Raj', dateHired: '7-Mar-25', team: 'Deposit', position: 'Staff', schedule: '16:00 - 04:00', remarks: '12 hrs', shifts: generateShifts(['D', 'D', 'RD', 'N', 'N', 'N', 'D', 'D', 'RD', 'N', 'N', 'D', 'D', 'RD', 'N', 'N', 'D']) },
    { id: 3, name: 'Chandan Aheer', dateHired: '16-Nov-24', team: 'CSR', position: 'Agent', schedule: '16:00 - 04:00', remarks: '12 hrs', shifts: generateShifts(['N', 'N', 'D', 'RD', 'N', 'N', 'D', 'RD', 'N', 'D', 'N', 'N', 'RD', 'D', 'N', 'RD', 'D']) },
    { id: 4, name: 'Harish Kumar', dateHired: '12-Jan-25', team: 'CSR', position: 'Senior', schedule: '16:00 - 04:00', remarks: '12 hrs', shifts: generateShifts(['D', 'D', 'N', 'N', 'RD', 'D', 'D', 'N', 'N', 'RD', 'D', 'D', 'N', 'N', 'RD', 'D', 'D']) },
    { id: 5, name: 'Sukhminder Singh', dateHired: '20-Aug-24', team: 'Withdrawal', position: 'Staff', schedule: '16:00 - 04:00', remarks: '12 hrs', shifts: generateShifts(['D', 'N', 'D', 'N', 'RD', 'N', 'N', 'D', 'N', 'RD', 'D', 'N', 'D', 'N', 'RD', 'N', 'D']) }
  ];

  function generateShifts(pattern) {
    const days = [];
    for (let i = 0; i < 30; i++) {
      days.push(pattern[i % pattern.length]);
    }
    return days;
  }

  const getShiftColor = (shift) => {
    const colors = {
      'D': 'bg-amber-400 text-amber-900',
      'N': 'bg-emerald-400 text-emerald-900',
      'RD': 'bg-red-400 text-red-900'
    };
    return colors[shift] || 'bg-gray-200 text-gray-700';
  };

  const filteredData = scheduleData
    .filter(emp => filterDepartment === 'all' || emp.team === filterDepartment)
    .filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen  p-6">
      {/* Header */}
      <header className="bg-slate-900/40 border border-slate-800/40 backdrop-blur-lg rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <Calendar size={28} />
              Employee Schedule
            </h1>
            <p className="text-sm text-slate-500">
              Monthly shift schedule and attendance patterns
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2.5 rounded-xl">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-white placeholder-slate-500 w-52 text-sm"
              />
            </div>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl  bg-slate-900 text-white text-sm cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="CSR">CSR</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
            </select>

            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all">
              <Download size={18} />
              Export Excel
            </button>

            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all">
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      {/* Schedule Table */}
      <div className="bg-slate-900/40 border border-slate-800/40 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 bg-slate-900/40 border-b border-slate-800/40 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="p-1 text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={24} />
            </button>
            <span className="text-lg font-semibold text-white">
              November 2025
            </span>
            <button className="p-1 text-slate-400 hover:text-white transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-amber-400" />
              <span className="font-medium text-slate-400">Day Shift</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-emerald-400" />
              <span className="font-medium text-slate-400">Night Shift</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-red-400" />
              <span className="font-medium text-slate-400">Rest Day</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse">
            <thead>
              <tr className="bg-slate-900/40">
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 text-left sticky left-0 bg-slate-900/40 min-w-56  tracking-wider uppercase  backdrop-brightness-0">
                  EMPLOYEE
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 text-center tracking-wider uppercase">TEAM</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 text-center tracking-wider uppercase">SCHEDULE</th>
                {[...Array(30)].map((_, i) => (
                  <th key={i} className="px-2 py-3.5 text-xs font-semibold text-slate-400 text-center min-w-10">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-700/50 hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3.5 sticky left-0 bg-slate-900/40 border-r backdrop-brightness-0 border-slate-800/40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {employee.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {employee.position}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center text-sm text-slate-300 font-medium">
                    {employee.team}
                  </td>
                  <td className="px-4 py-3.5 text-center text-sm text-slate-300 font-medium">
                    {employee.schedule}
                  </td>
                  {employee.shifts.slice(0, 30).map((shift, i) => (
                    <td key={i} className="px-2 py-2 text-center">
                      <div className={`w-8 h-8 rounded-md ${getShiftColor(shift)} flex items-center justify-center text-xs font-bold mx-auto cursor-pointer hover:scale-110 transition-transform`}>
                        {shift}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSchedule;