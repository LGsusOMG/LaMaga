// src/pages/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../data/supabaseClient';
import './AdminDashboard.scss';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
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
        };

        const loadStats = async () => {
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            const { count: categoriesCount } = await supabase
                .from('categories')
                .select('*', { count: 'exact', head: true });

            setStats({
                products: productsCount || 0,
                categories: categoriesCount || 0,
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
                            <span className="user-email">{user?.email}</span>
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
                    </div>
                </section>

                <section className="quick-actions">
                    <h2 className="section-title">Acciones Rápidas</h2>
                    <div className="action-grid">
                        <button
                            onClick={() => navigate('/admin/products/new')}
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
                            onClick={() => navigate('/admin/categories/new')}
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

                        <button
                            onClick={() => navigate('/admin/categories')}
                            className="action-card quaternary"
                        >
                            <div className="action-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>Gestionar Categorías</h3>
                            <p>Organizar categorías</p>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;