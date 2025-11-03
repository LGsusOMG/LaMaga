// src/pages/Admin/AdminProducts.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../data/supabaseClient';
import { Link } from 'react-router-dom';
import './AdminProducts.scss';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name)
      `)
      .order('created_at', { ascending: false });

    if (!error) {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      loadProducts(); // Recargar la lista
    }
  };

  if (loading) return <div>Cargando productos...</div>;

  return (
    <div className="admin-products">
      <div className="admin-header">
        <h1>Gestión de Productos</h1>
        <Link to="/admin/products/new" className="btn-primary">
          + Nuevo Producto
        </Link>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="product-thumb"
                  />
                </td>
                <td>{product.title}</td>
                <td>{product.categories?.name}</td>
                <td>${product.price}</td>
                <td>{product.stock}</td>
                <td className="actions">
                  <Link 
                    to={`/admin/products/edit/${product.id}`}
                    className="btn-edit"
                  >
                    Editar
                  </Link>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="btn-delete"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;