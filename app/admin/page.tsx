"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Product,
  Order,
  DonWebFtpSettings,
  ProductVariation,
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
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  MessageCircle,
  Users,
  Globe,
  Zap,
  Sparkles,
  RefreshCw,
  TrendingUp,
  MousePointer,
  Activity,
  ArrowRight,
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

  // DonWeb upload handler
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage("Subiendo archivo...");

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
        setUploadMessage(`¡Imagen subida con éxito! URL lista para usar.`);
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

  // Metrics calculations
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

  // Analytics totals and ratios
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
    <div className="flex h-screen bg-[#f0f0f1] font-sans antialiased text-[#3c434a]">
      {/* 1. WordPress / WooCommerce Sidebar */}
      <aside className="w-64 bg-[#1d2327] text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[#2c3338] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-heading font-bold text-lg tracking-widest text-white">ACASA</span>
            <span className="text-[10px] bg-[#2271b1] text-white px-2 py-0.5 rounded font-bold uppercase">
              Admin Suite
            </span>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-sm transition-colors text-left ${
              activeTab === "dashboard" ? "bg-[#2271b1] text-white font-semibold" : "text-[#c3c4c7] hover:bg-[#131719] hover:text-white"
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Escritorio & Tablero</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-sm transition-colors text-left ${
              activeTab === "products" ? "bg-[#2271b1] text-white font-semibold" : "text-[#c3c4c7] hover:bg-[#131719] hover:text-white"
            }`}
          >
            <Package size={18} />
            <div className="flex-1 flex justify-between items-center">
              <span>Productos</span>
              <span className="text-xs bg-[#2c3338] px-2 py-0.5 rounded-full text-gray-300">
                {products.length}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-sm transition-colors text-left ${
              activeTab === "orders" ? "bg-[#2271b1] text-white font-semibold" : "text-[#c3c4c7] hover:bg-[#131719] hover:text-white"
            }`}
          >
            <ShoppingCart size={18} />
            <div className="flex-1 flex justify-between items-center">
              <span>Pedidos</span>
              {activeOrdersCount > 0 && (
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                  {activeOrdersCount}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("donweb")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-sm transition-colors text-left ${
              activeTab === "donweb" ? "bg-[#2271b1] text-white font-semibold" : "text-[#c3c4c7] hover:bg-[#131719] hover:text-white"
            }`}
          >
            <UploadCloud size={18} />
            <span>Imágenes & DonWeb</span>
          </button>
        </nav>

        {/* Store Link at bottom */}
        <div className="p-3 border-t border-[#2c3338]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-[#c3c4c7] hover:text-white bg-[#2c3338] p-2 rounded transition-colors"
          >
            <span>Ver Tienda Pública</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-[#dcdcde] px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-semibold text-gray-800 uppercase tracking-wide">
              {activeTab === "dashboard" && "Tablero de Tráfico & Analítica en Vivo"}
              {activeTab === "products" && "Gestión de Productos (Catálogo)"}
              {activeTab === "orders" && "Gestión de Pedidos (WooCommerce)"}
              {activeTab === "donweb" && "Almacenamiento DonWeb & Multimedia"}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Supabase Conectado</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Administrador Acasa</span>
              <div className="w-8 h-8 rounded-full bg-[#2271b1] text-white text-xs font-bold flex items-center justify-center">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-6">
          {/* TAB 1: DASHBOARD & LIVE ANALYTICS */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 w-[90%] mx-auto">
              {/* Header Toolbar: Time Range + Refresh */}
              <div className="bg-white p-4 rounded-lg border border-[#dcdcde] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-[#2271b1]" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">
                      Monitor de Tráfico y Conversión
                    </h3>
                    <p className="text-xs text-gray-500">
                      Datos en tiempo real sincronizados desde Supabase (Acasa Web)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Range buttons */}
                  <div className="inline-flex rounded-md shadow-sm border border-gray-300 bg-gray-50 p-0.5 text-xs">
                    <button
                      onClick={() => setTimeRange("today")}
                      className={`px-3 py-1.5 rounded font-medium transition-colors ${
                        timeRange === "today" ? "bg-white text-[#2271b1] shadow-xs font-bold" : "text-gray-600 hover:text-black"
                      }`}
                    >
                      Hoy
                    </button>
                    <button
                      onClick={() => setTimeRange("7d")}
                      className={`px-3 py-1.5 rounded font-medium transition-colors ${
                        timeRange === "7d" ? "bg-white text-[#2271b1] shadow-xs font-bold" : "text-gray-600 hover:text-black"
                      }`}
                    >
                      Últimos 7 días
                    </button>
                    <button
                      onClick={() => setTimeRange("30d")}
                      className={`px-3 py-1.5 rounded font-medium transition-colors ${
                        timeRange === "30d" ? "bg-white text-[#2271b1] shadow-xs font-bold" : "text-gray-600 hover:text-black"
                      }`}
                    >
                      30 días
                    </button>
                    <button
                      onClick={() => setTimeRange("all")}
                      className={`px-3 py-1.5 rounded font-medium transition-colors ${
                        timeRange === "all" ? "bg-white text-[#2271b1] shadow-xs font-bold" : "text-gray-600 hover:text-black"
                      }`}
                    >
                      Histórico
                    </button>
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={fetchAnalytics}
                    disabled={analyticsLoading}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={analyticsLoading ? "animate-spin" : ""} />
                    <span>Actualizar</span>
                  </button>
                </div>
              </div>

              {/* 4 Primary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Tráfico Total */}
                <div className="bg-white p-5 rounded-lg border border-[#dcdcde] shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Tráfico Web Total
                    </span>
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2271b1] flex items-center justify-center">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-3xl font-extrabold text-gray-900">
                      {analyticsLoading ? "..." : analytics?.totalPageviews || 0}
                    </p>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span className="font-semibold text-gray-800">
                        {analytics?.uniqueVisitors || 0}
                      </span>
                      <span>visitantes únicos (sesiones)</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Páginas vistas totales</span>
                    <span className="font-mono text-gray-600">100% web</span>
                  </div>
                </div>

                {/* 2. Línea Práctica (Compra fácil) */}
                <div className="bg-white p-5 rounded-lg border border-[#dcdcde] shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#c25e1a] uppercase tracking-wider">
                      Compra Fácil (Práctica)
                    </span>
                    <div className="w-8 h-8 rounded-full bg-orange-50 text-[#c25e1a] flex items-center justify-center">
                      <Zap size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-3xl font-extrabold text-gray-900">
                      {analyticsLoading ? "..." : practicaTotalScore}
                    </p>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span className="font-bold text-[#c25e1a]">{practicaPct}%</span>
                      <span>del interés por línea</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Entradas directas: {analytics?.practicaEntries || 0}</span>
                    <span>Vistas: {analytics?.practicaTotalViews || 0}</span>
                  </div>
                </div>

                {/* 3. Línea Premium (Personalizada y diseño) */}
                <div className="bg-white p-5 rounded-lg border border-[#dcdcde] shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2d4332] uppercase tracking-wider">
                      Personalizada y Diseño
                    </span>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#2d4332] flex items-center justify-center">
                      <Sparkles size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-3xl font-extrabold text-gray-900">
                      {analyticsLoading ? "..." : premiumTotalScore}
                    </p>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span className="font-bold text-[#2d4332]">{premiumPct}%</span>
                      <span>del interés por línea</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Entradas directas: {analytics?.premiumEntries || 0}</span>
                    <span>Vistas: {analytics?.premiumTotalViews || 0}</span>
                  </div>
                </div>

                {/* 4. Consultas por WhatsApp */}
                <div className="bg-white p-5 rounded-lg border border-[#dcdcde] shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#25D366] uppercase tracking-wider">
                      Consultas WhatsApp
                    </span>
                    <div className="w-8 h-8 rounded-full bg-green-50 text-[#25D366] flex items-center justify-center">
                      <MessageCircle size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-3xl font-extrabold text-gray-900">
                      {analyticsLoading ? "..." : totalWa}
                    </p>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span className="font-bold text-green-700">{conversionRate}%</span>
                      <span>conversión sobre visitantes</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Práctica: {analytics?.whatsappPracticaClicks || 0}</span>
                    <span>Premium: {analytics?.whatsappPremiumClicks || 0}</span>
                  </div>
                </div>
              </div>

              {/* Comparative Analysis: Traffic & WhatsApp Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Traffic Comparison */}
                <div className="bg-white p-5 rounded-lg border border-[#dcdcde] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp size={16} className="text-[#2271b1]" />
                        <h4 className="font-bold text-sm text-gray-900">
                          Preferencia de Línea: Práctica vs Personalizada
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-gray-400">
                        {totalLineInteractions} interacciones
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      Comparativa entre los usuarios que entraron o navegaron muebles prácticos y estándar vs muebles de diseño y personalizados.
                    </p>

                    {/* Progress Ratio Bar */}
                    <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden flex shadow-inner mb-3">
                      <div
                        style={{ width: `${practicaPct}%` }}
                        className="bg-[#c25e1a] h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
                        title={`Línea Práctica: ${practicaPct}%`}
                      >
                        {practicaPct > 12 ? `${practicaPct}%` : ""}
                      </div>
                      <div
                        style={{ width: `${premiumPct}%` }}
                        className="bg-[#2d4332] h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
                        title={`Línea Premium: ${premiumPct}%`}
                      >
                        {premiumPct > 12 ? `${premiumPct}%` : ""}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded border border-orange-100 bg-orange-50/50">
                        <div className="flex items-center space-x-2">
                          <span className="w-3 h-3 rounded-full bg-[#c25e1a]" />
                          <span className="text-xs font-bold text-gray-800">Línea Práctica</span>
                        </div>
                        <p className="text-xl font-extrabold text-gray-900 mt-1">
                          {practicaTotalScore}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {practicaPct}% del tráfico segmentado
                        </p>
                      </div>

                      <div className="p-3 rounded border border-emerald-100 bg-emerald-50/50">
                        <div className="flex items-center space-x-2">
                          <span className="w-3 h-3 rounded-full bg-[#2d4332]" />
                          <span className="text-xs font-bold text-gray-800">Personalizada y Diseño</span>
                        </div>
                        <p className="text-xl font-extrabold text-gray-900 mt-1">
                          {premiumTotalScore}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {premiumPct}% del tráfico segmentado
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Clicks Breakdown by Line */}
                <div className="bg-white p-5 rounded-lg border border-[#dcdcde] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <MessageCircle size={16} className="text-[#25D366]" />
                        <h4 className="font-bold text-sm text-gray-900">
                          Desglose de Consultas a WhatsApp por Línea
                        </h4>
                      </div>
                      <span className="text-xs font-bold bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full">
                        {totalWa} consultas
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      Origen de cada persona que presionó el botón de WhatsApp para asesorarse o comprar.
                    </p>

                    <div className="space-y-3">
                      {/* Práctica WhatsApp */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700 flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#c25e1a]" />
                            <span>Línea Práctica (Compra fácil)</span>
                          </span>
                          <span className="font-bold text-gray-900">
                            {analytics?.whatsappPracticaClicks || 0} clics ({waPracticaPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${waPracticaPct}%` }}
                            className="bg-[#c25e1a] h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>

                      {/* Premium WhatsApp */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700 flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#2d4332]" />
                            <span>Línea Premium (Diseño & Personalizada)</span>
                          </span>
                          <span className="font-bold text-gray-900">
                            {analytics?.whatsappPremiumClicks || 0} clics ({waPremiumPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${waPremiumPct}%` }}
                            className="bg-[#2d4332] h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>

                      {/* General / Floating WhatsApp */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700 flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                            <span>Botón Flotante General / Sucursales</span>
                          </span>
                          <span className="font-bold text-gray-900">
                            {analytics?.whatsappGeneralClicks || 0} clics ({waGeneralPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${waGeneralPct}%` }}
                            className="bg-gray-400 h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Teléfono oficial conectado:</span>
                    <span className="font-mono text-gray-800 font-semibold">+54 9 261 684-3330</span>
                  </div>
                </div>
              </div>

              {/* Bottom Tables: Top Consulted Products & Live Recent Events */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Consulted Products Table */}
                <div className="bg-white rounded-lg border border-[#dcdcde] shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-[#dcdcde] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MousePointer size={15} className="text-[#2271b1]" />
                      <h4 className="font-bold text-sm text-gray-900">
                        Top Productos Consultados por WhatsApp
                      </h4>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {analytics?.topConsultedProducts.length || 0} registrados
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#f6f7f7] border-b text-gray-600 uppercase font-semibold">
                        <tr>
                          <th className="p-3">Producto</th>
                          <th className="p-3">Línea</th>
                          <th className="p-3">SKU</th>
                          <th className="p-3 text-right">Consultas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {analytics?.topConsultedProducts && analytics.topConsultedProducts.length > 0 ? (
                          analytics.topConsultedProducts.map((prod, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="p-3 font-bold text-gray-900">{prod.title}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    prod.linea === "premium"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  {prod.linea === "premium" ? "Premium" : "Práctica"}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-gray-500">{prod.sku || "-"}</td>
                              <td className="p-3 text-right font-extrabold text-[#25D366]">
                                {prod.clicks} {prod.clicks === 1 ? "consulta" : "consultas"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-gray-400 italic">
                              No hay consultas de productos en este período seleccionado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Real-time Activity Feed */}
                <div className="bg-white rounded-lg border border-[#dcdcde] shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-[#dcdcde] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock size={15} className="text-[#2271b1]" />
                      <h4 className="font-bold text-sm text-gray-900">
                        Registro de Actividad en Vivo (Supabase)
                      </h4>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      Última sinc: {lastRefreshed.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                    {analytics?.recentEvents && analytics.recentEvents.length > 0 ? (
                      analytics.recentEvents.map((ev) => {
                        const date = new Date(ev.created_at);
                        const isWhatsApp = ev.event_type === "whatsapp_click";
                        const isEntry = ev.event_type === "line_entry";

                        return (
                          <div key={ev.id} className="p-3 hover:bg-gray-50 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2.5">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  isWhatsApp
                                    ? "bg-green-100 text-green-700"
                                    : isEntry
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {isWhatsApp ? <MessageCircle size={13} /> : <Globe size={13} />}
                              </span>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {isWhatsApp
                                    ? "Clic en Consultar por WhatsApp"
                                    : isEntry
                                    ? "Entrada a Línea desde Gateway"
                                    : "Visita de Página"}
                                </p>
                                <p className="text-[11px] text-gray-400 font-mono">
                                  {ev.path}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end space-y-1">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  ev.linea === "practica"
                                    ? "bg-orange-100 text-orange-800"
                                    : ev.linea === "premium"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {ev.linea || "General"}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-gray-400 italic text-xs">
                        Aún no hay eventos registrados en este período.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Store & Orders section */}
              <div className="pt-4 border-t border-[#dcdcde]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
                    Resumen de Pedidos y Catálogo
                  </h4>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs text-[#2271b1] hover:underline font-semibold"
                  >
                    Ir a Pedidos →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-4 rounded border border-[#dcdcde] shadow-xs">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ventas Confirmadas</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalSales)}</p>
                  </div>
                  <div className="bg-white p-4 rounded border border-[#dcdcde] shadow-xs">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedidos Pendientes</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{activeOrdersCount}</p>
                  </div>
                  <div className="bg-white p-4 rounded border border-[#dcdcde] shadow-xs">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Productos en Catálogo</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{products.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS (WOOCOMMERCE STYLE) */}
          {activeTab === "products" && (
            <div className="space-y-4 w-[90%] mx-auto">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded border border-[#dcdcde] shadow-sm">
                <div className="flex items-center space-x-2">
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
                    className="bg-[#2271b1] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#135e96] flex items-center space-x-1.5 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Añadir Nuevo Producto</span>
                  </button>

                  <select
                    value={selectedCatFilter}
                    onChange={(e) => setSelectedCatFilter(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2.5 py-2 outline-none bg-white"
                  >
                    <option value="all">Todas las categorías</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Buscar por título o SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-gray-300 rounded outline-none focus:border-[#2271b1]"
                  />
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded border border-[#dcdcde] shadow-sm overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f6f7f7] border-b text-gray-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3 w-16">Foto</th>
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Línea</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Precio</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <img
                            src={p.images[0] || "/placeholder.jpg"}
                            alt={p.title}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        </td>
                        <td className="p-3 font-semibold text-gray-900">
                          <div className="flex flex-col">
                            <span className="font-bold">{p.title}</span>
                            <span className="text-[11px] text-gray-400 font-mono">/{p.slug}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.linea === "premium"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {p.linea === "premium" ? "Premium" : "Práctica"}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 font-mono">{p.sku || "-"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {p.stock > 0 ? `Hay existencias (${p.stock})` : "Agotado"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">
                              {formatCurrency(p.salePrice ?? p.regularPrice)}
                            </span>
                            {p.salePrice && (
                              <span className="text-[10px] text-gray-400 line-through">
                                {formatCurrency(p.regularPrice)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 uppercase font-medium text-gray-600">{p.category}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-gray-600 hover:text-[#2271b1] hover:bg-gray-100 rounded"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDuplicateProduct(p)}
                              className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded"
                              title="Duplicar"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
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
            <div className="space-y-4 w-[90%] mx-auto">
              <div className="bg-white p-4 rounded border border-[#dcdcde] shadow-sm flex justify-between items-center">
                <h3 className="font-bold text-sm text-gray-800">
                  Gestión de Pedidos ({orders.length} pedidos totales)
                </h3>
                <span className="text-xs text-gray-500">
                  Total Facturado: <strong className="text-black">{formatCurrency(totalSales)}</strong>
                </span>
              </div>

              <div className="bg-white rounded border border-[#dcdcde] shadow-sm overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f6f7f7] border-b text-gray-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Pedido</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Teléfono / Email</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Items</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-center">Cambiar Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-[#2271b1]">{o.orderNumber}</td>
                        <td className="p-3 text-gray-500">{o.createdAt}</td>
                        <td className="p-3 font-semibold text-gray-900">{o.customerName}</td>
                        <td className="p-3 text-gray-600">
                          <div>{o.customerPhone}</div>
                          <div className="text-[11px] text-gray-400">{o.customerEmail}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
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
                        <td className="p-3">
                          <span className="text-gray-700 font-medium">
                            {o.items.reduce((acc, it) => acc + it.quantity, 0)} unidades
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-gray-900">{formatCurrency(o.total)}</td>
                        <td className="p-3 text-center">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                            className="text-[11px] border rounded px-2 py-1 bg-white outline-none"
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
              <div className="bg-white p-6 rounded border border-[#dcdcde] shadow-sm space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b">
                  <UploadCloud className="text-[#2271b1]" size={28} />
                  <div>
                    <h3 className="font-bold text-base text-gray-900">
                      Conexión FTP DonWeb Hosting
                    </h3>
                    <p className="text-xs text-gray-500">
                      Configurá las credenciales FTP para subir imágenes directamente a tu servidor DonWeb
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveDonwebConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Servidor FTP (Host)
                    </label>
                    <input
                      type="text"
                      value={donwebConfig.host}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, host: e.target.value })}
                      placeholder="ftp.tudominio.com"
                      className="w-full text-xs p-2.5 border rounded outline-none focus:border-[#2271b1]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Usuario FTP
                    </label>
                    <input
                      type="text"
                      value={donwebConfig.user}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, user: e.target.value })}
                      placeholder="usuario_ftp"
                      className="w-full text-xs p-2.5 border rounded outline-none focus:border-[#2271b1]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Contraseña FTP
                    </label>
                    <input
                      type="password"
                      value={donwebConfig.password || ""}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full text-xs p-2.5 border rounded outline-none focus:border-[#2271b1]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Puerto FTP
                    </label>
                    <input
                      type="number"
                      value={donwebConfig.port}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, port: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 border rounded outline-none focus:border-[#2271b1]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Carpeta Remota (Directorio destino)
                    </label>
                    <input
                      type="text"
                      value={donwebConfig.remoteDir}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, remoteDir: e.target.value })}
                      placeholder="/public_html/uploads"
                      className="w-full text-xs p-2.5 border rounded outline-none focus:border-[#2271b1]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Prefijo URL Pública
                    </label>
                    <input
                      type="text"
                      value={donwebConfig.publicUrlPrefix}
                      onChange={(e) =>
                        setDonwebConfig({ ...donwebConfig, publicUrlPrefix: e.target.value })
                      }
                      placeholder="https://tudominio.com/uploads"
                      className="w-full text-xs p-2.5 border rounded outline-none focus:border-[#2271b1]"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="bg-[#2271b1] text-white text-xs font-semibold px-5 py-2.5 rounded hover:bg-[#135e96] flex items-center space-x-2 transition-colors"
                    >
                      <Save size={15} />
                      <span>Guardar Configuración FTP</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Upload section */}
              <div className="bg-white p-6 rounded border border-[#dcdcde] shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-gray-800">Subida Rápida de Fotos a DonWeb</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#2271b1] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFile}
                    className="hidden"
                    id="donweb-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="donweb-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs font-semibold text-[#2271b1]">
                      {isUploading ? "Subiendo archivo..." : "Hacé clic para seleccionar una foto"}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-1">PNG, JPG o WebP</span>
                  </label>
                </div>

                {uploadMessage && (
                  <p className="text-xs font-semibold text-blue-700 bg-blue-50 p-3 rounded">
                    {uploadMessage}
                  </p>
                )}

                {uploadedUrls.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h5 className="text-xs font-bold text-gray-700 uppercase">Imágenes subidas recientemente:</h5>
                    <div className="space-y-1">
                      {uploadedUrls.map((url, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs border">
                          <span className="truncate max-w-md font-mono text-[11px]">{url}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(url);
                              alert("¡URL copiada al portapapeles!");
                            }}
                            className="text-[#2271b1] hover:underline font-semibold ml-2 text-[11px]"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingProduct.id ? "Editar Producto" : "Nuevo Producto en Catálogo"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Nombre / Título *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    placeholder="Ej: Mesa Comedor Nórdica"
                    className="w-full p-2.5 border rounded outline-none focus:border-[#2271b1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Línea de Venta *</label>
                  <select
                    value={editingProduct.linea || "practica"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, linea: e.target.value as any })}
                    className="w-full p-2.5 border rounded outline-none"
                  >
                    <option value="practica">Línea Práctica (Compra fácil y estándar)</option>
                    <option value="premium">Línea Premium (Personalizada y diseño)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">SKU / Código</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    placeholder="SKU-101"
                    className="w-full p-2.5 border rounded outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Categoría</label>
                  <select
                    value={editingProduct.category || "comedor"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full p-2.5 border rounded outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Precio Normal ($ ARS) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.regularPrice || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, regularPrice: Number(e.target.value) })
                    }
                    placeholder="280000"
                    className="w-full p-2.5 border rounded outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Precio Rebajado / Oferta ($ ARS)</label>
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
                    className="w-full p-2.5 border rounded outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Cantidad de Stock</label>
                  <input
                    type="number"
                    value={editingProduct.stock ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">URL de Imagen Principal</label>
                  <input
                    type="text"
                    value={editingProduct.images?.[0] || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                    placeholder="https://acasatienda.com.ar/wp-content/uploads/..."
                    className="w-full p-2.5 border rounded outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Descripción Corta</label>
                  <input
                    type="text"
                    value={editingProduct.shortDescription || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                    placeholder="Breve resumen del producto para la ficha"
                    className="w-full p-2.5 border rounded outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Descripción Completa</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Detalles sobre materiales, lustre, garantía..."
                    className="w-full p-2.5 border rounded outline-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#2271b1] text-white font-semibold px-5 py-2 rounded hover:bg-[#135e96]"
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
