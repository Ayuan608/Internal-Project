// src/components/NotificationSendForm.jsx
import { useState } from 'react';
import { Send, X, Users } from 'lucide-react';
import axiosInstance from '../Helpers/axiosInstance';
import toast from 'react-hot-toast';

const NotificationSendForm = ({ onClose, currentUserId }) => {
  const [formData, setFormData] = useState({
    senderId: currentUserId || '',
    recipientId: '',
    title: '',
    message: '',
    description: ''
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
        // Send to all users
        await axiosInstance.post('/notifications/send-all', {
          senderId: formData.senderId,
          title: formData.title,
          message: formData.message,
          description: formData.description
        });
        toast.success('Notification sent to all users');
      } else {
        // Send to specific user
        if (!formData.recipientId) {
          toast.error('Recipient ID is required');
          setLoading(false);
          return;
        }
        
        await axiosInstance.post('/notifications/send', {
          senderId: formData.senderId,
          recipientId: formData.recipientId,
          title: formData.title,
          message: formData.message,
          description: formData.description
        });
        toast.success('Notification sent successfully');
      }
      
      // Reset form
      setFormData({
        senderId: currentUserId || '',
        recipientId: '',
        title: '',
        message: '',
        description: ''
      });
      onClose();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      senderId: currentUserId || '',
      recipientId: '',
      title: '',
      message: '',
      description: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Send Notification</h3>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sender ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sender ID
            </label>
            <input
              type="text"
              name="senderId"
              value={formData.senderId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Send to All Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sendToAll"
              checked={sendToAll}
              onChange={(e) => setSendToAll(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="sendToAll" className="text-sm font-medium text-gray-700">
              <Users size={16} className="inline mr-1" />
              Send to All Users
            </label>
          </div>

          {/* Recipient ID - Only show if not sending to all */}
          {!sendToAll && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient ID
              </label>
              <input
                type="text"
                name="recipientId"
                value={formData.recipientId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter recipient user ID"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification title"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification message"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
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
