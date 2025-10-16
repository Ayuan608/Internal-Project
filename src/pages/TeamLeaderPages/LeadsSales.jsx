import React from "react";
import { LinearProgress } from "@mui/material";
import { Plus, Search } from "lucide-react";
import { DollarIcon, GreenDollarIcon, StatsIcon } from "../../Helpers/Icons";
import LeadCard from "../../components/Dashboard/SuperAdminDashboardRoute/LeadCards";

const LeadsSales = () => {
  const metrics = [
    {
      title: "Pipeline",
      subtitle: "4 open deals",
      value: "$102,000",
      color: "bg-[#0f172a]",
      Icon: DollarIcon,
      border: "border-blue-500",
      bg: "#0092B7",
    },
    {
      title: "Weighted",
      subtitle: "Base",
      value: "$58,940",
      color: "bg-[#0f172a]",
      Icon: StatsIcon,
      border: "border-purple-500",
      bg: "#4F39F6",
    },
    {
      title: "Commit",
      subtitle: ">=70%",
      value: "$37,440",
      color: "bg-[#0f172a]",
      Icon: GreenDollarIcon,
      border: "border-green-500",
      bg: "#009867",
    },
    {
      title: "Best Case",
      subtitle: "Incl. stretch",
      value: "$58,940",
      color: "bg-[#0f172a]",
      Icon: StatsIcon,
      border: "border-violet-500",
      bg: "#8122FC",
    },
    {
      title: "Avg Prob",
      subtitle: "Weighted",
      value: "43%",
      color: "bg-[#0f172a]",
      Icon: GreenDollarIcon,
      border: "border-orange-500",
      bg: "#E37101",
    },
    {
      title: "Seats",
      subtitle: "Weighted",
      value: "21",
      color: "bg-[#0f172a]",
      Icon: StatsIcon,
      border: "border-sky-500",
      bg: "#324158",
    },
  ];

  const stages = [
    {
      name: "Lead",
      deals: [
        {
          client: "Tripster",
          region: "APAC · Travel",
          sum: "$8,000",
          date: "2015-11-30",
          seats: "4 seats",
          progress: 10,
          nextStep: "Quality budget",
          color: "blue",
        },
      ],
    },
    {
      name: "Qualified",
      deals: [
        {
          client: "XYZ Ltd",
          region: "EMEA · E-commerce",
          sum: "$12,000",
          date: "2015-10-28",
          seats: "6 seats",
          progress: 35,
          nextStep: "Confirm requirements doc",
          color: "teal",
        },
      ],
    },
    {
      name: "Proposal",
      deals: [
        {
          client: "ABC Corp",
          region: "APAC · FinTech",
          sum: "$30,000",
          date: "2015-11-10",
          seats: "10 seats",
          progress: 55,
          nextStep: "Send pricing revision",
          color: "violet",
        },
      ],
    },
    {
      name: "Negotiation",
      deals: [
        {
          client: "MediPlus",
          region: "AMER · Healthcare",
          sum: "$52,000",
          date: "2015-11-05",
          seats: "18 seats",
          progress: 72,
          nextStep: "Legal review",
          color: "amber",
        },
      ],
    },
    { name: "Closed Won", deals: [] },
    { name: "Closed Lost", deals: [] },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e19] text-white p-6 overflow-auto">
      {/* === Top Filters & Search === */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="bg-[#10131f] text-gray-300 px-4 py-2 rounded-xl w-full sm:w-80 border border-slate-700 focus:outline-none flex items-center gap-3">
          <span>
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search account, owner..."
            className=""
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            "Select Region",
            "Search Owner",
            "Select Vertical",
            "Select Stage",
          ].map((label) => (
            <select
              key={label}
              className="bg-[#10131f] text-gray-300 px-3 py-2 rounded-lg border border-slate-700 text-sm outline-none cursor-pointer"
            >
              <option>{label}</option>
            </select>
          ))}
          <div className="flex gap-3 ml-3 bg-[#10131f] rounded-[36px]">
            <button className="hover:bg-slate-700 px-4 py-2 text-sm rounded-[36px] cursor-pointer">
              Forecast
            </button>
            <button className="hover:bg-slate-700 px-4 py-2 rounded-[36px] text-sm cursor-pointer">
              Kanban
            </button>
          </div>
          <button className="bg-[#3B82F6] px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3">
            <span>
              <Plus size={18} />
            </span>{" "}
            New Deal
          </button>
        </div>
      </div>

      {/* === Top Summary Metrics === */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {metrics.map((m, i) => (
          <div>
            <div style={{ backgroundColor: m.bg }} className={`rounded-t-xl`}>
              <h3 className="text-sm text-white px-3 py-2">{m.title}</h3>
            </div>
            <div className="bg-[#10131f] p-3">
              <div className="flex justify-between items-center">
                {m.Icon && <m.Icon className="text-5xl" />}
                <p className="text-xs text-gray-500">{m.subtitle}</p>
              </div>
              <p className="text-2xl font-semibold mt-3">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* === Sales Pipeline Stages === */}
      <h2 className="text-lg font-semibold mb-3 text-gray-300">
        Sales Pipeline Stages
      </h2>
      <div className="flex overflow-x-auto gap-4 pb-4">
        <LeadCard />
      </div>
    </div>
  );
};

export default LeadsSales;
