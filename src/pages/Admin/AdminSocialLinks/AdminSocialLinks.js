// src/pages/Admin/AdminSocialLinks/AdminSocialLinks.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../data/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './AdminSocialLinks.scss';

const AdminSocialLinks = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  

  // Estado para nuevo link
  const [newLink, setNewLink] = useState({
    name: '',
    url: '',
    icon: 'bi-link-45deg',
    color: '#667eea',
    is_active: true
  });

  // Estado para editar link
  const [editingLink, setEditingLink] = useState(null);
  const [editLink, setEditLink] = useState({
    name: '',
    url: '',
    icon: '',
    color: '',
    is_active: true
  });

  // Iconos disponibles de Bootstrap Icons
  const availableIcons = [
    { value: 'bi-facebook', label: 'Facebook', preview: '󰈌' },
    { value: 'bi-instagram', label: 'Instagram', preview: '󰋾' },
    { value: 'bi-twitter-x', label: 'Twitter/X', preview: '󰕄' },
    { value: 'bi-whatsapp', label: 'WhatsApp', preview: '󰖣' },
    { value: 'bi-youtube', label: 'YouTube', preview: '󰗃' },
    { value: 'bi-linkedin', label: 'LinkedIn', preview: '󰌻' },
    { value: 'bi-tiktok', label: 'TikTok', preview: '󰄯' },
    { value: 'bi-telegram', label: 'Telegram', preview: '󰔷' },
    { value: 'bi-discord', label: 'Discord', preview: '󰙯' },
    { value: 'bi-github', label: 'GitHub', preview: '󰊤' },
    { value: 'bi-link-45deg', label: 'Link genérico', preview: '󰌷' }
  ];

  useEffect(() => {
    checkAuthAndLoadRole();
    loadSocialLinks();
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

  const loadSocialLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error) {
      console.error('Error loading social links:', error);
      alert('Error al cargar enlaces sociales');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();

    if (!newLink.name || !newLink.url) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validar formato de URL
    try {
      new URL(newLink.url);
    } catch {
      alert('Por favor ingresa una URL válida');
      return;
    }

    setSubmitting(true);

    try {
      const maxOrder = socialLinks.length > 0 
        ? Math.max(...socialLinks.map(link => link.display_order || 0))
        : 0;

      const { error } = await supabase
        .from('social_links')
        .insert([{
          ...newLink,
          display_order: maxOrder + 1
        }]);

      if (error) throw error;

      alert('Enlace social creado exitosamente');
      setShowModal(false);
      setNewLink({
        name: '',
        url: '',
        icon: 'bi-link-45deg',
        color: '#667eea',
        is_active: true
      });
      loadSocialLinks();
    } catch (error) {
      console.error('Error creating social link:', error);
      alert('Error al crear enlace: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditLink = async (e) => {
    e.preventDefault();

    if (!editLink.name || !editLink.url) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validar formato de URL
    try {
      new URL(editLink.url);
    } catch {
      alert('Por favor ingresa una URL válida');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('social_links')
        .update({
          name: editLink.name,
          url: editLink.url,
          icon: editLink.icon,
          color: editLink.color,
          is_active: editLink.is_active
        })
        .eq('id', editingLink.id);

      if (error) throw error;

      alert('Enlace actualizado exitosamente');
      setShowEditModal(false);
      setEditingLink(null);
      loadSocialLinks();
    } catch (error) {
      console.error('Error updating social link:', error);
      alert('Error al actualizar enlace: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLink = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar el enlace "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Enlace eliminado exitosamente');
      loadSocialLinks();
    } catch (error) {
      console.error('Error deleting social link:', error);
      alert('Error al eliminar enlace: ' + error.message);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadSocialLinks();
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('Error al cambiar estado: ' + error.message);
    }
  };

  const openEditModal = (link) => {
    setEditingLink(link);
    setEditLink({
      name: link.name,
      url: link.url,
      icon: link.icon,
      color: link.color,
      is_active: link.is_active
    });
    setShowEditModal(true);
  };

  const canManageLinks = ['superadmin', 'admin'].includes(currentUserRole);

  if (loading || currentUserRole === null) {
    return (
      <div className="admin-social-links">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando enlaces sociales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-social-links">
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
              <h1>Gestión de Redes Sociales</h1>
              <p className="subtitle">{socialLinks.length} enlaces configurados</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
            disabled={!canManageLinks}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Nuevo Enlace
          </button>
        </div>

        {socialLinks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔗</div>
            <h3>No hay enlaces sociales</h3>
            <p>Comienza agregando tu primer enlace social</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
              disabled={!canManageLinks}
            >
              Crear Enlace
            </button>
          </div>
        ) : (
          <div className="links-grid">
            {socialLinks.map(link => (
              <div key={link.id} className={`link-card ${!link.is_active ? 'inactive' : ''}`}>
                <div className="link-header">
                  <div 
                    className="link-icon" 
                    style={{ backgroundColor: link.color }}
                  >
                    <i className={`bi ${link.icon}`}></i>
                  </div>
                  <div className="link-status">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={link.is_active}
                        onChange={() => handleToggleActive(link.id, link.is_active)}
                        disabled={!canManageLinks}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className="status-label">
                      {link.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="link-content">
                  <h3 className="link-name">{link.name}</h3>
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="link-url"
                  >
                    {link.url}
                    <i className="bi bi-box-arrow-up-right"></i>
                  </a>
                </div>

                <div className="link-actions">
                  <button
                    onClick={() => openEditModal(link)}
                    className="btn-edit"
                    disabled={!canManageLinks}
                  >
                    <i className="bi bi-pencil-fill"></i>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id, link.name)}
                    className="btn-delete"
                    disabled={!canManageLinks}
                  >
                    <i className="bi bi-trash-fill"></i>
                    Eliminar
                  </button>
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
                <h2>Nuevo Enlace Social</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateLink} className="modal-form">
                <div className="form-group">
                  <label htmlFor="name">
                    Nombre de la Red Social <span className="required">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={newLink.name}
                    onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                    placeholder="Ej: Facebook, Instagram"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="url">
                    URL <span className="required">*</span>
                  </label>
                  <input
                    id="url"
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder="https://www.ejemplo.com"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="icon">
                      Icono <span className="required">*</span>
                    </label>
                    <select
                      id="icon"
                      value={newLink.icon}
                      onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                      required
                    >
                      {availableIcons.map(icon => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="color">
                      Color <span className="required">*</span>
                    </label>
                    <input
                      id="color"
                      type="color"
                      value={newLink.color}
                      onChange={(e) => setNewLink({ ...newLink, color: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newLink.is_active}
                      onChange={(e) => setNewLink({ ...newLink, is_active: e.target.checked })}
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
                        Crear Enlace
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar */}
        {showEditModal && editingLink && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Editar Enlace Social</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditLink} className="modal-form">
                <div className="form-group">
                  <label htmlFor="edit-name">
                    Nombre de la Red Social <span className="required">*</span>
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editLink.name}
                    onChange={(e) => setEditLink({ ...editLink, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-url">
                    URL <span className="required">*</span>
                  </label>
                  <input
                    id="edit-url"
                    type="url"
                    value={editLink.url}
                    onChange={(e) => setEditLink({ ...editLink, url: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-icon">
                      Icono <span className="required">*</span>
                    </label>
                    <select
                      id="edit-icon"
                      value={editLink.icon}
                      onChange={(e) => setEditLink({ ...editLink, icon: e.target.value })}
                      required
                    >
                      {availableIcons.map(icon => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-color">
                      Color <span className="required">*</span>
                    </label>
                    <input
                      id="edit-color"
                      type="color"
                      value={editLink.color}
                      onChange={(e) => setEditLink({ ...editLink, color: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editLink.is_active}
                      onChange={(e) => setEditLink({ ...editLink, is_active: e.target.checked })}
                    />
                    <span>Enlace activo</span>
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

export default AdminSocialLinks;