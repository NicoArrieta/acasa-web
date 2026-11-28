import { Product, Order, Category, DonWebFtpSettings, MediaItem, GlobalAttribute } from "./types";
import { INITIAL_PRODUCTS, INITIAL_ORDERS, CATEGORIES, INITIAL_ATTRIBUTES } from "./data";
import { supabase } from "./supabase";

const STORAGE_KEYS = {
  PRODUCTS: "acasa_products_v3",
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

export function mapSupabaseRowToProduct(row: any): Product {
  const categories = Array.isArray(row.categories) && row.categories.length > 0 
    ? row.categories 
    : (row.category ? [row.category] : []);
  const subcategories = Array.isArray(row.subcategories) && row.subcategories.length > 0
    ? row.subcategories
    : (row.subcategory ? [row.subcategory] : []);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    sku: row.sku || undefined,
    shortDescription: row.short_description || "",
    description: row.description || "",
    regularPrice: Number(row.regular_price || 0),
    salePrice: row.sale_price !== null && row.sale_price !== undefined ? Number(row.sale_price) : undefined,
    category: categories[0] || row.category || "",
    categories: categories,
    subcategory: subcategories[0] || row.subcategory || "",
    subcategories: subcategories,
    linea: row.linea || "practica",
    stock: row.stock !== null && row.stock !== undefined ? Number(row.stock) : 10,
    featured: Boolean(row.featured),
    isNewArrival: Boolean(row.is_new_arrival),
    entrega48hs: Boolean(row.entrega48hs),
    productType: row.product_type || "simple",
    images: Array.isArray(row.images) ? row.images : [],
    variations: Array.isArray(row.variations) ? row.variations : [],
    attributes: Array.isArray(row.attributes) ? row.attributes : [],
    productVariations: Array.isArray(row.product_variations) ? row.product_variations : [],
    dimensions: row.dimensions || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProductToSupabaseRow(p: Product): any {
  const cats = p.categories && p.categories.length > 0 ? p.categories : (p.category ? [p.category] : []);
  const subcats = p.subcategories && p.subcategories.length > 0 ? p.subcategories : (p.subcategory ? [p.subcategory] : []);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    sku: p.sku || null,
    short_description: p.shortDescription || "",
    description: p.description || "",
    regular_price: Number(p.regularPrice || 0),
    sale_price: p.salePrice !== undefined && p.salePrice !== null ? Number(p.salePrice) : null,
    category: cats[0] || p.category || "",
    categories: cats,
    subcategory: subcats[0] || p.subcategory || "",
    subcategories: subcats,
    linea: p.linea || "practica",
    stock: Number(p.stock ?? 10),
    featured: Boolean(p.featured),
    is_new_arrival: Boolean(p.isNewArrival),
    entrega48hs: Boolean(p.entrega48hs),
    product_type: p.productType || "simple",
    images: p.images || [],
    variations: p.variations || [],
    attributes: p.attributes || [],
    product_variations: p.productVariations || [],
    dimensions: p.dimensions || {},
    updated_at: new Date().toISOString(),
  };
}

let memoryProductsCache: Product[] | null = null;
let isFetchingFromSupabase = false;

export async function fetchProducts(): Promise<Product[]> {
  try {
    const allRows: any[] = [];
    let page = 0;
    const pageSize = 1000;
    
    while (true) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching products from Supabase:", error);
        break;
      }
      if (!data || data.length === 0) break;
      allRows.push(...data);
      if (data.length < pageSize) break;
      page++;
    }

    if (allRows.length > 0) {
      const mapped = allRows.map(mapSupabaseRowToProduct);
      memoryProductsCache = mapped;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("products_updated"));
      }
      return mapped;
    }
  } catch (err) {
    console.error("Failed to fetch products from Supabase:", err);
  }

  return memoryProductsCache || INITIAL_PRODUCTS;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (memoryProductsCache) {
    const found = memoryProductsCache.find((p) => p.slug === slug);
    if (found) return found;
  }
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      const mapped = mapSupabaseRowToProduct(data);
      if (memoryProductsCache) {
        const idx = memoryProductsCache.findIndex((p) => p.slug === slug || p.id === mapped.id);
        if (idx > -1) {
          memoryProductsCache[idx] = mapped;
        } else {
          memoryProductsCache.unshift(mapped);
        }
      }
      return mapped;
    }
  } catch (err) {
    console.error("Error fetching single product by slug:", err);
  }
  return INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;
}

export async function saveProductToSupabase(product: Product): Promise<{ success: boolean; data?: Product; error?: any }> {
  try {
    const row = mapProductToSupabaseRow(product);
    const { data, error } = await supabase
      .from("products")
      .upsert(row, { onConflict: "slug" })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase upsert product error:", error);
      return { success: false, error };
    }

    const saved = data ? mapSupabaseRowToProduct(data) : product;

    // Update memory cache
    if (!memoryProductsCache) {
      memoryProductsCache = [...INITIAL_PRODUCTS];
    }
    const idx = memoryProductsCache.findIndex((p) => p.id === saved.id || p.slug === saved.slug);
    if (idx > -1) {
      memoryProductsCache[idx] = saved;
    } else {
      memoryProductsCache.unshift(saved);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("products_updated"));
    }

    return { success: true, data: saved };
  } catch (err) {
    console.error("saveProductToSupabase exception:", err);
    return { success: false, error: err };
  }
}

export async function deleteProductFromSupabase(id: string): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete product error:", error);
      return { success: false, error };
    }

    if (memoryProductsCache) {
      memoryProductsCache = memoryProductsCache.filter((p) => p.id !== id);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("products_updated"));
    }
    return { success: true };
  } catch (err) {
    console.error("deleteProductFromSupabase exception:", err);
    return { success: false, error: err };
  }
}

export function getStoredProducts(): Product[] {
  if (memoryProductsCache) return memoryProductsCache;
  if (typeof window === "undefined") return INITIAL_PRODUCTS;

  // Trigger background fetch if not already in progress
  if (!isFetchingFromSupabase) {
    isFetchingFromSupabase = true;
    fetchProducts().finally(() => {
      isFetchingFromSupabase = false;
    });
  }

  return INITIAL_PRODUCTS;
}

export function saveStoredProducts(products: Product[]): void {
  memoryProductsCache = products;
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event("products_updated"));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products.slice(0, 100)));
  } catch (err) {
    // ignore quota errors gracefully
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
