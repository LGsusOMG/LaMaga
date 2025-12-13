# 📧 EMAILJS - GUÍA DE CONFIGURACIÓN

## ✅ Ya Implementado

El código está listo para enviar emails reales. Solo falta completar 2 credenciales.

---

## 🔑 Paso 1: Obtén tus Credenciales EmailJS

### 1. Public Key
1. Ve a https://emailjs.com
2. Inicia sesión
3. Click en **Account** (arriba a la derecha)
4. En **API Keys**, copia **Public Key**

```
Ejemplo: 1a2b3c4d5e6f7g8h
```

### 2. Template ID
1. En el dashboard, click en **Email Templates**
2. Selecciona el template que creaste
3. En la URL o en los detalles, verás el **Template ID**

```
Ejemplo: template_abc123def456
```

### 3. Service ID (Ya lo tienes)
```
✅ service_3yh5l88
```

---

## 🔧 Paso 2: Actualiza el Código

**Archivo:** `src/pages/Admin/AdminNewsletter/AdminNewsletter.js`

**Líneas 10-12:**
```javascript
// Configuración de EmailJS
const EMAILJS_SERVICE_ID = 'service_3yh5l88'; // ✅ Ya configurado
const EMAILJS_TEMPLATE_ID = 'template_XXXXXX'; // ← Reemplaza aquí
const EMAILJS_PUBLIC_KEY = 'your_public_key_here'; // ← Reemplaza aquí
```

### Ejemplo completado:
```javascript
const EMAILJS_SERVICE_ID = 'service_3yh5l88';
const EMAILJS_TEMPLATE_ID = 'template_abc123def456';
const EMAILJS_PUBLIC_KEY = '1a2b3c4d5e6f7g8h';
```

---

## 📝 Paso 3: Crear Template en EmailJS

En https://emailjs.com → Email Templates → Create New Template

### Variables disponibles en el template:
```
{{to_email}}          - Email del suscriptor
{{subject}}           - Asunto del newsletter
{{html_content}}      - Contenido HTML del template
```

### Ejemplo de HTML en el template:
```html
<html>
  <body>
    <h1>{{subject}}</h1>
    <div>{{html_content}}</div>
    <footer>
      <p>Unsubscribe: {{to_email}}</p>
    </footer>
  </body>
</html>
```

---

## 🧪 Paso 4: Prueba

1. Abre la app: `http://localhost:3000`
2. Ve a `/admin/newsletter`
3. Selecciona un template
4. Click "Enviar Newsletter"
5. ✅ Los emails se enviarán a todos los suscriptores activos

---

## 📊 Qué Sucede Ahora

```
1. Admin selecciona template
2. Click "Enviar Newsletter"
3. Sistema itera sobre suscriptores activos
4. Envía email individual a cada uno (EmailJS)
5. Registra en BD (newsletter_history)
6. Muestra resultado: "✅ Enviado a X suscriptores"
```

---

## ⚠️ Notas Importantes

### Límites de EmailJS (Plan Gratuito)
- ✅ 200 emails por mes
- ✅ Ilimitado después con plan pago
- ✅ Perfecto para pruebas

### Si los emails no llegan
1. Verifica que el **Template ID** sea correcto
2. Verifica que el **Public Key** sea correcto
3. En EmailJS, prueba el template manualmente
4. Abre F12 (console) y busca errores

### Para producción
- Considera plan pago de EmailJS
- O implementa SendGrid/Resend

---

## 🎯 Resumen

```
✅ EmailJS instalado
✅ Código implementado
⏳ Solo falta: Completar 2 variables (Template ID + Public Key)
```

**Una vez completes eso, los emails funcionarán automáticamente.**

---

## 🔗 Links Útiles

- [EmailJS Documentación](https://www.emailjs.com/docs/)
- [Crear Template](https://dashboard.emailjs.com/admin/templates)
- [API Keys](https://dashboard.emailjs.com/admin/account)

---

## ✨ ¿Listo?

1. Ve a emailjs.com
2. Copia Public Key y Template ID
3. Actualiza las 2 líneas en AdminNewsletter.js
4. ¡Hecho! Tus emails enviarán automáticamente

