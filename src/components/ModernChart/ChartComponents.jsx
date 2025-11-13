import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Enhanced Trend tooltip to show real values
export const TrendTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;

    const nameMap = {
        CSR: { label: 'CSR Department', color: '#3B82F6' },
        Deposit: { label: 'Deposit Department', color: '#10B981' },
        Withdrawal: { label: 'Withdrawal Department', color: '#A855F7' },
    };

    // Find the data point
    const dataPoint = payload[0]?.payload;

    return (
        <div className="px-3 py-2 rounded-md bg-black/90 text-white text-xs shadow-lg border border-white/10 backdrop-blur-sm">
            <div className="font-semibold mb-1 text-cyan-100">{dataPoint?.date || label}</div>
            <div className="space-y-1">
                {payload
                    .filter((p) => nameMap[p.dataKey])
                    .map((p) => (
                        <div key={p.dataKey} className="flex items-center gap-2">
                            <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ background: nameMap[p.dataKey].color }}
                            />
                            <span className="opacity-80">{nameMap[p.dataKey].label}:</span>
                            <span className="font-medium">
                                {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    );
};


export const PerformanceTrendChart = ({ data, height = 400 }) => {
    // Format Y-axis values
    const formatYAxis = (value) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value;
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                    <linearGradient id="colorCSR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorWithdrawal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1} />
                    </linearGradient>
                </defs>

                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                    vertical={false}
                />

                <XAxis
                    dataKey="day"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                />

                <YAxis
                    stroke="#9CA3AF"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatYAxis}
                />

                <Tooltip content={<TrendTooltip />} />

                {/* Stacked areas for better visualization */}
                <Area
                    type="monotone"
                    dataKey="Withdrawal"
                    stackId="1"
                    stroke="#A855F7"
                    fill="url(#colorWithdrawal)"
                    strokeWidth={2}
                    name="Withdrawal"
                />
                <Area
                    type="monotone"
                    dataKey="Deposit"
                    stackId="1"
                    stroke="#10B981"
                    fill="url(#colorDeposit)"
                    strokeWidth={2}
                    name="Deposit"
                />
                <Area
                    type="monotone"
                    dataKey="CSR"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="url(#colorCSR)"
                    strokeWidth={2}
                    name="CSR"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

// Sparkline Chart Component (keep existing)
export const SparklineChart = ({ data, stroke, height = 48 }) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <Tooltip content={<MiniTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)' }} />
                <Line
                    type="monotone"
                    dataKey="y"
                    stroke={stroke}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: stroke }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

// MiniTooltip (keep existing)
export const MiniTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const p = payload[0];
        return (
            <div className="px-3 py-2 rounded-md bg-black/80 text-white text-xs shadow-lg border border-white/10">
                <div>{p?.payload?.label}</div>
                <div>{p?.value}</div>
            </div>
        );
    }
    return null;
};