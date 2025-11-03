import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCategories, getProductsByCategory } from '../data/supabaseApi';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const categories = await getCategories();
    return categories;
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'categories/fetchProductsByCategory',
  async (categoryName) => {
    const products = await getProductsByCategory(categoryName);
    return { categoryName, products };
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [], // ← Estado inicial
    categoryProducts: {},
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        const { categoryName, products } = action.payload;
        state.categoryProducts[categoryName] = products;
      });
  }
});

// SELECTOR CORREGIDO - más robusto
export const getAllCategories = (state) => {
  // Verifica que state.categories exista y tenga la propiedad categories
  return state?.categories?.categories || [];
};

export const getCategoryProducts = (state, categoryName) => 
  state?.categories?.categoryProducts?.[categoryName] || [];

export default categorySlice.reducer;