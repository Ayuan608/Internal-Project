// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axiosInstance from '../Helpers/axiosInstance';


// export const fetchSheetData = createAsyncThunk(
//     'sheet/fetchData',
//     async (_, { rejectWithValue }) => {
//         try {
//             const response = await axiosInstance.get('/sheet/fetch-data');
//             return response.data;
//         } catch (error) {
//             return rejectWithValue(
//                 error.response?.data?.message || 'Failed to fetch sheet data'
//             );
//         }
//     }
// );
// export const fetchSheetDataByDepartment = createAsyncThunk(
//     'departmentSheet/fetchData',
//     async (_, { rejectWithValue }) => {
//         try {
//             const response = await axiosInstance.get('/sheet/users-department');
//             return response.data;
//         } catch (error) {
//             return rejectWithValue(
//                 error.response?.data?.message || 'Failed to fetch department sheet data'
//             );
//         }
//     }
// );

// const sheetSlice = createSlice({
//     name: 'sheet',
//     initialState: {
//         data: [],
//         count: 0,
//         loading: false,
//         error: null,
//     },
//     reducers: {
//         clearSheetData: (state) => {
//             state.data = [];
//             state.count = 0;
//             state.error = null;
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchSheetData.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchSheetData.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.data = action.payload.data || [];
//                 state.count = action.payload.count || 0;
//             })
//             .addCase(fetchSheetData.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             })
//             .addCase(fetchSheetDataByDepartment.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchSheetDataByDepartment.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.data = action.payload.data || [];
//                 state.count = action.payload.count || 0;
//                 state.department = action.payload.department || null;
//                 state.spreadsheetId = action.payload.spreadsheetId || null;
//             })
//             .addCase(fetchSheetDataByDepartment.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     },
// });

// export const { clearSheetData } = sheetSlice.actions;
// export default sheetSlice.reducer;



// redux/sheetSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../Helpers/axiosInstance';

// Fetch sheet data based on user's department
export const fetchSheetDataByDepartment = createAsyncThunk(
    'sheet/fetchDataByDepartment',
    async (_, { rejectWithValue, getState }) => {
        try {
            console.log('🔄 Fetching department-specific sheet data...');
            const response = await axiosInstance.get('/sheet/users-department');

            console.log('✅ Department data received:', {
                department: response.data.department,
                count: response.data.count,
                spreadsheetId: response.data.spreadsheetId
            });

            return response.data;
        } catch (error) {
            console.error('❌ Error fetching department data:', error);
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch department sheet data'
            );
        }
    }
);

// Fetch all departments data (admin only)
export const fetchAllDepartmentsData = createAsyncThunk(
    'sheet/fetchAllDepartmentsData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/sheet/all-departments');
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch all departments data'
            );
        }
    }
);

const sheetSlice = createSlice({
    name: 'sheet',
    initialState: {
        data: [],
        count: 0,
        loading: false,
        error: null,
        department: null,
        spreadsheetId: null,
        spreadsheetTitle: null,
        lastUpdated: null
    },
    reducers: {
        clearSheetData: (state) => {
            state.data = [];
            state.count = 0;
            state.error = null;
            state.department = null;
            state.spreadsheetId = null;
        },
        setDepartment: (state, action) => {
            state.department = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Department-specific data
            .addCase(fetchSheetDataByDepartment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSheetDataByDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data || [];
                state.count = action.payload.count || 0;
                state.department = action.payload.department;
                state.spreadsheetId = action.payload.spreadsheetId;
                state.spreadsheetTitle = action.payload.spreadsheetTitle;
                state.lastUpdated = new Date().toISOString();
                state.error = null;
            })
            .addCase(fetchSheetDataByDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.data = [];
                state.count = 0;
            })
            // All departments data
            .addCase(fetchAllDepartmentsData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllDepartmentsData.fulfilled, (state, action) => {
                state.loading = false;
                state.allDepartmentsData = action.payload.departments;
                state.lastUpdated = new Date().toISOString();
                state.error = null;
            })
            .addCase(fetchAllDepartmentsData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearSheetData, setDepartment, clearError } = sheetSlice.actions;
export default sheetSlice.reducer;