# 🪄 La Maga - Tienda de Conveniencia

**La Maga** es una tienda de conveniencia moderna y cercana a la comunidad. Esta página web permite a los clientes conocer los productos disponibles en tienda, ver promociones actuales, obtener información de contacto y encontrar la ubicación física del negocio.

---

## 🌐 Descripción del Proyecto

Este proyecto es una **página web informativa** desarrollada con **React** para **La Maga**, una tienda de abarrotes y conveniencia. El sitio web sirve como catálogo digital donde los clientes pueden consultar qué productos están disponibles en la tienda física antes de visitarla.

---

## 🎯 Objetivos

* Mostrar el catálogo de productos disponibles en tienda
* Informar sobre promociones y ofertas especiales
* Facilitar el contacto con la tienda (teléfono, redes sociales)
* Mostrar la ubicación física con integración de mapas
* Ofrecer una experiencia visual atractiva y fácil de navegar
* Ayudar a los clientes a planificar su visita conociendo el inventario

---

## 🛍️ Características Principales

### Información de Productos
* **Catálogo completo** de productos disponibles en tienda
* **Navegación por categorías** (abarrotes, bebidas, snacks, limpieza, etc.)
* **Sistema de búsqueda** para encontrar productos rápidamente
* **Detalles de productos** con precios de referencia
* **Productos destacados** 

### Filtros y Búsqueda
* Filtros por:
  - Categorías de productos
  - Productos en oferta
  - Disponibilidad en stock
* Ordenamiento por:
  - Nombre
  - Precio
  - Promociones

### Información de la Tienda
* **Página de inicio** con presentación del negocio
* **Sección "Acerca de"** con información de la tienda
* **Datos de contacto** (teléfono, email, horarios)
* **Ubicación con mapa** integrado
* **Enlaces a redes sociales**

### Diseño
* **Interfaz responsiva** adaptada a móviles, tablets y desktop
* **Diseño moderno** con colores llamativos
* **Navegación intuitiva** con breadcrumbs
* **Carga rápida** y optimizada

---

## 🧱 Tecnologías Utilizadas

### Frontend
* **React 18** – Biblioteca principal para la interfaz de usuario
* **React Router DOM** – Navegación entre páginas
* **Redux Toolkit** – Gestión de estado global
* **SCSS** – Preprocesador CSS para estilos personalizados
* **Bootstrap Icons** – Iconografía

### Herramientas de Desarrollo
* **Create React App** – Configuración inicial del proyecto
* **Git y GitHub** – Control de versiones
* **ESLint** – Linting y calidad de código

### Datos
* **API REST** – Para la gestión y consulta de productos
* *(En producción se conectaría a un sistema de inventario real)*

---

## 📁 Estructura del Proyecto

```
la-maga/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Navbar/
│   │   ├── ProductCard/
│   │   ├── ProductList/
│   │   └── Footer/
│   ├── pages/              # Páginas principales
│   │   ├── HomePage/
│   │   ├── AllProductsPage/
│   │   ├── CategoryProductPage/
│   │   ├── ProductDetailPage/
│   │   ├── SearchPage/
│   │   └── AboutPage/
│   ├── store/              # Redux store y slices
│   │   ├── store.js
│   │   ├── productSlice.js
│   │   ├── categorySlice.js
│   │   └── searchSlice.js
│   ├── App.js
│   ├── App.scss
│   └── index.js
├── package.json
└── README.md
```

---

## 🚀 Instalación y Uso

### Prerrequisitos
* Node.js (versión 14 o superior)
* npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/LGsusOMG/LaMaga.git
   cd LaMaga
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm start
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

---

## 📦 Scripts Disponibles

```bash
npm start          # Inicia el servidor de desarrollo
npm run build      # Crea la versión de producción
npm test           # Ejecuta las pruebas
npm run eject      # Expone la configuración de CRA
```

---

## 🎨 Características de Diseño

* Paleta de colores vibrante (morado/azul con gradientes)
* Diseño limpio y moderno
* Animaciones suaves para mejor experiencia
* Tipografía clara y legible
* Interfaz intuitiva inspirada en tiendas de conveniencia
* Totalmente responsivo

---

## 🔄 Estado de Redux

El proyecto utiliza Redux Toolkit para gestionar:
* **Products**: Catálogo de productos de la tienda
* **Categories**: Productos organizados por categoría
* **Search**: Resultados de búsqueda en el catálogo

---

## 💡 Funcionalidad del Sitio

Este es un **sitio informativo**, NO una tienda en línea. Los clientes pueden:
* ✅ Ver qué productos hay en tienda
* ✅ Consultar precios de referencia
* ✅ Buscar productos específicos
* ✅ Conocer promociones vigentes
* ✅ Obtener datos de contacto y ubicación

Los clientes deben **visitar la tienda física** para realizar compras.

---

## 📱 Diseño Responsivo

Esta tienda es **100% responsiva** y se adapta a cualquier dispositivo:

### Dispositivos Soportados
- 📱 **Móviles**: 320px - 767px
- 📱 **Tablets**: 768px - 1023px
- 💻 **Laptops**: 1024px - 1199px
- 💻 **Desktops**: 1200px - 1399px
- 💻 **Pantallas 4K**: 1400px+

### Características Responsivas
✅ Layout adaptable con Grid y Flexbox
✅ Tipografía escalable según el dispositivo
✅ Imágenes que se adaptan al contenedor
✅ Navegación touch-friendly con botones de 44x44px
✅ Sin scroll horizontal involuntario
✅ Carga rápida en todos los dispositivos

### Testing
- Probado en Chrome DevTools (F12 → Ctrl+Shift+M)
- Validado en múltiples resoluciones
- Compatible con navegadores modernos

Para más información sobre el sistema responsivo, consulta:
- 📖 [INDEX.md](INDEX.md) - Índice de documentación
- 📖 [VISUAL_SUMMARY.md](VISUAL_SUMMARY.md) - Resumen visual
- 📖 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Referencia rápida

---

## 🌟 Próximas Mejoras

- [ ] Integración con sistema de inventario real
- [ ] Notificaciones de nuevos productos
- [ ] Newsletter con promociones
- [ ] Progressive Web App (PWA)
- [ ] Modo oscuro

---

**¡Visita La Maga desde cualquier dispositivo! 📱💻✨**