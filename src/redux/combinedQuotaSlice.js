import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from './../Helpers/axiosInstance';

// ------------------ CACHE KEYS ------------------
const CACHE_KEY = 'combinedQuotaCache';
const CACHE_TIMESTAMP_KEY = 'combinedQuotaCacheTimestamp';
const HISTORY_CACHE_KEY = "combinedQuotaHistory";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ------------------ MAIN DATA CACHE ------------------
const getCachedData = () => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

        if (!cached || !timestamp) return null;

        const age = Date.now() - parseInt(timestamp);
        if (age < CACHE_DURATION) {
            return JSON.parse(cached);
        }
    } catch {}
    return null;
};

const setCachedData = (data) => {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch {}
};

// ------------------ HISTORY CACHE ------------------
const getCachedHistoryData = () => {
    try {
        const cache = localStorage.getItem(HISTORY_CACHE_KEY);
        if (!cache) return null;

        const parsed = JSON.parse(cache);

        // ⭐ IMPORTANT FIX — Ignore empty cache
        const isEmpty =
            (!parsed.CSR || parsed.CSR.length === 0) &&
            (!parsed.Deposit || parsed.Deposit.length === 0) &&
            (!parsed.Withdraw || parsed.Withdraw.length === 0);

        if (isEmpty) {
            console.log("⚠ Ignoring empty history cache");
            return null;
        }

        return parsed;
    } catch {}
    return null;
};

const setCachedHistoryData = (data) => {
    try {
        localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(data));
    } catch {}
};

// ------------------ FETCH HISTORY ------------------
export const fetchCombinedDepartmentsHistory = createAsyncThunk(
    'combinedQuota/fetchCombinedHistory',
    async ({ days = 30 } = {}, { rejectWithValue }) => {
        try {
            const cached = getCachedHistoryData();

            // ⭐ ONLY use cache if valid + not empty
            if (cached && cached.days === days) {
                return { ...cached, fromCache: true };
            }

            console.log("🌐 Fetching history from API...");

            const response = await axiosInstance.get(`/sheet/fetch-history?days=${days}`);
            const { CSR = [], Deposit = [], Withdraw = [] } = response.data;

            const result = {
                days,
                CSR,
                Deposit,
                Withdraw,
                timestamp: new Date().toISOString(),
                fromCache: false,
            };

            // Save only if REAL DATA
            if (CSR.length > 0 || Deposit.length > 0 || Withdraw.length > 0) {
                setCachedHistoryData(result);
            }

            return result;

        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch history");
        }
    }
);

// ------------------ FETCH MAIN COMBINED DATA ------------------
export const fetchCombinedDepartmentsDataSilent = createAsyncThunk(
    'combinedQuota/fetchSilent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/sheet/combined-data');
            setCachedData(response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue("Failed to fetch");
        }
    }
);

export const fetchCombinedDepartmentsData = createAsyncThunk(
    'combinedQuota/fetchCombinedDepartmentsData',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const cached = getCachedData();
            if (cached) {
                setTimeout(() => dispatch(fetchCombinedDepartmentsDataSilent()), 100);
                return { ...cached, fromCache: true };
            }

            const response = await axiosInstance.get('/sheet/combined-data');
            setCachedData(response.data);
            return response.data;

        } catch (error) {
            return rejectWithValue("Failed to fetch combined data");
        }
    }
);

// ------------------ SLICE ------------------
const combinedQuotaSlice = createSlice({
    name: 'combinedQuota',
    initialState: {
        data: [],
        count: 0,
        departments: [],
        columns: [],
        loading: false,
        error: null,
        fromCache: false,
        lastUpdated: null,

        // HISTORY STATE
        historyLoading: false,
        historyError: null,
        history: {
            CSR: [],
            Deposit: [],
            Withdraw: [],
            days: 30,
            fromCache: false,
            timestamp: null,
        },
    },

    reducers: {
        clearCombinedData: (state) => {
            state.data = [];
            state.count = 0;
            state.departments = [];
            state.columns = [];
            state.error = null;
            state.fromCache = false;
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        },

        clearHistoryData: (state) => {
            state.history = {
                CSR: [],
                Deposit: [],
                Withdraw: [],
                days: 30,
                fromCache: false,
                timestamp: null,
            };
            state.historyError = null;
            localStorage.removeItem(HISTORY_CACHE_KEY);
        },

        // ⭐ FIXED — load only valid non-empty cache
        loadFromCache: (state) => {
            const cached = getCachedData();
            if (cached) {
                state.data = cached.data || [];
                state.count = cached.totalRows || 0;
                state.departments = cached.departments || [];
                state.columns = cached.columns || [];
                state.fromCache = true;
                state.lastUpdated = new Date().toISOString();
            }

            const historyCache = getCachedHistoryData();
            if (historyCache) {
                state.history = {
                    CSR: historyCache.CSR,
                    Deposit: historyCache.Deposit,
                    Withdraw: historyCache.Withdraw,
                    days: historyCache.days,
                    timestamp: historyCache.timestamp,
                    fromCache: true,
                };
            }
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchCombinedDepartmentsHistory.pending, (state) => {
                state.historyLoading = true;
                state.historyError = null;
            })

            .addCase(fetchCombinedDepartmentsHistory.fulfilled, (state, action) => {
                state.historyLoading = false;
                state.history = action.payload;
            })

            .addCase(fetchCombinedDepartmentsHistory.rejected, (state, action) => {
                state.historyLoading = false;
                state.historyError = action.payload;
            })

            .addCase(fetchCombinedDepartmentsData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchCombinedDepartmentsData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data || [];
                state.count = action.payload.totalRows || 0;
                state.departments = action.payload.departments || [];
                state.columns = action.payload.columns || [];
                state.fromCache = action.payload.fromCache || false;
                state.lastUpdated = new Date().toISOString();
            })

            .addCase(fetchCombinedDepartmentsData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCombinedData, clearHistoryData, loadFromCache } = combinedQuotaSlice.actions;
export default combinedQuotaSlice.reducer;
