import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../Helpers/axiosInstance";

const initialState = {
  data: [],         
  loading: false,
  error: null
};


export const uploadFile = createAsyncThunk(
  "file/upload",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("File uploaded successfully")
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get Uploaded Files
export const getFiles = createAsyncThunk(
  "file/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/upload");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete File
export const deleteFile = createAsyncThunk(
  "file/delete",
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/upload/files/${fileId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);



// === Slice ===
const upload = createSlice({
  name: "file",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // === Upload File ===
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.file = action.payload;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // === Get Files ===
      .addCase(getFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch files";
      })

      // === Delete File ===
      .addCase(deleteFile.fulfilled, (state, action) => {
        // Remove file from state.data
        state.data = state.data.filter(file => file._id !== action.meta.arg);
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete file";
      })

  
  }
});

export const { } = upload.actions;
export default upload.reducer;