import React, { useState, useEffect } from 'react';
import { Upload, X, Save, Send, Users, Trash2, FileText, Calendar } from 'lucide-react';

function DraftTemplate({ showDraftPopup, setShowDraftPopup }) {
  const [showRecipientPopup, setShowRecipientPopup] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [showDraftsList, setShowDraftsList] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    creator: '',
    details: ['', '', ''],
    uploadedFiles: []
  });

  const recipients = [
    { id: 1, name: 'LEADER', department: 'CSR', color: '#3b82f6' },
    { id: 2, name: 'LEADER 1', department: 'WD', color: '#10b981' },
    { id: 3, name: 'LEADER 2', department: 'DPT', color: '#f59e0b' },
    { id: 4, name: 'LEADER 3', department: 'CSR', color: '#8b5cf6' }
  ];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('draftTemplates') || '[]');
    setSavedDrafts(stored);
  }, []);

  // Save drafts to localStorage whenever they change
  useEffect(() => {
    if (savedDrafts.length > 0) {
      localStorage.setItem('draftTemplates', JSON.stringify(savedDrafts));
    }
  }, [savedDrafts]);

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

  const handleSaveDraft = () => {
    if (!formData.title.trim()) {
      alert('Please enter a title for the draft');
      return;
    }

    const draft = {
      id: currentDraftId || Date.now(),
      ...formData,
      savedAt: new Date().toISOString(),
      recipients: selectedRecipients
    };

    if (currentDraftId) {
      // Update existing draft
      setSavedDrafts(prev => prev.map(d => d.id === currentDraftId ? draft : d));
    } else {
      // Add new draft
      setSavedDrafts(prev => [...prev, draft]);
    }

    setCurrentDraftId(draft.id);
    
    // Show success feedback
    const btn = event.target;
    btn.textContent = '✓ Saved!';
    btn.classList.add('bg-green-600', 'border-green-500');
    setTimeout(() => {
      btn.textContent = 'Save Draft';
      btn.classList.remove('bg-green-600', 'border-green-500');
    }, 2000);
  };

  const handleLoadDraft = (draft) => {
    setFormData({
      title: draft.title,
      creator: draft.creator,
      details: draft.details,
      uploadedFiles: draft.uploadedFiles || []
    });
    setSelectedRecipients(draft.recipients || []);
    setCurrentDraftId(draft.id);
    setShowDraftsList(false);
  };

  const handleDeleteDraft = (id) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      setSavedDrafts(prev => prev.filter(d => d.id !== id));
      if (currentDraftId === id) {
        handleNewDraft();
      }
    }
  };

  const handleNewDraft = () => {
    setFormData({
      title: '',
      creator: '',
      details: ['', '', ''],
      uploadedFiles: []
    });
    setSelectedRecipients([]);
    setCurrentDraftId(null);
  };

  const handleSendToAll = () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    console.log('Sending to all recipients');
    handleNewDraft();
    setShowDraftPopup(false);
  };

  const handleSendToSpecific = () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    setShowRecipientPopup(true);
  };

  const handleConfirmSend = () => {
    console.log('Sending to:', selectedRecipients);
    // Remove from drafts after sending
    if (currentDraftId) {
      setSavedDrafts(prev => prev.filter(d => d.id !== currentDraftId));
    }
    setShowRecipientPopup(false);
    setShowDraftPopup(false);
    handleNewDraft();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {showDraftPopup && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" 
          style={{ zIndex: 999 }}
          onClick={() => setShowDraftPopup(false)}
        >
          <div 
            className="bg-[rgba(59,130,246,0.03)] backdrop-blur-xl border border-[#2d3139] rounded-2xl shadow-2xl p-8 max-w-3xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <h2 className="text-white text-2xl font-light tracking-wider">DRAFT TEMPLATE</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDraftsList(!showDraftsList)}
                  className="px-4 py-2 bg-[#1e222a] border border-[#2d3139] text-white text-sm rounded-lg hover:bg-[#252a34] transition-all flex items-center gap-2"
                  title="View Saved Drafts"
                >
                  <FileText size={16} />
                  <span className="hidden sm:inline">Drafts ({savedDrafts.length})</span>
                </button>
                <button
                  onClick={() => setShowDraftPopup(false)}
                  className="text-gray-400 hover:text-white hover:bg-[#252a34] p-2 rounded-lg transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Saved Drafts List */}
            {showDraftsList && (
              <div className="mb-6 bg-[#13151a] border border-[#2d3139] rounded-xl p-4 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-sm font-semibold">SAVED DRAFTS</h3>
                  <button
                    onClick={handleNewDraft}
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    + New Draft
                  </button>
                </div>
                {savedDrafts.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No saved drafts</p>
                ) : (
                  <div className="space-y-2">
                    {savedDrafts.map((draft) => (
                      <div
                        key={draft.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          currentDraftId === draft.id
                            ? 'bg-blue-500/10 border-blue-500/30'
                            : 'bg-[#1a1d24] border-[#2d3139] hover:border-[#3d4149]'
                        }`}
                        onClick={() => handleLoadDraft(draft)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-white text-sm font-medium">{draft.title || 'Untitled'}</h4>
                            <p className="text-gray-400 text-xs mt-1">
                              <Calendar size={12} className="inline mr-1" />
                              {formatDate(draft.savedAt)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDraft(draft.id);
                            }}
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <div className="space-y-6">
              <div className="relative">
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter draft title..."
                  className="w-full bg-[rgba(59,130,246,0.03)]/20 border border-[#2d3139] rounded-lg text-white px-4 py-3 focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
                />
              </div>

              <div className="relative">
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Creator</label>
                <input
                  type="text"
                  value={formData.creator}
                  onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                  placeholder="Your name..."
                  className="w-full bg-[rgba(59,130,246,0.03)]/20 border border-[#2d3139] rounded-lg text-white px-4 py-3 focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Details</label>
                <div className="space-y-3">
                  {formData.details.map((detail, index) => (
                    <div key={index} className="relative">
                      <input
                        type="text"
                        value={detail}
                        onChange={(e) => handleDetailChange(index, e.target.value)}
                        placeholder={`Detail ${index + 1}...`}
                        className="w-full bg-[rgba(59,130,246,0.03)]/20 border border-[#2d3139] rounded-lg text-white px-4 py-3 focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <button className="text-gray-400 hover:text-white text-sm flex items-center gap-2 px-4 py-2 border border-dashed border-[#2d3139] rounded-lg hover:border-blue-500 hover:bg-blue-500/5 transition-all">
                  <Upload size={16} />
                  UPLOAD MEDIA/FILE
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-[#2d3139]">
                <button
                  onClick={handleSaveDraft}
                  className="px-6 py-2.5 bg-[#1e222a] border border-[#2d3139] text-white text-sm rounded-lg hover:bg-[#252a34] hover:border-blue-500 transition-all flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Draft
                </button>
                <button
                  onClick={handleSendToSpecific}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  <Users size={16} />
                  Specific
                </button>
                <button
                  onClick={handleSendToAll}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Send size={16} />
                  Send to All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipients Selection Popup */}
      {showRecipientPopup && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 1000 }}
          onClick={() => setShowRecipientPopup(false)}
        >
          <div 
            className="bg-gradient-to-br from-[#1a1d24] to-[#13151a] border border-[#2d3139] rounded-2xl shadow-2xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                <h3 className="text-white text-xl font-light tracking-wider">SELECT RECIPIENTS</h3>
              </div>
              <button
                onClick={() => setShowRecipientPopup(false)}
                className="text-gray-400 hover:text-white hover:bg-[#252a34] p-2 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {recipients.map((recipient) => (
                <label
                  key={recipient.id}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl cursor-pointer transition-all border ${
                    selectedRecipients.includes(recipient.id)
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30'
                      : 'bg-[#13151a] border-[#2d3139] hover:border-[#3d4149]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRecipients.includes(recipient.id)}
                    onChange={() => handleRecipientToggle(recipient.id)}
                    className="w-5 h-5 accent-blue-500 cursor-pointer"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: recipient.color }}
                      ></div>
                      <span className="text-white font-medium">{recipient.name}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{recipient.department}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2d3139]">
              <p className="text-gray-400 text-sm">
                {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={handleConfirmSend}
                disabled={selectedRecipients.length === 0}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Send size={16} />
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