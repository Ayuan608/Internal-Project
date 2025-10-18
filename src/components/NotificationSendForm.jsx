// src/components/NotificationSendForm.jsx
import { useState } from "react";
import { Send, X, Users, Paperclip, AlertCircle } from "lucide-react";
import axiosInstance from "../Helpers/axiosInstance";
import toast from "react-hot-toast";

const NotificationSendForm = ({ onClose, currentUserId }) => {
  const [formData, setFormData] = useState({
    sender: currentUserId || "",
    recipient: "",
    title: "",
    message: "",
    nature: "",
    attachment: "",
  });
  const [loading, setLoading] = useState(false);
  const [sendToAll, setSendToAll] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.message) {
      toast.error("Title and message are required");
      return;
    }

    if (!sendToAll && !formData.recipient) {
      toast.error("Recipient ID is required when not sending to all");
      return;
    }

    setLoading(true);
    console.log("📤 Sending notification...");
    console.log("Send to all:", sendToAll);
    console.log("Form data:", formData);

    try {
      let response;

      if (sendToAll) {
        try {
          console.log("🔍 Trying route: /send-all");
          response = await axiosInstance.post("/notifications/send-all", {
            sender: formData.sender,
            title: formData.title,
            nature: formData.nature,
            message: formData.message,
            attachment: formData.attachment,
          });
          console.log("✅ Success with route: /send-all");
        } catch (err) {
          console.log("🔍 Trying route: /notifications/send-all");
          response = await axiosInstance.post("/notifications/send-all", {
            sender: formData.sender,
            title: formData.title,
            nature: formData.nature,
            message: formData.message,
            attachment: formData.attachment,
          });
          console.log("✅ Success with route: /notifications/send-all");
        }

        toast.success("✅ Notification sent to all users!", {
          icon: "📢",
          duration: 4000,
        });
      } else {
        console.log("🔄 Attempting to send to specific user...");

        // Try different route variations for single send
        try {
          console.log("🔍 Trying route: /send");
          response = await axiosInstance.post("/notifications/send", {
            sender: formData.sender,
            recipient: formData.recipient,
            title: formData.title,
            nature: formData.nature,
            message: formData.message,
            attachment: formData.attachment,
          });
          console.log("✅ Success with route: /send");
        } catch (err) {
          console.log("🔍 Trying route: /notifications/send");
          response = await axiosInstance.post("/notifications/send", {
            sender: formData.sender,
            recipient: formData.recipient,
            title: formData.title,
            nature: formData.nature,
            message: formData.message,
            attachment: formData.attachment,
          });
          console.log("✅ Success with route: /notifications/send");
        }

        toast.success("✅ Notification sent successfully!", {
          icon: "✉️",
          duration: 4000,
        });
      }

      console.log("✅ Response:", response.data);

      // Reset form
      setFormData({
        sender: currentUserId || "",
        recipient: "",
        title: "",
        message: "",
        nature: "",
        attachment: "",
      });
      setSendToAll(false);

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("❌ Error sending notification:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Request URL:", error.config?.url);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send notification";

      toast.error(`❌ ${errorMessage}`, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      sender: currentUserId || "",
      recipient: "",
      title: "",
      message: "",
      nature: "",
      attachment: "",
    });
    setSendToAll(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111113] border border-[#2e3135] rounded-xl p-6 w-full max-w-2xl mx-4 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#2e3135]">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Send size={24} className="text-blue-400" />
              Send Notification
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Send notifications to specific users or broadcast to everyone
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-200 p-2 rounded-lg hover:bg-[#1b1b1f] transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sender ID */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sender ID
            </label>
            <input
              type="text"
              name="sender"
              value={formData.sender}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1b1b1f] border border-[#2e3135] focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
              placeholder="Your user ID"
              required
            />
          </div>

          {/* Send to All Checkbox */}
          <div className="flex items-center space-x-3 p-3 bg-[#1b1b1f] rounded-lg border border-[#2e3135]">
            <input
              type="checkbox"
              id="sendToAll"
              checked={sendToAll}
              onChange={(e) => setSendToAll(e.target.checked)}
              className="w-4 h-4 rounded border-[#2e3135] bg-[#111113] text-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="sendToAll"
              className="text-sm font-medium text-gray-300 flex items-center gap-2 cursor-pointer"
            >
              <Users size={18} className="text-blue-400" />
              Send to all users (Broadcast)
            </label>
          </div>

          {/* Recipient ID (conditional) */}
          {!sendToAll && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recipient ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-[#1b1b1f] border border-[#2e3135] focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                placeholder="Enter recipient user ID"
                required={!sendToAll}
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1b1b1f] border border-[#2e3135] focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
              placeholder="Enter notification title"
              required
            />
          </div>

          {/* Nature */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category / Nature
            </label>
            <select
              name="nature"
              value={formData.nature}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1b1b1f] border border-[#2e3135] focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="">Select category</option>
              <option value="info">📌 Info</option>
              <option value="alert">⚠️ Alert</option>
              <option value="reminder">⏰ Reminder</option>
              <option value="update">🔄 Update</option>
              <option value="announcement">📢 Announcement</option>
              <option value="warning">⚡ Warning</option>
              <option value="success">✅ Success</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg bg-[#1b1b1f] border border-[#2e3135] focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 resize-none"
              placeholder="Enter your notification message..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.message.length} characters
            </p>
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Attachment URL (Optional)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-[#1b1b1f] border border-[#2e3135] rounded-lg px-4">
                <Paperclip size={16} className="text-gray-400 mr-2" />
                <input
                  type="url"
                  name="attachment"
                  value={formData.attachment}
                  onChange={handleChange}
                  className="w-full py-2.5 bg-transparent focus:outline-none text-white placeholder-gray-500"
                  placeholder="https://example.com/file.pdf"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          {sendToAll && (
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <AlertCircle
                size={20}
                className="text-blue-400 flex-shrink-0 mt-0.5"
              />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Broadcasting to all users</p>
                <p className="text-blue-400/80">
                  This notification will be sent to every user in the system.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 text-gray-200 bg-[#1b1b1f] border border-[#2e3135] rounded-lg hover:bg-[#232329] transition font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  {sendToAll ? "Send to All" : "Send Notification"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationSendForm;
