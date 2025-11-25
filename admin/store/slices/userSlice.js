import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import getApiUrl from '../../utils/api';

// Tüm kullanıcıları getir
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl('/api/users/list'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Kullanıcılar getirilemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Tek bir kullanıcı getir
export const fetchSingleUser = createAsyncThunk(
  'users/fetchSingleUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/users/${id}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Kullanıcı getirilemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Yeni kullanıcı ekle
export const addUser = createAsyncThunk(
  'users/addUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl('/api/users/add'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Kullanıcı eklenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Kullanıcı güncelle
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/users/update/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Kullanıcı güncellenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Kullanıcı sil
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/users/delete/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Kullanıcı silinemedi');
      }

      return id;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    selectedUser: null,
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
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch single user
      .addCase(fetchSingleUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSingleUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
        state.error = null;
      })
      .addCase(fetchSingleUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add user
      .addCase(addUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.push(action.payload);
        state.successMessage = 'Kullanıcı başarıyla eklendi';
        state.error = null;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.selectedUser = action.payload;
        state.successMessage = 'Kullanıcı başarıyla güncellendi';
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.successMessage = 'Kullanıcı başarıyla silindi';
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;

