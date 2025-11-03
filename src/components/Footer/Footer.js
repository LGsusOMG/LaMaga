import React from 'react';
import "./Footer.scss";
import { Link } from 'react-router-dom';

const Footer = () => {
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
      name: 'Twitter', 
      url: 'https://twitter.com', 
      icon: 'bi-twitter-x', 
      color: '#000000' 
    },
    { 
      name: 'WhatsApp', 
      url: 'https://wa.me/526681234567', 
      icon: 'bi-whatsapp', 
      color: '#25d366' 
    }
  ];

  return (
    <footer className='footer'>
      <div className="footer-wrapper">
        {/* Sección principal del footer */}
        <div className="footer-main">
          <div className="container py-5">
            <div className="footer-grid">
              {/* Columna de la marca */}
              <div className="footer-column">
                <h3 className="footer-brand">LaMaga</h3>
                <p className="footer-description">
                  Tu plataforma confiable para encontrar los mejores precios.
                </p>
                
                {/* Social Links */}
                <div className='social-section'>
                  <p className='social-title'>Síguenos en:</p>
                  <div className='social-links'>
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className='social-link'
                        style={{ '--social-color': social.color }}
                        aria-label={`Síguenos en ${social.name}`}
                        title={social.name}
                      >
                        <i className={`bi ${social.icon}`}></i>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Columna de enlaces rápidos */}
              <div className="footer-column">
                <h4 className="footer-title">Enlaces Rápidos</h4>
                <ul className="footer-links">
                  <li><Link to="/">Inicio</Link></li>
                  <li><Link to="/about">Acerca de</Link></li>
                  <li><Link to="/products">Productos</Link></li>
                </ul>
              </div>

              {/* Columna de contacto */}
              <div className="footer-column">
                <h4 className="footer-title">Contacto</h4>
                <ul className="footer-contact">
                  <li>
                    <i className="bi bi-envelope-fill"></i>
                    <a href="mailto:info@lamaga.com">info@lamaga.com</a>
                  </li>
                  <li>
                    <i className="bi bi-telephone-fill"></i>
                    <a href="tel:+526681234567">+52 668 123 4567</a>
                  </li>
                  <li>
                    <i className="bi bi-geo-alt-fill"></i>
                    <span>Alhuey, Angostura, Sinaloa, MX</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="footer-bottom">
          <div className="container">
            <div className="footer-bottom-content">
              <div className="footer-legal">
                <Link to="/privacy">Política de Privacidad</Link>
                <span className="separator">•</span>
                <Link to="/terms">Términos de Servicio</Link>
                <span className="separator">•</span>
                <Link to="/cookies">Cookies</Link>
              </div>
              <span className='copyright-text'>
                &copy; {new Date().getFullYear()} LaMaga. Todos los derechos reservados.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer