import React, { useState } from 'react';
import { Search, Plus, Trash2, Shield, Edit2, X, Check } from 'lucide-react';

export default function IPWhitelistDashboard() {
  const [ipAddresses, setIpAddresses] = useState([
    {
      id: 1,
      ip: '192.168.1.100',
      label: 'Office Main',
      addedDate: '2025-10-20',
      addedBy: 'admin@company.com',
      location: 'Phnom Penh, Cambodia',
      department: 'CSR Department'
    },
    {
      id: 2,
      ip: '203.0.113.45',
      label: 'Remote Worker - John',
      addedDate: '2025-10-18',
      addedBy: 'admin@company.com',
      location: 'Singapore, Singapore',
      department: 'Marketing Department'
    },
    {
      id: 3,
      ip: '198.51.100.22',
      label: 'Office Branch 2',
      addedDate: '2025-10-15',
      addedBy: 'superadmin@company.com',
      location: 'Bangkok, Thailand',
      department: 'Deposit Department'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newIp, setNewIp] = useState({
    ip: '',
    label: '',
    userName: '',
    department: 'CSR Department'
  });
  const [isLocating, setIsLocating] = useState(false);

  const departments = [
    'Deposit Department',
    'CSR Department',
    'Marketing Department',
    'Withdrawal Department'
  ];

  const filteredIps = ipAddresses.filter(item =>
    item.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.addedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIpLocation = async (ip) => {
    setIsLocating(true);
    try {
      // In production, use a real API like ipapi.co or ip-api.com
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      setIsLocating(false);
      return `${data.city || 'Unknown'}, ${data.country_name || 'Unknown'}`;
    } catch {
      setIsLocating(false);
      return 'Location unavailable';
    }
  };

  const handleAddIp = async () => {
    if (newIp.ip && newIp.label && newIp.userName && newIp.department) {
      const location = await getIpLocation(newIp.ip);
      setIpAddresses([
        ...ipAddresses,
        {
          id: Date.now(),
          ip: newIp.ip,
          label: newIp.label,
          addedDate: new Date().toISOString().split('T')[0],
          addedBy: newIp.userName,
          location,
          department: newIp.department
        }
      ]);
      setNewIp({ ip: '', label: '', userName: '', department: 'CSR Department' });
      setShowAddModal(false);
    }
  };

  const handleDeleteIp = (id) => {
    setIpAddresses(ipAddresses.filter(item => item.id !== id));
  };

  const handleEditIp = (id) => {
    const item = ipAddresses.find(ip => ip.id === id);
    setNewIp({
      ip: item.ip,
      label: item.label,
      userName: item.addedBy,
      department: item.department
    });
    setEditingId(id);
    setShowAddModal(true);
  };

  const handleUpdateIp = async () => {
    const current = ipAddresses.find(item => item.id === editingId);
    const location =
      newIp.ip !== current.ip ? await getIpLocation(newIp.ip) : current.location;

    setIpAddresses(ipAddresses.map(item =>
      item.id === editingId
        ? {
            ...item,
            ip: newIp.ip,
            label: newIp.label,
            addedBy: newIp.userName,
            location,
            department: newIp.department
          }
        : item
    ));
    setNewIp({ ip: '', label: '', userName: '', department: 'CSR Department' });
    setEditingId(null);
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-slate-900/50 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-white"> IP Whitelist Management </h1>
          </div>
          <p className="text-gray-600">
            IP Whitelist Management - Employee Monitoring System
          </p>
        </div>

        {/* Controls */}
        <div className="bg-slate-900/50 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search IP address or label..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                setShowAddModal(true);
                setEditingId(null);
                setNewIp({ ip: '', label: '', userName: '', department: 'CSR Department' });
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add IP Address
            </button>
          </div>
        </div>

        {/* IP Table */}
        <div className="bg-slate-900/40 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">IP Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Label</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Department</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Added Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Added By</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredIps.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No IP addresses found
                    </td>
                  </tr>
                ) : (
                  filteredIps.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-medium text-white">
                        {item.ip}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">{item.label}</td>
                      <td className="px-6 py-4 text-sm text-white">{item.location}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">{item.addedDate}</td>
                      <td className="px-6 py-4 text-sm text-white">{item.addedBy}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditIp(item.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteIp(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-800">
            <p className="text-sm text-white">
              Total whitelisted IPs:{' '}
              <span className="font-semibold text-white">{ipAddresses.length}</span>
              {searchQuery && (
                <span className="ml-4">
                  Showing:{' '}
                  <span className="font-semibold text-white">{filteredIps.length}</span> results
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit IP Address' : 'Add New IP Address'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                  setNewIp({ ip: '', label: '', userName: '', department: 'CSR Department' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IP Address</label>
                <input
                  type="text"
                  placeholder="e.g., 192.168.1.100"
                  value={newIp.ip}
                  onChange={(e) => setNewIp({ ...newIp, ip: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label/Description</label>
                <input
                  type="text"
                  placeholder="e.g., Office Main or Employee Name"
                  value={newIp.label}
                  onChange={(e) => setNewIp({ ...newIp, label: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Name</label>
                <input
                  type="text"
                  placeholder="e.g., John Doe or john@company.com"
                  value={newIp.userName}
                  onChange={(e) => setNewIp({ ...newIp, userName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Department</label>
                <div className="grid grid-cols-2 gap-2">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setNewIp({ ...newIp, department: dept })}
                      className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                        newIp.department === dept
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {dept}
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
                  setNewIp({ ip: '', label: '', userName: '', department: 'CSR Department' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdateIp : handleAddIp}
                disabled={!newIp.ip || !newIp.label || !newIp.userName || isLocating}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLocating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Locating...
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
