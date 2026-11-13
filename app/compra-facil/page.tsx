"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getStoredProducts, formatCurrency } from "@/lib/store";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import {
  ArrowRight,
  ChevronRight,
  Zap,
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
} from "lucide-react";

export default function CompraFacilPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getStoredProducts());

    const handleUpdate = () => {
      setProducts(getStoredProducts());
    };
    window.addEventListener("products_updated", handleUpdate);
    return () => window.removeEventListener("products_updated", handleUpdate);
  }, []);

  // Filter products for Línea Práctica / Económica
  const practicaProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.linea === "practica" ||
        p.slug === "puff-cama" ||
        p.slug === "sofa-cama-but-carrito" ||
        p.slug === "rack-tv-escandinavo" ||
        p.slug === "silla-clasica" ||
        p.slug === "mesa-de-luz-sendai" ||
        p.slug === "espejo-organico-arco" ||
        p.slug === "lampara-colgante-raphia" ||
        p.slug === "sommier-colchon-pocket-king"
    );
  }, [products]);

  // Show up to 16 products on the Compra Fácil homepage
  const displayedProducts = useMemo(() => {
    return practicaProducts.slice(0, 16);
  }, [practicaProducts]);

  return (
    <div className="space-y-[4vh] sm:space-y-[6vh] w-full pb-0 mb-0 bg-[#fdfbf9] text-gray-900">
      {/* 1. Hero Banner (exacto a la maqueta) */}
      <section className="relative h-[80vh] sm:h-[85vh] w-full bg-[#1e130e] overflow-hidden flex items-center justify-center">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('/split-practica.webp')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-[90%] mx-auto flex flex-col md:flex-row items-center justify-between gap-[4vh] md:gap-[3vw] text-white">
          <div className="space-y-[2vh] text-center md:text-left max-w-[85vw] md:max-w-[55vw]">
            <span className="inline-block text-[2.8vw] sm:text-[1.3vw] lg:text-[0.75vw] uppercase tracking-[0.25em] font-bold text-[#f6ad55] border-b border-[#c25e1a] pb-[0.4vh]">
              COMPRA FÁCIL Y ESTÁNDAR · LÍNEA PRÁCTICA
            </span>
            <h1 className="font-heading text-[8vw] sm:text-[5.5vw] lg:text-[4.2vw] font-bold tracking-tight uppercase leading-[1.1] text-white">
              Más para tu casa. <br />
              <span className="italic font-serif font-normal text-gray-100">Mejor para tu bolsillo.</span>
            </h1>
            <p className="text-[3.6vw] sm:text-[1.8vw] lg:text-[1.1vw] font-light text-gray-200 max-w-[75vw] md:max-w-[48vw] leading-relaxed">
              Melamina y muebles prácticos. Precios accesibles, modelos definidos y mayor disponibilidad.
            </p>
            <div className="pt-[1.5vh] flex flex-col sm:flex-row items-center justify-center md:justify-start gap-[1.5vh] sm:gap-[1vw]">
              <a
                href="#catalogo-productos"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-[#c25e1a] text-white text-[3.6vw] sm:text-[1.4vw] lg:text-[0.8vw] uppercase font-bold tracking-widest px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-[#a94f13] transition-all duration-300 shadow-xl"
              >
                <span>Explorar Compra fácil y estándar</span>
                <ArrowRight className="w-[4vw] sm:w-[1.8vw] lg:w-[1vw] h-[4vw] sm:h-[1.8vw] lg:h-[1vw] ml-[1vw] sm:ml-[0.5vw]" />
              </a>
              <Link
                href="/sucursales?linea=practica"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent border border-[#f6ad55] text-white text-[3.6vw] sm:text-[1.4vw] lg:text-[0.8vw] uppercase font-semibold tracking-widest px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-white/10 transition-all duration-300"
              >
                Ver Showroom Ciudad
              </Link>
            </div>
          </div>

          {/* Highlight Card: Entrega en 48 h */}
          <div className="flex-shrink-0 w-full sm:w-auto flex flex-col items-center md:items-end space-y-[1vh]">
            <div className="bg-[#dcfce7] border border-[#86efac] text-[#14532d] rounded-[2vw] sm:rounded-[1vw] lg:rounded-[0.6vw] p-[4vw] sm:p-[2vw] lg:p-[1.4vw] flex items-center space-x-[3vw] sm:space-x-[1.2vw] shadow-2xl">
              <div className="w-[10vw] sm:w-[4vw] lg:w-[2.6vw] h-[10vw] sm:h-[4vw] lg:h-[2.6vw] rounded-full bg-[#15803d] text-white flex items-center justify-center flex-shrink-0">
                <Zap className="w-[5vw] sm:w-[2vw] lg:w-[1.3vw] h-[5vw] sm:h-[2vw] lg:h-[1.3vw] fill-white" />
              </div>
              <div className="text-left">
                <p className="font-heading font-bold text-[3.8vw] sm:text-[1.8vw] lg:text-[1.1vw] tracking-wide text-[#14532d]">
                  Entrega en 48 h
                </p>
                <p className="text-[2.6vw] sm:text-[1.1vw] lg:text-[0.75vw] text-[#166534] font-medium">
                  En productos y zonas habilitados
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. SECCIÓN DE PRODUCTOS CON TÍTULO Y SUBTÍTULO
      ========================================================================= */}
      <section id="catalogo-productos" className="w-[90%] mx-auto space-y-[4vh] pt-[2vh]">
        {/* Título y Subtítulo de Sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-[3vh] gap-[2vh]">
          <div className="space-y-[0.8vh]">
            <span className="text-[3vw] sm:text-[1.3vw] lg:text-[0.72vw] uppercase tracking-[0.25em] text-[#c25e1a] font-semibold block">
              TU SELECCIÓN DE COMPRA FÁCIL Y ESTÁNDAR
            </span>
            <h2 className="font-heading text-[6vw] sm:text-[3.5vw] lg:text-[2.2vw] font-bold tracking-wider uppercase text-gray-900">
              MUEBLES PRÁCTICOS <span className="italic font-serif font-normal">AL MEJOR PRECIO</span>
            </h2>
            <p className="text-[3.2vw] sm:text-[1.5vw] lg:text-[0.9vw] text-gray-500 font-light max-w-[65ch] leading-relaxed">
              Modelos listos para tu hogar, pensados para resolver tus espacios con rapidez, diseño funcional y la mejor relación precio-calidad.
            </p>
          </div>
          <Link
            href="/productos?linea=practica"
            className="inline-flex items-center text-[3.2vw] sm:text-[1.4vw] lg:text-[0.85vw] font-semibold text-[#c25e1a] hover:text-[#9e460e] uppercase tracking-wider transition-colors pb-[0.5vh] border-b-2 border-[#c25e1a] flex-shrink-0"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-[3.6vw] sm:w-[1.6vw] lg:w-[0.9vw] h-[3.6vw] sm:h-[1.6vw] lg:h-[0.9vw] ml-[0.5vw]" />
          </Link>
        </div>

        {/* Grilla de Productos (Hasta 16 productos) */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[2.5vw] sm:gap-x-[2vw] lg:gap-x-[1.5vw] gap-y-[3vh] sm:gap-y-[4vh]">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-[8vh] bg-white rounded-[1vw] border border-gray-200 p-[4vw]">
            <p className="text-gray-500 text-[3.6vw] sm:text-[1.6vw] lg:text-[1vw]">
              Cargando catálogo de Compra fácil y estándar...
            </p>
          </div>
        )}

        {/* Botón para ver más productos */}
        <div className="mt-[5vh] sm:mt-[6vh] text-center">
          <Link
            href="/productos?linea=practica"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#c25e1a] text-white text-[3.6vw] sm:text-[1.5vw] lg:text-[0.85vw] uppercase font-bold tracking-widest px-[8vw] sm:px-[4vw] lg:px-[3vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-[#a04a11] transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <span>Ver Más Productos</span>
            <ArrowRight className="w-[4vw] sm:w-[1.8vw] lg:w-[1vw] h-[4vw] sm:h-[1.8vw] lg:h-[1vw] ml-[1vw] sm:ml-[0.5vw]" />
          </Link>
        </div>
      </section>

      {/* 3. Banner de Filosofía Compra Fácil */}
      <section className="relative py-[8vh] sm:py-[10vh] bg-[#1d120c] text-white overflow-hidden w-full !mb-0 border-b-0">
        <div
          className="absolute inset-0 bg-cover bg-fixed bg-center opacity-30"
          style={{
            backgroundImage: `url('https://acasatienda.com.ar/wp-content/uploads/2026/10/Living.webp')`,
          }}
        />
        <div className="relative z-10 w-[90%] mx-auto text-center space-y-[2vh]">
          <span className="text-[3.2vw] sm:text-[1.5vw] lg:text-[0.75vw] uppercase tracking-[0.3em] font-medium text-[#f6ad55]">
            Línea Práctica Acasa
          </span>
          <h2 className="font-heading text-[6.5vw] sm:text-[4.2vw] lg:text-[3.2vw] font-bold uppercase tracking-tight leading-tight">
            FUNCIONALIDAD QUE ACOMPAÑA TU DÍA A DÍA
          </h2>
          <p className="text-[3.6vw] sm:text-[2vw] lg:text-[1.1vw] font-light text-gray-300 max-w-[85vw] sm:max-w-[70vw] lg:max-w-[55vw] mx-auto leading-relaxed">
            Melamina de 18 mm y piezas funcionales con precios accesibles, mayor disponibilidad y entrega express en 48 hs.
          </p>
          <div className="pt-[1vh]">
            <Link
              href="/sucursales?linea=practica"
              className="inline-flex items-center text-[3.4vw] sm:text-[1.5vw] lg:text-[0.8vw] uppercase tracking-widest font-bold border-b border-[#f6ad55] text-[#f6ad55] pb-[0.4vh] hover:text-white hover:border-white transition-colors"
            >
              Conocé nuestro Showroom de Ciudad (Mitre 1398)
              <ChevronRight className="w-[4vw] sm:w-[1.8vw] lg:w-[1vw] h-[4vw] sm:h-[1.8vw] lg:h-[1vw] ml-[0.3vw]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
