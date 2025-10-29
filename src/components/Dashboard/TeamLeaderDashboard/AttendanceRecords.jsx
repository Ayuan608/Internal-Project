import { AlertCircle, CheckCircle, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAttendance } from "./../../../redux/attendenceSlice";
import { useEffect, useState } from "react";

const AttendanceRecords = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedRole, setSelectedRole] = useState("All");
    const dispatch = useDispatch();

    const { allAttendance } = useSelector((state) => state.attendance);
    const attendanceData = allAttendance || [];

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                await dispatch(
                    getAllAttendance({
                        startDate: startDate || undefined,
                        endDate: endDate || undefined,
                        department:
                            selectedDepartment !== "All" ? selectedDepartment : undefined,
                        role: selectedRole !== "All" ? selectedRole : undefined,
                        page: 1,
                        limit: 100,
                    })
                ).unwrap();
            } catch (error) {
                console.error("Failed to fetch attendance data:", error);
            }
        };

        fetchAttendanceData();
    }, [dispatch, startDate, endDate, selectedDepartment, selectedRole]);

    const getStatusIcon = (status) =>
        status === "VIOLATION" ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
        ) : (
            <CheckCircle className="w-4 h-4 text-green-500" />
        );

    const getStatusColor = (status) =>
        status === "VIOLATION"
            ? "text-red-600 bg-red-50 border-red-200"
            : "text-green-600 bg-green-50 border-green-200";

    // 🔍 Filter Data by Search
    const filteredData = attendanceData.filter((record) => {
        const name = record.user?.FullName?.toLowerCase() || "";
        const department = record.user?.department?.toLowerCase() || "";
        const role = record.user?.role?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();

        return (
            (name.includes(search) ||
                department.includes(search) ||
                role.includes(search)) &&
            (selectedDepartment === "All" ||
                record.user?.department === selectedDepartment) &&
            (selectedRole === "All" || record.user?.role === selectedRole)
        );
    });

    return (
        <>
            <div className="flex flex-wrap items-center gap-3 justify-end my-5">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name, role or dept..."   
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-2 rounded-md text-white text-sm border border-slate-800 focus:outline-none bg-transparent min-w-[280px]"
                    />
                </div>
            </div>

            <div className="w-[calc(100vw-240px)] bg-[rgba(59,130,246,0.03)] rounded-lg shadow-lg border_gray overflow-hidden m-2">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-white">
                        Attendance Records
                    </h2>

                    {/* 🔍 Filters */}

                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[rgba(59,130,246,0.03)] border-b border-gray-200">
                            <tr>
                                {[
                                    "USER ID",
                                    "DATE",
                                    "NAME",
                                    "ROLE",
                                    "PUNCH IN",
                                    "SHIFT",
                                    "DEPARTMENT",
                                    "PUNCH OUT",
                                    "TOTAL HOURS",
                                    "STATUS",
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="bg-[rgba(59,130,246,0.03)]">
                            {filteredData.length > 0 ? (
                                filteredData.map((record, index) => (
                                    <tr key={index} className="border_gray">
                                        <td className="px-6 py-4 text-sm text-white font-medium whitespace-nowrap">
                                            {record._id ? record._id.slice(0, 8) : ""}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                                            {new Date(record.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                                            {record.user?.FullName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                                            {record.user?.role}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                                            {record.clockIn
                                                ? new Date(record.clockIn).toLocaleTimeString()
                                                : "Not Punched In"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                                            {record.shift}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                                            {record.user?.department}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                                            {record.clockOut
                                                ? new Date(record.clockOut).toLocaleTimeString()
                                                : "Not Punched Out"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                                            {record.workingHours}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div
                                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                                    record.alert
                                                )}`}
                                            >
                                                {getStatusIcon(record.alert)}
                                                {record.alert}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="10"
                                        className="text-center text-gray-400 py-6 text-sm"
                                    >
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="bg-[rgba(59,130,246,0.03)] px-6 py-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm text-white">
                        <span>Showing {filteredData.length} records</span>
                        <span>Updated: {new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AttendanceRecords;
