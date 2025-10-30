import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../Helpers/axiosInstance';

// Fetch complete sheet data
export const fetchSheetData = createAsyncThunk(
  'sheet/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/sheet/fetch-data');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch sheet data'
      );
    }
  }
);

// Fetch department-specific data
export const fetchSheetDataByDepartment = createAsyncThunk(
  'sheet/fetchDataByDepartment',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/sheet/users-department');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch department sheet data'
      );
    }
  }
);

const sheetSlice = createSlice({
  name: 'sheet',
  initialState: {
    headers: [],
    data: [],
    count: 0,
    department: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSheetData: (state) => {
      state.headers = [];
      state.data = [];
      state.count = 0;
      state.department = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSheetData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSheetData.fulfilled, (state, action) => {
        state.loading = false;
        state.headers = action.payload.headers || [];
        state.data = action.payload.data || [];
        state.count = action.payload.count || 0;
        state.department = action.payload.department || null;
      })
      .addCase(fetchSheetData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Department data
      .addCase(fetchSheetDataByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSheetDataByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.headers = action.payload.headers || [];
        state.data = action.payload.data || [];
        state.count = action.payload.count || 0;
        state.department = action.payload.department || null;
      })
      .addCase(fetchSheetDataByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSheetData } = sheetSlice.actions;
export default sheetSlice.reducer;
