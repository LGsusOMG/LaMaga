import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import './CategoryProductPage.scss';
import ProductList from '../../components/ProductList/ProductList';
import {
  fetchProductsByCategory,
  getCategoryProducts
} from '../../store/categorySlice';

const CategoryProductPage = () => {
  const dispatch = useDispatch();
  const { category } = useParams();
  const categoryProducts = useSelector(state =>
    getCategoryProducts(state, category)
  );

  // Estados para filtros y ordenamiento
  const [sortBy, setSortBy] = useState('relevance');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (category && category !== 'undefined') {
      dispatch(fetchProductsByCategory(category));
    }
  }, [dispatch, category]);

  const processedProducts = useMemo(() => {
    if (!categoryProducts) return [];

    // Filtrar productos
    let filtered = categoryProducts;
    switch (filterType) {
      case 'featured':
        filtered = categoryProducts.filter(product => product.featured === true);
        break;
      case 'bestsellers':
        filtered = categoryProducts.filter(product => product.stock < 10);
        break;
      case 'discounts':
        filtered = categoryProducts.filter(product => product.discount > 0);
        break;
      default:
        filtered = categoryProducts;
    }

    // Ordenar productos
    if (filtered.length === 0) return [];

    const sorted = [...filtered];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => {
          const priceA = a.price * (1 - (a.discount || 0) / 100);
          const priceB = b.price * (1 - (b.discount || 0) / 100);
          return priceA - priceB;
        });

      case 'price-desc':
        return sorted.sort((a, b) => {
          const priceA = a.price * (1 - (a.discount || 0) / 100);
          const priceB = b.price * (1 - (b.discount || 0) / 100);
          return priceB - priceA;
        });

      case 'name-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));

      case 'name-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));

      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });

      case 'discount':
        return sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));

      default: // relevance
        return sorted;
    }
  }, [categoryProducts, filterType, sortBy]);

  // Manejadores de eventos
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterChange = (filter) => {
    setFilterType(filter);
  };

  // Error: Categoría no válida
  if (!category || category === 'undefined') {
    return (
      <main className="category-page">
        <div className='container'>
          <div className='error-state'>
            <div className='error-icon'>
              <i className='bi bi-exclamation-triangle'></i>
            </div>
            <h2>Categoría no especificada</h2>
            <p>No se pudo determinar la categoría a mostrar.</p>
            <Link to="/" className='back-home-btn'>
              <i className='bi bi-house'></i>
              <span>Volver al inicio</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Estado de carga
  if (!categoryProducts || categoryProducts.length === 0) {
    return (
      <main className="category-page">
        <div className='container'>
          <div className='loading-state'>
            <div className='loading-spinner'>
              <div className='spinner'></div>
            </div>
            <h2>Cargando productos...</h2>
            <p>Estamos buscando los mejores productos de {category}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="category-page">
      {/* Header de la categoría */}
      <section className='category-hero'>
        <div className='container'>
          <div className='breadcrumb'>
            <Link to="/">
              <i className='bi bi-house'></i>
              Inicio
            </Link>
            <i className='bi bi-chevron-right'></i>
            <span>Categorías</span>
            <i className='bi bi-chevron-right'></i>
            <span className='active'>{category}</span>
          </div>

          <div className='category-header'>
            <div className='category-icon'>
              <i className='bi bi-tag-fill'></i>
            </div>
            <div className='category-info'>
              <h1 className='category-title'>{category}</h1>
              <p className='category-count'>
                {processedProducts.length} {processedProducts.length === 1 ? 'producto' : 'productos'}
                {filterType !== 'all' && categoryProducts && (
                  <span className='total-count'> de {categoryProducts.length} totales</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros y ordenamiento */}
      <section className='filters-section'>
        <div className='container'>
          <div className='filters-bar'>
            <div className='filter-group'>
              <button
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                <i className='bi bi-grid-3x3-gap'></i>
                Todos
              </button>

              <button
                className={`filter-btn ${filterType === 'discounts' ? 'active' : ''}`}
                onClick={() => handleFilterChange('discounts')}
              >
                <i className='bi bi-percent'></i>
                En oferta
              </button>
            </div>

            <div className='sort-group'>
              <label htmlFor="sort-select">Ordenar por:</label>
              <select
                id="sort-select"
                className='sort-select'
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="relevance">Más relevantes</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name-asc">Nombre: A-Z</option>
                <option value="name-desc">Nombre: Z-A</option>
                <option value="newest">Más recientes</option>
                <option value="discount">Mayor descuento</option>
              </select>
            </div>
          </div>

          {/* Indicador de filtros activos */}
          {(filterType !== 'all' || sortBy !== 'relevance') && (
            <div className='active-filters'>
              <span className='filter-label'>Filtros activos:</span>
              {filterType !== 'all' && (
                <span className='filter-badge'>
                  {filterType === 'featured' && 'Destacados'}
                  {filterType === 'bestsellers' && 'Más vendidos'}
                  {filterType === 'discounts' && 'En oferta'}
                  <button
                    className='remove-filter'
                    onClick={() => handleFilterChange('all')}
                  >
                    <i className='bi bi-x'></i>
                  </button>
                </span>
              )}
              {sortBy !== 'relevance' && (
                <span className='filter-badge'>
                  Ordenado por: {sortBy === 'price-asc' && 'Precio ↑'}
                  {sortBy === 'price-desc' && 'Precio ↓'}
                  {sortBy === 'name-asc' && 'Nombre A-Z'}
                  {sortBy === 'name-desc' && 'Nombre Z-A'}
                  {sortBy === 'newest' && 'Recientes'}
                  {sortBy === 'discount' && 'Descuento'}
                </span>
              )}
              <button
                className='clear-filters'
                onClick={() => {
                  setFilterType('all');
                  setSortBy('relevance');
                }}
              >
                <i className='bi bi-x-circle'></i>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lista de productos */}
      <section className='products-section'>
        <div className='container'>
          {processedProducts.length > 0 ? (
            <ProductList products={processedProducts} />
          ) : (
            <div className='no-products-message'>
              <div className='no-products-icon'>
                <i className='bi bi-inbox'></i>
              </div>
              <h3>No hay productos con estos filtros</h3>
              <p>Intenta cambiar los filtros o ver todos los productos</p>
              <button
                className='reset-btn'
                onClick={() => {
                  setFilterType('all');
                  setSortBy('relevance');
                }}
              >
                Ver todos los productos
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className='cta-section'>
        <div className='container'>
          <div className='cta-card'>
            <div className='cta-content'>
              <h3>¿No encontraste lo que buscabas?</h3>
              <p>Explora otras categorías o realiza una búsqueda personalizada</p>
            </div>
            <div className='cta-actions'>
              <Link to="/" className='cta-btn primary'>
                <i className='bi bi-grid-3x3-gap'></i>
                Ver categorías
              </Link>
              <Link to="/products" className='cta-btn secondary'>
                <i className='bi bi-box-seam'></i>
                Todos los productos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default CategoryProductPage;