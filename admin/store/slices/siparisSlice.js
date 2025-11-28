import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API URL'i belirleme
const getApiUrl = (path) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${baseURL}${path}`;
};

// Tüm siparişleri getir
export const fetchOrders = createAsyncThunk(
  'siparis/fetchOrders',
  async ({ status = 'all', search = '', page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        status,
        search,
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(getApiUrl(`/api/orders/admin/all?${queryParams}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Siparişler getirilemedi');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Tek sipariş getir
export const fetchSingleOrder = createAsyncThunk(
  'siparis/fetchSingleOrder',
  async (orderNumber, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/orders/${orderNumber}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Sipariş getirilemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

// Sipariş güncelle
export const updateOrder = createAsyncThunk(
  'siparis/updateOrder',
  async ({ id, orderData }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/orders/admin/update/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Sipariş güncellenemedi');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue('Bağlantı hatası');
    }
  }
);

const siparisSlice = createSlice({
  name: 'siparis',
  initialState: {
    orders: [],
    selectedOrder: null,
    isLoading: false,
    error: null,
    successMessage: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Order
      .addCase(fetchSingleOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSingleOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchSingleOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Order
      .addCase(updateOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Sipariş başarıyla güncellendi';
        
        // Listedeki siparişi güncelle
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        
        // Seçili siparişi güncelle
        if (state.selectedOrder && state.selectedOrder.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, clearSelectedOrder } = siparisSlice.actions;
export default siparisSlice.reducer;

