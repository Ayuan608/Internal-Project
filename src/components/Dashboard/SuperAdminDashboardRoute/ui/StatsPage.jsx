import React, { useState } from "react";

const StatsPage = () => {
  const [activeTab, setActiveTab] = useState("Daily");
  return (
    <div className="flex gap-2 mb-6 bg-[#f5f6fa09] max-w-[255px] p-1 rounded-full">
      {["CSR", "WithDraw", "Deposit"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === tab
              ? "bg-[#d9d9d935] rounded-full text-white"
              : "bg-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default StatsPage;
