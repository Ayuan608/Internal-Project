import React from 'react';
import { SparklineChart } from './ChartComponents';

const GlassCard = ({ children, className = '' }) => (
    <div className={`backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300 ${className}`}>
        {children}
    </div>
);

export const SparklineStatCard = ({ title, total, tag, tagColor, stroke, data, height = 48 }) => {
    return (
        <GlassCard className="p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="text-xs text-gray-400 mb-1">{title}</p>
                    <h3 className="text-4xl font-bold">{total}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tagColor}`}>{tag}</span>
            </div>
            <div className="h-12">
                <SparklineChart data={data} stroke={stroke} height={height} />
            </div>
        </GlassCard>
    );
};

export default SparklineStatCard;