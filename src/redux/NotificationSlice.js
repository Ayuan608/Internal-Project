// src/redux/notificationSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../Helpers/axiosInstance";

// Fetch ALL notifications (primary method)
export const getAllNotifications = createAsyncThunk(
  "notifications/getAll",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching all notifications...");
      const response = await axiosInstance.get(`/notifications`);
      console.log("All notifications response:", response.data);
      const notifications = response.data.notifications || response.data;
      console.log("Total notifications fetched:", notifications.length);
      return notifications;
    } catch (error) {
      console.error("Error fetching all notifications:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

// Fetch user-specific notifications (fallback)
export const fetchUserNotifications = createAsyncThunk(
  "notifications/fetchUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/notification/${userId}`);
      return response.data.notifications || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user notifications"
      );
    }
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      console.log("📝 Marking notification as read:", notificationId);
      const response = await axiosInstance.patch(
        `/notifications/${notificationId}/read`
      );

      return response.data.notification;
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
        console.log("🔔 New notification added:", action.payload.title);
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
        console.log("📦 Bulk notifications added:", newNotifications.length);
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
        console.log("✅ Notification marked as read locally:", action.payload);
      }
    },

    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.lastFetched = null;
      console.log("🗑️ All notifications cleared");
    },

    // Recalculate unread count
    recalculateUnreadCount: (state) => {
      state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
      console.log("🔢 Unread count recalculated:", state.unreadCount);
    },

    // Set connection type
    setConnectionType: (state, action) => {
      state.connectionType = action.payload;
      console.log("🔌 Connection type set to:", action.payload);
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
        console.log("⏳ Loading all notifications...");
      })
      .addCase(getAllNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.loading = false;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
        state.connectionType = "api";
        state.lastFetched = new Date().toISOString();
        console.log("✅ All notifications loaded:", action.payload.length);
        console.log("📊 Unread count:", state.unreadCount);
      })
      .addCase(getAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ Failed to load all notifications:", action.payload);
      });

    // Fetch user notifications (fallback)
    builder
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("⏳ Loading user notifications...");
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.loading = false;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
        state.connectionType = "api";
        state.lastFetched = new Date().toISOString();
        console.log("✅ User notifications loaded:", action.payload.length);
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ Failed to load user notifications:", action.payload);
      });

    // Mark as read
    builder
      .addCase(markNotificationAsRead.pending, (state) => {
        console.log("⏳ Marking notification as read...");
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n._id === action.payload._id
        );
        if (notification) {
          notification.isRead = true;
          notification.readAt = action.payload.readAt;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
          console.log("✅ Notification marked as read:", action.payload._id);
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
