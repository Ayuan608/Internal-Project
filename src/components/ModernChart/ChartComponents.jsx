import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sparkline tooltip (date + value)
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

// Trend chart tooltip showing departments with names + values
export const TrendTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    const nameMap = {
        CSR: { label: 'CSR Department', color: '#3B82F6' },
        Withdrawal: { label: 'Withdrawal Department', color: '#A855F7' },
        Deposit: { label: 'Deposit Department', color: '#10B981' },
    };
    return (
        <div className="px-3 py-2 rounded-md bg-black/80 text-white text-xs shadow-lg border border-white/10">
            <div className="font-semibold mb-1">{label}</div>
            <div className="space-y-1">
                {payload
                    .filter((p) => nameMap[p.dataKey])
                    .map((p) => (
                        <div key={p.dataKey} className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full" style={{ background: nameMap[p.dataKey].color }} />
                            <span className="opacity-80">{nameMap[p.dataKey].label}:</span>
                            <span className="font-medium">{Number(p.value).toFixed(1)}</span>
                        </div>
                    ))}
            </div>
        </div>
    );
};

// Sparkline Chart Component
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

// Performance Trend Chart Component
export const PerformanceTrendChart = ({ data, height = 300 }) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip content={<TrendTooltip />} />
                <Area type="monotone" dataKey="CSR" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCSR)" strokeWidth={2} />
                <Area type="monotone" dataKey="Deposit" stroke="#10B981" fillOpacity={1} fill="url(#colorDeposit)" strokeWidth={2} />
                <Area type="monotone" dataKey="Withdrawal" stroke="#A855F7" fillOpacity={1} fill="url(#colorWithdrawal)" strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

// Bar Chart Component (if needed later)
export const BarChartComponent = ({ data, dataKey, fill, height = 300 }) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey={dataKey} fill={fill} />
            </BarChart>
        </ResponsiveContainer>
    );
};

// Pie Chart Component (if needed later)
export const PieChartComponent = ({ data, dataKey, nameKey, colors, height = 300 }) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey={dataKey}
                    nameKey={nameKey}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

// Composite Chart - Multiple lines
export const MultiLineChart = ({ data, lines, height = 300 }) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                {lines.map((line, index) => (
                    <Line
                        key={line.dataKey}
                        type="monotone"
                        dataKey={line.dataKey}
                        stroke={line.stroke}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};