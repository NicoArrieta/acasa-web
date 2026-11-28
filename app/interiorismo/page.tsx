"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getStoredProducts, fetchProducts } from "@/lib/store";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import CategoriesCarousel from "@/components/CategoriesCarousel";
import MostChosenSection from "@/components/MostChosenSection";
import HeroSlider from "@/components/HeroSlider";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";

export default function InteriorismoPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getStoredProducts());
    fetchProducts().then((live) => {
      if (live && live.length > 0) setProducts(live);
    });

    const handleUpdate = () => {
      setProducts(getStoredProducts());
    };
    window.addEventListener("products_updated", handleUpdate);
    return () => window.removeEventListener("products_updated", handleUpdate);
  }, []);

  // Products for Interiorismo & Diseño (Línea Premium & Autor) - hasta 16 productos reales con precio
  const interiorismoProducts = useMemo(() => {
    return products
      .filter((p) => p.linea === "premium" && p.regularPrice > 0 && p.title.toLowerCase().trim() !== "producto")
      .slice(0, 16);
  }, [products]);

  return (
    <div className="space-y-[6vh] sm:space-y-[8vh] w-full pb-0 mb-0 bg-white text-gray-900">
      {/* 1. Hero Slider dinámico de 3 diapositivas */}
      <HeroSlider variant="premium" />

      {/* 2. ÁREAS PARA TU HOGAR - Carousel exactamente igual */}
      <CategoriesCarousel theme="original" />

      {/* 3. LO MÁS ELEGIDO - Exacto al diseño original */}
      <MostChosenSection theme="original" />

      {/* 4. TU SELECCIÓN DE INTERIORISMO - Exacto a la maqueta */}
      <section className="w-[90%] mx-auto pt-[2vh]">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-[2vh] mb-[4vh] border-b border-gray-100 pb-[2vh]">
          <div className="space-y-[0.8vh]">
            <span className="text-[3vw] sm:text-[1.3vw] lg:text-[0.72vw] uppercase tracking-[0.25em] text-gray-400 font-semibold block">
              TU SELECCIÓN PERSONALIZADA Y DE DISEÑO
            </span>
            <h2 className="font-heading text-[6vw] sm:text-[3.5vw] lg:text-[2.2vw] font-bold tracking-wider uppercase text-gray-900">
              PIEZAS QUE HACEN <span className="italic font-serif font-normal">LA DIFERENCIA</span>
            </h2>
            <p className="text-[3.2vw] sm:text-[1.5vw] lg:text-[0.9vw] text-gray-500 font-light max-w-[65ch] leading-relaxed">
              Todo el catálogo de muebles y decoración de ACASA Tienda, organizado para elegir mejor. Encontrá tu modelo, revisá sus opciones y sumalo al carrito. El asesoramiento es opcional.
            </p>
          </div>
          <a
            href="https://wa.me/5492616843330?text=Hola!%20Quiero%20asesoramiento%20para%20compra%20personalizada%20y%20de%20diseño"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-[3.2vw] sm:text-[1.4vw] lg:text-[0.85vw] font-semibold text-black hover:text-[#2f3e2f] uppercase tracking-wider transition-colors pb-[0.5vh] border-b-2 border-black"
          >
            <span>Quiero asesoramiento</span>
            <ArrowRight className="w-[3.6vw] sm:w-[1.6vw] lg:w-[0.9vw] h-[3.6vw] sm:h-[1.6vw] lg:h-[0.9vw] ml-[0.5vw]" />
          </a>
        </div>

        {/* 2-column grid on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[2.5vw] sm:gap-x-[2vw] lg:gap-x-[1.5vw] gap-y-[3vh] sm:gap-y-[4vh]">
          {interiorismoProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-[5vh] sm:mt-[6vh] text-center">
          <Link
            href="/productos?linea=premium"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-black text-white text-[3.6vw] sm:text-[1.5vw] lg:text-[0.8vw] uppercase font-bold tracking-widest px-[8vw] sm:px-[4vw] lg:px-[3vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <span>Ver Todos los Productos</span>
            <ArrowRight className="w-[4vw] sm:w-[1.8vw] lg:w-[1vw] h-[4vw] sm:h-[1.8vw] lg:h-[1vw] ml-[1vw] sm:ml-[0.5vw]" />
          </Link>
        </div>
      </section>

      {/* 5. Banner de Filosofía Acasa */}
      <section className="relative py-[8vh] sm:py-[10vh] bg-[#141414] text-white overflow-hidden w-full !mb-0 border-b-0">
        <div
          className="absolute inset-0 bg-cover bg-fixed bg-center opacity-30"
          style={{
            backgroundImage: `url('https://acasatienda.com.ar/wp-content/uploads/2026/10/Comedor.webp')`,
          }}
        />
        <div className="relative z-10 w-[90%] mx-auto text-center space-y-[2vh]">
          <span className="text-[3.2vw] sm:text-[1.5vw] lg:text-[0.75vw] uppercase tracking-[0.3em] font-medium text-gray-300">
            Filosofía Acasa
          </span>
          <h2 className="font-heading text-[6.5vw] sm:text-[4.2vw] lg:text-[3.2vw] font-bold uppercase tracking-tight leading-tight">
            DISEÑO QUE ACOMPAÑA TU FORMA DE VIVIR
          </h2>
          <p className="text-[3.6vw] sm:text-[2vw] lg:text-[1.1vw] font-light text-gray-300 max-w-[85vw] sm:max-w-[70vw] lg:max-w-[55vw] mx-auto leading-relaxed">
            Cada mueble es diseñado respetando la nobleza de los materiales, la pureza de sus líneas y la necesidad de crear hogares confortables y atemporales.
          </p>
          <div className="pt-[1vh]">
            <Link
              href="/sucursales?linea=premium"
              className="inline-flex items-center text-[3.4vw] sm:text-[1.5vw] lg:text-[0.8vw] uppercase tracking-widest font-bold border-b border-white pb-[0.4vh] hover:text-gray-300 hover:border-gray-300 transition-colors"
            >
              Conocé nuestros Showrooms
              <ChevronRight className="w-[4vw] sm:w-[1.8vw] lg:w-[1vw] h-[4vw] sm:h-[1.8vw] lg:h-[1vw] ml-[0.3vw]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
