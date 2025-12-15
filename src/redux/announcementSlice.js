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
            console.log('Sending announcement data:', announcementData);

            const formData = new FormData();

            // ✅ Append text fields ONCE
            formData.append('title', announcementData.title);
            formData.append('details', announcementData.details);

            // ✅ Handle recipients as JSON string
            if (announcementData.recipients && announcementData.recipients.length > 0) {
                formData.append('recipients', JSON.stringify(announcementData.recipients));
            }

            // ✅ Append createdBy if exists
            if (announcementData.createdBy) {
                formData.append('createdBy', announcementData.createdBy);
            }

            // ✅ Append files with field name "images" (matches backend)
            if (announcementData.files && announcementData.files.length > 0) {
                announcementData.files.forEach(file => {
                    formData.append('images', file); // ONLY this line!
                });
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
                timeout: 30000,
            });

            console.log('Response received:', response.data);
            return response.data;

        } catch (error) {
            console.error('Detailed error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
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



export const deleteAnnouncement = createAsyncThunk(
    "announcements/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/announcement/deleteAnnouncement/${id}`);

            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to delete announcement"
            );
        }
    }
);


export const updateAnnouncement = createAsyncThunk(
    "announcements/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const formData = new FormData();

            if (data.title) formData.append("title", data.title);
            if (data.details) formData.append("details", data.details);

            if (data.recipients) {
                formData.append("recipients", JSON.stringify(data.recipients));
            }

            if (data.removeImages?.length) {
                formData.append("removeImages", JSON.stringify(data.removeImages));
            }

            if (data.files?.length) {
                data.files.forEach((file) => formData.append("images", file));
            }

            const response = await axiosInstance.put(
                `/announcement/updateAnnouncement/${id}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // Return updated announcement to update the slice
            return response.data.announcement;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update announcement"
            );
        }
    }
);

export const createEvent = createAsyncThunk(
    'announcements/createEvent',
    async (eventData, { rejectWithValue }) => {
        try {
            console.log('Sending event data:', eventData);

            const formData = new FormData();
            formData.append('title', eventData.title);
            formData.append('startDate', eventData.startDate);
            formData.append('endDate', eventData.endDate);
            if (eventData.notes) formData.append('notes', eventData.notes);

            if (eventData.files?.length) {
                eventData.files.forEach(file => {
                    formData.append('attachments', file);
                });
            }

            const response = await axiosInstance.post(
                '/announcement/create-event',
                formData
            );

            console.log('Create event response:', response.data);
            return response.data;

        } catch (error) {
            console.error('Create event error:', error.response?.data || error.message);
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create event'
            );
        }
    }
);


export const fetchAllEvents = createAsyncThunk(
    'announcements/fetchAllEvents',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/announcement/getAllEvents');
            console.log('Fetched events:', response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch events'
            );
        }
    }
);


// 1️⃣ Create async thunk for deleting an event
export const deleteEvent = createAsyncThunk(
    "announcements/deleteEvent",
    async (eventId, { rejectWithValue }) => {
        try {
            const response = await axios.axiosInstance.delete(
                `/deleteEvent/${eventId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`, // or wherever you store auth
                    },
                }
            );
            return response.data; // { success, message }
        } catch (error) {
            return rejectWithValue(error.response.data || error.message);
        }
    }
);


const announcementSlice = createSlice({
    name: 'announcements',
    initialState: {
        announcements: [],
        events: [],
        loading: false,
        error: null,
        createLoading: false,
        createError: null,
        createEventLoading: false,
        createEventError: null,
        deleteLoading: false,
        deleteError: null,
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
        },
        addEvent: (state, action) => {
            state.events.unshift(action.payload); // add a new event to the top
        },
        setEvents: (state, action) => {
            state.events = action.payload; // replace all events
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

            .addCase(deleteAnnouncement.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(deleteAnnouncement.fulfilled, (state, action) => {
                state.loading = false;
                const deletedId = action.payload; // <- this is the ID returned by thunk
                state.announcements = state.announcements.filter(item => item._id !== deletedId);
            })


            // UPDATE
            .addCase(updateAnnouncement.fulfilled, (state, action) => {
                state.createLoading = false;

                const updated = action.payload; // ⚡ Already the announcement
                if (!updated) return;

                state.announcements = state.announcements.map((item) =>
                    item._id === updated._id ? updated : item
                );
            })
            .addCase(createEvent.pending, (state) => {
                state.createEventLoading = true;
                state.createEventError = null;
            })
            .addCase(createEvent.fulfilled, (state, action) => {
                state.createEventLoading = false;
                if (action.payload.success) {
                    const newEvent = action.payload.event || action.payload.data || action.payload;
                    if (newEvent) state.events.unshift(newEvent);
                }
            })
            .addCase(createEvent.rejected, (state, action) => {
                state.createEventLoading = false;
                state.createEventError = action.payload;
            })

            .addCase(fetchAllEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllEvents.fulfilled, (state, action) => {
                state.loading = false;

                if (Array.isArray(action.payload)) {
                    // backend returned array directly
                    state.events = action.payload;
                } else if (action.payload?.events) {
                    state.events = action.payload.events;
                } else {
                    state.events = [];
                }
            })

            .addCase(fetchAllEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteEvent.fulfilled, (state, action) => {
                // action.payload is { success: true, message: "Event deleted successfully" }
                state.events = state.events.filter(evt => evt._id !== action.meta.arg);
            })
            .addCase(deleteEvent.rejected, (state, action) => {
                console.error("Failed to delete event:", action.payload?.message);
            });
    },
});


export const { clearError, clearCreateError, addAnnouncement, setAnnouncements } = announcementSlice.actions;
export default announcementSlice.reducer;