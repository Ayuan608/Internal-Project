import { AlertCircle, CheckCircle, Search, Calendar, Clock, Users, TrendingUp, XCircle, Coffee, LogOut, LogIn, FileText, PlusCircle, X, Send, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAttendance } from "./../../../redux/attendenceSlice";
import { useEffect, useState } from "react";

const AttendanceRecords = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedRole, setSelectedRole] = useState("All");
    const [selectedPeriod, setSelectedPeriod] = useState('daily');
    const dispatch = useDispatch();

    const { allAttendance } = useSelector((state) => state.attendance);
    const attendanceData = allAttendance || [];

    // Modal states
    const [isFilingModalOpen, setIsFilingModalOpen] = useState(false);
    const [isCaseTemplateOpen, setIsCaseTemplateOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedCase, setSelectedCase] = useState("");

    // Case template form data
    const [caseFormData, setCaseFormData] = useState({
        title: '',
        nature: '',
        from: 'Team Leader',
        to: '',
        content: ''
    });

    const caseOptions = [
        "Missed Punch-In",
        "Missed Punch-Out",
        "Late Arrival",
        "Early Leave",
        "System Error",
        "Other",
    ];

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
            <AlertCircle className="w-4 h-4 text-red-400" />
        ) : (
            <CheckCircle className="w-4 h-4 text-green-400" />
        );

    const getStatusColor = (status) =>
        status === "VIOLATION"
            ? "text-red-400 bg-red-500/20 border-red-500/30"
            : "text-green-400 bg-green-500/20 border-green-500/30";

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

    // Calculate metrics
    const calculateMetrics = () => {
        const totalRecords = filteredData.length;
        const missedPunchIn = filteredData.filter(r => !r.clockIn).length;
        const missedPunchOut = filteredData.filter(r => !r.clockOut).length;
        const violations = filteredData.filter(r => r.alert === 'VIOLATION').length;
        const completeShifts = filteredData.filter(r => {
            if (!r.workingHours) return false;
            const hours = parseFloat(r.workingHours);
            return hours >= 6;
        }).length;

        return {
            totalRecords,
            missedPunchIn,
            missedPunchOut,
            violations,
            completeShifts,
            avgMissedPunchIn: totalRecords > 0 ? ((missedPunchIn / totalRecords) * 100).toFixed(1) : '0.0',
            avgMissedPunchOut: totalRecords > 0 ? ((missedPunchOut / totalRecords) * 100).toFixed(1) : '0.0',
            completionRate: totalRecords > 0 ? ((completeShifts / totalRecords) * 100).toFixed(1) : '0.0',
            violationRate: totalRecords > 0 ? ((violations / totalRecords) * 100).toFixed(1) : '0.0'
        };
    };

    const generateCaseContent = (caseType, record) => {
        const date = new Date(record.date).toLocaleDateString();
        const name = record.user?.FullName;
        const role = record.user?.role;

        const templates = {
            "Missed Punch-In": `Dear ${role} - ${name},

This letter serves as a formal notice regarding your missed punch-in on ${date}. According to our attendance records, you did not punch in for your scheduled shift.

Attendance and adherence to punch-in/out procedures are critical to maintaining workplace discipline and productivity. We expect all employees to follow the attendance policy strictly.

Please ensure that you punch in for all scheduled shifts moving forward. Repeated violations may result in disciplinary action.

If you have a valid reason for this absence, please contact your team leader immediately.

Regards,
Team Leader`,

            "Missed Punch-Out": `Dear ${role} - ${name},

This is to inform you that you have a missed punch-out record for ${date}. You failed to punch out at the end of your shift, which violates our attendance protocol.

Proper punch-out is essential for accurate time tracking and payroll processing. We require all employees to punch out before leaving their workplace.

Please make sure to punch out at the end of every shift. Continued non-compliance will lead to further disciplinary measures.

Contact your team leader if you need assistance with the punch system.

Regards,
Team Leader`,

            "Late Arrival": `Dear ${role} - ${name},

This notice is regarding your late arrival on ${date}. Punctuality is an important aspect of professional conduct and is expected of all employees.

Arriving late disrupts team workflow and affects overall productivity. We trust you will make efforts to arrive on time for all future shifts.

Please be advised that repeated instances of tardiness may result in disciplinary action as per company policy.

We appreciate your prompt attention to this matter.

Regards,
Team Leader`,

            "Early Leave": `Dear ${role} - ${name},

This is to formally notify you about your early departure from work on ${date}. Leaving before the completion of your scheduled shift requires prior approval.

All employees are expected to complete their full shift unless there is an emergency or prior authorization. Unauthorized early leaves are a breach of workplace conduct standards.

Please ensure you complete your full shift going forward. Repeated violations will be subject to disciplinary procedures.

If you have a legitimate reason, please discuss with your team leader.

Regards,
Team Leader`,

            "System Error": `Dear ${role} - ${name},

We are writing to inform you that there appears to be a system error in your attendance record for ${date}. We are investigating this matter and will resolve it shortly.

In the meantime, please provide any documentation or details about this discrepancy so we can correct it promptly.

We apologize for any inconvenience this may cause.

Regards,
Team Leader`,

            "Other": `Dear ${role} - ${name},

This letter is regarding an attendance-related matter on ${date}. Please contact your team leader to discuss this issue in detail.

We look forward to resolving this matter amicably.

Regards,
Team Leader`
        };

        return templates[caseType] || templates["Other"];
    };

    const handleFileClick = (record) => {
        setSelectedRecord(record);
        setSelectedCase("");
        setIsFilingModalOpen(true);
    };

    const handleCreateCaseClick = () => {
        if (!selectedCase) {
            alert("Please select a case type!");
            return;
        }

        // Initialize case template data
        setCaseFormData({
            title: `${selectedCase} - ${selectedRecord.user?.FullName}`,
            nature: selectedCase,
            from: 'Team Leader',
            to: `${selectedRecord.user?.role} - ${selectedRecord.user?.FullName}`,
            content: generateCaseContent(selectedCase, selectedRecord)
        });

        setIsFilingModalOpen(false);
        setIsCaseTemplateOpen(true);
    };

    const handleCaseFormChange = (field, value) => {
        setCaseFormData({ ...caseFormData, [field]: value });
    };

    const handleSendCase = () => {
        console.log("Case sent:", caseFormData);
        alert("Case created and sent successfully!");

        // 🔥 Call API or Redux action here
        // await dispatch(createCase(caseFormData));

        setIsCaseTemplateOpen(false);
        setSelectedCase("");
        setSelectedRecord(null);
        setCaseFormData({
            title: '',
            nature: '',
            from: 'Team Leader',
            to: '',
            content: ''
        });
    };

    const metrics = calculateMetrics();

    return (
        <div className="min-h-screen text-white p-6 ">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Daily Punch Record
                    </h1>
                    <p className="text-slate-400">Monitor attendance metrics and track violations</p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setSelectedPeriod('daily')}
                        className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${selectedPeriod === 'daily'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700'
                            }`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setSelectedPeriod('weekly')}
                        className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${selectedPeriod === 'weekly'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700'
                            }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setSelectedPeriod('monthly')}
                        className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${selectedPeriod === 'monthly'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700'
                            }`}
                    >
                        Monthly
                    </button>
                </div>

                {/* Violations Metrics */}
                <div className="bg-[rgba(59,130,246,0.03)] rounded-2xl p-6 mb-8 border border-slate-700/50 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-2 rounded-xl">
                            <AlertCircle className="w-6 h-6 text-yellow-400" />
                        </div>
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            Attendance Violations & Averages
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Missed Punch In */}
                        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-5 border border-red-500/20 hover:border-red-500/40 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 p-3 rounded-xl">
                                    <LogIn className="w-6 h-6 text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Missed Punch In</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-red-400">{metrics.missedPunchIn}</span>
                                        <span className="text-sm text-slate-500">records</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <span className="text-xs text-slate-500 font-medium">Average</span>
                                <span className="text-lg font-bold text-red-400">{metrics.avgMissedPunchIn}%</span>
                            </div>
                        </div>

                        {/* Missed Punch Out */}
                        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-5 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-3 rounded-xl">
                                    <LogOut className="w-6 h-6 text-orange-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Missed Punch Out</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-orange-400">{metrics.missedPunchOut}</span>
                                        <span className="text-sm text-slate-500">records</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <span className="text-xs text-slate-500 font-medium">Average</span>
                                <span className="text-lg font-bold text-orange-400">{metrics.avgMissedPunchOut}%</span>
                            </div>
                        </div>

                        {/* Total Violations */}
                        <div className="bg-[rgba(59,130,246,0.03)] rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-3 rounded-xl">
                                    <XCircle className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">All Violations</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-purple-400">{metrics.violations}</span>
                                        <span className="text-sm text-slate-500">issues</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <span className="text-xs text-slate-500 font-medium">Violation Rate</span>
                                <span className="text-lg font-bold text-purple-400">{metrics.violationRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Table Section */}
                <div className="bg-[rgba(59,130,246,0.03)] rounded-2xl overflow-hidden border border-slate-700/50 backdrop-blur-sm">
                    {/* Header with Search */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5 border-b border-slate-700/50">
                        <h2 className="text-xl font-bold text-white">Detailed Records</h2>

                        <div className="relative">
                            <Search className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, role or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-3 rounded-xl text-white text-sm border border-slate-700 focus:outline-none focus:border-blue-500 bg-slate-900/50 min-w-[320px] transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-900/80 border-b border-slate-700/50">
                                <tr>
                                    {[
                                        "USER ID",
                                        "DATE",
                                        "NAME",
                                        "SHIFT",
                                        "PUNCH IN",
                                        "PUNCH OUT",
                                        "TOTAL HOURS",
                                        "STATUS",
                                    ].map((header) => (
                                        <th
                                            key={header}
                                            className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-700/30">
                                {filteredData.length > 0 ? (
                                    filteredData.map((record, index) => (
                                        <tr key={index} className="hover:bg-slate-800/30 transition-colors duration-200">
                                            <td className="px-6 py-4 text-sm text-slate-300 font-mono whitespace-nowrap">
                                                {record._id ? record._id.slice(0, 8) : ""}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm capitalize text-white font-medium whitespace-nowrap">
                                                {record.user?.FullName}
                                            </td>

                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold border border-blue-500/30">
                                                    {record.shift}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                                                {record.clockIn
                                                    ? new Date(record.clockIn).toLocaleTimeString()
                                                    : <span className="text-red-400 font-semibold">Not Punched In</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                {record.clockOut
                                                    ? <span className="text-slate-300">{new Date(record.clockOut).toLocaleTimeString()}</span>
                                                    : <span className="text-orange-400 font-semibold">Not Punched Out</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                <span className={`font-bold ${parseFloat(record.workingHours) < 6 ? 'text-yellow-400' : 'text-green-400'
                                                    }`}>
                                                    {record.workingHours}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex items-center gap-3 whitespace-nowrap">
                                                <div
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border ${getStatusColor(
                                                        record.alert
                                                    )}`}
                                                >
                                                    {getStatusIcon(record.alert)}
                                                    {record.alert}
                                                </div>

                                                <button
                                                    onClick={() => handleFileClick(record)}
                                                    className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold rounded-md px-4 py-1.5 cursor-pointer hover:from-yellow-500 hover:to-amber-600 transition-all shadow-lg"
                                                >
                                                    <FileText size={18} />
                                                    <span className="text-sm">File</span>
                                                </button>


                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="text-center text-slate-400 py-12 text-sm"
                                        >
                                            <div className="flex flex-col items-center gap-3">
                                                <AlertCircle className="w-12 h-12 text-slate-600" />
                                                <p className="text-lg font-medium">No records found</p>
                                                <p className="text-xs text-slate-500">Try adjusting your search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-900/80 px-6 py-4 border-t border-slate-700/50">
                        <div className="flex justify-between items-center text-sm text-slate-300">
                            <span className="font-medium">Showing <span className="text-blue-400 font-bold">{filteredData.length}</span> records</span>
                            <span className="text-slate-400">Updated: {new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filing Modal - Select Case Type */}
            {isFilingModalOpen && (
                <div className="fixed inset-0 bg-black/50  backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[rgba(59,130,246,0.03)] backdrop-blur-md text-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">
                                Create Case - {selectedRecord?.user?.FullName}
                            </h2>
                            <button
                                onClick={() => setIsFilingModalOpen(false)}
                                className="text-gray-500 hover:text-gray-300"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
                            {caseOptions.map((option, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedCase(option)}
                                    className={`cursor-pointer px-4 py-3 rounded-lg border transition ${selectedCase === option
                                            ? "bg-blue-600 text-white border-blue-500"
                                            : "bg-[rgba(59,130,246,0.03)] border-gray-800 hover:bg-gray-900/80"
                                        }`}
                                >
                                    <p className="font-medium text-sm">{option}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleCreateCaseClick}
                            disabled={!selectedCase}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors"
                        >
                            <PlusCircle size={18} />
                            Create Case
                        </button>
                    </div>
                </div>
            )}

            {/* Case Template Modal */}
            {isCaseTemplateOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 text-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
                        {/* Header */}
                        <div className="bg-gray-800 p-5 border-b border-gray-700 flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-wide">CASE TEMPLATE</h2>
                            <button
                                onClick={() => setIsCaseTemplateOpen(false)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Title */}
                            <div className="flex items-start gap-4">
                                <label className="text-gray-400 w-20 pt-2.5 font-mono text-sm">Title:</label>
                                <input
                                    type="text"
                                    value={caseFormData.title}
                                    onChange={(e) => handleCaseFormChange('title', e.target.value)}
                                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            {/* Nature */}
                            <div className="flex items-start gap-4">
                                <label className="text-gray-400 w-20 pt-2.5 font-mono text-sm">Nature:</label>
                                <input
                                    type="text"
                                    value={caseFormData.nature}
                                    onChange={(e) => handleCaseFormChange('nature', e.target.value)}
                                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            {/* From */}
                            <div className="flex items-start gap-4">
                                <label className="text-gray-400 w-20 pt-2.5 font-mono text-sm">From:</label>
                                <input
                                    type="text"
                                    value={caseFormData.from}
                                    onChange={(e) => handleCaseFormChange('from', e.target.value)}
                                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            {/* To */}
                            <div className="flex items-start gap-4">
                                <label className="text-gray-400 w-20 pt-2.5 font-mono text-sm">To:</label>
                                <input
                                    type="text"
                                    value={caseFormData.to}
                                    onChange={(e) => handleCaseFormChange('to', e.target.value)}
                                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            {/* Letter Content */}
                            <div className="mt-6">
                                <label className="text-gray-400 font-mono text-sm block mb-2">Content:</label>
                                <textarea
                                    value={caseFormData.content}
                                    onChange={(e) => handleCaseFormChange('content', e.target.value)}
                                    className="w-full h-80 bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none font-mono text-sm leading-relaxed"
                                    placeholder="Letter content..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700 flex justify-between gap-3">
                            <button
                                onClick={() => setIsCaseTemplateOpen(false)}
                                className="px-6 py-2.5 bg-gray-700 text-white hover:bg-gray-600 rounded transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendCase}
                                className="px-6 py-2.5 bg-white text-gray-900 hover:bg-gray-100 rounded transition-colors flex items-center gap-2 font-semibold"
                            >
                                <Send size={18} />
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceRecords;