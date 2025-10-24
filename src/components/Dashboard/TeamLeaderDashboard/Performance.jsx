

import React from 'react';
import { TrendingUp, TrendingDown, MessageCircle, Target } from 'lucide-react';

const Performance = () => {
    const performanceData = [
        {
            name: 'Sarah Johnson',
            shift: 'Morning',
            completed: 42,
            messages: 156,
            frt: 45,
            positivePercentage: 92,
            mistakes: 2,
            quota: 50
        },
        {
            name: 'Mike Chen',
            shift: 'Morning',
            completed: 38,
            messages: 142,
            frt: 52,
            positivePercentage: 88,
            mistakes: 4,
            quota: 50
        },
        {
            name: 'Emily Davis',
            shift: 'Night',
            completed: 58,
            messages: 198,
            frt: 38,
            positivePercentage: 95,
            mistakes: 1,
            quota: 65
        }
    ];

    const getQuotaStatus = (completed, quota) => {
        const percentage = (completed / quota) * 100;
        if (percentage >= 100) {
            return 'text-green-400';
        } else if (percentage >= 80) {
            return 'text-yellow-400';
        }
        return 'text-red-400';
    };

    const getPositivePercentageColor = (percentage) => {
        if (percentage >= 90) return 'text-green-400';
        if (percentage >= 85) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getMistakesColor = (mistakes) => {
        if (mistakes <= 1) return 'text-green-400';
        if (mistakes <= 3) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getFrtColor = (frt) => {
        if (frt <= 40) return 'text-green-400';
        if (frt <= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="w-full bg-[rgba(59,130,246,0.03)] rounded-xl border_gray shadow-xl overflow-hidden m-2">
            {/* Table Header */}
            <div className="bg-[rgba(59,130,246,0.03)] px-6 py-4 border-b border-gray-700">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Performance Metrics</h2>
                    <div className="text-sm text-gray-400">
                        Real-time Performance Data
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* Table Head */}
                    <thead className="bg-[rgba(59,130,246,0.03)] border-b border-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                NAME
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                SHIFT
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                COMPLETED
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                MESSAGES
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                FRT (SEC)
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                POSITIVE %
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                MISTAKES
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                QUOTA
                            </th>
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="bg-[rgba(59,130,246,0.03)]">
                        {performanceData.map((employee, index) => (
                            <tr
                                key={index}
                                className="border_gray"
                            >
                                {/* Name */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {employee.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-white">
                                                {employee.name}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Shift */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm font-medium px-3 py-1 rounded-full ${employee.shift === 'Morning'
                                        ? 'bg-blue-900/30 text-blue-300 border border-blue-700'
                                        : 'bg-purple-900/30 text-purple-300 border border-purple-700'
                                        }`}>
                                        {employee.shift}
                                    </div>
                                </td>

                                {/* Completed */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className={`text-lg font-bold ${getQuotaStatus(employee.completed, employee.quota)}`}>
                                            {employee.completed}
                                        </div>
                                        {employee.completed >= employee.quota ? (
                                            <TrendingUp className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>
                                </td>

                                {/* Messages */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4 text-blue-400" />
                                        <div className="text-sm font-semibold text-white">
                                            {employee.messages}
                                        </div>
                                    </div>
                                </td>

                                {/* FRT (First Response Time) */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm font-bold ${getFrtColor(employee.frt)}`}>
                                        {employee.frt}
                                    </div>
                                    <div className="text-xs text-gray-400">seconds</div>
                                </td>

                                {/* Positive Percentage */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className={`text-lg font-bold ${getPositivePercentageColor(employee.positivePercentage)}`}>
                                            {employee.positivePercentage}%
                                        </div>
                                        <div className="w-16 bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${employee.positivePercentage >= 90 ? 'bg-green-500' :
                                                    employee.positivePercentage >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${employee.positivePercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>

                                {/* Mistakes */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-lg font-bold ${getMistakesColor(employee.mistakes)}`}>
                                        {employee.mistakes}
                                    </div>
                                </td>

                                {/* Quota */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-purple-400" />
                                        <div className="text-sm font-semibold text-white">
                                            {employee.quota}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            ({Math.round((employee.completed / employee.quota) * 100)}%)
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            <div className="bg-[#f5f6fa13] px-6 py-3 border-t border-gray-700">
                <div className="flex justify-between items-center text-sm text-gray-400">
                    <div>Showing {performanceData.length} employees</div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Good</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span>Average</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span>Needs Improvement</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Performance;
