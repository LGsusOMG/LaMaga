// src/pages/Admin/AdminProductForm/AdminProductForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../data/supabaseClient';
import ImageUpload from '../../../components/Admin/ImageUpload/ImageUpload';
import './AdminProductForm.scss';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    price: '',
    discount: 0,
    stock: '',
    category_id: '',
    image_url: '',
    image_path: '',
    is_featured: false
  });

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) {
      setCategories(data);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (data && !error) {
      setFormData({
        title: data.title || '',
        brand: data.brand || '',
        price: data.price || '',
        discount: data.discount || 0,
        stock: data.stock || '',
        category_id: data.category_id || '',
        image_url: data.image_url || '',
        image_path: data.image_path || '',
        is_featured: data.is_featured || false
      });
    }
    setLoading(false);
  };

  const handleImageUpload = (url, path) => {
    setFormData(prev => ({
      ...prev,
      image_url: url,
      image_path: path
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        title: formData.title,
        brand: formData.brand || null,
        price: parseFloat(formData.price),
        discount: parseInt(formData.discount) || 0,
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id),
        image_url: formData.image_url || null,
        image_path: formData.image_path || null,
        is_featured: formData.is_featured
      };

      let error;

      if (isEdit) {
        ({ error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id));
      } else {
        ({ error } = await supabase
          .from('products')
          .insert([productData]));
      }

      if (error) throw error;

      alert(isEdit ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el producto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="admin-product-form">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-product-form">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <Link to="/admin/products" className="back-btn">
            <i className="bi bi-arrow-left"></i>
            Volver a productos
          </Link>
          <h1>{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            {/* Imagen */}
            <div className="form-section full-width">
              <ImageUpload
                currentImageUrl={formData.image_url}
                onImageUpload={handleImageUpload}
                productId={id}
              />
            </div>

            {/* Información básica */}
            <div className="form-section">
              <h3>Información Básica</h3>
              
              <div className="form-group">
                <label htmlFor="title">
                  Nombre del producto <span className="required">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Laptop HP Pavilion 15"
                />
              </div>

              <div className="form-group">
                <label htmlFor="brand">Marca</label>
                <input
                  id="brand"
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Ej: HP, Samsung, Sony"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category_id">
                  Categoría <span className="required">*</span>
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Precio e inventario */}
            <div className="form-section">
              <h3>Precio e Inventario</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">
                    Precio <span className="required">*</span>
                  </label>
                  <div className="input-prefix">
                    <span>$</span>
                    <input
                      id="price"
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="discount">Descuento (%)</label>
                  <div className="input-suffix">
                    <input
                      id="discount"
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="stock">
                  Stock <span className="required">*</span>
                </label>
                <input
                  id="stock"
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="Cantidad disponible"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                  />
                  <span>Producto destacado</span>
                </label>
                <p className="helper-text">
                  Los productos destacados aparecen en la página principal
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <Link to="/admin/products" className="btn-cancel">
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  {isEdit ? 'Actualizar Producto' : 'Crear Producto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;