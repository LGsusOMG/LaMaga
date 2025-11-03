import React, { useEffect } from 'react';
import "./HomePage.scss";
import HeaderSlider from "../../components/Slider/HeaderSlider";
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  getAllCategories, 
  fetchCategories 
} from '../../store/categorySlice';
import ProductList from "../../components/ProductList/ProductList";
import { 
  fetchAllProducts, 
  fetchFeaturedProducts,
  getAllProducts, 
  getFeaturedProductsState 
} from '../../store/productSlice';

const HomePage = () => {
  const dispatch = useDispatch();
  const categories = useSelector(getAllCategories);
  const allProducts = useSelector(getAllProducts);
  const featuredProducts = useSelector(getFeaturedProductsState);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAllProducts());
    dispatch(fetchFeaturedProducts(8));
  }, [dispatch]);

  const getProductsForCategory = (categoryName) => {
    return allProducts
      .filter(product => product.category === categoryName)
      .slice(0, 8);
  };

  return (
    <main className="homepage">
      {/* Hero Slider */}
      <section className='hero-section'>
        <HeaderSlider />
      </section>

      {/* Main Content */}
      <div className='main-content'>
        <div className='container'>
          
          {/* Productos Destacados */}
          {featuredProducts && featuredProducts.length > 0 && (
            <section className='products-section featured-section'>
              <div className='section-header'>
                <div className='section-header-content'>
                  <div className='section-title-wrapper'>
                    <i className='bi bi-star-fill section-icon'></i>
                    <h2 className='section-title'>Productos Destacados</h2>
                  </div>
                  <p className='section-subtitle'>Los productos más populares seleccionados para ti</p>
                </div>
                <Link to="/products" className='view-all-btn'>
                  <span>Ver todos</span>
                  <i className='bi bi-arrow-right'></i>
                </Link>
              </div>
              <ProductList products={featuredProducts} />
            </section>
          )}

          {/* Categories Showcase */}
          {categories && categories.length > 0 && (
            <section className='categories-showcase'>
              <div className='section-header centered'>
                <div className='section-header-content'>
                  <div className='section-title-wrapper'>
                    <i className='bi bi-grid-3x3-gap-fill section-icon'></i>
                    <h2 className='section-title'>Explora por Categorías</h2>
                  </div>
                  <p className='section-subtitle'>Descubre nuestras categorías principales</p>
                </div>
              </div>

              <div className='categories-grid'>
                {categories.slice(0, 6).map((category, index) => {
                  const categoryProducts = getProductsForCategory(category);
                  return (
                    <Link 
                      key={index}
                      to={`/category/${encodeURIComponent(category)}`} 
                      className='category-card'
                    >
                      <div className='category-card-overlay'></div>
                      <div className='category-card-content'>
                        <div className='category-icon'>
                          <i className='bi bi-tag-fill'></i>
                        </div>
                        <h3 className='category-name'>{category}</h3>
                        <p className='category-count'>
                          {categoryProducts.length} productos
                        </p>
                        <div className='category-arrow'>
                          <i className='bi bi-arrow-right'></i>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Productos por Categoría */}
          {categories.slice(0, 3).map((category, index) => {
            const categoryProducts = getProductsForCategory(category);
            
            if (categoryProducts.length === 0) return null;

            return (
              <section key={index} className='products-section category-section'>
                <div className='section-header'>
                  <div className='section-header-content'>
                    <div className='section-title-wrapper'>
                      <i className='bi bi-bookmark-fill section-icon'></i>
                      <h2 className='section-title'>{category}</h2>
                    </div>
                    <p className='section-subtitle'>
                      Descubre nuestra selección de {category.toLowerCase()}
                    </p>
                  </div>
                  <Link 
                    to={`/category/${encodeURIComponent(category)}`} 
                    className='view-all-btn'
                  >
                    <span>Ver más</span>
                    <i className='bi bi-arrow-right'></i>
                  </Link>
                </div>
                <ProductList products={categoryProducts} />
              </section>
            );
          })}

          {/* CTA Banner */}
          <section className='cta-banner'>
            <div className='cta-banner-content'>
              <div className='cta-text'>
                <h2>¿Buscas algo específico?</h2>
                <p>Explora nuestro catálogo completo de productos</p>
              </div>
              <Link to="/products" className='cta-button'>
                <span>Ver todos los productos</span>
                <i className='bi bi-arrow-right'></i>
              </Link>
            </div>
          </section>

          {/* Newsletter Section */}
          <section className='newsletter-section'>
            <div className='newsletter-content'>
              <div className='newsletter-icon'>
                <i className='bi bi-envelope-heart'></i>
              </div>
              <div className='newsletter-text'>
                <h3>Suscríbete a nuestro boletín</h3>
                <p>Recibe ofertas exclusivas y las últimas novedades</p>
              </div>
              <form className='newsletter-form'>
                <div className='newsletter-input-wrapper'>
                  <i className='bi bi-envelope'></i>
                  <input 
                    type='email' 
                    placeholder='Tu correo electrónico' 
                    required
                  />
                </div>
                <button type='submit' className='newsletter-submit'>
                  <span>Suscribirse</span>
                  <i className='bi bi-send'></i>
                </button>
              </form>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}

export default HomePage;