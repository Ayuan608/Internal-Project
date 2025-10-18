// src/redux/notificationSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../Helpers/axiosInstance";

// Async thunks
export const fetchUserNotifications = createAsyncThunk(
  "notifications/fetchUser",
  async (userId, { rejectWithValue }) => {
    try {
      // Align with backend route naming (singular 'notification')
      const response = await axiosInstance.get(`/notification/${userId}`);
      return response.data.notifications;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// New: Get all notifications (without user ID)
export const getAllNotifications = createAsyncThunk(
  "notifications/getAll",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching all notifications...");
      const response = await axiosInstance.get(`/notifications`);
      console.log("All notifications response:", response.data);
      return response.data.notifications || response.data;
    } catch (error) {
      console.error("Error fetching all notifications:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/notifications/${notificationId}/read`
      );
      return response.data.notification;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
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
      // Check if notification already exists to prevent duplicates
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

      state.notifications.unshift(...newNotifications);
      state.unreadCount += newNotifications.filter((n) => !n.isRead).length;
      state.connectionType = "socket";
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
    // Fetch user notifications
    builder
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.loading = false;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
        state.connectionType = "api";
        state.lastFetched = new Date().toISOString();
        console.log("User notifications fetched:", action.payload);
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("User notifications fetch failed:", action.payload);
      });

    // Get all notifications
    builder
      .addCase(getAllNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.loading = false;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
        state.connectionType = "api";
        state.lastFetched = new Date().toISOString();
        console.log("All notifications fetched successfully:", action.payload);
        console.log("Total notifications:", action.payload.length);
        console.log("Unread count:", state.unreadCount);
      })
      .addCase(getAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("All notifications fetch failed:", action.payload);
      });

    // Mark as read
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload._id
      );
      if (notification) {
        notification.isRead = true;
        notification.readAt = action.payload.readAt;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        console.log("Notification marked as read:", action.payload._id);
      }
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
