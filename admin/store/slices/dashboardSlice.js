import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Bu Ay İstatistikleri
export const fetchMonthlyStats = createAsyncThunk(
  'dashboard/fetchMonthlyStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/api/dashboard/monthly-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Veriler alınamadı');
    }
  }
);

// Toplam İstatistikler
export const fetchTotalStats = createAsyncThunk(
  'dashboard/fetchTotalStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/api/dashboard/total-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Veriler alınamadı');
    }
  }
);

// En Çok Satan Ürünler
export const fetchTopProducts = createAsyncThunk(
  'dashboard/fetchTopProducts',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/api/dashboard/top-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Veriler alınamadı');
    }
  }
);

// En Son Üyeler
export const fetchRecentUsers = createAsyncThunk(
  'dashboard/fetchRecentUsers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/api/dashboard/recent-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Veriler alınamadı');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    monthlyStats: null,
    totalStats: null,
    topProducts: [],
    recentUsers: [],
    loading: {
      monthlyStats: false,
      totalStats: false,
      topProducts: false,
      recentUsers: false
    },
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Monthly Stats
    builder
      .addCase(fetchMonthlyStats.pending, (state) => {
        state.loading.monthlyStats = true;
        state.error = null;
      })
      .addCase(fetchMonthlyStats.fulfilled, (state, action) => {
        state.loading.monthlyStats = false;
        state.monthlyStats = action.payload;
      })
      .addCase(fetchMonthlyStats.rejected, (state, action) => {
        state.loading.monthlyStats = false;
        state.error = action.payload;
      });

    // Total Stats
    builder
      .addCase(fetchTotalStats.pending, (state) => {
        state.loading.totalStats = true;
        state.error = null;
      })
      .addCase(fetchTotalStats.fulfilled, (state, action) => {
        state.loading.totalStats = false;
        state.totalStats = action.payload;
      })
      .addCase(fetchTotalStats.rejected, (state, action) => {
        state.loading.totalStats = false;
        state.error = action.payload;
      });

    // Top Products
    builder
      .addCase(fetchTopProducts.pending, (state) => {
        state.loading.topProducts = true;
        state.error = null;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.loading.topProducts = false;
        state.topProducts = action.payload;
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
        state.loading.topProducts = false;
        state.error = action.payload;
      });

    // Recent Users
    builder
      .addCase(fetchRecentUsers.pending, (state) => {
        state.loading.recentUsers = true;
        state.error = null;
      })
      .addCase(fetchRecentUsers.fulfilled, (state, action) => {
        state.loading.recentUsers = false;
        state.recentUsers = action.payload;
      })
      .addCase(fetchRecentUsers.rejected, (state, action) => {
        state.loading.recentUsers = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

