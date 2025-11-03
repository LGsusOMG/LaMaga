// store/searchSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { searchProducts } from "../data/supabaseApi";

// Async thunk para búsqueda en Supabase
export const performSearchAsync = createAsyncThunk(
  'search/performSearchAsync',
  async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return []; // Retornar array vacío si no hay término de búsqueda
    }
    const results = await searchProducts(searchTerm);
    return results;
  }
);

const initialState = {
    searchTerm: '',
    searchResults: [],
    loading: false,
    error: null
}

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        // Establecer término de búsqueda (sin realizar búsqueda inmediata)
        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
        },
        
        // Limpiar búsqueda
        clearSearch: (state) => {
            state.searchTerm = '';
            state.searchResults = [];
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(performSearchAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(performSearchAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(performSearchAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.searchResults = [];
            });
    }
})

// Selectores
export const getSearchTerm = (state) => state.search.searchTerm;
export const getSearchResults = (state) => state.search.searchResults;
export const getSearchLoading = (state) => state.search.loading;
export const getSearchError = (state) => state.search.error;

// Acciones
export const { setSearchTerm, clearSearch } = searchSlice.actions;

export default searchSlice.reducer;