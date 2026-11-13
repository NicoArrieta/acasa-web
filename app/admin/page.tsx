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
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "donweb">("dashboard");

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [donwebConfig, setDonwebConfig] = useState<DonWebFtpSettings>(getStoredDonWebConfig());

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

  useEffect(() => {
    setProducts(getStoredProducts());
    setOrders(getStoredOrders());
    setDonwebConfig(getStoredDonWebConfig());
  }, []);

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

  // Metrics
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

  return (
    <div className="flex h-screen bg-[#f0f0f1] font-sans antialiased text-[#3c434a]">
      {/* 1. WordPress / WooCommerce Sidebar */}
      <aside className="w-64 bg-[#1d2327] text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[#2c3338] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-heading font-bold text-lg tracking-widest text-white">ACASA</span>
            <span className="text-[10px] bg-[#2271b1] text-white px-2 py-0.5 rounded font-bold uppercase">
              WooCommerce
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
            <span>Escritorio</span>
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
          <h2 className="text-base font-semibold text-gray-800 uppercase tracking-wide">
            {activeTab === "dashboard" && "Resumen de la Tienda"}
            {activeTab === "products" && "Gestión de Productos (Catálogo)"}
            {activeTab === "orders" && "Gestión de Pedidos (WooCommerce)"}
            {activeTab === "donweb" && "Almacenamiento DonWeb & Multimedia"}
          </h2>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500">Sesión: Administrador Acasa</span>
            <div className="w-8 h-8 rounded-full bg-[#2271b1] text-white text-xs font-bold flex items-center justify-center">
              A
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded border border-[#dcdcde] shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ventas Totales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalSales)}</p>
                  <p className="text-xs text-green-600 mt-1">Órdenes confirmadas</p>
                </div>
                <div className="bg-white p-5 rounded border border-[#dcdcde] shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedidos Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{activeOrdersCount}</p>
                  <p className="text-xs text-orange-500 mt-1">Aguardando despacho/preparación</p>
                </div>
                <div className="bg-white p-5 rounded border border-[#dcdcde] shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Productos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{products.length}</p>
                  <p className="text-xs text-blue-600 mt-1">En catálogo activo</p>
                </div>
                <div className="bg-white p-5 rounded border border-[#dcdcde] shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alojamiento Multimedia</p>
                  <p className="text-xl font-bold text-gray-900 mt-2">DonWeb Hosting</p>
                  <p className="text-xs text-gray-500 mt-1">Listo para subida de fotos</p>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white rounded border border-[#dcdcde] shadow-sm">
                <div className="p-4 border-b border-[#dcdcde] flex justify-between items-center">
                  <h3 className="font-semibold text-sm text-gray-900">Últimos Pedidos Recibidos</h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs text-[#2271b1] hover:underline font-semibold"
                  >
                    Ver todos los pedidos →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#f6f7f7] border-b text-gray-600 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Pedido</th>
                        <th className="p-3">Cliente</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Envío</th>
                        <th className="p-3">Pago</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="p-3 font-bold text-[#2271b1]">{order.orderNumber}</td>
                          <td className="p-3">{order.customerName}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "shipped"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="p-3 text-gray-600">{order.shippingMethod}</td>
                          <td className="p-3 text-gray-600">{order.paymentMethod}</td>
                          <td className="p-3 text-right font-bold text-gray-900">
                            {formatCurrency(order.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS (WOOCOMMERCE STYLE) */}
          {activeTab === "products" && (
            <div className="space-y-4">
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
                        <td className="p-3 text-gray-600 uppercase text-[11px] font-semibold">{p.category}</td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar producto"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(p)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            title="Duplicar producto"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Eliminar producto"
                          >
                            <Trash2 size={15} />
                          </button>
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
            <div className="space-y-4">
              <div className="bg-white rounded border border-[#dcdcde] shadow-sm overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f6f7f7] border-b text-gray-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Pedido</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Productos</th>
                      <th className="p-3">Envío</th>
                      <th className="p-3">Pago</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-[#2271b1]">{order.orderNumber}</td>
                        <td className="p-3 text-gray-500">{order.createdAt}</td>
                        <td className="p-3">
                          <div className="font-semibold text-gray-900">{order.customerName}</div>
                          <div className="text-[11px] text-gray-500">{order.customerEmail}</div>
                          <div className="text-[11px] text-gray-500">{order.customerPhone}</div>
                        </td>
                        <td className="p-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            className="text-[11px] font-bold p-1 rounded border border-gray-300 outline-none bg-white cursor-pointer"
                          >
                            <option value="pending">Pendiente</option>
                            <option value="processing">Procesando</option>
                            <option value="shipped">Enviado (OCA)</option>
                            <option value="completed">Completado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <ul className="space-y-1">
                            {order.items.map((it, i) => (
                              <li key={i} className="text-gray-700">
                                {it.quantity}x {it.product.title}
                                {it.selectedVariations && (
                                  <span className="text-gray-400 text-[10px] block">
                                    {Object.values(it.selectedVariations).join(" | ")}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-3 text-gray-600">
                          <div>{order.shippingMethod}</div>
                          <div className="text-[10px] text-gray-400">
                            {order.shippingAddress.city}, {order.shippingAddress.province}
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">{order.paymentMethod}</td>
                        <td className="p-3 text-right font-bold text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DONWEB IMAGES & HOSTING */}
          {activeTab === "donweb" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Settings */}
              <div className="lg:col-span-6 bg-white p-6 rounded border border-[#dcdcde] shadow-sm space-y-4">
                <h3 className="font-semibold text-sm text-gray-900 flex items-center">
                  <UploadCloud size={18} className="mr-2 text-[#2271b1]" />
                  Configuración del Hosting DonWeb (FTP / Media)
                </h3>
                <p className="text-xs text-gray-500">
                  Ingresá las credenciales FTP de DonWeb para que las fotos que subas se guarden directamente en la carpeta de tu servidor DonWeb y se sirvan con la URL de tu dominio.
                </p>

                <form onSubmit={handleSaveDonwebConfig} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Servidor FTP / Host DonWeb</label>
                    <input
                      type="text"
                      value={donwebConfig.host}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, host: e.target.value })}
                      placeholder="ftp.acasatienda.com.ar"
                      className="w-full p-2.5 border rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Usuario FTP DonWeb</label>
                    <input
                      type="text"
                      value={donwebConfig.user}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, user: e.target.value })}
                      placeholder="u123456789"
                      className="w-full p-2.5 border rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Contraseña FTP</label>
                    <input
                      type="password"
                      value={donwebConfig.password || ""}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full p-2.5 border rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Directorio remoto en DonWeb</label>
                    <input
                      type="text"
                      value={donwebConfig.remoteDir}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, remoteDir: e.target.value })}
                      placeholder="/public_html/uploads"
                      className="w-full p-2.5 border rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Prefijo de URL pública</label>
                    <input
                      type="text"
                      value={donwebConfig.publicUrlPrefix}
                      onChange={(e) => setDonwebConfig({ ...donwebConfig, publicUrlPrefix: e.target.value })}
                      placeholder="https://acasatienda.com.ar/wp-content/uploads"
                      className="w-full p-2.5 border rounded outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#2271b1] text-white font-semibold px-4 py-2 rounded hover:bg-[#135e96] flex items-center space-x-1.5"
                  >
                    <Save size={14} />
                    <span>Guardar Configuración DonWeb</span>
                  </button>
                </form>
              </div>

              {/* Upload Dropzone */}
              <div className="lg:col-span-6 bg-white p-6 rounded border border-[#dcdcde] shadow-sm space-y-4">
                <h3 className="font-semibold text-sm text-gray-900 flex items-center">
                  <Upload size={18} className="mr-2 text-[#2271b1]" />
                  Subir Nueva Imagen al Hosting
                </h3>

                <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center space-y-3 hover:border-[#2271b1] transition-colors cursor-pointer relative bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFile}
                    disabled={isUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-gray-400 border">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-xs text-gray-700 font-semibold">
                    Hacé clic acá o arrastrá una imagen para subir a DonWeb
                  </p>
                  <p className="text-[11px] text-gray-400">PNG, JPG, WEBP recomendados</p>
                </div>

                {uploadMessage && (
                  <p className="text-xs bg-blue-50 text-blue-800 p-2.5 rounded border border-blue-200">
                    {uploadMessage}
                  </p>
                )}

                {/* List of uploaded URLs */}
                {uploadedUrls.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-xs font-bold text-gray-800">URLs generadas para copiar:</h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {uploadedUrls.map((url, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded border text-xs"
                        >
                          <span className="font-mono text-[11px] truncate flex-1 mr-2 text-gray-600">{url}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(url);
                              alert("¡URL copiada al portapapeles!");
                            }}
                            className="text-[#2271b1] hover:underline font-semibold flex-shrink-0"
                          >
                            Copiar
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

      {/* PRODUCT CREATE / EDIT MODAL */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center bg-[#f6f7f7]">
              <h3 className="font-bold text-sm text-gray-900">
                {editingProduct.id ? `Editar: ${editingProduct.title}` : "Añadir Nuevo Producto (WooCommerce)"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Título del Producto *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    placeholder="Ej: Silla Bali Tapizada"
                    className="w-full p-2.5 border rounded outline-none focus:border-[#2271b1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">SKU / Código</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    placeholder="BALI-01"
                    className="w-full p-2.5 border rounded outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Categoría</label>
                  <select
                    value={editingProduct.category || "comedor"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full p-2.5 border rounded outline-none bg-white"
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
                  <label className="block font-semibold text-gray-700 mb-1">URL de Imagen Principal (DonWeb)</label>
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
