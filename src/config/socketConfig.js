// src/config/socketConfig.js

export const SOCKET_CONFIG = {
  // Socket server URL
  URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  
  // Connection options
  OPTIONS: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    maxReconnectionAttempts: 5
  },
  
  // Event names
  EVENTS: {
    // Client to server
    JOIN_USER_ROOM: 'joinUserRoom',
    LEAVE_USER_ROOM: 'leaveUserRoom',
    MARK_NOTIFICATION_READ: 'markNotificationRead',
    GET_NOTIFICATION_HISTORY: 'getNotificationHistory',
    
    // Server to client
    NEW_NOTIFICATION: 'newNotification',
    NOTIFICATION_READ: 'notificationRead',
    BULK_NOTIFICATIONS: 'bulkNotifications',
    SERVER_MESSAGE: 'serverMessage',
    
    // Connection events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    ERROR: 'error'
  },
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 5,
    BASE_DELAY: 1000,
    MAX_DELAY: 30000
  }
};

export default SOCKET_CONFIG;
