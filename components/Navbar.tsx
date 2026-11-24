"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CATEGORIES } from "@/lib/data";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Zap,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHome = pathname === "/";

  const isCompraFacilRoute = pathname.startsWith("/compra-facil") || pathname === "/practica";
  const isInteriorismoRoute = pathname.startsWith("/interiorismo") || pathname === "/premium";

  const [activeLine, setActiveLine] = useState<"practica" | "premium">("premium");

  useEffect(() => {
    if (isCompraFacilRoute) {
      setActiveLine("practica");
      try {
        localStorage.setItem("acasa_line", "practica");
      } catch (_) {}
    } else if (isInteriorismoRoute) {
      setActiveLine("premium");
      try {
        localStorage.setItem("acasa_line", "premium");
      } catch (_) {}
    } else {
      const qLinea = searchParams?.get("linea");
      if (qLinea === "practica") {
        setActiveLine("practica");
        try {
          localStorage.setItem("acasa_line", "practica");
        } catch (_) {}
      } else if (qLinea === "premium") {
        setActiveLine("premium");
        try {
          localStorage.setItem("acasa_line", "premium");
        } catch (_) {}
      } else {
        try {
          const stored = localStorage.getItem("acasa_line");
          if (stored === "practica" || stored === "premium") {
            setActiveLine(stored as "practica" | "premium");
          }
        } catch (_) {}
      }
    }
  }, [pathname, searchParams, isCompraFacilRoute, isInteriorismoRoute]);

  const isCompraFacil = isCompraFacilRoute || activeLine === "practica";
  const isWhiteHeader = isCompraFacil;

  const [showNavbar, setShowNavbar] = useState(!isHome);
  const { totalItems, setIsCartOpen } = useCart();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isHome) {
      setShowNavbar(true);
      return;
    }

    const handleScroll = () => {
      const threshold = window.innerHeight * 0.7;
      if (window.scrollY > threshold) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
        setIsMegaMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const toggleCategory = (slug: string) => {
    setExpandedCategory((prev) => (prev === slug ? null : slug));
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 250);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const lineaParam = isCompraFacil ? "&linea=practica" : "&linea=premium";
      window.location.href = `/productos?buscar=${encodeURIComponent(
        searchQuery.trim()
      )}${lineaParam}`;
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
          isWhiteHeader
            ? "bg-white text-black border-b border-gray-200 shadow-sm"
            : "bg-black text-white border-b border-[#222222] shadow-md"
        } ${
          showNavbar
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Top Header Row - 90% width */}
        <div className="w-[90%] mx-auto">
          <div className="flex items-center justify-between h-[10vh] min-h-[60px] max-h-[90px]">
            {/* 1. Logo with Subtle Brand Indicator */}
            <div className="flex-shrink-0 flex items-center space-x-[1.2vw] sm:space-x-[0.8vw]">
              <Link
                href="/"
                className="flex items-center"
              >
                <img
                  src={isWhiteHeader ? "/logo-tight.png" : "/logoAcasaTienda.webp"}
                  alt="Acasa Calidad y Diseño"
                  className="h-[5vh] min-h-[35px] max-h-[65px] w-auto object-contain transition-all"
                  onError={(e) => {
                    e.currentTarget.src = isWhiteHeader
                      ? "/logoAcasaTienda.webp"
                      : "https://acasatienda.com.ar/wp-content/uploads/2023/11/logoAcasaTienda.webp";
                  }}
                />
              </Link>

              {/* Indicador sutil de línea en el header */}
              {isCompraFacil ? (
                <div className="flex items-center space-x-[0.8vw] sm:space-x-[0.5vw]">
                  <div className="h-[2.2vh] w-[1px] bg-gray-300" />
                  <span className="text-[2.2vw] sm:text-[0.9vw] lg:text-[0.68vw] font-bold uppercase tracking-[0.22em] text-[#c25e1a]">
                    LÍNEA PRÁCTICA · COMPRA FÁCIL
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-[0.8vw] sm:space-x-[0.5vw]">
                  <div className="h-[2.2vh] w-[1px] bg-white/20" />
                  <span className="text-[2.2vw] sm:text-[0.9vw] lg:text-[0.68vw] font-semibold uppercase tracking-[0.22em] text-[#f39200]">
                    LÍNEA PERSONALIZADA · DISEÑO
                  </span>
                </div>
              )}
            </div>

            {/* 2. Desktop Navigation + Search */}
            <div className="hidden lg:flex items-center space-x-[1.8vw]">
              <nav className="flex items-center space-x-[1.6vw]">
                {/* Inicio Link (Lleva al inicio de la línea correspondiente) */}
                <Link
                  href={isCompraFacil ? "/compra-facil" : "/interiorismo"}
                  className={`transition-colors font-medium text-[0.9vw] ${
                    isWhiteHeader
                      ? "text-black hover:text-[#c25e1a]"
                      : "text-white hover:text-[#f39200]"
                  }`}
                >
                  Inicio
                </Link>

                {/* "Productos" link on click, reveals on hover in BOTH headers */}
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="py-[1vh]"
                >
                  <Link
                    href={
                      isCompraFacil
                        ? "/productos?linea=practica"
                        : "/productos?linea=premium"
                    }
                    onClick={() => setIsMegaMenuOpen(false)}
                    className={`inline-flex items-center transition-colors font-medium text-[0.9vw] ${
                      isWhiteHeader
                        ? "text-black hover:text-[#c25e1a]"
                        : "text-white hover:text-[#f39200]"
                    }`}
                  >
                    <span>Productos</span>
                    <span className="ml-[0.3vw] text-[0.65vw]">
                      {isMegaMenuOpen ? "▲" : "▼"}
                    </span>
                  </Link>
                </div>

                {/* Sucursales Link in BOTH headers (keeps active line header) */}
                <Link
                  href={
                    isCompraFacil
                      ? "/sucursales?linea=practica"
                      : "/sucursales?linea=premium"
                  }
                  className={`transition-colors font-medium text-[0.9vw] ${
                    isWhiteHeader
                      ? "text-black hover:text-[#c25e1a]"
                      : "text-white hover:text-[#f39200]"
                  }`}
                >
                  Sucursales
                </Link>

                {/* Switcher resaltado para alternar de línea */}
                {isCompraFacil ? (
                  <Link
                    href="/interiorismo"
                    onClick={() => {
                      setActiveLine("premium");
                      try {
                        localStorage.setItem("acasa_line", "premium");
                      } catch (_) {}
                    }}
                    className="px-[1vw] py-[0.55vh] rounded-full text-[0.82vw] font-bold uppercase tracking-wider bg-black text-white hover:bg-zinc-800 border border-black shadow-sm transition-all transform hover:scale-105 text-center"
                  >
                    Línea Personalizada
                  </Link>
                ) : (
                  <Link
                    href="/compra-facil"
                    onClick={() => {
                      setActiveLine("practica");
                      try {
                        localStorage.setItem("acasa_line", "practica");
                      } catch (_) {}
                    }}
                    className="px-[1vw] py-[0.55vh] rounded-full text-[0.82vw] font-bold uppercase tracking-wider bg-[#f39200] text-black hover:bg-[#e08500] shadow-sm transition-all transform hover:scale-105 text-center"
                  >
                    Línea Práctica
                  </Link>
                )}
              </nav>

              {/* Pill Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Buscar muebles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-[14vw] text-[0.78vw] rounded-full pl-[1vw] pr-[2.2vw] py-[0.6vh] outline-none transition-all ${
                    isWhiteHeader
                      ? "bg-gray-50 text-black border border-gray-300 placeholder:text-gray-400 focus:border-black"
                      : "bg-black text-white border border-white/60 placeholder:text-gray-500 focus:border-white"
                  }`}
                />
                <button
                  type="submit"
                  aria-label="Buscar"
                  className={`absolute right-[0.8vw] top-1/2 -translate-y-1/2 transition-colors ${
                    isWhiteHeader
                      ? "text-gray-600 hover:text-[#c25e1a]"
                      : "text-white hover:text-[#f39200]"
                  }`}
                >
                  <Search className="w-[0.85vw] h-[0.85vw]" />
                </button>
              </form>

              {/* Cart Icon */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className={`relative p-[0.4vw] transition-colors ${
                  isWhiteHeader
                    ? "text-black hover:text-[#c25e1a]"
                    : "text-white hover:text-[#f39200]"
                }`}
                aria-label="Ver Carrito"
              >
                <ShoppingBag className="w-[1.3vw] h-[1.3vw]" />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-[0.3vh] -right-[0.3vw] inline-flex items-center justify-center px-[0.4vw] py-[0.1vh] text-[0.65vw] font-bold leading-none rounded-full min-w-[1.1vw] ${
                      isWhiteHeader
                        ? "bg-[#c25e1a] text-white"
                        : "bg-[#f39200] text-black"
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile hamburger */}
            <div className="flex items-center space-x-[3vw] lg:hidden">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className={`relative p-[1vw] ${
                  isWhiteHeader ? "text-black" : "text-white"
                }`}
                aria-label="Carrito"
              >
                <ShoppingBag className="w-[6vw] h-[6vw]" />
                {totalItems > 0 && (
                  <span
                    className={`absolute top-0 right-0 inline-flex items-center justify-center px-[1.5vw] py-[0.2vh] text-[2.5vw] font-bold rounded-full ${
                      isWhiteHeader
                        ? "bg-[#c25e1a] text-white"
                        : "bg-[#f39200] text-black"
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-[1vw] ${
                  isWhiteHeader ? "text-black" : "text-white"
                }`}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-[6vw] h-[6vw]" />
                ) : (
                  <Menu className="w-[6vw] h-[6vw]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Mega Menu Columns (Catalog) - Hovering over "Productos" */}
        {isMegaMenuOpen && (
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`hidden lg:block absolute top-full left-0 w-full z-50 transition-all duration-150 ${
              isWhiteHeader
                ? "bg-white text-gray-900 border-t border-b border-gray-200 shadow-[0_25px_50px_rgba(0,0,0,0.18)]"
                : "bg-[#111111] text-white border-t border-b border-[#262626] shadow-[0_30px_60px_rgba(0,0,0,0.95)]"
            }`}
            style={{
              backgroundColor: isWhiteHeader ? "#ffffff" : "#111111",
              opacity: 1,
            }}
          >
            <div className="w-[90%] mx-auto py-[3.5vh]">
              <div className="grid grid-cols-7 gap-[2vw]">
                {CATEGORIES.map((category) => (
                  <div key={category.id} className="space-y-[1.2vh]">
                    <Link
                      href={
                        isCompraFacil
                          ? `/productos?categoria=${category.slug}&linea=practica`
                          : `/productos?categoria=${category.slug}&linea=premium`
                      }
                      onClick={() => setIsMegaMenuOpen(false)}
                      className={`font-heading font-bold text-[0.85vw] uppercase tracking-wider block transition-colors pb-[0.8vh] border-b ${
                        isWhiteHeader
                          ? "text-black border-gray-200 hover:text-[#c25e1a] hover:border-[#c25e1a]"
                          : "text-white border-[#262626] hover:text-[#f39200] hover:border-[#f39200]"
                      }`}
                    >
                      {category.name}
                    </Link>
                    <ul className="space-y-[0.7vh] pt-[0.4vh]">
                      {(category.subcategories?.length ?? 0) > 0 ? (
                        category.subcategories!.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={
                                isCompraFacil
                                  ? `/productos?categoria=${category.slug}&sub=${sub.slug}&linea=practica`
                                  : `/productos?categoria=${category.slug}&sub=${sub.slug}&linea=premium`
                              }
                              onClick={() => setIsMegaMenuOpen(false)}
                              className={`text-[0.78vw] block transition-all duration-150 transform hover:translate-x-1 ${
                                isWhiteHeader
                                  ? "text-gray-600 hover:text-[#c25e1a] hover:font-semibold"
                                  : "text-gray-400 hover:text-white hover:font-semibold"
                              }`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li>
                          <Link
                            href={
                              isCompraFacil
                                ? `/productos?categoria=${category.slug}&linea=practica`
                                : `/productos?categoria=${category.slug}&linea=premium`
                            }
                            onClick={() => setIsMegaMenuOpen(false)}
                            className={`text-[0.78vw] block transition-colors italic ${
                              isWhiteHeader
                                ? "text-gray-500 hover:text-[#c25e1a]"
                                : "text-gray-500 hover:text-white"
                            }`}
                          >
                            Ver productos
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom bar of Mega Menu */}
            <div
              className={`w-full py-[1.2vh] px-[5%] border-t flex items-center justify-between text-[0.75vw] ${
                isWhiteHeader
                  ? "bg-gray-50 border-gray-200 text-gray-600"
                  : "bg-black/60 border-[#222222] text-gray-400"
              }`}
            >
              <div className="flex items-center space-x-[1vw]">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {isCompraFacil
                    ? "LÍNEA PRÁCTICA · COMPRA FÁCIL Y ESTÁNDAR"
                    : "LÍNEA PREMIUM · COMPRA PERSONALIZADA Y DE DISEÑO"}
                </span>
                <span className="opacity-60">
                  {isCompraFacil
                    ? "Precios accesibles, modelos definidos y entrega rápida"
                    : "Muebles con carácter, piezas de autor y personalización"}
                </span>
              </div>
              <Link
                href={
                  isCompraFacil
                    ? "/productos?linea=practica"
                    : "/productos?linea=premium"
                }
                onClick={() => setIsMegaMenuOpen(false)}
                className={`font-semibold inline-flex items-center space-x-[0.3vw] transition-colors ${
                  isWhiteHeader
                    ? "text-[#c25e1a] hover:text-[#a04a11]"
                    : "text-[#f39200] hover:text-white"
                }`}
              >
                <span>Ver todo el catálogo</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        )}

        {/* 4. Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div
            className={`lg:hidden border-t px-[5vw] py-[3vh] space-y-[2vh] max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200 ${
              isWhiteHeader
                ? "bg-white border-gray-200 text-black"
                : "bg-zinc-950 border-zinc-800 text-white"
            }`}
          >
            {/* Active Line Indicator for Mobile */}
            <div
              className={`px-[4vw] py-[1.2vh] rounded-[1vw] flex items-center justify-between ${
                isWhiteHeader
                  ? "bg-gray-100 border border-gray-200"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <span
                className={`text-[2.6vw] uppercase tracking-widest font-semibold ${
                  isWhiteHeader ? "text-gray-600" : "text-gray-400"
                }`}
              >
                LÍNEA ACTUAL:
              </span>
              {isCompraFacil ? (
                <span className="text-[#c25e1a] text-[2.6vw] font-bold uppercase tracking-wider">
                  LÍNEA PRÁCTICA · COMPRA FÁCIL
                </span>
              ) : (
                <span className="text-[#f39200] text-[2.6vw] font-bold uppercase tracking-wider">
                  LÍNEA PERSONALIZADA · DISEÑO
                </span>
              )}
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar muebles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-[3.6vw] rounded-full pl-[4vw] pr-[10vw] py-[1.2vh] outline-none ${
                  isWhiteHeader
                    ? "bg-gray-100 text-black border border-gray-300 placeholder:text-gray-500"
                    : "bg-zinc-900 text-white border border-zinc-700 placeholder:text-gray-400"
                }`}
              />
              <button
                type="submit"
                className={`absolute right-[3vw] top-1/2 -translate-y-1/2 ${
                  isWhiteHeader ? "text-gray-600" : "text-zinc-400"
                }`}
              >
                <Search className="w-[4.5vw] h-[4.5vw]" />
              </button>
            </form>

            {/* Navigation Links */}
            <div
              className={`space-y-[1vh] border-b pb-[1.5vh] ${
                isWhiteHeader ? "border-gray-200" : "border-zinc-800"
              }`}
            >
              <Link
                href={isCompraFacil ? "/compra-facil" : "/interiorismo"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-[3.8vw] font-semibold uppercase tracking-wider py-[0.8vh] ${
                  isWhiteHeader ? "text-black" : "text-white"
                }`}
              >
                Inicio
              </Link>
              <Link
                href={
                  isCompraFacil
                    ? "/productos?linea=practica"
                    : "/productos?linea=premium"
                }
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-[3.8vw] font-semibold uppercase tracking-wider py-[0.8vh] ${
                  isWhiteHeader ? "text-[#c25e1a]" : "text-[#f39200]"
                }`}
              >
                Todos los Productos
              </Link>
              <Link
                href={
                  isCompraFacil
                    ? "/sucursales?linea=practica"
                    : "/sucursales?linea=premium"
                }
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-[3.8vw] font-semibold uppercase tracking-wider py-[0.8vh] ${
                  isWhiteHeader ? "text-gray-700" : "text-gray-300"
                }`}
              >
                Sucursales
              </Link>
              {isCompraFacil ? (
                <Link
                  href="/interiorismo"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveLine("premium");
                    try {
                      localStorage.setItem("acasa_line", "premium");
                    } catch (_) {}
                  }}
                  className="block text-center text-[3.8vw] font-bold uppercase tracking-wider py-[1.2vh] px-[4vw] rounded-full bg-black text-white hover:bg-zinc-800 transition-colors shadow-md mt-[1vh]"
                >
                  Línea Personalizada
                </Link>
              ) : (
                <Link
                  href="/compra-facil"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveLine("practica");
                    try {
                      localStorage.setItem("acasa_line", "practica");
                    } catch (_) {}
                  }}
                  className="block text-center text-[3.8vw] font-bold uppercase tracking-wider py-[1.2vh] px-[4vw] rounded-full bg-[#f39200] text-black hover:bg-[#e08500] transition-colors shadow-md mt-[1vh]"
                >
                  Línea Práctica
                </Link>
              )}
            </div>

            {/* Categories Accordion */}
            <div className="space-y-[1.2vh] pt-[1vh]">
              <span
                className={`text-[2.6vw] uppercase tracking-widest font-semibold block ${
                  isWhiteHeader ? "text-gray-500" : "text-gray-400"
                }`}
              >
                CATEGORÍAS DE PRODUCTOS
              </span>
              {CATEGORIES.map((cat) => {
                const isExpanded = expandedCategory === cat.slug;
                const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                return (
                  <div
                    key={cat.id}
                    className={`border-b pb-[0.8vh] ${
                      isWhiteHeader ? "border-gray-200" : "border-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between py-[0.6vh]">
                      <Link
                        href={
                          isCompraFacil
                            ? `/productos?categoria=${cat.slug}&linea=practica`
                            : `/productos?categoria=${cat.slug}&linea=premium`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`font-bold text-[3.6vw] uppercase tracking-wider transition-colors ${
                          isWhiteHeader
                            ? "text-black hover:text-[#c25e1a]"
                            : "text-white hover:text-[#f39200]"
                        }`}
                      >
                        {cat.name}
                      </Link>
                      {hasSubs && (
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat.slug)}
                          className={`p-[1.5vw] ${
                            isWhiteHeader
                              ? "text-gray-500 hover:text-black"
                              : "text-zinc-400 hover:text-white"
                          }`}
                          aria-label={`Expandir ${cat.name}`}
                        >
                          <ChevronDown
                            className={`w-[4.2vw] h-[4.2vw] transition-transform duration-200 ${
                              isExpanded
                                ? isWhiteHeader
                                  ? "rotate-180 text-[#c25e1a]"
                                  : "rotate-180 text-[#f39200]"
                                : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {hasSubs && isExpanded && (
                      <div className="grid grid-cols-2 gap-[2vw] pl-[3vw] pt-[1vh] pb-[1vh] animate-in fade-in duration-150">
                        {cat.subcategories!.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={
                              isCompraFacil
                                ? `/productos?categoria=${cat.slug}&sub=${sub.slug}&linea=practica`
                                : `/productos?categoria=${cat.slug}&sub=${sub.slug}&linea=premium`
                            }
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`text-[3.2vw] py-[0.6vh] ${
                              isWhiteHeader
                                ? "text-gray-600 hover:text-black"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Spacer so page content begins neatly below fixed header (except home gateway) */}
      {!isHome && (
        <div className="h-[10vh] min-h-[60px] max-h-[90px] w-full pointer-events-none" />
      )}
    </>
  );
}
