import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../Helpers/axiosInstance";

const initialState = {
  fileName: null,
  fileUrl: null,
};


export const createDoc = createAsyncThunk("/file/doc", async (data) => {
  try {
    const res = axiosInstance.post("/file/docs", {
      input: data.input,
      filename: data.filename,
    });

    toast.promise(res, {
      loading: "Creating document...",
      success: "Document created successfully",
      error: "Failed to create document",
    });

    const response = await res;
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});


export const createPDF = createAsyncThunk("/file/pdf", async (data) => {
  try {
    const res = axiosInstance.post("/file/pdf", {
      text: data.text,
      pdfname: data.pdfname,
    });

    toast.promise(res, {
      loading: "Creating PDF...",
      success: "PDF created successfully",
      error: "Failed to create PDF",
    });

    const response = await res;
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});


export const createSlide = createAsyncThunk("/file/slide", async (data) => {
  try {
    const res = axiosInstance.post("/file/slide", {
      title: data.title,
      slidename: data.slidename,
    });

    toast.promise(res, {
      loading: "Creating slide...",
      success: "Slide created successfully",
      error: "Failed to create slide",
    });

    const response = await res;
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});


export const createSheet = createAsyncThunk("/file/sheet", async (data) => {
  try {
    const res = axiosInstance.post("/file/sheet", {
      sheetname: data.sheetname,
    });

    toast.promise(res, {
      loading: "Creating sheet...",
      success: "Sheet created successfully",
      error: "Failed to create sheet",
    });

    const response = await res;
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});


const fileSlice = createSlice({
  name: "file",
  initialState,
  reducers: {
    resetFileData: (state) => {
      state.fileName = null;
      state.fileUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDoc.fulfilled, (state, action) => {
        if (action.payload) {
          state.fileName = action.payload.fileName;
          state.fileUrl = action.payload.fileUrl;
        }
      })
      .addCase(createPDF.fulfilled, (state, action) => {
        if (action.payload) {
          state.fileName = action.payload.fileName;
          state.fileUrl = action.payload.fileUrl;
        }
      })
      .addCase(createSlide.fulfilled, (state, action) => {
        if (action.payload) {
          state.fileName = action.payload.fileName;
          state.fileUrl = action.payload.fileUrl;
        }
      })
      .addCase(createSheet.fulfilled, (state, action) => {
        if (action.payload) {
          state.fileName = action.payload.fileName;
          state.fileUrl = action.payload.fileUrl;
        }
      });
  },
});

export const { resetFileData } = fileSlice.actions;
export default fileSlice.reducer;
