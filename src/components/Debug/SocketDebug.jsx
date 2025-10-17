// src/components/Debug/SocketDebug.jsx
import { useSelector } from 'react-redux';
import useSocket from '../../hooks/useSocket';

const SocketDebug = () => {
  const userId = useSelector((state) => state.auth?.data?._id);
  const notifications = useSelector((state) => state.notifications);
  
  const {
    connectionStatus,
    isConnected,
    connect,
    disconnect,
    fetchNotificationsFallback,
  } = useSocket(userId, {
    autoConnect: false, // Manual control for testing
    enableNotifications: true,
  });

  if (!userId) {
    return <div className="p-4 bg-red-100 text-red-800">No user ID found</div>;
  }

  return (
    <div className="p-4 bg-gray-100 border rounded-lg m-4">
      <h3 className="font-bold text-lg mb-4">Socket Debug Panel</h3>
      
      <div className="space-y-2 mb-4">
        <div><strong>User ID:</strong> {userId}</div>
        <div><strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</div>
        <div><strong>Attempting:</strong> {connectionStatus.attempting ? '🔄 Yes' : '❌ No'}</div>
        <div><strong>Socket ID:</strong> {connectionStatus.socketId || 'None'}</div>
        <div><strong>Error:</strong> {connectionStatus.error || 'None'}</div>
        <div><strong>Notifications Count:</strong> {notifications.notifications.length}</div>
        <div><strong>Unread Count:</strong> {notifications.unreadCount}</div>
        <div><strong>Connection Type:</strong> {notifications.connectionType}</div>
      </div>

      <div className="space-x-2">
        <button
          onClick={connect}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Connect Socket
        </button>
        <button
          onClick={disconnect}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect Socket
        </button>
        <button
          onClick={fetchNotificationsFallback}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Fetch via API
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <div>Connection Status: {JSON.stringify(connectionStatus, null, 2)}</div>
      </div>
    </div>
  );
};

export default SocketDebug;
