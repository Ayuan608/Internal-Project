import React, { useState, useRef } from 'react';
import { Plus, ClipboardPlus, Upload, X } from 'lucide-react';

function DraftTemplate({ showDraftPopup, setShowDraftPopup }) {

    const [showRecipientPopup, setShowRecipientPopup] = useState(false);
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        creator: '',
        details: ['', '', '']
    });
    const recipients = [
        { id: 1, name: 'LEADER', department: 'CSR' },
        { id: 2, name: 'LEADER 1', department: 'WD' },
        { id: 3, name: 'LEADER 2', department: 'DPT' },
        { id: 4, name: 'LEADER 3', department: 'CSR' }
    ];

    const handleRecipientToggle = (id) => {
        setSelectedRecipients(prev =>
            prev.includes(id)
                ? prev.filter(recipientId => recipientId !== id)
                : [...prev, id]
        );
    };

    const handleDetailChange = (index, value) => {
        const newDetails = [...formData.details];
        newDetails[index] = value;
        setFormData({ ...formData, details: newDetails });
    };

    const handleSendToAll = () => {
        console.log('Sending to all recipients');
        setShowDraftPopup(false);
    };

    const handleSendToSpecific = () => {
        setShowRecipientPopup(true);
    };

    const handleConfirmSend = () => {
        console.log('Sending to:', selectedRecipients);
        setShowRecipientPopup(false);
        setShowDraftPopup(false);
    };

    return (
        <>
            {showDraftPopup && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center  p-4" style={{ zIndex: 999 }}>
                    <div className="bg-[#1a1a1a] border [border-color:#9E9FA74D]  rounded-lg p-8 max-w-lg w-full relative">
                        <button
                            onClick={() => setShowDraftPopup(false)}
                            className="absolute top-4 right-4  "
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-white text-2xl mb-6 text-center tracking-wider">DRAFT</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-white text-sm mb-2 block text-center">TITLE</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-transparent border-b [border-color:#9E9FA74D] text-white px-2 py-1 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="text-white text-sm mb-2 block">CREATOR</label>
                                <input
                                    type="text"
                                    value={formData.creator}
                                    onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                                    className="w-full bg-transparent border-b [border-color:#9E9FA74D] text-white px-2 py-1 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="text-white text-sm mb-2 block text-center">DETAILS</label>
                                <div className="space-y-3">
                                    {formData.details.map((detail, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            value={detail}
                                            onChange={(e) => handleDetailChange(index, e.target.value)}
                                            className="w-full bg-transparent border-b [border-color:#9E9FA74D] text-white px-2 py-1 focus:outline-none focus:border-blue-500"
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="text-center">
                                <button className="text-white text-sm flex items-center gap-2 mx-auto transition-colors">
                                    UPLOAD MEDIA/FILE <Upload size={16} />
                                </button>
                            </div>

                            <div className="flex gap-4 justify-center pt-4">
                                <button className="px-6 py-2 border [border-color:#9E9FA74D] text-white text-sm rounded hover:bg-gray-800 transition-colors">
                                    Save Draft
                                </button>
                                <button
                                    onClick={handleSendToSpecific}
                                    className="px-6 py-2 border [border-color:#9E9FA74D] text-white text-sm rounded hover:bg-gray-800 transition-colors"
                                >
                                    Specific
                                </button>
                                <button
                                    onClick={handleSendToAll}
                                    className="px-6 py-2 border [border-color:#9E9FA74D] text-white text-sm rounded hover:bg-gray-800 transition-colors"
                                >
                                    Send to all
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showRecipientPopup && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-70 flex items-center justify-center  p-4">
                    <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-6 max-w-md w-full relative">
                        <button
                            onClick={() => setShowRecipientPopup(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-right mb-4">
                            <span className="text-gray-400 text-xs">SELECT MULTIPLE</span>
                        </div>

                        <div className="space-y-1 mb-6">
                            <div className="grid grid-cols-2 gap-4 text-white text-sm font-semibold mb-2 px-4">
                                <div>NAME</div>
                                <div>DEPARTMENT</div>
                            </div>

                            {recipients.map((recipient) => (
                                <label
                                    key={recipient.id}
                                    className="flex items-center gap-4 px-4 py-3 hover:bg-gray-800 rounded cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedRecipients.includes(recipient.id)}
                                        onChange={() => handleRecipientToggle(recipient.id)}
                                        className="w-5 h-5 bg-transparent border-2 border-gray-600 rounded cursor-pointer"
                                    />
                                    <div className="grid grid-cols-2 gap-4 flex-1 text-white text-sm">
                                        <div>{recipient.name}</div>
                                        <div>{recipient.department}</div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="text-right">
                            <button
                                onClick={handleConfirmSend}
                                disabled={selectedRecipients.length === 0}
                                className="px-8 py-2 border border-gray-600 text-white text-sm rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                SEND
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default DraftTemplate;