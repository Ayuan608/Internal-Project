import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from './authSlice'
import attendenceSliceReducer from './attendenceSlice'
import notificationSliceReducer from './NotificationSlice'
import reportSliceReducer from './reportSlice'
import sheetSliceReducer from './sheetSlice'
import announcementSliceReducer from './announcementSlice'
import combinedQuotaReducer from './combinedQuotaSlice'
import activitySliceReducer from './activitylogSlice'
import employeeOfMonthReducer from './employeeOfMonthSlice'
import statSliceReducer from './statSlice'
import auditTrailSliceReducer from './auditTrailSlice'
import fileSliceReducer from './FileSlice'
import quotaSliceReducer from './quotaSlice'

const store = configureStore({
    reducer: {
        stat: statSliceReducer,
        auth: authSliceReducer,
        attendance: attendenceSliceReducer,
        report: reportSliceReducer,
        activity: activitySliceReducer,
        sheet: sheetSliceReducer,
        file: fileSliceReducer,
        quota: quotaSliceReducer,
        notifications: notificationSliceReducer,
        announcements: announcementSliceReducer,
        combinedQuota: combinedQuotaReducer,
        employeeOfMonth: employeeOfMonthReducer,
        auditTrail: auditTrailSliceReducer,
    },
    devtools: true
})

export default store; 