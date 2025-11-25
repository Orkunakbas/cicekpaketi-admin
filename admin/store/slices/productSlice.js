import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import getApiUrl from '../../utils/api';

// Ürünleri listele
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (language_code, { rejectWithValue }) => {
    try {
      const url = language_code 
        ? getApiUrl(`/api/products/list/${language_code}`)
        : getApiUrl('/api/products/list');
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Ürünler getirilemedi');
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Tek ürün getir
export const fetchSingleProduct = createAsyncThunk(
  'products/fetchSingleProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/products/${id}`));
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Ürün getirilemedi');
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Yeni ürün ekle
export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      // FormData oluştur (resimler için)
      const formData = new FormData();
      
      // Temel ürün bilgilerini ekle
      Object.keys(productData).forEach(key => {
        if (key === 'variants') {
          // Varyantları JSON string olarak ekle
          formData.append('variants', JSON.stringify(productData.variants));
        } else if (key === 'imageFiles') {
          // Yeni resim dosyalarını ekle
          productData.imageFiles.forEach((file) => {
            formData.append('images', file);
          });
        } else if (key === 'imageVariantIds') {
          // Resim-varyant eşleştirmesini ekle
          formData.append('imageVariantIds', JSON.stringify(productData.imageVariantIds));
        } else if (key === 'variantCombinations') {
          // Varyant kombinasyonlarını JSON string olarak ekle
          formData.append('variantCombinations', JSON.stringify(productData.variantCombinations));
        } else if (key === 'variantImageMapping') {
          // Varyant resim eşleştirmesini JSON string olarak ekle
          formData.append('variantImageMapping', JSON.stringify(productData.variantImageMapping));
        } else if (key === 'images') {
          // images key'ini atlıyoruz (sadece metadata, gerçek dosyalar imageFiles'ta)
        } else {
          formData.append(key, productData[key]);
        }
      });
      
      const response = await fetch(getApiUrl('/api/products/add'), {
        method: 'POST',
        body: formData, // FormData gönder (Content-Type otomatik ayarlanır)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Ürün eklenemedi');
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Ürün güncelle
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data: productData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Temel ürün bilgilerini ekle
      Object.keys(productData).forEach(key => {
        if (key === 'variants') {
          // Varyantları JSON string olarak ekle
          formData.append('variants', JSON.stringify(productData.variants));
        } else if (key === 'imageFiles') {
          // Yeni resim dosyalarını ekle
          productData.imageFiles.forEach((file) => {
            formData.append('images', file);
          });
        } else if (key === 'imageVariantIds') {
          // Resim-varyant eşleştirmesini ekle
          formData.append('imageVariantIds', JSON.stringify(productData.imageVariantIds));
        } else if (key === 'images') {
          // images key'ini atlıyoruz (sadece metadata)
        } else {
          formData.append(key, productData[key]);
        }
      });
      
      const response = await fetch(getApiUrl(`/api/products/update/${id}`), {
        method: 'PUT',
        body: formData, // FormData gönder (Content-Type otomatik)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Ürün güncellenemedi');
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Ürün sil
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/products/delete/${id}`), {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Ürün silinemedi');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Ürün resmini sil
export const deleteProductImage = createAsyncThunk(
  'products/deleteProductImage',
  async (image_id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/products/image/delete/${image_id}`), {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Resim silinemedi');
      }
      
      return image_id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Varyant sil
export const deleteVariant = createAsyncThunk(
  'products/deleteVariant',
  async (variant_id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/products/variants/${variant_id}`), {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Varyant silinemedi');
      }
      
      return variant_id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Ürün aktifliğini toggle et
export const toggleProductActive = createAsyncThunk(
  'products/toggleProductActive',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/products/toggle-active/${id}`), {
        method: 'PATCH',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Aktiflik durumu değiştirilemedi');
      }
      
      return data.data; // { id, is_active }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Ürün öne çıkarma durumunu toggle et
export const toggleProductFeatured = createAsyncThunk(
  'products/toggleProductFeatured',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/api/products/toggle-featured/${id}`), {
        method: 'PATCH',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Öne çıkarma durumu değiştirilemedi');
      }
      
      return data.data; // { id, is_featured }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    selectedProduct: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Product
      .addCase(fetchSingleProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSingleProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchSingleProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add Product
      .addCase(addProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete Product Image
      .addCase(deleteProductImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProductImage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteProductImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete Variant
      .addCase(deleteVariant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteVariant.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteVariant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Toggle Product Active
      .addCase(toggleProductActive.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleProductActive.fulfilled, (state, action) => {
        // Listedeki ürünü güncelle
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index].is_active = action.payload.is_active;
        }
      })
      .addCase(toggleProductActive.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Toggle Product Featured
      .addCase(toggleProductFeatured.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleProductFeatured.fulfilled, (state, action) => {
        // Listedeki ürünü güncelle
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index].is_featured = action.payload.is_featured;
        }
      })
      .addCase(toggleProductFeatured.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;


