"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import ProductsCatalog from "@/components/ProductsCatalog";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function CompraFacilPage() {
  return (
    <div className="space-y-[4vh] sm:space-y-[6vh] w-full pb-0 mb-0 bg-[#fdfbf9] text-gray-900">
      {/* 1. Hero Slider dinámico de 3 diapositivas */}
      <HeroSlider variant="practica" />

      {/* =========================================================================
          2. SECCIÓN DE PRODUCTOS CON FILTROS, CATEGORÍAS Y NAVEGACIÓN
      ========================================================================= */}
      <section id="catalogo-productos" className="w-[90%] mx-auto pt-[2vh]">
        <Suspense
          fallback={
            <div className="text-center py-[8vh] bg-white rounded-[1vw] border border-gray-200 p-[4vw]">
              <p className="text-gray-500 text-[3.6vw] sm:text-[1.6vw] lg:text-[1vw]">
                Cargando catálogo de Compra fácil y estándar...
              </p>
            </div>
          }
        >
          <ProductsCatalog
            initialLinea="practica"
            containerClassName="w-full"
            customHeader={
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-[3vh] gap-[2vh]">
                <div className="space-y-[0.8vh]">
                  <span className="text-[3vw] sm:text-[1.3vw] lg:text-[0.72vw] uppercase tracking-[0.25em] text-[#c25e1a] font-semibold block">
                    TU SELECCIÓN DE COMPRA FÁCIL Y ESTÁNDAR
                  </span>
                  <h2 className="font-heading text-[6vw] sm:text-[3.5vw] lg:text-[2.2vw] font-bold tracking-wider uppercase text-gray-900">
                    MUEBLES PRÁCTICOS{" "}
                    <span className="italic font-serif font-normal">
                      AL MEJOR PRECIO
                    </span>
                  </h2>
                  <p className="text-[3.2vw] sm:text-[1.5vw] lg:text-[0.9vw] text-gray-500 font-light max-w-[65ch] leading-relaxed">
                    Modelos listos para tu hogar, pensados para resolver tus
                    espacios con rapidez, diseño funcional y la mejor relación
                    precio-calidad.
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
            }
          />
        </Suspense>
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
