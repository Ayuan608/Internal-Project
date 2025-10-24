


import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import AttendanceChartMonth from '../SuperAdminDashboardRoute/ui/AttendanceChartMonth';

const AttendanceRecords = () => {
    const attendanceData = [
        {
            date: '2025-10-18',
            name: 'Sarah Johnson',
            punchIn: '08:00 AM',
            breaks: '65 min',
            punchOut: '05:00 PM',
            totalHours: '8.0 hrs',
            status: 'VIOLATION'
        },
        {
            date: '2025-10-18',
            name: 'Mike Chen',
            punchIn: '08:05 AM',
            breaks: '45 min',
            punchOut: '05:10 PM',
            totalHours: '8.3 hrs',
            status: 'NORMAL'
        }
    ];

    const getStatusIcon = (status) => {
        if (status === 'VIOLATION') {
            return <AlertCircle className="w-4 h-4 text-red-500" />;
        }
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    };

    const getStatusColor = (status) => {
        if (status === 'VIOLATION') {
            return 'text-red-600 bg-red-50 border-red-200';
        }
        return 'text-green-600 bg-green-50 border-green-200';
    };

    return (
        <>
            <div className="w-full bg-[rgba(59,130,246,0.03)] rounded-lg shadow-lg border_gray overflow-hidden m-2">
                {/* Table Header */}
                <div className="bg-[rgba(59,130,246,0.03)] px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-white">Attendance Records</h2>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto overflow-hidden">
                    <table className="w-full">
                        {/* Table Head */}
                        <thead className="bg-[rgba(59,130,246,0.03)] border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                    DATE
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                    NAME
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                    PUNCH IN
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                    BREAKS
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                    PUNCH OUT
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                    TOTAL HOURS
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                    STATUS
                                </th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="bg-[rgba(59,130,246,0.03)]">
                            {attendanceData.map((record, index) => (
                                <tr className='border_gray'
                                    key={index}

                                >
                                    {/* Date */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">
                                            {record.date}
                                        </div>
                                    </td>

                                    {/* Name */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">
                                            {record.name}
                                        </div>
                                    </td>

                                    {/* Punch In */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-white font-semibold">
                                            {record.punchIn}
                                        </div>
                                    </td>

                                    {/* Breaks */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-white">
                                            {record.breaks}
                                        </div>
                                    </td>

                                    {/* Punch Out */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-white font-semibold">
                                            {record.punchOut}
                                        </div>
                                    </td>

                                    {/* Total Hours */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-white font-semibold">
                                            {record.totalHours}
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(record.status)}`}>
                                            {getStatusIcon(record.status)}
                                            {record.status}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="bg-[rgba(59,130,246,0.03)] px-6 py-3 border-t border-gray-200 ">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-white">
                            Showing {attendanceData.length} records
                        </div>
                        <div className="text-sm text-white">
                            Updated: {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
            <div  className='p-2'>
                <AttendanceChartMonth />
            </div>
        </>
    );
};

export default AttendanceRecords;