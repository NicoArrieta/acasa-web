import { Product, Order, Category, DonWebFtpSettings } from "./types";
import { INITIAL_PRODUCTS, INITIAL_ORDERS, CATEGORIES } from "./data";

const STORAGE_KEYS = {
  PRODUCTS: "acasa_products_v1",
  ORDERS: "acasa_orders_v1",
  CATEGORIES: "acasa_categories_v1",
  DONWEB: "acasa_donweb_config_v1",
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
    const stored = JSON.parse(item) as Product[];
    // Merge any missing initial products so newly added items appear automatically
    const storedIds = new Set(stored.map((p) => p.id));
    const missing = INITIAL_PRODUCTS.filter((p) => !storedIds.has(p.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}
