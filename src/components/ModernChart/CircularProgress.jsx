import React from 'react';

const GlassCard = ({ children, className = '' }) => (
    <div className={`backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300 ${className}`}>
        {children}
    </div>
);

export const CircularProgress = ({ percentage, title }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.max(0, Math.min(100, percentage));
    const greenLen = (pct / 100) * circumference;
    const redLen = Math.max(0, circumference - greenLen);

    return (
        <GlassCard className="p-6 flex flex-col group hover:scale-105 transition-transform duration-300">
            <div className="w-full flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">{title}</h4>
                <button className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 border border-white/10">See details</button>
            </div>
            <div className="relative w-48 h-48 mx-auto">
                <svg className="transform -rotate-90 w-48 h-48">
                    {/* Base track */}
                    <circle cx="96" cy="96" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
                    {/* Green quota arc */}
                    <circle cx="96" cy="96" r={radius} stroke="#22C55E" strokeWidth="12" fill="none" strokeDasharray={`${greenLen} ${circumference}`} strokeDashoffset={0} strokeLinecap="round" className="drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                    {/* Red non-quota arc */}
                    <circle cx="96" cy="96" r={radius} stroke="#EF4444" strokeWidth="12" fill="none" strokeDasharray={`${redLen} ${circumference}`} strokeDashoffset={-greenLen} strokeLinecap="butt" className="drop-shadow-[0_0_6px_rgba(239,68,68,0.45)]" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white">{percentage}%</span>
                    <span className="text-sm text-gray-400 mt-2">Quota Met</span>
                </div>
            </div>
        </GlassCard>
    );
};

export default CircularProgress;