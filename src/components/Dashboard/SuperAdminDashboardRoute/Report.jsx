
import React, { useEffect, useState } from 'react';
import { Calendar, ImageIcon, User, FileText, Clock, CheckCircle, Trash2, Eye, EyeOff, X, Search, Filter, Download, Archive, Send, MessageSquare } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteReport, getAllReports, markReportAsSeen, getDeletedReports, replyToReport, } from '../../../redux/reportSlice';
import toast from 'react-hot-toast';

function Report() {
    const dispatch = useDispatch();
    const { allReports, deletedReports } = useSelector((state) => state.report);

    const [selectedReport, setSelectedReport] = useState(null);
    const [searchEmployee, setSearchEmployee] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All Departments');
    const [activeTab, setActiveTab] = useState('active');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [replies, setReplies] = useState({});
    const [selectedQuickReplies, setSelectedQuickReplies] = useState([]);

    const quickResponses = [
        'Acknowledged. Will review shortly.',
        'Thank you for the report. Action taken.',
        'Report received. Will follow up soon.',
        'Noted. Please provide more details if needed.',
        'Report reviewed. No immediate action required.',
    ];

    useEffect(() => {
        dispatch(getAllReports());
    }, [dispatch]);

    useEffect(() => {
        if (activeTab === 'archive') {
            dispatch(getDeletedReports());
        }
    }, [activeTab, dispatch]);

    const handleDelete = async (reportId) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                await dispatch(deleteReport(reportId)).unwrap();
                toast.success('Report deleted successfully');
                dispatch(getAllReports());
                if (activeTab === 'archive') {
                    dispatch(getDeletedReports());
                }
            } catch (error) {
                console.error('Failed to delete report:', error);
            }
        }
    };

    const handleMarkAsSeen = async (reportId, currentStatus) => {
        try {
            if (currentStatus === "seen") {
                toast("Already marked as seen");
                return;
            }

            await dispatch(markReportAsSeen(reportId)).unwrap();
            dispatch(getAllReports());
            if (activeTab === 'archive') {
                dispatch(getDeletedReports());
            }
        } catch (error) {
            console.error("Failed to mark as seen:", error);
        }
    };

    const handleReply = async (message) => {
        if (!selectedReport) return;

        // Single reply mode (for backward compatibility)
        const newReply = {
            id: Date.now(),
            message,
            timestamp: new Date(),
            sender: 'Admin'
        };

        setReplies(prev => ({
            ...prev,
            [selectedReport._id]: [...(prev[selectedReport._id] || []), newReply]
        }));

        setReplyMessage('');
        setShowReplyModal(false);
        toast.success('Reply sent successfully');
    };

    const handleMultiReply = async () => {
        if (!selectedReport) return;
        console.log(selectedReport, "selectedReport")

        const quickReplies = selectedQuickReplies;
        const customReplies = replyMessage.trim() ? [replyMessage.trim()] : [];

        if (quickReplies.length === 0 && customReplies.length === 0) {
            toast.error('Please select at least one quick reply or write a custom message');
            return;
        }

        try {
            await dispatch(replyToReport({
                reportId: selectedReport._id,
                quickReplies,
                customReplies
            })).unwrap();

            // Add local replies to state for immediate UI update
            const newReplies = [
                ...quickReplies.map(message => ({
                    id: Date.now() + Math.random(),
                    message,
                    timestamp: new Date(),
                    sender: 'Admin'
                })),
                ...customReplies.map(message => ({
                    id: Date.now() + Math.random(),
                    message,
                    timestamp: new Date(),
                    sender: 'Admin'
                }))
            ];

            setReplies(prev => ({
                ...prev,
                [selectedReport._id]: [...(prev[selectedReport._id] || []), ...newReplies]
            }));

            // Reset state
            setSelectedQuickReplies([]);
            setReplyMessage('');
            setShowReplyModal(false);

            // Refresh reports to get updated data from server
            dispatch(getAllReports());
        } catch (error) {
            console.error('Failed to send replies:', error);
        }
    };

    const toggleQuickReply = (response) => {
        setSelectedQuickReplies(prev =>
            prev.includes(response)
                ? prev.filter(r => r !== response)
                : [...prev, response]
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatFullDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const reportsToDisplay = activeTab === 'archive'
        ? (deletedReports || [])
        : (allReports?.filter(report => !report.isDeleted) || []);

    const filteredReports = reportsToDisplay.filter(report => {
        const employeeName = report.createdBy?.FullName?.toLowerCase() || '';
        if (searchEmployee && !employeeName.includes(searchEmployee.toLowerCase())) {
            return false;
        }

        const reportDepartment = report.createdBy?.department || '';
        if (departmentFilter !== 'All Departments' && reportDepartment !== departmentFilter) {
            return false;
        }

        if (dateFrom) {
            const reportDate = new Date(report.date || report.createdAt);
            const fromDate = new Date(dateFrom);
            if (reportDate < fromDate) return false;
        }
        if (dateTo) {
            const reportDate = new Date(report.date || report.createdAt);
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59);
            if (reportDate > toDate) return false;
        }

        return true;
    });

    const departments = ['All Departments', ...new Set(reportsToDisplay.map(r => r.createdBy?.department).filter(Boolean))];

    const exportToCSV = () => {
        const headers = ['Employee Name', 'Department', 'Role', 'Date', 'Time', 'Purpose', 'Details', 'Status'];
        const csvData = filteredReports.map(report => [
            report.createdBy?.FullName || 'Unknown',
            report.createdBy?.department || '',
            report.createdBy?.role || '',
            formatDate(report.date || report.createdAt),
            formatTime(report.createdAt),
            report.purpose || 'General Report',
            report.details?.replace(/\n/g, ' ') || '',
            report.status || 'sent'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('CSV exported successfully');
    };

    return (
        <div className='min-h-[92.7vh] pt-2 flex flex-col gap-6 text-white px-4'>
            <div className="flex justify-between items-start m-2 w-full">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        All Reports
                    </h1>
                    <p className="text-gray-400">
                        View and manage all reports from team members
                    </p>
                </div>
                {/* Right Section */}
                <div className="flex flex-col items-end gap-4 w-full max-w-3xl">

                    {/* Search */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Employee"
                            value={searchEmployee}
                            onChange={(e) => setSearchEmployee(e.target.value)}
                            className="w-full bg-[rgba(59,131,246,0.06)] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center w-full justify-between gap-4">

                        <div className="flex items-center gap-4 w-full">

                            <div className="relative w-full">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    value={departmentFilter}
                                    onChange={(e) => setDepartmentFilter(e.target.value)}
                                    className="w-full bg-[rgba(59,131,246,0.06)] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                >
                                    {departments.map(dept => (
                                        <option key={dept} value={dept} className="bg-gray-800">
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full bg-[rgba(59,131,246,0.06)] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            />

                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full bg-[rgba(59,131,246,0.06)] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex items-center gap-2">

                            <button
                                onClick={exportToCSV}
                                disabled={filteredReports.length === 0}
                                className="
      flex items-center gap-2 h-10 px-4 rounded-md
      bg-emerald-600/15 hover:bg-emerald-600/25
      border border-emerald-500/30
      text-emerald-400 font-medium text-sm
      transition-all backdrop-blur-sm
      disabled:opacity-40 disabled:cursor-not-allowed
    "
                            >
                                <Download size={16} />
                                Export
                            </button>

                            <div
                                className="
      h-10 flex items-center px-4 rounded-md
      bg-emerald-600/15
      border border-emerald-500/30
      text-emerald-400 font-medium text-sm
      backdrop-blur-sm
    "
                            >
                                Total:&nbsp;
                                <span className="text-white font-bold">{filteredReports.length}</span>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
            <div className="flex gap-2  border-b border-gray-700">
                <button
                    onClick={() => {
                        setActiveTab('active');
                        setSearchEmployee('');
                        setDepartmentFilter('All Departments');
                        setDateFrom('');
                        setDateTo('');
                    }}
                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'active'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-gray-300'
                        }`}
                >
                    Active Reports
                </button>
                <button
                    onClick={() => {
                        setActiveTab('archive');
                        setSearchEmployee('');
                        setDepartmentFilter('All Departments');
                        setDateFrom('');
                        setDateTo('');
                    }}
                    className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${activeTab === 'archive'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-gray-300'
                        }`}
                >
                    <Archive size={18} />
                    Archive Bin
                </button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.length === 0 ? (
                    <div className="col-span-full bg-[rgba(59,131,246,0.06)] rounded-xl p-12 text-center border border-gray-700">
                        {activeTab === 'archive' ? (
                            <>
                                <Archive size={48} className="mx-auto mb-4 text-gray-500" />
                                <p className="text-gray-400 text-lg">No archived reports found</p>
                                <p className="text-gray-500 text-sm mt-2">Deleted reports will appear here</p>
                            </>
                        ) : (
                            <>
                                <FileText size={48} className="mx-auto mb-4 text-gray-500" />
                                <p className="text-gray-400 text-lg">No active reports available</p>
                                <p className="text-gray-500 text-sm mt-2">Reports will appear here when created</p>
                            </>
                        )}
                    </div>
                ) : (
                    filteredReports.map((report) => {
                        const isSeen = report.status === "seen";
                        const isArchived = activeTab === 'archive';
                        const reportReplies = replies[report._id] || [];
                        return (
                            <div
                                key={report._id}
                                onClick={() => setSelectedReport(report)}
                                className={`bg-[rgba(59,131,246,0.06)] rounded-xl p-4 border transition-all duration-300 cursor-pointer  ${isArchived
                                    ? 'border-red-600/50 bg-red-600/5'
                                    : isSeen
                                        ? 'border-green-600/50'
                                        : 'border-gray-700'
                                    }`}
                            >
                                <div className='flex flex-col justify-between h-full'>
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`rounded-full p-2 flex-shrink-0 ${isArchived ? 'bg-red-600' : 'bg-blue-600'}`}>
                                                    {isArchived ? <Archive size={20} /> : <User size={20} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-base capitalize truncate">
                                                        {report.createdBy?.FullName || "Unknown User"}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {report.createdBy?.department || ""} • {report.createdBy?.role || "N/A"}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {formatDate(report.date || report.createdAt)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {formatTime(report.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isSeen
                                                    ? 'bg-green-600/20 text-green-400'
                                                    : 'bg-yellow-600/20 text-yellow-400'
                                                    }`}>
                                                    <CheckCircle size={12} />
                                                    {isSeen ? 'Seen' : 'Unseen'}
                                                </span>
                                                {report.imageUrl && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/40 px-3 py-2 rounded-lg border border-gray-700/50 mt-4">
                                                        <ImageIcon size={14} />
                                                        <span>Image attached</span>
                                                    </div>
                                                )}
                                                {reportReplies.length > 0 && (
                                                    <span className="text-xs text-purple-400 flex items-center gap-1">
                                                        <MessageSquare size={12} />
                                                        {reportReplies.length}
                                                    </span>
                                                )}
                                                {isArchived && report.deletedAt && (
                                                    <span className="text-xs text-red-400">
                                                        Deleted: {formatDate(report.deletedAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                                                {report.purpose || 'General Report'}
                                            </span>
                                        </div>

                                        <div className="rounded-lg mb-3">
                                            <h4 className="text-xs font-semibold text-gray-400 mb-2">Report Details:</h4>
                                            <p className="text-sm text-gray-300 whitespace-pre-line line-clamp-4">
                                                {report.details}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-gray-700">
                                        {!isArchived && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsSeen(report._id, report.status);
                                                    }}
                                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSeen
                                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                                        : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                                                        }`}
                                                    disabled={isSeen}
                                                >
                                                    {isSeen ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    {isSeen ? 'Seen' : 'Mark as Seen'}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedReport(report);
                                                        setShowReplyModal(true);
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 transition-all"
                                                >
                                                    <Send size={16} />
                                                    Reply
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(report._id);
                                            }}
                                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-all ${!isArchived ? '' : 'flex-1'
                                                }`}
                                        >
                                            <Trash2 size={16} />
                                            {isArchived ? 'Permanently Delete' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <div>

            </div>
            {selectedReport && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900/50 backdrop-blur-lg rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                        <div className="sticky top-0 bg-slate-900/50 border-b border-gray-800 p-6 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className={`rounded-full p-3 ${activeTab === 'archive' ? 'bg-red-600' : 'bg-blue-600'}`}>
                                    {activeTab === 'archive' ? <Archive size={24} /> : <User size={24} />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white capitalize">
                                        {selectedReport.createdBy?.FullName || "Unknown User"}
                                    </h2>
                                    <p className="text-gray-400">
                                        {selectedReport.createdBy?.department || ""} • {selectedReport.createdBy?.role || "N/A"}
                                    </p>
                                    {activeTab === 'archive' && (
                                        <p className="text-red-400 text-sm mt-1">
                                            🗑️ Archived Report
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex gap-3 flex-wrap">
                                <span className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${selectedReport.status === 'seen'
                                    ? 'bg-green-600/20 text-green-400'
                                    : 'bg-yellow-600/20 text-yellow-400'
                                    }`}>
                                    <CheckCircle size={16} />
                                    {selectedReport.status === 'seen' ? 'Seen' : 'Unseen'}
                                </span>
                                <span className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium">
                                    {selectedReport.purpose || 'General Report'}
                                </span>
                                {activeTab === 'archive' && (
                                    <span className="bg-red-600/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                        <Archive size={16} />
                                        Archived
                                    </span>
                                )}
                            </div>

                            {/* Date and Time */}
                            <div className="bg-[rgba(59,131,246,0.06)] rounded-lg p-4 border border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Date & Time Information</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-white">
                                        <Calendar size={18} className="text-blue-400" />
                                        <span className="text-sm">Report Date: {formatDate(selectedReport.date || selectedReport.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <Clock size={18} className="text-blue-400" />
                                        <span className="text-sm">Created: {formatFullDateTime(selectedReport.createdAt)}</span>
                                    </div>
                                    {activeTab === 'archive' && selectedReport.deletedAt && (
                                        <div className="flex items-center gap-2 text-red-400">
                                            <Trash2 size={18} />
                                            <span className="text-sm">Deleted: {formatFullDateTime(selectedReport.deletedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Report Details */}
                            <div className="bg-[rgba(59,131,246,0.06)] rounded-lg p-4 border border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Report Details</h3>
                                <div className="max-h-96 overflow-y-auto">
                                    <p className="text-white whitespace-pre-line leading-relaxed">
                                        {selectedReport.details}
                                    </p>
                                </div>
                            </div>

                            {/* Replies Section */}
                            {replies[selectedReport._id] && replies[selectedReport._id].length > 0 && (
                                <div className="bg-[rgba(59,131,246,0.06)] rounded-lg p-4 border border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                                        <MessageSquare size={16} />
                                        Replies ({replies[selectedReport._id].length})
                                    </h3>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {replies[selectedReport._id].map(reply => (
                                            <div key={reply.id} className="bg-slate-800/50 rounded-lg p-3 border border-gray-700">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm font-medium text-purple-400">{reply.sender}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {reply.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300">{reply.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedReport.imageUrl && (
                                <div className="bg-[rgba(59,131,246,0.06)] rounded-lg p-4 border border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Attachment</h3>
                                    <img
                                        src={selectedReport.imageUrl}
                                        alt="Report attachment"
                                        className="w-full rounded-lg border border-gray-700"
                                    />
                                </div>
                            )}
                            {/* Actions */}
                            <div className="flex gap-3">
                                {activeTab !== 'archive' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleMarkAsSeen(selectedReport._id, selectedReport.status);
                                            }}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${selectedReport.status === 'seen'
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                                : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                                                }`}
                                            disabled={selectedReport.status === 'seen'}
                                        >
                                            {selectedReport.status === 'seen' ? <EyeOff size={20} /> : <Eye size={20} />}
                                            {selectedReport.status === 'seen' ? 'Already Seen' : 'Mark as Seen'}
                                        </button>
                                        <button
                                            onClick={() => setShowReplyModal(true)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 transition-all"
                                        >
                                            <Send size={20} />
                                            Reply Report
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => {
                                        handleDelete(selectedReport._id);
                                        setSelectedReport(null);
                                    }}
                                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-all ${activeTab === 'archive' ? 'flex-1' : ''
                                        }`}
                                >
                                    <Trash2 size={20} />
                                    {activeTab === 'archive' ? 'Permanently Delete' : 'Delete Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reply Modal */}
            {showReplyModal && selectedReport && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900/50 backdrop-blur-lg rounded-xl max-w-2xl w-full border border-gray-700">
                        <div className="border-b border-gray-800 p-6 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Reply to Report</h2>
                                <p className="text-gray-400 text-sm mt-1">From: {selectedReport.createdBy?.FullName || "Unknown User"}</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    You can select multiple quick replies and/or write a custom message
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowReplyModal(false);
                                    setReplyMessage('');
                                    setSelectedQuickReplies([]);
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Quick Responses */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                                    Quick Responses
                                    {selectedQuickReplies.length > 0 && (
                                        <span className="ml-2 text-purple-400">
                                            ({selectedQuickReplies.length} selected)
                                        </span>
                                    )}
                                </h3>
                                <div className="space-y-2 mb-6">
                                    {quickResponses.map((response, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => toggleQuickReply(response)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${selectedQuickReplies.includes(response)
                                                ? 'bg-purple-600/20 border-purple-600/50 text-white'
                                                : 'bg-slate-800/30 hover:bg-slate-800/50 border-gray-700 hover:border-purple-600/50 text-gray-300 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedQuickReplies.includes(response)
                                                    ? 'bg-purple-600 border-purple-600'
                                                    : 'border-gray-600'
                                                    }`}>
                                                    {selectedQuickReplies.includes(response) && (
                                                        <CheckCircle size={14} className="text-white" />
                                                    )}
                                                </div>
                                                <span>{response}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Reply */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Write Custom Reply</h3>
                                <textarea
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Type your custom message here..."
                                    className="w-full bg-[rgba(59,131,246,0.06)] border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                                    rows={6}
                                />
                                <div className="text-xs text-gray-500 mt-2">
                                    {replyMessage.length} / 1000 characters
                                </div>
                            </div>

                            {/* Send Button */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleMultiReply}
                                    disabled={selectedQuickReplies.length === 0 && !replyMessage.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={20} />
                                    Send {selectedQuickReplies.length + (replyMessage.trim() ? 1 : 0)} {selectedQuickReplies.length + (replyMessage.trim() ? 1 : 0) === 1 ? 'Reply' : 'Replies'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowReplyModal(false);
                                        setReplyMessage('');
                                        setSelectedQuickReplies([]);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-gray-700/30 hover:bg-gray-700/50 text-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Report;