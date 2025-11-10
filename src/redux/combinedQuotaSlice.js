import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from './../Helpers/axiosInstance';


// Thunk to fetch combined data from the backend
export const fetchCombinedDepartmentsData = createAsyncThunk(
    'combinedQuota/fetchCombinedDepartmentsData',
    async (_, { rejectWithValue }) => {
        try {

            const response = await axiosInstance.get('/sheet/combined-data');
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching combined departments data:', error);
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch combined departments data'
            );
        }
    }
);

const combinedQuotaSlice = createSlice({
    name: 'combinedQuota',
    initialState: {
        data: [],
        count: 0, 
        departments: [],
        columns: [], 
        loading: false,
        error: null,
        lastUpdated: null
    },
    reducers: {
        clearCombinedData: (state) => {
            state.data = [];
            state.count = 0;
            state.departments = [];
            state.columns = [];
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCombinedDepartmentsData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCombinedDepartmentsData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data || [];
                state.count = action.payload.totalRows || 0;
                state.departments = action.payload.departments || [];
                state.columns = action.payload.columns || [];
                state.lastUpdated = new Date().toISOString();
                state.error = null;

            })
            .addCase(fetchCombinedDepartmentsData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.data = [];
                state.count = 0;
                state.departments = [];
                state.columns = [];
            });
    },
});

export const { clearCombinedData, clearError } = combinedQuotaSlice.actions;

export default combinedQuotaSlice.reducer;