import React, { useState, useEffect } from 'react';
import "./HeaderSlider.scss";
import { sliderImgs } from "../../utils/images";
import { supabase } from '../../data/supabaseClient';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HeaderSlider = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSlides();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel('header_slides_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'header_slides'
      }, () => {
        loadSlides();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('header_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSlides(data);
      } else {
        // Fallback a datos por defecto si no hay slides en la BD
        setSlides([
          {
            image_url: sliderImgs[0],
            title: "Ofertas Especiales",
            subtitle: "Hasta 20% de descuento en productos",
            text_align: "right"
          },
          {
            image_url: sliderImgs[1],
            title: "Descubre Nuevas Historias",
            subtitle: "Explora nuestras categorías de productos",
            text_align: "left"
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading slides:', error);
      // Usar datos por defecto en caso de error
      setSlides([
        {
          image_url: sliderImgs[0],
          title: "Ofertas Especiales",
          subtitle: "Hasta 20% de descuento en productos",
          text_align: "right"
        },
        {
          image_url: sliderImgs[1],
          title: "Descubre Nuevas Historias",
          subtitle: "Explora nuestras categorías de productos",
          text_align: "left"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Componentes de flecha personalizados
  const NextArrow = ({ onClick }) => (
    <button 
      className="slider-arrow slider-arrow-next" 
      onClick={onClick}
      type="button"
      aria-label="Siguiente"
    >
      <i className="bi bi-chevron-right"></i>
    </button>
  );

  const PrevArrow = ({ onClick }) => (
    <button 
      className="slider-arrow slider-arrow-prev" 
      onClick={onClick}
      type="button"
      aria-label="Anterior"
    >
      <i className="bi bi-chevron-left"></i>
    </button>
  );

  const settings = {
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dotsClass: "slick-dots custom-dots",
    responsive: [
      {
        breakpoint: 576,
        settings: {
          arrows: false,
          dots: true
        }
      }
    ]
  };

  // Mostrar loading mientras carga
  if (loading) {
    return (
      <div className='header-slider'>
        <div className='container'>
          <div className='slider-wrapper loading'>
            <div className='slider-loading'>
              <div className='spinner'></div>
              <p>Cargando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay slides, no mostrar nada
  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className='header-slider'>
      <div className='container'>
        <div className='slider-wrapper'>
          <Slider {...settings}>
            {slides.map((slide, index) => (
              <div key={slide.id || index} className='slider-item'>
                <div className="slide-content">
                  <div className="slide-background">
                    <img src={slide.image_url} alt={slide.title} />
                    <div className="slide-overlay"></div>
                  </div>
                  
                  <div className={`slide-info slide-align-${slide.text_align}`}>
                    <div className="slide-text-wrapper">
                      <h2 className="slide-title">
                        {slide.title}
                      </h2>
                      {slide.subtitle && (
                        <p className="slide-subtitle">
                          {slide.subtitle}
                        </p>
                      )}
                      {slide.button_text && slide.button_link && (
                        <a 
                          href={slide.button_link} 
                          className="slide-cta"
                        >
                          <span>{slide.button_text}</span>
                          <i className="bi bi-arrow-right"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
}

export default HeaderSlider;