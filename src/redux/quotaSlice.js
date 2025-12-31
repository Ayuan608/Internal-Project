// redux/slices/quotaSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../Helpers/axiosInstance";

const initialState = {
    quotaData: [],
    departmentQuota: null,
    loading: false,
    error: null,
};

// Create or update department quota - FIXED
export const createQuota = createAsyncThunk(
    "quota/create",
    async ({ department, morning12hr, morning9hr, night12hr, night9hr }) => {
        try {
            const response = await axiosInstance.post(
                `/quota/create/${department}`,
                { 
                    morning12hr, 
                    morning9hr, 
                    night12hr, 
                    night9hr 
                }
            );
            toast.success("Quota updated successfully!");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update quota");
            throw error;
        }
    }
);

// Get all department quotas
export const getAllQuotas = createAsyncThunk("quota/getAll", async () => {
    try {
        const response = await axiosInstance.get("/quota/all");
        return response.data;
    } catch (error) {
        toast.error("Failed to fetch quotas");
        throw error;
    }
});

// Get specific department quota
export const getDepartmentQuota = createAsyncThunk(
    "quota/getDepartment",
    async (department) => {
        try {
            const response = await axiosInstance.get(`/quota/department/${department}`);
            return response.data;
        } catch (error) {
            toast.error("Department quota not found");
            throw error;
        }
    }
);

// Reset all quotas to default
export const resetAllQuotas = createAsyncThunk("quota/resetAll", async () => {
    try {
        const response = await axiosInstance.post("/quota/reset/all");
        toast.success("All quotas reset to default!");
        return response.data;
    } catch (error) {
        toast.error("Failed to reset quotas");
        throw error;
    }
});

const quotaSlice = createSlice({
    name: "quota",
    initialState,
    reducers: {
        clearDepartmentQuota: (state) => {
            state.departmentQuota = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get all quotas
            .addCase(getAllQuotas.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllQuotas.fulfilled, (state, action) => {
                state.loading = false;
                state.quotaData = action.payload.quotas || action.payload.data || [];
            })
            .addCase(getAllQuotas.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Create quota
            .addCase(createQuota.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createQuota.fulfilled, (state, action) => {
                state.loading = false;
                // Update the quota in quotaData array
                const updatedQuota = action.payload.quota;
                if (updatedQuota && updatedQuota.department) {
                    const index = state.quotaData.findIndex(q => q.department === updatedQuota.department);
                    if (index !== -1) {
                        state.quotaData[index] = updatedQuota;
                    } else {
                        state.quotaData.push(updatedQuota);
                    }
                }
            })
            .addCase(createQuota.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Reset all quotas
            .addCase(resetAllQuotas.pending, (state) => {
                state.loading = true;
            })
            .addCase(resetAllQuotas.fulfilled, (state, action) => {
                state.loading = false;
                state.quotaData = action.payload.quotas || [];
            })
            .addCase(resetAllQuotas.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Get department quota
            .addCase(getDepartmentQuota.fulfilled, (state, action) => {
                state.departmentQuota = action.payload.quota;
            });
    },
});

export const { clearDepartmentQuota, clearError } = quotaSlice.actions;
export default quotaSlice.reducer;