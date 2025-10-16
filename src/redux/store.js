import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from './authSlice'
import attendenceSliceReducer from './attendenceSlice'

const store = configureStore({
    reducer: {
        auth: authSliceReducer,
        attendance: attendenceSliceReducer
    },
    devtools: true
})

export default store; 