"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Product,
  Category,
  GlobalAttribute,
  Order,
  DonWebFtpSettings,
} from "@/lib/types";
import { CATEGORIES } from "@/lib/data";
import MediaLibraryView from "@/components/MediaLibraryView";
import CategoriesManagerView from "@/components/CategoriesManagerView";
import AttributesManagerView from "@/components/AttributesManagerView";
import ProductVariationsManager from "@/components/ProductVariationsManager";
import MediaPickerModal from "@/components/MediaPickerModal";
import { uploadMediaItem } from "@/lib/media";
import { getStoredMedia, getStoredCategories, saveStoredCategories, getStoredAttributes, saveStoredAttributes } from "@/lib/store";
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredOrders,
  saveStoredOrders,
  getStoredDonWebConfig,
  saveStoredDonWebConfig,
  formatCurrency,
} from "@/lib/store";
import {
  AnalyticsSummary,
  getAnalyticsSummary,
  supabase,
} from "@/lib/supabase";
import {
  LayoutDashboard,
  FolderTree,
  SlidersHorizontal,
  Package,
  ShoppingCart,
  UploadCloud,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Search,
  Clock,
  Save,
  X,
  Upload,
  MessageCircle,
  Users,
  Globe,
  Zap,
  Sparkles,
  RefreshCw,
  TrendingUp,
  MousePointer,
  Activity,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Images,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Menu,
  MapPin,
  Check,
  Image as ImageIcon,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "categories" | "attributes" | "media" | "orders" | "donweb">("dashboard");
  const [attributesList, setAttributesList] = useState<GlobalAttribute[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [selectedSubcatFilter, setSelectedSubcatFilter] = useState<string>("all");
  const [carouselPreviewIdx, setCarouselPreviewIdx] = useState(0);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [mediaLibraryCount, setMediaLibraryCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [donwebConfig, setDonwebConfig] = useState<DonWebFtpSettings>(getStoredDonWebConfig());

  // Analytics from Supabase
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "all">("7d");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Search & filter
  const [productSearch, setProductSearch] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");

  // Product Form state (Inline Section, NOT Modal)
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // DonWeb upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const data = await getAnalyticsSummary(timeRange);
      setAnalytics(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    setProducts(getStoredProducts());
    setOrders(getStoredOrders());
    setDonwebConfig(getStoredDonWebConfig());
  }, []);

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchAnalytics();
    }
  }, [timeRange, activeTab]);

  
  useEffect(() => {
    setAttributesList(getStoredAttributes());
    const handleAttrUpdate = () => {
      setAttributesList(getStoredAttributes());
    };
    window.addEventListener("attributes_updated", handleAttrUpdate);
    return () => window.removeEventListener("attributes_updated", handleAttrUpdate);
  }, []);

  useEffect(() => {
    setCategoriesList(getStoredCategories());
    const handleCatUpdate = () => {
      setCategoriesList(getStoredCategories());
    };
    window.addEventListener("categories_updated", handleCatUpdate);
    return () => window.removeEventListener("categories_updated", handleCatUpdate);
  }, []);

  useEffect(() => {
    const m = getStoredMedia();
    setMediaLibraryCount(m.length);
    const handleUpdate = () => {
      const list = getStoredMedia();
      setMediaLibraryCount(list.length);
    };
    window.addEventListener("media_updated", handleUpdate);
    return () => window.removeEventListener("media_updated", handleUpdate);
  }, []);

  const handleUploadToProduct = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const item = await uploadMediaItem(files[i]);
        newUrls.push(item.url);
      } catch (err) {
        console.error(err);
      }
    }
    const currentImages = editingProduct.images || [];
    setEditingProduct({
      ...editingProduct,
      images: [...currentImages, ...newUrls],
    });
  };

  const handleAddManualUrl = () => {
    if (!manualImageUrl.trim() || !editingProduct) return;
    const currentImages = editingProduct.images || [];
    setEditingProduct({
      ...editingProduct,
      images: [...currentImages, manualImageUrl.trim()],
    });
    setManualImageUrl("");
  };

  const handleMoveProductImage = (idx: number, direction: -1 | 1) => {
    if (!editingProduct || !editingProduct.images) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= editingProduct.images.length) return;
    const list = [...editingProduct.images];
    const temp = list[idx];
    list[idx] = list[newIdx];
    list[newIdx] = temp;
    setEditingProduct({ ...editingProduct, images: list });
    setCarouselPreviewIdx(newIdx);
  };

  const handleRemoveProductImage = (idx: number) => {
    if (!editingProduct || !editingProduct.images) return;
    const list = editingProduct.images.filter((_, i) => i !== idx);
    setEditingProduct({ ...editingProduct, images: list });
    if (carouselPreviewIdx >= list.length) {
      setCarouselPreviewIdx(Math.max(0, list.length - 1));
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePrice =
      editingProduct?.regularPrice ||
      (editingProduct?.productVariations && editingProduct.productVariations.length > 0
        ? editingProduct.productVariations[0].regularPrice
        : 0);

    if (!editingProduct?.title || !effectivePrice) {
      alert("Por favor completá el nombre y precio del producto (o definí precios en las variaciones).");
      return;
    }

    const currentList = [...products];
    const slug =
      editingProduct.slug ||
      editingProduct.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    let targetProduct: Product;

    const finalCats =
      editingProduct.categories && editingProduct.categories.length > 0
        ? editingProduct.categories
        : [editingProduct.category || "comedor"];

    const finalSubcats =
      editingProduct.subcategories && editingProduct.subcategories.length > 0
        ? editingProduct.subcategories
        : editingProduct.subcategory
        ? [editingProduct.subcategory]
        : [];

    if (editingProduct.id) {
      // Update
      const idx = currentList.findIndex((p) => p.id === editingProduct.id);
      targetProduct = {
        ...(currentList[idx] as Product),
        ...(editingProduct as Product),
        productType: editingProduct.productType || "simple",
        attributes: editingProduct.attributes || [],
        productVariations: editingProduct.productVariations || [],
        category: finalCats[0],
        categories: finalCats,
        subcategory: finalSubcats[0] || "",
        subcategories: finalSubcats,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      if (idx > -1) {
        currentList[idx] = targetProduct;
      }
    } else {
      // Create new
      targetProduct = {
        id: `prod-${Date.now()}`,
        slug,
        title: editingProduct.title,
        sku: editingProduct.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
        shortDescription: editingProduct.shortDescription || "",
        description: editingProduct.description || "",
        regularPrice: Number(editingProduct.regularPrice || effectivePrice),
        salePrice: editingProduct.salePrice ? Number(editingProduct.salePrice) : editingProduct.productVariations?.[0]?.salePrice,
        category: finalCats[0],
        categories: finalCats,
        subcategory: finalSubcats[0] || "",
        subcategories: finalSubcats,
        linea: editingProduct.linea || "practica",
        productType: editingProduct.productType || "simple",
        attributes: editingProduct.attributes || [],
        productVariations: editingProduct.productVariations || [],
        stock: editingProduct.stock ? Number(editingProduct.stock) : 10,
        images:
          editingProduct.images && editingProduct.images.length > 0
            ? editingProduct.images
            : ["https://acasatienda.com.ar/wp-content/uploads/2026/10/Living.webp"],
        variations: editingProduct.variations || [],
        dimensions: editingProduct.dimensions || { weightKg: 5, widthCm: 50, heightCm: 80, depthCm: 50 },
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      currentList.unshift(targetProduct);
    }

    setProducts(currentList);
    saveStoredProducts(currentList);

    // Sync to Supabase in background
    try {
      await supabase.from("products").upsert({
        id: targetProduct.id,
        slug: targetProduct.slug,
        title: targetProduct.title,
        sku: targetProduct.sku,
        short_description: targetProduct.shortDescription,
        description: targetProduct.description,
        regular_price: targetProduct.regularPrice,
        sale_price: targetProduct.salePrice,
        category: targetProduct.category,
        subcategory: targetProduct.subcategory,
        linea: targetProduct.linea,
        stock: targetProduct.stock,
        images: targetProduct.images,
        variations: targetProduct.variations,
        dimensions: targetProduct.dimensions,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.debug("Supabase product sync:", err);
    }

    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("¿Estás seguro de que querés eliminar este producto?")) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      saveStoredProducts(updated);
      try {
        await supabase.from("products").delete().eq("id", id);
      } catch (_) {}
    }
  };

  const handleDuplicateProduct = (prod: Product) => {
    const duplicated: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      slug: `${prod.slug}-copia`,
      title: `${prod.title} (Copia)`,
      sku: `${prod.sku || "PROD"}-COP`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    const updated = [duplicated, ...products];
    setProducts(updated);
    saveStoredProducts(updated);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order["status"]) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(updated);
    saveStoredOrders(updated);
  };

  // DonWeb upload handler
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage("Subiendo archivo a DonWeb...");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("ftpHost", donwebConfig.host);
    fd.append("ftpUser", donwebConfig.user);
    if (donwebConfig.password) fd.append("ftpPassword", donwebConfig.password);
    fd.append("ftpRemoteDir", donwebConfig.remoteDir);
    fd.append("publicUrlPrefix", donwebConfig.publicUrlPrefix);

    try {
      const res = await fetch("/api/admin/upload-donweb", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setUploadedUrls((prev) => [data.url, ...prev]);
        setUploadMessage("¡Imagen subida con éxito! URL lista para usar.");
      } else {
        setUploadMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setUploadMessage(`Error al subir: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDonwebConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredDonWebConfig(donwebConfig);
    alert("Configuración de DonWeb guardada exitosamente.");
  };

  const totalSales = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((acc, o) => acc + o.total, 0);
  const activeOrdersCount = orders.filter((o) => o.status === "processing" || o.status === "pending").length;

  const filteredProducts = products.filter((p) => {
    if (selectedCatFilter !== "all") {
      const matchCat =
        p.category === selectedCatFilter || (p.categories && p.categories.includes(selectedCatFilter));
      if (!matchCat) return false;
    }
    if (selectedSubcatFilter !== "all") {
      const matchSub =
        p.subcategory === selectedSubcatFilter || (p.subcategories && p.subcategories.includes(selectedSubcatFilter));
      if (!matchSub) return false;
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
    }
    return true;
  });

  const availableFilterSubcategories =
    selectedCatFilter !== "all"
      ? categoriesList.find((c) => c.slug === selectedCatFilter)?.subcategories || []
      : [];

  // Analytics totals & ratios
  const totalLineInteractions =
    (analytics?.practicaTotalViews ?? 0) +
    (analytics?.practicaEntries ?? 0) +
    (analytics?.premiumTotalViews ?? 0) +
    (analytics?.premiumEntries ?? 0);

  const practicaTotalScore =
    (analytics?.practicaTotalViews ?? 0) + (analytics?.practicaEntries ?? 0);
  const premiumTotalScore =
    (analytics?.premiumTotalViews ?? 0) + (analytics?.premiumEntries ?? 0);

  const practicaPct =
    totalLineInteractions > 0
      ? Math.round((practicaTotalScore / totalLineInteractions) * 100)
      : 50;
  const premiumPct = totalLineInteractions > 0 ? 100 - practicaPct : 50;

  const totalWa = analytics?.whatsappTotalClicks || 0;
  const waPracticaPct = totalWa > 0 ? Math.round(((analytics?.whatsappPracticaClicks || 0) / totalWa) * 100) : 0;
  const waPremiumPct = totalWa > 0 ? Math.round(((analytics?.whatsappPremiumClicks || 0) / totalWa) * 100) : 0;
  const waGeneralPct = totalWa > 0 ? Math.round(((analytics?.whatsappGeneralClicks || 0) / totalWa) * 100) : 0;

  const conversionRate =
    (analytics?.uniqueVisitors ?? 0) > 0
      ? (((analytics?.whatsappTotalClicks ?? 0) / (analytics?.uniqueVisitors ?? 1)) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="flex h-screen bg-[#fcfbfa] font-sans antialiased text-[#1a1a1a]">
      {/* 1. ACASA LUXURY ORANGE SIDEBAR */}
      <aside
        className={`bg-[#FC7D00] text-white flex flex-col flex-shrink-0 select-none shadow-xl transition-all duration-300 ease-in-out relative ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Brand identity header */}
        <div className={`border-b border-[#c45600] transition-all duration-300 ${sidebarCollapsed ? "p-3 py-4" : "p-6"}`}>
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center space-y-3">
              <Link href="/" target="_blank" className="group" title="Acasa Calidad y Diseño">
                <div className="bg-white p-2 rounded-xl shadow-sm inline-flex items-center justify-center">
                  <img
                    src="/logo-tight.png"
                    alt="Acasa"
                    className="h-6 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-white transition-colors"
                title="Expandir menú lateral"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <Link href="/" target="_blank" className="inline-block group">
                  <div className="bg-white px-5 py-3 rounded-2xl shadow-sm inline-flex items-center">
                    <img
                      src="/logoAcasaTienda.webp"
                      alt="Acasa Calidad y Diseño"
                      className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-white transition-colors ml-2 mt-1"
                  title="Colapsar menú lateral"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold tracking-wider text-white">
                  ADMIN SUITE · ACASA
                </span>
                <span className="text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-[#b85000] text-white font-bold tracking-wider">
                  V2.0
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav className={`flex-1 py-6 space-y-2 text-xs ${sidebarCollapsed ? "px-2" : "px-4"}`}>
          {/* Dashboard */}
          <button
            onClick={() => {
              setActiveTab("dashboard");
              setEditingProduct(null);
            }}
            title={sidebarCollapsed ? "Escritorio & Tablero" : undefined}
            className={`w-full flex items-center transition-all duration-200 text-left font-bold relative group ${
              sidebarCollapsed
                ? `justify-center py-3.5 rounded-2xl ${
                    activeTab === "dashboard"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
                : `space-x-3 px-4 py-3.5 rounded-2xl ${
                    activeTab === "dashboard"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
            }`}
          >
            <LayoutDashboard size={20} className={activeTab === "dashboard" ? "text-[#FC7D00]" : "text-white"} />
            {!sidebarCollapsed && <span className="tracking-wide text-[13px]">Escritorio & Tablero</span>}

            {sidebarCollapsed && (
              <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#0e0e10] text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Escritorio & Tablero
              </span>
            )}
          </button>

          {/* Products */}
          <button
            onClick={() => {
              setActiveTab("products");
            }}
            title={sidebarCollapsed ? "Catálogo de Productos" : undefined}
            className={`w-full flex items-center transition-all duration-200 text-left font-bold relative group ${
              sidebarCollapsed
                ? `justify-center py-3.5 rounded-2xl ${
                    activeTab === "products"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
                : `space-x-3 px-4 py-3.5 rounded-2xl ${
                    activeTab === "products"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
            }`}
          >
            <Package size={20} className={activeTab === "products" ? "text-[#FC7D00]" : "text-white"} />
            {!sidebarCollapsed && (
              <div className="flex-1 flex justify-between items-center">
                <span className="tracking-wide text-[13px]">Catálogo de Productos</span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    activeTab === "products" ? "bg-[#FC7D00] text-white" : "bg-[#b85000] text-white"
                  }`}
                >
                  {products.length}
                </span>
              </div>
            )}
            {sidebarCollapsed && (
              <>
                <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-[#b85000] text-white">
                  {products.length}
                </span>
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#0e0e10] text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Catálogo de Productos ({products.length})
                </span>
              </>
            )}
          </button>

                              {/* Categories */}
          <button
            onClick={() => {
              setActiveTab("categories");
              setEditingProduct(null);
            }}
            title={sidebarCollapsed ? "Gestión de Categorías" : undefined}
            className={`w-full flex items-center transition-all duration-200 text-left font-bold relative group ${
              sidebarCollapsed
                ? `justify-center py-3.5 rounded-2xl ${
                    activeTab === "categories"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
                : `space-x-3 px-4 py-3.5 rounded-2xl ${
                    activeTab === "categories"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
            }`}
          >
            <FolderTree size={20} className={activeTab === "categories" ? "text-[#FC7D00]" : "text-white"} />
            {!sidebarCollapsed && (
              <div className="flex-1 flex justify-between items-center">
                <span className="tracking-wide text-[13px]">Categorías</span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    activeTab === "categories" ? "bg-[#FC7D00] text-white" : "bg-[#b85000] text-white"
                  }`}
                >
                  {categoriesList.length}
                </span>
              </div>
            )}
            {sidebarCollapsed && (
              <>
                <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-[#b85000] text-white">
                  {categoriesList.length}
                </span>
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#0e0e10] text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Categorías ({categoriesList.length})
                </span>
              </>
            )}
          </button>

          {/* Attributes & Variations */}
          <button
            onClick={() => {
              setActiveTab("attributes");
              setEditingProduct(null);
            }}
            title={sidebarCollapsed ? "Atributos & Variaciones" : undefined}
            className={`w-full flex items-center transition-all duration-200 text-left font-bold relative group ${
              sidebarCollapsed
                ? `justify-center py-3.5 rounded-2xl ${
                    activeTab === "attributes"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
                : `space-x-3 px-4 py-3.5 rounded-2xl ${
                    activeTab === "attributes"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
            }`}
          >
            <SlidersHorizontal size={20} className={activeTab === "attributes" ? "text-[#FC7D00]" : "text-white"} />
            {!sidebarCollapsed && (
              <div className="flex-1 flex justify-between items-center">
                <span className="tracking-wide text-[13px]">Atributos</span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    activeTab === "attributes" ? "bg-[#FC7D00] text-white" : "bg-[#b85000] text-white"
                  }`}
                >
                  {attributesList.length}
                </span>
              </div>
            )}
            {sidebarCollapsed && (
              <>
                <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-[#b85000] text-white">
                  {attributesList.length}
                </span>
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#0e0e10] text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Atributos ({attributesList.length})
                </span>
              </>
            )}
          </button>

          {/* Media Library */}
          <button
            onClick={() => {
              setActiveTab("media");
              setEditingProduct(null);
            }}
            title={sidebarCollapsed ? "Biblioteca Multimedia" : undefined}
            className={`w-full flex items-center transition-all duration-200 text-left font-bold relative group ${
              sidebarCollapsed
                ? `justify-center py-3.5 rounded-2xl ${
                    activeTab === "media"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
                : `space-x-3 px-4 py-3.5 rounded-2xl ${
                    activeTab === "media"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
            }`}
          >
            <Images size={20} className={activeTab === "media" ? "text-[#FC7D00]" : "text-white"} />
            {!sidebarCollapsed && (
              <div className="flex-1 flex justify-between items-center">
                <span className="tracking-wide text-[13px]">Biblioteca Multimedia</span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    activeTab === "media" ? "bg-[#FC7D00] text-white" : "bg-[#b85000] text-white"
                  }`}
                >
                  {mediaLibraryCount}
                </span>
              </div>
            )}
            {sidebarCollapsed && (
              <>
                <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-[#b85000] text-white">
                  {mediaLibraryCount}
                </span>
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#0e0e10] text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Biblioteca Multimedia ({mediaLibraryCount})
                </span>
              </>
            )}
          </button>

          {/* Orders */}
          <button
            onClick={() => {
              setActiveTab("orders");
              setEditingProduct(null);
            }}
            title={sidebarCollapsed ? "Gestión de Pedidos" : undefined}
            className={`w-full flex items-center transition-all duration-200 text-left font-bold relative group ${
              sidebarCollapsed
                ? `justify-center py-3.5 rounded-2xl ${
                    activeTab === "orders"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
                : `space-x-3 px-4 py-3.5 rounded-2xl ${
                    activeTab === "orders"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
            }`}
          >
            <ShoppingCart size={20} className={activeTab === "orders" ? "text-[#FC7D00]" : "text-white"} />
            {!sidebarCollapsed && (
              <div className="flex-1 flex justify-between items-center">
                <span className="tracking-wide text-[13px]">Gestión de Pedidos</span>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeTab === "orders" ? "bg-[#FC7D00] text-white" : "bg-white text-[#FC7D00]"
                  }`}
                >
                  {activeOrdersCount > 0 ? activeOrdersCount : ""}
                </span>
              </div>
            )}
            {sidebarCollapsed && (
              <>
                {activeOrdersCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-white ring-2 ring-[#FC7D00]" />
                )}
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#0e0e10] text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Gestión de Pedidos {activeOrdersCount > 0 ? `(${activeOrdersCount})` : ""}
                </span>
              </>
            )}
          </button>

          {/* DonWeb */}
          <button
            onClick={() => {
              setActiveTab("donweb");
              setEditingProduct(null);
            }}
            title={sidebarCollapsed ? "Multimedia DonWeb" : undefined}
            className={`w-full flex items-center transition-all duration-200 text-left font-bold relative group ${
              sidebarCollapsed
                ? `justify-center py-3.5 rounded-2xl ${
                    activeTab === "donweb"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
                : `space-x-3 px-4 py-3.5 rounded-2xl ${
                    activeTab === "donweb"
                      ? "bg-white text-[#FC7D00] shadow-md"
                      : "text-white hover:bg-black/10"
                  }`
            }`}
          >
            <UploadCloud size={20} className={activeTab === "donweb" ? "text-[#FC7D00]" : "text-white"} />
            {!sidebarCollapsed && <span className="tracking-wide text-[13px]">Multimedia DonWeb</span>}
            {sidebarCollapsed && (
              <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#0e0e10] text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Multimedia DonWeb
              </span>
            )}
          </button>
        </nav>

        {/* Quick Branch & Store Info Box */}
        {sidebarCollapsed ? (
          <div
            className="p-2 mx-2 mb-4 rounded-2xl bg-[#c45600] text-white flex justify-center py-3 relative group cursor-pointer"
            title="Sucursales Activas"
          >
            <MapPin size={18} className="text-white" />
            <span className="absolute left-full ml-3 px-3 py-2 bg-[#0e0e10] text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 leading-relaxed">
              <strong>Sucursales:</strong><br />
              Ciudad: Av. Mitre 1398<br />
              Luján: Alma Gardenia
            </span>
          </div>
        ) : (
          <div className="p-4 mx-4 mb-4 rounded-2xl bg-[#c45600] text-white space-y-2.5">
            <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-white">
              <MapPin size={13} className="text-white" />
              <span>SUCURSALES ACTIVAS</span>
            </div>
            <div className="text-[12px] space-y-1.5">
              <p className="flex justify-between items-center">
                <span className="text-white/80">Ciudad:</span>
                <span className="font-bold text-white">Av. Mitre 1398</span>
              </p>
              <p className="flex justify-between items-center">
                <span className="text-white/80">Luján:</span>
                <span className="font-bold text-white">Alma Gardenia</span>
              </p>
            </div>
          </div>
        )}

        {/* Store Link at bottom */}
        <div className={`border-t border-[#c45600] ${sidebarCollapsed ? "p-2" : "p-4"}`}>
          <Link
            href="/"
            target="_blank"
            title="Abrir Tienda Pública"
            className={`flex items-center justify-between text-xs text-white bg-[#b85000] hover:bg-[#a64800] rounded-2xl transition-all duration-200 group font-bold shadow-sm ${
              sidebarCollapsed ? "p-3 justify-center" : "p-4"
            }`}
          >
            {!sidebarCollapsed && <span className="text-[13px]">Abrir Tienda Pública</span>}
            <ArrowUpRight size={16} className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#faf9f8]">
        {/* Top bar con naranja oficial del logo #FC7D00 */}
        <header className="h-16 bg-[#FC7D00] text-white px-8 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/90">
              ACASA TIENDA
            </span>
            <span className="text-white/40 font-light">/</span>
            <h2 className="font-heading text-base font-bold text-white uppercase tracking-wider">
              {activeTab === "dashboard" && "Tablero de Tráfico & Conversión en Tiempo Real"}
              {activeTab === "products" && (editingProduct ? "Configuración y Detalle del Mueble" : "Gestión y Catálogo de Muebles")}
              {activeTab === "categories" && "Gestión de Categorías & Subcategorías"}
              {activeTab === "attributes" && "Atributos & Variaciones (WooCommerce)"}
              {activeTab === "media" && "Biblioteca Multimedia"}
              {activeTab === "orders" && "Gestión de Pedidos & Checkout"}
              {activeTab === "donweb" && "Almacenamiento Multimedia DonWeb"}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Admin Avatar */}
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white text-[#FC7D00] text-xs font-black font-heading flex items-center justify-center shadow-md">
                A
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-none">Administrador</p>
                <p className="text-[10px] text-white/80 font-mono mt-0.5">Acasa Management</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-8">
          {/* TAB 1: DASHBOARD & LIVE ANALYTICS */}
          {activeTab === "dashboard" && (
            <div className="w-[97%] mx-auto space-y-7">
              {/* Luxury Control Bar: Period Filter & Refresh */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-black text-[#FC7D00] flex items-center justify-center shadow-md">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-gray-900 uppercase tracking-wide">
                      Métricas Comerciales & Preferencia de Clientes
                    </h3>
                    <p className="text-xs text-gray-500 font-light">
                      Visualizá el comportamiento de tus visitantes entre Línea Práctica y Personalizada.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end md:self-auto">
                  {/* Period Filter Selector */}
                  <div className="inline-flex rounded-xl bg-gray-100 p-1 text-xs border border-gray-200">
                    <button
                      onClick={() => setTimeRange("today")}
                      className={`px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                        timeRange === "today"
                          ? "bg-black text-white font-bold shadow-sm"
                          : "text-gray-600 hover:text-black"
                      }`}
                    >
                      Hoy
                    </button>
                    <button
                      onClick={() => setTimeRange("7d")}
                      className={`px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                        timeRange === "7d"
                          ? "bg-black text-white font-bold shadow-sm"
                          : "text-gray-600 hover:text-black"
                      }`}
                    >
                      7 días
                    </button>
                    <button
                      onClick={() => setTimeRange("30d")}
                      className={`px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                        timeRange === "30d"
                          ? "bg-black text-white font-bold shadow-sm"
                          : "text-gray-600 hover:text-black"
                      }`}
                    >
                      30 días
                    </button>
                    <button
                      onClick={() => setTimeRange("all")}
                      className={`px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                        timeRange === "all"
                          ? "bg-black text-white font-bold shadow-sm"
                          : "text-gray-600 hover:text-black"
                      }`}
                    >
                      Histórico
                    </button>
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={fetchAnalytics}
                    disabled={analyticsLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={analyticsLoading ? "animate-spin text-[#FC7D00]" : "text-[#FC7D00]"} />
                    <span className="tracking-wider uppercase text-[11px]">Actualizar</span>
                  </button>
                </div>
              </div>

              {/* 4 Primary Hero KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Tráfico Total */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-between group hover:border-black/30 transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                        TRÁFICO TOTAL
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-gray-100 text-black flex items-center justify-center">
                        <Users size={17} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-heading text-4xl font-bold text-gray-900">
                        {analyticsLoading ? "..." : analytics?.totalPageviews || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        Páginas vistas registradas
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Visitantes únicos:</span>
                    <span className="font-bold text-gray-900 font-mono">
                      {analytics?.uniqueVisitors || 0} sesiones
                    </span>
                  </div>
                </div>

                {/* 2. Línea Práctica (Compra fácil) */}
                <div className="bg-white p-6 rounded-2xl border-2 border-[#c25e1a]/30 shadow-[0_4px_20px_rgba(194,94,26,0.06)] relative overflow-hidden flex flex-col justify-between group hover:border-[#c25e1a] transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#c25e1a]" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c25e1a]">
                          COMPRA FÁCIL
                        </span>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-[#c25e1a]/10 text-[#c25e1a] flex items-center justify-center">
                        <Zap size={17} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-baseline space-x-2">
                        <p className="font-heading text-4xl font-bold text-gray-900">
                          {analyticsLoading ? "..." : practicaTotalScore}
                        </p>
                        <span className="text-sm font-bold text-[#c25e1a]">
                          {practicaPct}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        Interés en Línea Práctica
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Entradas: <strong className="text-gray-900 font-mono">{analytics?.practicaEntries || 0}</strong></span>
                    <span>Vistas: <strong className="text-gray-900 font-mono">{analytics?.practicaTotalViews || 0}</strong></span>
                  </div>
                </div>

                {/* 3. Línea Premium (Personalizada y diseño) */}
                <div className="bg-white p-6 rounded-2xl border-2 border-[#2d4332]/30 shadow-[0_4px_20px_rgba(45,67,50,0.06)] relative overflow-hidden flex flex-col justify-between group hover:border-[#2d4332] transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#2d4332]" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2d4332]">
                          LÍNEA PREMIUM
                        </span>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-[#2d4332]/10 text-[#2d4332] flex items-center justify-center">
                        <Sparkles size={17} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-baseline space-x-2">
                        <p className="font-heading text-4xl font-bold text-gray-900">
                          {analyticsLoading ? "..." : premiumTotalScore}
                        </p>
                        <span className="text-sm font-bold text-[#2d4332]">
                          {premiumPct}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        Interés en Diseño e Interiorismo
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Entradas: <strong className="text-gray-900 font-mono">{analytics?.premiumEntries || 0}</strong></span>
                    <span>Vistas: <strong className="text-gray-900 font-mono">{analytics?.premiumTotalViews || 0}</strong></span>
                  </div>
                </div>

                {/* 4. Consultas por WhatsApp */}
                <div className="bg-white p-6 rounded-2xl border-2 border-[#25D366]/30 shadow-[0_4px_20px_rgba(37,211,102,0.08)] relative overflow-hidden flex flex-col justify-between group hover:border-[#25D366] transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                          WHATSAPP LEADS
                        </span>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
                        <MessageCircle size={17} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-baseline space-x-2">
                        <p className="font-heading text-4xl font-bold text-gray-900">
                          {analyticsLoading ? "..." : totalWa}
                        </p>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {conversionRate}% conv.
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        Consultas iniciadas por clientes
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Práctica: <strong className="text-[#c25e1a] font-mono">{analytics?.whatsappPracticaClicks || 0}</strong></span>
                    <span>Premium: <strong className="text-[#2d4332] font-mono">{analytics?.whatsappPremiumClicks || 0}</strong></span>
                  </div>
                </div>
              </div>

              {/* Comparative Dual Analysis Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                {/* Visual Preference: Práctica vs Premium */}
                <div className="bg-white p-7 rounded-2xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-black text-[#FC7D00]">
                          <TrendingUp size={16} />
                        </div>
                        <h4 className="font-heading text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Distribución de Tráfico por Línea
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        {totalLineInteractions} eventos
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 mb-5 font-light leading-relaxed">
                      Comparativa directa entre la preferencia por soluciones rápidas y estándar (Mitre 1398) versus proyectos de diseño y personalización (Alma Gardenia).
                    </p>

                    {/* Dual Architectural Meter */}
                    <div className="w-full h-7 bg-gray-100 rounded-xl overflow-hidden flex p-1 shadow-inner mb-5">
                      <div
                        style={{ width: `${practicaPct}%` }}
                        className="bg-[#c25e1a] h-full rounded-lg flex items-center justify-center text-xs font-bold text-white transition-all duration-700 shadow-sm"
                      >
                        {practicaPct > 15 ? `Línea Práctica ${practicaPct}%` : `${practicaPct}%`}
                      </div>
                      <div
                        style={{ width: `${premiumPct}%` }}
                        className="bg-[#2d4332] h-full rounded-lg flex items-center justify-center text-xs font-bold text-white transition-all duration-700 shadow-sm ml-1"
                      >
                        {premiumPct > 15 ? `Línea Premium ${premiumPct}%` : `${premiumPct}%`}
                      </div>
                    </div>

                    {/* Side-by-Side Breakdown Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Práctica Card */}
                      <div className="p-4 rounded-xl bg-gradient-to-b from-orange-50/70 to-white border border-[#c25e1a]/20">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#c25e1a]" />
                          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                            Compra Fácil
                          </span>
                        </div>
                        <p className="font-heading text-2xl font-bold text-gray-900 mt-2">
                          {practicaTotalScore} <span className="text-xs font-normal text-gray-500">visitas</span>
                        </p>
                        <div className="text-[11px] text-gray-500 mt-2 pt-2 border-t border-[#c25e1a]/10 space-y-0.5">
                          <p>Entradas Gateway: <strong className="text-gray-900 font-mono">{analytics?.practicaEntries || 0}</strong></p>
                          <p>Catálogo: <strong className="text-gray-900 font-mono">{analytics?.practicaTotalViews || 0}</strong></p>
                        </div>
                      </div>

                      {/* Premium Card */}
                      <div className="p-4 rounded-xl bg-gradient-to-b from-emerald-50/70 to-white border border-[#2d4332]/20">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#2d4332]" />
                          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                            Personalizada
                          </span>
                        </div>
                        <p className="font-heading text-2xl font-bold text-gray-900 mt-2">
                          {premiumTotalScore} <span className="text-xs font-normal text-gray-500">visitas</span>
                        </p>
                        <div className="text-[11px] text-gray-500 mt-2 pt-2 border-t border-[#2d4332]/10 space-y-0.5">
                          <p>Entradas Gateway: <strong className="text-gray-900 font-mono">{analytics?.premiumEntries || 0}</strong></p>
                          <p>Catálogo: <strong className="text-gray-900 font-mono">{analytics?.premiumTotalViews || 0}</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Inquiries Breakdown by Line */}
                <div className="bg-white p-7 rounded-2xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500 text-white shadow-sm">
                          <MessageCircle size={16} />
                        </div>
                        <h4 className="font-heading text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Consultas WhatsApp Desglosadas
                        </h4>
                      </div>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                        {totalWa} contactos
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 mb-6 font-light leading-relaxed">
                      Conocé exactamente desde qué sección o producto los clientes deciden escribirle al equipo comercial de Acasa.
                    </p>

                    <div className="space-y-4">
                      {/* Práctica */}
                      <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-800 flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#c25e1a]" />
                            <span>Línea Práctica (Compra fácil y estándar)</span>
                          </span>
                          <span className="font-mono font-bold text-gray-900">
                            {analytics?.whatsappPracticaClicks || 0} ({waPracticaPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${waPracticaPct}%` }}
                            className="bg-[#c25e1a] h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>

                      {/* Premium */}
                      <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-800 flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#2d4332]" />
                            <span>Línea Premium (Diseño & Personalizada)</span>
                          </span>
                          <span className="font-mono font-bold text-gray-900">
                            {analytics?.whatsappPremiumClicks || 0} ({waPremiumPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${waPremiumPct}%` }}
                            className="bg-[#2d4332] h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>

                      {/* General / Floating Button */}
                      <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-800 flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                            <span>Botón Flotante General / Sucursales</span>
                          </span>
                          <span className="font-mono font-bold text-gray-900">
                            {analytics?.whatsappGeneralClicks || 0} ({waGeneralPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${waGeneralPct}%` }}
                            className="bg-gray-400 h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span>Línea telefónica comercial:</span>
                    <span className="font-mono font-semibold text-gray-800">+54 9 261 684-3330</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Top Consulted Products & Real-time Live Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                {/* Top Products Table */}
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-black text-[#FC7D00]">
                          <MousePointer size={15} />
                        </div>
                        <h4 className="font-heading text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Muebles Más Consultados en WhatsApp
                        </h4>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {analytics?.topConsultedProducts.length || 0} productos
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#faf9f8] border-b text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                          <tr>
                            <th className="p-4">Producto</th>
                            <th className="p-4">Línea</th>
                            <th className="p-4">SKU</th>
                            <th className="p-4 text-right">Consultas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {analytics?.topConsultedProducts && analytics.topConsultedProducts.length > 0 ? (
                            analytics.topConsultedProducts.map((prod, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-gray-900">{prod.title}</td>
                                <td className="p-4">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      prod.linea === "premium"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-orange-100 text-[#c25e1a]"
                                    }`}
                                  >
                                    {prod.linea === "premium" ? "Premium" : "Práctica"}
                                  </span>
                                </td>
                                <td className="p-4 font-mono text-gray-400">{prod.sku || "-"}</td>
                                <td className="p-4 text-right font-extrabold text-[#25D366] text-sm font-mono">
                                  {prod.clicks}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                                No se registraron consultas de productos en este período.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Real-time Activity Feed */}
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-black text-[#FC7D00]">
                          <Clock size={15} />
                        </div>
                        <h4 className="font-heading text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Registro de Actividad en Tiempo Real
                        </h4>
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">
                        Sincronizado {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
                      {analytics?.recentEvents && analytics.recentEvents.length > 0 ? (
                        analytics.recentEvents.map((ev) => {
                          const date = new Date(ev.created_at);
                          const isWhatsApp = ev.event_type === "whatsapp_click";
                          const isEntry = ev.event_type === "line_entry";

                          return (
                            <div key={ev.id} className="p-4 hover:bg-gray-50/80 transition-colors flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-3">
                                <span
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                                    isWhatsApp
                                      ? "bg-[#25D366]/15 text-[#25D366]"
                                      : isEntry
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {isWhatsApp ? <MessageCircle size={15} /> : <Globe size={15} />}
                                </span>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {isWhatsApp
                                      ? "Consulta por WhatsApp"
                                      : isEntry
                                      ? "Ingreso a Línea desde Portada"
                                      : "Visita de Página"}
                                  </p>
                                  <p className="text-[11px] text-gray-400 font-mono">
                                    {ev.path}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-end space-y-1">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    ev.linea === "practica"
                                      ? "bg-orange-100 text-[#c25e1a]"
                                      : ev.linea === "premium"
                                      ? "bg-emerald-100 text-[#2d4332]"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {ev.linea || "General"}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-gray-400 italic text-xs">
                          No hay eventos recientes en este período.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS (CATALOGUE & INLINE FORM SECTION) */}
          {activeTab === "products" && (
            <div className="w-[97%] mx-auto space-y-6">
              {/* SUBVIEW 1: INLINE PRODUCT FORM SECTION (NO MODAL) */}
              {editingProduct ? (
                <div className="space-y-6">
                  {/* Form Header with Back Button */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors flex items-center justify-center"
                        title="Volver al Catálogo"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FC7D00]">
                          {editingProduct.id ? "EDICIÓN DE MUEBLE" : "NUEVA ALTA DE CATÁLOGO"}
                        </span>
                        <h3 className="font-heading text-lg font-bold text-gray-900 uppercase tracking-wide">
                          {editingProduct.id
                            ? `Editar: ${editingProduct.title || "Producto"}`
                            : "Añadir Nuevo Mueble al Catálogo"}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveProduct}
                        className="bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2"
                      >
                        <Save size={15} />
                        <span>Guardar Producto</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Main Body: 2 Columns */}
                  <form onSubmit={handleSaveProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                    {/* Left 2 Columns: Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Card 1: Essential Information */}
                      <div className="bg-white p-7 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
                        <h4 className="font-heading text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
                          1. Información Principal del Mueble
                        </h4>

                        <div>
                          <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
                            Nombre / Título del Producto *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingProduct.title || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                            placeholder="Ej: Rack TV Escandinavo Melamina"
                            className="w-full p-3.5 border border-gray-200 rounded-xl outline-none focus:border-black text-xs font-medium bg-gray-50/30 focus:bg-white transition-all"
                          />
                        </div>

                        {/* Visual Selector for Linea */}
                        <div>
                          <label className="block font-semibold text-gray-700 mb-2 uppercase tracking-wider text-[11px]">
                            Línea de Venta Comercial *
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, linea: "practica" })}
                              className={`p-4 rounded-xl border-2 text-left transition-all ${
                                editingProduct.linea === "practica"
                                  ? "border-[#c25e1a] bg-orange-50/40 shadow-xs"
                                  : "border-gray-200 hover:border-gray-300 bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs uppercase tracking-wider text-[#c25e1a]">
                                  Línea Práctica
                                </span>
                                {editingProduct.linea === "practica" && (
                                  <span className="w-5 h-5 rounded-full bg-[#c25e1a] text-white flex items-center justify-center">
                                    <Check size={12} />
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-600 font-medium mt-1">
                                Compra fácil y estándar
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Melamina, modelos definidos, entrega rápida · Sucursal Mitre
                              </p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, linea: "premium" })}
                              className={`p-4 rounded-xl border-2 text-left transition-all ${
                                editingProduct.linea === "premium"
                                  ? "border-[#2d4332] bg-emerald-50/40 shadow-xs"
                                  : "border-gray-200 hover:border-gray-300 bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs uppercase tracking-wider text-[#2d4332]">
                                  Línea Premium
                                </span>
                                {editingProduct.linea === "premium" && (
                                  <span className="w-5 h-5 rounded-full bg-[#2d4332] text-white flex items-center justify-center">
                                    <Check size={12} />
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-600 font-medium mt-1">
                                Compra personalizada y de diseño
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Maderas nobles, tapizados, lustre · Sucursal Alma Gardenia
                              </p>
                            </button>
                          </div>
                        </div>

                        {/* Categorías y Subcategorías Múltiples */}
                        <div className="space-y-4 pt-1">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
                                Categorías del Producto (Podés elegir más de una) *
                              </label>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {(editingProduct.categories?.length || (editingProduct.category ? 1 : 0))} seleccionada(s)
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {categoriesList.map((cat) => {
                                const isChecked =
                                  editingProduct.categories?.includes(cat.slug) ||
                                  (!editingProduct.categories && editingProduct.category === cat.slug);

                                return (
                                  <button
                                    key={cat.slug}
                                    type="button"
                                    onClick={() => {
                                      const current = editingProduct.categories || (editingProduct.category ? [editingProduct.category] : []);
                                      let updated: string[];
                                      if (current.includes(cat.slug)) {
                                        updated = current.filter((c) => c !== cat.slug);
                                      } else {
                                        updated = [...current, cat.slug];
                                      }
                                      setEditingProduct({
                                        ...editingProduct,
                                        category: updated[0] || cat.slug,
                                        categories: updated,
                                      });
                                    }}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 border ${
                                      isChecked
                                        ? "bg-black text-white border-black shadow-xs"
                                        : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200"
                                    }`}
                                  >
                                    <span>{cat.name}</span>
                                    {isChecked && <Check size={13} className="text-[#FC7D00]" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Subcategorías disponibles según categorías marcadas */}
                          {(() => {
                            const selectedCatSlugs = editingProduct.categories || (editingProduct.category ? [editingProduct.category] : []);
                            const relevantSubs: { catName: string; name: string; slug: string }[] = [];
                            categoriesList
                              .filter((c) => selectedCatSlugs.includes(c.slug))
                              .forEach((c) => {
                                c.subcategories?.forEach((s) => {
                                  if (!relevantSubs.some((r) => r.slug === s.slug)) {
                                    relevantSubs.push({ catName: c.name, name: s.name, slug: s.slug });
                                  }
                                });
                              });

                            if (relevantSubs.length === 0) return null;

                            return (
                              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                    Subcategorías (Podés elegir más de una):
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    {(editingProduct.subcategories?.length || (editingProduct.subcategory ? 1 : 0))} seleccionada(s)
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {relevantSubs.map((sub) => {
                                    const isSubChecked =
                                      editingProduct.subcategories?.includes(sub.slug) ||
                                      (!editingProduct.subcategories && editingProduct.subcategory === sub.slug);

                                    return (
                                      <button
                                        key={sub.slug}
                                        type="button"
                                        onClick={() => {
                                          const current = editingProduct.subcategories || (editingProduct.subcategory ? [editingProduct.subcategory] : []);
                                          let updated: string[];
                                          if (current.includes(sub.slug)) {
                                            updated = current.filter((s) => s !== sub.slug);
                                          } else {
                                            updated = [...current, sub.slug];
                                          }
                                          setEditingProduct({
                                            ...editingProduct,
                                            subcategory: updated[0] || "",
                                            subcategories: updated,
                                          });
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 border ${
                                          isSubChecked
                                            ? "bg-[#FC7D00] text-white border-[#FC7D00] font-bold shadow-xs"
                                            : "bg-white hover:bg-gray-100 text-gray-700 border-gray-200"
                                        }`}
                                      >
                                        <span>{sub.name}</span>
                                        {isSubChecked && <Check size={12} className="text-white" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Descriptions */}
                        <div>
                          <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
                            Descripción Breve (Para tarjetas y listados)
                          </label>
                          <input
                            type="text"
                            value={editingProduct.shortDescription || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                            placeholder="Ej: Fabricado en melamina 18mm con base metálica laqueada."
                            className="w-full p-3.5 border border-gray-200 rounded-xl outline-none text-xs bg-gray-50/30 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
                            Descripción Completa & Materiales
                          </label>
                          <textarea
                            rows={4}
                            value={editingProduct.description || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            placeholder="Detalles sobre terminaciones, resistencia, tipos de lustre, medidas exactas y recomendaciones de limpieza..."
                            className="w-full p-3.5 border border-gray-200 rounded-xl outline-none text-xs bg-gray-50/30 focus:bg-white leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Card 2: WooCommerce Product Variations & Attributes */}
                      <ProductVariationsManager
                        productType={editingProduct.productType || (editingProduct.productVariations && editingProduct.productVariations.length > 0 ? "variable" : "simple")}
                        onChangeProductType={(type) => setEditingProduct({ ...editingProduct, productType: type })}
                        attributes={editingProduct.attributes || []}
                        onChangeAttributes={(attrs) => setEditingProduct({ ...editingProduct, attributes: attrs })}
                        variations={editingProduct.productVariations || []}
                        onChangeVariations={(vars) => setEditingProduct({ ...editingProduct, productVariations: vars })}
                        availableGlobalAttributes={attributesList}
                        baseProductPrice={editingProduct.regularPrice}
                        baseProductSku={editingProduct.sku}
                        defaultImages={editingProduct.images || []}
                      />
                    </div>

                    {/* Right 1 Column: Price, Stock & Image Preview */}
                    <div className="space-y-6">
                      {/* Price & Stock Card */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
                        <h4 className="font-heading text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
                          3. Precio & Stock
                        </h4>

                        {editingProduct.productType === "variable" && (
                          <div className="p-3.5 rounded-xl bg-orange-50/80 border border-[#FC7D00]/25 text-xs text-gray-700 space-y-1">
                            <p className="font-bold text-[#FC7D00] uppercase tracking-wider text-[10px]">
                              ⚡ Modo Producto Variable (WooCommerce)
                            </p>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              Cada variación tiene sus propios precios, ofertas y stock en el panel de Variaciones. Los valores de abajo funcionan como precio y stock base referenciales.
                            </p>
                          </div>
                        )}

                        <div>
                          <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
                            Precio Regular ($ ARS) *
                          </label>
                          <input
                            type="number"
                            required
                            value={editingProduct.regularPrice || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, regularPrice: Number(e.target.value) })}
                            placeholder="280000"
                            className="w-full p-3.5 border border-gray-200 rounded-xl outline-none font-mono text-sm font-bold text-gray-900 bg-gray-50/50 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
                            Precio de Oferta ($ ARS)
                          </label>
                          <input
                            type="number"
                            value={editingProduct.salePrice || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="245000"
                            className="w-full p-3.5 border border-gray-200 rounded-xl outline-none font-mono text-sm font-bold text-emerald-700 bg-gray-50/50 focus:bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">
                              Stock Unidades
                            </label>
                            <input
                              type="number"
                              value={editingProduct.stock ?? 10}
                              onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                              className="w-full p-3 border border-gray-200 rounded-xl outline-none font-mono text-xs"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">
                              SKU / Código
                            </label>
                            <input
                              type="text"
                              value={editingProduct.sku || ""}
                              onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                              placeholder="SKU-201"
                              className="w-full p-3 border border-gray-200 rounded-xl outline-none font-mono text-xs uppercase"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4. Carrusel de Fotografías del Producto */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div>
                            <h4 className="font-heading text-sm font-bold text-gray-900 uppercase tracking-wider">
                              4. Carrusel de Fotos
                            </h4>
                            <p className="text-[11px] text-gray-400 font-light">
                              {editingProduct.images?.length || 0} foto{editingProduct.images?.length === 1 ? "" : "s"} en el carrusel
                            </p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono">
                            Auto WebP
                          </span>
                        </div>

                        {/* Interactive Live Carousel Preview */}
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center relative group select-none">
                          {editingProduct.images && editingProduct.images.length > 0 ? (
                            <>
                              <img
                                src={editingProduct.images[carouselPreviewIdx] || editingProduct.images[0]}
                                alt="Vista previa del carrusel"
                                className="w-full h-full object-contain p-2"
                              />

                              {editingProduct.images.length > 1 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setCarouselPreviewIdx((prev) => (prev - 1 + editingProduct.images!.length) % editingProduct.images!.length)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow text-gray-700 flex items-center justify-center hover:bg-white transition-transform hover:scale-110"
                                  >
                                    <ChevronLeft size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCarouselPreviewIdx((prev) => (prev + 1) % editingProduct.images!.length)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow text-gray-700 flex items-center justify-center hover:bg-white transition-transform hover:scale-110"
                                  >
                                    <ChevronRight size={16} />
                                  </button>
                                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                                    {carouselPreviewIdx + 1} / {editingProduct.images.length}
                                  </div>
                                </>
                              )}

                              <span className="absolute top-2 left-2 bg-[#FC7D00] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                                {carouselPreviewIdx === 0 ? "★ Portada Principal" : `Foto ${carouselPreviewIdx + 1}`}
                              </span>
                            </>
                          ) : (
                            <div className="text-center p-4 text-gray-400 space-y-1">
                              <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                              <span className="text-xs font-medium block">Sin fotos en el carrusel</span>
                              <span className="text-[10px] text-gray-400">Seleccioná de la biblioteca o subí una imagen</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons: Pick from Media Library or Upload new with WebP */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setIsMediaPickerOpen(true)}
                            className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                          >
                            <Images size={15} className="text-[#FC7D00]" />
                            <span>Desde Biblioteca</span>
                          </button>

                          <label className="p-3 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs">
                            <UploadCloud size={15} />
                            <span>Subir (Auto WebP)</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleUploadToProduct}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* URL manual input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={manualImageUrl}
                            onChange={(e) => setManualImageUrl(e.target.value)}
                            placeholder="O pegar URL directa..."
                            className="flex-1 p-2.5 border border-gray-200 rounded-xl outline-none font-mono text-[11px] bg-gray-50/50 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={handleAddManualUrl}
                            className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                          >
                            Agregar
                          </button>
                        </div>

                        {/* List of images in carousel with reordering and removal */}
                        {editingProduct.images && editingProduct.images.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-gray-100">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Fotos en orden del carrusel:
                            </p>
                            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                              {editingProduct.images.map((img, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setCarouselPreviewIdx(idx)}
                                  className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                                    idx === carouselPreviewIdx
                                      ? "border-[#FC7D00] bg-[#FC7D00]/5 shadow-xs"
                                      : "border-gray-200 hover:border-gray-300 bg-white"
                                  }`}
                                >
                                  <div className="flex items-center space-x-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                      <img src={img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-gray-800 text-[11px] truncate">
                                        {idx === 0 ? "★ Portada Principal" : `Foto ${idx + 1}`}
                                      </p>
                                      <p className="text-[9px] text-gray-400 truncate max-w-[120px] font-mono">
                                        {img.split("/").pop()}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                    {/* Move Up */}
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveProductImage(idx, -1)}
                                      className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30"
                                      title="Mover foto arriba en el carrusel"
                                    >
                                      <ArrowUp size={13} />
                                    </button>
                                    {/* Move Down */}
                                    <button
                                      type="button"
                                      disabled={idx === editingProduct.images!.length - 1}
                                      onClick={() => handleMoveProductImage(idx, 1)}
                                      className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30"
                                      title="Mover foto abajo en el carrusel"
                                    >
                                      <ArrowDown size={13} />
                                    </button>
                                    {/* Remove */}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProductImage(idx)}
                                      className="p-1 rounded hover:bg-red-50 text-red-500"
                                      title="Quitar foto del carrusel"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="w-full bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                          >
                            <Save size={16} />
                            <span>Guardar Mueble en Catálogo</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                /* SUBVIEW 2: CATALOGUE TABLE LIST */
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setEditingProduct({
                            title: "",
                            regularPrice: 0,
                            stock: 10,
                            category: "comedor",
                            categories: ["comedor"],
                            linea: "practica",
                            productType: "simple",
                            attributes: [],
                            productVariations: [],
                            images: [],
                          });
                        }}
                        className="bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-sm"
                      >
                        <Plus size={16} />
                        <span>Añadir Producto</span>
                      </button>

                      {/* Category Filter */}
                      <select
                        value={selectedCatFilter}
                        onChange={(e) => {
                          setSelectedCatFilter(e.target.value);
                          setSelectedSubcatFilter("all");
                        }}
                        className="text-xs border border-gray-300 rounded-xl px-3 py-2.5 outline-none bg-white font-medium"
                      >
                        <option value="all">Todas las categorías</option>
                        {categoriesList.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>

                      {/* Subcategory Filter */}
                      {availableFilterSubcategories.length > 0 && (
                        <select
                          value={selectedSubcatFilter}
                          onChange={(e) => setSelectedSubcatFilter(e.target.value)}
                          className="text-xs border border-gray-300 rounded-xl px-3 py-2.5 outline-none bg-white font-medium"
                        >
                          <option value="all">Todas las subcategorías</option>
                          {availableFilterSubcategories.map((s) => (
                            <option key={s.slug} value={s.slug}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="relative w-full sm:w-72">
                      <input
                        type="text"
                        placeholder="Buscar por título o SKU..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl outline-none focus:border-black bg-white"
                      />
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#faf9f8] border-b text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-4">Nombre</th>
                          <th className="p-4">Línea</th>
                          <th className="p-4">SKU</th>
                          <th className="p-4">Stock</th>
                          <th className="p-4">Precio</th>
                          <th className="p-4">Categoría</th>
                          <th className="p-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="p-4 font-semibold text-gray-900">
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900">{p.title}</span>
                                <span className="text-[11px] text-gray-400 font-mono">/{p.slug}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  p.linea === "premium"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-orange-100 text-[#c25e1a]"
                                }`}
                              >
                                {p.linea === "premium" ? "Premium" : "Práctica"}
                              </span>
                            </td>
                            <td className="p-4 text-gray-400 font-mono">{p.sku || "-"}</td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  p.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                              >
                                {p.stock > 0 ? `Stock (${p.stock})` : "Agotado"}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900 font-mono">
                                  {formatCurrency(p.salePrice ?? p.regularPrice)}
                                </span>
                                {p.salePrice && (
                                  <span className="text-[10px] text-gray-400 line-through font-mono">
                                    {formatCurrency(p.regularPrice)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 uppercase font-bold text-gray-600 text-[11px]">{p.category}</td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                  }}
                                  className="p-2 text-gray-500 hover:text-[#FC7D00] hover:bg-orange-50 rounded-lg transition-colors"
                                  title="Editar Mueble"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => handleDuplicateProduct(p)}
                                  className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Duplicar"
                                >
                                  <Copy size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

                              {/* TAB: CATEGORIES */}
          {activeTab === "categories" && <CategoriesManagerView />}

          {/* TAB: ATTRIBUTES & VARIATIONS */}
          {activeTab === "attributes" && <AttributesManagerView />}

          {/* TAB: MEDIA LIBRARY */}
          {activeTab === "media" && <MediaLibraryView />}

          {/* TAB 3: ORDERS */}
          {activeTab === "orders" && (
            <div className="w-[97%] mx-auto space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-heading text-base font-bold text-gray-900 uppercase tracking-wide">
                    Gestión de Pedidos & Checkout
                  </h3>
                  <p className="text-xs text-gray-500">{orders.length} pedidos registrados</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">Total Facturado</span>
                  <span className="font-heading text-2xl font-bold text-gray-900 font-mono">
                    {formatCurrency(totalSales)}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#faf9f8] border-b text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Pedido</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Contacto</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4">Unidades</th>
                      <th className="p-4 text-right">Total</th>
                      <th className="p-4 text-center">Cambiar Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-bold text-gray-900 font-mono">{o.orderNumber}</td>
                        <td className="p-4 text-gray-400 font-mono">{o.createdAt}</td>
                        <td className="p-4 font-semibold text-gray-900">{o.customerName}</td>
                        <td className="p-4 text-gray-600">
                          <div>{o.customerPhone}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{o.customerEmail}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              o.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : o.status === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : o.status === "shipped"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-700 font-semibold font-mono">
                            {o.items.reduce((acc, it) => acc + it.quantity, 0)}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-gray-900 font-mono text-sm">
                          {formatCurrency(o.total)}
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                            className="text-[11px] border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white outline-none font-medium"
                          >
                            <option value="pending">Pendiente</option>
                            <option value="processing">En preparación</option>
                            <option value="shipped">Despachado</option>
                            <option value="completed">Completado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DONWEB */}
          {activeTab === "donweb" && (
            <div className="w-[97%] mx-auto space-y-6">
              <div className="bg-white p-7 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
                <div className="flex items-center space-x-3.5 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-black text-[#FC7D00] flex items-center justify-center">
                    <UploadCloud size={22} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-gray-900 uppercase tracking-wide">
                      Conexión FTP DonWeb Hosting
                    </h3>
                    <p className="text-xs text-gray-500 font-light">
                      Configuración para subir y servir fotos de catálogo desde los servidores de DonWeb
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveDonwebConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
                      Servidor FTP (Host)
                    </label>
                    <input
                      type="text"
                      value={donwebConfig.host}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, host: e.target.value })}
                      placeholder="ftp.tudominio.com"
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black font-mono text-xs bg-gray-50/50 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
                      Usuario FTP
                    </label>
                    <input
                      type="text"
                      value={donwebConfig.user}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, user: e.target.value })}
                      placeholder="usuario_ftp"
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black font-mono text-xs bg-gray-50/50 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
                      Contraseña FTP
                    </label>
                    <input
                      type="password"
                      value={donwebConfig.password || ""}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black font-mono text-xs bg-gray-50/50 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
                      Puerto FTP
                    </label>
                    <input
                      type="number"
                      value={donwebConfig.port}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, port: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black font-mono text-xs bg-gray-50/50 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
                      Carpeta Remota (Destino)
                    </label>
                    <input
                      type="text"
                      value={donwebConfig.remoteDir}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, remoteDir: e.target.value })}
                      placeholder="/public_html/uploads"
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black font-mono text-xs bg-gray-50/50 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
                      Prefijo URL Pública
                    </label>
                    <input
                      type="text"
                      value={donwebConfig.publicUrlPrefix}
                      onChange={(e) =>
                        setDonwebConfig({ ...donwebConfig, publicUrlPrefix: e.target.value })
                      }
                      placeholder="https://tudominio.com/uploads"
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black font-mono text-xs bg-gray-50/50 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl flex items-center space-x-2 transition-all shadow-sm"
                    >
                      <Save size={15} />
                      <span>Guardar Credenciales FTP</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Upload section */}
              <div className="bg-white p-7 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
                <h4 className="font-heading text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Subida Rápida de Fotos a DonWeb
                </h4>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-black transition-colors bg-gray-50/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFile}
                    className="hidden"
                    id="donweb-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="donweb-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-black">
                      {isUploading ? "Subiendo archivo..." : "Hacé clic para seleccionar una imagen"}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-1">Formato PNG, JPG o WebP optimizado</span>
                  </label>
                </div>

                {uploadMessage && (
                  <p className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 p-3.5 rounded-xl">
                    {uploadMessage}
                  </p>
                )}

                {uploadedUrls.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h5 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Imágenes subidas recientemente:
                    </h5>
                    <div className="space-y-1.5">
                      {uploadedUrls.map((url, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl text-xs border border-gray-200">
                          <span className="truncate max-w-md font-mono text-[11px] text-gray-700">{url}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(url);
                              alert("¡URL copiada al portapapeles!");
                            }}
                            className="text-black hover:text-[#FC7D00] font-bold ml-3 text-[11px] uppercase tracking-wider transition-colors"
                          >
                            Copiar URL
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        selectedUrls={editingProduct?.images || []}
        onSelectImages={(newUrls) => {
          if (!editingProduct) return;
          const current = editingProduct.images || [];
          const combined = [...current, ...newUrls.filter((u) => !current.includes(u))];
          setEditingProduct({
            ...editingProduct,
            images: combined,
          });
        }}
      />
    </div>
  );
}
