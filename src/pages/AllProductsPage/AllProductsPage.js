import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import './AllProductsPage.scss';
import ProductList from '../../components/ProductList/ProductList';
import { fetchAllProducts, getAllProducts } from '../../store/productSlice';

const AllProductsPage = () => {
  const dispatch = useDispatch();
  const allProducts = useSelector(getAllProducts);
  const [loading, setLoading] = useState(true);

  // Estados para filtros y ordenamiento
  const [sortBy, setSortBy] = useState('relevance');
  const [filterType, setFilterType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      await dispatch(fetchAllProducts());
      setLoading(false);
    };
    loadProducts();
  }, [dispatch]);

  // Aplicar filtros y ordenamiento usando useMemo
  const processedProducts = useMemo(() => {
    if (!allProducts) return [];

    // Filtrar productos
    let filtered = allProducts;
    
    // Filtro por tipo
    switch (filterType) {
      case 'discounts':
        filtered = filtered.filter(product => product.discount > 0);
        break;
      case 'in-stock':
        filtered = filtered.filter(product => product.stock > 0);
        break;
      case 'featured':
        filtered = filtered.filter(product => product.featured === true);
        break;
      default:
        break;
    }

    // Filtro por rango de precio
    switch (priceRange) {
      case 'under-100':
        filtered = filtered.filter(product => {
          const finalPrice = product.price * (1 - (product.discount || 0) / 100);
          return finalPrice < 100;
        });
        break;
      case '100-500':
        filtered = filtered.filter(product => {
          const finalPrice = product.price * (1 - (product.discount || 0) / 100);
          return finalPrice >= 100 && finalPrice <= 500;
        });
        break;
      case '500-1000':
        filtered = filtered.filter(product => {
          const finalPrice = product.price * (1 - (product.discount || 0) / 100);
          return finalPrice > 500 && finalPrice <= 1000;
        });
        break;
      case 'over-1000':
        filtered = filtered.filter(product => {
          const finalPrice = product.price * (1 - (product.discount || 0) / 100);
          return finalPrice > 1000;
        });
        break;
      default:
        break;
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
  }, [allProducts, filterType, sortBy, priceRange]);

  // Manejadores de eventos
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterChange = (filter) => {
    setFilterType(filter);
  };

  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
  };

  // Estado de carga
  if (loading) {
    return (
      <main className="all-products-page">
        <div className='container'>
          <div className='loading-state'>
            <div className='loading-spinner'>
              <div className='spinner'></div>
            </div>
            <h2>Cargando productos...</h2>
            <p>Estamos preparando nuestro catálogo completo</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="all-products-page">
      {/* Header */}
      <section className='products-hero'>
        <div className='container'>
          <div className='breadcrumb'>
            <Link to="/">
              <i className='bi bi-house'></i>
              Inicio
            </Link>
            <i className='bi bi-chevron-right'></i>
            <span className='active'>Todos los productos</span>
          </div>
          
          <div className='products-header'>
            <div className='products-icon'>
              <i className='bi bi-box-seam'></i>
            </div>
            <div className='products-info'>
              <h1 className='products-title'>Todos los Productos</h1>
              <p className='products-count'>
                {processedProducts.length} {processedProducts.length === 1 ? 'producto' : 'productos'}
                {(filterType !== 'all' || priceRange !== 'all') && allProducts && (
                  <span className='total-count'> de {allProducts.length} totales</span>
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

            <div className='price-filter-group'>
              <label>Precio:</label>
              <select 
                className='price-select'
                value={priceRange}
                onChange={(e) => handlePriceRangeChange(e.target.value)}
              >
                <option value="all">Todos los precios</option>
                <option value="under-100">Menos de $100</option>
                <option value="100-500">$100 - $500</option>
                <option value="500-1000">$500 - $1,000</option>
                <option value="over-1000">Más de $1,000</option>
              </select>
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
          {(filterType !== 'all' || sortBy !== 'relevance' || priceRange !== 'all') && (
            <div className='active-filters'>
              <span className='filter-label'>Filtros activos:</span>
              {filterType !== 'all' && (
                <span className='filter-badge'>
                  {filterType === 'featured' && 'Destacados'}
                  {filterType === 'discounts' && 'En oferta'}
                  {filterType === 'in-stock' && 'Disponibles'}
                  <button 
                    className='remove-filter'
                    onClick={() => handleFilterChange('all')}
                  >
                    <i className='bi bi-x'></i>
                  </button>
                </span>
              )}
              {priceRange !== 'all' && (
                <span className='filter-badge'>
                  {priceRange === 'under-100' && 'Menos de $100'}
                  {priceRange === '100-500' && '$100 - $500'}
                  {priceRange === '500-1000' && '$500 - $1,000'}
                  {priceRange === 'over-1000' && 'Más de $1,000'}
                  <button 
                    className='remove-filter'
                    onClick={() => handlePriceRangeChange('all')}
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
                  setPriceRange('all');
                }}
              >
                <i className='bi bi-x-circle'></i>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
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
              <p>Intenta cambiar los filtros para ver más productos</p>
              <button 
                className='reset-btn'
                onClick={() => {
                  setFilterType('all');
                  setSortBy('relevance');
                  setPriceRange('all');
                }}
              >
                Limpiar todos los filtros
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
              <h3>¿Buscas algo específico?</h3>
              <p>Explora por categorías o usa nuestra búsqueda avanzada</p>
            </div>
            <div className='cta-actions'>
              <Link to="/" className='cta-btn primary'>
                <i className='bi bi-grid-3x3-gap'></i>
                Ver categorías
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AllProductsPage;