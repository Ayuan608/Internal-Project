import { X } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { requestDayOff } from '../../redux/attendenceSlice';
import toast from 'react-hot-toast';

const ShowOffDay = ({ setShowDayOffModal }) => {
    const dispatch = useDispatch();

    const [dayOffForm, setDayOffForm] = useState({
        startDate: "",
        endDate: "",
        reason: "",
        type: "",
        duration: "single",
    });

    // Format date for display placeholder
    const formatDateForPlaceholder = () => {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const year = today.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!dayOffForm.startDate || !dayOffForm.reason) {
            toast.error("Please fill all required fields");
            return;
        }

        if (!dayOffForm.endDate) {
            dispatch(
                requestDayOff({
                    startDate: dayOffForm.startDate,
                    endDate: dayOffForm.endDate,
                    reason: dayOffForm.reason,
                    attachmentType: dayOffForm.type,
                    duration: dayOffForm.duration,
                })
            )
                .unwrap()
                .then(() => {
                    toast.success("Day off request submitted 🎉");
                    setShowDayOffModal(false);
                })
                .catch((err) => {
                    toast.error(err?.message || "Failed to submit request");
                });
        }
        dispatch(
            requestDayOff({
                startDate: dayOffForm.startDate,
                reason: dayOffForm.reason,
                attachmentType: dayOffForm.type,
                duration: dayOffForm.duration,
            })
        )
            .unwrap()
            .then(() => {
                toast.success("Day off request submitted 🎉");
                setShowDayOffModal(false);
            })
            .catch((err) => {
                toast.error(err?.message || "Failed to submit request");
            });

    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3">
            <div className="absolute inset-0 bg-black/70"></div>

            <div className="relative w-full sm:max-w-2xl p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-2xl shadow-[0_24px_60px_rgba(15,23,42,0.95)]">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-50">Request Day Off</h3>
                    <button
                        onClick={() => setShowDayOffModal(false)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* DATE FIELD - with custom placeholder */}

                    <div className='flex justify-between'>


                        <div className="mb-4  ">
                            <label className="block text-sm text-slate-300 mb-2">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    id="date-input"
                                    value={dayOffForm.startDate}
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setDayOffForm({ ...dayOffForm, startDate: e.target.value })}
                                    className="w-70 rounded-xl bg-slate-950/70 border border-slate-700 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                />
                                {!dayOffForm.date && (
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <span className="text-sm text-slate-500">mm/dd/yyyy</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mb-4  ">
                            <label className="block text-sm text-slate-300 mb-2">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    id="date-input"
                                    value={dayOffForm.endDate}
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setDayOffForm({ ...dayOffForm, endDate: e.target.value })}
                                    className="w-70 rounded-xl bg-slate-950/70 border border-slate-700 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                />
                                {!dayOffForm.date && (
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <span className="text-sm text-slate-500">mm/dd/yyyy</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* REASON FIELD */}
                    <div className="mb-4">
                        <label className="block text-sm text-slate-300 mb-2">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={dayOffForm.reason}
                            onChange={(e) => setDayOffForm({ ...dayOffForm, reason: e.target.value })}
                            className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-4 py-3 text-sm text-slate-100 resize-none focus:outline-none focus:ring-1 focus:ring-sky-500 h-24"
                            placeholder="Please provide a reason..."
                            required
                        />
                    </div>

                    {/* TYPE OF LEAVE */}
                    <div className="mb-4">
                        <label className="block text-sm text-slate-300 mb-2">Type of Leave</label>
                        <select
                            value={dayOffForm.type}
                            onChange={(e) => setDayOffForm({ ...dayOffForm, type: e.target.value })}
                            className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500 appearance-none"
                        >
                            <option className="bg-slate-900/60" value="Rest Day">Rest Day</option>
                            <option className="bg-slate-900/60" value="Sick Leave">Sick Leave</option>
                            <option className="bg-slate-900/60" value="Emergency Leave">Emergency Leave</option>
                            <option className="bg-slate-900/60" value="Personal Leave">Personal Leave</option>
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* DURATION RADIO BUTTONS */}
                    <div className="mb-4">
                        <label className="block text-sm text-slate-300 mb-2">Duration</label>
                        <div className="flex gap-8 text-sm">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="radio"
                                        name="duration"
                                        checked={dayOffForm.duration === "single"}
                                        onChange={() => setDayOffForm({ ...dayOffForm, duration: "single" })}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${dayOffForm.duration === "single"
                                        ? "border-sky-500 bg-sky-500/10"
                                        : "border-slate-600"
                                        }`}>
                                        {dayOffForm.duration === "single" && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-slate-200">Single Day</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="radio"
                                        name="duration"
                                        checked={dayOffForm.duration === "multiple"}
                                        onChange={() => setDayOffForm({ ...dayOffForm, duration: "multiple" })}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${dayOffForm.duration === "multiple"
                                        ? "border-sky-500 bg-sky-500/10"
                                        : "border-slate-600"
                                        }`}>
                                        {dayOffForm.duration === "multiple" && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-slate-200">Multiple Days</span>
                            </label>
                        </div>
                    </div>

                    {/* HELPER TEXT */}
                    <p className="text-xs text-slate-400 mb-6 italic">
                        Uses the main Date field above. No extra selection needed.
                    </p>

                    {/* ACTION BUTTONS */}
                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={() => setShowDayOffModal(false)}
                            className="rounded-xl px-6 py-3 text-sm border border-slate-600 bg-slate-900/80 text-slate-100 hover:bg-slate-800 hover:border-slate-400 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl px-6 py-3 text-sm font-medium bg-sky-500/90 text-slate-950 hover:bg-sky-400 transition-all"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShowOffDay;