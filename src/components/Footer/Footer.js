import React, { useState, useEffect } from 'react';
import "./Footer.scss";
import { Link } from 'react-router-dom';
import { supabase } from '../../data/supabaseClient';

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Suscribirse a cambios en tiempo real para redes sociales
    const socialSubscription = supabase
      .channel('footer_social_links_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_social_links'
        },
        (payload) => {
          console.log('Social links changed:', payload);
          loadData();
        }
      )
      .subscribe();

    // Suscribirse a cambios en tiempo real para información de contacto
    const contactSubscription = supabase
      .channel('footer_contact_info_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_info'
        },
        (payload) => {
          console.log('Contact info changed:', payload);
          loadData();
        }
      )
      .subscribe();

    // Limpiar suscripciones al desmontar
    return () => {
      socialSubscription.unsubscribe();
      contactSubscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      // Cargar redes sociales
      const { data: socialData, error: socialError } = await supabase
        .from('contact_social_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (socialError) {
        console.error('Error loading social links:', socialError);
        throw socialError;
      }

      setSocialLinks(socialData || []);

      // Cargar información de contacto
      const { data: contactData, error: contactError } = await supabase
        .from('contact_info')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (contactError) {
        console.error('Error loading contact info:', contactError);
        throw contactError;
      }

      setContactInfo(contactData || []);
      
      console.log('Data loaded successfully');
      console.log('Social links:', socialData);
      console.log('Contact info:', contactData);

    } catch (error) {
      console.error('Error loading footer data:', error);
      // Fallback a datos por defecto si falla la carga
      setSocialLinks([
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
        }
      ]);
      setContactInfo([
        { 
          type: 'phone',
          label: 'Teléfono',
          value: '+52 668 123 4567', 
          icon: 'bi-telephone-fill'
        },
        { 
          type: 'email',
          label: 'Correo',
          value: 'info@lamaga.com', 
          icon: 'bi-envelope-fill'
        },
        { 
          type: 'address',
          label: 'Ubicación',
          value: 'Alhuey, Angostura, Sinaloa, MX', 
          icon: 'bi-geo-alt-fill'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Función para renderizar el valor de contacto con enlace si es apropiado
  const renderContactValue = (item) => {
    if (item.type === 'phone') {
      // Limpiar el número de espacios y caracteres especiales para el enlace
      const cleanNumber = item.value.replace(/\s+/g, '');
      return (
        <a href={`tel:${cleanNumber}`}>{item.value}</a>
      );
    } else if (item.type === 'email') {
      return (
        <a href={`mailto:${item.value}`}>{item.value}</a>
      );
    } else {
      return <span>{item.value}</span>;
    }
  };

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
                
                {/* Social Links - Desde la BD con tiempo real */}
                {socialLinks.length > 0 && (
                  <div className='social-section'>
                    <p className='social-title'>Síguenos en:</p>
                    <div className='social-links'>
                      {socialLinks.map((social, index) => (
                        <a
                          key={social.id || index}
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
                )}
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

              {/* Columna de contacto - Dinámico desde la BD con tiempo real */}
              <div className="footer-column">
                <h4 className="footer-title">Contacto</h4>
                <ul className="footer-contact">
                  {loading ? (
                    <li>
                      <span>Cargando...</span>
                    </li>
                  ) : contactInfo.length > 0 ? (
                    contactInfo.map((item, index) => (
                      <li key={item.id || index}>
                        <i className={`bi ${item.icon}`}></i>
                        {renderContactValue(item)}
                      </li>
                    ))
                  ) : (
                    <li>
                      <span>No hay información de contacto disponible.</span>
                    </li>
                  )}
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