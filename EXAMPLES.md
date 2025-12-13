# 🎨 Ejemplos Prácticos - Responsive Design

## Ejemplo 1: Card Responsive

### ❌ Antes (Con media queries duplicadas)
```scss
.card {
    padding: 20px;
    font-size: 14px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    
    @media screen and (max-width: 768px) {
        padding: 15px;
        font-size: 13px;
    }
    
    @media screen and (max-width: 576px) {
        padding: 10px;
        font-size: 12px;
    }
}

.card-title {
    font-size: 18px;
    
    @media screen and (max-width: 768px) {
        font-size: 16px;
    }
    
    @media screen and (max-width: 576px) {
        font-size: 14px;
    }
}
```

### ✅ Después (Con mixins)
```scss
@use "../../App.scss" as *;

.card {
    padding: 20px;
    font-size: 14px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    
    @include mobile-landscape {
        padding: 15px;
        font-size: 13px;
    }
    
    @include mobile {
        padding: 10px;
        font-size: 12px;
    }
}

.card-title {
    font-size: 18px;
    
    @include mobile-landscape {
        font-size: 16px;
    }
    
    @include mobile {
        font-size: 14px;
    }
}
```

**Ventajas:**
- Más legible
- Fácil de mantener
- Cambiar breakpoints en un lugar

---

## Ejemplo 2: Grid de Productos

### ❌ Versión Antigua
```scss
.products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    
    @media screen and (max-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
    }
    
    @media screen and (max-width: 992px) {
        grid-template-columns: repeat(2, 1fr);
    }
    
    @media screen and (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 15px;
    }
}
```

### ✅ Versión Nueva
```scss
@use "../../App.scss" as *;

.products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    
    @include laptop {
        grid-template-columns: repeat(3, 1fr);
    }
    
    @include mobile-landscape {
        grid-template-columns: repeat(2, 1fr);
    }
    
    @include mobile {
        grid-template-columns: 1fr;
        gap: 15px;
    }
}
```

**Resultado en diferentes pantallas:**
```
Desktop (1200px+):        ████ ████ ████ ████  (4 columnas)
Laptop (1024px):          ███ ███ ███           (3 columnas)
Mobile Landscape (480px): ██ ██                 (2 columnas)
Mobile (375px):           █                     (1 columna)
```

---

## Ejemplo 3: Flexbox Responsive

### ❌ Antes
```scss
.navbar {
    display: flex;
    gap: 30px;
    align-items: center;
    padding: 20px 40px;
    
    @media screen and (max-width: 768px) {
        flex-direction: column;
        gap: 15px;
        padding: 15px 20px;
    }
    
    @media screen and (max-width: 576px) {
        gap: 10px;
        padding: 10px;
    }
}
```

### ✅ Después
```scss
@use "../../App.scss" as *;

.navbar {
    display: flex;
    gap: 30px;
    align-items: center;
    padding: 20px 40px;
    
    @include mobile-landscape {
        flex-direction: column;
        gap: 15px;
        padding: 15px 20px;
    }
    
    @include mobile {
        gap: 10px;
        padding: 10px;
    }
}
```

---

## Ejemplo 4: Tipografía Escalable

### ❌ Problema Común
```scss
h1 {
    font-size: 3rem;  // ¡Demasiado grande en móviles!
}

p {
    font-size: 1.2rem;  // Difícil de leer en móviles
}
```

### ✅ Solución Completa
```scss
@use "../../App.scss" as *;

h1 {
    font-size: 3rem;        // Desktop
    
    @include laptop {
        font-size: 2.5rem;
    }
    
    @include mobile-landscape {
        font-size: 2rem;
    }
    
    @include mobile {
        font-size: 1.5rem;
    }
}

p {
    font-size: 1.2rem;      // Desktop
    line-height: 1.6;
    
    @include mobile {
        font-size: 1rem;
        line-height: 1.5;
    }
}
```

**Escalado:**
```
Desktop:         h1: 3rem    p: 1.2rem
Laptop:          h1: 2.5rem  p: 1.2rem
Tablet:          h1: 2rem    p: 1rem
Mobile:          h1: 1.5rem  p: 1rem
```

---

## Ejemplo 5: Container Inteligente

### ❌ Sin adaptar
```scss
.container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;  // 32px en móviles = ¡muy grande!
}
```

### ✅ Adaptive
```scss
@use "../../App.scss" as *;

.container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
    
    @include mobile-landscape {
        padding: 0 1.5rem;
    }
    
    @include mobile {
        padding: 0 1rem;
    }
}

// Resultado:
// Desktop:    ┃  Contenido  ┃  32px  32px
// Tablet:     ┃ Contenido ┃  24px  24px
// Mobile:     ┃Contenido┃   16px  16px
```

---

## Ejemplo 6: Botones Touch-Friendly

### ❌ No optimizado
```scss
button {
    padding: 8px 16px;
    font-size: 14px;
    // ¡Es difícil de tocar en móviles!
}
```

### ✅ Touch-friendly
```scss
@use "../../App.scss" as *;

button {
    padding: 12px 24px;
    font-size: 1rem;
    min-width: 44px;      // Mínimo recomendado
    min-height: 44px;     // Mínimo recomendado
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    @include mobile {
        padding: 10px 20px;  // Un poco más compacto en móviles
        font-size: 14px;
        min-width: 44px;     // Mantener el mínimo
        min-height: 44px;    // Mantener el mínimo
    }
    
    &:hover {
        transform: translateY(-2px);
    }
    
    &:active {
        transform: translateY(0);
    }
}
```

---

## Ejemplo 7: Imagen Responsiva

### ❌ Problema
```scss
img {
    width: 500px;  // Desborda en móviles
    height: 300px;
    object-fit: cover;
}
```

### ✅ Solución
```scss
@use "../../App.scss" as *;

img {
    width: 100%;
    max-width: 100%;
    height: auto;
    object-fit: cover;
    display: block;
    border-radius: 8px;
    
    @include mobile {
        border-radius: 4px;
    }
}

// También en HTML:
// <picture>
//   <source srcset="imagen-mobile.jpg" media="(max-width: 768px)">
//   <source srcset="imagen-tablet.jpg" media="(max-width: 1024px)">
//   <img src="imagen-desktop.jpg" alt="Descripción">
// </picture>
```

---

## Ejemplo 8: Hero Section Responsive

### ✅ Implementación Completa
```scss
@use "../../App.scss" as *;

.hero {
    min-height: 80vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    position: relative;
    
    @include mobile {
        min-height: 60vh;
        padding: 40px 15px;
    }
}

.hero-content {
    max-width: 1200px;
    color: white;
    text-align: center;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 20px;
    line-height: 1.2;
    
    @include laptop {
        font-size: 3rem;
    }
    
    @include mobile-landscape {
        font-size: 2rem;
    }
    
    @include mobile {
        font-size: 1.5rem;
    }
}

.hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 30px;
    color: rgba(255,255,255,0.9);
    
    @include mobile {
        font-size: 1rem;
        margin-bottom: 20px;
    }
}

.hero-button {
    padding: 15px 40px;
    font-size: 1rem;
    background: white;
    color: #667eea;
    border: none;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    @include mobile {
        padding: 12px 30px;
        font-size: 14px;
    }
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
}
```

---

## Ejemplo 9: Tabla Responsive

### ❌ Problema
```scss
table {
    width: 100%;
    
    th, td {
        padding: 15px;
    }
    // ¡Se desborda en móviles!
}
```

### ✅ Solución
```scss
@use "../../App.scss" as *;

.table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    
    table {
        width: 100%;
        border-collapse: collapse;
        
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
            
            @include mobile {
                padding: 10px;
                font-size: 14px;
            }
        }
        
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
        
        tr:hover {
            background: #f8f9fa;
        }
    }
}

// En HTML:
// <div class="table-responsive">
//   <table>...</table>
// </div>
```

---

## Ejemplo 10: Menú Dropdown Responsive

### ✅ Dropdown Adaptable
```scss
@use "../../App.scss" as *;

.dropdown-menu {
    position: relative;
    display: inline-block;
}

.dropdown-button {
    padding: 10px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.dropdown-content {
    position: absolute;
    background-color: white;
    min-width: 200px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    padding: 10px 0;
    z-index: 100;
    border-radius: 4px;
    
    @include mobile {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        min-width: 100%;
        border-radius: 16px 16px 0 0;
        max-height: 50vh;
        overflow-y: auto;
    }
    
    a {
        color: black;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
        transition: background 0.2s;
        
        &:hover {
            background: #f8f9fa;
        }
    }
}
```

---

## 📚 Patrones Recomendados

### Patrón 1: Mobile-First (Recomendado)
```scss
// Estilos para móvil primero
.elemento { ... }

// Mejoras progresivas para tamaños más grandes
@include tablet { ... }
@include laptop { ... }
@include desktop { ... }
```

### Patrón 2: Desktop-First
```scss
// Estilos para desktop
.elemento { ... }

// Adjustments para tamaños más pequeños
@include mobile { ... }
@include mobile-landscape { ... }
```

### Patrón 3: Breakpoint-Específico
```scss
// Estilos base
.elemento { ... }

// Ajustes para cada breakpoint
@include mobile { ... }
@include mobile-landscape { ... }
@include tablet { ... }
@include laptop { ... }
@include desktop { ... }
```

---

## ✨ Tips Finales

1. **Siempre prueba en DevTools** (F12 → Ctrl+Shift+M)
2. **Mantén el orden de breakpoints consistente**
3. **Usa `auto-fit` en grids cuando sea posible**
4. **No olvides `max-width: 100%` en imágenes**
5. **Asegura que los botones sean toucables (44x44px)**
6. **Usa `line-height: 1.6` para mejor legibilidad**
7. **Prueba en dispositivos reales cuando sea posible**

¡Ahora eres un experto en responsive design! 🎉

