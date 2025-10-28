import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from './authSlice'
import attendenceSliceReducer from './attendenceSlice'
import notificationSliceReducer from './NotificationSlice'
import statSliceReducer from './statSlice'
import quotaSliceReducer from './QuotaSlice'
import reportSliceReducer from './reportSlice'
import announcementSliceReducer from './announcementSlice'
const store = configureStore({
    reducer: {
        auth: authSliceReducer,
        attendance: attendenceSliceReducer,
        notifications: notificationSliceReducer,
        quota: quotaSliceReducer,
        report: reportSliceReducer,
        stat: statSliceReducer,
        announcements: announcementSliceReducer
    },
    devtools: true
})

export default store; 