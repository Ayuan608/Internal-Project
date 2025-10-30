import React, { useState } from "react";

const QuotaManagement = () => {
  const [currentValue, setCurrentValue] = useState(1000);
  const minValue = 1000;
  const maxValue = 2000;

  const handleSliderChange = (e) => {
    setCurrentValue(parseInt(e.target.value));
  };

  const calculateProgress = () => {
    return ((currentValue - minValue) / (maxValue - minValue)) * 100;
  };

  return (
    <div className="w-full my-5 px-2 bg-[rgba(59,130,246,0.03)] rounded-lg shadow-lg  p-1">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white mb-6 mt-3">
        ⚙️ Quota Management
      </h1>

      {/* Shift Sections */}
      <div className="space-x-4 mb-8 grid grid-cols-2">
        {/* 9-Hour Shift */}
        <div className="p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-white">9-Hour Shift</span>
            <span className="text-sm text-gray-500">Auto</span>
          </div>
          <div className="text-lg font-bold text-[#3B82F6]">
            1000 conversations
          </div>
        </div>

        {/* 12-Hour Shift */}
        <div className="p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-white">12-Hour Shift</span>
            <span className="text-sm text-gray-500">Auto</span>
          </div>
          <div className="text-lg font-bold text-[#3B82F6]">
            1500 conversations
          </div>
        </div>
      </div>

      <div className=" pt-6">
        {/* Manual Adjustment Header */}
        <h2 className="text-xl font-semibold text-white mb-4">
          Manual Adjustment
        </h2>

        {/* Min/Max Labels */}
        <div className="flex justify-between text-sm text-white mb-2">
          <span>Min: {minValue}</span>
          <span>Max: {maxValue}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-[#3B82F6] h-4 rounded-full transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>

        {/* Current Value Display */}
        <div className="text-center mb-4">
          <span className="text-3xl font-bold text-white">
            {currentValue}
          </span>
          <span className="text-sm text-white ml-2">conversations</span>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={minValue}
          max={maxValue}
          value={currentValue}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mb-3"
        />

        {/* Slider Styles */}
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #2563eb;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #2563eb;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    </div>
  );
};

export default QuotaManagement;
