import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, X } from "lucide-react";

export default function MailView({ mail, onClose, onReply, currentUser }) {
  const [replyContent, setReplyContent] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !onReply) return;

    setSendingReply(true);
    try {
      await onReply(mail.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setSendingReply(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "text-red-400 border-red-400";
      case "Medium": return "text-yellow-400 border-yellow-400";
      case "Low": return "text-green-400 border-green-400";
      default: return "text-blue-400 border-blue-400";
    }
  };

  const getNatureBadge = (nature) => {
    if (!nature) return null;
    
    const natureColors = {
      "Warning": "bg-yellow-500/20 text-yellow-300",
      "Violation": "bg-red-500/20 text-red-300",
      "Inquiry": "bg-blue-500/20 text-blue-300",
      "Notice": "bg-green-500/20 text-green-300",
      "Disciplinary Action": "bg-purple-500/20 text-purple-300",
      "Compliance Issue": "bg-orange-500/20 text-orange-300",
      "Performance Review": "bg-indigo-500/20 text-indigo-300",
      "Other": "bg-gray-500/20 text-gray-300"
    };

    return (
      <span className={`px-3 py-1 text-sm rounded-full ${natureColors[nature] || natureColors.Other}`}>
        {nature}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ x: 380, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 380, opacity: 0 }}
      transition={{ type: "spring", stiffness: 70, damping: 15 }}
      className="absolute right-0 top-0 bottom-0 h-full w-[400px] "
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1E293B]">
          <h2 className="text-lg font-semibold">Message</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Priority and Nature */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm border flex items-center gap-2 ${getPriorityColor(mail?.priority)}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              {mail?.priority || "Normal"}
            </span>
            {getNatureBadge(mail?.nature)}
          </div>

          {/* Subject */}
          <h1 className="text-xl font-bold text-white">{mail?.subject}</h1>

          {/* Mail Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">From:</span>
              <span className="text-white font-medium">{mail?.from}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">To:</span>
              <span className="text-white">{mail?.to}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date:</span>
              <span className="text-white">{mail?.date}</span>
            </div>
            {mail?.recipientType && (
              <div className="flex justify-between">
                <span className="text-gray-400">Recipient Type:</span>
                <span className="text-blue-300 capitalize">{mail.recipientType.replace(/-/g, ' ')}</span>
              </div>
            )}
          </div>

          {/* Labels */}
          {mail?.labels && mail.labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-gray-400 text-sm">Labels:</span>
              {mail.labels.map((label, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Mail Body */}
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
              {mail?.body}
            </p>
          </div>

          {/* Replies Section */}
          {mail?.replies && mail.replies.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 border-b border-white/10 pb-2">
                Replies ({mail.replies.length})
              </h3>
              {mail.replies.map((reply, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-blue-300">{reply.sentBy || "User"}</span>
                    <span className="text-xs text-gray-400">
                      {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons and Reply Form */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white py-2 px-4 rounded-full text-sm font-medium transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Reply
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your reply..."
                className="w-full p-3 rounded-lg bg-white/5 text-white text-sm border border-white/10 focus:outline-none focus:border-blue-500 resize-none"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={sendingReply || !replyContent.trim()}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  {sendingReply ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Reply
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}