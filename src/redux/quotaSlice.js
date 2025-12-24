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

const quotaSlice = createSlice({
    name: "quota",
    initialState,
    reducers: {
        clearDepartmentQuota: (state) => {
            state.departmentQuota = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get all quotas
            .addCase(getAllQuotas.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllQuotas.fulfilled, (state, action) => {
                state.loading = false;
                state.quotaData = action.payload.quotas;
            })
            .addCase(getAllQuotas.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Create quota
            .addCase(createQuota.pending, (state) => {
                state.loading = true;
            })
            .addCase(createQuota.fulfilled, (state, action) => {
                state.loading = false;
                // Update the quota in quotaData array
                const updatedQuota = action.payload.quota;
                const index = state.quotaData.findIndex(q => q.department === updatedQuota.department);
                if (index !== -1) {
                    state.quotaData[index] = updatedQuota;
                } else {
                    state.quotaData.push(updatedQuota);
                }
            })

            // Reset all quotas
            .addCase(resetAllQuotas.fulfilled, (state, action) => {
                state.quotaData = action.payload.quotas;
            });
    },
});

export const { clearDepartmentQuota } = quotaSlice.actions;
export default quotaSlice.reducer;