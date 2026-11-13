export interface MediaItem {
  id: string;
  name: string;
  alt: string;
  url: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  mimeType: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductVariation {
  id: string;
  name: string; // e.g. "Paraíso", "Petiribí", "Lino Gris"
  type: "madera" | "tapizado" | "color" | "medida" | "otro";
  priceAdjustment?: number; // difference in price
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  sku?: string;
  shortDescription?: string;
  description: string;
  regularPrice: number;
  salePrice?: number;
  featured?: boolean;
  isNewArrival?: boolean;
  linea?: "practica" | "premium";
  category: string; // category slug
  subcategory?: string;
  images: string[];
  stock: number;
  variations?: {
    name: string;
    options: ProductVariation[];
  }[];
  dimensions?: {
    weightKg: number;
    widthCm: number;
    heightCm: number;
    depthCm: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  image?: string;
  subcategories?: { slug: string; name: string }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariations?: Record<string, string>; // e.g. { "madera": "petiribi", "tapizado": "lino" }
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  shippingMethod: string;
  shippingCost: number;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled";
  createdAt: string;
}

export interface DonWebFtpSettings {
  host: string;
  user: string;
  password?: string;
  port: number;
  remoteDir: string;
  publicUrlPrefix: string; // e.g. "https://media.acasatienda.com.ar/uploads"
}
