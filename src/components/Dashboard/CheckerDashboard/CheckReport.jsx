import React, { useState, useEffect } from 'react'
import { X, Send, Calendar, User, FileText, Paperclip, Clock, CheckCircle } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { createReport, getReports } from '../../../redux/reportSlice';

function CheckReport() {
    const dispatch = useDispatch();
    const { reportsData } = useSelector((state) => state.report);
    console.log("report data", reportsData)

    const [isReportModal, setIsReportModal] = useState(false);

    useEffect(() => {
        dispatch(getReports());
    }, [dispatch]);

    const [formData, setFormData] = useState({
        date: new Date().toLocaleDateString('en-US'),
        purpose: 'Daily Performance Report',
        details: '',
        file: null
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
        };

        const result = await dispatch(createReport(reportData));

        if (result.type === 'report/create/fulfilled') {
            // Re-fetch reports so UI shows the new one immediately
            await dispatch(getReports());

            setFormData({
                date: new Date().toLocaleDateString('en-US'),
                purpose: 'Daily Performance Report',
                details: '',
                file: null
            });
            setIsReportModal(false);
        } else {
            // optional: show error
            alert('Failed to send report. Try again.');
        }
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, file: file.name });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US');
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <div className='min-h-[92.7vh] pt-5 flex flex-col gap-6 text-white px-4'>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Daily Reports</h1>
                        <p className="text-gray-400">Streamline your workflow by sending and tracking daily reports to ensure consistent team performance.</p>
                    </div>
                    <button
                        onClick={() => setIsReportModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <FileText size={20} />
                        Add Report
                    </button>
                </div>

                {/* Reports List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportsData.length === 0 ? (
                        <div className="col-span-3 bg-gray-900/50 rounded-xl p-12 text-center border border-gray-800">
                            <FileText size={48} className="mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-400 text-lg">No reports sent yet</p>
                        </div>
                    ) : (
                        reportsData.map((report) => (
                            <div
                                key={report._id}
                                className="bg-gray-900/60 backdrop-blur-md border border-gray-800
                 hover:shadow-xl 
                rounded-xl p-6 transition-all duration-300"
                            >

                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex  justify-between gap-3">
                                        <div>
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
                                        <div className="mt-4 flex justify-end">
                                            <span className="text-xs flex items-center gap-1 bg-green-500/10 
                                 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-full">
                                                <CheckCircle size={12} />
                                                Sent
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Purpose Tag */}
                                <span className="text-xs bg-blue-500/10 border border-blue-500/20 
                text-blue-400 px-3 py-1 rounded-full inline-block mb-3">
                                    {report.purpose}
                                </span>

                                {/* Details */}
                                <p className="text-gray-300 text-sm leading-relaxed line-clamp-6 whitespace-pre-line">
                                    {report.details}
                                </p>

                                {/* File */}
                                {report.file && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/40 
                        px-3 py-2 rounded-lg border border-gray-700/50 mt-4">
                                        <Paperclip size={14} />
                                        <span>Attachment: {report.file}</span>
                                    </div>
                                )}

                                {/* Status */}

                            </div>
                        ))
                    )}
                </div>

            </div>

            {/* Modal */}
            {isReportModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4'>
                    <div className='bg-gray-900 text-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-800 max-h-[90vh] overflow-y-auto'>
                        <div className='sticky top-0 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900 border-b border-gray-800 px-8 py-5 flex justify-between items-center z-10'>
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
                            <div>
                                <label className='block text-sm font-semibold mb-2.5 text-gray-200'>
                                    Purpose <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    className='w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white cursor-pointer'
                                >
                                    <option>Daily Performance Report</option>
                                    <option>Weekly Summary Report</option>
                                    <option>Issue Report</option>
                                    <option>Progress Update</option>
                                </select>
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

                            {/* File Upload */}
                            <div>
                                <label className='block text-sm font-semibold mb-2.5 text-gray-200'>
                                    Attach Performance Data <span className="text-gray-500">(Optional)</span>
                                </label>
                                <div className='relative'>
                                    <input
                                        type='file'
                                        onChange={handleFileChange}
                                        className='w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-medium file:cursor-pointer hover:file:bg-blue-700 file:transition-all text-gray-400'
                                    />
                                </div>
                                {formData.file && (
                                    <div className='bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 mt-3'>
                                        <p className='text-sm text-gray-300 flex items-center gap-2'>
                                            <Paperclip size={16} className="text-blue-400" />
                                            <span className="font-medium">{formData.file}</span>
                                        </p>
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

export default CheckReport