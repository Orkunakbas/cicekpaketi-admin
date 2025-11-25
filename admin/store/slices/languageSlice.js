import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import getApiUrl from '../../utils/api';

// Tüm dilleri getir
export const fetchLanguages = createAsyncThunk(
  'language/fetchLanguages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl('/api/languages/list'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Diller getirilemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Yeni dil ekle
export const addLanguage = createAsyncThunk(
  'language/addLanguage',
  async (languageData, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl('/api/languages/add'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(languageData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Dil eklenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Dil sil
export const deleteLanguage = createAsyncThunk(
  'language/deleteLanguage',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/languages/delete/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Dil silinemedi');
      }

      return id;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

const languageSlice = createSlice({
  name: 'language',
  initialState: {
    languages: [],
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch languages
      .addCase(fetchLanguages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.languages = action.payload;
        state.error = null;
      })
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add language
      .addCase(addLanguage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addLanguage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.languages.push(action.payload);
        state.successMessage = 'Dil başarıyla eklendi';
        state.error = null;
      })
      .addCase(addLanguage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete language
      .addCase(deleteLanguage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLanguage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.languages = state.languages.filter(lang => lang.id !== action.payload);
        state.successMessage = 'Dil başarıyla silindi';
        state.error = null;
      })
      .addCase(deleteLanguage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = languageSlice.actions;
export default languageSlice.reducer;


