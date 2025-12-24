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
export const softDeleteReport = createAsyncThunk("report/delete", async (id) => {
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

export const deleteReport = createAsyncThunk(
    "report/deleteReport",
    async (reportId, { rejectWithValue }) => {
        console.log(reportId)
        try {
            const res = await axiosInstance.delete(`/report/delete-report/${reportId}`);
            return reportId; // return ID to remove from store
        } catch (error) {
            const message =
                error?.response?.data?.message || "Failed to delete report";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

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

            console.log("responses", res)
            return res.data;
        } catch (error) {
            const message = error?.response?.data?.message || "Failed to send replies";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const restoreReport = createAsyncThunk(
    "report/restoreReport",
    async (reportId, { rejectWithValue }) => {
        console.log("reportId", reportId)
        try {

            const response = await axiosInstance.put(
                `/report/restore/${reportId}`
            );

            console.log(response.data.report)
            return response.data.report;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to restore report");
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
            .addCase(softDeleteReport.fulfilled, (state, action) => {
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
                const updatedReport = action.payload.data;  // <--- fix here

                ["reportsData", "allReports", "deletedReports"].forEach((arr) => {
                    const index = state[arr].findIndex(r => r._id === updatedReport._id);
                    if (index !== -1) state[arr][index] = updatedReport;
                    else state[arr].push(updatedReport);
                });
            })

            .addCase(replyToReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to send replies";
            })
            .addCase(deleteReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteReport.fulfilled, (state, action) => {
                state.loading = false;
                const reportId = action.payload;

                state.reportsData = state.reportsData.filter(
                    (r) => r._id !== reportId
                );
                state.allReports = state.allReports.filter(
                    (r) => r._id !== reportId
                );
                state.deletedReports = state.deletedReports.filter(
                    (r) => r._id !== reportId
                );
            })
            .addCase(deleteReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(restoreReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(restoreReport.fulfilled, (state, action) => {
                state.loading = false;
                const restoredReport = action.payload;

                // Remove from deletedReports
                state.deletedReports = state.deletedReports.filter(r => r._id !== restoredReport._id);

                // Add or update in reportsData
                const index = state.reportsData.findIndex(r => r._id === restoredReport._id);
                if (index !== -1) {
                    state.reportsData[index] = restoredReport;
                } else {
                    state.reportsData.unshift(restoredReport);
                }

                // Add or update in allReports
                const allIndex = state.allReports.findIndex(r => r._id === restoredReport._id);
                if (allIndex !== -1) {
                    state.allReports[allIndex] = restoredReport;
                } else {
                    state.allReports.unshift(restoredReport);
                }
            })
            .addCase(restoreReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to restore report";
            });


    },
});



export default reportSlice.reducer;
