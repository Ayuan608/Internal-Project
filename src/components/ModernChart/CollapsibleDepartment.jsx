import React from 'react';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';

const GlassCard = ({ children, className = '' }) => (
    <div className={`backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300 ${className}`}>
        {children}
    </div>
);

const AnimatedMetricCard = ({ title, value, change, icon: Icon, color }) => {
    const isPositive = String(change).trim().startsWith('+');

    const CompareBadge = ({ isPositive, change }) => (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <span className="text-xs font-bold">{change}</span>
        </div>
    );

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

const StaffPill = ({ staffPerShift, deptKey }) => {
    // Add safety check to prevent undefined errors
    const s = staffPerShift?.[deptKey] || { morning: 0, night: 0 };
    const total = s.morning + s.night;

    return (
        <div className="relative group">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-xs">
                <Users size={14} className="opacity-80" />
                <span className="font-semibold">{total}</span>
                <span className="opacity-70">staff</span>
            </div>
            <div className="absolute top-full right-0 mt-1 z-50 hidden group-hover:block whitespace-nowrap px-2.5 py-1.5 rounded-md text-[11px] bg-black/80 text-white border border-white/10 shadow-lg">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Morning: <span className="font-medium">{s.morning}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Night: <span className="font-medium">{s.night}</span>
                </div>
            </div>
        </div>
    );
};

export const CollapsibleDepartment = ({
    title,
    subtitle,
    gradient,
    metrics,
    deptKey,
    expandedDept,
    setExpandedDept,
    staffPerShift = {} // Default to empty object to prevent undefined errors
}) => (
    <GlassCard className="mb-8">
        <button
            onClick={() => setExpandedDept(prev => ({ ...prev, [deptKey]: !prev[deptKey] }))}
            className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-all"
        >
            <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${gradient}`}></div>
                <div className="text-left">
                    <h3 className="text-2xl font-bold">{title}</h3>
                    <span className="text-sm text-gray-400">{subtitle}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <StaffPill staffPerShift={staffPerShift} deptKey={deptKey} />
                <span className="text-sm text-gray-400">
                    {expandedDept?.[deptKey] ? 'Hide Details' : 'Show Details'}
                </span>
                {expandedDept?.[deptKey] ? (
                    <ChevronUp className="text-gray-400 w-6 h-6" />
                ) : (
                    <ChevronDown className="text-gray-400 w-6 h-6" />
                )}
            </div>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ${expandedDept?.[deptKey] ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-8 pt-0 border-t border-white/10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {metrics.map((metric, idx) => (
                        <AnimatedMetricCard key={idx} {...metric} />
                    ))}
                </div>
            </div>
        </div>
    </GlassCard>
);

export default CollapsibleDepartment;