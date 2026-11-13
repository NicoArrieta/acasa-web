# Acasa Tienda - E-commerce a Medida

Tienda online y Panel de Administración desarrollados a medida en **Next.js + TypeScript + Tailwind CSS** para **Acasa Tienda** (`acasatienda.com.ar`).

Reemplaza la estructura previa basada en WordPress/WooCommerce y Elementor, ofreciendo máxima velocidad, código limpio y total flexibilidad para cambios.

---

## 🚀 Características Principales

### 1. Storefront Público (Copia fiel de `acasatienda.com.ar`)
- **Header:** Barra de avisos (3 y 6 cuotas sin interés / Envíos a todo el país), logotipo oficial en WebP, mega-menú con categorías y subcategorías, buscador interactivo y drawer de carrito deslizable.
- **Home:**
  - Hero banner "NUEVOS INGRESOS".
  - Grilla interactiva "ÁREAS PARA TU HOGAR" (Muebles TV, Living, Exterior, Dormitorio, Deco, Comedor, Colchones).
  - Carrusel "LO MÁS ELEGIDO" (Puff Cama, Sofá Cama But Carrito, Sofá Cama Ital).
  - Vitrina "DISEÑO Y CALIDAD" (Sillas, Sillones, Poltronas, Sets de exterior).
  - Banner de marca "Diseño que acompaña tu forma de vivir".
  - Bloque de garantías y medios de pago.
  - Footer oficial con sucursales (Belgrano y Pilar con enlaces a Google Maps), Instagram y botón flotante de WhatsApp.
- **Catálogo (`/productos`):** Filtrado por ambientes, subcategorías, buscador por texto/SKU y ordenamiento por precio o fecha.
- **Ficha de Producto (`/producto/[slug]`):**
  - Galería de fotos con selector de miniaturas.
  - Selector dinámico de variantes (Madera: Petiribí, Paraíso; Tapizado: Lino, Pana) con ajuste automático de precios.
  - Simulador de cuotas con débito GOcuotas.
  - Cotizador de envíos OCA por código postal.
  - Selector de cantidades y botón "Agregar al Carrito".
- **Checkout (`/checkout`):**
  - Formulario de contacto y envío.
  - Métodos de envío: OCA a Domicilio, OCA a Sucursal, Retiro en Showroom.
  - Métodos de pago: GOcuotas (débito en cuotas), Tarjetas y Transferencia (10% OFF).
  - Generación automática de orden con número de pedido.

---

### 2. Panel de Administración (`/admin` - Estilo WooCommerce)
- **Escritorio / Dashboard:** Métricas en tiempo real de facturación, pedidos pendientes y productos activos.
- **Gestor de Productos:**
  - Crear, editar, duplicar y eliminar productos.
  - Control de precios normales y de oferta.
  - Gestión de stock y variantes.
  - Carga de imágenes directas a DonWeb.
- **Gestor de Pedidos:** Listado de órdenes con cambio de estado (*Pendiente, Procesando, Enviado, Completado, Cancelado*).
- **Subida de Imágenes a DonWeb:**
  - Conexión FTP con el hosting de DonWeb (`/public_html/uploads`).
  - Uploader drag & drop con generación de URL pública lista para copiar y pegar en los productos.

---

## 🛠️ Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo en http://localhost:3000
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start
```
