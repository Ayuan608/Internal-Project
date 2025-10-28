import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../Helpers/axiosInstance';

// Async thunks
export const fetchAllAnnouncements = createAsyncThunk(
    'announcements/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/announcement/getAllAnnouncement');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch announcements');
        }
    }
);

export const createAnnouncement = createAsyncThunk(
    'announcements/create',
    async (announcementData, { rejectWithValue }) => {
        try {
            console.log('Sending announcement data:', announcementData); // Debug log

            const formData = new FormData();

            // Append text fields - try different field name combinations
            formData.append('title', announcementData.title);
            formData.append('details', announcementData.details);

            // Try different field names for content
            formData.append('content', announcementData.details);
            formData.append('description', announcementData.details);

            // Handle recipients - try different formats
            if (announcementData.recipients && announcementData.recipients.length > 0) {
                // Try stringified array
                formData.append('recipients', JSON.stringify(announcementData.recipients));
                // Try as simple string
                formData.append('recipients', announcementData.recipients[0]);
                // Try as comma separated
                formData.append('recipients', announcementData.recipients.join(','));
            }

            // Append createdBy - try different field names
            if (announcementData.createdBy) {
                formData.append('createdBy', announcementData.createdBy);
                formData.append('author', announcementData.createdBy);
                formData.append('creator', announcementData.createdBy);
                formData.append('postedBy', announcementData.createdBy);
            }

            // Append files if any - try different field names
            if (announcementData.files && announcementData.files.length > 0) {
                announcementData.files.forEach(file => {
                    formData.append('files', file);
                    formData.append('attachments', file);
                    formData.append('images', file);
                    formData.append('documents', file);
                });
            } else {
                // Append empty file field if no files
                formData.append('files', '');
            }

            // Log FormData contents for debugging
            console.log('FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const response = await axiosInstance.post('/announcement/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // Increase timeout
            });

            console.log('Response received:', response.data);
            return response.data;

        } catch (error) {
            console.error('Detailed error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });

            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Failed to create announcement'
            );
        }
    }
);

// Alternative simplified version
export const createAnnouncementSimple = createAsyncThunk(
    'announcements/createSimple',
    async (announcementData, { rejectWithValue }) => {
        try {
            console.log('Simple version - sending:', announcementData);

            const formData = new FormData();

            // Only essential fields
            formData.append('title', announcementData.title);
            formData.append('details', announcementData.details);

            // Simple recipients handling
            if (announcementData.recipients) {
                formData.append('recipients', announcementData.recipients[0] || 'ALL');
            }

            // Simple createdBy
            if (announcementData.createdBy) {
                formData.append('createdBy', announcementData.createdBy);
            }

            // Files only if they exist
            if (announcementData.files && announcementData.files.length > 0) {
                announcementData.files.forEach(file => {
                    formData.append('files', file);
                });
            }

            const response = await axiosInstance.post('/announcement/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;

        } catch (error) {
            console.error('Simple version error:', error.response?.data);
            return rejectWithValue(
                error.response?.data?.message ||
                'Failed to create announcement'
            );
        }
    }
);

// Slice
const announcementSlice = createSlice({
    name: 'announcements',
    initialState: {
        announcements: [],
        loading: false,
        error: null,
        createLoading: false,
        createError: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.createError = null;
        },
        clearCreateError: (state) => {
            state.createError = null;
        },
        addAnnouncement: (state, action) => {
            state.announcements.unshift(action.payload);
        },
        setAnnouncements: (state, action) => {
            state.announcements = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all announcements
            .addCase(fetchAllAnnouncements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllAnnouncements.fulfilled, (state, action) => {
                state.loading = false;
                // Handle different response structures
                if (action.payload.success) {
                    state.announcements = action.payload.announcements || action.payload.data || [];
                } else {
                    state.announcements = action.payload || [];
                }
            })
            .addCase(fetchAllAnnouncements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create announcement
            .addCase(createAnnouncement.pending, (state) => {
                state.createLoading = true;
                state.createError = null;
            })
            .addCase(createAnnouncement.fulfilled, (state, action) => {
                state.createLoading = false;
                if (action.payload.success) {
                    const newAnnouncement = action.payload.announcement || action.payload.data || action.payload;
                    if (newAnnouncement) {
                        state.announcements.unshift(newAnnouncement);
                    }
                }
            })
            .addCase(createAnnouncement.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload;
            })
            // Create announcement simple
            .addCase(createAnnouncementSimple.pending, (state) => {
                state.createLoading = true;
                state.createError = null;
            })
            .addCase(createAnnouncementSimple.fulfilled, (state, action) => {
                state.createLoading = false;
                if (action.payload.success) {
                    const newAnnouncement = action.payload.announcement || action.payload.data || action.payload;
                    if (newAnnouncement) {
                        state.announcements.unshift(newAnnouncement);
                    }
                }
            })
            .addCase(createAnnouncementSimple.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload;
            });
    },
});

export const { clearError, clearCreateError, addAnnouncement, setAnnouncements } = announcementSlice.actions;
export default announcementSlice.reducer;