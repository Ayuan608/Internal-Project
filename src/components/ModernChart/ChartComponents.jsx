import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Enhanced Trend tooltip to show real values

export const TrendTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const point = payload[0].payload;
    return (
        <div className="px-3 py-2 rounded-md bg-black/80 text-white text-xs border border-white/10 shadow">
            <div className="font-semibold mb-1">Day {point.day}</div>

            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                CSR: {point?.csr.toLocaleString()}
            </div>

            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Deposit: ₹{point?.deposit.toLocaleString()}
            </div>

            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Withdraw: ₹{point?.withdraw.toLocaleString()}
            </div>
        </div>
    );
};

export const PerformanceTrendChart = ({ data, height = 400 }) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>

                <defs>
                    <linearGradient id="csrFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                    </linearGradient>

                    <linearGradient id="depositFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                    </linearGradient>

                    <linearGradient id="withdrawFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0.05} />
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />

                <XAxis dataKey="day" stroke="#ccc" tick={{ fontSize: 12 }} />
                <YAxis stroke="#ccc" tick={{ fontSize: 12 }} />

                <Tooltip content={<TrendTooltip />} />

                {/* CSR Line */}
                <Area
                    type="monotone"
                    dataKey="csr"
                    stroke="#3B82F6"
                    fill="url(#csrFill)"
                    strokeWidth={2}
                    dot={false}
                />

                {/* Deposit Line */}
                <Area
                    type="monotone"
                    dataKey="deposit"
                    stroke="#10B981"
                    fill="url(#depositFill)"
                    strokeWidth={2}
                    dot={false}
                />

                {/* Withdraw Line */}
                <Area
                    type="monotone"
                    dataKey="withdraw"
                    stroke="#A855F7"
                    fill="url(#withdrawFill)"
                    strokeWidth={2}
                    dot={false}
                />

            </AreaChart>
        </ResponsiveContainer>

    );
};

// Sparkline Chart Component (keep existing)
export const SparklineChart = ({ data, stroke, height = 48 }) => {
    console.log(
        data
    )
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