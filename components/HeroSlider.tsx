"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Zap,
  Sparkles,
  ShieldCheck,
  Compass,
} from "lucide-react";

interface SlideData {
  id: string;
  tag: string;
  title: string;
  titleItalic: string;
  description: string;
  bgImage: string;
  overlayGradient: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
  badge?: {
    title: string;
    subtitle: string;
    icon: "zap" | "sparkles" | "shield" | "compass";
    link?: {
      label: string;
      href: string;
    };
  };
}

const PRACTICA_SLIDES: SlideData[] = [
  {
    id: "practica-1",
    tag: "COMPRA FÁCIL Y ESTÁNDAR · LÍNEA PRÁCTICA",
    title: "Más para tu casa.",
    titleItalic: "Mejor para tu bolsillo.",
    description:
      "Melamina y muebles prácticos. Precios accesibles, modelos definidos y mayor disponibilidad para renovar tus ambientes hoy.",
    bgImage: "/split-practica.webp",
    overlayGradient: "from-black/85 via-black/60 to-black/40",
    primaryCta: {
      label: "Explorar Compra fácil",
      href: "#catalogo-productos",
    },
    secondaryCta: {
      label: "Ver Showroom Ciudad",
      href: "/sucursales?linea=practica",
    },
    badge: {
      title: "Entrega en 48 h",
      subtitle: "En productos y zonas habilitados",
      icon: "zap",
    },
  },
  {
    id: "practica-2",
    tag: "DISPONIBILIDAD INMEDIATA · STOCK PERMANENTE",
    title: "Muebles listos",
    titleItalic: "para disfrutar sin esperas.",
    description:
      "Soluciones funcionales para living, comedor y dormitorios. Elegí tu modelo y recibilo rápidamente en tu hogar.",
    bgImage: "https://acasatienda.com.ar/wp-content/uploads/2026/10/Comedor.webp",
    overlayGradient: "from-black/90 via-black/65 to-black/45",
    primaryCta: {
      label: "Ver Catálogo Práctico",
      href: "/productos?linea=practica",
    },
    secondaryCta: {
      label: "Consultar por WhatsApp",
      href: "https://wa.me/5492616843330?text=Hola!%20Quiero%20consultar%20por%20productos%20con%20entrega%20rápida%20de%20Línea%20Práctica",
      isExternal: true,
    },
    badge: {
      title: "Modelos Definidos",
      subtitle: "Armado simple y máxima practicidad",
      icon: "shield",
    },
  },
  {
    id: "practica-3",
    tag: "PRECIO Y CALIDAD · CUOTAS DISPONIBLES",
    title: "Diseño funcional",
    titleItalic: "al alcance de todos.",
    description:
      "Racks de TV, bajo mesadas, placares y combos diseñados para aprovechar cada metro cuadrado al mejor precio del mercado.",
    bgImage: "https://acasatienda.com.ar/wp-content/uploads/2026/10/Mueble-de-TV.webp",
    overlayGradient: "from-black/90 via-black/65 to-black/45",
    primaryCta: {
      label: "Ver Muebles y Combos",
      href: "/productos?categoria=muebles-tv&linea=practica",
    },
    secondaryCta: {
      label: "Ver Sucursales",
      href: "/sucursales?linea=practica",
    },
    badge: {
      title: "Financiación Directa",
      subtitle: "Cuotas y medios de pago convenientes",
      icon: "sparkles",
    },
  },
];

const PREMIUM_SLIDES: SlideData[] = [
  {
    id: "premium-1",
    tag: "COMPRA PERSONALIZADA Y DE DISEÑO",
    title: "Muebles con carácter.",
    titleItalic: "Un espacio muy tuyo.",
    description:
      "Muebles, decoración y opciones de terminación para crear tu ambiente. Explorá el catálogo de ACASA Tienda o dejá que te acompañemos a elegir.",
    bgImage: "/split-premium.webp",
    overlayGradient: "from-[#1c291d]/95 via-[#223323]/85 to-[#182319]/75",
    primaryCta: {
      label: "Explorar Catálogo",
      href: "/productos?linea=premium",
    },
    secondaryCta: {
      label: "Ver Ambientes",
      href: "#areas",
    },
    badge: {
      title: "Asesoramiento Personal",
      subtitle: "Materiales y plazos según cada modelo",
      icon: "compass",
      link: {
        label: "Quiero asesoramiento personal",
        href: "https://wa.me/5492616843330?text=Hola!%20Quiero%20asesoramiento%20personalizado%20para%20diseñar%20mi%20ambiente",
      },
    },
  },
  {
    id: "premium-2",
    tag: "MATERIALES NOBLES & PIEZAS DE AUTOR",
    title: "Maderas macizas",
    titleItalic: "y acabados exclusivos.",
    description:
      "Petiribí, paraíso natural, fibras seleccionadas y tapicería premium. Piezas únicas que elevan la calidez y el estilo de cada ambiente.",
    bgImage: "https://acasatienda.com.ar/wp-content/uploads/2026/10/Living.webp",
    overlayGradient: "from-[#182319]/95 via-[#1c291d]/85 to-[#152016]/80",
    primaryCta: {
      label: "Ver Colección Living & Deco",
      href: "/productos?categoria=living&linea=premium",
    },
    secondaryCta: {
      label: "Pedir Asesoramiento",
      href: "https://wa.me/5492616843330?text=Hola!%20Quiero%20asesoramiento%20para%20muebles%20de%20madera%20y%20diseño%20personalizado",
      isExternal: true,
    },
    badge: {
      title: "Fabricación a Medida",
      subtitle: "Elegí lustres, medidas y tapizados",
      icon: "sparkles",
      link: {
        label: "Consultar opciones de personalización",
        href: "https://wa.me/5492616843330?text=Hola!%20Quiero%20consultar%20opciones%20de%20personalización%20de%20muebles",
      },
    },
  },
  {
    id: "premium-3",
    tag: "SHOWROOM & INTERIORISMO INTEGRAL",
    title: "Tu hogar,",
    titleItalic: "diseñado a tu medida.",
    description:
      "Acompañamos cada etapa de tu proyecto de interiorismo. Espacios armónicos, mobiliario a medida y atención profesional en nuestro Showroom.",
    bgImage: "https://acasatienda.com.ar/wp-content/uploads/2026/10/Dormitorio.webp",
    overlayGradient: "from-[#152016]/95 via-[#182319]/85 to-[#1c291d]/80",
    primaryCta: {
      label: "Conocer Showroom",
      href: "/sucursales?linea=premium",
    },
    secondaryCta: {
      label: "Ver Todo el Catálogo",
      href: "/productos?linea=premium",
    },
    badge: {
      title: "Showroom Chacras",
      subtitle: "Viví la experiencia y sentí los materiales",
      icon: "compass",
      link: {
        label: "Agendar visita guiada",
        href: "https://wa.me/5492616843330?text=Hola!%20Quiero%20coordinar%20una%20visita%20al%20showroom%20de%20Chacras",
      },
    },
  },
];

interface HeroSliderProps {
  variant: "practica" | "premium";
}

export default function HeroSlider({ variant }: HeroSliderProps) {
  const slides = variant === "practica" ? PRACTICA_SLIDES : PREMIUM_SLIDES;
  const isPractica = variant === "practica";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
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
          : "h-[88vh] sm:h-[92vh] bg-[#263527]"
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Carrusel principal"
    >
      {/* Background Images with cross-fade */}
      {slides.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[7000ms] ease-out ${
                isActive ? "scale-105" : "scale-100"
              }`}
              style={{
                backgroundImage: `url('${slide.bgImage}')`,
              }}
            />
            {/* Overlay Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slide.overlayGradient}`}
            />
          </div>
        );
      })}

      {/* Main Slide Content */}
      <div className="relative z-10 w-[90%] mx-auto h-full flex items-center justify-between">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          if (!isActive) return null;

          return (
            <div
              key={slide.id}
              className="w-full flex flex-col md:flex-row items-center justify-between gap-[4vh] md:gap-[3vw] text-white animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              {/* Left Column: Titles & CTAs */}
              <div className="space-y-[2vh] text-center md:text-left max-w-[85vw] md:max-w-[55vw]">
                {/* Tag */}
                <span
                  className={`inline-block text-[2.8vw] sm:text-[1.3vw] lg:text-[0.75vw] uppercase tracking-[0.25em] font-bold border-b pb-[0.4vh] ${
                    isPractica
                      ? "text-[#f6ad55] border-[#c25e1a]"
                      : "text-[#a7f3d0] border-[#a7f3d0]/30"
                  }`}
                >
                  {slide.tag}
                </span>

                {/* Heading */}
                <h1 className="font-heading text-[8vw] sm:text-[5.5vw] lg:text-[4.2vw] font-bold tracking-tight uppercase leading-[1.1] text-white">
                  {slide.title} <br />
                  <span
                    className={`italic font-serif font-normal ${
                      isPractica ? "text-gray-100" : "text-[#d1fae5]"
                    }`}
                  >
                    {slide.titleItalic}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-[3.6vw] sm:text-[1.8vw] lg:text-[1.1vw] font-light text-gray-200 max-w-[75vw] md:max-w-[48vw] leading-relaxed">
                  {slide.description}
                </p>

                {/* CTAs */}
                <div className="pt-[1.5vh] flex flex-col sm:flex-row items-center justify-center md:justify-start gap-[1.5vh] sm:gap-[1vw]">
                  <Link
                    href={slide.primaryCta.href}
                    className={`w-full sm:w-auto inline-flex items-center justify-center text-[3.6vw] sm:text-[1.4vw] lg:text-[0.8vw] uppercase font-bold tracking-widest px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] transition-all duration-300 shadow-xl ${
                      isPractica
                        ? "bg-[#c25e1a] text-white hover:bg-[#a94f13]"
                        : "bg-white text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    <span>{slide.primaryCta.label}</span>
                    <ArrowRight className="w-[4vw] sm:w-[1.8vw] lg:w-[1vw] h-[4vw] sm:h-[1.8vw] lg:h-[1vw] ml-[1vw] sm:ml-[0.5vw]" />
                  </Link>

                  {slide.secondaryCta && (
                    slide.secondaryCta.isExternal ? (
                      <a
                        href={slide.secondaryCta.href}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-full sm:w-auto inline-flex items-center justify-center bg-transparent border text-white text-[3.6vw] sm:text-[1.4vw] lg:text-[0.8vw] uppercase font-semibold tracking-widest px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-white/10 transition-all duration-300 ${
                          isPractica ? "border-[#f6ad55]" : "border-white"
                        }`}
                      >
                        {slide.secondaryCta.label}
                      </a>
                    ) : (
                      <Link
                        href={slide.secondaryCta.href}
                        className={`w-full sm:w-auto inline-flex items-center justify-center bg-transparent border text-white text-[3.6vw] sm:text-[1.4vw] lg:text-[0.8vw] uppercase font-semibold tracking-widest px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-white/10 transition-all duration-300 ${
                          isPractica ? "border-[#f6ad55]" : "border-white"
                        }`}
                      >
                        {slide.secondaryCta.label}
                      </Link>
                    )
                  )}
                </div>
              </div>

              {/* Right Column: Dynamic Badge or Advisory Box */}
              {slide.badge && (
                <div className="flex-shrink-0 w-full sm:w-auto flex flex-col items-center md:items-end space-y-[1vh]">
                  {isPractica ? (
                    /* Práctica Style Badge */
                    <div className="bg-[#dcfce7] border border-[#86efac] text-[#14532d] rounded-[2vw] sm:rounded-[1vw] lg:rounded-[0.6vw] p-[4vw] sm:p-[2vw] lg:p-[1.4vw] flex items-center space-x-[3vw] sm:space-x-[1.2vw] shadow-2xl">
                      <div className="w-[10vw] sm:w-[4vw] lg:w-[2.6vw] h-[10vw] sm:h-[4vw] lg:h-[2.6vw] rounded-full bg-[#15803d] text-white flex items-center justify-center flex-shrink-0">
                        {slide.badge.icon === "zap" ? (
                          <Zap className="w-[5vw] sm:w-[2vw] lg:w-[1.3vw] h-[5vw] sm:h-[2vw] lg:h-[1.3vw] fill-white" />
                        ) : slide.badge.icon === "shield" ? (
                          <ShieldCheck className="w-[5vw] sm:w-[2vw] lg:w-[1.3vw] h-[5vw] sm:h-[2vw] lg:h-[1.3vw]" />
                        ) : (
                          <Sparkles className="w-[5vw] sm:w-[2vw] lg:w-[1.3vw] h-[5vw] sm:h-[2vw] lg:h-[1.3vw]" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-heading font-bold text-[3.8vw] sm:text-[1.8vw] lg:text-[1.1vw] tracking-wide text-[#14532d]">
                          {slide.badge.title}
                        </p>
                        <p className="text-[2.6vw] sm:text-[1.1vw] lg:text-[0.75vw] text-[#166534] font-medium">
                          {slide.badge.subtitle}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Premium / Interiorismo Advisory Box */
                    <div className="max-w-[85vw] md:max-w-[32vw] text-center md:text-left space-y-[1.5vh] bg-black/35 backdrop-blur-md p-[4vw] sm:p-[2vw] rounded-[1.5vw] sm:rounded-[0.6vw] border border-white/15 shadow-2xl">
                      <div className="flex items-center justify-center md:justify-start space-x-[1.5vw] sm:space-x-[0.6vw]">
                        <div className="w-[7vw] sm:w-[2.8vw] lg:w-[1.8vw] h-[7vw] sm:h-[2.8vw] lg:h-[1.8vw] rounded-full bg-[#a7f3d0]/20 text-[#a7f3d0] flex items-center justify-center flex-shrink-0 border border-[#a7f3d0]/30">
                          {slide.badge.icon === "compass" ? (
                            <Compass className="w-[4vw] sm:w-[1.5vw] lg:w-[1vw] h-[4vw] sm:h-[1.5vw] lg:h-[1vw]" />
                          ) : (
                            <Sparkles className="w-[4vw] sm:w-[1.5vw] lg:w-[1vw] h-[4vw] sm:h-[1.5vw] lg:h-[1vw]" />
                          )}
                        </div>
                        <p className="font-heading font-bold text-[3.8vw] sm:text-[1.6vw] lg:text-[1vw] tracking-wide text-white">
                          {slide.badge.title}
                        </p>
                      </div>
                      <p className="text-[3.2vw] sm:text-[1.4vw] lg:text-[0.88vw] text-gray-200 font-light leading-relaxed">
                        {slide.badge.subtitle}
                      </p>
                      {slide.badge.link && (
                        <a
                          href={slide.badge.link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-[3vw] sm:text-[1.3vw] lg:text-[0.8vw] text-[#a7f3d0] hover:text-white font-semibold uppercase tracking-wider transition-colors pt-[0.4vh]"
                        >
                          <span>{slide.badge.link.label}</span>
                          <ArrowRight className="w-[3.5vw] sm:w-[1.4vw] lg:w-[0.9vw] h-[3.5vw] sm:h-[1.4vw] lg:h-[0.9vw] ml-[0.5vw]" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Diapositiva anterior"
        className="absolute left-[2vw] sm:left-[3vw] top-1/2 -translate-y-1/2 z-20 w-[9vw] sm:w-[3.2vw] lg:w-[2.6vw] h-[9vw] sm:h-[3.2vw] lg:h-[2.6vw] rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all hover:scale-110 cursor-pointer shadow-lg"
      >
        <ChevronLeft className="w-[5vw] sm:w-[1.8vw] lg:w-[1.4vw] h-[5vw] sm:h-[1.8vw] lg:h-[1.4vw]" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Diapositiva siguiente"
        className="absolute right-[2vw] sm:right-[3vw] top-1/2 -translate-y-1/2 z-20 w-[9vw] sm:w-[3.2vw] lg:w-[2.6vw] h-[9vw] sm:h-[3.2vw] lg:h-[2.6vw] rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all hover:scale-110 cursor-pointer shadow-lg"
      >
        <ChevronRight className="w-[5vw] sm:w-[1.8vw] lg:w-[1.4vw] h-[5vw] sm:h-[1.8vw] lg:h-[1.4vw]" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-[2.5vh] left-1/2 -translate-x-1/2 z-20 flex items-center space-x-[1.5vw] sm:space-x-[0.6vw]">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir a diapositiva ${idx + 1}`}
              className={`h-[1vh] sm:h-[0.6vh] rounded-full transition-all duration-300 cursor-pointer ${
                isActive
                  ? isPractica
                    ? "w-[6vw] sm:w-[2.2vw] bg-[#f6ad55]"
                    : "w-[6vw] sm:w-[2.2vw] bg-[#a7f3d0]"
                  : "w-[2vw] sm:w-[0.6vw] bg-white/40 hover:bg-white/70"
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}
