import React, { useState, useEffect, useRef } from 'react';
import "./Navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { setSidebarOn } from '../../store/sidebarSlice';
import { performSearchAsync, setSearchTerm } from '../../store/searchSlice';
import { getAllCategories, fetchCategories } from '../../store/categorySlice';
import { supabase } from '../../data/supabaseClient';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsTimeoutRef = useRef(null);

  // Obtener categorías desde Redux
  const categories = useSelector(getAllCategories);

  const socialLinks = [
    { 
      name: 'Facebook', 
      url: 'https://www.facebook.com', 
      icon: 'bi-facebook', 
      color: '#1877f2' 
    },
    { 
      name: 'Instagram', 
      url: 'https://www.instagram.com', 
      icon: 'bi-instagram', 
      color: '#e4405f' 
    },
    { 
      name: 'WhatsApp', 
      url: 'https://wa.me/526681234567', 
      icon: 'bi-whatsapp', 
      color: '#25d366' 
    }
  ];

  // Cargar categorías al montar el componente
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, []);

  // Función para buscar sugerencias
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);

    try {
      const searchPattern = `%${query}%`;
      
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .or(`title.ilike.${searchPattern},brand.ilike.${searchPattern}`)
        .limit(10);

      if (error) {
        console.error('Error buscando sugerencias:', error);
        setSuggestions([]);
        setIsLoadingSuggestions(false);
        return;
      }

      if (!products || products.length === 0) {
        setSuggestions([]);
        setIsLoadingSuggestions(false);
        return;
      }

      // Crear sugerencias únicas
      const suggestionSet = new Set();
      const finalSuggestions = [];
      const queryLower = query.toLowerCase();

      products.forEach(product => {
        // Agregar título del producto
        if (product.title && !suggestionSet.has(product.title.toLowerCase())) {
          suggestionSet.add(product.title.toLowerCase());
          finalSuggestions.push({
            type: 'product',
            text: product.title,
            brand: product.brand || '',
            category: product.categories?.name || '',
            id: product.id
          });
        }

        // Agregar marca si existe y coincide
        if (product.brand && 
            product.brand.toLowerCase().includes(queryLower) &&
            !suggestionSet.has(`brand-${product.brand.toLowerCase()}`)) {
          suggestionSet.add(`brand-${product.brand.toLowerCase()}`);
          finalSuggestions.push({
            type: 'brand',
            text: product.brand
          });
        }

        // Agregar categoría si existe y coincide
        if (product.categories?.name && 
            product.categories.name.toLowerCase().includes(queryLower) &&
            !suggestionSet.has(`category-${product.categories.name.toLowerCase()}`)) {
          suggestionSet.add(`category-${product.categories.name.toLowerCase()}`);
          finalSuggestions.push({
            type: 'category',
            text: product.categories.name
          });
        }
      });

      setSuggestions(finalSuggestions);
    } catch (error) {
      console.error('Error inesperado en sugerencias:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setSelectedSuggestionIndex(-1);

    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    suggestionsTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSearch = (e, customQuery = null) => {
    e?.preventDefault();
    const query = customQuery || searchValue;
    
    if (query.trim()) {
      const searchQuery = query.trim();
      
      dispatch(setSearchTerm(searchQuery));
      dispatch(performSearchAsync(searchQuery));
      navigate(`/search/${encodeURIComponent(searchQuery)}`);
      
      setSearchValue("");
      setIsSearchFocused(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product') {
      navigate(`/product/${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      navigate(`/category/${encodeURIComponent(suggestion.text)}`);
    } else if (suggestion.type === 'brand') {
      const searchQuery = suggestion.text.trim();
      dispatch(setSearchTerm(searchQuery));
      dispatch(performSearchAsync(searchQuery));
      navigate(`/search/${encodeURIComponent(searchQuery)}`);
    }
    
    setSearchValue("");
    setSuggestions([]);
    setIsSearchFocused(false);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setIsSearchFocused(false);
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'product':
        return 'bi bi-box-seam';
      case 'brand':
        return 'bi bi-tag-fill';
      case 'category':
        return 'bi bi-grid-3x3-gap';
      default:
        return 'bi bi-search';
    }
  };

  const getSuggestionLabel = (type) => {
    switch (type) {
      case 'product':
        return 'Producto';
      case 'brand':
        return 'Marca';
      case 'category':
        return 'Categoría';
      default:
        return '';
    }
  };

  return (
    <nav className='navbar'>
      <div className='navbar-container'>
        {/* Logo + Búsqueda alineados */}
        <div className='navbar-main-row'>
          {/* Brand Section */}
          <div className='navbar-brand-section'>
            <button 
              type="button" 
              className='sidebar-toggle-btn' 
              onClick={() => dispatch(setSidebarOn())}
              aria-label="Abrir menú lateral"
            >
              <i className='bi bi-list'></i>
            </button>
            
            <Link to="/" className='navbar-brand'>
              <div className='brand-logo-wrapper'>
                <img src="/logo192.png" alt="LaMaga Logo" className="brand-logo" />
              </div>
              <div className='brand-text'>
                <span className='brand-name'>LaMaga</span>
                <span className='brand-tagline'>Tu tienda mágica</span>
              </div>
            </Link>
          </div>

          {/* Search Section */}
          <div className='navbar-search-section' ref={searchRef}>
            <form className={`search-form ${isSearchFocused ? 'focused' : ''}`} onSubmit={handleSearch}>
              <div className='search-input-wrapper'>
                <i className='bi bi-search search-icon'></i>
                <input 
                  type="text" 
                  className='search-input' 
                  placeholder='Busca productos, marcas, categorías...' 
                  value={searchValue}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                {searchValue && (
                  <button
                    type="button"
                    className='clear-search-btn'
                    onClick={() => {
                      setSearchValue("");
                      setSuggestions([]);
                    }}
                    aria-label="Limpiar búsqueda"
                  >
                    <i className='bi bi-x-lg'></i>
                  </button>
                )}
                <button 
                  type="submit"
                  className='search-submit-btn'
                  aria-label="Buscar productos"
                >
                  <i className='bi bi-arrow-right'></i>
                </button>
              </div>

              {/* Sugerencias */}
              {isSearchFocused && (suggestions.length > 0 || isLoadingSuggestions) && (
                <div className='search-suggestions'>
                  {isLoadingSuggestions ? (
                    <div className='suggestion-item loading'>
                      <div className='suggestion-spinner'>
                        <div className='spinner'></div>
                      </div>
                      <span>Buscando...</span>
                    </div>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`suggestion-item ${selectedSuggestionIndex === index ? 'selected' : ''}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSuggestionClick(suggestion);
                        }}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      >
                        <div className='suggestion-icon'>
                          <i className={getSuggestionIcon(suggestion.type)}></i>
                        </div>
                        <div className='suggestion-content'>
                          <div className='suggestion-text'>{suggestion.text}</div>
                          {suggestion.brand && suggestion.type === 'product' && (
                            <div className='suggestion-meta'>
                              <span className='suggestion-brand'>{suggestion.brand}</span>
                              {suggestion.category && (
                                <>
                                  <span className='suggestion-separator'>•</span>
                                  <span className='suggestion-category'>{suggestion.category}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <div className='suggestion-label'>
                          {getSuggestionLabel(suggestion.type)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Categories & Social Section */}
        <div className='navbar-bottom-section'>
          {/* Categorías */}
          <div className='categories-wrapper'>
            <div className='categories-label'>
              <i className='bi bi-grid-3x3-gap-fill'></i>
              <span>Categorías</span>
            </div>
            <ul className='categories-list'>
              {categories && categories.length > 0 ? (
                categories.map((category, index) => (
                  <li key={index} className='category-item'>
                    <Link 
                      to={`/category/${encodeURIComponent(category)}`} 
                      className='category-link'
                    >
                      {category}
                    </Link>
                  </li>
                ))
              ) : (
                <li className='category-item loading'>
                  <span className='loading-text'>
                    <div className='spinner-small'></div>
                    Cargando...
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Social Links */}
          <div className='social-section'>
            <span className='social-label'>Síguenos:</span>
            <div className='social-links'>
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className='social-link'
                  style={{'--social-color': social.color}}
                  aria-label={`Síguenos en ${social.name}`}
                  title={social.name}
                >
                  <i className={`bi ${social.icon}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;