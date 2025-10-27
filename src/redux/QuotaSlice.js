
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../Helpers/axiosInstance";

const initialState = {
    quotaData: [],
    departmentQuota: null,
    userQuotas: [],
    nonQuotaUsers: [],
    quotaStats: null,
    dashboardStats: null, // NEW
    loading: false,
    error: null,
};

// ========== DEPARTMENT QUOTA THUNKS ==========

// Create or update department quota
export const createQuota = createAsyncThunk(
    "quota/create",
    async ({ department, morning, night }) => {
        const response = await axiosInstance.post(
            `/quota/create/${department}`,
            { morning, night }
        );
        return response.data;
    }
);

// Get all department quotas
export const getAllQuotas = createAsyncThunk("quota/getAll", async () => {
    const response = await axiosInstance.get("/quota/all");
    return response.data;
});

// Get specific department quota
export const getDepartmentQuota = createAsyncThunk(
    "quota/getDepartment",
    async (department) => {
        const response = await axiosInstance.get(`/quota/department/${department}`);
        return response.data;
    }
);

// Reset all quotas to default
export const resetAllQuotas = createAsyncThunk("quota/resetAll", async () => {
    const response = await axiosInstance.post("/quota/reset/all");
    return response.data;
});

// ========== USER QUOTA THUNKS ==========

// Assign quota to user
export const assignUserQuota = createAsyncThunk(
    "quota/assignUser",
    async (quotaData) => {
        const response = await axiosInstance.post("/quota/user/assign", quotaData);
        toast.success(response.data.message);
        return response.data;
    }
);

// Update user's completed quota
export const updateUserQuota = createAsyncThunk(
    "quota/updateUser",
    async ({ quotaId, completedQuota }) => {
        const response = await axiosInstance.patch(
            `/quota/user/update/${quotaId}`,
            { completedQuota }
        );
        toast.success(response.data.message);
        return response.data;
    }
);

// Get non-quota users
export const getNonQuotaUsers = createAsyncThunk(
    "quota/nonQuotaUsers",
    async (department) => {
        const url = department
            ? `/quota/user/non-quota?department=${department}`
            : "/quota/user/non-quota";
        const response = await axiosInstance.get(url);
        return response.data;
    }
);

// Get department stats
export const getQuotaStats = createAsyncThunk(
    "quota/stats",
    async (department) => {
        const response = await axiosInstance.get(`/quota/stats/${department}`);
        return response.data;
    }
);

// Get user quota history
export const getUserQuotaHistory = createAsyncThunk(
    "quota/userHistory",
    async ({ userId, startDate, endDate }) => {
        let url = `/quota/user/history/${userId}`;
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await axiosInstance.get(url);
        return response.data;
    }
);

// ========== NEW: DASHBOARD STATS THUNK ==========
export const getDashboardStats = createAsyncThunk(
    "quota/dashboardStats",
    async () => {
        const response = await axiosInstance.get("/quota/dashboard/stats");
        return response.data;
    }
);

const quotaSlice = createSlice({
    name: "quota",
    initialState,
    reducers: {
        clearDepartmentQuota: (state) => {
            state.departmentQuota = null;
        },
        clearQuotaStats: (state) => {
            state.quotaStats = null;
        },
        clearDashboardStats: (state) => {
            state.dashboardStats = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get all quotas
            .addCase(getAllQuotas.fulfilled, (state, action) => {
                state.quotaData = action.payload.quota;
            })

            // Get department quota
            .addCase(getDepartmentQuota.fulfilled, (state, action) => {
                state.departmentQuota = action.payload.quota;
            })

            // Reset all quotas
            .addCase(resetAllQuotas.fulfilled, (state, action) => {
                state.quotaData = action.payload.quotas;
            })

            // Get non-quota users
            .addCase(getNonQuotaUsers.fulfilled, (state, action) => {
                state.nonQuotaUsers = action.payload.nonQuotaUsers;
            })

            // Get quota stats
            .addCase(getQuotaStats.fulfilled, (state, action) => {
                state.quotaStats = action.payload.stats;
            })

            // Get user quota history
            .addCase(getUserQuotaHistory.fulfilled, (state, action) => {
                state.userQuotas = action.payload.history;
            })

            // ========== NEW: Dashboard stats ==========
            .addCase(getDashboardStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(getDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboardStats = action.payload.data;
            })
            .addCase(getDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { clearDepartmentQuota, clearQuotaStats, clearDashboardStats } = quotaSlice.actions;
export default quotaSlice.reducer;