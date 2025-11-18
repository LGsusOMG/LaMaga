// src/pages/Admin/AdminSlides/AdminSlides.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../data/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './AdminSlides.scss';

const AdminSlides = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Estado para nuevo slide
  const [newSlide, setNewSlide] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    text_align: 'left',
    button_text: '',
    button_link: '',
    is_active: true
  });

  // Estado para editar slide
  const [editingSlide, setEditingSlide] = useState(null);
  const [editSlide, setEditSlide] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    text_align: 'left',
    button_text: '',
    button_link: '',
    is_active: true
  });

  const alignOptions = [
    { value: 'left', label: 'Izquierda', icon: 'bi-align-start' },
    { value: 'center', label: 'Centro', icon: 'bi-align-center' },
    { value: 'right', label: 'Derecha', icon: 'bi-align-end' }
  ];

  useEffect(() => {
    checkAuthAndLoadRole();
    loadSlides();
  }, []);

  useEffect(() => {
    if (currentUserRole && !['superadmin', 'admin'].includes(currentUserRole)) {
      navigate('/admin/dashboard');
      alert('No tienes permisos para acceder a esta sección');
    }
  }, [currentUserRole, navigate]);

  const checkAuthAndLoadRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('role')
        .eq('email', user.email)
        .single();

      if (error) throw error;
      if (data) {
        setCurrentUserRole(data.role);
      }
    } catch (error) {
      console.error('Error loading current user role:', error);
      alert('Error al obtener el rol. Por favor, vuelve a iniciar sesión.');
      navigate('/admin/login');
    }
  };

  const loadSlides = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('header_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error loading slides:', error);
      alert('Error al cargar slides');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlide = async (e) => {
    e.preventDefault();

    if (!newSlide.title || !newSlide.image_url) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validar URL de imagen
    try {
      new URL(newSlide.image_url);
    } catch {
      alert('Por favor ingresa una URL de imagen válida');
      return;
    }

    // Validar URL del botón si existe
    if (newSlide.button_link) {
      try {
        new URL(newSlide.button_link);
      } catch {
        alert('Por favor ingresa una URL de enlace válida');
        return;
      }
    }

    setSubmitting(true);

    try {
      const maxOrder = slides.length > 0 
        ? Math.max(...slides.map(slide => slide.display_order || 0))
        : 0;

      const { error } = await supabase
        .from('header_slides')
        .insert([{
          ...newSlide,
          display_order: maxOrder + 1
        }]);

      if (error) throw error;

      alert('Slide creado exitosamente');
      setShowModal(false);
      setNewSlide({
        title: '',
        subtitle: '',
        image_url: '',
        text_align: 'left',
        button_text: '',
        button_link: '',
        is_active: true
      });
      loadSlides();
    } catch (error) {
      console.error('Error creating slide:', error);
      alert('Error al crear slide: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSlide = async (e) => {
    e.preventDefault();

    if (!editSlide.title || !editSlide.image_url) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validar URLs
    try {
      new URL(editSlide.image_url);
      if (editSlide.button_link) {
        new URL(editSlide.button_link);
      }
    } catch {
      alert('Por favor ingresa URLs válidas');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('header_slides')
        .update({
          title: editSlide.title,
          subtitle: editSlide.subtitle,
          image_url: editSlide.image_url,
          text_align: editSlide.text_align,
          button_text: editSlide.button_text,
          button_link: editSlide.button_link,
          is_active: editSlide.is_active
        })
        .eq('id', editingSlide.id);

      if (error) throw error;

      alert('Slide actualizado exitosamente');
      setShowEditModal(false);
      setEditingSlide(null);
      loadSlides();
    } catch (error) {
      console.error('Error updating slide:', error);
      alert('Error al actualizar slide: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlide = async (id, title) => {
    if (!window.confirm(`¿Estás seguro de eliminar el slide "${title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('header_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Slide eliminado exitosamente');
      loadSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
      alert('Error al eliminar slide: ' + error.message);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('header_slides')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadSlides();
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('Error al cambiar estado: ' + error.message);
    }
  };

  const openEditModal = (slide) => {
    setEditingSlide(slide);
    setEditSlide({
      title: slide.title,
      subtitle: slide.subtitle || '',
      image_url: slide.image_url,
      text_align: slide.text_align,
      button_text: slide.button_text || '',
      button_link: slide.button_link || '',
      is_active: slide.is_active
    });
    setShowEditModal(true);
  };

  const canManageSlides = ['superadmin', 'admin'].includes(currentUserRole);

  if (loading || currentUserRole === null) {
    return (
      <div className="admin-slides">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando slides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-slides">
      <div className="admin-container">
        <div className="page-header">
          <div className="header-left">
            <Link to="/admin/dashboard" className="back-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Volver
            </Link>
            <div>
              <h1>Gestión de Slides</h1>
              <p className="subtitle">{slides.length} slides configurados</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
            disabled={!canManageSlides}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Nuevo Slide
          </button>
        </div>

        {slides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🖼️</div>
            <h3>No hay slides</h3>
            <p>Comienza agregando tu primer slide al header</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
              disabled={!canManageSlides}
            >
              Crear Slide
            </button>
          </div>
        ) : (
          <div className="slides-grid">
            {slides.map(slide => (
              <div key={slide.id} className={`slide-card ${!slide.is_active ? 'inactive' : ''}`}>
                <div className="slide-preview">
                  <img src={slide.image_url} alt={slide.title} />
                  <div className="slide-overlay">
                    <div className={`slide-text-preview align-${slide.text_align}`}>
                      <h3>{slide.title}</h3>
                      {slide.subtitle && <p>{slide.subtitle}</p>}
                    </div>
                  </div>
                </div>

                <div className="slide-info">
                  <div className="slide-header">
                    <div className="slide-meta">
                      <h4 className="slide-title">{slide.title}</h4>
                      <div className="slide-badges">
                        <span className={`badge align-badge ${slide.text_align}`}>
                          <i className={alignOptions.find(o => o.value === slide.text_align)?.icon}></i>
                          {alignOptions.find(o => o.value === slide.text_align)?.label}
                        </span>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={slide.is_active}
                        onChange={() => handleToggleActive(slide.id, slide.is_active)}
                        disabled={!canManageSlides}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {slide.subtitle && (
                    <p className="slide-subtitle">{slide.subtitle}</p>
                  )}

                  <div className="slide-actions">
                    <button
                      onClick={() => openEditModal(slide)}
                      className="btn-edit"
                      disabled={!canManageSlides}
                    >
                      <i className="bi bi-pencil-fill"></i>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id, slide.title)}
                      className="btn-delete"
                      disabled={!canManageSlides}
                    >
                      <i className="bi bi-trash-fill"></i>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Crear */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nuevo Slide</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateSlide} className="modal-form">
                <div className="form-group">
                  <label htmlFor="title">
                    Título <span className="required">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={newSlide.title}
                    onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                    placeholder="Ej: Ofertas Especiales"
                    required
                    maxLength={200}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subtitle">Subtítulo</label>
                  <input
                    id="subtitle"
                    type="text"
                    value={newSlide.subtitle}
                    onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                    placeholder="Ej: Hasta 20% de descuento"
                    maxLength={300}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="image_url">
                    URL de Imagen <span className="required">*</span>
                  </label>
                  <input
                    id="image_url"
                    type="url"
                    value={newSlide.image_url}
                    onChange={(e) => setNewSlide({ ...newSlide, image_url: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    required
                  />
                  <p className="helper-text">
                    Usa una imagen de alta resolución (1920x800px recomendado)
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="text_align">Alineación del Texto</label>
                  <div className="align-selector">
                    {alignOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`align-btn ${newSlide.text_align === option.value ? 'active' : ''}`}
                        onClick={() => setNewSlide({ ...newSlide, text_align: option.value })}
                      >
                        <i className={`bi ${option.icon}`}></i>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="button_text">Texto del Botón</label>
                    <input
                      id="button_text"
                      type="text"
                      value={newSlide.button_text}
                      onChange={(e) => setNewSlide({ ...newSlide, button_text: e.target.value })}
                      placeholder="Ver más"
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="button_link">Enlace del Botón</label>
                    <input
                      id="button_link"
                      type="url"
                      value={newSlide.button_link}
                      onChange={(e) => setNewSlide({ ...newSlide, button_link: e.target.value })}
                      placeholder="/products"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newSlide.is_active}
                      onChange={(e) => setNewSlide({ ...newSlide, is_active: e.target.checked })}
                    />
                    <span>Activar inmediatamente</span>
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="btn-spinner"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Crear Slide
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar - Similar estructura */}
        {showEditModal && editingSlide && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Editar Slide</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSlide} className="modal-form">
                {/* Mismos campos que en crear */}
                <div className="form-group">
                  <label htmlFor="edit-title">
                    Título <span className="required">*</span>
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    value={editSlide.title}
                    onChange={(e) => setEditSlide({ ...editSlide, title: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-subtitle">Subtítulo</label>
                  <input
                    id="edit-subtitle"
                    type="text"
                    value={editSlide.subtitle}
                    onChange={(e) => setEditSlide({ ...editSlide, subtitle: e.target.value })}
                    maxLength={300}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-image_url">
                    URL de Imagen <span className="required">*</span>
                  </label>
                  <input
                    id="edit-image_url"
                    type="url"
                    value={editSlide.image_url}
                    onChange={(e) => setEditSlide({ ...editSlide, image_url: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Alineación del Texto</label>
                  <div className="align-selector">
                    {alignOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`align-btn ${editSlide.text_align === option.value ? 'active' : ''}`}
                        onClick={() => setEditSlide({ ...editSlide, text_align: option.value })}
                      >
                        <i className={`bi ${option.icon}`}></i>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-button_text">Texto del Botón</label>
                    <input
                      id="edit-button_text"
                      type="text"
                      value={editSlide.button_text}
                      onChange={(e) => setEditSlide({ ...editSlide, button_text: e.target.value })}
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-button_link">Enlace del Botón</label>
                    <input
                      id="edit-button_link"
                      type="url"
                      value={editSlide.button_link}
                      onChange={(e) => setEditSlide({ ...editSlide, button_link: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editSlide.is_active}
                      onChange={(e) => setEditSlide({ ...editSlide, is_active: e.target.checked })}
                    />
                    <span>Slide activo</span>
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="btn-spinner"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSlides;