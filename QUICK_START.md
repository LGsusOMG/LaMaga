# 🚀 Guía Rápida - Primeros Pasos

¿Nuevo en el proyecto? Aquí está todo lo que necesitas saber en 15 minutos.

---

## ⏱️ Tiempo: 15 minutos

Haremos:
1. ✅ Entender qué es responsive (2 min)
2. ✅ Ver el sistema implementado (3 min)
3. ✅ Aprender a modificar (5 min)
4. ✅ Probar en tu dispositivo (5 min)

---

## 1️⃣ ¿Qué es Responsive Design? (2 min)

### Concepto Simple
Tu tienda se ve bien **en TODOS los dispositivos**:

```
Escritorio → Se ve grande
   ↓
Tablet → Se adapta
   ↓
Móvil → Se ve compacto
```

### Ejemplo Práctico
- 📱 iPhone (375px): Una columna de productos
- 📱 Tablet (768px): Dos columnas de productos
- 💻 Desktop (1200px): Cuatro columnas de productos

### ¿Cómo se logra?
Con **CSS Media Queries** que cambian estilos según el tamaño.

---

## 2️⃣ ¿Qué Se Implementó? (3 min)

### El Ingrediente Principal: Breakpoints

```scss
// En: src/App.scss

$mobile: 320px;           // Móviles pequeños
$mobile-landscape: 480px; // Móviles horizontal
$tablet: 768px;           // Tablets
$laptop: 1024px;          // Laptops
$desktop: 1200px;         // Desktops
$wide: 1400px;            // Pantallas grandes
```

### El Ingrediente Secundario: Mixins

```scss
// ANTES (sin mixin):
@media screen and (max-width: 768px) {
  font-size: 1.5rem;
}

// AHORA (con mixin):
@include mobile-landscape {
  font-size: 1.5rem;
}
```

### ¿Por qué mixins?
- ✅ Menos código
- ✅ Más legible
- ✅ Fácil mantener
- ✅ Consistente en todo el proyecto

---

## 3️⃣ ¿Cómo Modificar? (5 min)

### Escenario 1: Crear un componente nuevo

```scss
// Archivo: src/components/MiComponente/MiComponente.scss

@use "../../App.scss" as *;  // ← IMPORTANTE: importar App.scss

.mi-componente {
  // Estilos por defecto (móvil)
  font-size: 1rem;
  padding: 1rem;
  
  // Mejorar en tablets
  @include tablet {
    padding: 1.5rem;
  }
  
  // Mejorar en desktops
  @include desktop {
    font-size: 1.2rem;
    padding: 2rem;
  }
}
```

### Escenario 2: Modificar un componente existente

```scss
// Buscar esto:
@media screen and (max-width: 768px) {
  ...
}

// Reemplazar por:
@include mobile-landscape {
  ...
}
```

### Escenario 3: Cambiar un valor global

```scss
// En: src/App.scss

// Cambiar esto:
$desktop: 1200px;

// Por esto:
$desktop: 1100px;  // ← Se aplica a TODOS los componentes
```

---

## 4️⃣ ¿Cómo Probar? (5 min)

### Opción A: En tu navegador (Recomendado)

```
1. Abre tu tienda en Chrome
2. Presiona F12 (o Cmd+Option+I en Mac)
3. Presiona Ctrl+Shift+M (o mira el ícono de dispositivo)
4. Selecciona un dispositivo de la lista
5. ¡Verás tu tienda en ese tamaño!
```

### Tamaños para Probar
```
375px  (iPhone SE)
390px  (iPhone 12)
768px  (iPad)
1024px (iPad Pro)
1200px (Desktop)
1920px (Full HD)
```

### Opción B: En tu teléfono

```
1. Abre: http://localhost:3000
   (O la URL de tu servidor)
2. ¡Verás tu tienda en el móvil real!
```

### ¿Qué Buscar?

- ✅ Se ve bien en tamaño pequeño
- ✅ Sin scroll horizontal
- ✅ Tipografía legible
- ✅ Botones grandes
- ✅ Imágenes no se distorsionan
- ✅ Espaciado es consistente

---

## 📝 Cheat Sheet Rápido

### Imports
```scss
// SIEMPRE hazlo en cada componente:
@use "../../App.scss" as *;
```

### Mixins Disponibles
```scss
@include mobile { }           // 0-479px
@include mobile-landscape { } // 480-767px
@include tablet { }           // 768-1023px
@include laptop { }           // 1024-1199px
@include desktop { }          // 1200-1399px
@include wide { }             // 1400px+
```

### Patrón Recomendado
```scss
.elemento {
  // Estilos base (móvil)
  font-size: 1rem;
  
  // Mejoras por tamaño
  @include mobile-landscape { font-size: 1.1rem; }
  @include desktop { font-size: 1.3rem; }
}
```

### Grid Automático
```scss
.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  // ¡Se adapta automáticamente!
}
```

### Imagen Responsiva
```scss
img {
  width: 100%;
  max-width: 100%;
  height: auto;
  display: block;
}
```

---

## 🎯 Tarea Rápida: Practica Ahora

### Ejercicio 1: Ver los cambios
1. Abre DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Cambia entre tamaños
4. Observa cómo cambia el layout

### Ejercicio 2: Modificar un componente
1. Abre `src/pages/HomePage/HomePage.scss`
2. Busca `@include` (deberías ver varios)
3. Cambia un valor, por ejemplo:
   ```scss
   font-size: 2rem;  // ← cambiar por 2.5rem
   ```
4. Guarda (Ctrl+S)
5. La tienda se actualiza automáticamente
6. Verifica en diferentes tamaños

### Ejercicio 3: Crear algo nuevo
1. Crea un nuevo componente
2. Importa App.scss: `@use "../../App.scss" as *;`
3. Agrega estilos responsivos
4. Prueba en DevTools

---

## ❓ Preguntas Comunes

### "¿Cómo sé qué mixin usar?"
Pregúntate: "¿A qué tamaño de pantalla quiero aplicar este cambio?"
- Móviles pequeños: `@include mobile`
- Móviles en horizontal: `@include mobile-landscape`
- Tablets y arriba: `@include tablet`
- Desktops: `@include desktop`

### "¿Puedo usar @media screen and directamente?"
Técnicamente sí, pero NO. Usa los mixins para consistencia.

### "¿Qué pasa si cambio un breakpoint?"
Se aplica a TODO el proyecto automáticamente porque usamos mixins.

### "¿Mi componente se ve mal en móvil?"
1. Abre DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Selecciona un móvil (375px)
4. Verifica el CSS (click derecho → Inspeccionar)
5. Busca el mixin incorrecto o falta de media query

### "¿Cómo agrego un nuevo breakpoint?"
En `src/App.scss`:
```scss
$ultra-wide: 1800px;

@mixin ultra-wide {
  @media screen and (min-width: 1800px) {
    @content;
  }
}
```
Luego úsalo: `@include ultra-wide { }`

---

## 🚀 Próximos Pasos

### Hora 0-1: Entiende (AHORA)
- ✅ Leer esta guía (15 min)
- ✅ Probar en DevTools (15 min)
- ✅ Practicar cambios simples (30 min)

### Hora 1-2: Practica
- Modifica 3 componentes
- Prueba en todos los tamaños
- Anota qué aprendiste

### Hora 2+: Domina
- Lee [RESPONSIVE_DESIGN_GUIDE.md](RESPONSIVE_DESIGN_GUIDE.md)
- Crea un componente nuevo
- Enseña a otro developer

---

## 📚 Documentos Relacionados

Para profundizar:
- [INDEX.md](INDEX.md) - Índice general
- [VISUAL_SUMMARY.md](VISUAL_SUMMARY.md) - Diagramas
- [EXAMPLES.md](EXAMPLES.md) - 10 ejemplos
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Referencia rápida

---

## 💡 Tips Importantes

### Tip 1: Siempre Importa App.scss
```scss
@use "../../App.scss" as *;  // ← NO OLVIDES
```

### Tip 2: Mobile-First por Defecto
```scss
// ✅ BIEN:
.elemento { /* móvil */ }
@include tablet { /* tablet */ }

// ❌ MALO:
@media screen and (min-width: 1200px) {
  .elemento { /* desktop */ }
}
```

### Tip 3: Prueba en Múltiples Tamaños
- 375px (iPhone)
- 768px (Tablet)
- 1200px (Desktop)

### Tip 4: Sin Scroll Horizontal
Si ves scroll horizontal, hay un problema.

### Tip 5: Botones >= 44x44px
En móviles, los botones deben ser tocables.

---

## ✅ Verificación Rápida

¿Completaste todo?

- [ ] Entiende qué es responsive
- [ ] Conoce los breakpoints
- [ ] Sabe usar los mixins
- [ ] Probó en DevTools
- [ ] Modificó un componente
- [ ] Vio los cambios en tiempo real

¡Si marcaste todas, ¡YA ESTÁS LISTO! 🎉

---

## 🎊 ¡Felicidades!

Ahora:
- ✅ Entiendes responsive design
- ✅ Puedes modificar estilos
- ✅ Sabes probar en múltiples dispositivos
- ✅ Puedes crear nuevos componentes

**¿Qué sigue?**
- Lee la documentación completa
- Practica más
- Enseña a otros

¡Tu tienda es 100% responsiva! 🚀

---

**¿Preguntas? Consulta la documentación o revisa los ejemplos.**

