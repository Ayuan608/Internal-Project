// src/hooks/useSocket.js

import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import socketService from "../services/socketService";
import {
  addNotification,
  addBulkNotifications,
  updateNotificationRead,
  fetchUserNotifications,
} from "../redux/NotificationSlice";

export const useSocket = (userId, options = {}) => {
  const dispatch = useDispatch();
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    socketId: null,
    error: null,
    attempting: false,
  });

  const {
    autoConnect = true,
    enableNotifications = true,
    enableReconnection = true,
    onConnectionChange = null,
  } = options;

  const socketRef = useRef(null);
  const connectedRef = useRef(false);
  const hasTriedConnection = useRef(false);
  const apiFetchedRef = useRef(false);

  // Connection status handler
  const handleConnectionStatus = useCallback(
    (status) => {
      setConnectionStatus((prev) => ({
        ...prev,
        ...status,
        lastUpdated: new Date().toISOString(),
      }));

      connectedRef.current = status.connected || false;

      if (onConnectionChange) {
        onConnectionChange(status);
      }
    },
    [onConnectionChange]
  );

  // New notification handler
  const handleNewNotification = useCallback(
    (notification) => {
      if (enableNotifications) {
        dispatch(addNotification(notification));
      }
    },
    [dispatch, enableNotifications]
  );

  // Bulk notifications handler
  const handleBulkNotifications = useCallback(
    (notifications) => {
      if (enableNotifications) {
        dispatch(addBulkNotifications(notifications));
      }
    },
    [dispatch, enableNotifications]
  );

  // Notification read handler
  const handleNotificationRead = useCallback(
    (notificationId) => {
      dispatch(updateNotificationRead(notificationId));
    },
    [dispatch]
  );

  // Server message handler
  const handleServerMessage = useCallback((message) => {
    console.log("Server message:", message);
    // You can dispatch additional actions here if needed
  }, []);

  // Socket error handler
  const handleSocketError = useCallback((error) => {
    console.error("Socket error:", error);
    setConnectionStatus((prev) => ({
      ...prev,
      error: error.message || "Socket connection error",
    }));
  }, []);

  // Connect to socket - ONLY ONCE
  const connect = useCallback(() => {
    if (!userId || hasTriedConnection.current) {
      return;
    }

    hasTriedConnection.current = true;
    setConnectionStatus(prev => ({ ...prev, attempting: true }));

    try {
      socketRef.current = socketService.connect(userId);

      // Subscribe to events
      socketService.on("connectionStatus", handleConnectionStatus);
      socketService.on("newNotification", handleNewNotification);
      socketService.on("bulkNotifications", handleBulkNotifications);
      socketService.on("notificationRead", handleNotificationRead);
      socketService.on("serverMessage", handleServerMessage);
      socketService.on("socketError", handleSocketError);

      // Join user room
      socketService.joinUserRoom(userId);
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, attempting: false }));
      handleSocketError(error);
    }
  }, [userId, handleConnectionStatus, handleNewNotification, handleBulkNotifications, handleNotificationRead, handleServerMessage, handleSocketError]);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    if (userId) {
      socketService.leaveUserRoom(userId);
    }

    // Unsubscribe from events
    socketService.off("connectionStatus", handleConnectionStatus);
    socketService.off("newNotification", handleNewNotification);
    socketService.off("bulkNotifications", handleBulkNotifications);
    socketService.off("notificationRead", handleNotificationRead);
    socketService.off("serverMessage", handleServerMessage);
    socketService.off("socketError", handleSocketError);

    socketService.disconnect();
    setConnectionStatus({
      connected: false,
      socketId: null,
      error: null,
    });
  }, [
    userId,
    handleConnectionStatus,
    handleNewNotification,
    handleBulkNotifications,
    handleNotificationRead,
    handleServerMessage,
    handleSocketError,
  ]);

  // Mark notification as read via socket
  const markNotificationAsRead = useCallback((notificationId) => {
    socketService.markNotificationAsRead(notificationId);
  }, []);

  // Request notification history via socket
  const requestNotificationHistory = useCallback(
    (limit = 50) => {
      if (userId) {
        socketService.requestNotificationHistory(userId, limit);
      }
    },
    [userId]
  );

  // Fallback to API if socket fails - ONLY ONCE
  const fetchNotificationsFallback = useCallback(async () => {
    if (userId && !connectedRef.current && !apiFetchedRef.current) {
      apiFetchedRef.current = true;
      try {
        await dispatch(fetchUserNotifications(userId)).unwrap();
      } catch (error) {
        console.error("API fetch failed:", error);
        apiFetchedRef.current = false; // Reset on error to allow retry
      }
    }
  }, [userId, dispatch]);

  // Initialize connection - ONLY ONCE per userId
  useEffect(() => {
    if (autoConnect && userId && !hasTriedConnection.current) {
      connect();
    }

    return () => {
      if (userId) {
        disconnect();
        hasTriedConnection.current = false;
        apiFetchedRef.current = false;
      }
    };
  }, [userId]);

  // API fallback - ONLY ONCE after 5 seconds
  useEffect(() => {
    if (!connectedRef.current && userId && !connectionStatus.attempting && !apiFetchedRef.current) {
      const timeoutId = setTimeout(() => {
        fetchNotificationsFallback();
      }, 5000); // Wait 5 seconds before falling back

      return () => clearTimeout(timeoutId);
    }
  }, [userId, connectionStatus.attempting, fetchNotificationsFallback]);

  return {
    connectionStatus,
    connect,
    disconnect,
    markNotificationAsRead,
    requestNotificationHistory,
    fetchNotificationsFallback,
    isConnected: connectionStatus.connected,
    socketId: connectionStatus.socketId,
    error: connectionStatus.error,
  };
};

export default useSocket;
