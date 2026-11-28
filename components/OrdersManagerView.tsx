"use client";

import React, { useState, useMemo } from "react";
import { Order } from "@/lib/types";
import { formatCurrency } from "@/lib/store";
import {
  Search,
  ShoppingCart,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Download,
  Eye,
  X,
  ExternalLink,
  DollarSign,
  AlertCircle,
  MessageCircle,
} from "lucide-react";

interface OrdersManagerViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
}

const STATUS_CONFIG: Record<
  Order["status"],
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  pending: {
    label: "Pendiente",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    icon: Clock,
  },
  processing: {
    label: "En preparación",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    icon: Package,
  },
  shipped: {
    label: "Despachado",
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    icon: Truck,
  },
  completed: {
    label: "Completado",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelado",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    icon: XCircle,
  },
};

export default function OrdersManagerView({
  orders,
  onUpdateOrderStatus,
}: OrdersManagerViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }, [orders]);

  // Total sales calculated without cancelled
  const totalSales = useMemo(() => {
    return orders
      .filter((o) => o.status !== "cancelled")
      .reduce((acc, o) => acc + (o.total || 0), 0);
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (statusFilter !== "all" && o.status !== statusFilter) return false;

      // Search query
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchOrder = o.orderNumber?.toLowerCase().includes(q);
      const matchName = o.customerName?.toLowerCase().includes(q);
      const matchEmail = o.customerEmail?.toLowerCase().includes(q);
      const matchPhone = o.customerPhone?.toLowerCase().includes(q);
      const matchItem = o.items?.some((it) =>
        it.product?.title?.toLowerCase().includes(q)
      );

      return matchOrder || matchName || matchEmail || matchPhone || matchItem;
    });
  }, [orders, statusFilter, search]);

  // Helper for WhatsApp
  const getWhatsAppLink = (order: Order) => {
    const raw = order.customerPhone || "";
    let clean = raw.replace(/\D/g, "");
    if (clean.startsWith("0")) clean = clean.substring(1);
    if (!clean.startsWith("54") && clean.length >= 10) {
      clean = "549" + clean;
    }
    const message = `Hola ${order.customerName}, te escribimos desde ACASA Tienda por tu pedido ${order.orderNumber}.`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      "Pedido",
      "Fecha",
      "Cliente",
      "Email",
      "Teléfono",
      "Dirección",
      "Ciudad",
      "Provincia",
      "Método Envío",
      "Método Pago",
      "Estado",
      "Unidades",
      "Total",
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.createdAt}"`,
      `"${o.customerName}"`,
      `"${o.customerEmail}"`,
      `"${o.customerPhone}"`,
      `"${o.shippingAddress?.street || ""}"`,
      `"${o.shippingAddress?.city || ""}"`,
      `"${o.shippingAddress?.province || ""}"`,
      `"${o.shippingMethod || ""}"`,
      `"${o.paymentMethod || ""}"`,
      `"${o.status}"`,
      o.items?.reduce((acc, it) => acc + it.quantity, 0) || 0,
      o.total,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `pedidos_acasa_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-[96%] sm:w-[97%] mx-auto space-y-4 animate-fadeIn">
      {/* 1. Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
              Total Facturado
            </span>
            <span className="text-base sm:text-lg font-heading font-black text-gray-900 font-mono">
              {formatCurrency(totalSales)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
              Pendientes
            </span>
            <span className="text-base sm:text-lg font-heading font-black text-amber-600 font-mono">
              {counts.pending}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
              En preparación
            </span>
            <span className="text-base sm:text-lg font-heading font-black text-blue-600 font-mono">
              {counts.processing}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package size={18} />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
              Despachados / Listos
            </span>
            <span className="text-base sm:text-lg font-heading font-black text-purple-600 font-mono">
              {counts.shipped + counts.completed}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Truck size={18} />
          </div>
        </div>
      </div>

      {/* 2. Control Toolbar: Search & Export */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por #pedido, cliente, email o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#FC7D00] outline-none"
          />
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="w-full sm:w-auto justify-center flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all cursor-pointer flex-shrink-0"
        >
          <Download size={15} />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* 3. Status Tabs Selector */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: "all", label: "Todos", count: counts.all },
          { key: "pending", label: "Pendientes", count: counts.pending },
          { key: "processing", label: "En preparación", count: counts.processing },
          { key: "shipped", label: "Despachados", count: counts.shipped },
          { key: "completed", label: "Completados", count: counts.completed },
          { key: "cancelled", label: "Cancelados", count: counts.cancelled },
        ].map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 border cursor-pointer ${
                isActive
                  ? "bg-black text-white border-black shadow-xs font-bold"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? "bg-[#FC7D00] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Orders Content */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white py-16 rounded-2xl border border-gray-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
          <h4 className="font-heading font-bold text-gray-800 text-sm uppercase tracking-wider">
            No se encontraron pedidos
          </h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto font-light">
            {search || statusFilter !== "all"
              ? "Probá cambiando los filtros o el texto de búsqueda."
              : "Los nuevos pedidos aparecerán aquí automáticamente."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card List (block md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredOrders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;
              const units = order.items?.reduce((acc, it) => acc + it.quantity, 0) || 0;

              return (
                <div
                  key={order.id}
                  className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3"
                >
                  {/* Top Row: Order #, Date, Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-heading font-black text-sm text-gray-900 font-mono">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {order.createdAt}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                    >
                      <StatusIcon size={11} />
                      <span>{statusCfg.label}</span>
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900">
                        {order.customerName}
                      </span>
                      {order.customerPhone && (
                        <a
                          href={getWhatsAppLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200 px-2 py-0.5 rounded-lg transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    <div className="text-[11px] text-gray-500 space-y-0.5 font-mono">
                      {order.customerPhone && (
                        <div className="flex items-center space-x-1">
                          <Phone size={11} className="text-gray-400" />
                          <span>{order.customerPhone}</span>
                        </div>
                      )}
                      {order.customerEmail && (
                        <div className="flex items-center space-x-1 truncate">
                          <Mail size={11} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{order.customerEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="text-[11px] text-gray-600 space-y-1">
                    <div className="font-semibold text-gray-700">
                      {units} unidad{units === 1 ? "" : "es"}:
                    </div>
                    <ul className="text-gray-500 space-y-0.5 list-disc list-inside">
                      {order.items?.slice(0, 2).map((it, idx) => (
                        <li key={idx} className="truncate">
                          {it.quantity}x {it.product?.title || "Producto"}
                        </li>
                      ))}
                      {(order.items?.length || 0) > 2 && (
                        <li className="text-gray-400">
                          + {(order.items?.length || 0) - 2} ítem(s) más
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Bottom Row: Total & Actions */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">
                        Total
                      </span>
                      <span className="font-heading font-black text-base text-gray-900 font-mono">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onUpdateOrderStatus(order.id, e.target.value as any)
                        }
                        className="text-xs border border-gray-200 rounded-xl px-2 py-1.5 bg-gray-50 font-semibold outline-none"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="processing">En preparación</option>
                        <option value="shipped">Despachado</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-xl border border-gray-200 text-gray-700 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Ver Ficha Completa"
                      >
                        <Eye size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#faf9f8] border-b text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 pl-5">Pedido</th>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Contacto</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5">Productos</th>
                    <th className="p-3.5 text-right">Total</th>
                    <th className="p-3.5 text-center">Cambiar Estado</th>
                    <th className="p-3.5 pr-5 text-center">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const statusCfg =
                      STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusCfg.icon;
                    const units =
                      order.items?.reduce((acc, it) => acc + it.quantity, 0) || 0;

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="p-3.5 pl-5 font-bold text-gray-900 font-mono">
                          {order.orderNumber}
                        </td>
                        <td className="p-3.5 text-gray-400 font-mono whitespace-nowrap">
                          {order.createdAt}
                        </td>
                        <td className="p-3.5 font-semibold text-gray-900">
                          {order.customerName}
                        </td>
                        <td className="p-3.5 text-gray-600">
                          <div className="flex items-center space-x-1.5 font-mono">
                            <span>{order.customerPhone}</span>
                            {order.customerPhone && (
                              <a
                                href={getWhatsAppLink(order)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 p-1 rounded-md transition-colors"
                                title="Chatear por WhatsApp"
                              >
                                <MessageCircle size={13} />
                              </a>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono truncate max-w-[170px]">
                            {order.customerEmail}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} whitespace-nowrap`}
                          >
                            <StatusIcon size={11} />
                            <span>{statusCfg.label}</span>
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-gray-800">
                            {units} unid.
                          </span>
                          <span className="text-[10px] text-gray-400 block truncate max-w-[150px]">
                            {order.items?.map((it) => it.product?.title).filter(Boolean).join(", ")}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-bold text-gray-900 font-mono text-sm whitespace-nowrap">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="p-3.5 text-center">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              onUpdateOrderStatus(order.id, e.target.value as any)
                            }
                            className="text-[11px] border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none font-medium hover:border-gray-300 transition-colors"
                          >
                            <option value="pending">Pendiente</option>
                            <option value="processing">En preparación</option>
                            <option value="shipped">Despachado</option>
                            <option value="completed">Completado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </td>
                        <td className="p-3.5 pr-5 text-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer inline-flex items-center space-x-1"
                            title="Ver Ficha Completa"
                          >
                            <Eye size={14} />
                            <span className="text-[10px] font-bold">Ver</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 5. Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-gray-200 shadow-2xl p-5 sm:p-7 space-y-6 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <span className="font-heading font-black text-xl text-gray-900 font-mono">
                    Pedido {selectedOrder.orderNumber}
                  </span>
                  {(() => {
                    const cfg = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.pending;
                    const Icon = cfg.icon;
                    return (
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        <Icon size={12} />
                        <span>{cfg.label}</span>
                      </span>
                    );
                  })()}
                </div>
                <p className="text-xs text-gray-400 font-mono">
                  Registrado el {selectedOrder.createdAt}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actualizar Estado:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(["pending", "processing", "shipped", "completed", "cancelled"] as Order["status"][]).map(
                  (st) => {
                    const cfg = STATUS_CONFIG[st];
                    const isSelected = selectedOrder.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => {
                          onUpdateOrderStatus(selectedOrder.id, st);
                          setSelectedOrder({ ...selectedOrder, status: st });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-black text-white border-black shadow-xs"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Customer & Contact Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                  Cliente & Contacto
                </span>
                <div className="font-bold text-sm text-gray-900">
                  {selectedOrder.customerName}
                </div>
                <div className="text-xs text-gray-600 font-mono space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <Mail size={13} className="text-gray-400" />
                    <a
                      href={`mailto:${selectedOrder.customerEmail}`}
                      className="hover:underline text-blue-600"
                    >
                      {selectedOrder.customerEmail}
                    </a>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone size={13} className="text-gray-400" />
                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="hover:underline"
                    >
                      {selectedOrder.customerPhone}
                    </a>
                  </div>
                </div>

                {selectedOrder.customerPhone && (
                  <div className="pt-2">
                    <a
                      href={getWhatsAppLink(selectedOrder)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full justify-center inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-xs"
                    >
                      <MessageCircle size={15} />
                      <span>Abrir chat de WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Shipping & Payment */}
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                  Envío & Pago
                </span>
                <div className="text-xs space-y-1.5">
                  <div className="flex items-start space-x-1.5 text-gray-700">
                    <MapPin size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">
                        {selectedOrder.shippingAddress?.street || "Dirección no especificada"}
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        {[
                          selectedOrder.shippingAddress?.city,
                          selectedOrder.shippingAddress?.province,
                          selectedOrder.shippingAddress?.postalCode && `CP ${selectedOrder.shippingAddress?.postalCode}`,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-gray-200/60 space-y-1 text-[11px] text-gray-600">
                    <div>
                      <span className="font-semibold text-gray-700">Envío:</span>{" "}
                      {selectedOrder.shippingMethod || "A coordinar"}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Pago:</span>{" "}
                      {selectedOrder.paymentMethod || "Acordado"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Purchased Table */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                Productos Comprados ({selectedOrder.items?.reduce((a, b) => a + b.quantity, 0) || 0} unidades)
              </span>

              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {selectedOrder.items?.map((item, idx) => {
                  const product = item.product;
                  const itemPrice = item.variationPrice || product?.regularPrice || 0;
                  const itemTotal = itemPrice * item.quantity;
                  const img = item.variationImage || product?.images?.[0] || "";

                  return (
                    <div
                      key={idx}
                      className="p-3.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {img ? (
                          <img
                            src={img}
                            alt={product?.title || "Producto"}
                            className="w-12 h-12 object-cover rounded-xl border border-gray-100 flex-shrink-0 bg-gray-50"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                            <Package size={20} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h5 className="font-bold text-gray-900 truncate">
                            {product?.title || "Producto sin nombre"}
                          </h5>
                          {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                            <div className="text-[11px] text-gray-500 font-mono">
                              {Object.entries(item.selectedVariations)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" • ")}
                            </div>
                          )}
                          <div className="text-[11px] text-gray-400 font-mono">
                            {item.quantity} x {formatCurrency(itemPrice)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 font-mono font-bold text-gray-900 text-sm">
                        {formatCurrency(itemTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total breakdown */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-1.5 text-xs">
                {selectedOrder.subtotal !== undefined && selectedOrder.subtotal !== selectedOrder.total && (
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                )}
                {Boolean(selectedOrder.shippingCost) && (
                  <div className="flex justify-between text-gray-500">
                    <span>Costo de envío:</span>
                    <span className="font-mono">{formatCurrency(selectedOrder.shippingCost)}</span>
                  </div>
                )}
                <div className="flex justify-between font-heading font-black text-base text-gray-900 pt-1 border-t border-gray-200">
                  <span>TOTAL:</span>
                  <span className="font-mono text-[#FC7D00]">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
