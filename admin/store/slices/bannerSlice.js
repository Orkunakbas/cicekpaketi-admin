import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import getApiUrl from '../../utils/api';

// Tüm banner'ları getir
export const fetchBanners = createAsyncThunk(
  'banners/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl('/api/banners/list'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Banner\'lar getirilemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Tek bir banner getir
export const fetchSingleBanner = createAsyncThunk(
  'banners/fetchSingleBanner',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/banners/${id}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Banner getirilemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Yeni banner ekle
export const addBanner = createAsyncThunk(
  'banners/addBanner',
  async (bannerData, { rejectWithValue }) => {
    try {
      // FormData kullan (resim upload için)
      const formData = new FormData();
      
      Object.keys(bannerData).forEach(key => {
        if (bannerData[key] !== null && bannerData[key] !== undefined) {
          formData.append(key, bannerData[key]);
        }
      });

      const response = await fetch(getApiUrl('/api/banners/add'), {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Banner eklenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Banner güncelle
export const updateBanner = createAsyncThunk(
  'banners/updateBanner',
  async ({ id, bannerData }, { rejectWithValue }) => {
    try {
      // FormData kullan (resim upload için)
      const formData = new FormData();
      
      Object.keys(bannerData).forEach(key => {
        if (bannerData[key] !== null && bannerData[key] !== undefined) {
          formData.append(key, bannerData[key]);
        }
      });

      const response = await fetch(getApiUrl(`/api/banners/update/${id}`), {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Banner güncellenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Banner rank güncelle
export const updateBannerRank = createAsyncThunk(
  'banners/updateBannerRank',
  async ({ id, newRank }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/banners/rank/${id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newRank }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Sıralama güncellenemedi');
      }

      return id;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Banner resmini sil
export const deleteBannerImage = createAsyncThunk(
  'banners/deleteBannerImage',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/banners/image/delete/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Banner resmi silinemedi');
      }

      return id;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Banner sil
export const deleteBanner = createAsyncThunk(
  'banners/deleteBanner',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/banners/delete/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Banner silinemedi');
      }

      return id;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

const bannersSlice = createSlice({
  name: 'banners',
  initialState: {
    banners: [],
    selectedBanner: null,
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    clearSelectedBanner: (state) => {
      state.selectedBanner = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all banners
      .addCase(fetchBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = action.payload;
        state.error = null;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch single banner
      .addCase(fetchSingleBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSingleBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBanner = action.payload;
        state.error = null;
      })
      .addCase(fetchSingleBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add banner
      .addCase(addBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners.push(action.payload);
        state.successMessage = 'Banner başarıyla eklendi';
        state.error = null;
      })
      .addCase(addBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update banner
      .addCase(updateBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.banners.findIndex(bnr => bnr.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        state.selectedBanner = action.payload;
        state.successMessage = 'Banner başarıyla güncellendi';
        state.error = null;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update banner rank
      .addCase(updateBannerRank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBannerRank.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateBannerRank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete banner
      .addCase(deleteBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = state.banners.filter(bnr => bnr.id !== action.payload);
        state.successMessage = 'Banner başarıyla silindi';
        state.error = null;
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, clearSelectedBanner } = bannersSlice.actions;
export default bannersSlice.reducer;

