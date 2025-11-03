import React, { useEffect } from 'react';
import "./Sidebar.scss";
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSidebarStatus, setSidebarOff } from '../../store/sidebarSlice';
import { getAllCategories, fetchCategories } from '../../store/categorySlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const isSidebarOn = useSelector(getSidebarStatus);
  const categories = useSelector(getAllCategories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <>
      {/* Overlay para cerrar el sidebar al hacer clic fuera */}
      <div 
        className={`sidebar-overlay ${isSidebarOn ? 'show' : ''}`}
        onClick={() => dispatch(setSidebarOff())}
      ></div>

      <aside className={`sidebar ${isSidebarOn ? 'show-sidebar' : ""}`}>
        {/* Header del sidebar */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <i className="bi bi-grid-3x3-gap-fill"></i>
            <h2>Categorías</h2>
          </div>
          <button 
            type="button" 
            className='sidebar-close-btn' 
            onClick={() => dispatch(setSidebarOff())}
            aria-label="Cerrar menú"
          >
            <i className='bi bi-list'></i>
          </button>
        </div>

        {/* Contenido del sidebar */}
        <div className='sidebar-content'>

          {/* Lista de categorías */}
          <div className="categories-section">
            <div className="section-title">
              <i className="bi bi-bookmark-fill"></i>
              <span>Todas las categorías</span>
              <span className="category-count">({safeCategories.length})</span>
            </div>

            <ul className='category-list'>
              {safeCategories.length === 0 ? (
                <li className='category-loading'>
                  <div className="loading-skeleton">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                  </div>
                </li>
              ) : (
                safeCategories.map((category, idx) => {
                  const categoryName = category;
                  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
                  
                  return (
                    <li key={idx} className="category-item">
                      <Link 
                        to={`category/${categorySlug}`} 
                        className='category-link'
                        onClick={() => dispatch(setSidebarOff())}
                      >
                        <span className="category-name">
                          {categoryName.replace(/-/g, " ")}
                        </span>
                        <i className="bi bi-chevron-right category-arrow"></i>
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {/* Footer del sidebar con información adicional */}
          <div className="sidebar-footer">
            <div className="footer-info">
              <i className="bi bi-info-circle"></i>
              <p>Explora nuestra amplia selección de productos organizados por categorías</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;