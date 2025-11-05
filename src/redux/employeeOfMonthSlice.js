import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../Helpers/axiosInstance";


export const createEmployeeOfMonth = createAsyncThunk(
  "employeeOfMonth/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/empOfMonth/create`, formData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create announcement"
      );
    }
  }
);

// 📄 Fetch All Announcements
export const fetchAllEmployeesOfMonth = createAsyncThunk(
  "employeeOfMonth/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/empOfMonth/all`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch announcements"
      );
    }
  }
);

// ✏️ Update Announcement
export const updateEmployeeOfMonth = createAsyncThunk(
  "employeeOfMonth/update",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/empOfMonth/update/${id}`,
        updatedData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update announcement"
      );
    }
  }
);

// ❌ Delete Announcement
export const deleteEmployeeOfMonth = createAsyncThunk(
  "employeeOfMonth/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/empOfMonth/delete/${id}`);
      return id; // return deleted item id for local state removal
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete announcement"
      );
    }
  }
);



// ======================================
// 🧩 Slice Definition
// ======================================

const employeeOfMonthSlice = createSlice({
  name: "employeeOfMonth",
  initialState: {
    announcements: [],
    loading: false,
    error: null,
    success: false,
  },

  reducers: {
    clearStatus: (state) => {
      state.success = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // 📄 FETCH ALL
    builder
      .addCase(fetchAllEmployeesOfMonth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEmployeesOfMonth.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload;
      })
      .addCase(fetchAllEmployeesOfMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ➕ CREATE
    builder
      .addCase(createEmployeeOfMonth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployeeOfMonth.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.announcements.unshift(action.payload); // add new to top
      })
      .addCase(createEmployeeOfMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ✏️ UPDATE
    builder
      .addCase(updateEmployeeOfMonth.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEmployeeOfMonth.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.announcements.findIndex(
          (a) => a._id === action.payload._id
        );
        if (index !== -1) {
          state.announcements[index] = action.payload;
        }
      })
      .addCase(updateEmployeeOfMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ❌ DELETE
    builder
      .addCase(deleteEmployeeOfMonth.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEmployeeOfMonth.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.announcements = state.announcements.filter(
          (a) => a._id !== action.payload
        );
      })
      .addCase(deleteEmployeeOfMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStatus } = employeeOfMonthSlice.actions;

export default employeeOfMonthSlice.reducer;
