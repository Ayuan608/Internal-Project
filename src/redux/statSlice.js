import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../Helpers/axiosInstance";
import { toast } from "react-hot-toast";

const initialState = {
  loading: false,
  error: null,
  caseMails: [],
  allUsersCount: 0,
};
export const getStatsData = createAsyncThunk(
  "case/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const request = axiosInstance.get("/admin/stats/users");

      toast.promise(request, {
        loading: "Loading stats...",
        success: "Stats loaded successfully",
        error: "Failed to load stats",
      });

      const { data } = await request;
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
export const sendCaseMail = createAsyncThunk(
  "case/send",
  async (caseData, { rejectWithValue }) => {
    try {
      const req = axiosInstance.post("/team-leader/send", caseData);

      toast.promise(req, {
        loading: "Sending case mail...",
        success: (data) => data?.data?.message,
        error: "Failed to send case mail",
      });

      const { data } = await req;
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
)
export const getAllCaseMails = createAsyncThunk(
  "case/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/user/get");
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message);
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
export const replyToMail = createAsyncThunk(
  "case/reply",
  async ({ mailId, content }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/mail/reply/${mailId}`, {
        content,
      });

      return { mailId, replies: data.replies };
    } catch (error) {
      toast.error("Failed to add reply");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const toggleArchiveMail = createAsyncThunk(
  "case/archive",
  async (mailId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `/mail/toggle-archive/${mailId}`
      );
      return { mailId, archived: data.archived };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
export const softDeleteMail = createAsyncThunk(
  "case/softDelete",
  async (mailId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `/mail/soft-delete/${mailId}`
      );
      return { mailId, isDeleted: data.isDeleted };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
export const deleteMailPermanently = createAsyncThunk(
  "case/delete",
  async (mailId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/mail/${mailId}`);
      return mailId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
export const addLabel = createAsyncThunk(
  "case/addLabel",
  async ({ mailId, label }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/mail/add-label/${mailId}`, {
        label,
      });

      return { mailId, labels: data.labels };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const caseSlice = createSlice({
  name: "case",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(getStatsData.fulfilled, (state, action) => {
        state.allUsersCount = action.payload.allUsersCount;
      })

      .addCase(sendCaseMail.fulfilled, (state, action) => {
        state.caseMails.unshift(action.payload);
      })

      .addCase(getAllCaseMails.fulfilled, (state, action) => {
        state.caseMails = action.payload.mails || [];
      })

      .addCase(replyToMail.fulfilled, (state, action) => {
        const mail = state.caseMails.find(
          (m) => m._id === action.payload.mailId
        );
        if (mail) mail.replies = action.payload.replies;
      })


      .addCase(toggleArchiveMail.fulfilled, (state, action) => {
        const mail = state.caseMails.find(
          (m) => m._id === action.payload.mailId
        );
        if (mail) mail.archived = action.payload.archived;
      })

      .addCase(softDeleteMail.fulfilled, (state, action) => {
        const mail = state.caseMails.find(
          (m) => m._id === action.payload.mailId
        );
        if (mail) mail.isDeleted = action.payload.isDeleted;
      })

      .addCase(deleteMailPermanently.fulfilled, (state, action) => {
        state.caseMails = state.caseMails.filter(
          (m) => m._id !== action.payload
        );
      })

      .addCase(addLabel.fulfilled, (state, action) => {
        const mail = state.caseMails.find(
          (m) => m._id === action.payload.mailId
        );
        if (mail) mail.labels = action.payload.labels;
      });
  },
});

export default caseSlice.reducer;
