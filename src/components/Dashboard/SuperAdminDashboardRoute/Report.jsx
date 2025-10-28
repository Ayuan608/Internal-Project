import React, { useEffect } from 'react';
import { Calendar, User, FileText, Clock, CheckCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteReport, getAllReports, markReportAsSeen } from '../../../redux/reportSlice';
import toast from 'react-hot-toast';

function Report() {
    const dispatch = useDispatch();
    const { allReports } = useSelector((state) => state.report);

    useEffect(() => {
        dispatch(getAllReports());
    }, [dispatch]);

    const handleDelete = async (reportId) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                await dispatch(deleteReport(reportId)).unwrap();
                toast.success('Report deleted successfully');
                dispatch(getAllReports());
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
        } catch (error) {
            console.error("Failed to mark as seen:", error);
        }
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

    return (
        <div className='min-h-[92.7vh] pt-5 flex flex-col gap-6 text-white px-4'>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">All Reports</h1>
                    <p className="text-gray-400">View and manage all reports from team members.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-[rgba(59,131,246,0.06)] border border-gray-700 rounded-lg px-4 py-2">
                        <p className="text-sm text-gray-400">Total Reports: <span className="text-white font-semibold">{allReports?.length || 0}</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {!allReports || allReports.length === 0 ? (
                    <div className="col-span-full bg-[rgba(59,131,246,0.06)] rounded-xl p-12 text-center border border-gray-700">
                        <FileText size={48} className="mx-auto mb-4 text-gray-500" />
                        <p className="text-gray-400 text-lg">No reports available</p>
                    </div>
                ) : (
                    allReports.map((report) => {
                        const isSeen = report.status === "seen";
                        return (
                            <div 
                                key={report._id} 
                                className={`bg-[rgba(59,131,246,0.06)] rounded-xl p-4 border transition-all duration-300 ${
                                    isSeen ? 'border-green-600/50' : 'border-[var(--box-border)]'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
                                            <User size={20} />
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
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                            isSeen 
                                                ? 'bg-green-600/20 text-green-400' 
                                                : 'bg-yellow-600/20 text-yellow-400'
                                        }`}>
                                            <CheckCircle size={12} />
                                            {isSeen ? 'Seen' : 'Unseen'}
                                        </span>
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

                                <div className="flex gap-2 pt-3 border-t border-gray-700">
                                    <button
                                        onClick={() => handleMarkAsSeen(report._id, report.status)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                            isSeen
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                                : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                                        }`}
                                        disabled={isSeen}
                                    >
                                        {isSeen ? <EyeOff size={16} /> : <Eye size={16} />}
                                        {isSeen ? 'Seen' : 'Mark as Seen'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(report._id)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-all"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Report;
