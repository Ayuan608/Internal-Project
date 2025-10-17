import React, { useState, useEffect } from 'react';
import { Download, Upload, Search, Filter, Calendar, Users, Clock, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../redux/attendenceSlice';

const AttendanceDashboard = () => {
  const dispatch = useDispatch();

  // Redux state
  const { allAttendance, loading, error } = useSelector((state) => state.attendance);

  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [alertFilter, setAlertFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  // Fetch attendance data on component mount
  useEffect(() => {
    dispatch(getAllAttendance({
      startDate,
      endDate,
      department: departmentFilter,
      page: currentPage,
      limit: itemsPerPage
    }));
  }, [dispatch, currentPage]);

  // Update filtered data when attendance list changes
  useEffect(() => {
    if (!Array.isArray(allAttendance)) return;

    let filtered = [...allAttendance];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.empId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (alertFilter) {
      filtered = filtered.filter(item => item.alert === alertFilter);
    }

    setFilteredData(filtered);
  }, [searchTerm, alertFilter, allAttendance]);



  // Filter logic
  useEffect(() => {
    if (!allAttendance?.data) return;

    let filtered = [...allAttendance.data];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.empId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (alertFilter) {
      filtered = filtered.filter(item => item.alert === alertFilter);
    }

    setFilteredData(filtered);
  }, [searchTerm, alertFilter, allAttendance]);

  // Apply filters and fetch data
  const handleApplyFilters = () => {
    setCurrentPage(1);
    dispatch(getAllAttendance({
      startDate,
      endDate,
      department: departmentFilter,
      page: 1,
      limit: itemsPerPage
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setDepartmentFilter("");
    setAlertFilter("");
    setCurrentPage(1);
    dispatch(getAllAttendance({ page: 1, limit: itemsPerPage }));
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['EMP ID', 'Name', 'Punch In', 'Punch Out', 'Total Break (min)', 'Alert', 'Date', 'Department'];
    const csvData = filteredData.map(row => [
      row._id || '',
      row.name || '',
      row.punchIn || '',
      row.punchOut || '',
      row.totalBreak || '',
      row.alert || '',
      row.date || '',
      row.department || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV (placeholder)
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Implement CSV import logic here
      console.log('Importing:', file.name);
    }
  };

  // Get alert badge styling
  const getAlertBadge = (alert) => {
    const badges = {
      'On-Time': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'Overbreak': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'Missing Punch In': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Missing Punch Out': 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    };
    return badges[alert] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  // Pagination
  const totalPages = Math.ceil((allAttendance?.total || filteredData.length) / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen  p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Attendance Management</h1>
        <p className="text-slate-400">Track and manage employee attendance records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-400 text-sm">On-Time</p>
              <p className="text-2xl font-bold text-white">{filteredData.filter(d => d.alert === 'On-Time').length}</p>
            </div>
            <Clock className="text-emerald-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-sm">Overbreak</p>
              <p className="text-2xl font-bold text-white">{filteredData.filter(d => d.alert === 'Overbreak').length}</p>
            </div>
            <AlertCircle className="text-amber-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm">Missing Punch In</p>
              <p className="text-2xl font-bold text-white">{filteredData.filter(d => d.alert === 'Missing Punch In').length}</p>
            </div>
            <Users className="text-purple-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/10 border border-rose-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-400 text-sm">Missing Punch Out</p>
              <p className="text-2xl font-bold text-white">{filteredData.filter(d => d.alert === 'Missing Punch Out').length}</p>
            </div>
            <AlertCircle className="text-rose-400" size={32} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className=" rounded-xl p-4 mb-6 ">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            {/* Search Icon on the right inside input */}
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />

            <input
              type="text"
              placeholder="Search by EMP ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>


          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-2 py-2  text-white rounded-lg transition-all"
          >
            <Filter size={20} />
            Filters
          </button>

          {/* Import/Export */}
          <label className="flex items-center gap-2 px-4 py-2 bg-[#191b2187] text-white rounded-lg cursor-pointer transition-all">
            <Upload size={20} />
            Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#191b2187] text-white rounded-lg transition-all"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Departments</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Alert Status</label>
              <select
                value={alertFilter}
                onChange={(e) => setAlertFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Alerts</option>
                <option value="On-Time">On-Time</option>
                <option value="Overbreak">Overbreak</option>
                <option value="Missing Punch In">Missing Punch In</option>
                <option value="Missing Punch Out">Missing Punch Out</option>
              </select>
            </div>
            <div className="md:col-span-4 flex gap-2">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                Apply Filters
              </button>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-rose-400">
            <AlertCircle size={24} className="mr-2" />
            Error loading data: {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Punch In</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Punch Out</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Break</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Alert</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="hover:bg-slate-700/30 transition-all duration-200 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={item?.avatar?.url || `https://ui-avatars.com/api/?name=${item.name}&background=random`}
                            alt={item.UseFullName}
                            className="h-10 w-10 rounded-full border-2 border-slate-600"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{item.user.FullName || 'N/A'}</div>
                            <div className="text-sm text-slate-400">{item.user._id.replace(/\D/g, "").slice(0, 5) || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">  {item.clockIn
                          ? new Date(item.clockIn).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                          : "--"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">  {item.clockOut
                          ? new Date(item.clockOut).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                          : "--"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{item.workingHours || 0} min</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getAlertBadge(item.alert)}`}>
                          {item.alert || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-400 hover:text-blue-300 mr-3">Notify</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paginatedData.length > 0 && (
              <div className="bg-slate-900/30 px-6 py-4 flex items-center justify-between border-t border-slate-700">
                <div className="text-sm text-slate-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-lg transition-all ${currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceDashboard;