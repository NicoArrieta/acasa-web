"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getStoredProducts, formatCurrency } from "@/lib/store";
import { INITIAL_PRODUCTS } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import {
  ChevronRight,
  Plus,
  Minus,
  ShoppingBag,
  Check,
} from "lucide-react";

export default function SingleProductClient({ slug: propSlug }: { slug?: string }) {
  const params = useParams();
  const slug = propSlug || (params?.slug as string);

  const initialProd = INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(initialProd);
  const [allProducts, setAllProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedImage, setSelectedImage] = useState<string>(initialProd?.images[0] || "");
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>(() => {
    const initialVars: Record<string, string> = {};
    initialProd?.variations?.forEach((v) => {
      if (v.options.length > 0) {
        initialVars[v.name] = v.options[0].name;
      }
    });
    return initialVars;
  });
  const [quantity, setQuantity] = useState(1);
  const [isAddedToast, setIsAddedToast] = useState(false);

  useEffect(() => {
    const list = getStoredProducts();
    setAllProducts(list);
    const found = list.find((p) => p.slug === slug);
    if (found) {
      setProduct(found);
      if (!selectedImage) setSelectedImage(found.images[0] || "");

      const initialVars: Record<string, string> = {};
      found.variations?.forEach((v) => {
        if (v.options.length > 0) {
          initialVars[v.name] = v.options[0].name;
        }
      });
      setSelectedVariations((prev) => (Object.keys(prev).length ? prev : initialVars));
    }
  }, [slug]);

  if (!product) {
    return (
      <div className="w-[90%] mx-auto py-[10vh] text-center">
        <h2 className="font-heading text-[5vw] sm:text-[2vw] font-bold uppercase text-gray-900">
          Producto no encontrado
        </h2>
        <p className="text-gray-500 text-[3.4vw] sm:text-[0.9vw] mt-[1vh]">
          El producto solicitado no existe o fue removido.
        </p>
        <Link
          href="/productos"
          className="inline-block mt-[2vh] bg-black text-white text-[3.4vw] sm:text-[0.8vw] uppercase tracking-widest font-bold px-[6vw] sm:px-[2vw] py-[1.5vh] rounded-[1vw] sm:rounded-[0.2vw]"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  let variationAdjustment = 0;
  if (product.variations) {
    product.variations.forEach((vGroup) => {
      const selectedName = selectedVariations[vGroup.name];
      const opt = vGroup.options.find((o) => o.name === selectedName);
      if (opt?.priceAdjustment) {
        variationAdjustment += opt.priceAdjustment;
      }
    });
  }

  const basePrice = product.salePrice ?? product.regularPrice;
  const finalUnitPrice = basePrice + variationAdjustment;
  const transferPrice = Math.round(finalUnitPrice * 0.8); // 20% OFF transferencia

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariations);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  const waUrl = `https://wa.me/5492616843330?text=${encodeURIComponent(
    `¡Hola! Vi este producto en la web: ${product?.title || ""} (${
      typeof window !== "undefined" ? window.location.href : ""
    })`
  )}`;

  // Related products for "COMBINA CON"
  const crossSellProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="w-[90%] max-w-[1280px] mx-auto py-[4vh] sm:py-[6vh] text-gray-900">
      {/* 1. Header del Producto: Título principal en mayúscula y divisor horizontal */}
      <div className="mb-[3vh]">
        <h1 className="font-heading font-extrabold text-[7vw] sm:text-[4vw] lg:text-[2.6vw] uppercase tracking-wider text-gray-900 leading-tight">
          {product.title}
        </h1>
        <div className="w-full h-[1px] bg-gray-200 mt-[1.5vh]" />
      </div>

      {/* 2. Grid Principal: Galería a la izquierda, detalles a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[4vh] lg:gap-[3.5vw] items-start">
        {/* Columna Izquierda: Galería con imagen principal y miniaturas inferiores (estilo Acasa) */}
        <div className="lg:col-span-7 space-y-[2vh]">
          {/* Imagen Principal */}
          <div className="w-full aspect-square bg-[#fbfbfb] rounded-[1vw] sm:rounded-[0.5vw] overflow-hidden border border-gray-200 flex items-center justify-center p-[2vw] relative group">
            <img
              src={selectedImage || product.images[0] || "/placeholder.jpg"}
              alt={product.title}
              className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
            />
            {product.salePrice && (
              <span className="absolute top-[3vw] sm:top-[1.2vw] left-[3vw] sm:left-[1.2vw] bg-[#c25e1a] text-white text-[2.6vw] sm:text-[1vw] lg:text-[0.72vw] font-bold uppercase tracking-wider px-[3vw] sm:px-[1.2vw] py-[0.5vh] rounded-full shadow-md">
                Oferta
              </span>
            )}
          </div>

          {/* Carrusel de Miniaturas en la parte inferior */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-[2vw] sm:gap-[1vw] overflow-x-auto pb-[1vh] scrollbar-none">
              {product.images.map((img, i) => {
                const isActive = (selectedImage || product.images[0]) === img;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-[20vw] sm:w-[10vw] lg:w-[6.5vw] aspect-square rounded-[0.8vw] sm:rounded-[0.4vw] overflow-hidden border-2 p-[0.4vw] bg-white transition-all flex-shrink-0 ${
                      isActive
                        ? "border-[#c25e1a] shadow-sm opacity-100"
                        : "border-gray-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} miniatura ${i + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Precios, Variaciones, Descripción, Cantidad y Botones de Compra */}
        <div className="lg:col-span-5 space-y-[2.5vh]">
          {/* Bloque de Precios y Beneficios */}
          <div className="space-y-[1vh] pb-[1vh] border-b border-gray-100">
            <div className="flex items-baseline space-x-[2vw] sm:space-x-[0.8vw]">
              <span className="text-[7.5vw] sm:text-[3.8vw] lg:text-[2.2vw] font-bold text-gray-900 tracking-tight">
                {formatCurrency(finalUnitPrice)}
              </span>
              {product.salePrice && (
                <span className="text-[4.5vw] sm:text-[2vw] lg:text-[1.2vw] text-gray-400 line-through">
                  {formatCurrency(product.regularPrice + variationAdjustment)}
                </span>
              )}
            </div>

            {/* Pastilla Transferencia Bancaria 20% OFF */}
            <div className="inline-flex items-center space-x-[1.5vw] sm:space-x-[0.5vw] bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] px-[3vw] sm:px-[1.2vw] py-[0.6vh] rounded-full text-[2.8vw] sm:text-[1.1vw] lg:text-[0.78vw] font-bold uppercase tracking-wider">
              <span>Transferencia bancaria 20% OFF: {formatCurrency(transferPrice)}</span>
            </div>
          </div>

          {/* Variaciones (si el producto las tiene) */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-[2vh] pt-[1vh]">
              {product.variations.map((vGroup) => (
                <div key={vGroup.name} className="space-y-[0.8vh]">
                  <div className="flex justify-between items-center text-[3vw] sm:text-[1.2vw] lg:text-[0.78vw]">
                    <span className="font-semibold uppercase tracking-wider text-gray-700">
                      {vGroup.name}:{" "}
                      <span className="text-black font-bold">
                        {selectedVariations[vGroup.name]}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-[2vw] sm:gap-[0.6vw]">
                    {vGroup.options.map((opt) => {
                      const isSelected = selectedVariations[vGroup.name] === opt.name;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setSelectedVariations({
                              ...selectedVariations,
                              [vGroup.name]: opt.name,
                            })
                          }
                          className={`text-[3.2vw] sm:text-[1.3vw] lg:text-[0.78vw] px-[3.5vw] sm:px-[1.5vw] lg:px-[1vw] py-[1vh] sm:py-[0.8vh] rounded-[0.8vw] sm:rounded-[0.3vw] border uppercase tracking-wider transition-all ${
                            isSelected
                              ? "bg-black text-white border-black font-bold shadow-sm"
                              : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                          }`}
                        >
                          {opt.name}
                          {opt.priceAdjustment
                            ? ` (+${formatCurrency(opt.priceAdjustment)})`
                            : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sección de Descripción (con título 'Descripción' y viñetas como en la web original) */}
          <div className="space-y-[1.2vh] pt-[1.5vh] border-t border-gray-100">
            <h2 className="font-heading font-bold text-[4.5vw] sm:text-[2.2vw] lg:text-[1.2vw] uppercase tracking-wider text-gray-900">
              Descripción
            </h2>
            <div className="text-[3.4vw] sm:text-[1.4vw] lg:text-[0.88vw] text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-[0.6vh]">
                {product.dimensions && (
                  <li>
                    <strong className="text-black">Medidas:</strong> {product.dimensions.widthCm}X{product.dimensions.depthCm} cm (Alto: {product.dimensions.heightCm} cm)
                  </li>
                )}
                {product.shortDescription && <li>{product.shortDescription}</li>}
                {product.description && product.description !== product.shortDescription && (
                  <li>{product.description}</li>
                )}
              </ul>
            </div>
          </div>

          {/* Formulario de Cantidad y Botón "Añadir al carrito" */}
          <div className="pt-[1.5vh] space-y-[1.8vh]">
            <div className="flex items-stretch gap-[2vw] sm:gap-[1vw]">
              {/* Stepper de Cantidad */}
              <div className="flex items-center border border-gray-300 rounded-[1vw] sm:rounded-[0.3vw] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-[3.5vw] sm:px-[1.4vw] lg:px-[0.9vw] py-[1.4vh] text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="w-[3.5vw] sm:w-[1.4vw] lg:w-[0.9vw] h-[3.5vw] sm:h-[1.4vw] lg:h-[0.9vw]" />
                </button>
                <span className="px-[3vw] sm:px-[1.2vw] lg:px-[0.8vw] text-[3.8vw] sm:text-[1.5vw] lg:text-[0.95vw] font-bold text-center min-w-[7vw] sm:min-w-[2.5vw]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-[3.5vw] sm:px-[1.4vw] lg:px-[0.9vw] py-[1.4vh] text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-[3.5vw] sm:w-[1.4vw] lg:w-[0.9vw] h-[3.5vw] sm:h-[1.4vw] lg:h-[0.9vw]" />
                </button>
              </div>

              {/* Botón Añadir al carrito */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white text-[3.4vw] sm:text-[1.4vw] lg:text-[0.85vw] uppercase font-bold tracking-widest py-[1.6vh] px-[4vw] sm:px-[2vw] rounded-[1vw] sm:rounded-[0.3vw] hover:bg-gray-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-[2vw] sm:space-x-[0.6vw]"
              >
                <ShoppingBag className="w-[4.5vw] sm:w-[1.8vw] lg:w-[1.1vw] h-[4.5vw] sm:h-[1.8vw] lg:h-[1.1vw]" />
                <span>Añadir al carrito</span>
              </button>
            </div>

            {isAddedToast && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-[3.2vw] sm:text-[1.3vw] lg:text-[0.78vw] px-[3vw] sm:px-[1.2vw] py-[1vh] rounded-[1vw] sm:rounded-[0.3vw] flex items-center space-x-[1.5vw] sm:space-x-[0.5vw]">
                <Check className="w-[4vw] sm:w-[1.6vw] lg:w-[0.9vw] h-[4vw] sm:h-[1.6vw] lg:h-[0.9vw] text-green-600" />
                <span>¡Producto añadido al carrito correctamente!</span>
              </div>
            )}

            {/* Botón "Comprar por WhatsApp" (Estilo botón verde oficial de Acasa) */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-[3.4vw] sm:text-[1.4vw] lg:text-[0.88vw] font-bold uppercase tracking-wider py-[1.6vh] px-[4vw] rounded-[1vw] sm:rounded-[0.3vw] transition-all shadow-md flex items-center justify-center space-x-[2.5vw] sm:space-x-[0.8vw]"
            >
              <svg
                aria-hidden="true"
                className="w-[4.8vw] sm:w-[1.8vw] lg:w-[1.2vw] h-[4.8vw] sm:h-[1.8vw] lg:h-[1.2vw] fill-current"
                viewBox="0 0 448 512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
              </svg>
              <span>Comprar por WhatsApp</span>
            </a>
          </div>

          {/* Metadatos del Producto (product_meta: SKU y Categorías) */}
          <div className="pt-[2vh] border-t border-gray-100 text-[3.2vw] sm:text-[1.3vw] lg:text-[0.78vw] text-gray-500 space-y-[0.8vh]">
            {product.sku && (
              <p>
                <strong className="text-gray-800">SKU:</strong> {product.sku}
              </p>
            )}
            <p>
              <strong className="text-gray-800">Categories:</strong>{" "}
              <span className="text-gray-600">
                {product.category}
                {product.subcategory ? `, ${product.subcategory}` : ""}
                , Muebles para el hogar, Living
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Sección "COMBINA CON" (Cross-sells exactos a la web) */}
      <div className="mt-[8vh] pt-[4vh] border-t border-gray-200">
        <div className="mb-[3vh]">
          <h2 className="font-heading font-extrabold text-[5.5vw] sm:text-[3vw] lg:text-[1.8vw] uppercase tracking-wider text-gray-900 leading-tight">
            COMBINA CON
          </h2>
          <div className="w-full h-[1px] bg-gray-200 mt-[1.2vh]" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-[2.5vw] sm:gap-x-[2vw] lg:gap-x-[1.5vw] gap-y-[3vh] sm:gap-y-[4vh]">
          {crossSellProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
