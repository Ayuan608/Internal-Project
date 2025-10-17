
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { BanknoteArrowDown, BanknoteArrowUp, ClipboardPlus, Columns3Cog, LayoutDashboard, Megaphone, OctagonAlert, User2, UserCheck } from "lucide-react";

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);
export const userData = {
  labels: ["QUOTA", "NON-QUOTA"],
  datasets: [
    {
      label: "Toatal Usage",
      data: [62.32, 76],
      backgroundColor: ["#615fff", "#00A6B4"],
      borderColor: ["#615fff", "#00A6B4"],
      borderWidth: 1,
    },
  ],
};
export const lineData = {
  labels: ["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"],
  datasets: [
    {
      label: "Morning Shift",
      data: [3, 4, 6, 5, 6, 7, 8],
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
      tension: 0.4,
    },
    {
      label: "Night Shift",
      data: [4, 5, 7, 6, 7],
      borderColor: "#999",
      tension: 0.4,
    },
  ],
};
export const lineOptions = {
  plugins: {
    legend: {
      labels: {
        color: "#fff",
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#fff" },
    },
    y: {
      ticks: { color: "#fff" },
    },
  },
};
export const columns = [
  { field: "date", headerName: "DATE", width: 120 },
  { field: "name", headerName: "NAME", width: 150 },
  { field: "role", headerName: "ROLE", width: 150 },
  { field: "department", headerName: "DEPARTMENT", width: 150 },
  { field: "output", headerName: "OUTPUT", width: 100 },
  { field: "target", headerName: "TARGET QUOTA", width: 150 },
  { field: "variance", headerName: "VARIANCE", width: 100 },
];
export const rows = [
  {
    id: 1,
    date: "2025-10-08",
    name: "Ankit",
    role: "CSR",
    department: "Customer Support",
    output: 1450,
    target: 1500,
    variance: -50,
  },
  {
    id: 2,
    date: "2025-10-08",
    name: "Riya",
    role: "Analyst",
    department: "Withdrawals",
    output: 900,
    target: 900,
    variance: 0,
  },
  {
    id: 3,
    date: "2025-10-08",
    name: "Shyam",
    role: "Officer",
    department: "Deposits",
    output: 430,
    target: 450,
    variance: -20,
  },
];

export const superAdminButtons = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/report", label: "Reports", icon: ClipboardPlus },
  { to: "/dashboard/add", label: "Add Emp.", icon: User2 },
  { to: "/dashboard", label: "Attendance", icon: UserCheck },
  { to: "/dashboard/data", label: "CSR Dashboards", icon: Columns3Cog },
  { to: "/dashboard", label: "Deposit Dashboards", icon: BanknoteArrowUp },
  { to: "/dashboard", label: "Withdrawal ", icon: BanknoteArrowDown },

];
export const CheckerButtons = [
  { to: "/checker", label: "Attendence", icon: UserCheck },
  { to: "/checker/alert", label: "Alert", icon: OctagonAlert },

];

export const leadData = [
  {
    stage: "Lead",
    sum: "$8,000",
    weighted: "$800",
    client: "Tripster",
    region: "APAC",
    industry: "Travel",
    amount: "$8,000",
    seats: 4,
    date: "2015-11-30",
    progress: 10,
    nextStep: "Qualify budget",
  },
  {
    stage: "Lead",
    sum: "$12,500",
    weighted: "$1,250",
    client: "Orbit Corp",
    region: "EMEA",
    industry: "Finance",
    amount: "$12,500",
    seats: 6,
    date: "2016-01-12",
    progress: 20,
    nextStep: "Intro meeting",
  },
  {
    stage: "Lead",
    sum: "$5,000",
    weighted: "$500",
    client: "Nexa Labs",
    region: "US",
    industry: "Tech",
    amount: "$5,000",
    seats: 3,
    date: "2016-05-22",
    progress: 30,
    nextStep: "Demo scheduled",
  },
  {
    stage: "Lead",
    sum: "$9,000",
    weighted: "$900",
    client: "GeoSoft",
    region: "APAC",
    industry: "SaaS",
    amount: "$9,000",
    seats: 5,
    date: "2017-03-17",
    progress: 40,
    nextStep: "Decision pending",
  },
];

export const TeamStats = [
  {
    title: "Users",
    value: "14k",
    interval: "Last 30 days",
    trend: "up",
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340,
      380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
  {
    title: "Conversions",
    value: "325",
    interval: "Last 30 days",
    trend: "down",
    data: [
      1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600,
      820, 780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300,
      220,
    ],
  },
  {
    title: "Event count",
    value: "200k",
    interval: "Last 30 days",
    trend: "neutral",
    data: [
      500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510,
      530, 520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
    ],
  },
  {
    title: "Super Admin",
    value: "23k",
    interval: "Last 30 days",
    trend: "up",
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340,
      380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
];
export const UserStats = [
  {
    title: "Users",
    value: "12k",
    interval: "Last 30 days",
    trend: "up",
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340,
      380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
  {
    title: "Conversions",
    value: "35",
    interval: "Last 30 days",
    trend: "down",
    data: [
      1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600,
      820, 780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300,
      220,
    ],
  },
  {
    title: "Event count",
    value: "50k",
    interval: "Last 30 days",
    trend: "neutral",
    data: [
      500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510,
      530, 520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
    ],
  },
  {
    title: "Super Admin",
    value: "20k",
    interval: "Last 30 days",
    trend: "up",
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340,
      380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
];
