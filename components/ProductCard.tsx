"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/store";
import { useCart } from "@/context/CartContext";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Pricing calculations
  const regularPrice = product.regularPrice;
  const installmentCount = 6;
  const installmentAmount = Math.round(regularPrice / installmentCount);

  // 25% discount for bank transfer / cash
  const transferDiscountPercent = 25;
  const transferPrice = product.salePrice
    ? product.salePrice
    : Math.round(regularPrice * (1 - transferDiscountPercent / 100));

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultVariations: Record<string, string> = {};
    if (product.variations) {
      product.variations.forEach((v) => {
        if (v.options.length > 0) {
          defaultVariations[v.name] = v.options[0].name;
        }
      });
    }

    addToCart(product, 1, defaultVariations);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden rounded-[2vw] sm:rounded-[1.2vw] lg:rounded-[0.8vw] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:-translate-y-[0.4vh] transition-all duration-300 w-full">
      {/* 1. Image container - Flush to the top and side borders */}
      <Link
        href={`/producto/${product.slug}`}
        className="block relative aspect-square w-full overflow-hidden bg-gray-50 cursor-pointer"
      >
        <img
          src={product.images[0] || "/placeholder.jpg"}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Badge if new */}
        {product.isNewArrival && (
          <span className="absolute top-[2vw] sm:top-[1vw] lg:top-[0.8vw] left-[2vw] sm:left-[1vw] lg:left-[0.8vw] bg-black text-white text-[2.6vw] sm:text-[1.2vw] lg:text-[0.65vw] font-bold uppercase tracking-wider px-[2vw] sm:px-[1.2vw] lg:px-[0.7vw] py-[0.4vh] sm:py-[0.3vh] rounded-full shadow-md">
            Nuevo
          </span>
        )}
      </Link>

      {/* 2. Card Content (Padding applies to text & actions only) */}
      <div className="p-[3.5vw] sm:p-[2vw] lg:p-[1.2vw] flex-1 flex flex-col justify-between">
        {/* Product Title (Centered, uppercase, bold) */}
        <div className="min-h-[4vh] sm:min-h-[4.5vh] flex items-center justify-center text-center px-[0.5vw]">
          <Link href={`/producto/${product.slug}`}>
            <h3 className="font-heading font-bold text-[3.4vw] sm:text-[1.8vw] lg:text-[1.15vw] uppercase tracking-wider text-black group-hover:text-[#c25e1a] transition-colors leading-snug line-clamp-2">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing Breakdown */}
        <div className="mt-[1.2vh] sm:mt-[1.5vh] space-y-[0.3vh] sm:space-y-[0.4vh] text-center flex-1 flex flex-col justify-center">
          {/* Regular Price */}
          <p className="text-[3.2vw] sm:text-[1.6vw] lg:text-[1.05vw] font-light text-black tracking-tight">
            {formatCurrency(regularPrice)}
          </p>

          {/* Installment breakdown */}
          <p className="text-[2.8vw] sm:text-[1.3vw] lg:text-[0.9vw] font-light text-gray-800 tracking-tight">
            {installmentCount} cuotas sin interés de {formatCurrency(installmentAmount)}
          </p>

          {/* Transfer Price in warm terracotta/copper */}
          <div className="pt-[0.6vh] sm:pt-[0.8vh]">
            <p className="text-[3.8vw] sm:text-[2vw] lg:text-[1.25vw] font-bold text-[#c25e1a] tracking-tight">
              {formatCurrency(transferPrice)}
            </p>
            <p className="text-[2.7vw] sm:text-[1.3vw] lg:text-[0.85vw] font-medium text-[#c25e1a] leading-tight mt-[0.2vh]">
              {transferDiscountPercent}% con transferencia bancaria
            </p>
          </div>
        </div>

        {/* 3. Bottom Actions: "Más info" link and terracotta outline button */}
        <div className="mt-[2vh] sm:mt-[2.5vh] pt-[1.5vh] sm:pt-[1.8vh] border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-[1vh] sm:gap-[0.5vw]">
          {/* "Más info" Underlined link */}
          <Link
            href={`/producto/${product.slug}`}
            className="text-[2.9vw] sm:text-[1.3vw] lg:text-[0.85vw] font-medium text-black underline underline-offset-4 hover:text-[#c25e1a] transition-colors text-center sm:text-left"
          >
            Más info
          </Link>

          {/* Terracotta outline button: "Agregar al carrito" */}
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`w-full sm:w-auto text-[2.8vw] sm:text-[1.2vw] lg:text-[0.82vw] font-medium px-[3vw] sm:px-[1.6vw] lg:px-[1.2vw] py-[0.9vh] sm:py-[0.7vh] rounded-[1vw] sm:rounded-[0.5vw] lg:rounded-[0.3vw] border transition-all duration-300 flex items-center justify-center space-x-[0.3vw] ${
              justAdded
                ? "bg-[#c25e1a] text-white border-[#c25e1a]"
                : "border-[#c25e1a] text-[#c25e1a] hover:bg-[#c25e1a] hover:text-white"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-[3.2vw] sm:w-[1.4vw] lg:w-[0.9vw] h-[3.2vw] sm:h-[1.4vw] lg:h-[0.9vw] mr-[0.2vw]" />
                <span>Agregado</span>
              </>
            ) : (
              <span>Agregar al carrito</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
