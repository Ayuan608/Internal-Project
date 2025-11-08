import React from 'react';
import { Activity } from 'lucide-react';
import { PerformanceTrendChart } from './ChartComponents';

const GlassCard = ({ children, className = '' }) => (
    <div className={`backdrop-blur-xl  rounded-2xl border border-white/10 shadow-2xl  transition-all duration-300 ${className}`}>
        {children}
    </div>
);

export const PerformanceTrendCard = ({ data, title = "30-Day Performance Trend", height = 300 }) => {
    return (
        <GlassCard className="p-6 mb-8 w-full">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="text-blue-400" /> {title}
            </h3>
            <PerformanceTrendChart data={data} height={height} />
        </GlassCard>
    );
};

export default PerformanceTrendCard;