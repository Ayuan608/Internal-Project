import { X } from 'lucide-react'
import React from 'react'

const ShowOffDay = ({handleDayOffSubmit,setDayOffForm,setShowDayOffModal,dayOffForm}) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[rgba(59,130,246,0.03)] backdrop-blur-md border border-[#4a5568] rounded-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Request Day Off</h3>
                    <button
                        onClick={() => setShowDayOffModal(false)}
                        className="text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleDayOffSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Date <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="date"
                            value={dayOffForm.date}
                            onChange={(e) => setDayOffForm({ ...dayOffForm, date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            required
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Reason <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={dayOffForm.reason}
                            onChange={(e) => setDayOffForm({ ...dayOffForm, reason: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            rows={4}
                            placeholder="Please provide a reason for your day off request..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Attachment Type</label>
                        <select
                            value={dayOffForm.attachmentType}
                            onChange={(e) => setDayOffForm({ ...dayOffForm, attachmentType: e.target.value })}
                            className="w-full px-4 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-none"
                        >
                            <option value="medical">Medical Certificate</option>
                            <option value="personal">Personal Leave</option>
                            <option value="emergency">Emergency</option>
                        </select>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowDayOffModal(false)}
                            className="flex-1 px-4 py-2 hover:bg-[rgba(59,130,246,0.03)] border-gray-600 text-white rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ShowOffDay
