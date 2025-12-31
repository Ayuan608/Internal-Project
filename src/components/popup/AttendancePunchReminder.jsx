import React from "react";
import { AlertCircle, XCircle, Clock } from "lucide-react";

const AttendancePunchReminder = ({ open, onClose }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertCircle className="w-8 h-8 animate-pulse" />
                            <h2 className="text-2xl font-bold">📢 IMPORTANT ATTENDANCE ANNOUNCEMENT</h2>
                        </div>
                        <p className="text-red-100 text-sm">Please be reminded of the following rules regarding attendance:</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {/* Rule 1 */}
                        <div className="flex items-start gap-3 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-red-900 mb-2">🔹 No Punch In/Out or Wrong Punch In/Out</h3>
                                <p className="text-sm text-red-800 mb-2">
                                    If you fail to punch in/out correctly in <span className="font-semibold">i5 Punch In/Out</span>, it will be considered <span className="font-bold bg-red-200 px-2 py-1 rounded">HALF DAY</span>, even if you completed your full shift.
                                </p>
                                <p className="text-sm text-red-800 font-semibold mb-1">
                                    Forgot Punch In = Shift will NOT be counted.
                                </p>
                                <p className="text-xs text-red-700 italic">
                                    ⚠️ It is your responsibility to ensure punches are done correctly and on time.
                                </p>
                            </div>
                        </div>

                        {/* Rule 2 */}
                        <div className="flex items-start gap-3 bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                            <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-orange-900 mb-2">🔹 Work Hours Requirement</h3>
                                <p className="text-sm text-orange-800 mb-2">
                                    Less than 6 hours of rendered work will <span className="font-bold bg-orange-200 px-2 py-1 rounded">NOT be counted and will NOT be paid</span>.
                                </p>
                                <p className="text-sm text-orange-800 font-semibold">
                                    You must complete at least 6 hours for your shift to be credited.
                                </p>
                            </div>
                        </div>

                        {/* Rule 3 */}
                        <div className="flex items-start gap-3 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-yellow-900 mb-2">🔹 Lateness Policy</h3>
                                <p className="text-sm text-yellow-800 font-semibold">
                                    Late is still late — even if you received a verbal warning or a warning letter, it will still be counted as <span className="font-bold bg-yellow-200 px-2 py-1 rounded">LATE</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 accent-red-600" />
                                <span>I understand these rules</span>
                            </label>
                            <button
                                onClick={onClose}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors shadow-lg text-sm"
                            >
                                Proceed to Punch In
                            </button>
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={onClose}
                                className="text-gray-600 hover:text-gray-800 text-sm underline transition-colors"
                            >
                                Don't show this again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendancePunchReminder;
