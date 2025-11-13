import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from './authSlice'
import attendenceSliceReducer from './attendenceSlice'
import notificationSliceReducer from './NotificationSlice'
import quotaSliceReducer from './QuotaSlice'
import reportSliceReducer from './reportSlice'
import sheetSliceReducer from './sheetSlice'
import announcementSliceReducer from './announcementSlice'
import combinedQuotaReducer from './combinedQuotaSlice'
import activitySliceReducer from './activitylogSlice'
import employeeOfMonthReducer from './employeeOfMonthSlice'
import statSliceReducer from './statSlice'
const store = configureStore({
    reducer: {
        stat:statSliceReducer,
        auth: authSliceReducer,
        attendance: attendenceSliceReducer,
        quota: quotaSliceReducer,
        report: reportSliceReducer,
        activity:activitySliceReducer,
        sheet: sheetSliceReducer,
        notifications: notificationSliceReducer,
        announcements: announcementSliceReducer,
        combinedQuota: combinedQuotaReducer,
        employeeOfMonth:employeeOfMonthReducer
    },
    devtools: true
})

export default store; 