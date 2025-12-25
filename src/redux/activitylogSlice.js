import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../Helpers/axiosInstance";

const initialState = {
    activities: [],
    whitelistedIPs: [],
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
            console.log(data)
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
export const addWhitelistIp = createAsyncThunk(
    "ipWhitelist/add",
    async (ipData, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post('/activity/add', ipData, {
                withCredentials: true,
            });
            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to add IP to whitelist"
            );
        }
    }
);

// Get all whitelisted IPs
export const getAllIPWhitelist = createAsyncThunk(
    "ipWhitelist/getAll",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get('/activity/getAllIpWhiteList', {
                withCredentials: true,
            });
            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch whitelisted IPs"
            );
        }
    }
);

// Edit whitelisted IP
export const editWhitelistIp = createAsyncThunk(
    "ipWhitelist/edit",
    async ({ id, ipData }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.put(`/activity/ipwhitelist/${id}`, ipData, {
                withCredentials: true,
            });
            return data.updatedIp;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update whitelisted IP"
            );
        }
    }
);

// Delete whitelisted IP
export const deleteWhitelistIp = createAsyncThunk(
    "ipWhitelist/delete",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.delete(`/activity/deleteIpwhitelist/${id}`, {
                withCredentials: true,
            });
            return { id, message: data.message };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to delete whitelisted IP"
            );
        }
    }
);

export const activateStatus = createAsyncThunk(
    "activity/activateStatus",
    async ({ id, status }, { rejectWithValue }) => {

        try {
            const { data } = await axiosInstance.put(`/activity/activate-status/${id}`,
                { status },
                { withCredentials: true }
            );
            return data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update user status"
            );
        }
    }
);


const activitySlice = createSlice({
    name: "activity",
    initialState,
    reducers: {
    },
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


            .addCase(addWhitelistIp.pending, (state) => {
                state.loading = true;
            })
            .addCase(addWhitelistIp.fulfilled, (state, action) => {
                state.loading = false;
                state.whitelistedIPs.unshift(action.payload);
            })
            .addCase(addWhitelistIp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== Get All Whitelisted IPs =====
            .addCase(getAllIPWhitelist.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllIPWhitelist.fulfilled, (state, action) => {
                state.loading = false;
                state.whitelistedIPs = action.payload;
            })
            .addCase(getAllIPWhitelist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== Edit Whitelisted IP =====
            .addCase(editWhitelistIp.pending, (state) => {
                state.loading = true;
            })
            .addCase(editWhitelistIp.fulfilled, (state, action) => {
                state.loading = false;
                state.whitelistedIPs = state.whitelistedIPs.map((ip) =>
                    ip._id === action.payload._id ? action.payload : ip
                );
            })
            .addCase(editWhitelistIp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ===== Delete Whitelisted IP =====
            .addCase(deleteWhitelistIp.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteWhitelistIp.fulfilled, (state, action) => {
                state.loading = false;
                state.whitelistedIPs = state.whitelistedIPs.filter(
                    (ip) => ip._id !== action.payload.id
                );
            })
            .addCase(deleteWhitelistIp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(activateStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(activateStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.activities = state.activities.map((activity) =>
                    activity.userId === action.payload._id || activity.userId?._id === action.payload._id
                        ? {
                            ...activity,
                            terminated: action.payload.terminated, // this drives your button
                            status: action.payload.status,
                        }
                        : activity
                );
            })


            .addCase(activateStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


    },
});

export default activitySlice.reducer;
