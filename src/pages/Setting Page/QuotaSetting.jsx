// components/QuotaSetting.jsx

import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  PieChart, 
  Building2, 
  Wallet, 
  CreditCard, 
  RefreshCw, 
  AlertCircle,
  Save,
  Clock,
  Users,
  DollarSign
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  getAllQuotas, 
  createQuota, 
  resetAllQuotas
} from '../../redux/quotaSlice';
import { useDispatch, useSelector } from 'react-redux';

function QuotaSetting({ activeTab }) {
  const dispatch = useDispatch();
  const { quotaData, loading } = useSelector(state => state.quota);
  
  const [quotas, setQuotas] = useState({
    CSR: {
      morning12hr: 500,
      morning9hr: 350,
      night12hr: 500,
      night9hr: 350,
      basis: "Completed Convo"
    },
    Deposit: {
      morning12hr: 530,
      morning9hr: 400,
      night12hr: 530,
      night9hr: 400,
      basis: "Total Deposits"
    },
    Withdraw: {
      morning12hr: 1400,
      morning9hr: 900,
      night12hr: 1500,
      night9hr: 1000,
      basis: "Total Transaction Process"
    }
  });

  const [activeDept, setActiveDept] = useState("CSR");

  // Fetch quotas on component mount
  useEffect(() => {
    fetchQuotas();
  }, []);

  // Update local state when Redux data changes
  useEffect(() => {
    if (quotaData && quotaData.length > 0) {
      const newQuotas = { ...quotas };
      quotaData.forEach(item => {
        if (newQuotas[item.department]) {
          newQuotas[item.department] = {
            morning12hr: item.shiftQuota.morning12hr,
            morning9hr: item.shiftQuota.morning9hr,
            night12hr: item.shiftQuota.night12hr,
            night9hr: item.shiftQuota.night9hr,
            basis: getBasis(item.department)
          };
        }
      });
      setQuotas(newQuotas);
    }
  }, [quotaData]);

  const fetchQuotas = async () => {
    try {
      await dispatch(getAllQuotas()).unwrap();
    } catch (error) {
      toast.error("Failed to fetch quotas");
    }
  };

  // Get basis for each department
  const getBasis = (department) => {
    switch(department) {
      case "CSR":
        return "Completed Convo";
      case "Deposit":
        return "Total Deposits";
      case "Withdraw":
        return "Total Transaction Process";
      default:
        return "";
    }
  };

  // Handle quota change
  const handleQuotaChange = (dept, shift, value) => {
    const numericValue = parseInt(value) || 0;
    
    setQuotas(prev => ({
      ...prev,
      [dept]: {
        ...prev[dept],
        [shift]: numericValue
      }
    }));
  };

  // Save quota to backend
  const handleSaveQuota = async (dept) => {
    try {
      const quotaData = {
        department: dept,
        morning12hr: quotas[dept].morning12hr,
        morning9hr: quotas[dept].morning9hr,
        night12hr: quotas[dept].night12hr,
        night9hr: quotas[dept].night9hr
      };
      
      await dispatch(createQuota(quotaData)).unwrap();
      toast.success(`${dept} department quotas saved successfully!`);
      
      // Refresh quotas
      await fetchQuotas();
    } catch (error) {
      toast.error("Failed to save quota");
    }
  };

  // Reset all quotas
  const handleResetAll = async () => {
    try {
      await dispatch(resetAllQuotas()).unwrap();
      toast.success("All quotas reset to default values!");
      
      // Refresh quotas
      await fetchQuotas();
    } catch (error) {
      toast.error("Failed to reset quotas");
    }
  };

  // Reset single department to default
  const getDefaultValue = (dept, shift) => {
    const defaults = {
      CSR: { 
        morning12hr: 500,
        morning9hr: 350,
        night12hr: 500,
        night9hr: 350
      },
      Deposit: { 
        morning12hr: 530,
        morning9hr: 400,
        night12hr: 530,
        night9hr: 400
      },
      Withdraw: { 
        morning12hr: 1400,
        morning9hr: 900,
        night12hr: 1500,
        night9hr: 1000
      }
    };
    return defaults[dept][shift];
  };

  // Department data
  const departments = [
    {
      id: "CSR",
      name: "CSR Department",
      icon: <Users size={20} />,
      description: "Customer Service Representative",
      color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      shifts: [
        { id: "morning12hr", label: "Morning 12hr Shift", icon: <Clock size={16} /> },
        { id: "morning9hr", label: "Morning 9hr Shift", icon: <Clock size={16} /> },
        { id: "night12hr", label: "Night 12hr Shift", icon: <Clock size={16} /> },
        { id: "night9hr", label: "Night 9hr Shift", icon: <Clock size={16} /> }
      ]
    },
    {
      id: "Deposit",
      name: "Deposit Department",
      icon: <DollarSign size={20} />,
      description: "Deposit Operations",
      color: "bg-green-500/20 text-green-300 border-green-500/30",
      shifts: [
        { id: "morning12hr", label: "Morning 12hr Shift", icon: <Clock size={16} /> },
        { id: "morning9hr", label: "Morning 9hr Shift", icon: <Clock size={16} /> },
        { id: "night12hr", label: "Night 12hr Shift", icon: <Clock size={16} /> },
        { id: "night9hr", label: "Night 9hr Shift", icon: <Clock size={16} /> }
      ]
    },
    {
      id: "Withdraw",
      name: "Withdraw Department",
      icon: <CreditCard size={20} />,
      description: "Withdrawal Operations",
      color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      shifts: [
        { id: "morning12hr", label: "Morning 12hr Shift", icon: <Clock size={16} /> },
        { id: "morning9hr", label: "Morning 9hr Shift", icon: <Clock size={16} /> },
        { id: "night12hr", label: "Night 12hr Shift", icon: <Clock size={16} /> },
        { id: "night9hr", label: "Night 9hr Shift", icon: <Clock size={16} /> }
      ]
    }
  ];

  if (activeTab !== "change-quota") return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#9696a814] border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <PieChart className="text-blue-400" size={24} />
          <div>
            <h3 className="text-2xl font-bold text-white">Quota Settings</h3>
            <p className="text-gray-400">Configure quota targets based on different shift timings</p>
          </div>
        </div>
      </div>

      {/* Department Selection Tabs */}
      <div className="bg-[#9696a814] border border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveDept(dept.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeDept === dept.id
                ? dept.color
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
            >
              {dept.icon}
              <span>{dept.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Department Quota Configuration */}
      <div className="space-y-6">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className={`bg-[#9696a814] border border-gray-700 rounded-xl p-6 ${activeDept !== dept.id ? 'hidden' : ''}`}
          >
            {/* Department Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${dept.color}`}>
                {dept.icon}
                <h4 className="text-lg font-bold">{dept.name}</h4>
              </div>
              <div className="bg-gray-900/50 rounded-lg px-3 py-1.5">
                <span className="text-sm text-gray-300">
                  Basis: <span className="font-bold text-yellow-400">{quotas[dept.id].basis}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Morning 12hr Shift */}
              <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="text-blue-400" size={18} />
                  <h5 className="font-bold text-white">Morning 12hr Shift</h5>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Target:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={quotas[dept.id].morning12hr}
                      onChange={(e) => handleQuotaChange(dept.id, "morning12hr", e.target.value)}
                      className="w-24 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleQuotaChange(dept.id, "morning12hr", getDefaultValue(dept.id, "morning12hr"))}
                      className="text-sm text-gray-400 hover:text-white px-2 py-1 hover:bg-gray-700 rounded transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Morning 9hr Shift */}
              <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="text-blue-400" size={18} />
                  <h5 className="font-bold text-white">Morning 9hr Shift</h5>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Target:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={quotas[dept.id].morning9hr}
                      onChange={(e) => handleQuotaChange(dept.id, "morning9hr", e.target.value)}
                      className="w-24 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleQuotaChange(dept.id, "morning9hr", getDefaultValue(dept.id, "morning9hr"))}
                      className="text-sm text-gray-400 hover:text-white px-2 py-1 hover:bg-gray-700 rounded transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Night 12hr Shift */}
              <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="text-purple-400" size={18} />
                  <h5 className="font-bold text-white">Night 12hr Shift</h5>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Target:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={quotas[dept.id].night12hr}
                      onChange={(e) => handleQuotaChange(dept.id, "night12hr", e.target.value)}
                      className="w-24 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleQuotaChange(dept.id, "night12hr", getDefaultValue(dept.id, "night12hr"))}
                      className="text-sm text-gray-400 hover:text-white px-2 py-1 hover:bg-gray-700 rounded transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Night 9hr Shift */}
              <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="text-purple-400" size={18} />
                  <h5 className="font-bold text-white">Night 9hr Shift</h5>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Target:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={quotas[dept.id].night9hr}
                      onChange={(e) => handleQuotaChange(dept.id, "night9hr", e.target.value)}
                      className="w-24 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleQuotaChange(dept.id, "night9hr", getDefaultValue(dept.id, "night9hr"))}
                      className="text-sm text-gray-400 hover:text-white px-2 py-1 hover:bg-gray-700 rounded transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Changes Button */}
            <div className="pt-6 border-t border-gray-700 mt-6">
              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveQuota(dept.id)}
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Save size={18} />
                  Save Changes for {dept.name}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reset All Button */}
      <div className="bg-[#9696a814] border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-400" size={24} />
            <div>
              <h4 className="font-bold text-white">Reset All Departments</h4>
              <p className="text-sm text-gray-400">Reset all quotas to their default values</p>
            </div>
          </div>
          <button
            onClick={handleResetAll}
            disabled={loading}
            className="px-5 py-2.5 border border-yellow-600 text-yellow-400 hover:bg-yellow-600/10 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Reset All Quotas
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuotaSetting;