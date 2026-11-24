"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Zap,
  ShieldCheck,
  Compass,
  CreditCard,
  Truck,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface HeroSliderProps {
  variant: "practica" | "premium";
}

export default function HeroSlider({ variant }: HeroSliderProps) {
  const isPractica = variant === "practica";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const totalSlides = 3;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay (6s)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartXRef.current = null;
  };

  return (
    <section
      className={`relative w-full overflow-hidden select-none ${
        isPractica
          ? "h-[85vh] sm:h-[88vh] bg-[#1e130e]"
          : "h-[88vh] sm:h-[92vh] bg-[#1a261c]"
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Carrusel principal"
    >
      {/* =========================================================================
          BACKGROUNDS CON TRANSICIÓN SUAVE & KEN-BURNS ZOOM
      ========================================================================= */}
      {isPractica ? (
        <>
          {/* Práctica - Slide 1 Bg */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentIndex === 0 ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[7500ms] ease-out ${
                currentIndex === 0 ? "scale-105" : "scale-100"
              }`}
              style={{ backgroundImage: `url('/split-practica.webp')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/40" />
          </div>

          {/* Práctica - Slide 2 Bg */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentIndex === 1 ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[7500ms] ease-out ${
                currentIndex === 1 ? "scale-105" : "scale-100"
              }`}
              style={{
                backgroundImage: `url('https://acasatienda.com.ar/wp-content/uploads/2026/10/Comedor.webp')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/50" />
          </div>

          {/* Práctica - Slide 3 Bg */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentIndex === 2 ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[7500ms] ease-out ${
                currentIndex === 2 ? "scale-105" : "scale-100"
              }`}
              style={{
                backgroundImage: `url('https://acasatienda.com.ar/wp-content/uploads/2026/10/Mueble-de-TV.webp')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/75 to-black/50" />
          </div>
        </>
      ) : (
        <>
          {/* Premium - Slide 1 Bg */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentIndex === 0 ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[7500ms] ease-out ${
                currentIndex === 0 ? "scale-105" : "scale-100"
              }`}
              style={{ backgroundImage: `url('/split-premium.webp')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1c291d]/95 via-[#223323]/85 to-[#182319]/75" />
          </div>

          {/* Premium - Slide 2 Bg */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentIndex === 1 ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[7500ms] ease-out ${
                currentIndex === 1 ? "scale-105" : "scale-100"
              }`}
              style={{
                backgroundImage: `url('https://acasatienda.com.ar/wp-content/uploads/2026/10/Living.webp')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121c13]/95 via-[#1a291c]/75 to-[#121c13]/85" />
          </div>

          {/* Premium - Slide 3 Bg */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentIndex === 2 ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[7500ms] ease-out ${
                currentIndex === 2 ? "scale-105" : "scale-100"
              }`}
              style={{
                backgroundImage: `url('https://acasatienda.com.ar/wp-content/uploads/2026/10/Dormitorio.webp')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#152317]/95 via-[#1a2b1c]/80 to-[#101911]/85" />
          </div>
        </>
      )}

      {/* =========================================================================
          CONTENIDO DINÁMICO SEGÚN LA DIAPOSITIVA (ESTRUCTURAS DIFERENCIADAS Y ANIMADAS)
      ========================================================================= */}
      <div className="relative z-10 w-[90%] mx-auto h-full flex items-center justify-center">
        {/* =====================================================================
            CASO A: LÍNEA PRÁCTICA
        ===================================================================== */}
        {isPractica && (
          <div key={`practica-slide-${currentIndex}`} className="w-full flex items-center justify-center">
            {/* SLIDE 1 (PRÁCTICA): Estructura Clásica Split + Badge Prominente 48h */}
            {currentIndex === 0 && (
              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-[4vh] md:gap-[3vw] text-white">
                <div className="space-y-[2vh] text-center md:text-left max-w-[85vw] md:max-w-[55vw]">
                  <span className="inline-block text-[2.8vw] sm:text-[1.3vw] lg:text-[0.75vw] uppercase tracking-[0.25em] font-bold text-[#f6ad55] border-b border-[#c25e1a] pb-[0.4vh] anim-hero-down">
                    COMPRA FÁCIL Y ESTÁNDAR · LÍNEA PRÁCTICA
                  </span>
                  <h1 className="font-heading text-[8vw] sm:text-[5.5vw] lg:text-[4.2vw] font-bold tracking-tight uppercase leading-[1.1] text-white anim-hero-left anim-delay-75">
                    Más para tu casa. <br />
                    <span className="italic font-serif font-normal text-gray-100">
                      Mejor para tu bolsillo.
                    </span>
                  </h1>
                  <p className="text-[3.6vw] sm:text-[1.8vw] lg:text-[1.1vw] font-light text-gray-200 max-w-[75vw] md:max-w-[48vw] leading-relaxed anim-hero-left anim-delay-150">
                    Melamina y muebles prácticos. Precios accesibles, modelos definidos y mayor disponibilidad para renovar tus ambientes hoy.
                  </p>
                  <div className="pt-[1.5vh] flex flex-col sm:flex-row items-center justify-center md:justify-start gap-[1.5vh] sm:gap-[1vw] anim-hero-up anim-delay-250">
                    <a
                      href="#catalogo-productos"
                      className="w-full sm:w-auto inline-flex items-center justify-center bg-[#c25e1a] text-white text-[3.6vw] sm:text-[1.4vw] lg:text-[0.8vw] uppercase font-bold tracking-widest px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-[#a94f13] transition-all duration-300 shadow-xl cursor-pointer"
                    >
                      <span>Explorar Compra fácil</span>
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

                {/* Badge Flotante 48h */}
                <div className="flex-shrink-0 w-full sm:w-auto flex flex-col items-center md:items-end anim-hero-zoom anim-delay-250">
                  <div className="bg-[#dcfce7] border border-[#86efac] text-[#14532d] rounded-[2vw] sm:rounded-[1vw] lg:rounded-[0.8vw] p-[5vw] sm:p-[2.5vw] lg:p-[1.8vw] flex items-center space-x-[3.5vw] sm:space-x-[1.5vw] shadow-2xl">
                    <div className="w-[12vw] sm:w-[5vw] lg:w-[3.2vw] h-[12vw] sm:h-[5vw] lg:h-[3.2vw] rounded-full bg-[#15803d] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Zap className="w-[6vw] sm:w-[2.4vw] lg:w-[1.6vw] h-[6vw] sm:h-[2.4vw] lg:h-[1.6vw] fill-white" />
                    </div>
                    <div className="text-left">
                      <span className="text-[2.2vw] sm:text-[1vw] lg:text-[0.68vw] font-bold uppercase tracking-widest text-[#15803d] block">
                        ENTREGA EXPRESS
                      </span>
                      <p className="font-heading font-black text-[4.5vw] sm:text-[2.2vw] lg:text-[1.4vw] tracking-tight text-[#14532d] leading-tight">
                        Despacho en 48 h
                      </p>
                      <p className="text-[2.8vw] sm:text-[1.2vw] lg:text-[0.8vw] text-[#166534] font-medium pt-[0.2vh]">
                        En productos y zonas habilitadas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 2 (PRÁCTICA): Estructura Centrada / Editorial / Píldoras de Ventajas */}
            {currentIndex === 1 && (
              <div className="w-full max-w-[70vw] text-center space-y-[3vh]">
                <div className="inline-flex items-center space-x-[1vw] bg-white/10 backdrop-blur-md px-[3vw] py-[0.8vh] rounded-full border border-white/20 anim-hero-down">
                  <span className="w-[2vw] sm:w-[0.6vw] h-[2vw] sm:h-[0.6vw] rounded-full bg-[#f6ad55] animate-pulse" />
                  <span className="text-[2.6vw] sm:text-[1.1vw] lg:text-[0.75vw] uppercase tracking-[0.22em] font-bold text-white">
                    STOCK PERMANENTE PARA TODO TU HOGAR
                  </span>
                </div>

                <h1 className="font-heading text-[8vw] sm:text-[5.5vw] lg:text-[4.5vw] font-bold tracking-tight uppercase leading-[1.05] text-white anim-hero-up anim-delay-75">
                  Muebles listos <br />
                  <span className="italic font-serif font-normal text-[#f6ad55]">
                    para disfrutar hoy.
                  </span>
                </h1>

                <p className="text-[3.6vw] sm:text-[1.8vw] lg:text-[1.15vw] font-light text-gray-200 max-w-[55vw] mx-auto leading-relaxed anim-hero-up anim-delay-150">
                  Llevate tu placard, mesa o rack sin esperas de fabricación. Modelos funcionales en melamina de alta calidad listos para armar y usar.
                </p>

                {/* 3 Píldoras de Beneficio Centradas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-[2vw] max-w-[55vw] mx-auto pt-[1vh] anim-hero-up anim-delay-250">
                  <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-[2vw] sm:p-[1vw] text-center">
                    <CheckCircle2 className="w-[5vw] sm:w-[1.6vw] h-[5vw] sm:h-[1.6vw] text-[#86efac] mx-auto mb-[0.6vh]" />
                    <p className="text-[3vw] sm:text-[1.1vw] lg:text-[0.8vw] font-bold text-white uppercase tracking-wider">
                      Stock Inmediato
                    </p>
                    <p className="text-[2.4vw] sm:text-[0.9vw] lg:text-[0.68vw] text-gray-300">
                      Sin demoras de espera
                    </p>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-[2vw] sm:p-[1vw] text-center">
                    <CreditCard className="w-[5vw] sm:w-[1.6vw] h-[5vw] sm:h-[1.6vw] text-[#f6ad55] mx-auto mb-[0.6vh]" />
                    <p className="text-[3vw] sm:text-[1.1vw] lg:text-[0.8vw] font-bold text-white uppercase tracking-wider">
                      Cuotas Sin Interés
                    </p>
                    <p className="text-[2.4vw] sm:text-[0.9vw] lg:text-[0.68vw] text-gray-300">
                      Promociones bancarias
                    </p>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-[2vw] sm:p-[1vw] text-center">
                    <Truck className="w-[5vw] sm:w-[1.6vw] h-[5vw] sm:h-[1.6vw] text-white mx-auto mb-[0.6vh]" />
                    <p className="text-[3vw] sm:text-[1.1vw] lg:text-[0.8vw] font-bold text-white uppercase tracking-wider">
                      Envíos Seguros
                    </p>
                    <p className="text-[2.4vw] sm:text-[0.9vw] lg:text-[0.68vw] text-gray-300">
                      Directo a tu puerta
                    </p>
                  </div>
                </div>

                <div className="pt-[1.5vh] anim-hero-up anim-delay-350">
                  <Link
                    href="/productos?linea=practica"
                    className="inline-flex items-center justify-center bg-[#c25e1a] text-white text-[3.6vw] sm:text-[1.4vw] lg:text-[0.85vw] uppercase font-bold tracking-widest px-[8vw] sm:px-[4vw] lg:px-[2.8vw] py-[1.8vh] rounded-full hover:bg-[#a94f13] transition-all duration-300 shadow-2xl"
                  >
                    <span>Ver Catálogo con Stock Inmediato</span>
                    <ArrowRight className="w-[4vw] sm:w-[1.6vw] lg:w-[1vw] h-[4vw] sm:h-[1.6vw] lg:h-[1vw] ml-[1vw] sm:ml-[0.5vw]" />
                  </Link>
                </div>
              </div>
            )}

            {/* SLIDE 3 (PRÁCTICA): Estructura Invertida / Grid de Categorías + CTA a la Derecha */}
            {currentIndex === 2 && (
              <div className="w-full flex flex-col md:flex-row-reverse items-center justify-between gap-[4vh] md:gap-[3vw] text-white">
                <div className="space-y-[2vh] text-center md:text-left max-w-[85vw] md:max-w-[48vw]">
                  <span className="inline-block text-[2.8vw] sm:text-[1.3vw] lg:text-[0.75vw] uppercase tracking-[0.25em] font-bold text-[#f6ad55] border-b border-[#c25e1a] pb-[0.4vh] anim-hero-down">
                    COMBOS & PRECIO DIRECTO
                  </span>
                  <h1 className="font-heading text-[8vw] sm:text-[5.5vw] lg:text-[4vw] font-bold tracking-tight uppercase leading-[1.1] text-white anim-hero-right anim-delay-75">
                    Equipá tu espacio <br />
                    <span className="italic font-serif font-normal text-gray-200">
                      ahorrando de verdad.
                    </span>
                  </h1>
                  <p className="text-[3.6vw] sm:text-[1.8vw] lg:text-[1.05vw] font-light text-gray-200 leading-relaxed anim-hero-right anim-delay-150">
                    Combos pensados para resolver tu living, dormitorio y cocina de una sola vez con los precios más competitivos de Mendoza.
                  </p>
                  <div className="pt-[1.5vh] flex flex-col sm:flex-row items-center justify-center md:justify-start gap-[1.5vh] sm:gap-[1vw] anim-hero-up anim-delay-250">
                    <a
                      href="https://wa.me/5492616843330?text=Hola!%20Quiero%20conocer%20los%20combos%20y%20ofertas%20de%20la%20Línea%20Práctica"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center bg-[#25D366] text-black text-[3.6vw] sm:text-[1.4vw] lg:text-[0.82vw] uppercase font-bold tracking-widest px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-[#20ba59] transition-all duration-300 shadow-xl"
                    >
                      <span>Pedir Combos por WhatsApp</span>
                      <ArrowRight className="w-[4vw] sm:w-[1.8vw] lg:w-[1vw] h-[4vw] sm:h-[1.8vw] lg:h-[1vw] ml-[1vw] sm:ml-[0.5vw]" />
                    </a>
                    <Link
                      href="/productos?categoria=muebles-tv&linea=practica"
                      className="w-full sm:w-auto inline-flex items-center justify-center bg-white/10 border border-white/30 text-white text-[3.6vw] sm:text-[1.4vw] lg:text-[0.8vw] uppercase font-semibold tracking-widest px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-white/20 transition-all duration-300"
                    >
                      Ver Racks & TV
                    </Link>
                  </div>
                </div>

                {/* Tarjetas de Categorías destacadas */}
                <div className="grid grid-cols-2 gap-[2.5vw] sm:gap-[1.2vw] w-full md:w-[38vw] anim-hero-left anim-delay-250">
                  <Link
                    href="/productos?categoria=dormitorio&linea=practica"
                    className="group bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/15 rounded-2xl p-[3vw] sm:p-[1.5vw] transition-all duration-300 hover:border-[#f6ad55] shadow-xl"
                  >
                    <span className="text-[#f6ad55] text-[2.6vw] sm:text-[1vw] lg:text-[0.7vw] font-bold uppercase tracking-wider block mb-[0.5vh]">
                      Dormitorios
                    </span>
                    <h3 className="text-white font-heading font-bold text-[3.6vw] sm:text-[1.5vw] lg:text-[1vw] uppercase">
                      Placares & Camas
                    </h3>
                    <p className="text-gray-300 text-[2.4vw] sm:text-[0.9vw] lg:text-[0.68vw] pt-[0.4vh] group-hover:text-white transition-colors">
                      Modelos de 2 a 6 puertas →
                    </p>
                  </Link>

                  <Link
                    href="/productos?categoria=muebles-tv&linea=practica"
                    className="group bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/15 rounded-2xl p-[3vw] sm:p-[1.5vw] transition-all duration-300 hover:border-[#f6ad55] shadow-xl"
                  >
                    <span className="text-[#f6ad55] text-[2.6vw] sm:text-[1vw] lg:text-[0.7vw] font-bold uppercase tracking-wider block mb-[0.5vh]">
                      Living & TV
                    </span>
                    <h3 className="text-white font-heading font-bold text-[3.6vw] sm:text-[1.5vw] lg:text-[1vw] uppercase">
                      Racks & Paneles
                    </h3>
                    <p className="text-gray-300 text-[2.4vw] sm:text-[0.9vw] lg:text-[0.68vw] pt-[0.4vh] group-hover:text-white transition-colors">
                      Hasta 65 pulgadas →
                    </p>
                  </Link>

                  <Link
                    href="/productos?categoria=comedor&linea=practica"
                    className="group bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/15 rounded-2xl p-[3vw] sm:p-[1.5vw] transition-all duration-300 hover:border-[#f6ad55] shadow-xl"
                  >
                    <span className="text-[#f6ad55] text-[2.6vw] sm:text-[1vw] lg:text-[0.7vw] font-bold uppercase tracking-wider block mb-[0.5vh]">
                      Comedor
                    </span>
                    <h3 className="text-white font-heading font-bold text-[3.6vw] sm:text-[1.5vw] lg:text-[1vw] uppercase">
                      Mesas & Sillas
                    </h3>
                    <p className="text-gray-300 text-[2.4vw] sm:text-[0.9vw] lg:text-[0.68vw] pt-[0.4vh] group-hover:text-white transition-colors">
                      Juegos completos →
                    </p>
                  </Link>

                  <Link
                    href="/productos?categoria=colchones&linea=practica"
                    className="group bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/15 rounded-2xl p-[3vw] sm:p-[1.5vw] transition-all duration-300 hover:border-[#f6ad55] shadow-xl"
                  >
                    <span className="text-[#f6ad55] text-[2.6vw] sm:text-[1vw] lg:text-[0.7vw] font-bold uppercase tracking-wider block mb-[0.5vh]">
                      Descanso
                    </span>
                    <h3 className="text-white font-heading font-bold text-[3.6vw] sm:text-[1.5vw] lg:text-[1vw] uppercase">
                      Colchones Belmo
                    </h3>
                    <p className="text-gray-300 text-[2.4vw] sm:text-[0.9vw] lg:text-[0.68vw] pt-[0.4vh] group-hover:text-white transition-colors">
                      Espuma y resortes →
                    </p>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            CASO B: LÍNEA PERSONALIZADA (INTERIORISMO & DISEÑO)
        ===================================================================== */}
        {!isPractica && (
          <div key={`premium-slide-${currentIndex}`} className="w-full flex items-center justify-center">
            {/* SLIDE 1 (PREMIUM): Hero Principal Limpio */}
            {currentIndex === 0 && (
              <div className="w-full max-w-[85vw] md:max-w-[58vw] space-y-[2vh] text-center md:text-left text-white">
                <span className="inline-block text-[2.8vw] sm:text-[1.3vw] lg:text-[0.75vw] uppercase tracking-[0.25em] font-semibold text-[#a7f3d0] border-b border-[#a7f3d0]/30 pb-[0.4vh] anim-hero-down">
                  COMPRA PERSONALIZADA Y DE DISEÑO
                </span>
                <h1 className="font-heading text-[8vw] sm:text-[5.5vw] lg:text-[4.2vw] font-bold tracking-tight uppercase leading-[1.1] text-white anim-hero-left anim-delay-75">
                  Muebles con carácter. <br />
                  <span className="italic font-serif font-normal text-white">
                    Un espacio muy tuyo.
                  </span>
                </h1>
                <p className="text-[3.4vw] sm:text-[1.8vw] lg:text-[1.1vw] font-light text-gray-200 max-w-[75vw] md:max-w-[48vw] mx-auto md:mx-0 leading-relaxed anim-hero-left anim-delay-150">
                  Muebles de autor, maderas nobles y asesoramiento integral para diseñar ambientes únicos que perduran en el tiempo.
                </p>
                <div className="pt-[1.5vh] flex flex-col sm:flex-row items-center justify-center md:justify-start gap-[1.5vh] sm:gap-[1vw] anim-hero-up anim-delay-250">
                  <Link
                    href="/productos?linea=premium"
                    className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-black text-[3.6vw] sm:text-[1.4vw] lg:text-[0.8vw] uppercase font-bold tracking-widest px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-black hover:text-white transition-all duration-300 shadow-xl"
                  >
                    <span>Explorar Catálogo</span>
                    <ArrowRight className="w-[4vw] sm:w-[1.8vw] lg:w-[1vw] h-[4vw] sm:h-[1.8vw] lg:h-[1vw] ml-[1vw] sm:ml-[0.5vw]" />
                  </Link>
                  <Link
                    href="#areas"
                    className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent border border-white text-white text-[3.6vw] sm:text-[1.4vw] lg:text-[0.8vw] uppercase font-semibold tracking-widest px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-white/10 transition-all duration-300"
                  >
                    Ver Ambientes
                  </Link>
                </div>
              </div>
            )}

            {/* SLIDE 2 (PREMIUM): Estructura Centrada / Manifiesto de Materialidad */}
            {currentIndex === 1 && (
              <div className="w-full max-w-[85vw] sm:max-w-[70vw] text-center space-y-[2.5vh] sm:space-y-[3.5vh]">
                <span className="inline-block text-[2.8vw] sm:text-[1.3vw] lg:text-[0.78vw] uppercase tracking-[0.3em] font-semibold text-[#a7f3d0] border-b border-[#a7f3d0]/30 pb-[0.5vh] anim-hero-down">
                  MATERIALES NOBLES & OFICIO ARTESANAL
                </span>

                <h1 className="font-heading text-[6.5vw] sm:text-[5.5vw] lg:text-[4.5vw] font-bold tracking-tight uppercase leading-[1.1] text-white anim-hero-up anim-delay-75">
                  <span className="block whitespace-nowrap">Maderas macizas</span>
                  <span className="block italic font-serif font-normal text-[#d1fae5] whitespace-nowrap">
                    y texturas que perduran.
                  </span>
                </h1>

                <p className="text-[3.4vw] sm:text-[1.8vw] lg:text-[1.15vw] font-light text-gray-200 max-w-[80vw] sm:max-w-[50vw] mx-auto leading-relaxed anim-hero-up anim-delay-150">
                  Petiribí seleccionado, paraíso natural, fibras orgánicas y géneros de alta gama. Cada pieza está construida para convertirse en el corazón de tu casa.
                </p>

                {/* Sellos de Materialidad en 2 renglones, sin iconos */}
                <div className="flex flex-col items-center justify-center gap-[1.2vh] sm:gap-[1vw] pt-[1vh] anim-hero-zoom anim-delay-250">
                  <div className="flex items-center justify-center gap-[2vw] sm:gap-[1vw]">
                    <span className="px-[3.5vw] sm:px-[2vw] py-[0.8vh] rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[2.8vw] sm:text-[1.1vw] lg:text-[0.8vw] font-medium tracking-wide whitespace-nowrap">
                      Petiribí Macizo
                    </span>
                    <span className="px-[3.5vw] sm:px-[2vw] py-[0.8vh] rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[2.8vw] sm:text-[1.1vw] lg:text-[0.8vw] font-medium tracking-wide whitespace-nowrap">
                      Paraíso Lustrado
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[2vw] sm:gap-[1vw]">
                    <span className="px-[3.5vw] sm:px-[2vw] py-[0.8vh] rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[2.8vw] sm:text-[1.1vw] lg:text-[0.8vw] font-medium tracking-wide whitespace-nowrap">
                      Tapicería Premium
                    </span>
                    <span className="px-[3.5vw] sm:px-[2vw] py-[0.8vh] rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[2.8vw] sm:text-[1.1vw] lg:text-[0.8vw] font-medium tracking-wide whitespace-nowrap">
                      Medidas Especiales
                    </span>
                  </div>
                </div>

                <div className="pt-[1.5vh] anim-hero-up anim-delay-350">
                  <Link
                    href="/productos?linea=premium"
                    className="inline-flex items-center justify-center bg-white text-black text-[3.2vw] sm:text-[1.4vw] lg:text-[0.85vw] uppercase font-bold tracking-widest px-[6vw] sm:px-[4vw] lg:px-[2.8vw] py-[1.8vh] rounded-full hover:bg-black hover:text-white transition-all duration-300 shadow-2xl whitespace-nowrap"
                  >
                    <span>Ver Colección de Autor</span>
                    <ArrowRight className="w-[4vw] sm:w-[1.6vw] lg:w-[1vw] h-[4vw] sm:h-[1.6vw] lg:h-[1vw] ml-[1vw] sm:ml-[0.5vw]" />
                  </Link>
                </div>
              </div>
            )}

            {/* SLIDE 3 (PREMIUM): Enfoque Editorial Interiorismo Completo */}
            {currentIndex === 2 && (
              <div className="w-full max-w-[85vw] md:max-w-[58vw] mx-auto text-center space-y-[2.5vh] text-white">
                <span className="inline-block text-[2.8vw] sm:text-[1.3vw] lg:text-[0.75vw] uppercase tracking-[0.25em] font-semibold text-[#a7f3d0] border-b border-[#a7f3d0]/30 pb-[0.4vh] anim-hero-down">
                  INTERIORISMO Y AMBIENTES COMPLETOS
                </span>
                <h1 className="font-heading text-[8vw] sm:text-[5.5vw] lg:text-[4.2vw] font-bold tracking-tight uppercase leading-[1.1] text-white anim-hero-up anim-delay-75">
                  Tu casa, <br />
                  <span className="italic font-serif font-normal text-[#d1fae5]">
                    diseñada a tu medida.
                  </span>
                </h1>
                <p className="text-[3.6vw] sm:text-[1.8vw] lg:text-[1.15vw] font-light text-gray-200 max-w-[80vw] sm:max-w-[48vw] mx-auto leading-relaxed anim-hero-up anim-delay-150">
                  Desde el sofá principal hasta la iluminación y los detalles decorativos. Te acompañamos a concebir y ejecutar tu espacio ideal sin complicaciones.
                </p>
                <div className="pt-[1.5vh] flex flex-col sm:flex-row items-center justify-center gap-[1.5vh] sm:gap-[1.2vw] anim-hero-up anim-delay-250">
                  <Link
                    href="/sucursales?linea=premium"
                    className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-black text-[3.6vw] sm:text-[1.4vw] lg:text-[0.82vw] uppercase font-bold tracking-widest px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-black hover:text-white transition-all duration-300 shadow-xl"
                  >
                    <span>Ver Sucursales</span>
                    <ArrowRight className="w-[4vw] sm:w-[1.8vw] lg:w-[1vw] h-[4vw] sm:h-[1.8vw] lg:h-[1vw] ml-[1vw] sm:ml-[0.5vw]" />
                  </Link>
                  <Link
                    href="/productos?linea=premium"
                    className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent border border-white text-white text-[3.6vw] sm:text-[1.4vw] lg:text-[0.8vw] uppercase font-semibold tracking-widest px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-white/10 transition-all duration-300"
                  >
                    Ver Catálogo Completo
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          CONTROLES: FLECHAS LATERALES Y PUNTOS DE PROGRESO
      ========================================================================= */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Diapositiva anterior"
        className="absolute left-[2vw] sm:left-[3vw] top-1/2 -translate-y-1/2 z-20 w-[9vw] sm:w-[3.2vw] lg:w-[2.6vw] h-[9vw] sm:h-[3.2vw] lg:h-[2.6vw] rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all hover:scale-110 cursor-pointer shadow-xl"
      >
        <ChevronLeft className="w-[5vw] sm:w-[1.8vw] lg:w-[1.4vw] h-[5vw] sm:h-[1.8vw] lg:h-[1.4vw]" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Diapositiva siguiente"
        className="absolute right-[2vw] sm:right-[3vw] top-1/2 -translate-y-1/2 z-20 w-[9vw] sm:w-[3.2vw] lg:w-[2.6vw] h-[9vw] sm:h-[3.2vw] lg:h-[2.6vw] rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all hover:scale-110 cursor-pointer shadow-xl"
      >
        <ChevronRight className="w-[5vw] sm:w-[1.8vw] lg:w-[1.4vw] h-[5vw] sm:h-[1.8vw] lg:h-[1.4vw]" />
      </button>

      {/* Indicadores de Diapositiva con Número y Barra Activa */}
      <div className="absolute bottom-[2.8vh] left-1/2 -translate-x-1/2 z-20 flex items-center space-x-[2vw] sm:space-x-[0.8vw]">
        {[0, 1, 2].map((idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir a diapositiva ${idx + 1}`}
              className="group flex items-center space-x-[1vw] sm:space-x-[0.3vw] cursor-pointer py-[1vh]"
            >
              <div
                className={`h-[0.8vh] sm:h-[0.5vh] rounded-full transition-all duration-500 ${
                  isActive
                    ? isPractica
                      ? "w-[8vw] sm:w-[3vw] bg-[#f6ad55]"
                      : "w-[8vw] sm:w-[3vw] bg-[#a7f3d0]"
                    : "w-[3vw] sm:w-[1vw] bg-white/40 group-hover:bg-white/70"
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
