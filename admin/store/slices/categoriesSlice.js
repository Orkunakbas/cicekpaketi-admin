import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import getApiUrl from '../../utils/api';

// Tüm kategorileri getir
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl('/api/categories/list'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Kategoriler getirilemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Tek bir kategori getir
export const fetchSingleCategory = createAsyncThunk(
  'categories/fetchSingleCategory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/categories/${id}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Kategori getirilemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Yeni kategori ekle
export const addCategory = createAsyncThunk(
  'categories/addCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      // FormData kullan (resim upload için)
      const formData = new FormData();
      
      Object.keys(categoryData).forEach(key => {
        if (categoryData[key] !== null && categoryData[key] !== undefined) {
          formData.append(key, categoryData[key]);
        }
      });

      const response = await fetch(getApiUrl('/api/categories/add'), {
        method: 'POST',
        body: formData, // FormData gönder (Content-Type otomatik)
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Kategori eklenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Kategori güncelle
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      // FormData kullan (resim upload için)
      const formData = new FormData();
      
      Object.keys(categoryData).forEach(key => {
        if (categoryData[key] !== null && categoryData[key] !== undefined) {
          formData.append(key, categoryData[key]);
        }
      });

      const response = await fetch(getApiUrl(`/api/categories/update/${id}`), {
        method: 'PUT',
        body: formData, // FormData gönder (Content-Type otomatik)
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Kategori güncellenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Kategori rank güncelle
export const updateCategoryRank = createAsyncThunk(
  'categories/updateCategoryRank',
  async ({ id, newRank }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/categories/rank/${id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newRank }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Kategori sırası güncellenemedi');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Kategori sil
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/categories/delete/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Kategori silinemedi');
      }

      return id;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    selectedCategory: null,
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
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch single category
      .addCase(fetchSingleCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSingleCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCategory = action.payload;
        state.error = null;
      })
      .addCase(fetchSingleCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add category
      .addCase(addCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload);
        state.successMessage = 'Kategori başarıyla eklendi';
        state.error = null;
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.selectedCategory = action.payload;
        state.successMessage = 'Kategori başarıyla güncellendi';
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update category rank
      .addCase(updateCategoryRank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategoryRank.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateCategoryRank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
        state.successMessage = 'Kategori başarıyla silindi';
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearSelectedCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;

