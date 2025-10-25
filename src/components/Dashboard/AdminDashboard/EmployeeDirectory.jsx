import React, { useState, useEffect } from 'react';
import { Search, Edit2, Calendar, UserCheck, Users, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers } from '../../../redux/authSlice';

const EmployeeDirectory = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state?.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  const [isRestDayModalOpen, setIsRestDayModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [restDayReason, setRestDayReason] = useState('');
  const [restDayDate, setRestDayDate] = useState('');
  
  // Deactivate Confirmation Modal State
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [employeeToDeactivate, setEmployeeToDeactivate] = useState(null);

  // Fetch all users on component mount
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Filter logic
  useEffect(() => {
    if (!users) return;

    let filtered = [...users];

    // Filter by status
    if (activeFilter !== 'All') {
      filtered = filtered.filter((emp) => emp.status === activeFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.FullName?.toLowerCase().includes(query) ||
          emp.email?.toLowerCase().includes(query) ||
          emp.phone?.toLowerCase().includes(query)
      );
    }

    setFilteredEmployees(filtered);
  }, [searchTerm, activeFilter, users]);

  const handleStatusToggle = async (employee) => {
    if (employee.status === 'Active') {
      setEmployeeToDeactivate(employee);
      setIsDeactivateModalOpen(true);
    } else {
      // Directly activate
      const response = await dispatch(
        updateUserStatus({
          userId: employee._id,
          status: 'Active',
        })
      );

      if (response?.payload?.success) {
        dispatch(getAllUsers());
      } else {
        alert(response?.payload?.message || 'Failed to activate employee');
      }
    }
  };

  const confirmDeactivation = async () => {
    if (!employeeToDeactivate) return;

    const response = await dispatch(
      updateUserStatus({
        userId: employeeToDeactivate._id,
        status: 'Inactive',
      })
    );

    if (response?.payload?.success) {
      dispatch(getAllUsers());
    } else {
      alert(response?.payload?.message || 'Failed to deactivate employee');
    }

    setIsDeactivateModalOpen(false);
    setEmployeeToDeactivate(null);
  };

  const handleEdit = (employee) => {
    console.log('Edit employee:', employee);
    alert(`Edit functionality for ${employee.FullName} - To be implemented`);
  };

  const handleRestDay = (employee) => {
    setSelectedEmployee(employee);
    setRestDayReason('');
    setRestDayDate('');
    setIsRestDayModalOpen(true);
  };

  const handleRestDaySubmit = async () => {
    if (!restDayDate) {
      alert('Please select a rest day date');
      return;
    }

    // Yahan aap apna REST API call kar sakte ho
    console.log({
      employeeId: selectedEmployee._id,
      employeeName: selectedEmployee.FullName,
      reason: restDayReason,
      date: restDayDate,
    });

    alert(`Rest day scheduled for ${selectedEmployee.FullName} on ${restDayDate}`);
    
    setIsRestDayModalOpen(false);
    setSelectedEmployee(null);
    setRestDayReason('');
    setRestDayDate('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen ">
    
      <div className="flex">


        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-full mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Employee Directory</h2>
              <p className="text-slate-400">Manage and monitor your team members</p>
            </div>

            {/* Search and Filter Section */}
            <div className=" rounded-xl p-6 mb-6 ">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  {['All', 'Active', 'Inactive'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                        activeFilter === filter
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Name</th>
                      <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Date Hired</th>
                      <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Salary</th>
                      <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Phone Number</th>
                      <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Email</th>
                      <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {!users || users.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12">
                          <p className="text-lg text-slate-300">No employees found</p>
                          <p className="text-sm text-slate-400">Add your first employee to get started</p>
                        </td>
                      </tr>
                    ) : filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12">
                          <Search size={48} className="mx-auto mb-3 text-slate-500" />
                          <p className="text-lg text-slate-300">No matching employees</p>
                          <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <tr key={employee._id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                {employee.FullName?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <span className="text-slate-200 font-medium capitalize">{employee.FullName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{formatDate(employee.dateHired)}</td>
                          <td className="px-6 py-4 text-slate-300">
                            {employee.salary ? (
                              <span className="text-emerald-400 font-semibold">${employee.salary}</span>
                            ) : (
                              <span className="text-slate-500">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {employee.phone ? `+91 ${employee.phone}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {employee.email || <span className="text-slate-500">-</span>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                              employee.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                employee.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'
                              }`}></span>
                              {employee.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {employee.status === 'Active' ? (
                                <button
                                  onClick={() => handleStatusToggle(employee)}
                                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40 text-sm"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusToggle(employee)}
                                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleRestDay(employee)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-all border border-slate-600"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(employee)}
                                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
                <p className="text-slate-400 text-sm">
                  Showing <span className="text-slate-200 font-medium">{filteredEmployees.length}</span> of <span className="text-slate-200 font-medium">{users?.length || 0}</span> employees
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all border border-slate-600">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">
                    1
                  </button>
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all border border-slate-600">
                    2
                  </button>
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all border border-slate-600">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest Day Modal */}
      {isRestDayModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Employee Action</h2>
              <button
                onClick={() => setIsRestDayModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-slate-300">
                <span className="font-bold text-white">{selectedEmployee?.FullName}</span>
                <span className="text-slate-400"> - Schedule Rest Day</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Reason/Notes
              </label>
              <textarea
                value={restDayReason}
                onChange={(e) => setRestDayReason(e.target.value)}
                placeholder="Enter reason for this action..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-200 placeholder-slate-400"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Rest Day Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={restDayDate}
                  onChange={(e) => setRestDayDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
                />
                <Calendar
                  size={18}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsRestDayModalOpen(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors border border-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleRestDaySubmit}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md p-6 border border-slate-700">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4">This page says</h2>
              <p className="text-slate-300 text-base">
                Are you sure you want to deactivate <span className="font-semibold text-white">{employeeToDeactivate?.FullName}</span>?
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={confirmDeactivation}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
              >
                OK
              </button>
              <button
                onClick={() => {
                  setIsDeactivateModalOpen(false);
                  setEmployeeToDeactivate(null);
                }}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors border border-slate-600"
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

export default EmployeeDirectory;