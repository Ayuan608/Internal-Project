import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications = [action.payload, ...state.notifications];
      state.unreadCount++;
    },
    markNotificationAsRead: (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.map((n, i) =>
        i === id ? { ...n, isRead: true } : n
      );
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markNotificationAsRead, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
