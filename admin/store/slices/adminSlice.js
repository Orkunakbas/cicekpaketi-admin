import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import getApiUrl from '../../utils/api';

// SessionStorage'dan token kontrol et (sadece client-side)
const getStoredAuth = () => {
  if (typeof window !== 'undefined') {
    try {
      const token = sessionStorage.getItem('auth_token');
      const user = sessionStorage.getItem('auth_user');
      
      if (token && user) {
        return {
          token,
          user: JSON.parse(user),
          isAuthenticated: true
        };
      }
    } catch (error) {
      console.error('Auth storage error:', error);
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
    }
  }
  
  return {
    token: null,
    user: null,
    isAuthenticated: false
  };
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'admin/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Giriş başarısız');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Async thunk for restoring session
export const restoreSession = createAsyncThunk(
  'admin/restoreSession',
  async (_, { rejectWithValue }) => {
    const storedAuth = getStoredAuth();
    if (storedAuth.isAuthenticated) {
      return storedAuth;
    }
    return rejectWithValue('No session found');
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    successMessage: null,
    isAuthenticated: false,
    isInitialized: false, // Hydration için
    sidebarCollapsed: false, // Sidebar durumu
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      // sessionStorage'a kaydet
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_token', action.payload.token);
        sessionStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // sessionStorage'dan temizle
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
      }
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.successMessage = action.payload.message;
        
        // sessionStorage'a kaydet
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_token', action.payload.token);
          sessionStorage.setItem('auth_user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Restore session cases
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isInitialized = true;
      });
  },
});

export const { clearError, setCredentials, clearCredentials, setInitialized, clearSuccess, toggleSidebar } = adminSlice.actions;
export default adminSlice.reducer; 