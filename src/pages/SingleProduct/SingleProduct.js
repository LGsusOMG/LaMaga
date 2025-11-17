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
  const [imageLoaded, setImageLoaded] = useState(false);

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Mira este producto: ${product.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error al compartir:', err);
      }
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  if (loading) return <Loader />;
  
  if (error) {
    return (
      <div className="error-container">
        <div className="container">
          <div className="error-message">
            <h2>{error}</h2>
            <button onClick={() => navigate(-1)} className="back-btn">
              <i className="fas fa-arrow-left"></i> Volver
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
              <i className="fas fa-arrow-left"></i> Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const finalPrice = product.discount > 0 
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : parseFloat(product.price).toFixed(2);

  // Determinar la URL de la imagen
  const imageUrl = product.image_url || 'https://placehold.co/500x500/667eea/white?text=Sin+Imagen';

  return (
    <main className="single-product py-5">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn mb-4">
          <i className="bi bi-arrow-left"></i> Volver
        </button>
        
        <div className="product-detail-card">
          <div className="product-images">
            <div className="main-image">
              {!imageLoaded && (
                <div className="image-skeleton">
                  <i className="fas fa-image"></i>
                  <p>Cargando imagen...</p>
                </div>
              )}
              <img 
                src={imageUrl}
                alt={product.title}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  setImageLoaded(true);
                  e.target.src = 'https://placehold.co/500x500/667eea/white?text=Sin+Imagen';
                }}
                style={{
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease'
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
                    Ahorras: ${(parseFloat(product.price) - parseFloat(finalPrice)).toFixed(2)}
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
              <button className="btn-share" onClick={handleShare}>
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