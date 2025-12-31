// src/components/Dashboard/CheckerDashboard/AttendanceTable.jsx
import React from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

const AttendanceTable = ({ data = [] }) => {
  // Status color styling
  const getStatusColor = (status) => {
    const colors = {
      'Present': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: <CheckCircle size={14} /> },
      'Absent': { bg: 'bg-red-500/10', text: 'text-red-500', icon: <XCircle size={14} /> },
      'Late': { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: <AlertCircle size={14} /> },
      'On Break': { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: <Clock size={14} /> }
    };
    return colors[status] || colors['Absent'];
  };

  // Format time
  const formatTime = (time) => {
    if (!time) return '--:--';
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '--/--/----';
    return new Date(date).toLocaleDateString();
  };

  console.log("userDate", data)
  if (data.length === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center">
        <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No attendance records found</p>
        <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar size={20} />
              Attendance Records
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Showing {data.length} employee{data.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              Updated: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900/40 border-b border-slate-700/50">
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Clock In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Clock Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Breaks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {data.map((employee, index) => {
              const status = employee.status || (employee.clockIn ? 'Present' : 'Absent');
              const statusColor = getStatusColor(status);
              const breaks = employee.breaks || {};

              return (
                <tr
                  key={index}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">

                      <div className="ml-3">
                        <div className="text-sm font-medium capitalize text-white">
                          {employee.FullName || employee.username || 'Unknown'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {employee.role || 'Employee'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-300">
                      {employee.department || 'N/A'}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-300">
                      {/* {formatDate(employee.date)} */}
                      {employee.date}

                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-300 font-medium">
                      {formatTime(employee.clockIn)}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-300 font-medium">
                      {formatTime(employee.clockOut)}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                      {statusColor.icon}
                      {status}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {breaks.smoke > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="text-xs text-slate-300">{breaks.smoke}</span>
                        </div>
                      )}
                      {breaks.wc > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-xs text-slate-300">{breaks.wc}</span>
                        </div>
                      )}
                      {breaks.lunch > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-xs text-slate-300">{breaks.lunch}</span>
                        </div>
                      )}
                      {breaks.total === 0 && (
                        <span className="text-xs text-slate-500">No breaks</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                        <MoreVertical size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Total: {data.length} records
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-slate-300">Present</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-slate-300">Absent</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-slate-300">Late</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;