import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../Helpers/axiosInstance";

// Fetch ALL notifications - FIXED TO MATCH BACKEND ROUTE
export const getAllNotifications = createAsyncThunk(
  "notifications/all",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/notifications/all`);
      const notifications =
        response.data.notifications || response.data.data || response.data;
      return notifications;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

// Fetch user-specific notifications - FIXED TO MATCH BACKEND ROUTE
export const fetchUserNotifications = createAsyncThunk(
  "notifications/fetchUser",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("📡 Fetching user notifications for:", userId);
      // Backend route is /notifications/:userId
      const response = await axiosInstance.get(`/notifications/${userId}`);
      console.log("✅ User notifications response:", response.data);

      const notifications =
        response.data.notifications || response.data.data || response.data;
      console.log("📊 User notifications count:", notifications.length);

      return notifications;
    } catch (error) {
      console.error("❌ Error fetching user notifications:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user notifications"
      );
    }
  }
);

// Mark notification as read - FIXED TO MATCH BACKEND ROUTE
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      console.log("📝 Marking notification as read:", notificationId);
      // Backend route is /notifications/:notificationId/read
      const response = await axiosInstance.patch(
        `/notifications/${notificationId}/read`
      );
      console.log("✅ Notification marked as read:", response.data);
      return response.data.notification || response.data;
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark notification as read"
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    lastFetched: null,
    connectionType: "unknown",
  },
  reducers: {
    // Add new notification from socket
    addNotification: (state, action) => {
      const exists = state.notifications.find(
        (n) => n._id === action.payload._id
      );
      if (!exists) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
        state.connectionType = "socket";

      }
    },

    // Add bulk notifications from socket
    addBulkNotifications: (state, action) => {
      const newNotifications = action.payload.filter(
        (newNotif) =>
          !state.notifications.find((existing) => existing._id === newNotif._id)
      );

      if (newNotifications.length > 0) {
        state.notifications.unshift(...newNotifications);
        state.unreadCount += newNotifications.filter((n) => !n.isRead).length;
        state.connectionType = "socket";

      }
    },

    // Update notification read status locally
    updateNotificationRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);

      }
    },

    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.lastFetched = null;

    },

    // Recalculate unread count
    recalculateUnreadCount: (state) => {
      state.unreadCount = state.notifications.filter((n) => !n.isRead).length;

    },

    // Set connection type
    setConnectionType: (state, action) => {
      state.connectionType = action.payload;

    },

    // Set last fetched timestamp
    setLastFetched: (state, action) => {
      state.lastFetched = action.payload;
    },
  },

  extraReducers: (builder) => {
    // Get ALL notifications (primary)
    builder
      .addCase(getAllNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllNotifications.fulfilled, (state, action) => {
        // Ensure action.payload is an array
        const notifications = Array.isArray(action.payload)
          ? action.payload
          : [];

        state.notifications = notifications;
        state.loading = false;
        state.unreadCount = notifications.filter((n) => !n.isRead).length;
        state.connectionType = "api";
        state.lastFetched = new Date().toISOString();

      })
      .addCase(getAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.notifications = []; // Clear on error
      });

    // Fetch user notifications (fallback)
    builder
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("⏳ Loading user notifications...");
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        const notifications = Array.isArray(action.payload)
          ? action.payload
          : [];

        state.notifications = notifications;
        state.loading = false;
        state.unreadCount = notifications.filter((n) => !n.isRead).length;
        state.connectionType = "api";
        state.lastFetched = new Date().toISOString();

        console.log("✅ User notifications loaded:", notifications.length);
        console.log("📊 Unread count:", state.unreadCount);
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.notifications = []; // Clear on error
        console.error("❌ Failed to load user notifications:", action.payload);
      });

    // Mark as read
    builder
      .addCase(markNotificationAsRead.pending, (state) => {
        console.log("⏳ Marking notification as read...");
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const updatedNotif = action.payload;
        const notification = state.notifications.find(
          (n) => n._id === updatedNotif._id
        );

        if (notification) {
          notification.isRead = true;
          notification.readAt = updatedNotif.readAt;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
          console.log("✅ Notification marked as read:", updatedNotif._id);
          console.log("📊 New unread count:", state.unreadCount);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        console.error("❌ Failed to mark as read:", action.payload);
      });
  },
});

export const {
  addNotification,
  addBulkNotifications,
  updateNotificationRead,
  clearNotifications,
  recalculateUnreadCount,
  setConnectionType,
  setLastFetched,
} = notificationSlice.actions;

export default notificationSlice.reducer;
