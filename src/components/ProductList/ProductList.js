// src/components/ProductList/ProductList.js
import React from 'react';
import "./ProductList.scss";
import Product from "../Product/Product";
import { calculateFinalPrice, hasDiscount } from '../../utils/productUtils'; // ← Nuevo import

const ProductList = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className='no-products text-center py-4'>
        <p>No hay productos disponibles en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className='product-lists grid bg-whitesmoke my-3'>
      {products.map(product => {
        const finalPrice = calculateFinalPrice(product.price, product.discount);
        
        return (
          <Product 
            key={product.id} 
            product={{
              ...product, 
              finalPrice: finalPrice,
              hasDiscount: hasDiscount(product.discount)
            }} 
          />
        );
      })}
    </div>
  )
}

export default ProductList;