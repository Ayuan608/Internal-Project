import React from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";

function LeaveRequest() {
    const { state } = useLocation();
    const employee = state?.employee;
    const leaves = state?.leaves || [];

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-US");

    return (
        <div className="min-h-screen p-8  text-white">

            {/* Header */}
            <div className="flex justify-between items-center gap-3 mb-8">
                <h2 className="text-3xl  font-bold">
                <button  onClick={() => window.history.back()} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <ArrowLeft
                      className="w-6 h-6 text-slate-300" />
                </button>
                    Leave Requests – {employee?.FullName}
                </h2>
            </div>

            {/* Leave List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {leaves.length === 0 ? (
                    <p className="text-slate-300">No leave requests found.</p>
                ) : (
                    leaves.map((leave) => (
                        <div
                            key={leave.requestId}
                            className="p-6 bg-slate-900/60 border border-slate-700 rounded-xl"
                        >
                            <p className="text-lg font-semibold">{leave.reason}</p>

                            <p className="text-slate-400 text-sm">
                                <span className="font-medium text-slate-300">Date: </span>
                                {leave.date ? formatDate(leave.date) : "N/A"}
                            </p>

                            <p className="text-slate-400 text-sm mb-3">
                                <span className="font-medium text-slate-300">Attachment: </span>
                                {leave.attachmentType || "None"}
                            </p>

                            {/* STATUS */}
                            <span
                                className={`inline-block px-3 py-1 text-xs rounded-full ${leave.status === "PENDING"
                                    ? "bg-yellow-600/20 text-yellow-400"
                                    : leave.status === "APPROVED"
                                        ? "bg-green-600/20 text-green-400"
                                        : "bg-red-600/20 text-red-400"
                                    }`}
                            >
                                {leave.status}
                            </span>

                            {/* APPROVE / REJECT BUTTONS */}
                            {leave.status === "PENDING" && (
                                <div className="flex gap-4 mt-4">
                                    <button className="flex-1 px-4 py-2 rounded-lg bg-green-600/30 border border-green-500/40 hover:bg-green-600/50 text-green-300">
                                        Approve
                                    </button>

                                    <button className="flex-1 px-4 py-2 rounded-lg bg-red-600/30 border border-red-500/40 hover:bg-red-600/50 text-red-300">
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default LeaveRequest;
