// src/pages/CategoryProductPage/CategoryProductPage.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import ProductList from '../../components/ProductList/ProductList';
import { 
  fetchProductsByCategory, 
  getCategoryProducts
} from '../../store/categorySlice';

const CategoryProductPage = () => {
  const dispatch = useDispatch();
  const { category } = useParams();
  const categoryProducts = useSelector(state => 
    getCategoryProducts(state, category)
  );

  console.log('CategoryProductPage - Params:', useParams());
  console.log('CategoryProductPage - category from URL:', category);
  console.log('CategoryProductPage - categoryProducts:', categoryProducts);

  useEffect(() => {
    console.log('CategoryProductPage - useEffect triggered, category:', category);

    if (category && category !== 'undefined') {
      console.log('CategoryProductPage - Fetching products for:', category);
      dispatch(fetchProductsByCategory(category))
        .then((result) => {
          console.log('CategoryProductPage - Fetch completed:', result);
        })
        .catch((error) => {
          console.error('CategoryProductPage - Fetch failed:', error);
        });
    } else {
      console.warn('CategoryProductPage - category is undefined or invalid');
    }
  }, [dispatch, category]);

  // Estado de carga 
  if (!category || category === 'undefined') {
    return (
      <div className='container' style={{ minHeight: "70vh" }}>
        <div className='fw-5 text-danger py-5'>
          <h3>Error: Categoría no especificada</h3>
          <p>No se pudo determinar la categoría a mostrar.</p>
        </div>
      </div>
    );
  }

  if (!categoryProducts || categoryProducts.length === 0) {
    return (
      <div className='container' style={{ minHeight: "70vh" }}>
        <div className='fw-5 text-danger py-5'>
          <h3>Cargando productos de {category}...</h3>
          <p>Por favor espera un momento.</p>
          <p><small>Debug: category = "{category}"</small></p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <div className='category-products-content bg-whitesmoke'>
        <div className='container'>
          <div className='py-5'>
            <div className='title-md'>
              <h3>Productos de: {category}</h3>
              <p>Se encontraron {categoryProducts.length} productos</p>
            </div>
            <br />
            <ProductList products={categoryProducts} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default CategoryProductPage;