import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from './categorySlice';
import productReducer from './productSlice';
import searchReducer from './searchSlice';
import sidebarReducer from './sidebarSlice'; // Asegúrate de tener esto

const store = configureStore({
  reducer: {
    categories: categoryReducer, // ← Esta clave debe ser 'categories'
    products: productReducer,
    search: searchReducer,
    sidebar: sidebarReducer,
  },
});

export default store;   