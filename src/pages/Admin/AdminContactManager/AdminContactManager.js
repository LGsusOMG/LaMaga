// src/pages/Admin/AdminContactManager/AdminContactManager.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../data/supabaseClient';
import './AdminContactManager.scss';

const AdminContactManager = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contactInfo, setContactInfo] = useState([]);
    const [socialLinks, setSocialLinks] = useState([]);
    const [activeTab, setActiveTab] = useState('contact'); // 'contact' o 'social'
    const [editingItem, setEditingItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    // Formulario para información de contacto
    const [contactForm, setContactForm] = useState({
        type: 'phone',
        label: '',
        value: '',
        icon: 'bi-telephone-fill',
        is_active: true,
        display_order: 0
    });

    // Formulario para redes sociales
    const [socialForm, setSocialForm] = useState({
        name: '',
        url: '',
        icon: 'bi-facebook',
        color: '#1877f2',
        is_active: true,
        display_order: 0
    });

    useEffect(() => {
        checkAuth();
        loadData();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/admin/login');
            return;
        }
        setUser(user);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            // Cargar información de contacto
            const { data: contactData, error: contactError } = await supabase
                .from('contact_info')
                .select('*')
                .order('display_order', { ascending: true });

            if (contactError) throw contactError;
            setContactInfo(contactData || []);

            // Cargar redes sociales
            const { data: socialData, error: socialError } = await supabase
                .from('contact_social_links')
                .select('*')
                .order('display_order', { ascending: true });

            if (socialError) throw socialError;
            setSocialLinks(socialData || []);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    // Manejadores para información de contacto
    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingItem) {
                const { error } = await supabase
                    .from('contact_info')
                    .update(contactForm)
                    .eq('id', editingItem.id);

                if (error) throw error;
                alert('Información actualizada exitosamente');
            } else {
                const { error } = await supabase
                    .from('contact_info')
                    .insert([contactForm]);

                if (error) throw error;
                alert('Información agregada exitosamente');
            }

            resetContactForm();
            setShowModal(false);
            loadData();
        } catch (error) {
            console.error('Error saving contact info:', error);
            alert('Error al guardar la información');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteContact = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este elemento?')) return;

        try {
            const { error } = await supabase
                .from('contact_info')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('Elemento eliminado exitosamente');
            loadData();
        } catch (error) {
            console.error('Error deleting contact info:', error);
            alert('Error al eliminar el elemento');
        }
    };

    // Manejadores para redes sociales
    const handleSocialSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingItem) {
                const { error } = await supabase
                    .from('contact_social_links')
                    .update(socialForm)
                    .eq('id', editingItem.id);

                if (error) throw error;
                alert('Red social actualizada exitosamente');
            } else {
                const { error } = await supabase
                    .from('contact_social_links')
                    .insert([socialForm]);

                if (error) throw error;
                alert('Red social agregada exitosamente');
            }

            resetSocialForm();
            setShowModal(false);
            loadData();
        } catch (error) {
            console.error('Error saving social link:', error);
            alert('Error al guardar la red social');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSocial = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta red social?')) return;

        try {
            const { error } = await supabase
                .from('contact_social_links')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('Red social eliminada exitosamente');
            loadData();
        } catch (error) {
            console.error('Error deleting social link:', error);
            alert('Error al eliminar la red social');
        }
    };

    const resetContactForm = () => {
        setContactForm({
            type: 'phone',
            label: '',
            value: '',
            icon: 'bi-telephone-fill',
            is_active: true,
            display_order: 0
        });
        setEditingItem(null);
    };

    const resetSocialForm = () => {
        setSocialForm({
            name: '',
            url: '',
            icon: 'bi-facebook',
            color: '#1877f2',
            is_active: true,
            display_order: 0
        });
        setEditingItem(null);
    };

    const openEditModal = (item, isContact) => {
        setEditingItem(item);
        if (isContact) {
            setContactForm(item);
            setActiveTab('contact');
        } else {
            setSocialForm(item);
            setActiveTab('social');
        }
        setShowModal(true);
    };

    const getIconOptions = (type) => {
        const icons = {
            phone: [
                { value: 'bi-telephone-fill', label: 'Teléfono' },
                { value: 'bi-phone', label: 'Móvil' },
                { value: 'bi-whatsapp', label: 'WhatsApp' }
            ],
            email: [
                { value: 'bi-envelope-fill', label: 'Sobre' },
                { value: 'bi-at', label: 'Arroba' },
                { value: 'bi-mailbox', label: 'Buzón' }
            ],
            address: [
                { value: 'bi-geo-alt-fill', label: 'Pin' },
                { value: 'bi-map', label: 'Mapa' },
                { value: 'bi-house-door-fill', label: 'Casa' }
            ],
            social: [
                { value: 'bi-facebook', label: 'Facebook' },
                { value: 'bi-instagram', label: 'Instagram' },
                { value: 'bi-twitter-x', label: 'Twitter/X' },
                { value: 'bi-whatsapp', label: 'WhatsApp' },
                { value: 'bi-youtube', label: 'YouTube' },
                { value: 'bi-tiktok', label: 'TikTok' },
                { value: 'bi-linkedin', label: 'LinkedIn' }
            ]
        };
        return icons[type] || icons.phone;
    };

    return (
        <div className="admin-contact-manager">
            <header className="admin-header">
                <div className="header-content">
                    <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
                        <i className="bi bi-arrow-left"></i>
                        Volver al Dashboard
                    </button>
                    <h1>Gestión de Información de Contacto</h1>
                </div>
            </header>

            <div className="contact-manager-content">
                {/* Tabs */}
                <div className="tabs-container">
                    <button
                        className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contact')}
                    >
                        <i className="bi bi-info-circle"></i>
                        Información de Contacto
                    </button>
                    <button
                        className={`tab ${activeTab === 'social' ? 'active' : ''}`}
                        onClick={() => setActiveTab('social')}
                    >
                        <i className="bi bi-share"></i>
                        Redes Sociales
                    </button>
                </div>

                {/* Información de Contacto */}
                {activeTab === 'contact' && (
                    <div className="content-section">
                        <div className="section-header">
                            <h2>Información de Contacto</h2>
                            <button
                                className="add-btn"
                                onClick={() => {
                                    resetContactForm();
                                    setShowModal(true);
                                }}
                            >
                                <i className="bi bi-plus-lg"></i>
                                Agregar Información
                            </button>
                        </div>

                        <div className="items-grid">
                            {contactInfo.map((item) => (
                                <div key={item.id} className={`item-card ${!item.is_active ? 'inactive' : ''}`}>
                                    <div className="item-icon">
                                        <i className={`bi ${item.icon}`}></i>
                                    </div>
                                    <div className="item-info">
                                        <span className="item-type">{item.type}</span>
                                        <h3>{item.label}</h3>
                                        <p>{item.value}</p>
                                        <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
                                            {item.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <div className="item-actions">
                                        <button
                                            onClick={() => openEditModal(item, true)}
                                            className="edit-btn"
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteContact(item.id)}
                                            className="delete-btn"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Redes Sociales */}
                {activeTab === 'social' && (
                    <div className="content-section">
                        <div className="section-header">
                            <h2>Redes Sociales</h2>
                            <button
                                className="add-btn"
                                onClick={() => {
                                    resetSocialForm();
                                    setShowModal(true);
                                }}
                            >
                                <i className="bi bi-plus-lg"></i>
                                Agregar Red Social
                            </button>
                        </div>

                        <div className="items-grid">
                            {socialLinks.map((item) => (
                                <div key={item.id} className={`item-card social ${!item.is_active ? 'inactive' : ''}`}>
                                    <div className="item-icon" style={{ backgroundColor: item.color }}>
                                        <i className={`bi ${item.icon}`}></i>
                                    </div>
                                    <div className="item-info">
                                        <h3>{item.name}</h3>
                                        <p className="url">{item.url}</p>
                                        <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
                                            {item.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <div className="item-actions">
                                        <button
                                            onClick={() => openEditModal(item, false)}
                                            className="edit-btn"
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSocial(item.id)}
                                            className="delete-btn"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {editingItem ? 'Editar' : 'Agregar'}{' '}
                                {activeTab === 'contact' ? 'Información' : 'Red Social'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="close-btn">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        {activeTab === 'contact' ? (
                            <form onSubmit={handleContactSubmit} className="modal-form">
                                <div className="form-group">
                                    <label>Tipo</label>
                                    <select
                                        value={contactForm.type}
                                        onChange={(e) => {
                                            const type = e.target.value;
                                            setContactForm({
                                                ...contactForm,
                                                type,
                                                icon: getIconOptions(type)[0].value
                                            });
                                        }}
                                        required
                                    >
                                        <option value="phone">Teléfono</option>
                                        <option value="email">Correo Electrónico</option>
                                        <option value="address">Dirección</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Etiqueta</label>
                                    <input
                                        type="text"
                                        value={contactForm.label}
                                        onChange={(e) => setContactForm({ ...contactForm, label: e.target.value })}
                                        placeholder="ej: Teléfono Principal"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Valor</label>
                                    <input
                                        type="text"
                                        value={contactForm.value}
                                        onChange={(e) => setContactForm({ ...contactForm, value: e.target.value })}
                                        placeholder={
                                            contactForm.type === 'phone' ? '+52 668 123 4567' :
                                            contactForm.type === 'email' ? 'info@lamaga.com' :
                                            'Alhuey, Angostura, Sinaloa'
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Ícono</label>
                                    <select
                                        value={contactForm.icon}
                                        onChange={(e) => setContactForm({ ...contactForm, icon: e.target.value })}
                                        required
                                    >
                                        {getIconOptions(contactForm.type).map((icon) => (
                                            <option key={icon.value} value={icon.value}>
                                                {icon.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Orden de visualización</label>
                                    <input
                                        type="number"
                                        value={contactForm.display_order}
                                        onChange={(e) => setContactForm({ ...contactForm, display_order: parseInt(e.target.value) })}
                                        min="0"
                                    />
                                </div>

                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={contactForm.is_active}
                                            onChange={(e) => setContactForm({ ...contactForm, is_active: e.target.checked })}
                                        />
                                        Activo
                                    </label>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="submit-btn" disabled={loading}>
                                        {loading ? 'Guardando...' : editingItem ? 'Actualizar' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleSocialSubmit} className="modal-form">
                                <div className="form-group">
                                    <label>Nombre de la red social</label>
                                    <input
                                        type="text"
                                        value={socialForm.name}
                                        onChange={(e) => setSocialForm({ ...socialForm, name: e.target.value })}
                                        placeholder="ej: Facebook"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>URL</label>
                                    <input
                                        type="url"
                                        value={socialForm.url}
                                        onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                                        placeholder="https://facebook.com/tupagina"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Ícono</label>
                                    <select
                                        value={socialForm.icon}
                                        onChange={(e) => setSocialForm({ ...socialForm, icon: e.target.value })}
                                        required
                                    >
                                        {getIconOptions('social').map((icon) => (
                                            <option key={icon.value} value={icon.value}>
                                                {icon.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Color</label>
                                    <input
                                        type="color"
                                        value={socialForm.color}
                                        onChange={(e) => setSocialForm({ ...socialForm, color: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Orden de visualización</label>
                                    <input
                                        type="number"
                                        value={socialForm.display_order}
                                        onChange={(e) => setSocialForm({ ...socialForm, display_order: parseInt(e.target.value) })}
                                        min="0"
                                    />
                                </div>

                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={socialForm.is_active}
                                            onChange={(e) => setSocialForm({ ...socialForm, is_active: e.target.checked })}
                                        />
                                        Activo
                                    </label>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="submit-btn" disabled={loading}>
                                        {loading ? 'Guardando...' : editingItem ? 'Actualizar' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminContactManager;