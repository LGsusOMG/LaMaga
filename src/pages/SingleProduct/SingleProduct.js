// src/pages/SingleProduct/SingleProduct.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../data/supabaseClient';
import Loader from '../../components/Loader/Loader';
import './SingleProduct.scss';

const SingleProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (name)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        setProduct({
          ...data,
          category: data.categories?.name || 'Sin categoría'
        });
      } catch (err) {
        console.error('Error cargando producto:', err);
        setError('No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="error-container">
        <div className="container">
          <div className="error-message">
            <h2>{error}</h2>
            <button onClick={() => navigate(-1)} className="back-btn">
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="error-container">
        <div className="container">
          <div className="error-message">
            <h2>Producto no encontrado</h2>
            <button onClick={() => navigate(-1)} className="back-btn">
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const finalPrice = product.discount > 0 
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : product.price.toFixed(2);

  return (
    <main className="single-product py-5">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn mb-4">
          <i className="fas fa-arrow-left"></i> Volver
        </button>
        
        <div className="product-detail-card">
          <div className="product-images">
            <div className="main-image">
              <img 
                src={product.image_url || 'https://via.placeholder.com/500x500?text=Sin+Imagen'} 
                alt={product.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x500?text=Sin+Imagen';
                }}
              />
            </div>
          </div>
          
          <div className="product-details">
            <div className="product-header">
              <span className="category-badge">
                <i className="fas fa-tag"></i> {product.category}
              </span>
              <h1 className="product-title">{product.title}</h1>
              <p className="product-brand">
                <span className="label">Marca:</span> 
                <span className="value">{product.brand || 'Genérico'}</span>
              </p>
            </div>
            
            <div className="price-section">
              {product.discount > 0 ? (
                <div className="price-with-discount">
                  <div className="prices">
                    <span className="old-price">${parseFloat(product.price).toFixed(2)}</span>
                    <span className="new-price">${finalPrice}</span>
                  </div>
                  <span className="discount-badge">
                    <i className="fas fa-percentage"></i> {product.discount}% OFF
                  </span>
                  <p className="savings">
                    Ahorras: ${(product.price - finalPrice).toFixed(2)}
                  </p>
                </div>
              ) : (
                <div className="price-regular">
                  <span className="new-price">${finalPrice}</span>
                </div>
              )}
            </div>

            <div className="stock-section">
              {product.stock > 0 ? (
                <div className="in-stock">
                  <i className="fas fa-check-circle"></i>
                  <span>En stock - {product.stock} {product.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}</span>
                </div>
              ) : (
                <div className="out-of-stock">
                  <i className="fas fa-times-circle"></i>
                  <span>Producto agotado</span>
                </div>
              )}
            </div>

            {product.description && (
              <div className="description-section">
                <h3>Descripción del producto</h3>
                <p>{product.description}</p>
              </div>
            )}

            <div className="actions">
              <button className="btn-share">
                <i className="fas fa-share-alt"></i>
                Compartir
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SingleProduct;