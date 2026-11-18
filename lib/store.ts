import { Product, Order, Category, DonWebFtpSettings, MediaItem, GlobalAttribute } from "./types";
import { INITIAL_PRODUCTS, INITIAL_ORDERS, CATEGORIES, INITIAL_ATTRIBUTES } from "./data";

const STORAGE_KEYS = {
  PRODUCTS: "acasa_products_v2",
  ORDERS: "acasa_orders_v1",
  CATEGORIES: "acasa_categories_v1",
  ATTRIBUTES: "acasa_attributes_v1",
  DONWEB: "acasa_donweb_config_v1",
  MEDIA: "acasa_media_library_v1",
};

export const DEFAULT_DONWEB_SETTINGS: DonWebFtpSettings = {
  host: "ftp.acasatienda.com.ar",
  user: "u123456789_media",
  port: 21,
  remoteDir: "/public_html/wp-content/uploads/2026/11",
  publicUrlPrefix: "https://acasatienda.com.ar/wp-content/uploads/2026/11",
};

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!item) return INITIAL_PRODUCTS;
    let stored = JSON.parse(item) as Product[];

    // Ensure sample products get variations if they don't have them in localStorage yet
    let hasChanges = false;
    stored = stored.map((p) => {
      const initial = INITIAL_PRODUCTS.find((init) => init.id === p.id);
      if (initial && initial.productVariations && (!p.productVariations || p.productVariations.length === 0)) {
        hasChanges = true;
        p = {
          ...p,
          productType: initial.productType,
          attributes: initial.attributes,
          productVariations: initial.productVariations,
        };
      }
      if (initial && p.entrega48hs === undefined && initial.entrega48hs !== undefined) {
        hasChanges = true;
        p = {
          ...p,
          entrega48hs: initial.entrega48hs,
        };
      }
      if (initial && initial.linea && p.linea !== initial.linea) {
        hasChanges = true;
        p = {
          ...p,
          linea: initial.linea,
        };
      }
      return p;
    });

    // Merge any missing initial products so newly added items appear automatically
    const storedIds = new Set(stored.map((p) => p.id));
    const missing = INITIAL_PRODUCTS.filter((p) => !storedIds.has(p.id));
    if (missing.length > 0 || hasChanges) {
      const merged = missing.length > 0 ? [...stored, ...missing] : stored;
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
      } catch (_) {}
      return merged;
    }
    return stored;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new Event("products_updated"));
  } catch (err) {
    console.error("Error saving products:", err);
  }
}

export function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return INITIAL_ORDERS;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return item ? JSON.parse(item) : INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: Order[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event("orders_updated"));
  } catch (err) {
    console.error("Error saving orders:", err);
  }
}

export function getStoredDonWebConfig(): DonWebFtpSettings {
  if (typeof window === "undefined") return DEFAULT_DONWEB_SETTINGS;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.DONWEB);
    return item ? JSON.parse(item) : DEFAULT_DONWEB_SETTINGS;
  } catch {
    return DEFAULT_DONWEB_SETTINGS;
  }
}

export function saveStoredDonWebConfig(cfg: DonWebFtpSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.DONWEB, JSON.stringify(cfg));
  } catch (err) {
    console.error("Error saving DonWeb config:", err);
  }
}


export function getStoredCategories(): Category[] {
  if (typeof window === "undefined") return CATEGORIES;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!item) {
      saveStoredCategories(CATEGORIES);
      return CATEGORIES;
    }
    const stored = JSON.parse(item) as Category[];
    const storedSlugs = new Set(stored.map((c) => c.slug));
    const missing = CATEGORIES.filter((c) => !storedSlugs.has(c.slug));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      saveStoredCategories(merged);
      return merged;
    }
    return stored;
  } catch {
    return CATEGORIES;
  }
}

export function saveStoredCategories(categories: Category[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    window.dispatchEvent(new Event("categories_updated"));
  } catch (err) {
    console.error("Error saving categories:", err);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitialMediaItems(): MediaItem[] {
  const map = new Map<string, MediaItem>();
  
  // Extract images from INITIAL_PRODUCTS
  INITIAL_PRODUCTS.forEach((prod) => {
    prod.images.forEach((img, idx) => {
      if (img && !map.has(img)) {
        const fileName = img.split('/').pop() || `${prod.slug}-${idx + 1}.webp`;
        map.set(img, {
          id: `med_${Math.abs(img.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`,
          name: fileName,
          alt: `${prod.title} - Vista ${idx + 1}`,
          url: img,
          sizeBytes: 125000,
          width: 1200,
          height: 1200,
          mimeType: 'image/webp',
          createdAt: prod.createdAt || new Date().toISOString(),
          updatedAt: prod.updatedAt || new Date().toISOString(),
        });
      }
    });
  });

  return Array.from(map.values());
}

export function getStoredMedia(): MediaItem[] {
  if (typeof window === "undefined") return getInitialMediaItems();
  try {
    const item = localStorage.getItem(STORAGE_KEYS.MEDIA);
    if (!item) {
      const initial = getInitialMediaItems();
      saveStoredMedia(initial);
      return initial;
    }
    const stored = JSON.parse(item) as MediaItem[];
    return stored;
  } catch {
    return getInitialMediaItems();
  }
}

export function saveStoredMedia(items: MediaItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(items));
    window.dispatchEvent(new Event("media_updated"));
  } catch (err) {
    console.error("Error saving media:", err);
  }
}

export function getStoredAttributes(): GlobalAttribute[] {
  if (typeof window === "undefined") return INITIAL_ATTRIBUTES;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.ATTRIBUTES);
    if (!item) {
      saveStoredAttributes(INITIAL_ATTRIBUTES);
      return INITIAL_ATTRIBUTES;
    }
    const stored = JSON.parse(item) as GlobalAttribute[];
    const storedSlugs = new Set(stored.map((a) => a.slug));
    const missing = INITIAL_ATTRIBUTES.filter((a) => !storedSlugs.has(a.slug));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      saveStoredAttributes(merged);
      return merged;
    }
    return stored;
  } catch {
    return INITIAL_ATTRIBUTES;
  }
}

export function saveStoredAttributes(attributes: GlobalAttribute[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ATTRIBUTES, JSON.stringify(attributes));
    window.dispatchEvent(new Event("attributes_updated"));
  } catch (err) {
    console.error("Error saving attributes:", err);
  }
}
