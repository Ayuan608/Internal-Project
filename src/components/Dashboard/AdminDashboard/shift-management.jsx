import React, { useState } from 'react';
import { Calendar, Clock, Users, ChevronLeft, Save, Search } from 'lucide-react';

const ShiftManagement = () => {
    const [employees, setEmployees] = useState([
        {
            id: 1,
            name: "John Smith",
            dateHired: "2023-01-15",
            salary: "$3,500",
            currentShift: "Morning (7 AM - 4 PM)",
            department: "Sales"
        },
        {
            id: 2,
            name: "Sarah Johnson",
            dateHired: "2022-11-20",
            salary: "$4,200",
            currentShift: "Evening (4 PM - 4 AM)",
            department: "Sales"
        },
        {
            id: 3,
            name: "Mike Davis",
            dateHired: "2023-03-10",
            salary: "$3,800",
            currentShift: "Morning (4 AM - 4 PM)",
            department: "Sales"
        },
        {
            id: 4,
            name: "Emily Wilson",
            dateHired: "2022-08-05",
            salary: "$4,500",
            currentShift: "Evening (7 PM - 4 AM)",
            department: "Sales"
        }
    ]);

    const [selectedShifts, setSelectedShifts] = useState({});
    const [shiftStartDates, setShiftStartDates] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    const shiftOptions = [
        { value: "morning_4_4", label: "Morning (4 AM - 4 PM)" },
        { value: "evening_4_4", label: "Evening (4 PM - 4 AM)" },
        { value: "morning_7_4", label: "Morning (7 AM - 4 PM)" },
        { value: "evening_7_4", label: "Evening (7 PM - 4 AM)" }
    ];

    const handleShiftChange = (employeeId, shift) => {
        setSelectedShifts(prev => ({
            ...prev,
            [employeeId]: shift
        }));
    };

    const handleStartDateChange = (employeeId, date) => {
        setShiftStartDates(prev => ({
            ...prev,
            [employeeId]: date
        }));
    };

    const handleShiftUpdate = (employeeId) => {
        const newShift = selectedShifts[employeeId];
        const startDate = shiftStartDates[employeeId];

        if (newShift && startDate) {
            setEmployees(prev =>
                prev.map(emp =>
                    emp.id === employeeId
                        ? {
                            ...emp,
                            currentShift:
                                shiftOptions.find(s => s.value === newShift)?.label || emp.currentShift
                        }
                        : emp
                )
            );

            setSelectedShifts(prev => {
                const updated = { ...prev };
                delete updated[employeeId];
                return updated;
            });

            setShiftStartDates(prev => {
                const updated = { ...prev };
                delete updated[employeeId];
                return updated;
            });

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    const getShiftBadgeColor = (shift) => {
        if (shift.includes('4 AM - 4 PM')) return 'bg-orange-500';
        if (shift.includes('4 PM - 4 AM')) return 'bg-purple-500';
        if (shift.includes('7 AM - 4 PM')) return 'bg-blue-500';
        if (shift.includes('7 PM - 4 AM')) return 'bg-indigo-500';
        return 'bg-gray-500';
    };

    return (
        <div className="min-h-screen ">
            <div className=" shadow-lg">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button className="p-2  rounded-lg transition">
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Shift Management</h1>
                                <p className="text-slate-400 text-sm">Manage employee shift schedules</p>
                            </div>
                        </div>
                        <div className='flex gap-5'>
                            <div className="relative flex-1 min-w-[200px] max-w-[400px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search employee..."

                                    className="w-full px-10 py-2 bg-slate-800/40 border border-slate-800 rounded-lg text-sm outline-none placeholder:text-slate-500"
                                />
                            </div>
                            <div className="flex items-center space-x-2 bg-blue-600 px-4 py-2 rounded-lg">
                                <Users className="w-5 h-5 text-white" />
                                <span className="text-white font-semibold">{employees.length} Employees</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showSuccess && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
                        <Save className="w-5 h-5" />
                        <span className="font-semibold">Shift updated successfully!</span>
                    </div>
                </div>
            )}

            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                        Date Hired
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                        Salary
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                        Current Shift
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                        New Shift
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                        Start Date of Shifting
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {employees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-slate-900/50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {employee.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-white">{employee.name}</div>
                                                    <div className="text-sm text-slate-400">{employee.department}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-slate-300">
                                                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                                {employee.dateHired}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-green-400 font-semibold">{employee.salary}</span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                                <span className={`${getShiftBadgeColor(employee.currentShift)} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                                                    {employee.currentShift}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={selectedShifts[employee.id] || ''}
                                                onChange={(e) => handleShiftChange(employee.id, e.target.value)}
                                                className="bg-slate-900/40 text-white border border-slate-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option className='bg-slate-950' value="">Select new shift</option>
                                                {shiftOptions.map((option) => (
                                                    <option className='bg-slate-950' key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="date"
                                                value={shiftStartDates[employee.id] || ''}
                                                onChange={(e) => handleStartDateChange(employee.id, e.target.value)}
                                                className="bg-slate-900/40 text-white border border-slate-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleShiftUpdate(employee.id)}
                                                disabled={!selectedShifts[employee.id] || !shiftStartDates[employee.id]}
                                                className={`px-6 py-2 rounded-lg font-semibold transition ${selectedShifts[employee.id] && shiftStartDates[employee.id]
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                                                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                Shift
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShiftManagement;
