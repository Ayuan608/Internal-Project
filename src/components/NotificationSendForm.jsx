// src/components/NotificationSendForm.jsx
import { useState } from 'react';
import { Send, X, Users, Paperclip } from 'lucide-react';
import axiosInstance from '../Helpers/axiosInstance';
import toast from 'react-hot-toast';

const NotificationSendForm = ({ onClose, currentUserId }) => {
  const [formData, setFormData] = useState({
    sender: currentUserId || '',
    recipient: '',
    title: '',
    message: '',
    nature: '',
    attachment: ''
  });
  const [loading, setLoading] = useState(false);
  const [sendToAll, setSendToAll] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }

    setLoading(true);
    try {
      if (sendToAll) {
        await axiosInstance.post('/notification/send-all', {
          sender: formData.sender,
          title: formData.title,
          nature: formData.nature,
          message: formData.message,
          attachment: formData.attachment
        });
        toast.success('Notification sent to all users');
      } else {
        if (!formData.recipient) {
          toast.error('Recipient ID is required');
          setLoading(false);
          return;
        }

        await axiosInstance.post('/notification/send', {
          sender: formData.sender,
          recipient: formData.recipient,
          title: formData.title,
          nature: formData.nature,
          message: formData.message,
          attachment: formData.attachment
        });
        toast.success('Notification sent successfully');
      }

      setFormData({
        sender: currentUserId || '',
        recipient: '',
        title: '',
        message: '',
        nature: '',
        attachment: ''
      });
      onClose();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      sender: currentUserId || '',
      recipient: '',
      title: '',
      message: '',
      nature: '',
      attachment: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111113] border border-[#2e3135] rounded-xl p-6 w-full max-w-md mx-4 text-white shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Send Notification</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Sender ID
            </label>
            <input
              type="text"
              name="sender"
              value={formData.sender}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-[#1b1b1f] border border-[#2e3135] focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
              placeholder="Your user id"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sendToAll"
              checked={sendToAll}
              onChange={(e) => setSendToAll(e.target.checked)}
              className="rounded border-[#2e3135] bg-[#1b1b1f]"
            />
            <label htmlFor="sendToAll" className="text-sm font-medium text-gray-300">
              <Users size={16} className="inline mr-1" />
              Send to all users
            </label>
          </div>

          {!sendToAll && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Recipient ID
              </label>
              <input
                type="text"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-[#1b1b1f] border border-[#2e3135] focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                placeholder="Enter recipient user ID"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-[#1b1b1f] border border-[#2e3135] focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
              placeholder="Notification title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nature (category)
            </label>
            <input
              type="text"
              name="nature"
              value={formData.nature}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-[#1b1b1f] border border-[#2e3135] focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
              placeholder="e.g. info, alert, reminder"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-[#1b1b1f] border border-[#2e3135] focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
              placeholder="Notification message"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Attachment URL
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-[#1b1b1f] border border-[#2e3135] rounded-md px-3">
                <Paperclip size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="attachment"
                  value={formData.attachment}
                  onChange={handleChange}
                  className="w-full py-2 bg-transparent focus:outline-none text-white placeholder-gray-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-gray-200 bg-[#1b1b1f] border border-[#2e3135] rounded-md hover:bg-[#232329] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send size={16} className="mr-1" />
                  {sendToAll ? 'Send All' : 'Send'}
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
