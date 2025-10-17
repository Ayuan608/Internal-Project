# Socket.io Notification System Setup

This document explains how to set up and use the real-time notification system with Socket.io integration.

## Features

- ✅ Real-time notifications via Socket.io
- ✅ API fallback when socket connection fails
- ✅ Connection status indicators
- ✅ Automatic reconnection with exponential backoff
- ✅ Redux integration for state management
- ✅ Duplicate notification prevention
- ✅ Visual connection status in UI

## Files Added/Modified

### New Files:
- `src/services/socketService.js` - Socket.io service with connection management
- `src/hooks/useSocket.js` - React hook for socket integration
- `src/config/socketConfig.js` - Socket configuration

### Modified Files:
- `src/components/popup/Notification.jsx` - Added socket integration and connection indicators
- `src/redux/NotificationSlice.js` - Enhanced with socket event handling

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in your project root:

```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api/v1
```

**Note**: Since you're using Vite, environment variables must be prefixed with `VITE_` instead of `REACT_APP_`.

### 2. Backend Socket.io Setup

Your backend should implement these Socket.io events:

#### Server Events (Backend → Frontend):
```javascript
// New notification
socket.emit('newNotification', notificationData);

// Notification marked as read
socket.emit('notificationRead', notificationId);

// Bulk notifications
socket.emit('bulkNotifications', notificationsArray);

// Server messages
socket.emit('serverMessage', message);
```

#### Client Events (Frontend → Backend):
```javascript
// Join user room
socket.on('joinUserRoom', ({ userId }) => {
  socket.join(`user_${userId}`);
});

// Leave user room
socket.on('leaveUserRoom', ({ userId }) => {
  socket.leave(`user_${userId}`);
});

// Mark notification as read
socket.on('markNotificationRead', ({ notificationId }) => {
  // Update notification in database
  // Broadcast to user room
});

// Get notification history
socket.on('getNotificationHistory', ({ userId, limit }) => {
  // Fetch and send notification history
});
```

### 3. Backend Authentication

The socket connection includes authentication:

```javascript
// Socket connection with auth
const socket = io(SOCKET_URL, {
  auth: {
    userId: userId,
    token: localStorage.getItem('token') || localStorage.getItem('tempAuthToken')
  }
});
```

Your backend should verify the token and userId:

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const userId = socket.handshake.auth.userId;
  
  // Verify token and userId
  // If valid, call next()
  // If invalid, call next(new Error('Authentication error'))
});
```

## Usage

### Basic Usage in Components

```jsx
import useSocket from '../hooks/useSocket';

const MyComponent = () => {
  const userId = useSelector((state) => state.auth?.data?._id);
  
  const {
    connectionStatus,
    isConnected,
    markNotificationAsRead,
    fetchNotificationsFallback
  } = useSocket(userId, {
    autoConnect: true,
    enableNotifications: true,
    onConnectionChange: (status) => {
      console.log('Connection status:', status);
    }
  });

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {/* Your component content */}
    </div>
  );
};
```

### Notification Component Integration

The notification component automatically:
- Connects to socket when user is authenticated
- Shows real-time notifications
- Falls back to API when socket is unavailable
- Displays connection status indicators

## Connection Status Indicators

- 🟢 **Green Wifi Icon**: Real-time connection active
- 🟠 **Orange Wifi-off Icon**: Using API fallback
- **"Live" badge**: Real-time mode
- **"API" badge**: Fallback mode

## Configuration

### Socket Configuration (`src/config/socketConfig.js`)

```javascript
export const SOCKET_CONFIG = {
  URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  OPTIONS: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5
  }
};
```

### Retry Logic

- Maximum 5 reconnection attempts
- Exponential backoff (1s, 2s, 4s, 8s, 16s)
- Automatic API fallback after 2 seconds of disconnection

## Error Handling

The system handles various error scenarios:

1. **Socket Connection Failed**: Falls back to API
2. **Authentication Error**: Logs out user
3. **Network Issues**: Automatic reconnection with backoff
4. **Server Errors**: Graceful degradation to API mode

## Testing

### Test Socket Connection

```javascript
// In browser console
const socket = io('http://localhost:5000', {
  auth: { userId: 'test', token: 'test-token' }
});

socket.on('connect', () => console.log('Connected!'));
socket.on('connect_error', (err) => console.log('Error:', err));
```

### Test API Fallback

1. Disconnect from internet
2. Open notification popup
3. Should show "API" badge and fetch via HTTP

## Troubleshooting

### Common Issues:

1. **Socket not connecting**:
   - Check `VITE_SOCKET_URL` environment variable
   - Verify backend socket.io server is running
   - Check CORS settings on backend

2. **Authentication errors**:
   - Verify token is valid
   - Check token format in localStorage
   - Ensure backend socket middleware is properly configured

3. **Notifications not appearing**:
   - Check Redux store state
   - Verify socket events are being emitted from backend
   - Check browser console for errors

### Debug Mode

Enable debug logging by setting:

```javascript
localStorage.setItem('debug', 'socket.io-client:*');
```

## Performance Considerations

- Socket connections are automatically cleaned up on component unmount
- Duplicate notifications are prevented
- Connection status is cached to avoid unnecessary re-renders
- Exponential backoff prevents server overload during reconnection

## Security Notes

- Tokens are sent with socket authentication
- User rooms are isolated per userId
- Connection errors are logged but not exposed to users
- API fallback maintains same security as regular HTTP requests
