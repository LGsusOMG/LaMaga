// src/pages/Admin/AdminDashboard/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../data/supabaseClient';
import './AdminDashboard.scss';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/admin/login');
                return;
            }
            setUser(user);

            // Cargar el rol del usuario
            try {
                const { data, error } = await supabase
                    .from('admins')
                    .select('role')
                    .eq('email', user.email)
                    .single();

                if (error) throw error;
                if (data) {
                    setUserRole(data.role);
                }
            } catch (error) {
                console.error('Error loading user role:', error);
            }
        };

        const loadStats = async () => {
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            const { count: categoriesCount } = await supabase
                .from('categories')
                .select('*', { count: 'exact', head: true });

            const { count: adminsCount } = await supabase
                .from('admins')
                .select('*', { count: 'exact', head: true });

            // Cargar información de contacto
            const { count: contactInfoCount } = await supabase
                .from('contact_info')
                .select('*', { count: 'exact', head: true });

            // Cargar redes sociales
            const { count: socialLinksCount } = await supabase
                .from('contact_social_links')
                .select('*', { count: 'exact', head: true });

            const { count: slidesCount } = await supabase
                .from('header_slides')
                .select('*', { count: 'exact', head: true });

            // Sumar información de contacto + redes sociales
            const totalContactItems = (contactInfoCount || 0) + (socialLinksCount || 0);

            setStats({
                products: productsCount || 0,
                categories: categoriesCount || 0,
                admins: adminsCount || 0,
                contactItems: totalContactItems,
                slides: slidesCount || 0,
                orders: 0
            });
            setLoading(false);
        };

        checkAuth();
        loadStats();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    // Determinar si el usuario puede gestionar administradores
    const canManageAdmins = userRole === 'superadmin' || userRole === 'admin';

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className='brand-logo-wrapper'>
                            <img src="/favicon.ico" alt="LaMaga Logo" className="brand-logo" />
                        </div>
                        <div>
                            <h1>Panel de Administración</h1>
                            <p className="brand-subtitle">LaMaga</p>
                        </div>
                    </div>
                    <div className="admin-actions">
                        <div className="user-info">
                            <div className="avatar">{user?.email?.charAt(0).toUpperCase()}</div>
                            <div className="user-details">
                                <span className="user-email">{user?.email}</span>
                                {userRole && (
                                    <span className="user-role-badge">{userRole}</span>
                                )}
                            </div>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            <span>Cerrar Sesión</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10.6667 11.3333L14 8L10.6667 4.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <div className="dashboard-content">
                <section className="stats-section">
                    <h2 className="section-title">Resumen General</h2>
                    <div className="dashboard-stats">
                        <div className={`stat-card products ${loading ? 'loading' : ''}`}>
                            <div className="stat-icon">📦</div>
                            <div className="stat-info">
                                <h3>Productos</h3>
                                <p className="stat-number">{stats.products}</p>
                                <p className="stat-description">Productos totales en catálogo</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/products')}
                                className="stat-action"
                            >
                                Gestionar →
                            </button>
                        </div>

                        <div className={`stat-card categories ${loading ? 'loading' : ''}`}>
                            <div className="stat-icon">📂</div>
                            <div className="stat-info">
                                <h3>Categorías</h3>
                                <p className="stat-number">{stats.categories}</p>
                                <p className="stat-description">Categorías disponibles</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/categories')}
                                className="stat-action"
                            >
                                Gestionar →
                            </button>
                        </div>

                        {/* Solo mostrar si tiene permisos */}
                        {canManageAdmins && (
                            <>
                                <div className={`stat-card admins ${loading ? 'loading' : ''}`}>
                                    <div className="stat-icon">👥</div>
                                    <div className="stat-info">
                                        <h3>Administradores</h3>
                                        <p className="stat-number">{stats.admins}</p>
                                        <p className="stat-description">Usuarios con acceso</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/admin/users')}
                                        className="stat-action"
                                    >
                                        Gestionar →
                                    </button>
                                </div>

                                <div className={`stat-card contact ${loading ? 'loading' : ''}`}>
                                    <div className="stat-icon">📞</div>
                                    <div className="stat-info">
                                        <h3>Información de Contacto</h3>
                                        <p className="stat-number">{stats.contactItems}</p>
                                        <p className="stat-description">Datos de contacto y redes sociales</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/admin/contact')}
                                        className="stat-action"
                                    >
                                        Gestionar →
                                    </button>
                                </div>

                                <div className={`stat-card slides ${loading ? 'loading' : ''}`}>
                                    <div className="stat-icon">🖼️</div>
                                    <div className="stat-info">
                                        <h3>Slides</h3>
                                        <p className="stat-number">{stats.slides}</p>
                                        <p className="stat-description">Slides configurados</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/admin/slides')}
                                        className="stat-action"
                                    >
                                        Gestionar →
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                <section className="quick-actions">
                    <h2 className="section-title">Acciones Rápidas</h2>
                    <div className="action-grid">
                        <button
                            onClick={() => navigate('/admin/products?create=true')}
                            className="action-card primary"
                        >
                            <div className="action-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>Nuevo Producto</h3>
                            <p>Agregar un producto al catálogo</p>
                        </button>

                        <button
                            onClick={() => navigate('/admin/categories?create=true')}
                            className="action-card secondary"
                        >
                            <div className="action-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>Nueva Categoría</h3>
                            <p>Crear una nueva categoría</p>
                        </button>

                        <button
                            onClick={() => navigate('/admin/products')}
                            className="action-card tertiary"
                        >
                            <div className="action-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>Ver Inventario</h3>
                            <p>Revisar todos los productos</p>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;