// src/components/popup/Notification.jsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserNotifications,
  markNotificationAsRead,
  addNotification,
  addBulkNotifications,
  clearNotifications,
} from '../../redux/NotificationSlice';
import {
  initializeSocket,
  onNotificationNew,
  onNotificationBulk,
  removeNotificationListeners,
} from '../../services/socketService';
import toast from 'react-hot-toast';
import './Notification.css';

const Notification = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notifications
  );

  const [isOpen, setIsOpen] = useState(false);
  const socketInitialized = useRef(false);

  // Memoize callback to prevent recreation on every render
  const handleNewNotification = useCallback((notification) => {
    console.log('📬 New notification received:', notification);
    dispatch(addNotification(notification));
    toast.success(`New: ${notification.title}`);
  }, [dispatch]);

  const handleBulkNotifications = useCallback((notifications) => {
    console.log('📬 Bulk notifications received:', notifications);
    dispatch(addBulkNotifications(notifications));
  }, [dispatch]);

  useEffect(() => {
    if (!user?._id || socketInitialized.current) return;

    // Initialize socket connection
    initializeSocket(user._id);
    socketInitialized.current = true;

    // Fetch initial notifications
    dispatch(fetchUserNotifications(user._id));

    // Listen for new notifications
    onNotificationNew(handleNewNotification);

    // Listen for bulk notifications (when reconnecting with unread)
    onNotificationBulk(handleBulkNotifications);

    return () => {
      removeNotificationListeners();
      socketInitialized.current = false;
    };
  }, [user?._id, dispatch, handleNewNotification, handleBulkNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
      toast.success('Marked as read');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all notifications?')) {
      try {
        await dispatch(clearNotifications()).unwrap();
        toast.success('Notifications cleared');
      } catch (error) {
        console.error('Failed to clear notifications:', error);
        toast.error('Failed to clear notifications');
      }
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.notification-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="notification-container bg-black h-screen w-screen">
      {/* Notification Bell Icon */}
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="unread-badge" aria-label={`${unreadCount} unread notifications`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popup */}
      {isOpen && (
        <div className="notification-popup" role="dialog" aria-label="Notifications panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button
                className="clear-btn"
                onClick={handleClearAll}
                aria-label="Clear all notifications"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="loading" role="status" aria-live="polite">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty">No notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                  role="article"
                  aria-label={`Notification: ${notif.title}`}
                >
                  <div className="notification-content">
                    <h4>{notif.title}</h4>
                    {notif.nature && <p className="nature">{notif.nature}</p>}
                    <p className="message">{notif.message}</p>
                    {notif.sender?.name && (
                      <small className="sender">From: {notif.sender.name}</small>
                    )}
                    {notif.createdAt && (
                      <small className="timestamp">
                        {new Date(notif.createdAt).toLocaleString()}
                      </small>
                    )}
                  </div>

                  {!notif.isRead && (
                    <button
                      className="read-btn"
                      onClick={() => handleMarkAsRead(notif._id)}
                      aria-label={`Mark ${notif.title} as read`}
                    >
                      ✓ Mark Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;