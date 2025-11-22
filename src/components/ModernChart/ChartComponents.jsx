import React from 'react';
import { LineChart, Line,  Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart } from 'recharts';

// Goal-based Tooltip for single department
export const GoalTooltip = ({ active, payload, goalValue, metricName, color, currency = '' }) => {
    if (!active || !payload || !payload.length) return null;

    const point = payload[0].payload;
    const value = point.value || 0;
    const isAboveGoal = value >= goalValue;

    return (
        <div className="px-4 py-3 rounded-lg bg-gray-900/95 backdrop-blur-sm text-white text-sm border border-gray-700/50 shadow-xl animate-in fade-in duration-200">
            <div className="font-semibold mb-2 text-gray-200">Day {point.day} • {point.dateLabel}</div>

            <div className="flex items-center gap-2 mb-1">
                <span
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{
                        backgroundColor: color,
                        boxShadow: `0 0 12px ${color}80`
                    }}
                ></span>
                <span className="text-gray-400 text-xs">{metricName}:</span>
                <span className="font-bold text-white">{currency}{value.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 bg-red-400 rounded-full"></span>
                <span className="text-gray-400 text-xs">Goal:</span>
                <span className="font-semibold text-gray-200">{currency}{goalValue.toLocaleString()}</span>
            </div>

            <div className={`text-xs font-bold ${isAboveGoal ? 'text-green-400' : 'text-red-400'}`}>
                {isAboveGoal ? '✓ Above Goal' : '✗ Below Goal'}
            </div>
        </div>
    );
};



export const DepartmentGoalChart = ({ data, goalValue, metricName, color, height = 400, currency = '' }) => {
    const aboveData = data.map(p => ({
        ...p,
        aboveGoal: p.value >= goalValue ? p.value : goalValue
    }));

    const belowData = data.map(p => ({
        ...p,
        belowGoal: p.value < goalValue ? p.value : goalValue
    }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>

                <defs>
                    {/* TOP LAYER — Aqua/Teal Glow (Screenshot Style) */}
                    <linearGradient id={`aboveGoal-${metricName}`} x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                    </linearGradient>

                    {/* MID LAYER — Blue Glow */}
                    <linearGradient id={`midGoal-${metricName}`} x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                    </linearGradient>

                    {/* BOTTOM LAYER — Purple Glow */}
                    <linearGradient id={`belowGoal-${metricName}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0.05} />
                    </linearGradient>
                </defs>


                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />

                <XAxis
                    dataKey="day"
                    type="number"
                    domain={[1, 30]}
                    ticks={Array.from({ length: 30 }, (_, i) => i + 1)}
                    tickFormatter={(day) => {
                        const item = data.find(d => d.day === day);
                        return item ? item.dateLabel : `${String(day).padStart(2, "0")}/${String(new Date().getMonth() + 1).padStart(2, "0")}`;
                    }}
                    interval={0}
                    stroke="#9CA3AF"
                    tick={{ fontSize: 11, fill: '#D1D5DB' }}
                    axisLine={{ stroke: '#4B5563' }}
                />


                <YAxis
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12, fill: '#D1D5DB' }}
                    axisLine={{ stroke: '#4B5563' }}
                />

                <Tooltip
                    content={(props) => (
                        <GoalTooltip
                            {...props}
                            goalValue={goalValue}
                            metricName={metricName}
                            color={color}
                            currency={currency}
                        />
                    )}
                    cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
                />

                {/* Goal Line - Enhanced */}
                <ReferenceLine
                    y={goalValue}
                    stroke="oklch(80% 0 0 / 0.6)"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    label={{
                        value: 'Goal',
                        fill: '#bbb',
                        fontSize: 12,
                        fontWeight: 700,
                        position: 'right',
                        offset: 5
                    }}
                />

                {/* Above Goal Area with Enhanced Shadow */}
                <Area
                    data={aboveData}
                    type="linear"
                    dataKey="aboveGoal"
                    stroke="none"
                    fill={`url(#aboveGoal-${metricName})`}
                    fillOpacity={1}
                    filter={`url(#shadow-${metricName})`}
                />

                {/* Below Goal Area with Enhanced Shadow */}
                <Area
                    data={belowData}
                    type="linear"
                    dataKey="belowGoal"
                    stroke="none"
                    fill={`url(#belowGoal-${metricName})`}
                    fillOpacity={1}
                    filter={`url(#shadow-${metricName})`}
                />

                {/* Clean Line with Glow */}
                <Line
                    type="linear"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={3}
                    connectNulls={false}
                    dot={{
                        r: 4,
                        fill: color,
                        strokeWidth: 2,
                        stroke: '#111',
                    }}
                    activeDot={{
                        r: 6,
                        fill: color,
                        strokeWidth: 2,
                        stroke: '#111'
                    }}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
};


// Sparkline Chart Component
export const SparklineChart = ({ data, stroke, height = 48 }) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <Tooltip content={<MiniTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)' }} />
                <Line
                    type="linear"
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

// MiniTooltip
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