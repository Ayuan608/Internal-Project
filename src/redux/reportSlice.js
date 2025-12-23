import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../Helpers/axiosInstance";
import axios from "axios";

const initialState = {
    reportsData: [],
    allReports: [],
    deletedReports: [],
    loading: false,
    error: null,
};

// Get user's reports
export const getReports = createAsyncThunk("report/get", async () => {
    try {
        const res = await axiosInstance.get("/report/get");
        return res.data.reports;
    } catch (error) {
        const message = error?.response?.data?.message || "Failed to fetch reports";
        toast.error(message);
        throw error;
    }
});

// Get all reports
export const getAllReports = createAsyncThunk("report/getAll", async () => {
    try {
        const res = await axiosInstance.get("/report/getAll");
        return res.data.reports;
    } catch (error) {
        const message = error?.response?.data?.message || "Failed to fetch all reports";
        toast.error(message);
        throw error;
    }
});

// Get deleted reports
export const getDeletedReports = createAsyncThunk("report/deleted", async () => {
    try {
        const res = await axiosInstance.get("/report/deleted");
        return res.data.reports;
    } catch (error) {
        const message = error?.response?.data?.message || "Failed to fetch deleted reports";
        toast.error(message);
        throw error;
    }
});

// Create report
export const createReport = createAsyncThunk("report/create", async (data) => {
    try {
        const formData = new FormData();
        formData.append("date", data.date);
        formData.append("purpose", data.purpose);
        formData.append("details", data.details);
        if (data.image) formData.append("image", data.image);

        const res = await axiosInstance.post("/report/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Report created successfully");
        return res.data.report;
    } catch (error) {
        const message = error?.response?.data?.message || "Failed to create report";
        toast.error(message);
        throw error;
    }
});

// Soft delete report
export const deleteReport = createAsyncThunk("report/delete", async (id) => {
    try {
        await axiosInstance.patch(`/report/delete/${id}`);
        toast.success("Report deleted successfully");
        return id;
    } catch (error) {
        const message = error?.response?.data?.message || "Failed to delete report";
        toast.error(message);
        throw error;
    }
});

// Mark report as seen
export const markReportAsSeen = createAsyncThunk("report/markAsSeen", async (id, { rejectWithValue }) => {
    try {
        const res = await axiosInstance.patch(`/report/status-seen/${id}`);
        toast.success("Report marked as seen");
        return res.data.report;
    } catch (error) {
        const message = error?.response?.data?.message || "Error marking as seen";
        toast.error(message);
        return rejectWithValue(message);
    }
});

// Reply to report (multiple replies at once)
export const replyToReport = createAsyncThunk(
    "report/replyToReport",
    async ({ reportId, quickReplies, customReplies }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post(`/report/${reportId}/reply`, {
                quickReplies,
                customReplies,
            });
            toast.success("Replies sent successfully");
            return res.data.data;
        } catch (error) {
            const message = error?.response?.data?.message || "Failed to send replies";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const reportSlice = createSlice({
    name: "report",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // User reports
            .addCase(getReports.fulfilled, (state, action) => {
                state.reportsData = action.payload;
            })
            // All reports
            .addCase(getAllReports.fulfilled, (state, action) => {
                state.allReports = action.payload;
            })
            // Deleted reports
            .addCase(getDeletedReports.fulfilled, (state, action) => {
                state.deletedReports = action.payload;
            })
            // Create report
            .addCase(createReport.fulfilled, (state, action) => {
                state.reportsData.unshift(action.payload);
                state.allReports.unshift(action.payload);
            })
            // Delete report
            .addCase(deleteReport.fulfilled, (state, action) => {
                const reportId = action.payload;
                state.reportsData = state.reportsData.filter(r => r._id !== reportId);
                state.allReports = state.allReports.filter(r => r._id !== reportId);
            })
            // Mark as seen
            .addCase(markReportAsSeen.fulfilled, (state, action) => {
                const updatedReport = action.payload;
                state.reportsData = state.reportsData.map(r => r._id === updatedReport._id ? updatedReport : r);
                state.allReports = state.allReports.map(r => r._id === updatedReport._id ? updatedReport : r);
            })
            // Reply to report
            .addCase(replyToReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(replyToReport.fulfilled, (state, action) => {
                state.loading = false;
                const updatedReport = action.payload;

                // Update all arrays where this report exists
                ["reportsData", "allReports", "deletedReports"].forEach((arr) => {
                    const index = state[arr].findIndex(r => r._id === updatedReport._id);
                    if (index !== -1) state[arr][index] = updatedReport;
                    else state[arr].push(updatedReport);
                });
            })
            .addCase(replyToReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to send replies";
            });
    },
});

export default reportSlice.reducer;
