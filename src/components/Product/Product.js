import React, { useState } from 'react';
import "./Product.scss";
import { Link } from 'react-router-dom';

const Product = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!product) {
    return (
      <div className='product-item'>
        <div className='product-placeholder'>
          <i className="bi bi-exclamation-circle"></i>
          <p>Producto no disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className='product-item'>
      {/* Badge de categoría */}
      <div className='category-badge'>
        <i className="bi bi-tag-fill"></i>
        {product.category}
      </div>

      {/* Badge de descuento */}
      {product.hasDiscount && (
        <div className='discount-badge'>
          <span className='discount-percentage'>-{product.discount}%</span>
        </div>
      )}

      {/* Badge de stock */}
      {product.stock <= 5 && product.stock > 0 && (
        <div className='stock-badge'>
          <i className="bi bi-exclamation-triangle"></i>
          ¡Últimas unidades!
        </div>
      )}

      {/* Imagen del producto */}
      <Link to={`/product/${product.id}`} className='product-item-img'>
        <div className={`image-wrapper ${imageLoaded ? 'loaded' : ''}`}>
          {!imageLoaded && !imageError && (
            <div className='image-skeleton'>
              <i className="bi bi-image"></i>
            </div>
          )}
          <img 
            className='img-cover' 
            src={product.image} 
            alt={product.title}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageError(true);
              e.target.src = 'https://via.placeholder.com/300x400?text=Sin+Imagen';
            }}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
          <div className='image-overlay'>
            <div className='overlay-actions'>
              <button className='action-btn' title='Vista rápida'>
                <i className="bi bi-eye"></i>
              </button>
              <button className='action-btn' title='Añadir a favoritos'>
                <i className="bi bi-heart"></i>
              </button>
              <button className='action-btn' title='Comparar'>
                <i className="bi bi-arrow-left-right"></i>
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Información del producto */}
      <div className='product-item-info'>
        {/* Marca */}
        <div className='brand-wrapper'>
          <span className='brand-label'>Marca:</span>
          <span className='brand-name'>{product.brand || 'Genérico'}</span>
        </div>

        {/* Título */}
        <Link to={`/product/${product.id}`} className='title-link'>
          <h3 className='product-title'>
            {product.title}
          </h3>
        </Link>

        {/* Precio */}
        <div className='price-wrapper'>
          {product.hasDiscount ? (
            <div className='price-discount'>
              <span className='old-price'>${product.price.toFixed(2)}</span>
              <span className='new-price'>${product.finalPrice}</span>
            </div>
          ) : (
            <span className='new-price'>${product.price.toFixed(2)}</span>
          )}
        </div>

        {/* Stock */}
        <div className='stock-wrapper'>
          {product.stock > 0 ? (
            <div className='in-stock'>
              <i className="bi bi-check-circle-fill"></i>
              <span>Disponible ({product.stock} unidades)</span>
            </div>
          ) : (
            <div className='out-of-stock'>
              <i className="bi bi-x-circle-fill"></i>
              <span>Agotado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Product