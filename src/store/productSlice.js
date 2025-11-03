// store/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getFeaturedProducts, 
  getAllProductsFromDB,
  getProductsByCategory 
} from '../data/supabaseApi'; 

// Async thunks para productos
export const fetchAllProducts = createAsyncThunk(
  'products/fetchAllProducts',
  async () => {
    const products = await getAllProductsFromDB();
    return products;
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (limit = 8) => {
    const products = await getFeaturedProducts(limit);
    return products;
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (categoryId) => {
    const products = await getProductsByCategory(categoryId);
    return products;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    allProducts: [],
    featuredProducts: [],
    productsByCategory: {},
    loading: false,
    error: null
  },
  reducers: {
    // Mantén tus reducers existentes si los necesitas
    showAllProducts: (state) => {
      // Lógica local si necesitas
    },
    updateFeaturedProducts: (state, action) => {
      // Lógica local si necesitas
    }
  },
  extraReducers: (builder) => {
    builder
      // Para todos los productos
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.allProducts = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Para productos destacados
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      })
      // Para productos por categoría
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        // Aquí podrías almacenar productos por categoría si lo necesitas
      });
  }
});

export const { showAllProducts, updateFeaturedProducts } = productSlice.actions;
export const getAllProducts = (state) => state.products.allProducts;
export const getFeaturedProductsState = (state) => state.products.featuredProducts;
export default productSlice.reducer;