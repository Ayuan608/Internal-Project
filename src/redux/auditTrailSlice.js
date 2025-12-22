import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../Helpers/axiosInstance";
import { toast } from "react-hot-toast";

const initialState = {
    auditTrails: [],
    isLoading: false,
    success: false,
    error: null,
};

export const getAuditTrail = createAsyncThunk(
    "auditTrail/getAuditTrail",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/auditTrail/get-audit-trials");
            console.log("Audit Trail Data:", data);
            return data; // data = { success: true, data: [...] }

        } catch (error) {
            console.error("❌ Error in Audit Trail:", error);
            return rejectWithValue(error.response?.data || "Failed to get audit trails");
        }
    }
);

const auditTrailSlice = createSlice({
    name: "auditTrail",
    initialState,
    reducers: {
        clearAuditTrail: (state) => {
            state.auditTrails = [];
            state.success = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAuditTrail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAuditTrail.fulfilled, (state, action) => {
                state.auditTrails = action.payload.data || [];
                console.log("Audit Trails from Redux:", state.auditTrails);
                state.success = true;
                state.isLoading = false;
            })
            .addCase(getAuditTrail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch audit trails";
                toast.error(state.error);
            });
    },
});

export const { clearAuditTrail } = auditTrailSlice.actions;

export default auditTrailSlice.reducer;
