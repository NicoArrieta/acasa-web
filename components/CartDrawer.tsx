"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/store";
import { X, Trash2, Plus, Minus, ArrowRight, Truck } from "lucide-react";

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItems,
  } = useCart();
  const [postalCode, setPostalCode] = useState("");
  const [shippingEstimate, setShippingEstimate] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleEstimateShipping = () => {
    if (!postalCode.trim()) return;
    setShippingEstimate("Envío a domicilio: $8.500 | Retiro en sucursal: $6.200");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-[92vw] sm:w-[38vw] lg:w-[30vw] max-w-[500px] bg-white shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="p-[4vw] sm:p-[2vw] lg:p-[1.5vw] border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-[1.5vw] sm:space-x-[0.5vw]">
              <h2 className="font-heading text-[4.2vw] sm:text-[1.8vw] lg:text-[1.1vw] font-bold tracking-wider text-black">
                CARRITO DE COMPRAS
              </h2>
              <span className="text-[3vw] sm:text-[1.2vw] lg:text-[0.7vw] bg-gray-100 text-gray-700 px-[2vw] sm:px-[0.8vw] lg:px-[0.6vw] py-[0.3vh] sm:py-[0.2vh] rounded-full font-medium">
                {totalItems}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-[1vw] sm:p-[0.4vw] text-gray-400 hover:text-black rounded hover:bg-gray-100 transition-colors"
            >
              <X className="w-[5vw] sm:w-[2vw] lg:w-[1.2vw] h-[5vw] sm:h-[2vw] lg:h-[1.2vw]" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-[4vw] sm:p-[2vw] lg:p-[1.5vw] space-y-[2vh] sm:space-y-[1.5vh]">
            {cart.length === 0 ? (
              <div className="text-center py-[10vh]">
                <div className="w-[14vw] sm:w-[6vw] lg:w-[4vw] h-[14vw] sm:h-[6vw] lg:h-[4vw] mx-auto mb-[2vh] bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <Truck className="w-[7vw] sm:w-[3vw] lg:w-[2vw] h-[7vw] sm:h-[3vw] lg:h-[2vw]" />
                </div>
                <p className="text-gray-500 text-[3.6vw] sm:text-[1.4vw] lg:text-[0.85vw] mb-[2vh]">
                  Tu carrito está vacío
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block bg-black text-white text-[3.4vw] sm:text-[1.3vw] lg:text-[0.75vw] font-semibold uppercase tracking-widest px-[6vw] sm:px-[2.5vw] lg:px-[1.5vw] py-[1.4vh] sm:py-[1.2vh] rounded-[1vw] sm:rounded-[0.3vw] lg:rounded-[0.2vw] hover:bg-gray-800 transition-colors"
                >
                  Ver Catálogo
                </button>
              </div>
            ) : (
              cart.map((item, idx) => {
                const itemPrice = item.product.salePrice ?? item.product.regularPrice;
                return (
                  <div
                    key={`${item.product.id}-${idx}`}
                    className="flex space-x-[3vw] sm:space-x-[1.5vw] lg:space-x-[1vw] pb-[2vh] border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-[18vw] sm:w-[8vw] lg:w-[5vw] h-[18vw] sm:h-[8vw] lg:h-[5vw] bg-gray-50 rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] overflow-hidden flex-shrink-0 border border-gray-100">
                      <img
                        src={item.product.images[0] || "/placeholder.jpg"}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[3.6vw] sm:text-[1.5vw] lg:text-[0.85vw] font-semibold text-gray-900 truncate">
                        {item.product.title}
                      </h4>
                      {item.selectedVariations &&
                        Object.keys(item.selectedVariations).length > 0 && (
                          <p className="text-[2.8vw] sm:text-[1.2vw] lg:text-[0.7vw] text-gray-500 mt-[0.2vh]">
                            {Object.entries(item.selectedVariations)
                              .map(([key, val]) => `${key}: ${val}`)
                              .join(" | ")}
                          </p>
                        )}
                      <p className="text-[3.6vw] sm:text-[1.5vw] lg:text-[0.8vw] font-bold text-black mt-[0.5vh]">
                        {formatCurrency(itemPrice)}
                      </p>

                      <div className="flex items-center justify-between mt-[1.2vh]">
                        <div className="flex items-center border border-gray-200 rounded-[1vw] sm:rounded-[0.3vw] lg:rounded-[0.2vw]">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.selectedVariations
                              )
                            }
                            className="p-[1.5vw] sm:p-[0.6vw] lg:p-[0.3vw] hover:bg-gray-100 text-gray-600"
                          >
                            <Minus className="w-[3.5vw] sm:w-[1.4vw] lg:w-[0.8vw] h-[3.5vw] sm:h-[1.4vw] lg:h-[0.8vw]" />
                          </button>
                          <span className="px-[2.5vw] sm:px-[1vw] lg:px-[0.6vw] text-[3.2vw] sm:text-[1.3vw] lg:text-[0.75vw] font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.selectedVariations
                              )
                            }
                            className="p-[1.5vw] sm:p-[0.6vw] lg:p-[0.3vw] hover:bg-gray-100 text-gray-600"
                          >
                            <Plus className="w-[3.5vw] sm:w-[1.4vw] lg:w-[0.8vw] h-[3.5vw] sm:h-[1.4vw] lg:h-[0.8vw]" />
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            removeFromCart(item.product.id, item.selectedVariations)
                          }
                          className="text-gray-400 hover:text-red-600 p-[1.5vw] sm:p-[0.6vw] lg:p-[0.3vw] transition-colors"
                        >
                          <Trash2 className="w-[4vw] sm:w-[1.6vw] lg:w-[0.9vw] h-[4vw] sm:h-[1.6vw] lg:h-[0.9vw]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-[4vw] sm:p-[2vw] lg:p-[1.5vw] border-t border-gray-100 bg-gray-50 space-y-[1.8vh] sm:space-y-[1.5vh]">
              {/* Shipping estimator preview */}
              <div className="bg-white p-[3vw] sm:p-[1.5vw] lg:p-[1vw] rounded-[1vw] sm:rounded-[0.3vw] lg:rounded-[0.2vw] border border-gray-200">
                <div className="flex items-center text-[3.2vw] sm:text-[1.3vw] lg:text-[0.75vw] font-semibold text-gray-700 mb-[0.8vh]">
                  <Truck className="w-[4vw] sm:w-[1.6vw] lg:w-[0.9vw] h-[4vw] sm:h-[1.6vw] lg:h-[0.9vw] mr-[1vw] sm:mr-[0.4vw] text-black" />
                  Calcular costo de envío
                </div>
                <div className="flex space-x-[1.5vw] sm:space-x-[0.5vw]">
                  <input
                    type="text"
                    placeholder="Código Postal (ej. 1425)"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="flex-1 text-[3.2vw] sm:text-[1.3vw] lg:text-[0.75vw] px-[2.5vw] sm:px-[1.2vw] lg:px-[0.8vw] py-[1vh] sm:py-[0.8vh] border border-gray-300 rounded-[1vw] sm:rounded-[0.3vw] lg:rounded-[0.2vw] outline-none"
                  />
                  <button
                    onClick={handleEstimateShipping}
                    className="bg-black text-white text-[3.2vw] sm:text-[1.3vw] lg:text-[0.75vw] px-[3.5vw] sm:px-[1.8vw] lg:px-[1vw] py-[1vh] sm:py-[0.8vh] rounded-[1vw] sm:rounded-[0.3vw] lg:rounded-[0.2vw] font-semibold hover:bg-gray-800"
                  >
                    Calcular
                  </button>
                </div>
                {shippingEstimate && (
                  <p className="text-[2.8vw] sm:text-[1.2vw] lg:text-[0.7vw] text-green-700 font-medium mt-[0.8vh] bg-green-50 p-[1vh] sm:p-[0.6vh] rounded-[0.5vw] sm:rounded-[0.2vw]">
                    {shippingEstimate}
                  </p>
                )}
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center pt-[0.5vh]">
                <span className="text-[3.2vw] sm:text-[1.3vw] lg:text-[0.75vw] uppercase tracking-wider text-gray-600 font-medium">
                  Subtotal
                </span>
                <span className="text-[4.5vw] sm:text-[2vw] lg:text-[1.2vw] font-bold text-black">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="text-[2.8vw] sm:text-[1.2vw] lg:text-[0.7vw] text-gray-500">
                Hasta 6 cuotas y todas las facilidades de pago en el checkout.
              </p>

              {/* Checkout link */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-black text-white text-center py-[1.8vh] sm:py-[1.5vh] rounded-[1vw] sm:rounded-[0.3vw] lg:rounded-[0.2vw] text-[3.6vw] sm:text-[1.4vw] lg:text-[0.8vw] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center space-x-[1.5vw] sm:space-x-[0.5vw] shadow-md hover:shadow-lg"
              >
                <span>INICIAR COMPRA</span>
                <ArrowRight className="w-[4vw] sm:w-[1.6vw] lg:w-[1vw] h-[4vw] sm:h-[1.6vw] lg:h-[1vw]" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
