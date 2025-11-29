import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API URL'i belirleme
const getApiUrl = (path) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${baseURL}${path}`;
};

// Tüm sözleşmeleri getir
export const fetchTerms = createAsyncThunk(
  'term/fetchTerms',
  async (language_code = '', { rejectWithValue }) => {
    try {
      const url = language_code 
        ? getApiUrl(`/api/terms/list?language_code=${language_code}`)
        : getApiUrl('/api/terms/list');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Sözleşmeler getirilemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Tek sözleşme getir
export const fetchSingleTerm = createAsyncThunk(
  'term/fetchSingleTerm',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/terms/${id}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Sözleşme getirilemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Yeni sözleşme ekle
export const addTerm = createAsyncThunk(
  'term/addTerm',
  async (termData, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl('/api/terms/add'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(termData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Sözleşme eklenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Sözleşme güncelle
export const updateTerm = createAsyncThunk(
  'term/updateTerm',
  async ({ id, termData }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/terms/update/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(termData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Sözleşme güncellenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Sözleşme sıralamasını güncelle
export const updateTermRank = createAsyncThunk(
  'term/updateTermRank',
  async (rankings, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl('/api/terms/rank/update'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rankings }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Sıralama güncellenemedi');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Sözleşme sil
export const deleteTerm = createAsyncThunk(
  'term/deleteTerm',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/terms/delete/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Sözleşme silinemedi');
      }

      return id;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

const termSlice = createSlice({
  name: 'term',
  initialState: {
    terms: [],
    selectedTerm: null,
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearSelectedTerm: (state) => {
      state.selectedTerm = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Terms
      .addCase(fetchTerms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTerms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.terms = action.payload;
      })
      .addCase(fetchTerms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Term
      .addCase(fetchSingleTerm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSingleTerm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTerm = action.payload;
      })
      .addCase(fetchSingleTerm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add Term
      .addCase(addTerm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTerm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.terms.push(action.payload);
        state.successMessage = 'Sözleşme başarıyla eklendi';
      })
      .addCase(addTerm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Term
      .addCase(updateTerm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTerm.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.terms.findIndex(term => term.id === action.payload.id);
        if (index !== -1) {
          state.terms[index] = action.payload;
        }
        state.successMessage = 'Sözleşme başarıyla güncellendi';
      })
      .addCase(updateTerm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Term Rank
      .addCase(updateTermRank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTermRank.fulfilled, (state) => {
        state.isLoading = false;
        state.successMessage = 'Sıralama başarıyla güncellendi';
      })
      .addCase(updateTermRank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete Term
      .addCase(deleteTerm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTerm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.terms = state.terms.filter(term => term.id !== action.payload);
        state.successMessage = 'Sözleşme başarıyla silindi';
      })
      .addCase(deleteTerm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, clearSelectedTerm } = termSlice.actions;
export default termSlice.reducer;


