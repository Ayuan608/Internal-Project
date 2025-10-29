import { AlertCircle, CheckCircle } from 'lucide-react';
import AttendanceChartMonth from '../SuperAdminDashboardRoute/ui/AttendanceChartMonth';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from './../../../redux/attendenceSlice';
import { useEffect, useState } from 'react';

const AttendanceRecords = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const dispatch = useDispatch();

    const { allAttendance } = useSelector(
        (state) => state.attendance
    );

    const attendanceData = allAttendance

    console.log(attendanceData)

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                await dispatch(getAllAttendance({
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                    department: selectedDepartment !== "All" ? selectedDepartment : undefined,
                    page: 1,
                    limit: 100 // Adjust as needed
                })).unwrap();
            } catch (error) {
                console.error("Failed to fetch attendance data:", error);
            }
        };

        fetchAttendanceData();
    }, [dispatch, startDate, endDate, selectedDepartment]);

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
            <div className="w-[calc(100vw - 240px)] bg-[rgba(59,130,246,0.03)] rounded-lg shadow-lg border_gray overflow-hidden m-2">
                {/* Table Header */}
                <div className="bg-[rgba(59,130,246,0.03)] px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-white">Attendance Records</h2>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto">
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
                                    SHIFT
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                                    Department
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
                                            {new Date(record.date).toLocaleDateString()}
                                        </div>
                                    </td>

                                    {/* Name */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">
                                            {record.user?.FullName}
                                        </div>
                                    </td>

                                    {/* Punch In */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-white font-semibold">
                                            {record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : "Not Punched In"}
                                        </div>
                                    </td>

                                    {/* Breaks */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-white">
                                            {record.shift}
                                        </div>
                                    </td>
                                    {/* DEPARTMENT */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-white">
                                            {record.user?.department}
                                        </div>
                                    </td>

                                    {/* Punch Out */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-white font-semibold">
                                            {record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : "Not Punched Out"}
                                        </div>
                                    </td>

                                    {/* Total Hours */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-white font-semibold">
                                            {record.workingHours}
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(record.alert)}`}>
                                            {getStatusIcon(record.alert)}
                                            {record.alert}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="bg-[rgba(59,130,246,0.03)] px-6 py-3 border-t border-gray-200">
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

        </>
    );
};

export default AttendanceRecords;