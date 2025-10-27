import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../Helpers/axiosInstance";

const initialState = {
    reportsData: [],
    allReports: [],
    deletedReports: [],
};

// Get user's reports (reports where user is recipient)
export const getReports = createAsyncThunk("report/get", async () => {
    try {
        const res = await axiosInstance.get("/report/get");
        console.log('report form redux', res.data.reports)
        return res.data.reports;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch reports");
        throw error;
    }
});

// Get all reports (Super-Admin only)
export const getAllReports = createAsyncThunk("report/getAll", async () => {
    try {
        const res = await axiosInstance.get("/report/getAll");
        return res.data.reports;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch all reports");
        throw error;
    }
});

// Get deleted reports (Super-Admin only)
export const getDeletedReports = createAsyncThunk("report/deleted", async () => {
    try {
        const res = await axiosInstance.get("/report/deleted");
        return res.data.reports;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch deleted reports");
        throw error;
    }
});

// Create new report
export const createReport = createAsyncThunk("report/create", async (data) => {
    try {
        const payload = {
            date: data?.date,
            purpose: data?.purpose,
            details: data?.details,
        };

        const res = axiosInstance.post("/report/create", payload);

        toast.promise(res, {
            loading: "Creating report...",
            success: "Report created successfully",
            error: "Failed to create report",
        });

        const response = await res;
        return response.data.report;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to create report");
        throw error;
    }
});

// Soft delete report (Super-Admin only)
export const deleteReport = createAsyncThunk("report/delete", async (id) => {
    try {
        const res = axiosInstance.patch(`/report/delete/${id}`);

        toast.promise(res, {
            loading: "Deleting report...",
            success: "Report deleted successfully",
            error: "Failed to delete report",
        });

        const response = await res;
        return id;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete report");
        throw error;
    }
});
// Mark report as seen
export const markReportAsSeen = createAsyncThunk(
    "report/markAsSeen",
    async (id, { rejectWithValue }) => {
        try {
            const resPromise = axiosInstance.patch(`/report/status-seen/${id}`);

            toast.promise(resPromise, {
                loading: "Marking as seen...",
                success: "Report marked as seen",
                error: "Failed to update report status",
            });

            const res = await resPromise;
            return res.data.report; // The updated report object from backend
        } catch (error) {
            const message = error?.response?.data?.message || "Error marking as seen";
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
            .addCase(getReports.fulfilled, (state, action) => {
                if (action.payload) {
                    state.reportsData = action.payload;
                }
            })
            .addCase(getAllReports.fulfilled, (state, action) => {
                if (action.payload) {
                    state.allReports = action.payload;
                }
            })
            .addCase(getDeletedReports.fulfilled, (state, action) => {
                if (action.payload) {
                    state.deletedReports = action.payload;
                }
            })
            .addCase(createReport.fulfilled, (state, action) => {
                if (action.payload) {
                    state.reportsData.unshift(action.payload);
                    state.allReports.unshift(action.payload);
                }
            })
            .addCase(deleteReport.fulfilled, (state, action) => {
                const reportId = action.payload;
                state.reportsData = state.reportsData.filter(r => r._id !== reportId);
                state.allReports = state.allReports.filter(r => r._id !== reportId);
            })
            .addCase(markReportAsSeen.fulfilled, (state, action) => {
                const updatedReport = action.payload;

                state.reportsData = state.reportsData.map(report =>
                    report._id === updatedReport._id ? updatedReport : report
                );

                state.allReports = state.allReports.map(report =>
                    report._id === updatedReport._id ? updatedReport : report
                );
            });

    },
});

export default reportSlice.reducer;