import { Plus, Search } from "lucide-react";
import React, { useState } from "react";
import MetaData from "../../more/MetaData";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

import TeamQuotaTable from "../TeamQuotaTable";
import Csr from "../../pages/Csr";
import Deposit from "../../pages/Deposit";
import Withdraw from "../../pages/Withdraw";
import { useSelector } from "react-redux";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);
function Data() {
  const { role } = useSelector((state) => state.auth);
  const [data, setData] = useState("CSR");
  return (
    <div className="min-h-[92.7vh] pt-2 flex flex-col gap-6 text-white max-w-screen">
      <MetaData title="Team Leader Dashboard - User Management" />

      {/* Header and Filters */}
      <div className="overflow-x-auto rounded-xl shadow-2xl px-4 py-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Overall Data</h1>
        </div>

        <div className="flex items-center justify-end gap-4 w-full max-w-sm">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Data..."
              className="bg-[#f5f6fa13] text-white rounded-full pl-9 pr-3 py-3 w-full text-sm focus:outline-none placeholder:text-white"
            />
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-white" />
          </div>
        </div>
      </div>
      <div className=" flex gap-2 mb-1 bg-[#f5f6fa09]  max-w-[280px] p-1 rounded-full">
        {["CSR", "DEPOSIT", "WITHDRAW"].map((tab) => (
          <button
            key={tab}
            onClick={() => setData(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${data === tab
              ? "bg-[#d9d9d935] rounded-full text-white"
              : "bg-transparent text-gray-400 hover:text-gray-300"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {role !== "User" && (

        <div className="">
          {data === "CSR" && <Csr />}
          {data === "DEPOSIT" && <Deposit />}
          {data === "WITHDRAW" && <Withdraw />}
        </div>
      )}

      <TeamQuotaTable />
    </div>
  );
}

export default Data;
