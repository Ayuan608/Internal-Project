import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Shield, Edit2, X, Check, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllIPWhitelist,
  addWhitelistIp,
  editWhitelistIp,
  deleteWhitelistIp
} from '../../../redux/activitylogSlice';

export default function IPWhitelistDashboard() {
  const dispatch = useDispatch();
  const { whitelistedIPs, loading } = useSelector((state) => state.activity);
  console.log("whiyeli", whitelistedIPs)
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newIp, setNewIp] = useState({
    ipAddress: '',
    label: '',
    department: 'CSR Department'
  });
  const [isLocating, setIsLocating] = useState(false);

  const departments = [
    { name: 'Deposit Department', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    { name: 'CSR Department', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { name: 'Withdrawal Department', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { name: 'Marketing Department', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  ];

  useEffect(() => {
    dispatch(getAllIPWhitelist());
  }, [dispatch]);

  const getDepartmentColor = (deptName) => {
    const dept = departments.find(d => d.name === deptName);
    return dept ? dept.color : 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const filteredIps = whitelistedIPs.filter(item =>
    item.ipAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.addedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.addedByName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location?.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddIp = async () => {
    if (newIp.ipAddress && newIp.label && newIp.department) {
      setIsLocating(true);
      try {
        await dispatch(addWhitelistIp(newIp)).unwrap();
        setNewIp({ ipAddress: '', label: '', department: 'CSR Department' });
        setShowAddModal(false);
      } catch (error) {
        console.error('Failed to add IP:', error);
        alert(error || 'Failed to add IP address');
      } finally {
        setIsLocating(false);
      }
    }
  };

  const handleDeleteIp = async (id) => {
    if (window.confirm('Are you sure you want to delete this IP address?')) {
      try {
        await dispatch(deleteWhitelistIp(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete IP:', error);
        alert(error || 'Failed to delete IP address');
      }
    }
  };

  const handleEditIp = (item) => {
    setNewIp({
      ipAddress: item.ipAddress,
      label: item.label,
      department: item.department
    });
    setEditingId(item._id);
    setShowAddModal(true);
  };

  const handleUpdateIp = async () => {
    if (newIp.ipAddress && newIp.label && newIp.department) {
      setIsLocating(true);
      try {
        await dispatch(editWhitelistIp({
          id: editingId,
          ipData: newIp
        })).unwrap();
        setNewIp({ ipAddress: '', label: '', department: 'CSR Department' });
        setEditingId(null);
        setShowAddModal(false);
      } catch (error) {
        console.error('Failed to update IP:', error);
        alert(error || 'Failed to update IP address');
      } finally {
        setIsLocating(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className=" backdrop-blur-sm rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">IP Whitelist Management</h1>
          </div>
          <p className="text-gray-400">
            IP Whitelist Management - Employee Monitoring System
          </p>
        </div>

        {/* Controls */}
        <div className=" backdrop-blur-sm  rounded-lg shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search IP address, label, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                setShowAddModal(true);
                setEditingId(null);
                setNewIp({ ipAddress: '', label: '', department: 'CSR Department' });
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg hover:shadow-blue-500/50"
            >
              <Plus className="w-5 h-5" />
              Add IP Address
            </button>
          </div>
        </div>

        {/* IP Table */}
        <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-[16px] font-semibold text-gray-200">IP Address</th>
                  <th className="px-6 py-4 text-left text-[16px] font-semibold text-gray-200">Label</th>
                  <th className="px-6 py-4 text-left text-[16px] font-semibold text-gray-200">Location</th>
                  <th className="px-6 py-4 text-left text-[16px] font-semibold text-gray-200">Department</th>
                  <th className="px-6 py-4 text-left text-[16px] font-semibold text-gray-200">Added Date</th>
                  <th className="px-6 py-4 text-left text-[16px] font-semibold text-gray-200">Added By</th>
                  <th className="px-6 py-4 text-right text-[16px] font-semibold text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                        <span className="text-gray-400">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredIps.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                      {searchQuery ? 'No IP addresses found matching your search' : 'No IP addresses whitelisted yet'}
                    </td>
                  </tr>
                ) : (
                  filteredIps.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-lg font-medium text-blue-400">
                        {item.ipAddress}
                      </td>
                      <td className="px-6 py-4 text-lg text-gray-300">{item.label}</td>
                      <td className="px-6 py-4 text-lg text-gray-300">
                        {item.location?.city && item.location?.country
                          ? `${item.location.city}, ${item.location.country}`
                          : 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-semibold border ${getDepartmentColor(item.department)}`}>
                          {item.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-lg text-gray-300">{formatDate(item.addedDate)}</td>
                      <td className="px-6 py-4 text-lg text-gray-300">
                        <div className="flex flex-col">
                          <span className="font-medium capitalize">{item.addedByName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditIp(item)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteIp(item._id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-700">
            <p className="text-sm text-gray-300">
              Total whitelisted IPs:{' '}
              <span className="font-semibold text-blue-400">{whitelistedIPs.length}</span>
              {searchQuery && (
                <span className="ml-4">
                  Showing:{' '}
                  <span className="font-semibold text-blue-400">{filteredIps.length}</span> results
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[rgba(59,130,246,0.03)] rounded-lg backdrop-blur-md shadow-2xl max-w-md w-full p-6 border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingId ? 'Edit IP Address' : 'Add New IP Address'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                  setNewIp({ ipAddress: '', label: '', department: 'CSR Department' });
                }}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">IP Address *</label>
                <input
                  type="text"
                  placeholder="e.g., 192.168.1.100"
                  value={newIp.ipAddress}
                  onChange={(e) => setNewIp({ ...newIp, ipAddress: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Label/Description *</label>
                <input
                  type="text"
                  placeholder="e.g., activity or Employee Name"
                  value={newIp.label}
                  onChange={(e) => setNewIp({ ...newIp, label: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Department *</label>
                <div className="grid grid-cols-2 gap-3">
                  {departments.map((dept) => (
                    <button
                      key={dept.name}
                      type="button"
                      onClick={() => setNewIp({ ...newIp, department: dept.name })}
                      className={`px-4 py-3 text-sm font-semibold rounded-lg border-2 transition-all ${newIp.department === dept.name
                          ? `${dept.color} shadow-lg scale-105`
                          : 'bg-slate-900/50 text-gray-400 border-slate-800 hover:border-slate-500'
                        }`}
                    >
                      {dept.name.replace(' Department', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                  setNewIp({ ipAddress: '', label: '', department: 'CSR Department' });
                }}
                className="flex-1 px-4 py-2.5 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdateIp : handleAddIp}
                disabled={!newIp.ipAddress || !newIp.label || isLocating}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {editingId ? 'Update' : 'Add IP'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}