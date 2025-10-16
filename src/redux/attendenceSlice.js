import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../Helpers/axiosInstance";

const initialState = {
  attendance: null,
  attendanceList: [],
  allAttendance: [],
  todayAttendance: null,
  stats: null,
  pagination: null,
};

// Punch In
export const punchIn = createAsyncThunk(
  "attendance/punchIn",
  async ({ userId, shift }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/attendance/punch-in/${userId}`,
        { shift }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Punch Out
export const punchOut = createAsyncThunk(
  "attendance/punchOut",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/attendance/punch-out/${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get User Attendance
export const getUserAttendance = createAsyncThunk(
  "attendance/getUserAttendance",
  async ({ userId, startDate, endDate, page, limit }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const response = await axiosInstance.get(
        `/attendance/user/${userId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// admin and super admin
// Get Today's Attendance
export const getTodayAttendance = createAsyncThunk(
  "attendance/getTodayAttendance",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/attendance/today/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get All Attendance (Admin)
export const getAllAttendance = createAsyncThunk(
  "attendance/getAllAttendance",
  async (
    { startDate, endDate, department, page, limit },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (department) params.append("department", department);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const response = await axiosInstance.get(
        `/attendance/all?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get Attendance Stats
export const getAttendanceStats = createAsyncThunk(
  "attendance/getAttendanceStats",
  async ({ userId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append("id", userId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await axiosInstance.get(
        `/attendance/stats?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearAttendance: (state) => {
      state.attendance = null;
    },
    clearTodayAttendance: (state) => {
      state.todayAttendance = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Punch In
      .addCase(punchIn.fulfilled, (state, action) => {
        state.attendance = action.payload.attendance;
        state.todayAttendance = action.payload.attendance;
      })
      // Punch Out
      .addCase(punchOut.fulfilled, (state, action) => {
        state.attendance = action.payload.attendance;
        state.todayAttendance = action.payload.attendance;
      })
      // Get User Attendance
      .addCase(getUserAttendance.fulfilled, (state, action) => {
        state.attendanceList = action.payload.attendance;
        state.pagination = action.payload.pagination;
      })
      // Get Today's Attendance
      .addCase(getTodayAttendance.fulfilled, (state, action) => {
        state.todayAttendance = action.payload.attendance;
      })
      // Get All Attendance
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        state.allAttendance = action.payload.attendance;
        state.pagination = action.payload.pagination;
      })
      // Get Attendance Stats
      .addCase(getAttendanceStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
      });
  },
});

export const { clearAttendance, clearTodayAttendance, clearStats } =
  attendanceSlice.actions;

export default attendanceSlice.reducer;
