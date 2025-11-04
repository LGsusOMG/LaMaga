import React, { useEffect, useState, useCallback, useMemo } from 'react';
import "./SearchPage.scss";
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import ProductList from '../../components/ProductList/ProductList';
import {
  performSearchAsync,
  setSearchTerm,
  getSearchResults,
  getSearchLoading,
  getSearchError
} from '../../store/searchSlice';

const SearchPage = () => {
  const dispatch = useDispatch();
  const { searchTerm: urlSearchTerm } = useParams();
  const searchResults = useSelector(getSearchResults);
  const loading = useSelector(getSearchLoading);
  const error = useSelector(getSearchError);

  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterType, setFilterType] = useState('all');

  const performSearch = useCallback(async (term) => {
    if (term && term.trim()) {
      dispatch(setSearchTerm(term));
      await dispatch(performSearchAsync(term));
      setHasSearched(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (urlSearchTerm && urlSearchTerm.trim()) {
      performSearch(urlSearchTerm);
    } else {
      setHasSearched(false);
    }
  }, [urlSearchTerm, performSearch]);

  // Aplicar filtros y ordenamiento
  const processedResults = useMemo(() => {
    if (!searchResults) return [];

    // Filtrar productos
    let filtered = searchResults;
    switch (filterType) {
      case 'discounts':
        filtered = searchResults.filter(product => product.discount > 0);
        break;
      case 'high-rated':
        filtered = searchResults.filter(product => (product.rating || 0) >= 4);
        break;
      case 'in-stock':
        filtered = searchResults.filter(product => product.stock > 0);
        break;
      default:
        filtered = searchResults;
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
  }, [searchResults, filterType, sortBy]);

  // Manejadores de eventos
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterChange = (filter) => {
    setFilterType(filter);
  };

  // Estado de carga
  if (loading) {
    return (
      <main className="search-page">
        <div className='container'>
          <div className='loading-state'>
            <div className='loading-spinner'>
              <div className='spinner'></div>
            </div>
            <h2>Buscando productos...</h2>
            <p className='search-query'>"{urlSearchTerm}"</p>
          </div>
        </div>
      </main>
    );
  }

  // Estado de error
  if (error) {
    return (
      <main className="search-page">
        <div className='container'>
          <div className='error-state'>
            <div className='error-icon'>
              <i className='bi bi-exclamation-circle'></i>
            </div>
            <h2>Error en la búsqueda</h2>
            <p>Ocurrió un problema al buscar productos: {error}</p>
            <button
              className="retry-btn"
              onClick={() => urlSearchTerm && performSearch(urlSearchTerm)}
            >
              <i className='bi bi-arrow-clockwise'></i>
              Reintentar búsqueda
            </button>
          </div>
        </div>
      </main>
    );
  }

  // No hay resultados
  if (hasSearched && searchResults.length === 0) {
    return (
      <main className="search-page">
        <div className='container'>
          <div className='no-results-state'>
            <div className='no-results-icon'>
              <i className='bi bi-search'></i>
            </div>
            <h2>No encontramos resultados</h2>
            <p className='search-query'>para "{urlSearchTerm}"</p>

            <div className='search-tips'>
              <h3>Sugerencias para mejorar tu búsqueda:</h3>
              <ul>
                <li>
                  <i className='bi bi-check-circle'></i>
                  Verifica la ortografía de las palabras
                </li>
                <li>
                  <i className='bi bi-check-circle'></i>
                  Usa términos más generales o menos palabras
                </li>
                <li>
                  <i className='bi bi-check-circle'></i>
                  Prueba con el nombre de la marca o categoría
                </li>
                <li>
                  <i className='bi bi-check-circle'></i>
                  Busca productos similares
                </li>
              </ul>
            </div>

            <div className='no-results-actions'>
              <Link to="/" className='action-btn primary'>
                <i className='bi bi-house'></i>
                Volver al inicio
              </Link>
              <Link to="/products" className='action-btn secondary'>
                <i className='bi bi-box-seam'></i>
                Ver todos los productos
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Resultados encontrados
  return (
    <main className="search-page">
      {/* Search Header */}
      <section className='search-hero'>
        <div className='container'>
          <div className='breadcrumb'>
            <Link to="/">
              <i className='bi bi-house'></i>
              Inicio
            </Link>
            <i className='bi bi-chevron-right'></i>
            <span>Búsqueda</span>
            <i className='bi bi-chevron-right'></i>
            <span className='active'>"{urlSearchTerm}"</span>
          </div>

          <div className='search-header'>
            <div className='search-icon'>
              <i className='bi bi-search'></i>
            </div>
            <div className='search-info'>
              <h1 className='search-title'>
                Resultados para: <span className='query'>"{urlSearchTerm}"</span>
              </h1>
              <p className='search-count'>
                {processedResults.length} {processedResults.length === 1 ? 'producto' : 'productos'}
                {filterType !== 'all' && searchResults && (
                  <span className='total-count'> de {searchResults.length} totales</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
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
              <button
                className={`filter-btn ${filterType === 'in-stock' ? 'active' : ''}`}
                onClick={() => handleFilterChange('in-stock')}
              >
                <i className='bi bi-check-circle'></i>
                Disponibles
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
                  {filterType === 'discounts' && 'En oferta'}
                  {filterType === 'high-rated' && 'Mejor valorados'}
                  {filterType === 'in-stock' && 'Disponibles'}
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

      {/* Results */}
      <section className='results-section'>
        <div className='container'>
          {processedResults.length > 0 ? (
            <ProductList products={processedResults} />
          ) : (
            <div className='no-products-message'>
              <div className='no-products-icon'>
                <i className='bi bi-inbox'></i>
              </div>
              <h3>No hay productos con estos filtros</h3>
              <p>Intenta cambiar los filtros o ajustar tu búsqueda</p>
              <button
                className='reset-btn'
                onClick={() => {
                  setFilterType('all');
                  setSortBy('relevance');
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default SearchPage;