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
        console.log('📊 Reports from Redux:', res.data.reports);
        return res.data.reports;
    } catch (error) {
        const message = error?.response?.data?.message || "Failed to fetch reports";
        toast.error(message);
        throw error;
    }
});

// Get all reports (Super-Admin only)
export const getAllReports = createAsyncThunk("report/getAll", async () => {
    try {
        const res = await axiosInstance.get("/report/getAll");
        console.log('📊 All Reports:', res.data.reports);
        return res.data.reports;
    } catch (error) {
        const message = error?.response?.data?.message || "Failed to fetch all reports";
        toast.error(message);
        throw error;
    }
});

// Get deleted reports (Super-Admin only)
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

// Create new report with single image
export const createReport = createAsyncThunk("report/create", async (data) => {
    try {
        const formData = new FormData();
        formData.append("date", data.date);
        formData.append("purpose", data.purpose);
        formData.append("details", data.details);

        // Append single image if exists
        if (data.image) {
            formData.append("image", data.image);
            console.log('📎 Image attached:', data.image.name);
        }

        const res = axiosInstance.post("/report/create", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        toast.promise(res, {
            loading: "Creating report...",
            success: "Report created successfully",
            error: "Failed to create report",
        });

        const response = await res;
        console.log('✅ Report created:', response.data.report);
        return response.data.report;
    } catch (error) {
        const message = error?.response?.data?.message || "Failed to create report";
        toast.error(message);
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

        await res;
        return id;
    } catch (error) {
        const message = error?.response?.data?.message || "Failed to delete report";
        toast.error(message);
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
            return res.data.report;
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