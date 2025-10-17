
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const initializeSocket = (userId) => {
  if (socket && socket.connected) {
    console.log('Socket already connected');
    return socket;
  }

  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('✅ Connected to socket server:', socket.id);
    if (userId) {
      socket.emit('user:online', userId);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from socket server');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const onNotificationNew = (callback) => {
  if (socket) {
    socket.on('notification:new', callback);
  }
};

export const onNotificationBulk = (callback) => {
  if (socket) {
    socket.on('notification:bulk', callback);
  }
};

export const removeNotificationListeners = () => {
  if (socket) {
    socket.off('notification:new');
    socket.off('notification:bulk');
  }
};