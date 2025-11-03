import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProductList from '../ProductList/ProductList';
import Loader from '../Loader/Loader';
import './ProductShowcase.scss';
import { 
  loadProducts, 
  loadProductsByCategory,
  getAllProducts, 
  getIsLoading,
  getError
} from '../../store/productSlice';

const ProductShowcase = ({ limit = 30, category = null, title = null }) => {
  const dispatch = useDispatch();
  const products = useSelector(getAllProducts);
  const isLoading = useSelector(getIsLoading);
  const error = useSelector(getError);

  useEffect(() => {
    if (category) {
      dispatch(loadProductsByCategory({ category, limit }));
    } else {
      dispatch(loadProducts(limit));
    }
  }, [dispatch, limit, category]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="error-message">
        <div className="error-content">
          <i className="bi bi-exclamation-triangle"></i>
          <h3>Error al cargar productos</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            <i className="bi bi-arrow-clockwise"></i>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-showcase">
      <div className="container">
        {(title || category) && (
          <div className="section-header">
            <div className="section-title-wrapper">
              <h2 className="section-title">
                {title || `Productos de ${category}`}
              </h2>
              <div className="title-underline"></div>
            </div>
            <p className="section-subtitle">
              Descubre nuestra selección de productos de alta calidad
            </p>
          </div>
        )}
        <ProductList products={products} />
      </div>
    </div>
  );
};

export default ProductShowcase;