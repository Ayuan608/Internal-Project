import React, { useRef } from 'react'

const AttendanceChartMonth = () => {
    const tableRef = useRef(null);
    const days = [
        { day: "FRI", date: "NOV 4", key: "nov4" },
        { day: "SAT", date: "NOV 5", key: "nov5" },
        { day: "SUN", date: "NOV 6", key: "nov6" },
        { day: "MON", date: "NOV 7", key: "nov7" },
        { day: "TUE", date: "NOV 8", key: "nov8" },
        { day: "WED", date: "NOV 9", key: "nov9" },
        { day: "THU", date: "NOV 10", key: "nov10" },
        { day: "FRI", date: "NOV 11", key: "nov11" },
        { day: "SAT", date: "NOV 12", key: "nov12" },
        { day: "SUN", date: "NOV 13", key: "nov13" },
        { day: "MON", date: "NOV 14", key: "nov14" },
        { day: "TUE", date: "NOV 15", key: "nov15" },
        { day: "WED", date: "NOV 16", key: "nov16" },
        { day: "THU", date: "NOV 17", key: "nov17" },
        { day: "FRI", date: "NOV 18", key: "nov18" },
        { day: "SAT", date: "NOV 19", key: "nov19" },
        { day: "SUN", date: "NOV 20", key: "nov20" },
        { day: "MON", date: "NOV 21", key: "nov21" },
        { day: "TUE", date: "NOV 22", key: "nov22" },
        { day: "WED", date: "NOV 23", key: "nov23" },
        { day: "THU", date: "NOV 24", key: "nov24" },
        { day: "FRI", date: "NOV 25", key: "nov25" },
        { day: "SAT", date: "NOV 26", key: "nov26" },
        { day: "SUN", date: "NOV 27", key: "nov27" },
        { day: "MON", date: "NOV 28", key: "nov28" },
        { day: "TUE", date: "NOV 29", key: "nov29" },
        { day: "WED", date: "NOV 30", key: "nov30" },
    ];

    // Schedule data for the bottom table
    const scheduleData = [
        {
            id: 1,
            dateHired: "14-Feb-25",
            team: "Deposit",
            position: "Staff",
            name: "Ashish Prabhakar",
            schedule: "16:00 - 04:00",
            remarks: "12 hrs",
            schedule_days: {
                nov4: "D",
                nov5: "N",
                nov6: "N",
                nov7: "D",
                nov8: "D",
                nov9: "RD",
                nov10: "N",
                nov11: "D",
                nov12: "N",
                nov13: "D",
                nov14: "N",
                nov15: "RD",
                nov16: "N",
                nov17: "D",
                nov18: "N",
                nov19: "D",
                nov20: "N",
                nov21: "RD",
                nov22: "D",
                nov23: "N",
                nov24: "D",
                nov25: "N",
                nov26: "RD",
                nov27: "D",
                nov28: "N",
                nov29: "D",
                nov30: "N",
            },
        },
        {
            id: 2,
            dateHired: "7-Mar-25",
            team: "Deposit",
            position: "Staff",
            name: "Lekh Raj",
            schedule: "16:00 - 04:00",
            remarks: "12 hrs",
            schedule_days: {
                nov4: "D",
                nov5: "D",
                nov6: "RD",
                nov7: "N",
                nov8: "N",
                nov9: "N",
                nov10: "D",
                nov11: "D",
                nov12: "RD",
                nov13: "N",
                nov14: "N",
                nov15: "D",
                nov16: "D",
                nov17: "RD",
                nov18: "N",
                nov19: "N",
                nov20: "D",
                nov21: "D",
                nov22: "RD",
                nov23: "N",
                nov24: "N",
                nov25: "D",
                nov26: "D",
                nov27: "RD",
                nov28: "N",
                nov29: "N",
                nov30: "D",
            },
        },
        {
            id: 3,
            dateHired: "16-Nov-24",
            team: "CSR",
            position: "Agent",
            name: "Chandan Aheer",
            schedule: "16:00 - 04:00",
            remarks: "12 hrs",
            schedule_days: {
                nov4: "N",
                nov5: "N",
                nov6: "D",
                nov7: "RD",
                nov8: "N",
                nov9: "N",
                nov10: "D",
                nov11: "RD",
                nov12: "N",
                nov13: "D",
                nov14: "N",
                nov15: "N",
                nov16: "RD",
                nov17: "D",
                nov18: "N",
                nov19: "RD",
                nov20: "D",
                nov21: "N",
                nov22: "N",
                nov23: "D",
                nov24: "RD",
                nov25: "N",
                nov26: "D",
                nov27: "N",
                nov28: "RD",
                nov29: "D",
                nov30: "N",
            },
        },
        {
            id: 4,
            dateHired: "12-Jan-25",
            team: "CSR",
            position: "Senior",
            name: "harish Kumar",
            schedule: "16:00 - 04:00",
            remarks: "12 hrs",
            schedule_days: {
                nov4: "D",
                nov5: "D",
                nov6: "N",
                nov7: "N",
                nov8: "RD",
                nov9: "D",
                nov10: "D",
                nov11: "N",
                nov12: "N",
                nov13: "RD",
                nov14: "D",
                nov15: "D",
                nov16: "N",
                nov17: "N",
                nov18: "RD",
                nov19: "D",
                nov20: "D",
                nov21: "N",
                nov22: "N",
                nov23: "RD",
                nov24: "D",
                nov25: "D",
                nov26: "N",
                nov27: "N",
                nov28: "RD",
                nov29: "D",
                nov30: "D",
            },
        },
        {
            id: 5,
            dateHired: "20-Aug-24",
            team: "Withdrawal",
            position: "Staff",
            name: "Sukhminder Singh",
            schedule: "16:00 - 04:00",
            remarks: "12 hrs",
            schedule_days: {
                nov4: "D",
                nov5: "N",
                nov6: "D",
                nov7: "N",
                nov8: "RD",
                nov9: "N",
                nov10: "N",
                nov11: "D",
                nov12: "N",
                nov13: "RD",
                nov14: "D",
                nov15: "N",
                nov16: "D",
                nov17: "N",
                nov18: "RD",
                nov19: "N",
                nov20: "D",
                nov21: "N",
                nov22: "D",
                nov23: "RD",
                nov24: "N",
                nov25: "D",
                nov26: "N",
                nov27: "D",
                nov28: "N",
                nov29: "RD",
                nov30: "N",
            },
        },
    ];

    const getScheduleColor = (value) => {
        switch (value) {
            case "D":
                return "bg-yellow-200 text-yellow-900";
            case "N":
                return "bg-green-200 text-green-900";
            case "RD":
                return "bg-red-400 text-white";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };



    const scrollLeft = () => {
        if (tableRef.current) {
            tableRef.current.scrollBy({ left: -300, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (tableRef.current) {
            tableRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
    };
    return (
        <div className="bg-white rounded-lg shadow-lg h-full flex flex-col mt-3">
            {/* Scroll hint with buttons */}
            <div className=" border-b border-blue-200 px-4 py-2 flex items-center justify-between">
                <span className="text-sm text-blue-800">
                    ← → Scroll to see all Attendence Details | ↑ ↓ Scroll to see all
                    employees
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={scrollLeft}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                    >
                        ← Left
                    </button>
                    <button
                        onClick={scrollRight}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                    >
                        Right →
                    </button>
                </div>
            </div>
            <div ref={tableRef} className="flex-1 overflow-auto scrollbar-visible">
                <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr>
                            <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-0 z-20 min-w-[70px]">
                                HEAD
                                <br />
                                COUNT
                            </th>
                            <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-[70px] z-20 min-w-[90px]">
                                DATE
                                <br />
                                HIRED
                            </th>
                            <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-[160px] z-20 min-w-[100px]">
                                TEAM
                            </th>
                            <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-[260px] z-20 min-w-[90px]">
                                POSITION
                            </th>
                            <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-[350px] z-20 min-w-[120px]">
                                NAME
                            </th>
                            <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-[470px] z-20 min-w-[100px]">
                                SCHEDULE
                            </th>
                            <th className="bg-blue-900 text-white px-3 py-3 text-left font-semibold border-r border-blue-800 sticky left-[570px] z-20 min-w-[80px]">
                                REMARKS
                            </th>
                            {days.map((day, idx) => (
                                <th
                                    key={idx}
                                    className="bg-blue-900 text-white px-3 py-3 text-center font-semibold border-r border-blue-800 min-w-[60px]"
                                >
                                    {day.day}
                                    <br />
                                    {day.date}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {scheduleData.map((row, idx) => (
                            <tr
                                key={row.id}
                                className="border-b border-gray-200 hover:bg-gray-50"
                            >
                                <td className="px-3 py-3 text-center font-medium text-gray-900 border-r border-gray-200 bg-white sticky left-0 z-10">
                                    {idx + 1}
                                </td>
                                <td className="px-3 py-3 text-gray-700 border-r border-gray-200 bg-white sticky left-[70px] z-10">
                                    {row.dateHired}
                                </td>
                                <td className="px-3 py-3 text-gray-700 border-r border-gray-200 bg-white sticky left-[160px] z-10">
                                    {row.team}
                                </td>
                                <td className="px-3 py-3 text-gray-700 border-r border-gray-200 bg-white sticky left-[260px] z-10">
                                    {row.position}
                                </td>
                                <td className="px-3 py-3 text-gray-900 font-medium border-r border-gray-200 bg-white sticky left-[350px] z-10">
                                    {row.name}
                                </td>
                                <td className="px-3 py-3 text-gray-700 text-sm border-r border-gray-200 bg-white sticky left-[470px] z-10">
                                    {row.schedule}
                                </td>
                                <td className="px-3 py-3 text-gray-700 border-r border-gray-200 bg-white sticky left-[570px] z-10">
                                    {row.remarks}
                                </td>
                                {days.map((day, dayIdx) => (
                                    <td
                                        key={dayIdx}
                                        className={`px-3 py-3 text-center font-semibold border-r border-gray-200 ${getScheduleColor(
                                            row.schedule_days[day.key]
                                        )}`}
                                    >
                                        {row.schedule_days[day.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-6 bg-yellow-200 border border-yellow-300 rounded"></div>
                        <span className="text-gray-700">D - Day Shift</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-6 bg-green-200 border border-green-300 rounded"></div>
                        <span className="text-gray-700">N - Night Shift</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-6 bg-red-400 border border-red-500 rounded"></div>
                        <span className="text-gray-700">RD - Rest Day</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AttendanceChartMonth
