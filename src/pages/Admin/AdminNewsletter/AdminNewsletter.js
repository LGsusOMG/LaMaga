import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './AdminNewsletter.scss';
import { supabase } from '../../../data/supabaseClient';

// Configuración de EmailJS
const EMAILJS_SERVICE_ID = 'service_3yh5l88'; // Tu Service ID
const EMAILJS_TEMPLATE_ID = 'template_0ecvl7t'; // Reemplaza con tu Template ID
const EMAILJS_PUBLIC_KEY = 'ksFIrLLYgtzNHGOn1'; // Reemplaza con tu Public Key

// Inicializar EmailJS una sola vez
emailjs.init(EMAILJS_PUBLIC_KEY);

const AdminNewsletter = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subscribers'); // 'subscribers', 'templates', 'send'
  
  // Subscribers
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  
  // Templates
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    template_type: 'custom'
  });
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // Send Newsletter
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendMessage, setsSendMessage] = useState('');

  // Load subscribers
  const loadSubscribers = async () => {
    setSubscribersLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error cargando suscriptores:', error);
    } finally {
      setSubscribersLoading(false);
    }
  };

  // Load templates
  const loadTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error cargando templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
    loadTemplates();
  }, []);

  // Guardar template
  const handleSaveTemplate = async () => {
    try {
      if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
        alert('Por favor completa todos los campos');
        return;
      }

      if (editingTemplate) {
        // Actualizar
        const { error } = await supabase
          .from('email_templates')
          .update({
            ...newTemplate,
            updated_at: new Date()
          })
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
      } else {
        // Crear nuevo
        const { error } = await supabase
          .from('email_templates')
          .insert([newTemplate]);
        
        if (error) throw error;
      }

      setNewTemplate({
        name: '',
        subject: '',
        content: '',
        template_type: 'custom'
      });
      setEditingTemplate(null);
      await loadTemplates();
      alert('Template guardado exitosamente');
    } catch (error) {
      console.error('Error guardando template:', error);
      alert('Error al guardar template');
    }
  };

  // Editar template
  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      content: template.content,
      template_type: template.template_type
    });
    setActiveTab('templates');
  };

  // Eliminar template
  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este template?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
      await loadTemplates();
      alert('Template eliminado');
    } catch (error) {
      console.error('Error eliminando template:', error);
    }
  };

  // Desactivar suscriptor
  const handleToggleSubscriber = async (subscriber) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: !subscriber.is_active })
        .eq('id', subscriber.id);
      
      if (error) throw error;
      await loadSubscribers();
    } catch (error) {
      console.error('Error actualizando suscriptor:', error);
    }
  };

  // Eliminar suscriptor
  const handleDeleteSubscriber = async (subscriberId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este suscriptor?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', subscriberId);
      
      if (error) throw error;
      await loadSubscribers();
    } catch (error) {
      console.error('Error eliminando suscriptor:', error);
    }
  };

  // Enviar newsletter
  const handleSendNewsletter = async () => {
    setSendLoading(true);
    setsSendMessage('');

    try {
      if (!selectedTemplate) {
        alert('Por favor selecciona un template');
        setSendLoading(false);
        return;
      }

      // Obtener template
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) {
        alert('Template no encontrado');
        setSendLoading(false);
        return;
      }

      // Obtener correos de suscriptores activos
      const activeSubscribers = subscribers.filter(s => s.is_active);
      const recipientCount = activeSubscribers.length;

      if (recipientCount === 0) {
        alert('No hay suscriptores activos');
        setSendLoading(false);
        return;
      }

      // Enviar emails con EmailJS
      let successCount = 0;
      let failedCount = 0;

      for (const subscriber of activeSubscribers) {
        try {
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_email: subscriber.email,
            subject: template.subject,
            html_content: template.content,
          });
          successCount++;
        } catch (emailError) {
          console.error(`Error enviando a ${subscriber.email}:`, emailError);
          failedCount++;
        }
      }

      // Registrar el envío en el historial
      const { error } = await supabase
        .from('newsletter_history')
        .insert([
          {
            template_id: selectedTemplate,
            recipients_count: successCount,
            subject: template.subject,
            status: successCount > 0 ? 'sent' : 'failed'
          }
        ]);

      if (error) throw error;

      // Mostrar mensaje de éxito
      let message = `✅ Newsletter enviado a ${successCount} suscriptores`;
      if (failedCount > 0) {
        message += ` (${failedCount} errores)`;
      }
      setsSendMessage(message);
      setSelectedTemplate('');
      
      // Recargar historial
      loadTemplates();
      
      // Limpiar mensaje después de 4 segundos
      setTimeout(() => setsSendMessage(''), 4000);
    } catch (error) {
      console.error('Error enviando newsletter:', error);
      setsSendMessage('❌ Error al enviar el newsletter. Verifica tu configuración de EmailJS.');
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div className='admin-newsletter'>
      <div className='newsletter-header'>
        <h1>Gestión de Newsletter</h1>
        <button 
          className='back-button'
          onClick={() => navigate('/admin/dashboard')}
          title='Regresar al panel principal'
        >
          <i className='bi bi-arrow-left'></i>
          <span>Volver</span>
        </button>
      </div>

      {/* Tabs */}
      <div className='newsletter-tabs'>
        <button 
          className={`tab ${activeTab === 'subscribers' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscribers')}
        >
          <i className='bi bi-people-fill'></i>
          <span>Suscriptores ({subscribers.length})</span>
        </button>
        <button 
          className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <i className='bi bi-file-text'></i>
          <span>Templates ({templates.length})</span>
        </button>
        <button 
          className={`tab ${activeTab === 'send' ? 'active' : ''}`}
          onClick={() => setActiveTab('send')}
        >
          <i className='bi bi-send-fill'></i>
          <span>Enviar Newsletter</span>
        </button>
      </div>

      {/* Content */}
      <div className='newsletter-content'>
        
        {/* Subscribers Tab */}
        {activeTab === 'subscribers' && (
          <div className='subscribers-section'>
            <div className='section-header'>
              <h2>Suscriptores al Newsletter</h2>
              <span className='badge'>{subscribers.filter(s => s.is_active).length} activos</span>
            </div>

            {subscribersLoading ? (
              <p className='loading'>Cargando...</p>
            ) : subscribers.length === 0 ? (
              <p className='no-data'>No hay suscriptores</p>
            ) : (
              <div className='subscribers-table'>
                <table>
                  <thead>
                    <tr>
                      <th>Correo</th>
                      <th>Fecha</th>
                      <th>Productos Nuevos</th>
                      <th>Descuentos</th>
                      <th>Promociones</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map(subscriber => (
                      <tr key={subscriber.id} className={!subscriber.is_active ? 'inactive' : ''}>
                        <td>
                          <span className='email'>{subscriber.email}</span>
                        </td>
                        <td>
                          {new Date(subscriber.created_at).toLocaleDateString('es-ES')}
                        </td>
                        <td>
                          <i className={`bi ${subscriber.subscribed_to_new_products ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i>
                        </td>
                        <td>
                          <i className={`bi ${subscriber.subscribed_to_discounts ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i>
                        </td>
                        <td>
                          <i className={`bi ${subscriber.subscribed_to_promotions ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i>
                        </td>
                        <td>
                          <span className={`status ${subscriber.is_active ? 'active' : 'inactive'}`}>
                            {subscriber.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className='actions'>
                          <button 
                            className='btn-toggle'
                            onClick={() => handleToggleSubscriber(subscriber)}
                            title={subscriber.is_active ? 'Desactivar' : 'Activar'}
                          >
                            <i className='bi bi-toggle2-on'></i>
                          </button>
                          <button 
                            className='btn-delete'
                            onClick={() => handleDeleteSubscriber(subscriber.id)}
                            title='Eliminar'
                          >
                            <i className='bi bi-trash'></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className='templates-section'>
            <div className='section-header'>
              <h2>{editingTemplate ? 'Editar Template' : 'Crear Nuevo Template'}</h2>
            </div>

            <form className='template-form'>
              <div className='form-group'>
                <label>Nombre del Template</label>
                <input 
                  type='text'
                  placeholder='Ej: Newsletter Descuentos'
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                />
              </div>

              <div className='form-group'>
                <label>Tipo de Template</label>
                <select 
                  value={newTemplate.template_type}
                  onChange={(e) => setNewTemplate({...newTemplate, template_type: e.target.value})}
                >
                  <option value='custom'>Personalizado</option>
                  <option value='new_product'>Nuevo Producto</option>
                  <option value='discount'>Descuento</option>
                  <option value='promotion'>Promoción</option>
                </select>
              </div>

              <div className='form-group'>
                <label>Asunto del Correo</label>
                <input 
                  type='text'
                  placeholder='Ej: Descuentos Exclusivos esta Semana'
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                />
              </div>

              <div className='form-group'>
                <label>Contenido del Correo (HTML)</label>
                <textarea 
                  placeholder='Ingresa el HTML del correo...'
                  rows='10'
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                />
              </div>

              <div className='form-actions'>
                <button 
                  type='button'
                  className='btn-save'
                  onClick={handleSaveTemplate}
                >
                  <i className='bi bi-check'></i>
                  {editingTemplate ? 'Actualizar' : 'Guardar'} Template
                </button>
                {editingTemplate && (
                  <button 
                    type='button'
                    className='btn-cancel'
                    onClick={() => {
                      setEditingTemplate(null);
                      setNewTemplate({
                        name: '',
                        subject: '',
                        content: '',
                        template_type: 'custom'
                      });
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className='templates-list'>
              <h3>Templates Existentes</h3>
              {templatesLoading ? (
                <p className='loading'>Cargando...</p>
              ) : templates.length === 0 ? (
                <p className='no-data'>No hay templates creados</p>
              ) : (
                <div className='templates-grid'>
                  {templates.map(template => (
                    <div key={template.id} className='template-card'>
                      <div className='template-header'>
                        <h4>{template.name}</h4>
                        <span className='template-type'>{template.template_type}</span>
                      </div>
                      <p className='template-subject'><strong>Asunto:</strong> {template.subject}</p>
                      <p className='template-date'>
                        Creado: {new Date(template.created_at).toLocaleDateString('es-ES')}
                      </p>
                      <div className='template-actions'>
                        <button 
                          className='btn-edit'
                          onClick={() => handleEditTemplate(template)}
                        >
                          <i className='bi bi-pencil'></i>
                        </button>
                        <button 
                          className='btn-delete'
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <i className='bi bi-trash'></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Send Tab */}
        {activeTab === 'send' && (
          <div className='send-section'>
            <div className='section-header'>
              <h2>Enviar Newsletter</h2>
            </div>

            <div className='send-form'>
              <div className='form-group'>
                <label>Selecciona un Template</label>
                <select 
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value=''>-- Selecciona un template --</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className='preview-box'>
                {selectedTemplate && (
                  <>
                    <h4>Preview del Template</h4>
                    {templates.map(template => 
                      template.id === selectedTemplate && (
                        <div key={template.id}>
                          <p><strong>Asunto:</strong> {template.subject}</p>
                          <div className='email-preview' dangerouslySetInnerHTML={{__html: template.content}} />
                        </div>
                      )
                    )}
                  </>
                )}
              </div>

              <div className='send-info'>
                <i className='bi bi-info-circle'></i>
                <span>Se enviará a {subscribers.filter(s => s.is_active).length} suscriptores activos</span>
              </div>

              <button 
                className='btn-send'
                onClick={handleSendNewsletter}
                disabled={sendLoading || !selectedTemplate}
              >
                <i className={`bi ${sendLoading ? 'bi-hourglass-split' : 'bi-send-fill'}`}></i>
                {sendLoading ? 'Enviando...' : 'Enviar Newsletter'}
              </button>

              {sendMessage && (
                <div className={`message ${sendMessage.includes('Error') ? 'error' : 'success'}`}>
                  {sendMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNewsletter;
