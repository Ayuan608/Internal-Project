import React, { useState } from 'react'
import { X, Send, Calendar, User, FileText, Paperclip, Clock, CheckCircle } from 'lucide-react'
import { useSelector } from 'react-redux';

function CheckReport() {
    const [isReportModal, setIsReportModal] = useState(false);
    const { role } = useSelector((state) => state.auth)
    const [reports, setReports] = useState([
        {
            id: 1,
            sender: 'John Doe - Team Leader',
            date: '10/24/2025',
            purpose: 'Daily Performance Report',
            details: `- Team Performance: 15/20 members met quota (75%)
- Morning Shift: 87% quota achievement (+5% from last week)
- Night Shift: 73% quota achievement (-3% from last week)
- Notable Issues: 2 attendance violations recorded
- Action Items: Follow-up meetings scheduled with underperforming members`,
            timestamp: '10:30 AM',
            status: 'Sent'
        } ,{
            id: 1,
            sender: 'John Doe - Team Leader',
            date: '10/24/2025',
            purpose: 'Daily Performance Report',
            details: `- Team Performance: 15/20 members met quota (75%)
- Morning Shift: 87% quota achievement (+5% from last week)
- Night Shift: 73% quota achievement (-3% from last week)
- Notable Issues: 2 attendance violations recorded
- Action Items: Follow-up meetings scheduled with underperforming members`,
            timestamp: '10:30 AM',
            status: 'Sent'
        }, {
            id: 1,
            sender: 'John Doe - Team Leader',
            date: '10/24/2025',
            purpose: 'Daily Performance Report',
            details: `- Team Performance: 15/20 members met quota (75%)
- Morning Shift: 87% quota achievement (+5% from last week)
- Night Shift: 73% quota achievement (-3% from last week)
- Notable Issues: 2 attendance violations recorded
- Action Items: Follow-up meetings scheduled with underperforming members`,
            timestamp: '10:30 AM',
            status: 'Sent'
        },{
            id: 1,
            sender: 'John Doe - Team Leader',
            date: '10/24/2025',
            purpose: 'Daily Performance Report',
            details: `- Team Performance: 15/20 members met quota (75%)
- Morning Shift: 87% quota achievement (+5% from last week)
- Night Shift: 73% quota achievement (-3% from last week)
- Notable Issues: 2 attendance violations recorded
- Action Items: Follow-up meetings scheduled with underperforming members`,
            timestamp: '10:30 AM',
            status: 'Sent'
        }
    ]);

    const [formData, setFormData] = useState({
        sender: 'John Doe - Team Leader',
        date: new Date().toLocaleDateString('en-US'),
        purpose: 'Daily Performance Report',
        details: '',
        file: null
    });

    const handleSubmit = () => {
        if (!formData.details.trim()) {
            alert('Please enter report details');
            return;
        }

        const newReport = {
            id: reports.length + 1,
            ...formData,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'Sent'
        };

        setReports([newReport, ...reports]);
        setFormData({
            sender: 'John Doe - Team Leader',
            date: new Date().toLocaleDateString('en-US'),
            purpose: 'Daily Performance Report',
            details: '',
            file: null
        });
        setIsReportModal(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, file: file.name });
        }
    };

    return (
        <>
            <div className='min-h-[92.7vh] pt-5 flex flex-col gap-6 text-white px-4'>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Daily Reports</h1>
                        <p className="text-gray-400">Streamline your workflow by sending and tracking daily reports to ensure consistent team performance.</p>
                    </div>
                    {role !== "Super-Admin" && <button
                        onClick={() => setIsReportModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <FileText size={20} />
                        Add Report
                    </button>}

                </div>

                {/* Reports List */}
                <div className="grid grid-cols-3 gap-4">
                    {reports.length === 0 ? (
                        <div className="bg-[rgba(59,131,246,0.06)] rounded-xl p-12 text-center border border-gray-700">
                            <FileText size={48} className="mx-auto mb-4 text-gray-500" />
                            <p className="text-gray-400 text-lg">No reports sent yet</p>
                        </div>
                    ) : (
                        reports.map((report) => (
                            <div key={report.id} className="bg-[rgba(59,131,246,0.06)] rounded-xl p-4 border border-[var(--box-border)] transition-all duration-300 ">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-600 rounded-full p-2">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{report.sender}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {report.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {report.timestamp}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1 bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm">
                                        <CheckCircle size={14} />
                                        {report.status}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                                        {report.purpose}
                                    </span>
                                </div>

                                <div className=" rounded-lg px-1">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Report Details:</h4>
                                    <p className="text-gray-300 whitespace-pre-line">{report.details}</p>
                                </div>

                                {report.file && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                                        <Paperclip size={16} />
                                        <span>Attachment: {report.file}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isReportModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm p-4'>
                    <div className='bg-[#2a2a2a] text-white rounded-2xl shadow-2xl w-full max-w-xl border border-gray-700 max-h-[90vh] overflow-y-auto'>
                        <div className='sticky top-0 bg-[#2a2a2a] border-b border-gray-700 px-6 py-4 flex justify-between items-center'>
                            <h2 className='text-xl font-bold'>Daily Report to Super Admin</h2>
                            <button
                                onClick={() => setIsReportModal(false)}
                                className='text-gray-400 hover:text-white transition-colors'
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className='p-6 space-y-5'>


                            {/* Date */}
                            <div>
                                <label className='block text-sm font-medium mb-2 text-gray-300'>
                                    Date
                                </label>
                                <input
                                    type='text'
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className='w-full bg-[#1f1f1f] border border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                                />
                            </div>

                            {/* Purpose */}
                            <div>
                                <label className='block text-sm font-medium mb-2 text-gray-300'>
                                    Purpose
                                </label>
                                <select
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    className='w-full bg-[#1f1f1f] border border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                                >
                                    <option>Daily Performance Report</option>
                                    <option>Weekly Summary Report</option>
                                    <option>Issue Report</option>
                                    <option>Progress Update</option>
                                </select>
                            </div>

                            {/* Details */}
                            <div>
                                <label className='block text-sm font-medium mb-2 text-gray-300'>
                                    Details
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
                                    className='w-full bg-[#1f1f1f] border border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[200px] resize-none'
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className='block text-sm font-medium mb-2 text-gray-300'>
                                    Attach Performance Data (Optional)
                                </label>
                                <div className='relative'>
                                    <input
                                        type='file'
                                        onChange={handleFileChange}
                                        className='w-full bg-[#1f1f1f] border border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-sky-600 file:text-white file:cursor-pointer hover:file:bg-sky-600'
                                    />
                                </div>
                                {formData.file && (
                                    <p className='text-sm text-gray-400 mt-2 flex items-center gap-2'>
                                        <Paperclip size={14} />
                                        {formData.file}
                                    </p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className='flex gap-3 pt-4'>
                                <button
                                    type='button'
                                    onClick={() => setIsReportModal(false)}
                                    className='flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2.5 rounded-lg font-medium transition-all'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    onClick={handleSubmit}
                                    className='flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2'
                                >
                                    <Send size={18} />
                                    Send
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