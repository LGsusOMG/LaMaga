import React from 'react';
import "./HeaderSlider.scss";
import { sliderImgs } from "../../utils/images";
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HeaderSlider = () => {
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

  const slides = [
    {
      image: sliderImgs[0],
      title: "Ofertas Especiales",
      subtitle: "Hasta 20% de descuento en productos",
      align: "right"
    },
    {
      image: sliderImgs[1],
      title: "Descubre Nuevas Historias",
      subtitle: "Explora nuestras categorías de productos",
      align: "left"
    }
  ];

  return (
    <div className='header-slider'>
      <div className='container'>
        <div className='slider-wrapper'>
          <Slider {...settings}>
            {slides.map((slide, index) => (
              <div key={index} className='slider-item'>
                <div className="slide-content">
                  <div className="slide-background">
                    <img src={slide.image} alt={slide.title} />
                    <div className="slide-overlay"></div>
                  </div>
                  
                  <div className={`slide-info slide-align-${slide.align}`}>
                    <div className="slide-text-wrapper">
                      <h2 className="slide-title">
                        {slide.title}
                      </h2>
                      <p className="slide-subtitle">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  )
}

export default HeaderSlider