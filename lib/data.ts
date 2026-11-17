import initialProductsJson from "./initialProducts.json";
import { Category, Product, Order, GlobalAttribute } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "exterior",
    slug: "exterior",
    name: "EXTERIOR",
    image: "https://acasatienda.com.ar/wp-content/uploads/2026/10/Exterior.webp",
    subcategories: [],
  },
  {
    id: "dormitorio",
    slug: "dormitorio",
    name: "DORMITORIO",
    image: "https://acasatienda.com.ar/wp-content/uploads/2026/10/Dormitorio.webp",
    subcategories: [
      { slug: "botineros", name: "Botineros" },
      { slug: "camas", name: "Camas" },
      { slug: "comodas", name: "Comodas Y Cajoneras" },
      { slug: "kids", name: "Linea Juvenil & Kids" },
      { slug: "mesas-luz", name: "Mesas De Luz" },
      { slug: "pie-cama", name: "Pie De Cama" },
      { slug: "placares", name: "Placares" },
      { slug: "respaldos", name: "Respaldos Y Box" },
    ],
  },
  {
    id: "deco",
    slug: "deco",
    name: "DECO",
    image: "https://acasatienda.com.ar/wp-content/uploads/2026/10/deco.webp",
    subcategories: [
      { slug: "alfombras", name: "Alfombra" },
      { slug: "accesorios", name: "Accesorio Deco" },
      { slug: "cestos", name: "Cestos Y Canastos" },
      { slug: "espejos", name: "Espejos" },
      { slug: "lamparas", name: "Lamparas" },
      { slug: "mantas", name: "Mantas" },
      { slug: "percheros", name: "Percheros" },
    ],
  },
  {
    id: "living",
    slug: "living",
    name: "LIVING",
    image: "https://acasatienda.com.ar/wp-content/uploads/2026/10/Living.webp",
    subcategories: [
      { slug: "esquineros", name: "Esquineros" },
      { slug: "puff-cama", name: "Puff & Puff Cama" },
      { slug: "sofa-cama", name: "Sofa Cama" },
      { slug: "poltronas", name: "1 Cuerpo & Poltronas" },
      { slug: "sofas", name: "2 Cuerpos / 3 Cuerpos" },
      { slug: "centro-livings", name: "Centro Livings" },
      { slug: "recibidores", name: "Recibidores" },
      { slug: "mesas-arrime", name: "Mesas De Arrime" },
    ],
  },
  {
    id: "comedor",
    slug: "comedor",
    name: "COMEDOR",
    image: "https://acasatienda.com.ar/wp-content/uploads/2026/10/Comedor.webp",
    subcategories: [
      { slug: "bahiut", name: "Bahiut" },
      { slug: "banquetas", name: "Banquetas" },
      { slug: "mesas", name: "Mesas" },
      { slug: "pets", name: "Pets" },
      { slug: "sillas", name: "Sillas" },
    ],
  },
  {
    id: "muebles-tv",
    slug: "muebles-tv",
    name: "MUEBLES TV",
    image: "https://acasatienda.com.ar/wp-content/uploads/2026/10/Mueble-de-TV.webp",
    subcategories: [
      { slug: "paneles-tv", name: "Paneles De TV" },
      { slug: "rack-tv", name: "Rack De TV" },
      { slug: "separadores", name: "Separadores De Ambiente" },
    ],
  },
  {
    id: "colchones",
    slug: "colchones",
    name: "COLCHONES",
    image: "https://acasatienda.com.ar/wp-content/uploads/2026/10/Colchones.webp",
    subcategories: [
      { slug: "almohadas", name: "Almohadas & Accesorios" },
      { slug: "bajos-sommier", name: "Bajos Sommier" },
      { slug: "conjuntos", name: "Conjuntos" },
      { slug: "espuma", name: "Espuma" },
      { slug: "resorte", name: "Resorte" },
    ],
  },
];

export const INITIAL_ATTRIBUTES: GlobalAttribute[] = [
  {
    id: "attr_madera",
    name: "Madera",
    slug: "madera",
    terms: [
      { id: "term_paraiso", name: "Paraíso Natural", slug: "paraiso-natural" },
      { id: "term_petiribi", name: "Petiribí Macizo", slug: "petiribi-macizo" },
      { id: "term_guatambu", name: "Guatambú Lustrado", slug: "guatambu-lustrado" },
      { id: "term_roble", name: "Roble Americano", slug: "roble-americano" },
    ],
  },
  {
    id: "attr_tapizado",
    name: "Tapizado",
    slug: "tapizado",
    terms: [
      { id: "term_lino_crudo", name: "Lino Crudo Antimancha", slug: "lino-crudo" },
      { id: "term_lino_gris", name: "Lino Gris Nube", slug: "lino-gris" },
      { id: "term_pana_visone", name: "Pana Visone Teflón", slug: "pana-visone" },
      { id: "term_boucle", name: "Bouclé Off-White", slug: "boucle-off-white" },
    ],
  },
  {
    id: "attr_medida",
    name: "Medida",
    slug: "medida",
    terms: [
      { id: "term_140", name: "1.40 x 0.80 m", slug: "1-40-x-0-80" },
      { id: "term_160", name: "1.60 x 0.90 m", slug: "1-60-x-0-90" },
      { id: "term_180", name: "1.80 x 0.90 m", slug: "1-80-x-0-90" },
      { id: "term_200", name: "2.00 x 1.00 m", slug: "2-00-x-1-00" },
    ],
  },
  {
    id: "attr_color",
    name: "Color",
    slug: "color",
    terms: [
      { id: "term_natural", name: "Natural Lustre", slug: "natural", colorHex: "#d4b886" },
      { id: "term_nogal", name: "Nogal Oscuro", slug: "nogal", colorHex: "#5c4033" },
      { id: "term_blanco", name: "Blanco Nórdico", slug: "blanco", colorHex: "#f8f9fa" },
      { id: "term_negro", name: "Negro Mate", slug: "negro", colorHex: "#1a1a1a" },
    ],
  },
];

export const INITIAL_PRODUCTS: Product[] = initialProductsJson as Product[];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1024",
    orderNumber: "#1024",
    customerName: "Mariana Gómez",
    customerEmail: "mariana.gomez@gmail.com",
    customerPhone: "+54 11 4455-6677",
    shippingAddress: {
      street: "Av. Santa Fe 3420 5B",
      city: "Palermo",
      province: "CABA",
      postalCode: "1425",
    },
    shippingMethod: "OCA - Envío a Domicilio",
    shippingCost: 8500,
    paymentMethod: "GOcuotas (3 cuotas)",
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 2,
        selectedVariations: { Madera: "Petiribí", Tapizado: "Lino Gris" },
      },
    ],
    subtotal: 560000,
    total: 568500,
    status: "processing",
    createdAt: "2026-11-10 10:30",
  },
  {
    id: "ord-1023",
    orderNumber: "#1023",
    customerName: "Lucas Benítez",
    customerEmail: "lucasb@outlook.com",
    customerPhone: "+54 11 9988-1122",
    shippingAddress: {
      street: "Calle 48 Nº 812",
      city: "La Plata",
      province: "Buenos Aires",
      postalCode: "1900",
    },
    shippingMethod: "Retiro en Sucursal",
    shippingCost: 0,
    paymentMethod: "Transferencia Bancaria",
    items: [
      {
        product: INITIAL_PRODUCTS[3],
        quantity: 1,
      },
    ],
    subtotal: 299000,
    total: 299000,
    status: "shipped",
    createdAt: "2026-11-09 17:15",
  },
];
