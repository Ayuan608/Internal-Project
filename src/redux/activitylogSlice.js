import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../Helpers/axiosInstance";

const initialState = {
    activities: [],
    loading: false,
    error: null,
};
export const getAllActivities = createAsyncThunk(
    "activity/getAll",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get('/activity/all', {
                withCredentials: true,
            });
            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch activities"
            );
        }
    }
);

export const recordLogin = createAsyncThunk(
    "activity/record",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post(`/activity/record`, {}, {
                withCredentials: true,
            });
            return data.activity;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to record login"
            );
        }
    }
);

export const terminateSession = createAsyncThunk(
    "activity/terminate",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.put(`/activity/terminate/${id}`, {}, {
                withCredentials: true,
            });
            return { id, message: data.message };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to terminate session"
            );
        }
    }
);
export const activateSession = createAsyncThunk(
    "activity/activate",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.put(`/activity/activate/${id}`, {}, {
                withCredentials: true,
            });
            return { id, message: data.message };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to activate session"
            );
        }
    }
);


const activitySlice = createSlice({
    name: "activity",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // ===== Get All Activities =====
            .addCase(getAllActivities.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllActivities.fulfilled, (state, action) => {
                state.loading = false;
                state.activities = action.payload;
            })
            .addCase(getAllActivities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== Record Login =====
            .addCase(recordLogin.pending, (state) => {
                state.loading = true;
            })
            .addCase(recordLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.activities.unshift(action.payload);
            })
            .addCase(recordLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== Terminate Session =====
            .addCase(terminateSession.fulfilled, (state, action) => {
                state.activities = state.activities.map((activity) =>
                    activity._id === action.payload.id
                        ? { ...activity, terminated: true }
                        : activity
                );
            })
            .addCase(terminateSession.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(activateSession.fulfilled, (state, action) => {
                state.activities = state.activities.map((activity) =>
                    activity._id === action.payload.id
                        ? { ...activity, terminated: false }
                        : activity
                );
            })
            .addCase(activateSession.rejected, (state, action) => {
                state.error = action.payload;
            });

    },
});

export default activitySlice.reducer;
