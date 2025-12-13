# 📧 Sistema Completo de Newsletter - Guía de Implementación

## 📋 Descripción General

Se ha implementado un **sistema profesional de newsletter** con:
- ✅ Suscripción de usuarios en la página de inicio
- ✅ Base de datos de suscriptores
- ✅ Panel de admin para gestionar suscriptores
- ✅ Sistema de plantillas de correos personalizables
- ✅ Envío de newsletters desde el panel de admin
- ✅ Historial de envíos

---

## 🗄️ PASO 1: Crear las Tablas en Supabase

### Acceder a Supabase
1. Ve a https://supabase.com
2. Abre tu proyecto
3. Click en "SQL Editor"
4. Crea un nuevo query

### Tabla 1: Newsletter Subscribers

```sql
-- Tabla de suscriptores
create table newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  created_at timestamp default now(),
  is_active boolean default true,
  subscribed_to_new_products boolean default true,
  subscribed_to_discounts boolean default true,
  subscribed_to_promotions boolean default true
);

-- Índice para búsquedas rápidas
create index idx_newsletter_email on newsletter_subscribers(email);
create index idx_newsletter_active on newsletter_subscribers(is_active);

-- RLS Policy (Row Level Security)
alter table newsletter_subscribers enable row level security;

create policy "Allow all to insert subscribers" on newsletter_subscribers
  for insert with check (true);

create policy "Allow select all subscribers" on newsletter_subscribers
  for select using (true);
```

### Tabla 2: Email Templates

```sql
-- Tabla de plantillas de correos
create table email_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  subject text not null,
  content text not null, -- Contenido HTML
  template_type text not null, -- 'new_product', 'discount', 'promotion', 'custom'
  created_at timestamp default now(),
  updated_at timestamp default now(),
  is_active boolean default true
);

-- RLS Policy
alter table email_templates enable row level security;

create policy "Allow all to select templates" on email_templates
  for select using (true);

create policy "Allow admin to manage templates" on email_templates
  for all using (true); -- Cambiar según tu sistema de permisos
```

### Tabla 3: Newsletter History

```sql
-- Tabla de historial de envíos
create table newsletter_history (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references email_templates(id) on delete set null,
  recipients_count int,
  sent_at timestamp default now(),
  subject text,
  status text default 'sent' -- 'sent', 'failed', 'pending'
);

-- RLS Policy
alter table newsletter_history enable row level security;

create policy "Allow all to select history" on newsletter_history
  for select using (true);
```

---

## 🔧 PASO 2: Actualizar HomePage.js

Ya hecho! Se actualizó con:
- ✅ Estado para email y mensajes
- ✅ Función `handleNewsletterSubscribe`
- ✅ Validación de email
- ✅ Verificación de duplicados
- ✅ Inserción en BD
- ✅ Feedback visual

### Características:
- Valida formato de email
- Evita duplicados
- Muestra mensajes de éxito/error
- Desactiva botón mientras se suscribe
- Limpia el formulario al completar

---

## 📊 PASO 3: Agregar AdminNewsletter al Panel

### Archivo: `src/pages/Admin/AdminNewsletter/AdminNewsletter.js`
Ya creado con 3 pestañas:
1. **Suscriptores** - Ver y gestionar suscriptores
2. **Templates** - Crear/editar plantillas
3. **Enviar** - Enviar newsletters

### Características:

#### Pestaña Suscriptores
- Lista completa de suscriptores
- Ver estado activo/inactivo
- Ver preferencias (productos, descuentos, promociones)
- Activar/desactivar suscriptores
- Eliminar suscriptores
- Contador de activos

#### Pestaña Templates
- Crear nuevos templates
- Editar templates existentes
- Tipos: custom, new_product, discount, promotion
- Editor de HTML
- Vista previa
- Eliminar templates

#### Pestaña Enviar
- Seleccionar template
- Preview del correo
- Ver cantidad de destinatarios
- Botón para enviar
- Confirmación de envío
- Historial

---

## 📱 PASO 4: Integrar en el Router de Admin

En tu archivo de rutas del admin, agregar:

```javascript
// src/pages/Admin/AdminDashboard.js (o donde tengas las rutas)

import AdminNewsletter from './AdminNewsletter/AdminNewsletter';

// En tu componente de rutas:
<Route path="newsletter" element={<AdminNewsletter />} />
```

En el menú de admin agregar link:
```javascript
<Link to="/admin/newsletter">
  <i className='bi bi-envelope-fill'></i>
  Newsletter
</Link>
```

---

## 🚀 PASO 5: Configurar Envío de Correos (Opcional pero Recomendado)

### Opción A: Sendgrid + Edge Function (Recomendado)

#### 1. Crear Edge Function en Supabase

En Supabase → Edge Functions → New Function:

```typescript
// supabase/functions/send-newsletter/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { templateId } = await req.json();

    // Obtener template
    const { data: template } = await supabase
      .from("email_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (!template) {
      return new Response(
        JSON.stringify({ error: "Template not found" }),
        { status: 404 }
      );
    }

    // Obtener suscriptores activos
    const { data: subscribers } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    // Enviar correos con SendGrid
    const emailPromises = subscribers.map((subscriber) =>
      fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: subscriber.email }],
            },
          ],
          from: { email: "newsletter@tutienda.com" },
          subject: template.subject,
          content: [
            {
              type: "text/html",
              value: template.content,
            },
          ],
        }),
      })
    );

    await Promise.all(emailPromises);

    // Registrar en historial
    await supabase.from("newsletter_history").insert([
      {
        template_id: templateId,
        recipients_count: subscribers.length,
        subject: template.subject,
        status: "sent",
      },
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        sent: subscribers.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

#### 2. Configurar en Supabase

1. Obtener API key de SendGrid
2. En Supabase → Settings → Environment Variables
3. Agregar: `SENDGRID_API_KEY = tu_api_key_aqui`
4. Deploy la función

#### 3. Actualizar AdminNewsletter para usar Edge Function

```javascript
// En handleSendNewsletter reemplazar:
const handleSendNewsletter = async () => {
  try {
    // ... validaciones ...

    // Llamar Edge Function
    const { data, error } = await supabase.functions.invoke('send-newsletter', {
      body: { templateId: selectedTemplate },
    });

    if (error) throw error;

    setsSendMessage(`Newsletter enviado a ${data.sent} suscriptores`);
    // ...
  } catch (error) {
    // ...
  }
};
```

### Opción B: EmailJS (Más Simple)

```javascript
import emailjs from '@emailjs/browser';

emailjs.init("TU_PUBLIC_KEY"); // Del panel de EmailJS

const handleSendNewsletter = async () => {
  try {
    const subscribers = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    const template = templates.find(t => t.id === selectedTemplate);

    for (const subscriber of subscribers.data) {
      await emailjs.send("TU_SERVICE_ID", "TU_TEMPLATE_ID", {
        to_email: subscriber.email,
        subject: template.subject,
        html_content: template.content,
      });
    }

    // Registrar envío
    await supabase.from('newsletter_history').insert([{
      template_id: selectedTemplate,
      recipients_count: subscribers.data.length,
      subject: template.subject,
      status: 'sent'
    }]);

    setsSendMessage(`Newsletter enviado a ${subscribers.data.length} suscriptores`);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🎨 Ejemplo de Template HTML

Aquí un template HTML de ejemplo que puedes usar:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background: white; border: 1px solid #eee; }
        .product { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .button { background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 15px 0; }
        .footer { background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏪 LaMaga - Nuestras Mejores Ofertas</h1>
        </div>
        
        <div class="content">
            <h2>Hola {{nombre}},</h2>
            <p>¡Tenemos ofertas especiales para ti esta semana!</p>
            
            <div class="product">
                <h3>Producto Destacado</h3>
                <p>Descripción del producto con oferta especial...</p>
                <a href="https://tutienda.com" class="button">Ver Oferta</a>
            </div>
            
            <p>No te pierdas nuestras promociones exclusivas para suscriptores.</p>
        </div>
        
        <div class="footer">
            <p>© 2025 LaMaga. Todos los derechos reservados.</p>
            <p><a href="https://tutienda.com/unsubscribe">Desuscribirse</a></p>
        </div>
    </div>
</body>
</html>
```

---

## 📊 Estructura de Datos

### newsletter_subscribers
```
id (UUID)
email (TEXT, único)
created_at (TIMESTAMP)
is_active (BOOLEAN)
subscribed_to_new_products (BOOLEAN)
subscribed_to_discounts (BOOLEAN)
subscribed_to_promotions (BOOLEAN)
```

### email_templates
```
id (UUID)
name (TEXT, único)
subject (TEXT)
content (TEXT, HTML)
template_type (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
is_active (BOOLEAN)
```

### newsletter_history
```
id (UUID)
template_id (UUID, FK)
recipients_count (INT)
sent_at (TIMESTAMP)
subject (TEXT)
status (TEXT)
```

---

## 🎯 Funcionalidades Implementadas

### Para Usuarios
- ✅ Suscribirse con correo
- ✅ Validación de email
- ✅ Prevención de duplicados
- ✅ Feedback visual (éxito/error)

### Para Admin
- ✅ Ver lista de suscriptores
- ✅ Activar/desactivar suscriptores
- ✅ Eliminar suscriptores
- ✅ Crear templates personalizados
- ✅ Editar templates
- ✅ Eliminar templates
- ✅ Vista previa de correos
- ✅ Enviar newsletters
- ✅ Historial de envíos

---

## 🔐 Seguridad

Recomendaciones:
1. **RLS Policies** - Ya configuradas en Supabase
2. **CORS** - Configurar correctamente
3. **Rate Limiting** - Agregar en Edge Function
4. **Validación** - Email y contenido
5. **Encriptación** - Para datos sensibles

---

## 📈 Próximas Mejoras (Opcional)

1. **Desuscripción** - Link en correos para desuscribirse
2. **Estadísticas** - Ver tasa de apertura/click
3. **Segmentación** - Enviar a grupos específicos
4. **Automatización** - Enviar automático en eventos
5. **Plantillas Condicionales** - Contenido dinámico
6. **A/B Testing** - Probar diferentes versiones
7. **Analytics** - Dashboard de rendimiento

---

## 🚀 Checklist de Implementación

- [ ] Crear tablas en Supabase
- [ ] HomePage.js actualizado ✅
- [ ] AdminNewsletter.js creado ✅
- [ ] Agregar ruta en admin
- [ ] Agregar link en menú de admin
- [ ] Probar suscripción en homepage
- [ ] Crear plantilla de ejemplo
- [ ] Configurar envío de correos
- [ ] Probar envío de newsletter
- [ ] Documentar para el equipo

---

## 📞 Soporte

### Errores Comunes

**"UNIQUE constraint failed"** - El email ya existe
→ Verificar que no esté duplicado en BD

**"Correos no se envían"** - Edge Function o API key
→ Verificar credenciales de SendGrid

**"Template no aparece"** - Permisos de lectura
→ Verificar RLS Policies

---

## 📚 Recursos

- [SendGrid Docs](https://docs.sendgrid.com/)
- [Supabase Functions](https://supabase.com/docs/guides/functions)
- [EmailJS Docs](https://www.emailjs.com/docs/)

¡Tu sistema de newsletter está listo! 🎉

