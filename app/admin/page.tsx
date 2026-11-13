"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Product,
  Order,
  DonWebFtpSettings,
} from "@/lib/types";
import { CATEGORIES } from "@/lib/data";
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
} from "@/lib/supabase";
import {
  LayoutDashboard,
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
  MapPin,
  SlidersHorizontal,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "donweb">("dashboard");

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

  // Product modal
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.title || !editingProduct?.regularPrice) {
      alert("Completá el título y precio regular del producto.");
      return;
    }

    const currentList = [...products];
    const slug =
      editingProduct.slug ||
      editingProduct.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    if (editingProduct.id) {
      // Update
      const idx = currentList.findIndex((p) => p.id === editingProduct.id);
      if (idx > -1) {
        currentList[idx] = {
          ...(currentList[idx] as Product),
          ...(editingProduct as Product),
          updatedAt: new Date().toISOString().split("T")[0],
        };
      }
    } else {
      // Create new
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        slug,
        title: editingProduct.title,
        sku: editingProduct.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
        shortDescription: editingProduct.shortDescription || "",
        description: editingProduct.description || "",
        regularPrice: Number(editingProduct.regularPrice),
        salePrice: editingProduct.salePrice ? Number(editingProduct.salePrice) : undefined,
        category: editingProduct.category || "comedor",
        subcategory: editingProduct.subcategory || "",
        linea: editingProduct.linea || "practica",
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
      currentList.unshift(newProd);
    }

    setProducts(currentList);
    saveStoredProducts(currentList);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("¿Estás seguro de que querés eliminar este producto?")) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      saveStoredProducts(updated);
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
    if (selectedCatFilter !== "all" && p.category !== selectedCatFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
    }
    return true;
  });

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
      {/* 1. ACASA LUXURY SIDEBAR */}
      <aside className="w-72 bg-[#0e0e10] text-white flex flex-col flex-shrink-0 border-r border-[#1f1f23] select-none">
        {/* Brand identity header */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" target="_blank" className="flex items-center space-x-3 group">
            <img
              src="/logoAcasaTienda.webp"
              alt="Acasa Calidad y Diseño"
              className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#FC7D00]">
              ADMIN SUITE · ACASA
            </span>
            <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-semibold tracking-wider">
              v2.0
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 text-xs">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-lg transition-all duration-200 text-left ${
              activeTab === "dashboard"
                ? "bg-white text-black font-bold shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutDashboard size={17} className={activeTab === "dashboard" ? "text-black" : "text-gray-400"} />
            <span className="tracking-wide">Escritorio & Tablero</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-lg transition-all duration-200 text-left ${
              activeTab === "products"
                ? "bg-white text-black font-bold shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Package size={17} className={activeTab === "products" ? "text-black" : "text-gray-400"} />
            <div className="flex-1 flex justify-between items-center">
              <span className="tracking-wide">Catálogo de Productos</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  activeTab === "products" ? "bg-black/10 text-black font-bold" : "bg-white/10 text-gray-300"
                }`}
              >
                {products.length}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-lg transition-all duration-200 text-left ${
              activeTab === "orders"
                ? "bg-white text-black font-bold shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShoppingCart size={17} className={activeTab === "orders" ? "text-black" : "text-gray-400"} />
            <div className="flex-1 flex justify-between items-center">
              <span className="tracking-wide">Gestión de Pedidos</span>
              {activeOrdersCount > 0 && (
                <span className="text-[10px] bg-[#c25e1a] text-white px-2 py-0.5 rounded-full font-bold">
                  {activeOrdersCount}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("donweb")}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-lg transition-all duration-200 text-left ${
              activeTab === "donweb"
                ? "bg-white text-black font-bold shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <UploadCloud size={17} className={activeTab === "donweb" ? "text-black" : "text-gray-400"} />
            <span className="tracking-wide">Multimedia DonWeb</span>
          </button>
        </nav>

        {/* Quick Branch & Store Info Box */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-gray-400">
            <MapPin size={12} className="text-[#FC7D00]" />
            <span>Sucursales Activas</span>
          </div>
          <div className="text-[11px] text-gray-300 space-y-1">
            <p className="flex justify-between">
              <span className="text-gray-400">Ciudad:</span>
              <span className="font-medium text-white">Av. Mitre 1398</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-400">Luján:</span>
              <span className="font-medium text-white">Alma Gardenia</span>
            </p>
          </div>
        </div>

        {/* Store Link at bottom */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/10 transition-all duration-200 group"
          >
            <span className="font-medium">Abrir Tienda Pública</span>
            <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#faf9f8]">
        {/* Top bar */}
        <header className="h-16 bg-[#FC7D00] text-white px-8 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/90">
              ACASA TIENDA
            </span>
            <span className="text-white/40 font-light">/</span>
            <h2 className="font-heading text-base font-bold text-white uppercase tracking-wider">
              {activeTab === "dashboard" && "Tablero de Tráfico & Conversión en Tiempo Real"}
              {activeTab === "products" && "Gestión y Catálogo de Muebles"}
              {activeTab === "orders" && "Gestión de Pedidos & Checkout"}
              {activeTab === "donweb" && "Almacenamiento Multimedia DonWeb"}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Supabase status badge */}
            <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-xs text-white border border-white/20 px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
              </span>
              <span className="tracking-wide text-white">Supabase Cloud Activo</span>
            </div>

            <div className="h-4 w-[1px] bg-white/30" />

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
            <div className="w-[90%] mx-auto space-y-7">
              {/* Luxury Control Bar: Period Filter & Refresh */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-black text-[#C5A880] flex items-center justify-center shadow-md">
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
                    <RefreshCw size={13} className={analyticsLoading ? "animate-spin text-[#C5A880]" : "text-[#C5A880]"} />
                    <span className="tracking-wider uppercase text-[11px]">Actualizar</span>
                  </button>
                </div>
              </div>

              {/* 4 Primary Hero KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Tráfico Web Total */}
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
                        <div className="p-2 rounded-lg bg-black text-[#C5A880]">
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
                        <div className="p-2 rounded-lg bg-black text-[#C5A880]">
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
                        <div className="p-2 rounded-lg bg-black text-[#C5A880]">
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

          {/* TAB 2: PRODUCTS (WOOCOMMERCE STYLE) */}
          {activeTab === "products" && (
            <div className="w-[90%] mx-auto space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setEditingProduct({
                        title: "",
                        regularPrice: 0,
                        stock: 10,
                        category: "comedor",
                        linea: "practica",
                        images: [],
                        variations: [
                          {
                            name: "Madera",
                            options: [
                              { id: "opt-1", name: "Petiribí", type: "madera", inStock: true, priceAdjustment: 30000 },
                              { id: "opt-2", name: "Paraíso", type: "madera", inStock: true, priceAdjustment: 0 },
                            ],
                          },
                        ],
                      });
                      setIsModalOpen(true);
                    }}
                    className="bg-black text-white hover:bg-[#c25e1a] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-sm"
                  >
                    <Plus size={16} />
                    <span>Añadir Producto</span>
                  </button>

                  <select
                    value={selectedCatFilter}
                    onChange={(e) => setSelectedCatFilter(e.target.value)}
                    className="text-xs border border-gray-300 rounded-xl px-3 py-2.5 outline-none bg-white font-medium"
                  >
                    <option value="all">Todas las categorías</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
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
                      <th className="p-4 w-16">Foto</th>
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
                        <td className="p-4">
                          <img
                            src={p.images[0] || "/placeholder.jpg"}
                            alt={p.title}
                            className="w-12 h-12 object-cover rounded-xl border border-gray-200"
                          />
                        </td>
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
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                              title="Editar"
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

          {/* TAB 3: ORDERS */}
          {activeTab === "orders" && (
            <div className="w-[90%] mx-auto space-y-5">
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
            <div className="w-[90%] mx-auto space-y-6">
              <div className="bg-white p-7 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
                <div className="flex items-center space-x-3.5 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-black text-[#C5A880] flex items-center justify-center">
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
                      className="bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl flex items-center space-x-2 transition-all shadow-sm"
                    >
                      <Save size={15} className="text-[#C5A880]" />
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
                            className="text-black hover:text-[#c25e1a] font-bold ml-3 text-[11px] uppercase tracking-wider transition-colors"
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

      {/* PRODUCT CREATE/EDIT MODAL */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">
                  EDICIÓN DE CATÁLOGO
                </span>
                <h3 className="font-heading text-lg font-bold text-gray-900 uppercase tracking-wide">
                  {editingProduct.id ? "Editar Producto" : "Nuevo Producto"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                    Nombre del Mueble / Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    placeholder="Ej: Rack TV Escandinavo Melamina"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                    Línea de Venta *
                  </label>
                  <select
                    value={editingProduct.linea || "practica"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, linea: e.target.value as any })}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none font-medium text-xs bg-white"
                  >
                    <option value="practica">Línea Práctica (Compra fácil y estándar)</option>
                    <option value="premium">Línea Premium (Personalizada y diseño)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                    SKU / Código Único
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sku || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    placeholder="SKU-201"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                    Categoría
                  </label>
                  <select
                    value={editingProduct.category || "comedor"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none font-medium text-xs bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                    Precio Normal ($ ARS) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.regularPrice || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, regularPrice: Number(e.target.value) })
                    }
                    placeholder="280000"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                    Precio Rebajado / Oferta ($ ARS)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.salePrice || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        salePrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="245000"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                    Stock Disponible
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                    URL Imagen Principal (DonWeb)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.images?.[0] || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                    placeholder="https://acasatienda.com.ar/wp-content/uploads/..."
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none font-mono text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                    Descripción Breve
                  </label>
                  <input
                    type="text"
                    value={editingProduct.shortDescription || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                    placeholder="Breve resumen para la ficha comercial"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                    Descripción Completa & Materiales
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Detalles sobre melamina, lustre, estructura, medidas..."
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none text-xs"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-white font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md transition-all"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
