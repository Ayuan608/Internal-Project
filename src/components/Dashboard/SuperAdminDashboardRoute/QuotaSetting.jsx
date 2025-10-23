import React, { useState } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

const QuotaSetting = () => {
  const [quotas, setQuotas] = useState({
    csr: { morning: 50, night: 45 },
    deposit: { morning: 45, night: 40 },
    withdrawal: { morning: 35, night: 30 },
  });

  const [tempQuotas, setTempQuotas] = useState({ ...quotas });
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(null);

  const defaultQuotas = {
    csr: { morning: 50, night: 45 },
    deposit: { morning: 45, night: 40 },
    withdrawal: { morning: 35, night: 30 },
  };

  const handleInputChange = (dept, shift, value) => {
    const numValue = value === "" ? "" : Math.max(0, parseInt(value) || 0);
    setTempQuotas((prev) => ({
      ...prev,
      [dept]: {
        ...prev[dept],
        [shift]: numValue,
      },
    }));
  };

  const handleSaveChanges = (dept) => {
    setQuotas((prev) => ({
      ...prev,
      [dept]: tempQuotas[dept],
    }));
    setShowSuccessMessage(dept);
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  const handleResetAll = () => {
    setQuotas({ ...defaultQuotas });
    setTempQuotas({ ...defaultQuotas });
    setShowResetAlert(false);
    setShowSuccessMessage("all");
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  const departments = [
    { key: "csr", name: "CSR Department" },
    { key: "deposit", name: "Deposit Department" },
    { key: "withdrawal", name: "Withdrawal Department" },
  ];

  const ResetAlert = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reset All Quotas?
              </h3>
              <p className="text-gray-600 text-sm">
                Do you really want to reset the quota settings for all
                departments to their default values? This action cannot be undo.
              </p>
            </div>
            <button
              onClick={() => setShowResetAlert(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={() => setShowResetAlert(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleResetAll}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SuccessMessage = ({ dept }) => (
    <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top duration-300 z-50">
      <CheckCircle className="w-5 h-5" />
      <span className="font-medium">
        {dept === "all"
          ? "All quotas reset successfully!"
          : `${
              departments.find((d) => d.key === dept)?.name
            } saved successfully!`}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen  p-2">
      {showResetAlert && <ResetAlert />}
      {showSuccessMessage && <SuccessMessage dept={showSuccessMessage} />}

      <div>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Quota Settings
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Configure quota targets for each department and shift
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {departments.map(({ key, name }) => (
            <div
              key={key}
              className="bg-[#131415] rounded-xl shadow-lg border border-[var(--box-border)] overflow-hidden transition-all hover:shadow-xl"
            >
              <div className="bg-[#131415] p-5">
                <h2 className="text-xl font-bold text-white">{name}</h2>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Morning Shift Quota
                  </label>
                  <input
                    type="number"
                    value={tempQuotas[key].morning}
                    onChange={(e) =>
                      handleInputChange(key, "morning", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-white font-medium"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Night Shift Quota
                  </label>
                  <input
                    type="number"
                    value={tempQuotas[key].night}
                    onChange={(e) =>
                      handleInputChange(key, "night", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-white font-medium"
                    min="0"
                  />
                </div>

                <button
                  onClick={() => handleSaveChanges(key)}
                  className="w-full bg-blue-900 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowResetAlert(true)}
            className="bg-[#10131f] text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Reset All to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotaSetting;
