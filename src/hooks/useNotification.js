// src/hooks/useNotifications.js
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  addRealtimeNotification,
  updateFCMToken,
  selectNotifications,
  selectUnreadCount,
  selectLoading,
} from "../redux/slices/notificationSlice";
import {
  requestNotificationPermission,
  onMessageListener,
  isNotificationSupported,
} from "../services/firebase/firebase";

/**
 * Custom hook for managing notifications
 */
export const useNotifications = (userId) => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectLoading);

  /**
   * Initialize FCM and fetch notifications on mount
   */
  useEffect(() => {
    if (!userId) return;

    console.log("🚀 Initializing notifications for user:", userId);

    // Initialize FCM token
    const initializeFCM = async () => {
      if (!isNotificationSupported()) {
        console.warn("⚠️ Notifications not supported");
        return;
      }

      const token = await requestNotificationPermission();
      
      if (token) {
        // Send token to backend
        dispatch(updateFCMToken({ userId, fcmToken: token }));
      }
    };

    // Fetch existing notifications
    dispatch(fetchUserNotifications({ userId }));

    // Initialize FCM
    initializeFCM();
  }, [userId, dispatch]);

  /**
   * Listen for real-time notifications
   */
  useEffect(() => {
    if (!isNotificationSupported()) return;

    console.log("👂 Listening for real-time notifications...");

    const unsubscribe = onMessageListener().then((payload) => {
      console.log("🎯 Real-time notification:", payload);

      // Show browser notification
      if (payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: "/logo.png",
          badge: "/badge.png",
          tag: payload.data?.notificationId,
          requireInteraction: payload.data?.priority === "urgent",
        });
      }

      // Add to Redux store
      if (payload.data?.notificationId) {
        dispatch(
          addRealtimeNotification({
            _id: payload.data.notificationId,
            title: payload.notification.title,
            message: payload.notification.body,
            nature: payload.data.nature,
            priority: payload.data.priority,
            isRead: false,
            createdAt: new Date().toISOString(),
            data: payload.data,
          })
        );
      }
    });

    return () => {
      // Cleanup if needed
    };
  }, [dispatch]);

  /**
   * Refresh notifications
   */
  const refreshNotifications = useCallback(() => {
    if (userId) {
      dispatch(fetchUserNotifications({ userId }));
    }
  }, [userId, dispatch]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    (notificationId) => {
      dispatch(markNotificationAsRead(notificationId));
    },
    [dispatch]
  );

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(() => {
    if (userId) {
      dispatch(markAllNotificationsAsRead(userId));
    }
  }, [userId, dispatch]);

  /**
   * Delete notification
   */
  const removeNotification = useCallback(
    (notificationId) => {
      dispatch(deleteNotification(notificationId));
    },
    [dispatch]
  );

  /**
   * Load more notifications (pagination)
   */
  const loadMore = useCallback(
    (page) => {
      if (userId) {
        dispatch(fetchUserNotifications({ userId, page }));
      }
    },
    [userId, dispatch]
  );

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    loadMore,
  };
};