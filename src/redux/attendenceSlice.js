import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../Helpers/axiosInstance";
import { toast } from "react-hot-toast";

const initialState = {
  attendance: null,
  attendanceList: [],
  allAttendance: [],
  todayAttendance: null,
  todayBreaks: null,
  stats: null,
  pagination: null,
  departmentAttendance: [],
  requestWfhIssue: [],
  dayOffRequests: [],
  departmentPagination: null,
  isLoading: false,
  error: null,
  success: false,
  breaksLoading: false,
};

// Common error handler
const handleError = (error, defaultMessage = "Operation failed") => {
  const message = error.response?.data?.message || error.message || defaultMessage;
  console.error("Error:", message);
  toast.error(message);
  return message;
};

// 1. PUNCH IN/OUT
export const punchIn = createAsyncThunk(
  "attendance/punchIn",
  async ({ userId, shift }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/attendance/punch-in/${userId}`, { shift });
      if (data.success) toast.success(data.message || "Punched in!");
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Punch in failed"));
    }
  }
);

export const punchOut = createAsyncThunk(
  "attendance/punchOut",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/attendance/punch-out/${userId}`);
      if (data.success) toast.success(data.message || "Punched out!");
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Punch out failed"));
    }
  }
);

// 2. BREAK MANAGEMENT (NEW FUNCTIONS)
export const startBreak = createAsyncThunk(
  "attendance/startBreak",
  async ({ userId, breakType }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/attendance/start-break/${userId}`, { breakType });
      if (data.success) {
        toast.success(`${breakType.charAt(0).toUpperCase() + breakType.slice(1)} break started`);
      }
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Failed to start break"));
    }
  }
);

export const endBreak = createAsyncThunk(
  "attendance/endBreak",
  async ({ userId, breakType }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/attendance/end-break/${userId}`, { breakType });
      if (data.success) {
        toast.success(`${breakType.charAt(0).toUpperCase() + breakType.slice(1)} break ended`);
      }
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Failed to end break"));
    }
  }
);

export const getTodayBreaks = createAsyncThunk(
  "attendance/getTodayBreaks",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/attendance/today-breaks/${userId}`);
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Failed to get breaks"));
    }
  }
);

// 3. ATTENDANCE DATA FETCHING
export const getTodayAttendance = createAsyncThunk(
  "attendance/getTodayAttendance",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/attendance/today/${userId}`);
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Failed to get today's attendance"));
    }
  }
);

export const getUserAttendance = createAsyncThunk(
  "attendance/getUserAttendance",
  async ({ userId, startDate, endDate, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("page", page);
      params.append("limit", limit);

      const { data } = await axiosInstance.get(`/attendance/user/${userId}?${params}`);
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Failed to get attendance"));
    }
  }
);

// src/redux/attendenceSlice.js

export const getAllAttendance = createAsyncThunk(
  "attendance/getAllAttendance",
  async ({ startDate, endDate, department, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (department) params.append("department", department);
      params.append("page", page);
      params.append("limit", limit);

      console.log("🚀 Making API call to /attendance/all with params:", params.toString());

      const response = await axiosInstance.get(`/attendance/all?${params}`);

      console.log("✅ API Response:", response);
      console.log("📊 Response data:", response.data);
      console.log("👥 Attendance data received:", response.data?.attendance?.length || 0);

      return response.data;
    } catch (error) {
      console.error("❌ Error in getAllAttendance:", error);
      console.error("❌ Error response:", error.response);
      return rejectWithValue(handleError(error, "Failed to get all attendance"));
    }
  }
);

// 4. STATS & DEPARTMENT
export const getAttendanceStats = createAsyncThunk(
  "attendance/getAttendanceStats",
  async ({ userId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append("id", userId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const { data } = await axiosInstance.get(`/attendance/stats?${params}`);
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Failed to get stats"));
    }
  }
);

export const getDepartmentWiseUsers = createAsyncThunk(
  "attendance/getDepartmentWiseUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/attendance/get-department-wise");

      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Failed to get department users"));
    }
  }
);

// 5. DAY OFF REQUESTS
export const requestDayOff = createAsyncThunk(
  "attendance/requestDayOff",
  async ({ date, reason, type = "Rest Day" }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/attendance/request-day-off", {
        date,
        reason,
        type
      });
      if (data.success) toast.success(data.message || "Day off request submitted!");
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Day off request failed"));
    }
  }
);
// Change from requestWfhIssue to reportWfhIssue for clarity
export const reportWfhIssue = createAsyncThunk(
  "attendance/reportWfhIssue",
  async ({ issueType, startTime, endTime, note }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/attendance/report-wfh-issue", {
        issueType,
        startTime,
        endTime,
        note
      });
      if (data.success) toast.success(data.message || "WFH issue reported successfully!");
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Failed to report WFH issue"));
    }
  }
);


export const getDayOffRequests = createAsyncThunk(
  "attendance/getDayOffRequests",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/attendance/day-off-requests");
      console.log('data', data)
      return data;
    } catch (error) {
      console.error("❌ Error fetching checker stats:", error);
      return rejectWithValue(handleError(error, "Failed to get checker stats"));
    }
  }
);
export const getCheckerStats = createAsyncThunk(
  "attendance/getCheckerStats",
  async ({ startDate, endDate, department }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (department && department !== 'all') params.append("department", department);

      console.log("📡 Fetching checker stats with params:", params.toString());

      const { data } = await axiosInstance.get(`/attendance/checker-stats?${params}`);

      console.log("✅ Checker stats response:", data);

      return data;
    } catch (error) {
      console.error("❌ Error fetching checker stats:", error);
      return rejectWithValue(handleError(error, "Failed to get checker stats"));
    }
  }
);

// attendanceThunks.js

export const updateDayOffStatus = createAsyncThunk(
  "attendance/updateDayOffStatus",
  async ({ requestId, status }, { rejectWithValue }) => {
    console.log("status", status)
    try {
      const token = localStorage.getItem("token");

      const res = await axiosInstance.patch(
        `/attendance/leave-requests`,
        { requestId, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data.updatedRequest;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update leave status"
      );
    }
  }
);

// SLICE
const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearAttendance: (state) => {
      state.attendance = null;
      state.success = false;
      state.error = null;
    },
    clearTodayAttendance: (state) => {
      state.todayAttendance = null;
      state.todayBreaks = null;
    },
    clearBreaks: (state) => {
      state.todayBreaks = null;
    },
    resetAttendanceState: () => initialState,
    setAttendanceLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearAttendanceError: (state) => {
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // PUNCH IN/OUT
      .addCase(punchIn.fulfilled, (state, action) => {
        const newRecord = action.payload.attendance;
        if (newRecord) {
          const existingIndex = state.attendanceList.findIndex(row => row.date === newRecord.date);
          if (existingIndex !== -1) {
            state.attendanceList[existingIndex] = newRecord;
          } else {
            state.attendanceList.unshift(newRecord);
          }
        }
        state.todayAttendance = newRecord;
        state.attendance = newRecord;
        state.success = true;
        state.isLoading = false;
      })
      .addCase(punchOut.fulfilled, (state, action) => {
        const newRecord = action.payload.attendance;
        if (newRecord) {
          const existingIndex = state.attendanceList.findIndex(row => row.date === newRecord.date);
          if (existingIndex !== -1) {
            state.attendanceList[existingIndex] = newRecord;
          } else {
            state.attendanceList.unshift(newRecord);
          }
        }
        state.todayAttendance = newRecord;
        state.attendance = newRecord;
        state.success = true;
        state.isLoading = false;
      })

      // BREAKS MANAGEMENT
      .addCase(startBreak.pending, (state) => {
        state.breaksLoading = true;
      })
      .addCase(startBreak.fulfilled, (state, action) => {
        state.breaksLoading = false;
        state.success = true;
        // Update today's attendance if exists
        if (state.todayAttendance) {
          const breakType = action.meta.arg.breakType;
          const now = new Date().toISOString();

          if (breakType === "smoke") {
            if (!state.todayAttendance.smokeBreaks) state.todayAttendance.smokeBreaks = [];
            state.todayAttendance.smokeBreaks.push({ start: now });
          }

          if (breakType === "wc") {
            if (!state.todayAttendance.wcBreaks) state.todayAttendance.wcBreaks = [];
            state.todayAttendance.wcBreaks.push({ start: now });
          }

          if (breakType === "lunch") {
            if (!state.todayAttendance.lunchBreaks) state.todayAttendance.lunchBreaks = [];
            state.todayAttendance.lunchBreaks.push({ start: now });
          }

        }
      })
      .addCase(startBreak.rejected, (state, action) => {
        state.breaksLoading = false;
        state.error = action.payload;
      })
      .addCase(endBreak.pending, (state) => {
        state.breaksLoading = true;
      })
      .addCase(endBreak.fulfilled, (state, action) => {
        state.breaksLoading = false;
        state.success = true;
        // Update today's attendance
        if (state.todayAttendance) {
          const breakType = action.meta.arg.breakType;
          const now = new Date().toISOString();

          if (breakType === "smoke") {
            let last = state.todayAttendance.smokeBreaks?.[state.todayAttendance.smokeBreaks.length - 1];
            if (last) last.end = now;
          }

          if (breakType === "wc") {
            let last = state.todayAttendance.wcBreaks?.[state.todayAttendance.wcBreaks.length - 1];
            if (last) last.end = now;
          }

          if (breakType === "lunch") {
            let last = state.todayAttendance.lunchBreaks?.[state.todayAttendance.lunchBreaks.length - 1];
            if (last) last.end = now;
          }

        }
      })
      .addCase(endBreak.rejected, (state, action) => {
        state.breaksLoading = false;
        state.error = action.payload;
      })
      .addCase(getTodayBreaks.fulfilled, (state, action) => {
        state.todayBreaks = action.payload.breaks;
        state.success = true;
      })


      .addCase(getUserAttendance.fulfilled, (state, action) => {
        console.log("✅ getUserAttendance fulfilled:", action.payload);

        // IMPORTANT: isLoading को false करें
        state.isLoading = false;

        // Data set करें
        if (action.payload && action.payload.attendance) {
          state.attendanceList = Array.isArray(action.payload.attendance)
            ? action.payload.attendance
            : [];
        } else {
          state.attendanceList = [];
        }

        state.pagination = action.payload.pagination || null;
        state.success = true;
        state.error = null;
      })
      .addCase(getCheckerStats.fulfilled, (state, action) => {
        console.log("🎯 getCheckerStats.fulfilled:", action.payload);
        state.stats = action.payload.stats || {};
        state.success = true;
        state.isLoading = false;
      })
      // Get Today's Attendance
      .addCase(getTodayAttendance.fulfilled, (state, action) => {
        console.log("✅ getTodayAttendance fulfilled:", action.payload); // Debug log

        // Fix: Check if attendance exists in response
        if (action.payload && action.payload.attendance) {
          state.todayAttendance = action.payload.attendance;
        } else {
          state.todayAttendance = null;
        }

        state.success = true;
        state.isLoading = false;
        state.error = null;
      })
      // ALL ATTENDANCE (ADMIN)
      // ALL ATTENDANCE (ADMIN)
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        console.log("🎯 getAllAttendance.fulfilled - Action payload:", action.payload);
        console.log("📈 Attendance array:", action.payload?.attendance);
        console.log("🔢 Number of records:", action.payload?.attendance?.length || 0);

        // Fix: Properly extract attendance array from response
        state.allAttendance = action.payload?.attendance || [];
        state.pagination = action.payload?.pagination || null;
        state.success = true;
        state.isLoading = false;
      })

      // STATS
      .addCase(getAttendanceStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats || {};
        state.success = true;
        state.isLoading = false;
      })

      // DEPARTMENT USERS
      .addCase(getDepartmentWiseUsers.fulfilled, (state, action) => {
        state.departmentAttendance = action.payload.users || [];
        state.department = action.payload.department;
        state.departmentCount = action.payload.count;
        state.success = true;
        state.isLoading = false;
      })

      // DAY OFF REQUESTS
      .addCase(requestDayOff.fulfilled, (state, action) => {
        state.dayOffRequests = action.payload.data || [];
        state.success = true;
        state.isLoading = false;
      })
      .addCase(reportWfhIssue.fulfilled, (state, action) => {
        // Add the new issue to the list
        if (action.payload.data) {
          state.wfhIssues = action.payload.data;
        }
        state.success = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(reportWfhIssue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(getDayOffRequests.fulfilled, (state, action) => {
        state.dayOffRequests = action.payload.requests || [];
        state.success = true;
        state.isLoading = false;
      })

      .addCase(updateDayOffStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDayOffStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const index = state.dayOffRequests.findIndex(
          (req) => req.requestId === action.payload._id
        );

        if (index !== -1) {
          state.dayOffRequests[index] = {
            ...state.dayOffRequests[index],
            ...action.payload,
            requestId: action.payload._id, // maintain consistency
          };
        }
      })


      .addCase(updateDayOffStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })

      // PENDING STATES FOR ALL
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
          state.success = false;
        }
      )

  },
});


export const {
  clearAttendance,
  clearTodayAttendance,
  clearBreaks,
  resetAttendanceState,
  setAttendanceLoading,
  clearAttendanceError
} = attendanceSlice.actions;

export default attendanceSlice.reducer;