import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Tüm değerlendirmeleri getir
export const fetchReviews = createAsyncThunk(
  'degerlendirme/fetchReviews',
  async (status = 'all', { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/reviews/admin/list?status=${status}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Değerlendirmeler alınamadı');
    }
  }
);

// Değerlendirmeyi onayla/reddet
export const approveReview = createAsyncThunk(
  'degerlendirme/approveReview',
  async ({ id, is_approved }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/api/reviews/admin/${id}/approve`, { is_approved });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'İşlem başarısız');
    }
  }
);

// Değerlendirmeyi sil
export const deleteReview = createAsyncThunk(
  'degerlendirme/deleteReview',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/api/reviews/admin/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Değerlendirme silinemedi');
    }
  }
);

const degerlendirmeSlice = createSlice({
  name: 'degerlendirme',
  initialState: {
    reviews: [],
    isLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Approve review
      .addCase(approveReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(approveReview.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.reviews.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })
      .addCase(approveReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = state.reviews.filter(r => r.id !== action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = degerlendirmeSlice.actions;
export default degerlendirmeSlice.reducer;


