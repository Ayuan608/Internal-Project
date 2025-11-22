import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../Helpers/axiosInstance";

const initialState = {
  allUsersCount: 0,
  caseMails: []
};

// function to get the stats data from backend
export const getStatsData = createAsyncThunk("getstat", async () => {
  try {
    const res = axiosInstance.get("/admin/stats/users");
    toast.promise(res, {
      loading: "Getting the stats...",
      success: (data) => {
        return data?.data?.message;
      },
      error: "Failed to load stats",
    });

    const response = await res;
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});
export const sendCaseMail = createAsyncThunk(
  "case/sendMail",
  async (caseData, { rejectWithValue }) => {
    try {
      const res = axiosInstance.post("/team-leader/send", caseData);

      toast.promise(res, {
        loading: "Sending case mail...",
        success: (data) => {
          return data?.data?.message || "Case mail sent successfully!";
        },
        error: "Failed to send case mail",
      });

      const response = await res;
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to send case mail";
      return rejectWithValue(message);
    }
  }
);
export const getAllCaseMails = createAsyncThunk(
  "case/getAllMails",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/user/get");

      return res.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to load case mails";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const statSlice = createSlice({
  name: "stat",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getStatsData.fulfilled, (state, action) => {
      state.allUsersCount = action?.payload?.allUsersCount;
    })
      .addCase(sendCaseMail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendCaseMail.fulfilled, (state, action) => {
        state.loading = false;
        state.caseMails.push(action.payload);
      })
      .addCase(sendCaseMail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllCaseMails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCaseMails.fulfilled, (state, action) => {
        state.loading = false;
        // handle both TL & Admin
        state.caseMails =
          action?.payload?.mails ||
          action?.payload?.emails ||
          [];
      })

      .addCase(getAllCaseMails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCaseError } = statSlice.actions;
export default statSlice.reducer;