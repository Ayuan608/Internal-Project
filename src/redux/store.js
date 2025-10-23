import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from './authSlice'
import attendenceSliceReducer from './attendenceSlice'
import notificationSliceReducer from './NotificationSlice'
import statSliceReducer from './statSlice'

const store = configureStore({
    reducer: {
        auth: authSliceReducer,
        attendance: attendenceSliceReducer,
        notifications: notificationSliceReducer,
        stat: statSliceReducer
    },
    devtools: true
})

export default store; 