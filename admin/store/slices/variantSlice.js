import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import getApiUrl from '../../utils/api';

// ============================================
// VARIANT OPTION TYPES (Renk, Beden, Malzeme)
// ============================================

// Tüm tipleri getir (Admin panelde router.locale ile çağrılmalı)
export const fetchOptionTypes = createAsyncThunk(
  'variant/fetchOptionTypes',
  async (language_code, { rejectWithValue }) => {
    try {
      // Admin panelde her zaman dil gönderilmeli (router.locale)
      const url = getApiUrl(`/api/variant-options/types/list/${language_code}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Option types getirilemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Yeni tip ekle (typeData içinde language_code: router.locale gönderilmeli)
export const addOptionType = createAsyncThunk(
  'variant/addOptionType',
  async (typeData, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl('/api/variant-options/types/add'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(typeData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Option type eklenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Tip güncelle
export const updateOptionType = createAsyncThunk(
  'variant/updateOptionType',
  async ({ id, typeData }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/variant-options/types/update/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(typeData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Option type güncellenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Tip sil
export const deleteOptionType = createAsyncThunk(
  'variant/deleteOptionType',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/variant-options/types/delete/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Option type silinemedi');
      }

      return id;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// ============================================
// VARIANT OPTION VALUES (Siyah, 42, Deri)
// ============================================

// Tüm değerleri getir (Admin panelde router.locale ile çağrılmalı)
export const fetchOptionValues = createAsyncThunk(
  'variant/fetchOptionValues',
  async ({ language_code, option_type_id }, { rejectWithValue }) => {
    try {
      // Admin panelde her zaman dil gönderilmeli (router.locale)
      let url = `/api/variant-options/values/list/${language_code}`;
      
      // Query parametresi ekle
      if (option_type_id) {
        url += `?option_type_id=${option_type_id}`;
      }
      
      const response = await fetch(getApiUrl(url), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Option values getirilemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Yeni değer ekle (valueData içinde language_code: router.locale gönderilmeli)
export const addOptionValue = createAsyncThunk(
  'variant/addOptionValue',
  async (valueData, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl('/api/variant-options/values/add'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valueData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Option value eklenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Değer güncelle
export const updateOptionValue = createAsyncThunk(
  'variant/updateOptionValue',
  async ({ id, valueData }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/variant-options/values/update/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valueData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Option value güncellenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Değer sil
export const deleteOptionValue = createAsyncThunk(
  'variant/deleteOptionValue',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/variant-options/values/delete/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Option value silinemedi');
      }

      return id;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// ============================================
// SLICE
// ============================================

const variantSlice = createSlice({
  name: 'variant',
  initialState: {
    optionTypes: [],
    optionValues: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch option types
      .addCase(fetchOptionTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOptionTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.optionTypes = action.payload;
        state.error = null;
      })
      .addCase(fetchOptionTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add option type
      .addCase(addOptionType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addOptionType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.optionTypes.push(action.payload);
        state.error = null;
      })
      .addCase(addOptionType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update option type
      .addCase(updateOptionType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOptionType.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.optionTypes.findIndex(type => type.id === action.payload.id);
        if (index !== -1) {
          state.optionTypes[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateOptionType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete option type
      .addCase(deleteOptionType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOptionType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.optionTypes = state.optionTypes.filter(type => type.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteOptionType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch option values
      .addCase(fetchOptionValues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOptionValues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.optionValues = action.payload;
        state.error = null;
      })
      .addCase(fetchOptionValues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add option value
      .addCase(addOptionValue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addOptionValue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.optionValues.push(action.payload);
        state.error = null;
      })
      .addCase(addOptionValue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update option value
      .addCase(updateOptionValue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOptionValue.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.optionValues.findIndex(value => value.id === action.payload.id);
        if (index !== -1) {
          state.optionValues[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateOptionValue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete option value
      .addCase(deleteOptionValue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOptionValue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.optionValues = state.optionValues.filter(value => value.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteOptionValue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = variantSlice.actions;
export default variantSlice.reducer;

