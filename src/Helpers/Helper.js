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
import {
  Antenna,
  BanknoteArrowUp,
  BarChart3,
  Blend,
  Building2,
  CalendarCheck2,
  ClipboardPlus,
  Columns3Cog,
  FileText,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  OctagonAlert,
  Proportions,
  Settings,
  User2,
  UserCheck,
  Users,
} from "lucide-react";

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
export const superAdminButtons = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/department", label: "Department", icon: ClipboardPlus },

  { to: "/dashboard/quotaSetting", label: "Quota Settings", icon: UserCheck },
  { to: "/dashboard/add", label: "Directory", icon: Columns3Cog },
  {
    to: "/dashboard/announcement",
    label: "Announcements",
    icon: BanknoteArrowUp,
  },
  { to: "/dashboard/report", label: "Reports", icon: Proportions },
  {
    to: "/dashboard/overallAttendance",
    label: "Overall Attendance",
    icon: Blend,
  },
  { to: "/dashboard/activityLogs", label: "Activity Logs", icon: Antenna },
];
export const AdminRoutes = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/department", label: "Department", icon: Building2 },
  { to: "/admin/quotaSetting", label: "Quota Settings", icon: Settings },
  { to: "/admin/directory", label: "Employee Directory", icon: Users },
  { to: "/admin/announcement", label: "Annoucement", icon: Megaphone },
  { to: "/admin/report", label: "Case Report", icon: FileText },
  {
    to: "/admin/overallAttendance",
    label: "Overall Attendence ",
    icon: CalendarCheck2,
  },
  { to: "/admin/login", label: "Login Credentails", icon: KeyRound },
];
export const CheckerButtons = [
  { to: "/checker", label: "Attendence", icon: UserCheck },
  { to: "/checker/alert", label: "Alert", icon: OctagonAlert },
];

export const TeamButtons = [
  { to: "/team", label: "Dashboard", icon: LayoutDashboard },
  { to: "/team/employeeDirectory", label: "Employee Directory", icon: Users },
  { to: "/team/restday", label: "Schedule & Rest day", icon: User2 },
  { to: "/team/non-quotamember", label: "Non-Quota Members", icon: FileText },
  {
    to: "/team/attendancerecords",
    label: "Attendance Records",
    icon: CalendarCheck2,
  },
  { to: "/team/Performance", label: "Team Performance", icon: KeyRound },
];

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
    title: "CSR Upload progress",
    value: "14k",
    interval: "Last 30 days",
    trend: "up",
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340,
      380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
  {
    title: "Withdraw Progress",
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
    title: "Deposit Progress",
    value: "200k",
    interval: "Last 30 days",
    trend: "neutral",
    data: [
      500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510,
      530, 520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
    ],
  },
  {
    title: "Overall Performance",
    value: "23k",
    interval: "Last 30 days",
    trend: "up",
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340,
      380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
];
export const LeaderStats = [
  {
    title: "This Week",
    value: "+12% ↑",
    trend: "up",
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340,
      380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
  {
    title: "This Month",
    value: "+8.5% ↑",
    trend: "up",
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340,
      380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
  {
    title: "Efficiency",
    value: "-2.3% ↓",
    trend: "down",
    data: [
      1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600,
      820, 780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300,
      220,
    ],
  },
  {
    title: "CSAT Score",
    value: "+5.2% ↑",
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

export const weeklyData = {
  summary: {
    daysPresent: 5,
    hoursWorked: "43h 30m",
    breaks: "6h 15m",
    attendance: "95%",
  },
  records: [
    {
      date: "Mon, Oct 14, 2025",
      punchIn: "08:00 AM",
      breaks: "1h 00m",
      punchOut: "05:00 PM",
      totalHours: "8h 00m",
      status: "Normal",
    },
    {
      date: "Tue, Oct 15, 2025",
      punchIn: "08:05 AM",
      breaks: "1h 15m",
      punchOut: "05:10 PM",
      totalHours: "7h 50m",
      status: "Overbreak",
    },
    {
      date: "Wed, Oct 16, 2025",
      punchIn: "--",
      breaks: "1h 00m",
      punchOut: "05:00 PM",
      totalHours: "--",
      status: "Missed Punch In",
    },
    {
      date: "Thu, Oct 17, 2025",
      punchIn: "08:00 AM",
      breaks: "1h 00m",
      punchOut: "--",
      totalHours: "--",
      status: "Missed Punch Out",
    },
    {
      date: "Fri, Oct 18, 2025",
      punchIn: "--",
      breaks: "--",
      punchOut: "--",
      totalHours: "--",
      status: "Absent",
    },
  ],
};

export const monthlyData = {
  summary: {
    daysPresent: 22,
    hoursWorked: "176h 45m",
    breaks: "24h 30m",
    attendance: "92%",
  },
  records: [
    {
      date: "Week 1 (Oct 1-7)",
      punchIn: "Avg: 08:02 AM",
      breaks: "7h 30m",
      punchOut: "Avg: 05:05 PM",
      totalHours: "40h 15m",
      status: "Normal",
    },
    {
      date: "Week 2 (Oct 8-14)",
      punchIn: "Avg: 08:00 AM",
      breaks: "6h 00m",
      punchOut: "Avg: 05:00 PM",
      totalHours: "43h 00m",
      status: "Normal",
    },
    {
      date: "Week 3 (Oct 15-21)",
      punchIn: "Avg: 08:03 AM",
      breaks: "5h 45m",
      punchOut: "Avg: 05:02 PM",
      totalHours: "41h 30m",
      status: "Normal",
    },
    {
      date: "Week 4 (Oct 22-28)",
      punchIn: "Avg: 08:01 AM",
      breaks: "5h 15m",
      punchOut: "Avg: 05:01 PM",
      totalHours: "42h 00m",
      status: "Normal",
    },
    {
      date: "Week 5 (Oct 29-31)",
      punchIn: "Avg: 08:00 AM",
      breaks: "--",
      punchOut: "Avg: 05:00 PM",
      totalHours: "10h 00m",
      status: "Partial",
    },
  ],
};

export const overallAttendance = {
  presentToday: 142,
  absentToday: 8,
  lateArrivals: 5,
  onLeave: 3,
  attendanceRate: "95%",
};
