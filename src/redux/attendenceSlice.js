// src/redux/attendenceSlice.js
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

// =============== 1. PUNCH IN/OUT ===============
export const punchIn = createAsyncThunk(
  "attendance/punchIn",
  async ({ userId, shift = "MORNING" }, { rejectWithValue }) => {
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

// =============== 2. BREAK MANAGEMENT ===============
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

// =============== 3. ATTENDANCE DATA FETCHING ===============
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

// =============== GET ALL ATTENDANCE (ADMIN DASHBOARD) ===============
export const getAllAttendance = createAsyncThunk(
  "attendance/getAllAttendance",
  async ({ startDate, endDate, department, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (department && department !== 'All') params.append("department", department);
      params.append("page", page);
      params.append("limit", limit);

      console.log("🚀 Fetching all attendance from /attendance/all");

      const response = await axiosInstance.get(`/attendance/all?${params}`);

      console.log("✅ API Response received:", {
        success: response.data.success,
        attendanceCount: response.data.attendance?.length,
        pagination: response.data.pagination
      });

      return response.data;
    } catch (error) {
      console.error("❌ Error in getAllAttendance:", error);
      return rejectWithValue(handleError(error, "Failed to get all attendance"));
    }
  }
);

// =============== 4. STATS & ANALYTICS ===============
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



// =============== 5. DEPARTMENT MANAGEMENT ===============
export const getDepartmentWiseUsers = createAsyncThunk(
  "attendance/getDepartmentWiseUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/attendance/get-department-wise");
      console.log("🏢 Department wise data received:", data);
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Failed to get department users"));
    }
  }
);

// =============== 6. DAY OFF REQUESTS ===============
export const requestDayOff = createAsyncThunk(
  "attendance/requestDayOff",
  async (
    { reason, startDate, endDate, duration = "single", attachmentType },
    { rejectWithValue }
  ) => {
    try {
      const payload = {
        reason,
        startDate,
        duration,
        attachmentType,
      };

      // only send endDate if multiple
      if (duration === "multiple") {
        payload.endDate = endDate;
      }

      const { data } = await axiosInstance.post(
        "/attendance/request-day-off",
        payload
      );

      if (data.success) {
        toast.success(data.message || "Day off request submitted!");
      }

      console.log("data", data)
      return data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Day off request failed")
      );
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
  async ({ userId } = {}, { rejectWithValue }) => {
    try {
      const query = userId ? `?userId=${userId}` : "";
      const { data } = await axiosInstance.get(
        `/attendance/day-off-requests${query}`
      );

      console.log("Day off API data:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching day off requests:", error);
      return rejectWithValue(
        handleError(error, "Failed to get day off requests")
      );
    }
  }
);



// =============== 7. MANAGE DAY OFF REQUESTS ===============
export const approveDayOffRequest = createAsyncThunk(
  "attendance/approveDayOffRequest",
  async ({ requestId, attendanceId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/attendance/day-off-requests/${requestId}/approve`, {
        attendanceId
      });
      if (data.success) toast.success("Day off request approved!");
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Failed to approve day off request"));
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

      return res.data;
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
    },
    updateAttendanceData: (state, action) => {
      state.allAttendance = action.payload;
    },
    addBreakToAttendance: (state, action) => {
      const { attendanceId, breakType, breakData } = action.payload;
      const attendance = state.allAttendance.find(a => a._id === attendanceId);
      if (attendance) {
        if (!attendance[`${breakType}Breaks`]) {
          attendance[`${breakType}Breaks`] = [];
        }
        attendance[`${breakType}Breaks`].push(breakData);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // =============== PUNCH IN/OUT ===============
      .addCase(punchIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(punchIn.fulfilled, (state, action) => {
        const newRecord = action.payload.attendance;
        if (newRecord) {
          // Update today's attendance
          state.todayAttendance = newRecord;
          state.attendance = newRecord;

          // Add to attendance list
          const existingIndex = state.attendanceList.findIndex(row =>
            new Date(row.date).toDateString() === new Date(newRecord.date).toDateString()
          );
          if (existingIndex !== -1) {
            state.attendanceList[existingIndex] = newRecord;
          } else {
            state.attendanceList.unshift(newRecord);
          }
        }
        state.success = true;
        state.isLoading = false;
      })
      .addCase(punchIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(punchOut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(punchOut.fulfilled, (state, action) => {
        const newRecord = action.payload.attendance;
        if (newRecord) {
          state.todayAttendance = newRecord;
          state.attendance = newRecord;

          const existingIndex = state.attendanceList.findIndex(row =>
            new Date(row.date).toDateString() === new Date(newRecord.date).toDateString()
          );
          if (existingIndex !== -1) {
            state.attendanceList[existingIndex] = newRecord;
          } else {
            state.attendanceList.unshift(newRecord);
          }
        }
        state.success = true;
        state.isLoading = false;
      })
      .addCase(punchOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // =============== BREAK MANAGEMENT ===============
      .addCase(startBreak.pending, (state) => {
        state.breaksLoading = true;
      })
      .addCase(startBreak.fulfilled, (state, action) => {
        state.breaksLoading = false;
        state.success = true;

        // Update today's attendance breaks
        if (state.todayAttendance) {
          const breakType = action.meta.arg.breakType;
          const now = new Date();

          if (!state.todayAttendance[`${breakType}Breaks`]) {
            state.todayAttendance[`${breakType}Breaks`] = [];
          }

          state.todayAttendance[`${breakType}Breaks`].push({
            start: now,
            _id: `temp_${Date.now()}`
          });
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

        if (state.todayAttendance) {
          const breakType = action.meta.arg.breakType;
          const now = new Date();

          const breaks = state.todayAttendance[`${breakType}Breaks`];
          if (breaks && breaks.length > 0) {
            const lastBreak = breaks[breaks.length - 1];
            if (!lastBreak.end) {
              lastBreak.end = now;
            }
          }
        }
      })
      .addCase(endBreak.rejected, (state, action) => {
        state.breaksLoading = false;
        state.error = action.payload;
      })

      .addCase(getTodayBreaks.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.todayBreaks = action.payload.breaks || {
            smoke: { active: false, count: 0 },
            wc: { active: false, count: 0 },
            lunch: { active: false, count: 0 }
          };
        }
        state.success = true;
      })

      // =============== ATTENDANCE DATA FETCHING ===============
      .addCase(getTodayAttendance.fulfilled, (state, action) => {
        console.log("✅ getTodayAttendance fulfilled:", action.payload);

        if (action.payload.success) {
          state.todayAttendance = action.payload.attendance || null;
          state.success = true;
        }
        state.isLoading = false;
      })

      .addCase(getUserAttendance.fulfilled, (state, action) => {
        console.log("✅ getUserAttendance fulfilled:", action.payload);

        if (action.payload.success) {
          state.attendanceList = action.payload.attendance || [];
          state.pagination = action.payload.pagination || null;
        } else {
          state.attendanceList = [];
        }
        state.isLoading = false;
        state.success = true;
      })

      .addCase(getAllAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        console.log("🎯 getAllAttendance.fulfilled - Processing data");

        if (action.payload.success) {
          state.allAttendance = action.payload.attendance || [];
          state.pagination = action.payload.pagination || {
            total: action.payload.attendance?.length || 0,
            page: 1,
            pages: 1
          };

          console.log(`📊 Set ${state.allAttendance.length} attendance records`);

          // Debug first record
          if (state.allAttendance.length > 0) {
            const first = state.allAttendance[0];
            console.log("📝 Sample record structure:", {
              id: first._id,
              name: first.user?.FullName,
              department: first.user?.department,
              clockIn: first.clockIn,
              clockOut: first.clockOut,
              workingHours: first.workingHours,
              alert: first.alert,
              smokeBreaks: first.smokeBreaks?.length || 0,
              wcBreaks: first.wcBreaks?.length || 0,
              lunchBreaks: first.lunchBreaks?.length || 0,
              dayOffRequests: first.dayOffRequests?.length || 0
            });
          }
        } else {
          console.error("❌ API returned success: false", action.payload);
          state.allAttendance = [];
        }

        state.isLoading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(getAllAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error("❌ getAllAttendance rejected:", action.payload);
      })

      // =============== STATS & ANALYTICS ===============
      .addCase(getAttendanceStats.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.stats = action.payload.stats || {
            totalDays: 0,
            completedDays: 0,
            incompleteDays: 0
          };
        }
        state.success = true;
      })



      // =============== DEPARTMENT MANAGEMENT ===============
      .addCase(getDepartmentWiseUsers.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.departmentAttendance = action.payload.users || [];
          state.department = action.payload.department;
          state.departmentCount = action.payload.count;
          console.log(`🏢 Set ${state.departmentAttendance.length} department users`);
        }
        state.success = true;
      })

      // =============== DAY OFF REQUESTS ===============
      .addCase(requestDayOff.fulfilled, (state, action) => {
        if (action.payload.success) {
          if (state.todayAttendance) {
            if (!state.todayAttendance.dayOffRequests) {
              state.todayAttendance.dayOffRequests = [];
            }
            // Add the new request
            const newRequest = {
              reason: action.meta.arg.reason,
              date: action.meta.arg.date,
              attachmentType: action.meta.arg.attachmentType,
              status: "PENDING",
              _id: `temp_${Date.now()}`
            };
            state.todayAttendance.dayOffRequests.push(newRequest);
          }
          toast.success("Day off request submitted!");
        }
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


      .addCase(updateDayOffStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDayOffStatus.fulfilled, (state, action) => {
        const updated = action.payload;

        state.dayOffRequests = state.dayOffRequests.map((req) =>
          req.requestId === updated._id
            ? { ...req, ...updated }
            : req
        );

        state.isLoading = false;
        state.success = true;
      })

      .addCase(getDayOffRequests.fulfilled, (state, action) => {
        state.dayOffRequests = action.payload.requests || [];
        state.success = true;
        state.isLoading = false;
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
          if (!state.isLoading) {
            state.isLoading = true;
          }
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
          state.success = false;
          toast.error(action.payload || "Something went wrong");
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
  clearAttendanceError,
  updateAttendanceData,
  addBreakToAttendance
} = attendanceSlice.actions;

export default attendanceSlice.reducer;