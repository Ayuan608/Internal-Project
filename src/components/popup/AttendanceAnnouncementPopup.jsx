// Updated AttendanceAnnouncementPopup.jsx
// (Replace the previous version with this)

import React, { useState } from "react";
import { X, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const AttendanceAnnouncementPopup = ({
    visible,
    onClose,
    onProceed,
    userHasPunchedInToday,
    userHasPunchedOutToday,
    forgotPunchIn,
    forgotPunchOut,
    excessiveBreaks,
    latePunchOut, // NEW: For late punch out
    totalBreakMinutes,
}) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [understood, setUnderstood] = useState(false);

    const handleProceed = () => {
        if (dontShowAgain) {
            localStorage.setItem("hideAttendanceAnnouncement", "true");
        }
        onProceed();
    };

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem("hideAttendanceAnnouncement", "true");
        }
        onClose();
    };

    if (!visible) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300"
                onClick={handleClose}
            />

            {/* Popup Container */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl">
                <div className="bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2f] rounded-2xl border border-[#2e3135] mx-4 shadow-2xl overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-center relative">
                        <button
                            onClick={handleClose}
                            className="absolute right-4 top-4 p-1 hover:bg-red-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <AlertTriangle className="w-12 h-12 text-white mx-auto mb-3" />
                        <h1 className="text-2xl font-bold text-white mb-2">
                            IMPORTANT ATTENDANCE ANNOUNCEMENT
                        </h1>
                        <p className="text-red-100 text-sm">
                            Please read the following rules carefully
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-4 text-gray-300">
                            {/* Rule 1 */}
                            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex-shrink-0 w-6 h-6 border-2 border-red-400 rounded mt-0.5"></div>
                                <div>
                                    <h3 className="font-semibold text-red-300 mb-2">
                                        No Punch In/Out or Wrong Punch In/Out
                                    </h3>
                                    <p className="text-sm leading-relaxed">
                                        If you fail to punch in/out correctly in i5 Punch In/Out, it will be considered <span className="font-bold text-red-300">HALF DAY</span>, even if you completed your full shift.
                                    </p>
                                    <p className="text-sm leading-relaxed mt-2 font-semibold text-red-200">
                                        Forgot Punch In = Shift will NOT be counted.
                                    </p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-sm leading-relaxed">
                                    - It is your responsibility to ensure punches are done correctly and on time.
                                </p>
                            </div>

                            {/* Rule 2 */}
                            <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                <div className="flex-shrink-0 w-6 h-6 border-2 border-orange-400 rounded mt-0.5"></div>
                                <div>
                                    <h3 className="font-semibold text-orange-300 mb-2">
                                        Work Hours Requirement
                                    </h3>
                                    <p className="text-sm leading-relaxed">
                                        Less than 6 hours of rendered work will <span className="font-bold text-orange-300">NOT be counted and will NOT be paid</span>.
                                    </p>
                                    <p className="text-sm leading-relaxed mt-2">
                                        You must complete at least 6 hours for your shift to be credited.
                                    </p>
                                </div>
                            </div>

                            {/* Rule 3 */}
                            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <div className="flex-shrink-0 w-6 h-6 border-2 border-yellow-400 rounded mt-0.5"></div>
                                <div>
                                    <h3 className="font-semibold text-yellow-300 mb-2">
                                        Lateness Policy
                                    </h3>
                                    <p className="text-sm leading-relaxed">
                                        Late is still late — even if you received a verbal warning or a warning letter, it will still be counted as <span className="font-bold text-yellow-300">LATE</span>.
                                    </p>
                                </div>
                            </div>

                            {/* NEW: Excessive Breaks Rule/Warning */}
                            {excessiveBreaks && (
                                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <div className="flex-shrink-0 w-6 h-6 border-2 border-red-400 rounded mt-0.5"></div>
                                    <div>
                                        <h3 className="font-semibold text-red-300 mb-2">
                                            Excessive Break Time Warning
                                        </h3>
                                        <p className="text-sm leading-relaxed">
                                            Your total break time today ({totalBreakMinutes}m) exceeds the allowed limit (60m).
                                            Excessive breaks may impact your productivity rating and shift credits. Please manage your breaks better.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* NEW: Late Punch Out Warning */}
                            {latePunchOut && (
                                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <Clock className="w-6 h-6 text-red-400 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-red-300 mb-2">
                                            Late Punch Out Warning
                                        </h3>
                                        <p className="text-sm leading-relaxed">
                                            It's past 6:30 PM and you haven't punched out yet. Please punch out immediately to avoid <span className="font-bold text-red-300">HALF DAY deduction</span> or other penalties.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Current Status Warning */}
                            {(userHasPunchedInToday || userHasPunchedOutToday || forgotPunchIn || forgotPunchOut || latePunchOut) && (
                                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4 text-purple-300" />
                                        <span className="font-semibold text-purple-300">Current Status:</span>
                                    </div>
                                    <p className="text-sm">
                                        {forgotPunchIn && "⚠️ You haven't punched in today\n"}
                                        {forgotPunchOut && "⚠️ You haven't punched out today\n"}
                                        {latePunchOut && "⏰ Late to punch out (past 6:30 PM)\n"}
                                        {userHasPunchedInToday && userHasPunchedOutToday && "✅ All punches completed today"}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Checkboxes */}
                        <div className="mt-6 space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={understood}
                                    onChange={(e) => setUnderstood(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm text-gray-300 flex-1">
                                    I understand these rules and acknowledge that it's my responsibility to ensure proper punch in/out
                                    {excessiveBreaks && " and manage break times appropriately"}
                                    {latePunchOut && " and punch out on time"}
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={dontShowAgain}
                                    onChange={(e) => setDontShowAgain(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm text-gray-300 flex-1">
                                    Don't show this announcement again
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 p-6 border-t border-[#2e3135]">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 border border-[#2e3135] text-white rounded-xl hover:bg-[#1e1f25] transition-colors font-medium"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleProceed}
                            disabled={!understood}
                            className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Proceed to Punch In
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AttendanceAnnouncementPopup;