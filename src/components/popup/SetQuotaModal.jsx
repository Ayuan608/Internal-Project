import { useEffect, useRef, useState } from "react";
import { X, ArrowUp, ArrowDown } from "lucide-react";

const SetQuotaModal = ({ isOpen, onClose, onSave }) => {
  const modalRef = useRef(null);

  const [quotas, setQuotas] = useState({
    twelveHours: 1500,
    nineHours: 1000,
  });

  const handleChange = (e, key) => {
    const value = parseInt(e.target.value, 10) || 0;
    setQuotas((prev) => ({ ...prev, [key]: value }));
  };

  const handleIncrement = (key) => {
    setQuotas((prev) => ({ ...prev, [key]: prev[key] + 100 }));
  };

  const handleDecrement = (key) => {
    setQuotas((prev) => ({ ...prev, [key]: Math.max(0, prev[key] - 100) }));
  };

  const handleSubmit = () => {
    onSave(quotas);
    onClose();
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-[#ffffff0d] backdrop-blur-md border border-gray-700 text-white w-full max-w-sm rounded-lg p-6 relative shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Set Quota</h2>

        <div className="text-center text-md font-semibold mb-4 tracking-wide">
          GENERAL
        </div>

        {/* 12 Hours */}
        <div className="flex items-center justify-between mb-4">
          <span className="tracking-widest text-sm">12 HOURS</span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={quotas.twelveHours}
              onChange={(e) => handleChange(e, "twelveHours")}
              className="w-24 bg-black text-white text-center font-mono border border-gray-600 rounded px-2 py-1"
            />
            <div className="flex flex-col space-y-1">
              <button onClick={() => handleIncrement("twelveHours")}>
                <ArrowUp size={14} />
              </button>
              <button onClick={() => handleDecrement("twelveHours")}>
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* 9 Hours */}
        <div className="flex items-center justify-between mb-6">
          <span className="tracking-widest text-sm">9 HOURS</span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={quotas.nineHours}
              onChange={(e) => handleChange(e, "nineHours")}
              className="w-24 bg-black text-white text-center font-mono border border-gray-600 rounded px-2 py-1"
            />
            <div className="flex flex-col space-y-1">
              <button onClick={() => handleIncrement("nineHours")}>
                <ArrowUp size={14} />
              </button>
              <button onClick={() => handleDecrement("nineHours")}>
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-white text-black font-semibold px-4 py-2 rounded w-full"
        >
          Save Quota
        </button>
      </div>
    </div>
  );
};

export default SetQuotaModal;
