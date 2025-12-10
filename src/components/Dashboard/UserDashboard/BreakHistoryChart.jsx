// src/components/charts/BreakHistoryChart.jsx
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, Calendar, Coffee, Droplets, Utensils } from 'lucide-react';

const BreakHistoryChart = ({ breakData }) => {
    if (!breakData || breakData.length === 0) {
        return (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/60 h-full">
                <div className="flex flex-col items-center justify-center h-64">
                    <Calendar className="w-12 h-12 text-slate-600 mb-3" />
                    <p className="text-slate-400">No break data available</p>
                    <p className="text-xs text-slate-500 mt-1">Start taking breaks to see history</p>
                </div>
            </div>
        );
    }

  
    const getBreakColor = (type) => {
        switch (type) {
            case 'smoke': return '#f59e0b'; // Amber
            case 'wc': return '#3b82f6'; // Blue
            case 'lunch': return '#10b981'; // Emerald
            default: return '#8b5cf6'; // Purple
        }
    };

    const getBreakIcon = (type) => {
        switch (type) {
            case 'smoke': return <Coffee className="w-4 h-4 text-amber-400" />;
            case 'wc': return <Droplets className="w-4 h-4 text-blue-400" />;
            case 'lunch': return <Utensils className="w-4 h-4 text-emerald-400" />;
            default: return <Coffee className="w-4 h-4 text-purple-400" />;
        }
    };
    const chartData = breakData.map((item, index) => {
        let breakTime = 0;

        if (item.start && item.end) {
            breakTime = Math.round((new Date(item.end) - new Date(item.start)) / 60000);
        }

        return {
            name: `Break ${index + 1}`,
            type: item.type?.toUpperCase() || 'BREAK',
            time: breakTime,
            color: getBreakColor(item.type)
        };
    });
    // Calculate totals
    const totalBreakTime = chartData.reduce((sum, item) => sum + item.time, 0);
    const smokeBreaks = breakData.filter(b => b.type === 'smoke').length;
    const wcBreaks = breakData.filter(b => b.type === 'wc').length;
    const lunchBreaks = breakData.filter(b => b.type === 'lunch').length;

    return (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/60 h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-sky-400" />
                        Break History Timeline
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Visual breakdown of all breaks taken</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs bg-slate-800/50 border border-slate-700 text-slate-300">
                        Total: {totalBreakTime}m
                    </span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-1">
                        <Coffee className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-slate-300">Smoke</span>
                    </div>
                    <div className="text-lg font-bold text-slate-50">{smokeBreaks}</div>
                    <div className="text-xs text-slate-500">breaks</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-1">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-slate-300">WC</span>
                    </div>
                    <div className="text-lg font-bold text-slate-50">{wcBreaks}</div>
                    <div className="text-xs text-slate-500">breaks</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-1">
                        <Utensils className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-slate-300">Lunch</span>
                    </div>
                    <div className="text-lg font-bold text-slate-50">{lunchBreaks}</div>
                    <div className="text-xs text-slate-500">breaks</div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                            label={{
                                value: 'Minutes',
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#94a3b8'
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                color:'white',
                                borderColor: '#334155',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`${value} minutes`, 'Duration']}
                            labelFormatter={(label, items) => {
                                if (items && items[0]) {
                                    return `Type: ${items[0].payload.type}`;
                                }
                                return label;
                            }}
                        />
                        <Bar
                            dataKey="time"
                            radius={[6, 6, 0, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-xs text-slate-300">Smoke</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-slate-300">WC</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-slate-300">Lunch</span>
                </div>
            </div>
        </div>
    );
};

export default BreakHistoryChart;