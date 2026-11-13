"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Sparkles, Check, MapPin } from "lucide-react";

export default function SplitHero() {
  return (
    <section className="w-full h-[100dvh] max-h-[100dvh] flex flex-col md:flex-row overflow-hidden relative bg-black select-none">
      {/* =========================================================================
          HEADER NEGRO SUPERPUESTO CON DEGRADÉ Y LOGO CENTRADO
      ========================================================================= */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none flex flex-col items-center">
        {/* Degradé negro suave de arriba hacia abajo */}
        <div className="absolute top-0 left-0 right-0 h-[18vh] sm:h-[22vh] md:h-[26vh] bg-gradient-to-b from-black/95 via-black/80 to-transparent pointer-events-none" />

        {/* Logo centrado en el header */}
        <div className="relative z-40 pt-[1.8vh] sm:pt-[2.2vh] md:pt-[2.8vh] pointer-events-auto">
          <Link
            href="/"
            className="flex items-center justify-center transition-transform duration-300 hover:scale-105"
          >
            <img
              src="/logoAcasaTienda.webp"
              alt="Acasa Calidad y Diseño"
              className="h-[4.8vh] sm:h-[5.5vh] md:h-[6.5vh] lg:h-[7.2vh] max-h-[48px] sm:max-h-[58px] md:max-h-[72px] w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
            />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          LEFT HALF: LÍNEA PRÁCTICA (Compra fácil) - 50vw x 100vh desktop / 100vw x 50dvh mobile
      ========================================================================= */}
      <div className="w-full md:w-[50vw] h-[50dvh] md:h-full relative flex flex-col justify-between p-[4vw] sm:p-[3.5vw] lg:p-[3vw] pt-[12.5vh] sm:pt-[13vh] md:pt-[18vh] lg:pt-[20vh] pb-[2vh] sm:pb-[4vh] group overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
        {/* Full-bleed background image covering the ENTIRE half */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
          <img
            src="/split-practica.webp"
            alt="Línea Práctica - Compra fácil y estándar"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out brightness-95"
            onError={(e) => {
              e.currentTarget.src =
                "https://acasatienda.com.ar/wp-content/uploads/2026/10/Living.webp";
            }}
          />
          {/* Cinematic dark gradient overlay: lighter top to showcase furniture, deeper bottom for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25 group-hover:from-black/85 group-hover:via-black/35 transition-colors duration-500" />
        </div>

        {/* Top Tag Badge in Acasa brand styling */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center bg-black/55 backdrop-blur-md border border-white/25 text-white text-[2.6vw] sm:text-[1.2vw] lg:text-[0.75vw] font-bold uppercase tracking-[0.25em] px-[3vw] sm:px-[1.6vw] lg:px-[1.1vw] py-[0.6vh] sm:py-[0.6vh] rounded-full shadow-lg">
            <span>LÍNEA PRÁCTICA</span>
          </div>
          <div className="flex md:hidden items-center space-x-[1vw] text-[2.4vw] uppercase tracking-[0.15em] text-white/80 font-medium">
            <MapPin className="w-[3vw] h-[3vw] text-[#f6ad55]" />
            <span>Ciudad · Av. Mitre</span>
          </div>
        </div>

        {/* Bottom Content Area: Typography & buttons adapted to Acasa's design system */}
        <div className="relative z-10 space-y-[1.2vh] sm:space-y-[1.8vh]">
          {/* Header block */}
          <div className="space-y-[0.4vh] sm:space-y-[0.8vh]">
            <span className="text-[#f6ad55] font-semibold text-[2.4vw] sm:text-[1.2vw] lg:text-[0.75vw] uppercase tracking-[0.25em] block">
              QUIERO ALGO PRÁCTICO Y ACCESIBLE
            </span>
            <h2 className="font-heading text-[6vw] sm:text-[4.5vw] lg:text-[3vw] font-bold uppercase tracking-wider text-white leading-tight">
              COMPRA FÁCIL Y ESTÁNDAR
            </h2>
            <p className="text-[3vw] sm:text-[1.8vw] lg:text-[1.05vw] font-light text-gray-200 line-clamp-2 md:line-clamp-none">
              Melamina y muebles prácticos. Precios accesibles, modelos definidos y mayor disponibilidad.
            </p>
          </div>

          {/* Bullet checkmarks (visible on tablet & desktop) */}
          <div className="hidden md:flex flex-wrap items-center gap-x-[3.5vw] sm:gap-x-[2vw] gap-y-[0.8vh] text-[3vw] sm:text-[1.3vw] lg:text-[0.82vw] text-white/95 font-medium">
            <div className="flex items-center space-x-[1.2vw] sm:space-x-[0.4vw]">
              <span className="w-[4.5vw] sm:w-[2vw] lg:w-[1.1vw] h-[4.5vw] sm:h-[2vw] lg:h-[1.1vw] rounded-full bg-[#c25e1a] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Check className="w-[3vw] sm:w-[1.4vw] lg:w-[0.75vw] h-[3vw] sm:h-[1.4vw] lg:h-[0.75vw]" />
              </span>
              <span>Precios más accesibles</span>
            </div>
            <div className="flex items-center space-x-[1.2vw] sm:space-x-[0.4vw]">
              <span className="w-[4.5vw] sm:w-[2vw] lg:w-[1.1vw] h-[4.5vw] sm:h-[2vw] lg:h-[1.1vw] rounded-full bg-[#c25e1a] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Check className="w-[3vw] sm:w-[1.4vw] lg:w-[0.75vw] h-[3vw] sm:h-[1.4vw] lg:h-[0.75vw]" />
              </span>
              <span>Más stock · Modelos definidos</span>
            </div>
          </div>

          {/* Highlight Box: Entrega en 48 h* (Acasa Frosted Card - visible on tablet & desktop) */}
          <div className="hidden md:flex bg-black/50 backdrop-blur-md border border-white/20 rounded-[1.2vw] sm:rounded-[0.5vw] lg:rounded-[0.35vw] p-[3vw] sm:p-[1.4vw] lg:p-[1vw] items-center space-x-[2.5vw] sm:space-x-[1.2vw] lg:space-x-[0.8vw] shadow-xl">
            <div className="w-[8.5vw] sm:w-[3.8vw] lg:w-[2.2vw] h-[8.5vw] sm:h-[3.8vw] lg:h-[2.2vw] rounded-full bg-[#c25e1a] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Zap className="w-[4.2vw] sm:w-[1.8vw] lg:w-[1.1vw] h-[4.2vw] sm:h-[1.8vw] lg:h-[1.1vw] fill-white" />
            </div>
            <div>
              <p className="font-heading font-bold text-[3.4vw] sm:text-[1.5vw] lg:text-[0.9vw] uppercase tracking-wider text-white">
                ENTREGA EN 48 H*
              </p>
              <p className="text-[2.6vw] sm:text-[1.1vw] lg:text-[0.72vw] text-gray-300 font-light">
                En productos y zonas habilitados
              </p>
            </div>
          </div>

          {/* Button in Acasa Design Style */}
          <div>
            <Link
              href="/compra-facil"
              className="w-full inline-flex items-center justify-center space-x-[1.5vw] sm:space-x-[0.8vw] bg-white text-black hover:bg-[#c25e1a] hover:text-white hover:border-[#c25e1a] border border-white text-[3vw] sm:text-[1.4vw] lg:text-[0.85vw] uppercase font-bold tracking-widest py-[1.2vh] sm:py-[1.5vh] px-[4vw] sm:px-[2vw] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.25vw] transition-all duration-300 shadow-xl group/btn text-center"
            >
              <span>ENTRAR A COMPRA FÁCIL Y ESTÁNDAR</span>
              <ArrowRight className="w-[3.5vw] sm:w-[1.6vw] lg:w-[1vw] h-[3.5vw] sm:h-[1.6vw] lg:h-[1vw] group-hover/btn:translate-x-[0.3vw] transition-transform flex-shrink-0" />
            </Link>
          </div>

          {/* Location note (desktop) */}
          <div className="hidden md:flex items-center justify-center space-x-[1.5vw] sm:space-x-[0.4vw] text-[2.8vw] sm:text-[1.2vw] lg:text-[0.72vw] uppercase tracking-[0.2em] text-white/75 font-medium pt-[0.5vh]">
            <MapPin className="w-[3.5vw] sm:w-[1.4vw] lg:w-[0.8vw] h-[3.5vw] sm:h-[1.4vw] lg:h-[0.8vw] text-[#f6ad55]" />
            <span>Ciudad · Av. Mitre 1398</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT HALF: LÍNEA PREMIUM (Interiorismo y diseño) - 50vw x 100vh desktop / 100vw x 50dvh mobile
      ========================================================================= */}
      <div className="w-full md:w-[50vw] h-[50dvh] md:h-full relative flex flex-col justify-between p-[4vw] sm:p-[3.5vw] lg:p-[3vw] pt-[4.5vh] sm:pt-[5.5vh] md:pt-[18vh] lg:pt-[20vh] pb-[2vh] sm:pb-[4vh] group overflow-hidden">
        {/* Full-bleed background image covering the ENTIRE half */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
          <img
            src="/split-premium.webp"
            alt="Línea Premium - Compra personalizada y de diseño"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out brightness-95"
            onError={(e) => {
              e.currentTarget.src =
                "https://acasatienda.com.ar/wp-content/uploads/2026/10/Comedor.webp";
            }}
          />
          {/* Cinematic dark gradient overlay: lighter top to showcase furniture, deeper bottom for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25 group-hover:from-black/85 group-hover:via-black/35 transition-colors duration-500" />
        </div>

        {/* Top Tag Badge in Acasa brand styling */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center bg-black/55 backdrop-blur-md border border-white/25 text-white text-[2.6vw] sm:text-[1.2vw] lg:text-[0.75vw] font-bold uppercase tracking-[0.25em] px-[3vw] sm:px-[1.6vw] lg:px-[1.1vw] py-[0.6vh] sm:py-[0.6vh] rounded-full shadow-lg">
            <span>LÍNEA PREMIUM</span>
          </div>
          <div className="flex md:hidden items-center space-x-[1vw] text-[2.4vw] uppercase tracking-[0.15em] text-white/80 font-medium">
            <MapPin className="w-[3vw] h-[3vw] text-[#a7f3d0]" />
            <span>Luján · Alma Gardenia</span>
          </div>
        </div>

        {/* Bottom Content Area: Typography & buttons adapted to Acasa's design system */}
        <div className="relative z-10 space-y-[1.2vh] sm:space-y-[1.8vh]">
          {/* Header block */}
          <div className="space-y-[0.4vh] sm:space-y-[0.8vh]">
            <span className="text-[#a7f3d0] font-semibold text-[2.4vw] sm:text-[1.2vw] lg:text-[0.75vw] uppercase tracking-[0.25em] block">
              QUIERO DISEÑO Y ALGO MÁS PERSONAL
            </span>
            <h2 className="font-heading text-[6vw] sm:text-[4.5vw] lg:text-[3vw] font-bold uppercase tracking-wider text-white leading-tight">
              COMPRA PERSONALIZADA Y DE DISEÑO
            </h2>
            <p className="text-[3vw] sm:text-[1.8vw] lg:text-[1.05vw] font-light text-gray-200 line-clamp-2 md:line-clamp-none">
              Muebles, decoración y opciones de terminación para crear tu ambiente.
            </p>
          </div>

          {/* Bullet checkmarks (visible on tablet & desktop) */}
          <div className="hidden md:flex flex-wrap items-center gap-x-[3.5vw] sm:gap-x-[2vw] gap-y-[0.8vh] text-[3vw] sm:text-[1.3vw] lg:text-[0.82vw] text-white/90 font-medium">
            <div className="flex items-center space-x-[1.2vw] sm:space-x-[0.4vw]">
              <span className="w-[4.5vw] sm:w-[2vw] lg:w-[1.1vw] h-[4.5vw] sm:h-[2vw] lg:h-[1.1vw] rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Check className="w-[3vw] sm:w-[1.4vw] lg:w-[0.75vw] h-[3vw] sm:h-[1.4vw] lg:h-[0.75vw] text-white" />
              </span>
              <span>Materiales nobles y terminaciones</span>
            </div>
            <div className="flex items-center space-x-[1.2vw] sm:space-x-[0.4vw]">
              <span className="w-[4.5vw] sm:w-[2vw] lg:w-[1.1vw] h-[4.5vw] sm:h-[2vw] lg:h-[1.1vw] rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Check className="w-[3vw] sm:w-[1.4vw] lg:w-[0.75vw] h-[3vw] sm:h-[1.4vw] lg:h-[0.75vw] text-white" />
              </span>
              <span>Stock y plazos según modelo</span>
            </div>
          </div>

          {/* Highlight Box: Asesoramiento personalizado (Acasa Frosted Card - visible on tablet & desktop) */}
          <div className="hidden md:flex bg-black/50 backdrop-blur-md border border-white/20 rounded-[1.2vw] sm:rounded-[0.5vw] lg:rounded-[0.35vw] p-[3vw] sm:p-[1.4vw] lg:p-[1vw] items-center space-x-[2.5vw] sm:space-x-[1.2vw] lg:space-x-[0.8vw] shadow-xl">
            <div className="w-[8.5vw] sm:w-[3.8vw] lg:w-[2.2vw] h-[8.5vw] sm:h-[3.8vw] lg:h-[2.2vw] rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-[4.2vw] sm:w-[1.8vw] lg:w-[1.1vw] h-[4.2vw] sm:h-[1.8vw] lg:h-[1.1vw]" />
            </div>
            <div>
              <p className="font-heading font-bold text-[3.4vw] sm:text-[1.5vw] lg:text-[0.9vw] uppercase tracking-wider text-white">
                ASESORAMIENTO PERSONALIZADO
              </p>
              <p className="text-[2.6vw] sm:text-[1.1vw] lg:text-[0.72vw] text-gray-300 font-light">
                Comprá una pieza o diseñá tu ambiente a medida
              </p>
            </div>
          </div>

          {/* Button in Acasa Design Style */}
          <div>
            <Link
              href="/interiorismo"
              className="w-full inline-flex items-center justify-center space-x-[1.5vw] sm:space-x-[0.8vw] bg-white text-black hover:bg-black hover:text-white border border-white text-[3vw] sm:text-[1.4vw] lg:text-[0.85vw] uppercase font-bold tracking-widest py-[1.2vh] sm:py-[1.5vh] px-[4vw] sm:px-[2vw] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.25vw] transition-all duration-300 shadow-xl group/btn text-center"
            >
              <span>ENTRAR A COMPRA PERSONALIZADA Y DE DISEÑO</span>
              <ArrowRight className="w-[3.5vw] sm:w-[1.6vw] lg:w-[1vw] h-[3.5vw] sm:h-[1.6vw] lg:h-[1vw] group-hover/btn:translate-x-[0.3vw] transition-transform flex-shrink-0" />
            </Link>
          </div>

          {/* Location note (desktop) */}
          <div className="hidden md:flex items-center justify-center space-x-[1.5vw] sm:space-x-[0.4vw] text-[2.8vw] sm:text-[1.2vw] lg:text-[0.72vw] uppercase tracking-[0.2em] text-white/75 font-medium pt-[0.5vh]">
            <MapPin className="w-[3.5vw] sm:w-[1.4vw] lg:w-[0.8vw] h-[3.5vw] sm:h-[1.4vw] lg:h-[0.8vw] text-[#a7f3d0]" />
            <span>Luján · Circuito Alma Gardenia</span>
          </div>
        </div>
      </div>
    </section>
  );
}
