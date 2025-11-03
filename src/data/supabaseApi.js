// data/supabaseApi.js
import { supabase } from './supabaseClient';

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Función para verificar si el usuario es administrador
export const isAdmin = async (email) => {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single()
  
  return !error && data
}

// Obtener todas las categorías
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Convertir a formato que espera tu app (solo nombres)
    return data.map(category => category.name);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Obtener todos los productos
export const getAllProductsFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name)
      `)
      .order('title');
    
    if (error) throw error;
    
    // Adaptar formato a lo que espera tu componente
    return data.map(product => ({
      id: product.id,
      title: product.title,
      category: product.categories.name, // Mapear category_id a nombre
      price: parseFloat(product.price),
      discount: product.discount,
      brand: product.brand,
      stock: product.stock,
      image: product.image_url
    }));
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
};

// Obtener productos destacados
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name)
      `)
      .or(`discount.gt.0,is_featured.eq.true`)
      .limit(limit);
    
    if (error) throw error;
    
    return data.map(product => ({
      id: product.id,
      title: product.title,
      category: product.categories.name,
      price: parseFloat(product.price),
      discount: product.discount,
      brand: product.brand,
      stock: product.stock,
      image: product.image_url
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

// Obtener productos por categoría
export const getProductsByCategory = async (categoryName) => {
  try {
    console.log('📂 supabaseApi - Getting products for category:', categoryName);
    
    // Primero obtener el ID de la categoría por nombre
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .ilike('name', `%${categoryName}%`) // Busqueda más flexible
      .single();
    
    if (categoryError) {
      console.error('📂 supabaseApi - Error finding category:', categoryError);
      return [];
    }
    
    console.log('📂 supabaseApi - Category found:', categoryData);

    // Luego obtener productos por category_id
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        categories (name)
      `)
      .eq('category_id', categoryData.id);
    
    if (productsError) {
      console.error('📂 supabaseApi - Error finding products:', productsError);
      return [];
    }

    console.log('📂 supabaseApi - Products found:', productsData.length);

    return productsData.map(product => ({
      id: product.id,
      title: product.title,
      category: product.categories.name,
      price: parseFloat(product.price),
      discount: product.discount,
      brand: product.brand,
      stock: product.stock,
      image: product.image_url
    }));

  } catch (error) {
    console.error('📂 supabaseApi - Error in getProductsByCategory:', error);
    return [];
  }
};

// Función de búsqueda de productos
export const searchProducts = async (searchTerm) => {
  try {
    console.log('🔍 supabaseApi - Searching for:', searchTerm);
    
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    const searchPattern = `%${searchTerm}%`;
    
    // Consulta separada para productos por título y marca
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        categories (name)
      `)
      .or(`title.ilike.${searchPattern},brand.ilike.${searchPattern}`);

    if (productsError) {
      console.error('🔍 supabaseApi - Products search error:', productsError);
      throw productsError;
    }

    console.log('🔍 supabaseApi - Products found:', productsData?.length || 0);
    
    return productsData.map(product => ({
      id: product.id,
      title: product.title,
      category: product.categories.name,
      price: parseFloat(product.price),
      discount: product.discount,
      brand: product.brand,
      stock: product.stock,
      image: product.image_url
    }));

  } catch (error) {
    console.error('🔍 supabaseApi - Error searching products:', error);
    return [];
  }
};