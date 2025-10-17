// src/redux/notificationSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../Helpers/axiosInstance";

// Async thunks
export const fetchUserNotifications = createAsyncThunk(
  "notifications/fetchUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/notifications/${userId}`);
      console.log("res",response.data.notifications)
      return response.data.notifications;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
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
    connectionType: "unknown", // 'socket', 'api', 'unknown'
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
    // Fetch notifications
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
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
