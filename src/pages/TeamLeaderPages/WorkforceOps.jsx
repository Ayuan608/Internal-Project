import React, { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  TextField,
  Avatar,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsIcon from "@mui/icons-material/Settings";

export default function WorkforceOps() {
  const [agents] = useState([
    {
      id: "CC-001",
      name: "Joy Santos",
      client: "Client B",
      role: "CSR (General Support)",
      shift: "Morning",
      status: "Online",
      skill: 92,
    },
    {
      id: "CC-002",
      name: "Sam Lee",
      client: "Client A",
      role: "Sales (Inbound)",
      shift: "Night",
      status: "Break",
      skill: 87,
    },
    {
      id: "CC-003",
      name: "Ava",
      client: "Client A",
      role: "Quality Analyst (QA)",
      shift: "Morning",
      status: "Offline",
      skill: 79,
    },
    {
      id: "CC-004",
      name: "David Chan",
      client: "Client B",
      role: "Technical Support",
      shift: "Mid",
      status: "WC",
      skill: 85,
    },
    {
      id: "CC-005",
      name: "Chloe Smith",
      client: "Client B",
      role: "Back Office",
      shift: "Morning",
      status: "Idle",
      skill: 88,
    },
  ]);

  const statusColors = {
    Online: "bg-[#51F63B]",
    Break: "bg-yellow-500/80",
    Offline: "bg-red-500/80",
    WC: "bg-blue-500/80",
    Idle: "bg-gray-400/80",
  };

  const statusTextColors = {
    Online: "text-[#51F63B]",
    Break: "text-yellow-600",
    Offline: "text-red-600",
    WC: "text-blue-600",
    Idle: "text-gray-600",
  };

  const roleColors = {
    "CSR (General Support)": "bg-[#21A366]/12 text-[#2FC27D]",
    "Sales (Inbound)": "bg-[#3B82F6]/12 text-[#3B82F6]",
    "Quality Analyst (QA)": "bg-[#FBBF24]/12 text-[#FBBF24]",
    "Technical Support": "bg-[#CA3BF6]/12 text-[#CA3BF6]",
    "Back Office": "bg-gray-700 text-gray-300",
  };

  const shiftColors = {
    Morning: "bg-[#64B5F6]/12 text-[#64B5F6]",
    Night: "bg-[#CA3BF6]/12 text-[#CA3BF6]",
    Mid: "bg-[#F59E0B]/12 text-[#F59E0B]",
  };

  const tabs = [
    "Seat Management",
    "Workforce Scheduling",
    "Real-Time Availability",
    "Skill-Based Routing",
    "Agent Substitution",
    "Self-Tests",
  ];

  const [activeTab, setActiveTab] = useState("Seat Management");

  return (
    <div className="min-h-screen  text-white p-6 space-y-6 w-full">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-3 text-gray-400" />
            <TextField
              variant="outlined"
              placeholder="Search account, owner..."
              size="small"
              className="pl-9 w-80"
              InputProps={{
                style: {
                  backgroundColor: "#1e293b",
                  color: "white",
                  borderRadius: "8px",
                },
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{
              color: "white",
              borderColor: "#334155",
              backgroundColor: "#1e293b",
            }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            sx={{
              color: "white",
              borderColor: "#334155",
              backgroundColor: "#1e293b",
            }}
          >
            Skill routing ON
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        {[
          {
            title: "Total Agents",
            value: 5,
            desc: "Across all clients",
            backgroundColor: "#2FC27D",
          },
          {
            title: "Online",
            value: 1,
            desc: "Active right now",
            backgroundColor: "#51F63B",
          },
          {
            title: "On Break",
            value: 1,
            desc: "Short breaks",
            backgroundColor: "#311F1B",
          },
          {
            title: "WC/IDLE",
            value: 2,
            desc: "Temporarily inactive",
            backgroundColor: "#082743",
          },
          {
            title: "Offline",
            value: 1,
            desc: "Not on shift",
            backgroundColor: "#33102E",
          },
        ].map((card, i) => (
          <Card
            key={i}
            sx={{
              backgroundColor: card.backgroundColor,
              border: "1px solid #334155",
              color: "white",
            }}
          >
            <CardContent>
              <p className="text-sm text-white">{card.title}</p>
              <p className="text-3xl font-semibold">{card.value}</p>
              <p className="text-xs text-white">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 bg-[#10131f] rounded-[36px] justify-between  text-gray-400">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm py-2 rounded-[36px]  px-4 cursor-pointer ${
              activeTab === tab ? "bg-slate-800 text-white" : ""
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Seat Management Table */}
      <div className=" rounded-xl p-4 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-semibold">Seat Management</p>
          <div className="flex gap-3 items-center">
            <p className="text-gray-400 text-sm">
              Auto-Refresh: <span className="text-white">10s</span>
            </p>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{
                color: "white",
                borderColor: "#334155",
                backgroundColor: "#10131f",
              }}
            >
              Export Report
            </Button>
            <button className="bg-[#3B82F6] px-4 py-1 rounded-[8px]">
              Assign Agent
            </button>
          </div>
        </div>

        <table className="w-full text-sm text-gray-300">
          <thead className="text-left border-b border-slate-700 text-gray-400">
            <tr>
              <th className="py-2">ID</th>
              <th>Agent</th>
              <th>Client</th>
              <th>Role</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Skill Score</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id} className="border-b border-slate-700/60">
                <td className="py-2">{a.id}</td>
                <td className="flex items-center gap-2 py-2">
                  <Avatar
                    alt={a.name}
                    src={`https://ui-avatars.com/api/?name=${a.name}`}
                    sx={{ width: 28, height: 28 }}
                  />
                  {a.name}
                </td>
                <td>{a.client}</td>

                <td className={`py-3 rounded`}>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      roleColors[a.role] || "bg-gray-600 text-gray-300"
                    }`}
                  >
                    {a.role}
                  </span>
                </td>

                {/* Shift with color */}
                <td className={` py-3`}>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      shiftColors[a.shift] || "bg-gray-600 text-gray-300"
                    }`}
                  >
                    {a.shift}
                  </span>
                </td>

                {/* Status with colored dot */}
                <td className="py-3 flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      statusColors[a.status] || "bg-gray-500"
                    }`}
                  ></span>
                  <span
                    className={`${
                      statusTextColors[a.status] || "text-gray-500"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>

                {/* Skill score progress bar */}
                <td className=" py-3 w-48">
                  <div className="bg-gray-700 rounded h-3 overflow-hidden relative">
                    <div
                      className="bg-green-500 h-3"
                      style={{ width: `${a.skill}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 text-left mt-1">
                    {a.skill}%
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 flex gap-3 justify-end">
                  <button className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
                    <span>🔄</span> Swap
                  </button>
                  <button className="text-red-500 hover:text-red-400 flex items-center gap-1">
                    <span>✖</span> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
