-- =====================================================
-- NEWSLETTER SYSTEM - SQL QUERIES PARA SUPABASE
-- =====================================================
-- Copiar y pegar estas queries en SQL Editor de Supabase
-- =====================================================

-- =====================================================
-- 1. TABLA: NEWSLETTER_SUBSCRIBERS
-- =====================================================
-- Almacena los correos de suscriptores

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  subscribed_to_new_products BOOLEAN DEFAULT true,
  subscribed_to_discounts BOOLEAN DEFAULT true,
  subscribed_to_promotions BOOLEAN DEFAULT true
);

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_newsletter_subscribers_email 
  ON newsletter_subscribers(email);

CREATE INDEX idx_newsletter_subscribers_active 
  ON newsletter_subscribers(is_active);

-- Habilitar RLS (Row Level Security)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Allow all to insert subscribers" 
  ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select all subscribers" 
  ON newsletter_subscribers
  FOR SELECT USING (true);

CREATE POLICY "Allow delete subscribers" 
  ON newsletter_subscribers
  FOR DELETE USING (true);

CREATE POLICY "Allow update subscribers" 
  ON newsletter_subscribers
  FOR UPDATE USING (true);

-- =====================================================
-- 2. TABLA: EMAIL_TEMPLATES
-- =====================================================
-- Almacena las plantillas de correos

CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'new_product', 'discount', 'promotion', 'custom'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Crear índices
CREATE INDEX idx_email_templates_name 
  ON email_templates(name);

CREATE INDEX idx_email_templates_type 
  ON email_templates(template_type);

CREATE INDEX idx_email_templates_active 
  ON email_templates(is_active);

-- Habilitar RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Allow all to select templates" 
  ON email_templates
  FOR SELECT USING (true);

CREATE POLICY "Allow all to insert templates" 
  ON email_templates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update templates" 
  ON email_templates
  FOR UPDATE USING (true);

CREATE POLICY "Allow all to delete templates" 
  ON email_templates
  FOR DELETE USING (true);

-- =====================================================
-- 3. TABLA: NEWSLETTER_HISTORY
-- =====================================================
-- Historial de envíos de newsletters

CREATE TABLE newsletter_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  recipients_count INT,
  sent_at TIMESTAMP DEFAULT NOW(),
  subject TEXT,
  status TEXT DEFAULT 'sent' -- 'sent', 'failed', 'pending'
);

-- Crear índices
CREATE INDEX idx_newsletter_history_template 
  ON newsletter_history(template_id);

CREATE INDEX idx_newsletter_history_status 
  ON newsletter_history(status);

CREATE INDEX idx_newsletter_history_sent_at 
  ON newsletter_history(sent_at DESC);

-- Habilitar RLS
ALTER TABLE newsletter_history ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Allow all to select history" 
  ON newsletter_history
  FOR SELECT USING (true);

CREATE POLICY "Allow all to insert history" 
  ON newsletter_history
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================
-- Ejecutar estos INSERT si quieres datos de prueba

-- Insertar suscriptores de ejemplo
INSERT INTO newsletter_subscribers (email, subscribed_to_new_products, subscribed_to_discounts, subscribed_to_promotions)
VALUES 
  ('usuario1@example.com', true, true, true),
  ('usuario2@example.com', true, false, true),
  ('usuario3@example.com', false, true, true);

-- Insertar plantillas de ejemplo
INSERT INTO email_templates (name, subject, content, template_type)
VALUES 
  (
    'Bienvenida',
    '¡Bienvenido a LaMaga!',
    '<h1>¡Bienvenido!</h1><p>Gracias por suscribirte a nuestro newsletter.</p>',
    'custom'
  ),
  (
    'Nuevo Producto',
    '🆕 Tenemos un nuevo producto para ti',
    '<h1>Nuevo Producto</h1><p>Mira nuestro último lanzamiento...</p>',
    'new_product'
  ),
  (
    'Descuento Especial',
    '💰 Descuento exclusivo para ti',
    '<h1>¡Oferta Especial!</h1><p>Solo para nuestros suscriptores...</p>',
    'discount'
  );

-- =====================================================
-- CONSULTAS ÚTILES
-- =====================================================

-- Ver total de suscriptores
SELECT COUNT(*) as total_suscriptores 
FROM newsletter_subscribers;

-- Ver suscriptores activos
SELECT COUNT(*) as suscriptores_activos 
FROM newsletter_subscribers 
WHERE is_active = true;

-- Ver suscriptores por tipo de interés
SELECT 
  COUNT(*) FILTER (WHERE subscribed_to_new_products) as nuevos_productos,
  COUNT(*) FILTER (WHERE subscribed_to_discounts) as descuentos,
  COUNT(*) FILTER (WHERE subscribed_to_promotions) as promociones
FROM newsletter_subscribers;

-- Ver historial de envíos
SELECT 
  nh.id,
  nh.subject,
  nh.recipients_count,
  nh.sent_at,
  nh.status,
  et.name as template_name
FROM newsletter_history nh
LEFT JOIN email_templates et ON nh.template_id = et.id
ORDER BY nh.sent_at DESC;

-- Ver templates activos
SELECT 
  id,
  name,
  subject,
  template_type,
  created_at
FROM email_templates
WHERE is_active = true
ORDER BY created_at DESC;

-- =====================================================
-- OPERACIONES DE MANTENIMIENTO
-- =====================================================

-- Desactivar un suscriptor
UPDATE newsletter_subscribers 
SET is_active = false 
WHERE email = 'usuario@example.com';

-- Activar un suscriptor
UPDATE newsletter_subscribers 
SET is_active = true 
WHERE email = 'usuario@example.com';

-- Eliminar un suscriptor
DELETE FROM newsletter_subscribers 
WHERE email = 'usuario@example.com';

-- Desactivar una plantilla
UPDATE email_templates 
SET is_active = false 
WHERE id = 'template-uuid-here';

-- Eliminar historial antiguo (más de 6 meses)
DELETE FROM newsletter_history 
WHERE sent_at < NOW() - INTERVAL '6 months';

-- =====================================================
-- TRIGGERS (OPCIONAL)
-- =====================================================
-- Para actualizar automatically la columna updated_at

CREATE OR REPLACE FUNCTION update_email_templates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_timestamp
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_timestamp();

-- =====================================================
-- EXPORT DE DATOS (QUERIES PARA ANÁLISIS)
-- =====================================================

-- Exportar lista de emails
SELECT email, created_at, is_active 
FROM newsletter_subscribers
WHERE is_active = true
ORDER BY created_at DESC;

-- Estadísticas de suscripciones por fecha
SELECT 
  DATE(created_at) as fecha,
  COUNT(*) as nuevos_suscriptores
FROM newsletter_subscribers
GROUP BY DATE(created_at)
ORDER BY fecha DESC;

-- Eficiencia de templates (cuántas veces se envió cada uno)
SELECT 
  et.name,
  et.template_type,
  COUNT(nh.id) as veces_enviado,
  SUM(nh.recipients_count) as total_destinatarios
FROM email_templates et
LEFT JOIN newsletter_history nh ON et.id = nh.template_id
GROUP BY et.id, et.name, et.template_type
ORDER BY veces_enviado DESC;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
/*

1. RLS POLICIES (Row Level Security)
   - Actualmente permite acceso público para demostración
   - En producción, cambiar a políticas más restrictivas
   - Agregar autenticación antes de permitir cambios

2. ÍNDICES
   - Mejoran la velocidad de búsquedas
   - Especialmente importante para emails (búsquedas frecuentes)

3. BACKUPS
   - Supabase mantiene backups automáticos
   - Verificar settings de backup

4. PERFORMANCE
   - Para 100k+ suscriptores, considerar particionamiento
   - Las queries de ejemplo están optimizadas

5. SEGURIDAD
   - Usar HTTPS siempre
   - No exponer API keys del cliente
   - Validar emails en servidor

6. GDPR COMPLIANCE
   - Agregar columna 'deleted_at' para soft deletes
   - Mantener logs de consentimiento
   - Implementar derecho al olvido

*/

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

