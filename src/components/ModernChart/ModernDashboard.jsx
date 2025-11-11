import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, RefreshCw, MessageCircle, Target, Activity, DollarSign, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Users, AlertTriangle } from 'lucide-react';
import { SparklineStatCard } from './SparklineStatCard';
import { PerformanceTrendCard } from './PerformanceTrendCard';
import { CircularProgress } from './CircularProgress';
import { CollapsibleDepartment } from './CollapsibleDepartment';

const ModernDashboard = () => {
  const [comparisonMode, setComparisonMode] = useState('yesterday');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [expandedDept, setExpandedDept] = useState({ csr: true, deposit: true, withdrawal: true });
  const [dateRange, setDateRange] = useState({ start: '2025-10-01', end: '2025-11-07' });

  // --- Helper functions ---
  const toSeconds = (t) => {
    const [h, m, s] = t.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  };

  const fromSecondsHM = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Avg Online Hours
  const onlineSessionList = [
    '10:40:41', '10:47:00', '10:35:25', '10:45:59', '10:31:00', '10:49:19', '10:33:37', '10:41:46', '10:51:00', '10:37:57',
    '00:00:00', '00:00:00', '11:55:45'
  ];
  const avgOnlineSeconds = Math.floor(onlineSessionList.reduce((a, t) => a + toSeconds(t), 0) / onlineSessionList.length);
  const avgOnlineHM = fromSecondsHM(avgOnlineSeconds);

  // Negative Rate Avg
  const negativeRates = [71.43, 50.0, 0.0, 55.4, 64.44, 0.0, 100.0, 59.15, 55.56, 0.0, 46.67, 0.0, 37.5, 52.63];
  const avgNegativeRate = (negativeRates.reduce((a, b) => a + b, 0) / negativeRates.length).toFixed(2);

  // Department stats
  const departmentStats = [
    { name: 'CSR', quota: 87.1 },
    { name: 'Deposit', quota: 17.65 },
    { name: 'Withdrawal', quota: 100 }
  ];

  // Staff per shift data
  const staffPerShift = {
    csr: { morning: 24, night: 12 },
    deposit: { morning: 10, night: 5 },
    withdrawal: { morning: 12, night: 6 },
  };

  const performanceTrendData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    CSR: 75 + Math.random() * 20,
    Deposit: 60 + Math.random() * 25,
    Withdrawal: 85 + Math.random() * 15
  }));

  // UI base
  const GlassCard = ({ children, className = '' }) => (
    <div className={`backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );

  // Date helpers & compare label
  const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const startOfPrevMonth = (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1);
  const endOfPrevMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 0);
  const computeCompareLabel = () => {
    const today = new Date();
    if (comparisonMode === 'yesterday') {
      const y = new Date(today); y.setDate(today.getDate() - 1);
      return `vs Yesterday (${formatDate(y)})`;
    }
    if (comparisonMode === 'lastWeek') {
      const end = new Date(today); end.setDate(today.getDate() - 1);
      const start = new Date(today); start.setDate(today.getDate() - 7);
      return `vs Last Week (${formatDate(start)} – ${formatDate(end)})`;
    }
    if (comparisonMode === 'lastMonth') {
      const start = startOfPrevMonth(today); const end = endOfPrevMonth(today);
      return `vs Last Month (${formatDate(start)} – ${formatDate(end)})`;
    }
    return `vs Custom (${dateRange.start} – ${dateRange.end})`;
  };

  const CompareBadge = ({ isPositive, change }) => (
    <div className="relative group inline-block">
      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span className="text-xs font-bold">{change}</span>
      </div>
      <div className="absolute top-full mt-1 left-0 z-50 hidden group-hover:block whitespace-nowrap px-2 py-1 rounded-md text-[11px] bg-black/80 text-white border border-white/10 shadow-lg pointer-events-none">
        {computeCompareLabel()}
      </div>
    </div>
  );

  const AnimatedMetricCard = ({ title, value, change, icon: Icon, color }) => {
    const isPositive = String(change).trim().startsWith('+');
    return (
      <GlassCard className="p-6 group hover:scale-105 transition-transform duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon size={24} className="text-white" />
          </div>
          <CompareBadge isPositive={isPositive} change={change} />
        </div>
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm text-gray-400">{title}</p>
      </GlassCard>
    );
  };


  const csrMetrics = [
    { title: 'Completed', value: '850', change: '+12.5%', icon: CheckCircle, color: 'from-blue-500 to-cyan-500' },
    { title: 'Effective', value: '720', change: '+8.3%', icon: Target, color: 'from-purple-500 to-pink-500' },
    { title: 'Messages', value: '3.2K', change: '+15.7%', icon: MessageCircle, color: 'from-green-500 to-emerald-500' },
    { title: 'Missed', value: '45', change: '-5.2%', icon: XCircle, color: 'from-red-500 to-orange-500' },
    { title: 'Avg Online', value: avgOnlineHM, change: '+3.8%', icon: Clock, color: 'from-yellow-500 to-orange-500' },
    { title: 'Positive', value: '94.5%', change: '+2.4%', icon: TrendingUp, color: 'from-teal-500 to-cyan-500' },
    { title: 'Negative Rate Avg', value: `${avgNegativeRate}%`, change: '-4.5%', icon: AlertTriangle, color: 'from-red-600 to-orange-500' }
  ];

  const depositMetrics = [
    { title: 'Live Check', value: '156', change: '+9.2%', icon: Activity, color: 'from-blue-500 to-indigo-500' },
    { title: '1st Check', value: '89', change: '+6.7%', icon: CheckCircle, color: 'from-green-500 to-teal-500' },
    { title: '2nd/3rd', value: '34', change: '+4.1%', icon: Target, color: 'from-purple-500 to-pink-500' },
    { title: 'Paycheck', value: '234', change: '+11.8%', icon: DollarSign, color: 'from-yellow-500 to-orange-500' },
    { title: 'Records', value: '198', change: '+7.5%', icon: Activity, color: 'from-cyan-500 to-blue-500' },
    { title: 'Offline', value: '12', change: '-3.2%', icon: XCircle, color: 'from-red-500 to-pink-500' }
  ];

  const withdrawalMetrics = [
    { title: 'Passed', value: '2.34K', change: '+18.5%', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { title: 'Amount', value: '$15.4M', change: '+22.3%', icon: DollarSign, color: 'from-purple-500 to-pink-500' },
    { title: 'Rejected', value: '87', change: '-4.8%', icon: XCircle, color: 'from-red-500 to-orange-500' },
    { title: 'Rej. Amount', value: '$234K', change: '-6.2%', icon: TrendingDown, color: 'from-orange-500 to-red-500' },
    { title: 'Processing', value: '156', change: '+5.3%', icon: Clock, color: 'from-blue-500 to-cyan-500' },
    { title: 'Proc. Amt', value: '$987K', change: '+8.7%', icon: Activity, color: 'from-indigo-500 to-purple-500' }
  ];

  // Build daily series for KPI sparklines
  const conversationData = performanceTrendData.map((d) => ({ label: d.day, y: Math.round(d.CSR) }));
  const transactionData = performanceTrendData.map((d) => ({ label: d.day, y: Math.round(d.Withdrawal) }));
  const outputData = performanceTrendData.map((d) => ({ label: d.day, y: Math.round(d.Deposit) }));

  // lightweight runtime tests
  useEffect(() => {
    console.assert(performanceTrendData.length === 30, 'Test: 30-day data should have 30 points');
    console.assert(conversationData.length === transactionData.length && transactionData.length === outputData.length, 'Test: sparkline arrays must be equal length');
    console.assert(/^Day \d+$/.test(conversationData[0].label), 'Test: labels should be of form "Day N"');
    console.assert(Number.isFinite(conversationData[0].y), 'Test: y should be numeric');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 text-white p-8 relative overflow-hidden">
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Super Admin Dashboard</h1>
            <p className="text-gray-400 flex items-center gap-2">
              <Activity size={16} className="text-green-400" />
              Live Performance Monitoring • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2">
            <RefreshCw size={16} /> Refresh Data
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <SparklineStatCard
            title="Overall Total Conversation"
            total="2.6k"
            tag="CSR"
            tagColor="bg-green-500/20 text-green-300"
            stroke="#22C55E"
            data={conversationData}
          />
          <SparklineStatCard
            title="Overall Total Transaction"
            total="2.8k"
            tag="Withdrawal"
            tagColor="bg-blue-500/20 text-blue-300"
            stroke="#3B82F6"
            data={transactionData}
          />
          <SparklineStatCard
            title="Overall Total Output"
            total="2.1k"
            tag="Deposit"
            tagColor="bg-yellow-500/20 text-yellow-300"
            stroke="#F59E0B"
            data={outputData}
          />
        </div>

        {/* Compare Period */}
        <GlassCard className="p-4 mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm text-gray-400 font-medium">Compare Period:</span>
            <div className="flex gap-2">
              {(['yesterday', 'lastWeek', 'lastMonth']).map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setComparisonMode(mode); setShowCustomDate(false); }}
                  className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${comparisonMode === mode && !showCustomDate
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                >
                  {mode === 'yesterday' ? 'vs Yesterday' : mode === 'lastWeek' ? 'vs Last Week' : 'vs Last Month'}
                </button>
              ))}
              <button
                onClick={() => setShowCustomDate(!showCustomDate)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${showCustomDate ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white/5 text-gray-300'
                  }`}
              >
                <Calendar size={16} /> Custom Range
              </button>
            </div>
            {showCustomDate && (
              <div className="flex items-center gap-2 ml-auto">
                <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                <span className="text-gray-500">to</span>
                <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
              </div>
            )}
          </div>
        </GlassCard>

        {/* 30-Day Performance Trend */}
        <PerformanceTrendCard
          data={performanceTrendData}
          title="30-Day Performance Trend (vs Yesterday)"
        />

        {/* Department Quota Legend + Circular cards */}
        <div className="flex justify-end items-center gap-6 mb-2 px-1">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            Green (Quota)
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            Red (Non-Quota)
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {departmentStats.map((dept) => (
            <CircularProgress key={dept.name} percentage={dept.quota} title={`${dept.name} Department`} />
          ))}
        </div>

        {/* Collapsible Department Metrics */}
        <CollapsibleDepartment
          title="CSR Department"
          subtitle="Customer Service & Support"
          metrics={csrMetrics}
          deptKey="csr"
          expandedDept={expandedDept}
          setExpandedDept={setExpandedDept}
          staffPerShift={staffPerShift}
        />
        <CollapsibleDepartment
          title="Deposit Department"
          subtitle="Verification & Processing"
          metrics={depositMetrics}
          deptKey="deposit"
          expandedDept={expandedDept}
          setExpandedDept={setExpandedDept}
          staffPerShift={staffPerShift}
        />
        <CollapsibleDepartment
          title="Withdrawal Department"
          subtitle="Transaction Processing"
          metrics={withdrawalMetrics}
          deptKey="withdrawal"
          expandedDept={expandedDept}
          setExpandedDept={setExpandedDept}
          staffPerShift={staffPerShift}
        />
      </div>
    </div>
  );
};

export default ModernDashboard;
