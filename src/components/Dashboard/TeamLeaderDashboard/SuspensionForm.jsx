import React, { useState } from "react";
import { X } from "lucide-react";

export default function SuspensionFormApp({ suspensionForm, setSuspensionForm }) {
    const [formData, setFormData] = useState({
        employeeId: "",
        name: "",
        date: "",
        from: "",
        to: "",
        submittedTo: "Super Admin and Admin",
        sender: "",
        reason: "",
        file: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value,
        });
    };

    const handleCancel = () => {
        setFormData({
            employeeId: "",
            name: "",
            date: "",
            from: "",
            to: "",
            submittedTo: "Super Admin and Admin",
            sender: "",
            reason: "",
            file: null,
        });
        setSuspensionForm(false);
    };

    const handleSubmit = () => {
        if (!formData.employeeId || !formData.name || !formData.date || !formData.from || !formData.to || !formData.sender || !formData.reason) {
            alert("Please fill all required fields");
            return;
        }
        console.log("Suspension Form Submitted:", formData);
        alert(`Suspension request submitted for Employee ID: ${formData.employeeId}`);
        handleCancel();
    };

    return (

        <div>

            {suspensionForm && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-900/40 text-white rounded-2xl shadow-2xl  border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-slate-900/20 border-b  border-gray-800/40 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-white">
                                Suspension Request Form
                            </h2>
                            <button
                                onClick={handleCancel}
                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Employee ID
                                </label>
                                <input
                                    type="text"
                                    name="employeeId"
                                    placeholder="Enter employee ID"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter employee name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        From
                                    </label>
                                    <input
                                        type="date"
                                        name="from"
                                        value={formData.from}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        To
                                    </label>
                                    <input
                                        type="date"
                                        name="to"
                                        value={formData.to}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Submitted To
                                </label>
                                <input
                                    type="text"
                                    name="submittedTo"
                                    value={formData.submittedTo}
                                    readOnly
                                    className="w-full px-4 py-2.5 bg-slate-900/30 border border-gray-800 rounded-lg text-wghite cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Sender (Team Leader Name)
                                </label>
                                <input
                                    type="text"
                                    name="sender"
                                    placeholder="Enter your name"
                                    value={formData.sender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Reason
                                </label>
                                <textarea
                                    name="reason"
                                    placeholder="Write the reason for suspension..."
                                    value={formData.reason}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Attached File (Optional)
                                </label>
                                <input
                                    type="file"
                                    name="file"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-800 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 cursor-pointer transition-all"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2.5 border border-gray-800 text-white font-medium rounded-lg hover:bg-gray-50 hover:text-black transform duration-300 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
                                >
                                    Send Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}