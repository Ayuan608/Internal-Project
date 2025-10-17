// src/services/socketService.js

import { io } from 'socket.io-client';
import SOCKET_CONFIG from '../config/socketConfig';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = SOCKET_CONFIG.RETRY.MAX_ATTEMPTS;
    this.reconnectDelay = SOCKET_CONFIG.RETRY.BASE_DELAY;
    this.listeners = new Map();
  }

  // Initialize socket connection - PREVENT MULTIPLE CONNECTIONS
  connect(userId) {
    if (this.socket?.connected || this.socket?.connecting) {
      return this.socket;
    }

    this.socket = io(SOCKET_CONFIG.URL, {
      auth: {
        userId: userId,
        token: localStorage.getItem('token') || localStorage.getItem('tempAuthToken')
      },
      ...SOCKET_CONFIG.OPTIONS
    });

    this.setupEventListeners();
    return this.socket;
  }

  // Setup socket event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events - NO CONSOLE LOGS
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connectionStatus', { connected: true, socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.emit('connectionStatus', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      this.handleReconnect();
      this.emit('connectionStatus', { connected: false, error: error.message });
    });

    // Notification events - NO CONSOLE LOGS
    this.socket.on(SOCKET_CONFIG.EVENTS.NEW_NOTIFICATION, (notification) => {
      this.emit('newNotification', notification);
    });

    this.socket.on(SOCKET_CONFIG.EVENTS.NOTIFICATION_READ, (notificationId) => {
      this.emit('notificationRead', notificationId);
    });

    this.socket.on(SOCKET_CONFIG.EVENTS.BULK_NOTIFICATIONS, (notifications) => {
      this.emit('bulkNotifications', notifications);
    });

    // Server events
    this.socket.on(SOCKET_CONFIG.EVENTS.SERVER_MESSAGE, (message) => {
      this.emit('serverMessage', message);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('socketError', error);
    });
  }

  // Handle reconnection logic
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        if (!this.isConnected && this.socket) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.log('Max reconnection attempts reached');
      this.emit('connectionStatus', { connected: false, maxRetriesReached: true });
    }
  }

  // Join user-specific room for notifications
  joinUserRoom(userId) {
    if (this.socket?.connected) {
      this.socket.emit(SOCKET_CONFIG.EVENTS.JOIN_USER_ROOM, { userId });
    }
  }

  // Leave user room
  leaveUserRoom(userId) {
    if (this.socket?.connected) {
      this.socket.emit(SOCKET_CONFIG.EVENTS.LEAVE_USER_ROOM, { userId });
    }
  }

  // Mark notification as read via socket
  markNotificationAsRead(notificationId) {
    if (this.socket?.connected) {
      this.socket.emit(SOCKET_CONFIG.EVENTS.MARK_NOTIFICATION_READ, { notificationId });
    }
  }

  // Request notification history
  requestNotificationHistory(userId, limit = 50) {
    if (this.socket?.connected) {
      this.socket.emit(SOCKET_CONFIG.EVENTS.GET_NOTIFICATION_HISTORY, { userId, limit });
    }
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Unsubscribe from events
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit custom events
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Clean up
  destroy() {
    this.disconnect();
    this.reconnectAttempts = 0;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;