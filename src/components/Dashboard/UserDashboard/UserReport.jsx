import React, { useState, useEffect } from 'react'
import { X, Send, Calendar, User, FileText, Paperclip, Clock, CheckCircle, Eye } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { createReport, getReports } from '../../../redux/reportSlice';

function UserReport() {
    const dispatch = useDispatch();
    const { reportsData } = useSelector((state) => state.report);
    console.log("report data user", reportsData)
    const [isReportModal, setIsReportModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [timeFilter, setTimeFilter] = useState('6');

    useEffect(() => {
        dispatch(getReports());
    }, [dispatch]);

    const [formData, setFormData] = useState({
        date: new Date().toLocaleDateString('en-US'),
        purpose: 'Daily Performance Report',
        details: '',
        image: null, // Single image
        imagePreview: null, // For preview
    });

    const handleSubmit = async () => {
        if (!formData.details.trim()) {
            alert('Please enter report details');
            return;
        }

        const reportData = {
            date: formData.date,
            purpose: formData.purpose,
            details: formData.details,
            image: formData.image,
        };
        console.log('📤 Submitting report:', {
            ...reportData,
            image: reportData.image ? reportData.image.name : null
        });

        const result = await dispatch(createReport(reportData));

        if (result.type === 'report/create/fulfilled') {
            const adminToken = localStorage.getItem("superAdminFcmToken");
            if (adminToken) {
                const notificationPayload = {
                    to: adminToken,
                    notification: {
                        title: "📝 New Report Submitted",
                        body: `${formData.purpose} — ${formData.details.slice(0, 60)}...`,
                        icon: "/firebase-logo.png",
                        click_action: "http://localhost:5173/dashboard",
                    },
                };

                await fetch("https://fcm.googleapis.com/fcm/send", {
                    method: "POST",
                    headers: {
                        Authorization: "BPRGFHQY1lsEbWVSqe7ovs4IP3Cdh2AnDm372BY7vl27eUkOSYBgx-LkAGrqQ6D9-R_m9TKUsa8FtPgXjEde_zg", // 🔥 from Firebase Cloud Messaging
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(notificationPayload),
                });

                console.log("✅ Notification sent to Super Admin via FCM");
            } else {
                console.warn("⚠️ No Super Admin FCM token found in localStorage");
            }
            setFormData({
                date: new Date().toLocaleDateString('en-US'),
                purpose: 'Daily Performance Report',
                details: '',
                image: null,
                imagePreview: null,
            });
            setIsReportModal(false);
        } else {
            alert('Failed to send report. Try again.');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    image: file,
                    imagePreview: reader.result
                });
            };
            reader.readAsDataURL(file);

            console.log('🖼️ Image selected:', file.name);
        }
    };

    const removeImage = () => {
        setFormData({
            ...formData,
            image: null,
            imagePreview: null
        });
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, file: file.name });
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

    // Filter based on selected time period
    const getFilteredDate = () => {
        const today = new Date();
        const filterDate = new Date();
        filterDate.setMonth(filterDate.getMonth() - parseInt(timeFilter));
        return filterDate;
    };

    const filteredReports = reportsData?.filter(report => {
        const reportDate = new Date(report.date || report.createdAt);
        return reportDate >= getFilteredDate();
    }) || [];

    return (
        <>
            <div className='min-h-[92.7vh] pt-5 flex flex-col gap-6 text-white px-4'>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Daily Reports</h1>
                        <p className="text-gray-400">Streamline your workflow by sending and tracking daily reports to ensure consistent team performance.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value)}
                                className="bg-emerald-600/15 border border-emerald-500/30 rounded-lg pl-4 pr-10 py-3.5 text-emerald-400 font-medium text-sm backdrop-blur-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                            >
                                <option value="1" className="bg-gray-800 text-white">Last Month Data</option>
                                <option value="2" className="bg-gray-800 text-white">Last 2 Months Data</option>
                                <option value="6" className="bg-gray-800 text-white">Last 6 Months Data</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsReportModal(true)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <FileText size={20} />
                            Add Report
                        </button>
                    </div>
                </div>

                {/* Reports List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.length === 0 ? (
                        <div className="col-span-3 bg-gray-900/50 rounded-xl p-12 text-center border border-gray-800">
                            <FileText size={48} className="mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-400 text-lg">No reports found for the selected time period</p>
                        </div>
                    ) : (
                        filteredReports.map((report) => {
                            const isSeen = report.status === "seen";
                            return (
                                <div
                                    key={report._id}
                                    onClick={() => setSelectedReport(report)}
                                    className="bg-gray-900/60 backdrop-blur-md border border-gray-800 hover:shadow-xl rounded-xl p-6 transition-all duration-300 cursor-pointer"
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white text-base">
                                                {report.createdBy?.FullName || ""}
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {report.createdBy?.role || "Team Member"}
                                            </p>

                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={12} />
                                                    {formatDate(report.createdAt)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={12} />
                                                    {formatTime(report.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full ${isSeen
                                                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                                : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                                                }`}>
                                                <CheckCircle size={12} />
                                                {isSeen ? 'Seen' : 'Sent'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Purpose Tag */}
                                    <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full inline-block mb-3">
                                        {report.purpose}
                                    </span>

                                    {/* Details */}
                                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-6 whitespace-pre-line">
                                        {report.details}
                                    </p>

                                    {/* File */}
                                    {report.imageUrl && (
                                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/40 px-3 py-2 rounded-lg border border-gray-700/50 mt-4">
                                            <Paperclip size={14} />
                                            <span>Attachment: {report.imageUrl}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Detail Popup Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900/50 backdrop-blur-lg rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-slate-900/50 border-b border-gray-800 p-6 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-600 rounded-full p-3">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white capitalize">
                                        {selectedReport.createdBy?.FullName || "Unknown User"}
                                    </h2>
                                    <p className="text-gray-400">
                                        {selectedReport.createdBy?.role || "Team Member"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Status and Purpose */}
                            <div className="flex gap-3 flex-wrap">
                                <span className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${selectedReport.status === 'seen'
                                    ? 'bg-green-600/20 text-green-400'
                                    : 'bg-yellow-600/20 text-yellow-400'
                                    }`}>
                                    {selectedReport.status === 'seen' ? (
                                        <>
                                            <Eye size={16} />
                                            Seen by Super-Admin
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={16} />
                                            Sent
                                        </>
                                    )}
                                </span>
                                <span className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium">
                                    {selectedReport.purpose || 'General Report'}
                                </span>
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

                            {/* File Attachment */}
                            {selectedReport.file && (
                                <div className="bg-[rgba(59,131,246,0.06)] rounded-lg p-4 border border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Attachment</h3>
                                    <div className="flex items-center gap-2 text-white">
                                        <Paperclip size={18} className="text-blue-400" />
                                        <span className="text-sm">{selectedReport.file}</span>
                                    </div>
                                </div>
                            )}

                            {/* Close Button */}
                            <div className="flex justify-end pt-4 border-t border-gray-700">
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="px-6 py-3 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Report Modal */}
            {isReportModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4'>
                    <div className='bg-[rgba(59,130,246,0.03)] backdrop-blur-md text-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-800 max-h-[90vh] overflow-y-auto'>
                        <div className='sticky top-0 bg-[rgba(59,130,246,0.03)] backdrop-brightness-0 border-b border-gray-800 px-8 py-5 flex justify-between items-center z-10'>
                            <div>
                                <h2 className='text-2xl font-bold text-white'>Daily Report to Super Admin</h2>
                                <p className="text-sm text-gray-400 mt-1">Submit your daily performance report</p>
                            </div>
                            <button
                                onClick={() => setIsReportModal(false)}
                                className='text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-all duration-200'
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className='p-8 space-y-6'>
                            {/* Date */}
                            <div>
                                <label className='block text-sm font-semibold mb-2.5 text-gray-200'>
                                    Date <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type='text'
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className='w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-500'
                                        placeholder="MM/DD/YYYY"
                                    />
                                </div>
                            </div>

                            {/* Purpose */}
                            {/* Purpose */}
                            <div>
                                <label className='block text-sm font-semibold mb-2.5 text-gray-200'>
                                    Purpose <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={formData.purpose === 'Daily Performance Report' || formData.purpose === 'Weekly Summary Report' || formData.purpose === 'Issue Report' || formData.purpose === 'Progress Report' ? formData.purpose : 'Others'}
                                    onChange={(e) => {
                                        if (e.target.value === 'Others') {
                                            setFormData({ ...formData, purpose: '' });
                                        } else {
                                            setFormData({ ...formData, purpose: e.target.value });
                                        }
                                    }}
                                    className='w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white cursor-pointer'
                                >
                                    <option>Daily Performance Report</option>
                                    <option>Weekly Summary Report</option>
                                    <option>Issue Report</option>
                                    <option>Progress Report</option>
                                    <option>Others</option>
                                </select>

                                {/* Conditional input for "Others" */}
                                {(formData.purpose === '' || (formData.purpose !== 'Daily Performance Report' && formData.purpose !== 'Weekly Summary Report' && formData.purpose !== 'Issue Report' && formData.purpose !== 'Progress Report')) && (
                                    <input
                                        type='text'
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                        placeholder='Specify your concern...'
                                        className='w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-500 mt-3'
                                    />
                                )}
                            </div>

                            {/* Details */}
                            <div>
                                <label className='block text-sm font-semibold mb-2.5 text-gray-200'>
                                    Details <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    placeholder='Enter report details...

Example:
- Team Performance: 15/20 members met quota (75%)
- Morning Shift: 87% quota achievement (+5% from last week)
- Night Shift: 73% quota achievement (-3% from last week)
- Notable Issues: 2 attendance violations recorded
- Action Items: Follow-up meetings scheduled with underperforming members'
                                    className='w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[220px] resize-none text-white placeholder-gray-500 leading-relaxed'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold mb-2.5 text-gray-200'>
                                    Attach Image <span className="text-gray-500">(Optional - Max 5MB)</span>
                                </label>

                                {!formData.imagePreview ? (
                                    <div className='relative'>
                                        <input
                                            type='file'
                                            accept='image/*'
                                            onChange={handleImageChange}
                                            className='w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-medium file:cursor-pointer hover:file:bg-blue-700 file:transition-all text-gray-400'
                                        />
                                    </div>
                                ) : (
                                    <div className='bg-gray-800/50 border border-gray-700 rounded-xl p-4'>
                                        <div className='flex items-start gap-3'>
                                            <img
                                                src={formData.imagePreview}
                                                alt="Preview"
                                                className='w-20 h-20 object-cover rounded-lg'
                                            />
                                            <div className='flex-1'>
                                                <p className='text-sm text-gray-300 font-medium'>{formData.image?.name}</p>
                                                <p className='text-xs text-gray-500 mt-1'>
                                                    {(formData.image?.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                            <button
                                                onClick={removeImage}
                                                className='text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-all'
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className='flex gap-4 pt-6 border-t border-gray-800'>
                                <button
                                    type='button'
                                    onClick={() => setIsReportModal(false)}
                                    className='flex-1 bg-gray-800 hover:bg-gray-700 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 border border-gray-700 hover:border-gray-600'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    onClick={handleSubmit}
                                    className='flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50'
                                >
                                    <Send size={18} />
                                    Send Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default UserReport