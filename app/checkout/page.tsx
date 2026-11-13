"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency, getStoredOrders, saveStoredOrders } from "@/lib/store";
import { Order } from "@/lib/types";
import {
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    province: "CABA",
    postalCode: "",
  });

  const [shippingMethod, setShippingMethod] = useState<"oca_domicilio" | "oca_sucursal" | "showroom">("oca_domicilio");
  const [paymentMethod, setPaymentMethod] = useState<"gocuotas" | "credit" | "transfer">("gocuotas");
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const shippingCost =
    shippingMethod === "oca_domicilio" ? 8500 : shippingMethod === "oca_sucursal" ? 6200 : 0;

  const transferDiscount = paymentMethod === "transfer" ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = subtotal + shippingCost - transferDiscount;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Por favor completa tus datos de contacto.");
      return;
    }

    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      shippingAddress: {
        street: formData.street || "Showroom",
        city: formData.city || "CABA",
        province: formData.province,
        postalCode: formData.postalCode || "1425",
      },
      shippingMethod:
        shippingMethod === "oca_domicilio"
          ? "OCA a Domicilio"
          : shippingMethod === "oca_sucursal"
          ? "OCA Sucursal"
          : "Retiro en Showroom",
      shippingCost,
      paymentMethod:
        paymentMethod === "gocuotas"
          ? "GOcuotas (Débito en cuotas)"
          : paymentMethod === "transfer"
          ? "Transferencia (-10% OFF)"
          : "Tarjeta de Crédito",
      items: [...cart],
      subtotal,
      total: finalTotal,
      status: "pending",
      createdAt: new Date().toLocaleString("es-AR"),
    };

    const existing = getStoredOrders();
    saveStoredOrders([newOrder, ...existing]);

    setPlacedOrder(newOrder);
    setIsSuccess(true);
    clearCart();
  };

  if (isSuccess && placedOrder) {
    return (
      <div className="w-[90%] max-w-[50vw] mx-auto py-[10vh] text-center space-y-[2vh]">
        <div className="w-[4vw] h-[4vw] min-w-[40px] min-h-[40px] bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-[2.5vw] h-[2.5vw] min-w-[24px] min-h-[24px]" />
        </div>
        <span className="text-[0.75vw] uppercase tracking-widest text-green-700 font-bold bg-green-50 px-[1vw] py-[0.5vh] rounded-full">
          ¡Pedido Recibido con Éxito!
        </span>
        <h1 className="font-heading text-[2.5vw] font-bold uppercase text-black">
          Gracias por tu compra, {placedOrder.customerName}
        </h1>
        <p className="text-[0.9vw] text-gray-600">
          Tu orden es la <strong className="text-black">{placedOrder.orderNumber}</strong>. Hemos enviado la confirmación y detalles a <strong>{placedOrder.customerEmail}</strong>.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-[0.2vw] p-[2vw] text-left text-[0.8vw] space-y-[1vh]">
          <div className="flex justify-between border-b pb-[0.8vh]">
            <span className="text-gray-500">Método de Pago:</span>
            <span className="font-semibold">{placedOrder.paymentMethod}</span>
          </div>
          <div className="flex justify-between border-b pb-[0.8vh]">
            <span className="text-gray-500">Método de Envío:</span>
            <span className="font-semibold">{placedOrder.shippingMethod}</span>
          </div>
          <div className="flex justify-between border-b pb-[0.8vh]">
            <span className="text-gray-500">Dirección:</span>
            <span className="font-semibold">
              {placedOrder.shippingAddress.street}, {placedOrder.shippingAddress.city} (CP: {placedOrder.shippingAddress.postalCode})
            </span>
          </div>
          <div className="flex justify-between pt-[0.5vh] text-[1vw] font-bold">
            <span>Total abonado:</span>
            <span>{formatCurrency(placedOrder.total)}</span>
          </div>
        </div>

        <div className="pt-[2vh] flex flex-col sm:flex-row gap-[1vw] justify-center">
          <Link
            href="/"
            className="bg-black text-white text-[0.75vw] uppercase tracking-widest font-bold px-[2vw] py-[1.5vh] rounded-[0.2vw] hover:bg-gray-800"
          >
            Volver a la tienda
          </Link>
          <Link
            href="/admin"
            className="bg-gray-100 text-black text-[0.75vw] uppercase tracking-widest font-bold px-[2vw] py-[1.5vh] rounded-[0.2vw] hover:bg-gray-200"
          >
            Ver Pedido en el Panel Admin
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="w-[90%] max-w-[50vw] mx-auto py-[12vh] text-center space-y-[2vh]">
        <h2 className="font-heading text-[2vw] font-bold uppercase">No hay productos en tu carrito</h2>
        <p className="text-[0.8vw] text-gray-500">Agregá productos desde el catálogo para iniciar la compra.</p>
        <Link
          href="/productos"
          className="inline-block bg-black text-white text-[0.75vw] uppercase tracking-widest font-bold px-[2vw] py-[1.5vh] rounded-[0.2vw] hover:bg-gray-800"
        >
          Explorar Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="w-[90%] mx-auto py-[5vh]">
      <Link href="/productos" className="inline-flex items-center text-[0.75vw] text-gray-500 hover:text-black mb-[3vh] uppercase tracking-wider">
        <ArrowLeft className="w-[0.9vw] h-[0.9vw] mr-[0.4vw]" />
        Continuar comprando
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[3vw]">
        {/* Left: Form */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-[3vh]">
          {/* 1. Contact Info */}
          <div className="bg-white p-[2vw] rounded-[0.2vw] border border-gray-200 space-y-[1.5vh]">
            <h3 className="font-heading text-[1.1vw] font-bold uppercase tracking-wider text-black flex items-center">
              <span className="w-[1.6vw] h-[1.6vw] min-w-[20px] min-h-[20px] rounded-full bg-black text-white text-[0.7vw] flex items-center justify-center mr-[0.6vw]">1</span>
              Datos de Contacto
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1vw]">
              <div className="sm:col-span-2">
                <label className="block text-[0.7vw] font-semibold text-gray-700 uppercase mb-[0.4vh]">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Martina González"
                  className="w-full text-[0.8vw] p-[1vw] border border-gray-300 rounded-[0.2vw] outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[0.7vw] font-semibold text-gray-700 uppercase mb-[0.4vh]">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="w-full text-[0.8vw] p-[1vw] border border-gray-300 rounded-[0.2vw] outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[0.7vw] font-semibold text-gray-700 uppercase mb-[0.4vh]">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+54 11 1234-5678"
                  className="w-full text-[0.8vw] p-[1vw] border border-gray-300 rounded-[0.2vw] outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping */}
          <div className="bg-white p-[2vw] rounded-[0.2vw] border border-gray-200 space-y-[1.5vh]">
            <h3 className="font-heading text-[1.1vw] font-bold uppercase tracking-wider text-black flex items-center">
              <span className="w-[1.6vw] h-[1.6vw] min-w-[20px] min-h-[20px] rounded-full bg-black text-white text-[0.7vw] flex items-center justify-center mr-[0.6vw]">2</span>
              Entrega / Envíos (OCA)
            </h3>

            <div className="space-y-[1vh]">
              <label
                className={`flex items-center justify-between p-[1.2vw] border rounded-[0.2vw] cursor-pointer transition-all ${
                  shippingMethod === "oca_domicilio" ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-[0.8vw]">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === "oca_domicilio"}
                    onChange={() => setShippingMethod("oca_domicilio")}
                    className="accent-black"
                  />
                  <div>
                    <p className="text-[0.8vw] font-bold text-gray-900">OCA - Envío a Domicilio</p>
                    <p className="text-[0.7vw] text-gray-500">Llega a tu puerta en 3 a 6 días hábiles con seguimiento.</p>
                  </div>
                </div>
                <span className="text-[0.85vw] font-bold text-black">$8.500</span>
              </label>

              <label
                className={`flex items-center justify-between p-[1.2vw] border rounded-[0.2vw] cursor-pointer transition-all ${
                  shippingMethod === "oca_sucursal" ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-[0.8vw]">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === "oca_sucursal"}
                    onChange={() => setShippingMethod("oca_sucursal")}
                    className="accent-black"
                  />
                  <div>
                    <p className="text-[0.8vw] font-bold text-gray-900">OCA - Retiro en Sucursal Oficial</p>
                    <p className="text-[0.7vw] text-gray-500">Retirás en la sucursal OCA más cercana a tu código postal.</p>
                  </div>
                </div>
                <span className="text-[0.85vw] font-bold text-black">$6.200</span>
              </label>

              <label
                className={`flex items-center justify-between p-[1.2vw] border rounded-[0.2vw] cursor-pointer transition-all ${
                  shippingMethod === "showroom" ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-[0.8vw]">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === "showroom"}
                    onChange={() => setShippingMethod("showroom")}
                    className="accent-black"
                  />
                  <div>
                    <p className="text-[0.8vw] font-bold text-gray-900">Retiro Gratis en Showroom</p>
                    <p className="text-[0.7vw] text-gray-500">Belgrano (CABA) o Pilar (Zona Norte).</p>
                  </div>
                </div>
                <span className="text-[0.85vw] font-bold text-green-700">GRATIS</span>
              </label>
            </div>

            {shippingMethod !== "showroom" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1vw] pt-[1vh]">
                <div className="sm:col-span-2">
                  <label className="block text-[0.7vw] font-semibold text-gray-600 uppercase mb-[0.4vh]">Calle y Altura *</label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Av. Santa Fe 1234"
                    className="w-full text-[0.8vw] p-[0.8vw] border border-gray-300 rounded-[0.2vw] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[0.7vw] font-semibold text-gray-600 uppercase mb-[0.4vh]">Código Postal *</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="1425"
                    className="w-full text-[0.8vw] p-[0.8vw] border border-gray-300 rounded-[0.2vw] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[0.7vw] font-semibold text-gray-600 uppercase mb-[0.4vh]">Ciudad / Localidad *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Palermo"
                    className="w-full text-[0.8vw] p-[0.8vw] border border-gray-300 rounded-[0.2vw] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[0.7vw] font-semibold text-gray-600 uppercase mb-[0.4vh]">Provincia *</label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full text-[0.8vw] p-[0.8vw] border border-gray-300 rounded-[0.2vw] outline-none bg-white"
                  >
                    <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
                    <option value="Buenos Aires">Buenos Aires</option>
                    <option value="Córdoba">Córdoba</option>
                    <option value="Santa Fe">Santa Fe</option>
                    <option value="Mendoza">Mendoza</option>
                    <option value="Otra">Otra provincia</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white p-[2vw] rounded-[0.2vw] border border-gray-200 space-y-[1.5vh]">
            <h3 className="font-heading text-[1.1vw] font-bold uppercase tracking-wider text-black flex items-center">
              <span className="w-[1.6vw] h-[1.6vw] min-w-[20px] min-h-[20px] rounded-full bg-black text-white text-[0.7vw] flex items-center justify-center mr-[0.6vw]">3</span>
              Medio de Pago
            </h3>

            <div className="space-y-[1vh]">
              <label
                className={`flex items-start justify-between p-[1.2vw] border rounded-[0.2vw] cursor-pointer transition-all ${
                  paymentMethod === "gocuotas" ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200"
                }`}
              >
                <div className="flex items-start space-x-[0.8vw]">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "gocuotas"}
                    onChange={() => setPaymentMethod("gocuotas")}
                    className="accent-black mt-[0.4vh]"
                  />
                  <div>
                    <p className="text-[0.8vw] font-bold text-gray-900 flex items-center">
                      <span>GOcuotas (Cuotas con Débito)</span>
                      <span className="ml-[0.6vw] bg-[#2563eb] text-white text-[0.65vw] px-[0.6vw] py-[0.2vh] rounded-[0.1vw] font-bold">
                        Recomendado
                      </span>
                    </p>
                    <p className="text-[0.7vw] text-gray-500 mt-[0.2vh]">
                      Pagá en hasta 6 cuotas con tu tarjeta de débito habitual.
                    </p>
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start justify-between p-[1.2vw] border rounded-[0.2vw] cursor-pointer transition-all ${
                  paymentMethod === "credit" ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200"
                }`}
              >
                <div className="flex items-start space-x-[0.8vw]">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "credit"}
                    onChange={() => setPaymentMethod("credit")}
                    className="accent-black mt-[0.4vh]"
                  />
                  <div>
                    <p className="text-[0.8vw] font-bold text-gray-900">Tarjeta de Crédito / Débito</p>
                    <p className="text-[0.7vw] text-gray-500 mt-[0.2vh]">Visa, Mastercard, American Express.</p>
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start justify-between p-[1.2vw] border rounded-[0.2vw] cursor-pointer transition-all ${
                  paymentMethod === "transfer" ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-200"
                }`}
              >
                <div className="flex items-start space-x-[0.8vw]">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "transfer"}
                    onChange={() => setPaymentMethod("transfer")}
                    className="accent-black mt-[0.4vh]"
                  />
                  <div>
                    <p className="text-[0.8vw] font-bold text-gray-900 flex items-center">
                      <span>Transferencia Bancaria</span>
                      <span className="ml-[0.6vw] bg-green-600 text-white text-[0.65vw] px-[0.6vw] py-[0.2vh] rounded-[0.1vw] font-bold">
                        10% OFF
                      </span>
                    </p>
                    <p className="text-[0.7vw] text-gray-500 mt-[0.2vh]">
                      Recibís los datos bancarios para transferir tras confirmar el pedido.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white text-[0.8vw] uppercase tracking-widest font-bold py-[1.8vh] rounded-[0.2vw] hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
          >
            CONFIRMAR PEDIDO ({formatCurrency(finalTotal)})
          </button>
        </form>

        {/* Right: Summary */}
        <div className="lg:col-span-5 space-y-[2vh]">
          <div className="bg-gray-50 p-[2vw] rounded-[0.2vw] border border-gray-200 space-y-[1.5vh] sticky top-[12vh]">
            <h3 className="font-heading text-[0.9vw] font-bold uppercase tracking-wider text-black border-b pb-[1vh]">
              Resumen de Compra ({cart.length} {cart.length === 1 ? "item" : "items"})
            </h3>

            <div className="space-y-[1vh] max-h-[35vh] overflow-y-auto pr-[0.5vw]">
              {cart.map((item, idx) => {
                const itemPrice = item.product.salePrice ?? item.product.regularPrice;
                return (
                  <div key={idx} className="flex space-x-[0.8vw] text-[0.75vw]">
                    <img
                      src={item.product.images[0] || "/placeholder.jpg"}
                      alt={item.product.title}
                      className="w-[3.5vw] h-[3.5vw] min-w-[40px] min-h-[40px] object-cover rounded-[0.2vw] border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.product.title}</p>
                      {item.selectedVariations && (
                        <p className="text-[0.65vw] text-gray-500">
                          {Object.values(item.selectedVariations).join(", ")}
                        </p>
                      )}
                      <p className="text-gray-500">Cant: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-black">{formatCurrency(itemPrice * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-[1vh] space-y-[0.8vh] text-[0.75vw]">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>{shippingCost === 0 ? "Gratis" : formatCurrency(shippingCost)}</span>
              </div>
              {transferDiscount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Descuento Transferencia (10%)</span>
                  <span>-{formatCurrency(transferDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[1.1vw] font-bold text-black border-t pt-[1vh]">
                <span>Total a Pagar</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <div className="bg-white p-[1vw] rounded-[0.2vw] border text-[0.7vw] text-gray-500 space-y-[0.4vh]">
              <p className="flex items-center">
                <ShieldCheck className="w-[0.9vw] h-[0.9vw] text-black mr-[0.4vw]" />
                Compra 100% protegida y encriptada
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
