import React, { useState } from "react";
import { Card, CardContent, LinearProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsIcon from "@mui/icons-material/Settings";
import { Button } from "../../components/CommonButton/Button";
import { ExternalLink, Plus, Zap } from "lucide-react";

export default function OpsTasks() {
  const regions = [
    { name: "APAC", open: 2, high: 1, blocked: 0, percent: 50 },
    { name: "EMEA", open: 2, high: 1, blocked: 1, percent: 25 },
    { name: "AMER", open: 1, high: 1, blocked: 0, percent: 25 },
  ];
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = [
    "Overview",
    "Campaigns",
    "Task Board",
    "SLA",
    "Escalations",
    "Settings",
  ];

  return (
    <div className="min-h-screen  text-white p-6 space-y-6">
      {/* === Top Bar === */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Button label={"New Campaign"} Icon={Plus} />
          <Button label={"New Task"} Icon={Plus} />
          <Button label={"Run Escalation Check"} />
        </div>

        <div className="flex items-center gap-3">
          <Button label={"Export"} Icon={ExternalLink} />
          <Button label={"Skill routing ON"} Icon={Zap} />
        </div>
      </div>

      {/* === Metrics Summary === */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { title: "Pipeline Value", value: 2, desc: "Running" },
          { title: "Open Tasks", value: 4, desc: "Todo: 2 / In Progress: 1" },
          { title: "SLA Compliance", value: "0%", desc: "+0%" },
          { title: "Overdue / Escalated", value: 0, desc: "5 Escalations" },
        ].map((card, i) => (
          <Card
            key={i}
            sx={{
              backgroundColor: "#10131f",
              border: "1px solid #334155",
              color: "white",
            }}
          >
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">{card.title}</p>
                  <p className="text-3xl font-semibold">{card.value}</p>
                </div>
                <div>
                  <Button label={card.desc} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* === Tabs === */}
      <div className="flex gap-4 bg-[#10131f] px-5 pt-3 rounded-[36px] pb-2 text-gray-400 justify-between">
        {tabs.map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm cursor-pointer transition-all duration-200 ${
              activeTab === tab
                ? "text-white"
                : "hover:text-gray-200"
            }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* === Workload + SLA === */}
      <div className="grid grid-cols-2 gap-4">
        {/* Workload Balance by Team */}
        <Card
          sx={{
            backgroundColor: "#10121f",
            border: "1px solid #334155",
            color: "white",
          }}
        >
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">
              Workload Balance By Team
            </p>
            <div className="grid grid-cols-3 gap-3">
              {regions.map((r, i) => (
                <div
                  key={i}
                  className="rounded-lg p-3 bg-slate-800 border border-slate-700"
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-sm">{r.name}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        r.open > 1 ? "bg-red-500/30" : "bg-green-500/30"
                      }`}
                    >
                      {r.open} open
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">
                    High: {r.high} | Blocked: {r.blocked}
                  </p>
                  <LinearProgress
                    variant="determinate"
                    value={r.percent}
                    sx={{
                      height: 6,
                      borderRadius: 2,
                      backgroundColor: "#334155",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: r.open > 1 ? "#f87171" : "#22c55e",
                      },
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SLA Summary */}
        <Card
          sx={{
            gridColumn: "span 1",
            backgroundColor: "#10131f",
            border: "1px solid #334155",
            color: "white",
          }}
        >
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">SLA Targets Summary</p>
            <div className="grid grid-cols-2 gap-6">
              {[
                {
                  label: "Avg Response Target",
                  value: "20 mins",
                  percent: 80,
                },
                {
                  label: "Avg Resolution Target",
                  value: "15 hrs",
                  percent: 60,
                },
              ].map((sla, i) => (
                <div key={i}>
                  <p className="text-sm text-gray-300 mb-1">{sla.label}</p>
                  <p className="text-2xl font-semibold">{sla.value}</p>
                  <LinearProgress
                    variant="determinate"
                    value={sla.percent}
                    sx={{
                      height: 8,
                      borderRadius: 2,
                      backgroundColor: "#334155",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#3b82f6",
                      },
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* === Recent Activity + Risk Alerts === */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Activity */}
        <Card
          sx={{
            gridColumn: "span 2",
            backgroundColor: "#10131f",
            border: "1px solid #334155",
            color: "white",
          }}
        >
          <CardContent>
            <p className="text-sm text-gray-400 mb-3">Recent Activity</p>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                2025-10-09 10:27:23 —{" "}
                <span className="text-white">Auto-escalation disabled</span>
              </p>
              <p>
                2025-10-09 10:23:43 —{" "}
                <span className="text-white">Data saved to local storage</span>
              </p>
              <p>
                2025-10-09 08:28:18 —{" "}
                <span className="text-white">
                  Resolution created for VIP coverage
                </span>
              </p>
              <p>
                2025-10-09 08:28:19 —{" "}
                <span className="text-white">Escalation #2 overdue</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Risk & Alerts */}
        <Card
          sx={{
            backgroundColor: "#10131f",
            border: "1px solid #334155",
            color: "white",
          }}
        >
          <CardContent>
            <p className="text-sm text-gray-400 mb-3">Risk & Alerts</p>
            <div className="space-y-2 text-sm">
              <div className="border border-blue-500/40 text-blue-300 rounded-md px-3 py-1">
                Auto-check every 60s
              </div>
              <div className="border border-amber-400/40 text-amber-300 rounded-md px-3 py-1">
                SLA below 90%
              </div>
              <div className="border border-red-500/40 text-red-300 rounded-md px-3 py-1">
                1 overdue task
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
