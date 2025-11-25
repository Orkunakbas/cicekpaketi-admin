import { configureStore } from '@reduxjs/toolkit';
import adminSlice from './slices/adminSlice';
import languageSlice from './slices/languageSlice';
import categoriesSlice from './slices/categoriesSlice.js';
import userSlice from './slices/userSlice';
import variantSlice from './slices/variantSlice';
import productSlice from './slices/productSlice';
 
export const store = configureStore({
  reducer: {
    admin: adminSlice,
    language: languageSlice,
    categories: categoriesSlice,
    users: userSlice,
    variant: variantSlice,
    products: productSlice,
  },
}); 