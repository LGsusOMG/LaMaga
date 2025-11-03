// src/pages/SearchPage/SearchPage.js
import React, { useEffect, useState, useCallback } from 'react';
import "./SearchPage.scss";
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
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

  // Función para realizar la búsqueda
  const performSearch = useCallback(async (term) => {
    if (term && term.trim()) {
      dispatch(setSearchTerm(term));
      await dispatch(performSearchAsync(term));
      setHasSearched(true);
    }
  }, [dispatch]);

  useEffect(() => {
    console.log('🔍 SearchPage - URL Search Term:', urlSearchTerm);
    
    if (urlSearchTerm && urlSearchTerm.trim()) {
      performSearch(urlSearchTerm);
    } else {
      setHasSearched(false);
    }
  }, [urlSearchTerm, performSearch]); // Dependencias correctas

  console.log('🔍 SearchPage - State:', { loading, error, hasSearched, searchResultsCount: searchResults.length });

  // Estado de carga
  if (loading) {
    return (
      <div className='container' style={{ minHeight: "70vh" }}>
        <div className='fw-5 text-center py-5'>
          <h3>Buscando productos para "{urlSearchTerm}"...</h3>
          <p>Por favor espera.</p>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className='container' style={{ minHeight: "70vh" }}>
        <div className='fw-5 text-danger py-5'>
          <h3>Error en la búsqueda</h3>
          <p>Ocurrió un problema al buscar productos: {error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => urlSearchTerm && performSearch(urlSearchTerm)}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // No hay resultados después de buscar
  if (hasSearched && searchResults.length === 0) {
    return (
      <div className='container' style={{ minHeight: "70vh" }}>
        <div className='fw-5 text-danger py-5'>
          <h3>No se encontraron productos para "{urlSearchTerm}"</h3>
          <p>Intenta con otros términos de búsqueda.</p>
          <ul className="search-tips mt-3">
            <li>Revisa la ortografía</li>
            <li>Usa términos más generales</li>
            <li>Prueba con el nombre de la marca</li>
          </ul>
        </div>
      </div>
    );
  }

  // Resultados encontrados
  return (
    <main>
      <div className='search-content bg-whitesmoke'>
        <div className='container'>
          <div className='py-5'>
            <div className='title-md'>
              <h3>Resultados de búsqueda para: "{urlSearchTerm}"</h3>
              <p>Se encontraron {searchResults.length} productos</p>
            </div>
            <br />
            <ProductList products={searchResults} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default SearchPage;