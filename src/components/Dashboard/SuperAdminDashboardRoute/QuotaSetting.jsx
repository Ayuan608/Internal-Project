import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { createQuota, getAllQuotas, resetAllQuotas } from "../../../redux/QuotaSlice";

const QuotaSetting = () => {
  const dispatch = useDispatch();
  const { quotaData } = useSelector((state) => state.quota);

  const [tempQuotas, setTempQuotas] = useState({
    csr: { morning: "", night: "" },
    deposit: { morning: "", night: "" },
    withdrawal: { morning: "", night: "" },
  });

  const [showResetAlert, setShowResetAlert] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(null);
  const [savingDept, setSavingDept] = useState(null);

  // Fetch quotas on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await dispatch(getAllQuotas()).unwrap?.() ?? null;
        // if unwrap not available, quotaData useEffect below will pick it up
        if (result) updateTempFromArray(result);
      } catch (err) {
        console.error("Failed to fetch quotas on mount", err);
      }
    })();
  }, [dispatch]);

  // Helper to map backend array -> tempQuotas shape
  const updateTempFromArray = (arr) => {
    const formatted = {
      csr: { morning: "", night: "" },
      deposit: { morning: "", night: "" },
      withdrawal: { morning: "", night: "" },
    };

    if (Array.isArray(arr)) {
      arr.forEach((quota) => {
        const deptKey = (quota.department || "").toLowerCase();
        if (formatted[deptKey]) {
          formatted[deptKey] = {
            morning:
              quota?.shiftQuota?.morning !== undefined && quota?.shiftQuota?.morning !== null
                ? String(quota.shiftQuota.morning)
                : "",
            night:
              quota?.shiftQuota?.night !== undefined && quota?.shiftQuota?.night !== null
                ? String(quota.shiftQuota.night)
                : "",
          };
        }
      });
      setTempQuotas(formatted);
    }
  };

  // Update tempQuotas when quotaData in store changes
  useEffect(() => {
    if (quotaData && quotaData.length > 0) {
      updateTempFromArray(quotaData);
    }
  }, [quotaData]);

  const handleInputChange = (dept, shift, value) => {
    // Keep values as strings so input shows what user typed,
    // but sanitize non-number inputs to empty string.
    const sanitized = value === "" ? "" : String(value).replace(/[^\d]/g, "");
    setTempQuotas((prev) => ({
      ...prev,
      [dept]: {
        ...prev[dept],
        [shift]: sanitized,
      },
    }));
  };

  const handleSaveChanges = async (dept) => {
    // IMPORTANT: check for empty string explicitly so 0 is allowed
    const morning = tempQuotas[dept].morning;
    const night = tempQuotas[dept].night;

    if (morning === "" || night === "") {
      alert("Please enter both morning and night quotas");
      return;
    }

    setSavingDept(dept);
    try {
      // optimistic UI update (so input never appear blank)
      setTempQuotas((prev) => ({
        ...prev,
        [dept]: { morning: String(Number(morning)), night: String(Number(night)) },
      }));

      // dispatch createQuota — unwrap response if using RTK
      await dispatch(
        createQuota({
          department: dept,
          morning: Number(morning),
          night: Number(night),
        })
      ).unwrap?.();

      // Re-fetch latest from backend (ensures store + UI in sync)
      const refreshed = await dispatch(getAllQuotas()).unwrap?.();
      if (refreshed) updateTempFromArray(refreshed);

      setShowSuccessMessage(dept);
      setTimeout(() => setShowSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Save quota failed", err);
      alert("Failed to save quota. Try again.");
    } finally {
      setSavingDept(null);
    }
  };

  const handleResetAll = async () => {
    setShowResetAlert(false);
    try {
      await dispatch(resetAllQuotas()).unwrap?.();
      const refreshed = await dispatch(getAllQuotas()).unwrap?.();
      if (refreshed) updateTempFromArray(refreshed);
      setShowSuccessMessage("all");
      setTimeout(() => setShowSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Reset failed", err);
      alert("Failed to reset quotas. Try again.");
    }
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset All Quotas?</h3>
              <p className="text-gray-600 text-sm">
                Do you really want to reset the quota settings for all departments to their default values? This action cannot be undone.
              </p>
            </div>
            <button onClick={() => setShowResetAlert(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button onClick={() => setShowResetAlert(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleResetAll} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
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
        {dept === "all" ? "All quotas reset successfully!" : `${departments.find((d) => d.key === dept)?.name} saved successfully!`}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen p-2">
      {showResetAlert && <ResetAlert />}
      {showSuccessMessage && <SuccessMessage dept={showSuccessMessage} />}

      <div>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Quota Settings</h1>
          <p className="text-slate-400 text-sm md:text-base">Configure quota targets for each department and shift</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {departments.map(({ key, name }) => (
            <div key={key} className="bg-[#131415] rounded-xl shadow-lg border border-[var(--box-border)] overflow-hidden transition-all hover:shadow-xl">
              <div className="bg-[#131415] p-5">
                <h2 className="text-xl font-bold text-white">{name}</h2>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Morning Shift Quota</label>
                  <input
                    type="number"
                    value={tempQuotas[key]?.morning ?? ""}
                    onChange={(e) => handleInputChange(key, "morning", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-white font-medium bg-[#1a1b1e]"
                    min="0"
                    placeholder="Enter morning quota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Night Shift Quota</label>
                  <input
                    type="number"
                    value={tempQuotas[key]?.night ?? ""}
                    onChange={(e) => handleInputChange(key, "night", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-white font-medium bg-[#1a1b1e]"
                    min="0"
                    placeholder="Enter night quota"
                  />
                </div>

                <button
                  onClick={() => handleSaveChanges(key)}
                  disabled={savingDept === key}
                  className="w-full bg-blue-900 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingDept === key ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={() => setShowResetAlert(true)} className="bg-[#10131f] text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg">
            Reset All to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotaSetting;
