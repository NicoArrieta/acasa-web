"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getStoredProducts, formatCurrency } from "@/lib/store";
import { CATEGORIES } from "@/lib/data";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import PriceRangeFilter from "@/components/PriceRangeFilter";
import { Search, X, RotateCcw } from "lucide-react";

interface ProductsCatalogProps {
  initialCategory?: string;
}

export function ProductsCatalog({ initialCategory }: ProductsCatalogProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("categoria") || initialCategory || "todas";
  const subcategoryParam = searchParams.get("sub") || "";
  const queryParam = searchParams.get("buscar") || "";
  const lineaParam = searchParams.get("linea") || "";
  const minParam = searchParams.get("min");
  const maxParam = searchParams.get("max");

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(subcategoryParam);
  const [selectedLinea, setSelectedLinea] = useState<string>(lineaParam);
  const [searchTerm, setSearchTerm] = useState<string>(queryParam);
  const [sortBy, setSortBy] = useState<string>("featured");

  // Load products from store / localStorage
  useEffect(() => {
    setProducts(getStoredProducts());
  }, []);

  // Sync URL parameters
  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (subcategoryParam) setSelectedSubcategory(subcategoryParam);
    if (queryParam) setSearchTerm(queryParam);
    if (lineaParam) setSelectedLinea(lineaParam);
  }, [categoryParam, subcategoryParam, queryParam, lineaParam]);

  const activeCategoryObj = CATEGORIES.find((c) => c.slug === selectedCategory);

  // Compute overall min and max price bounds across catalog products
  const { minBound, maxBound } = useMemo(() => {
    if (!products || products.length === 0) {
      return { minBound: 0, maxBound: 1500000 };
    }
    let min = Infinity;
    let max = -Infinity;
    products.forEach((p) => {
      const price = p.salePrice ?? p.regularPrice;
      if (price < min) min = price;
      if (price > max) max = price;
    });
    return {
      minBound: Math.floor(min / 10000) * 10000,
      maxBound: Math.ceil(max / 10000) * 10000,
    };
  }, [products]);

  // Price range state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500000]);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState<boolean>(false);

  // Initialize or update priceRange once minBound and maxBound are ready
  useEffect(() => {
    if (minParam || maxParam) {
      const initialMin = minParam ? Number(minParam) : minBound;
      const initialMax = maxParam ? Number(maxParam) : maxBound;
      setPriceRange([initialMin, initialMax]);
      setIsPriceFilterActive(true);
    } else if (!isPriceFilterActive && minBound !== undefined && maxBound !== undefined) {
      setPriceRange([minBound, maxBound]);
    }
  }, [minBound, maxBound, minParam, maxParam]);

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
    setIsPriceFilterActive(true);
  };

  const handleResetPriceFilter = () => {
    setPriceRange([minBound, maxBound]);
    setIsPriceFilterActive(false);
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== "todas" && p.category !== selectedCategory) {
          return false;
        }
        // Subcategory filter
        if (selectedSubcategory && p.subcategory !== selectedSubcategory) {
          return false;
        }
        // Linea filter (practica vs premium)
        if (selectedLinea && p.linea && p.linea !== selectedLinea) {
          return false;
        }
        // Search query filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(term);
          const matchesDesc = p.description.toLowerCase().includes(term);
          const matchesSku = p.sku?.toLowerCase().includes(term);
          if (!matchesTitle && !matchesDesc && !matchesSku) return false;
        }
        // Price Range filter
        if (isPriceFilterActive) {
          const price = p.salePrice ?? p.regularPrice;
          if (price < priceRange[0] || price > priceRange[1]) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice ?? a.regularPrice;
        const priceB = b.salePrice ?? b.regularPrice;
        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "newest")
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [
    products,
    selectedCategory,
    selectedSubcategory,
    selectedLinea,
    searchTerm,
    sortBy,
    isPriceFilterActive,
    priceRange,
  ]);

  return (
    <div className="w-[90%] mx-auto py-[3vh] sm:py-[5vh]">
      {/* Clean Catalog Header */}
      <div className="mb-[2.5vh] sm:mb-[3vh]">
        <div className="flex items-center space-x-[2vw] sm:space-x-[0.8vw]">
          <h1 className="font-heading text-[6.5vw] sm:text-[3.8vw] lg:text-[2.5vw] font-bold uppercase tracking-wider text-black">
            {selectedCategory === "todas"
              ? selectedLinea === "practica"
                ? "LÍNEA PRÁCTICA"
                : selectedLinea === "premium"
                ? "LÍNEA PREMIUM"
                : "PRODUCTOS"
              : activeCategoryObj?.name || selectedCategory.toUpperCase()}
          </h1>
          {selectedCategory !== "todas" && (
            <span className="text-[2.8vw] sm:text-[1.3vw] lg:text-[0.75vw] bg-black text-white uppercase tracking-widest px-[2.5vw] sm:px-[1.2vw] lg:px-[0.7vw] py-[0.4vh] sm:py-[0.25vh] rounded-full font-semibold">
              Categoría
            </span>
          )}
        </div>
        <p className="text-[3.2vw] sm:text-[1.4vw] lg:text-[0.75vw] text-gray-500 mt-[0.5vh] uppercase tracking-widest">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "producto encontrado" : "productos encontrados"}
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col gap-[2vh] pb-[2vh] border-b border-gray-200">
        {/* Categories Pills - Smooth horizontal swipe on mobile */}
        <div className="flex items-center space-x-[2vw] sm:space-x-[0.5vw] overflow-x-auto pb-[1vh] scrollbar-none -mx-[5vw] px-[5vw] sm:mx-0 sm:px-0">
          <button
            onClick={() => {
              setSelectedCategory("todas");
              setSelectedSubcategory("");
            }}
            className={`text-[3.2vw] sm:text-[1.3vw] lg:text-[0.75vw] uppercase tracking-wider px-[3.8vw] sm:px-[2vw] lg:px-[1.1vw] py-[0.9vh] sm:py-[0.7vh] rounded-full whitespace-nowrap transition-all ${
              selectedCategory === "todas"
                ? "bg-black text-white font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setSelectedSubcategory("");
              }}
              className={`text-[3.2vw] sm:text-[1.3vw] lg:text-[0.75vw] uppercase tracking-wider px-[3.8vw] sm:px-[2vw] lg:px-[1.1vw] py-[0.9vh] sm:py-[0.7vh] rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? "bg-black text-white font-semibold"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Toolbar Controls: Search, Sort & Subtle Price Filter Popover */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-[1.5vh] sm:gap-[1vw]">
          {/* Search box - Full width on mobile */}
          <div className="relative w-full sm:w-[22vw] lg:w-[15vw]">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-[3.4vw] sm:text-[1.4vw] lg:text-[0.8vw] pl-[8vw] sm:pl-[3vw] lg:pl-[2vw] pr-[7vw] sm:pr-[2vw] py-[1vh] sm:py-[0.8vh] border border-gray-300 rounded-md outline-none focus:border-black bg-white"
            />
            <Search className="w-[3.8vw] sm:w-[1.6vw] lg:w-[0.85vw] h-[3.8vw] sm:h-[1.6vw] lg:h-[0.85vw] absolute left-[2.5vw] sm:left-[1vw] lg:left-[0.6vw] top-1/2 -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-[2.5vw] sm:right-[1vw] lg:right-[0.6vw] top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-[3.4vw] sm:text-[1.4vw] lg:text-[0.8vw]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort & Price Filter Controls */}
          <div className="flex items-center space-x-[2vw] sm:space-x-[0.8vw]">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none text-[3.4vw] sm:text-[1.4vw] lg:text-[0.8vw] border border-gray-300 rounded-md px-[3vw] sm:px-[1.8vw] lg:px-[1vw] py-[1vh] sm:py-[0.8vh] outline-none bg-white text-gray-700 focus:border-black cursor-pointer"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Menor Precio</option>
              <option value="price-desc">Mayor Precio</option>
              <option value="newest">Más Nuevos</option>
            </select>

            {/* Subtle Price Range Filter (Dropdown Popover) */}
            <PriceRangeFilter
              minBound={minBound}
              maxBound={maxBound}
              priceRange={priceRange}
              onChange={handlePriceRangeChange}
              onReset={handleResetPriceFilter}
              isActive={isPriceFilterActive}
            />
          </div>
        </div>
      </div>

      {/* Subcategories pills (if active category has subcategories) */}
      {activeCategoryObj?.subcategories && activeCategoryObj.subcategories.length > 0 && (
        <div className="flex items-center space-x-[1.8vw] sm:space-x-[0.5vw] py-[1.2vh] overflow-x-auto border-b border-gray-100 -mx-[5vw] px-[5vw] sm:mx-0 sm:px-0 scrollbar-none">
          <span className="text-[2.8vw] sm:text-[1.2vw] lg:text-[0.68vw] uppercase tracking-wider text-gray-400 font-semibold whitespace-nowrap">
            Subcategoría:
          </span>
          <button
            onClick={() => setSelectedSubcategory("")}
            className={`text-[2.8vw] sm:text-[1.2vw] lg:text-[0.68vw] px-[3vw] sm:px-[1.4vw] lg:px-[0.8vw] py-[0.5vh] sm:py-[0.35vh] rounded-[1vw] sm:rounded-[0.3vw] lg:rounded-[0.2vw] uppercase tracking-wider whitespace-nowrap ${
              selectedSubcategory === ""
                ? "bg-gray-800 text-white font-bold"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todas
          </button>
          {activeCategoryObj.subcategories.map((sub) => (
            <button
              key={sub.slug}
              onClick={() => setSelectedSubcategory(sub.slug)}
              className={`text-[2.8vw] sm:text-[1.2vw] lg:text-[0.68vw] px-[3vw] sm:px-[1.4vw] lg:px-[0.8vw] py-[0.5vh] sm:py-[0.35vh] rounded-[1vw] sm:rounded-[0.3vw] lg:rounded-[0.2vw] uppercase tracking-wider whitespace-nowrap ${
                selectedSubcategory === sub.slug
                  ? "bg-gray-800 text-white font-bold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Active Filter Chips: Linea and Price */}
      {(isPriceFilterActive || selectedLinea) && (
        <div className="flex flex-wrap items-center gap-[1.5vw] sm:gap-[0.8vw] pt-[1.2vh]">
          <span className="text-[2.8vw] sm:text-[1.2vw] lg:text-[0.68vw] text-gray-400 uppercase tracking-wider">
            Filtros activos:
          </span>

          {selectedLinea && (
            <button
              onClick={() => setSelectedLinea("")}
              className={`inline-flex items-center space-x-[1vw] sm:space-x-[0.4vw] text-white text-[3vw] sm:text-[1.2vw] lg:text-[0.7vw] font-medium px-[2.8vw] sm:px-[1.4vw] lg:px-[0.8vw] py-[0.4vh] sm:py-[0.3vh] rounded-full transition-colors ${
                selectedLinea === "practica" ? "bg-[#9d482c]" : "bg-[#2d4332]"
              }`}
            >
              <span>
                {selectedLinea === "practica"
                  ? "Línea Práctica · Compra fácil y estándar"
                  : "Línea Premium · Compra personalizada y de diseño"}
              </span>
              <span className="text-white/80 hover:text-white font-bold ml-[0.2vw]">✕</span>
            </button>
          )}

          {isPriceFilterActive && (
            <button
              onClick={handleResetPriceFilter}
              className="inline-flex items-center space-x-[1vw] sm:space-x-[0.4vw] bg-gray-100 hover:bg-gray-200 text-black text-[3vw] sm:text-[1.2vw] lg:text-[0.7vw] font-medium px-[2.8vw] sm:px-[1.4vw] lg:px-[0.8vw] py-[0.4vh] sm:py-[0.3vh] rounded-full transition-colors"
            >
              <span>
                Precio: {formatCurrency(priceRange[0])} — {formatCurrency(priceRange[1])}
              </span>
              <span className="text-gray-400 hover:text-black font-bold ml-[0.2vw]">✕</span>
            </button>
          )}
        </div>
      )}

      {/* Products Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-[8vh] sm:py-[10vh] bg-gray-50 rounded-[2vw] sm:rounded-[0.3vw] my-[3vh] px-[4vw]">
          <h3 className="font-heading font-bold text-[4.5vw] sm:text-[2vw] lg:text-[1.2vw] uppercase tracking-wider text-black mb-[1vh]">
            No se encontraron productos
          </h3>
          <p className="text-gray-500 text-[3.4vw] sm:text-[1.5vw] lg:text-[0.85vw] mb-[2.5vh] max-w-[80vw] sm:max-w-[40vw] lg:max-w-[30vw] mx-auto">
            {isPriceFilterActive
              ? `No hay productos en el rango de ${formatCurrency(
                  priceRange[0]
                )} a ${formatCurrency(priceRange[1])}${
                  selectedCategory !== "todas"
                    ? ` para ${activeCategoryObj?.name || selectedCategory}`
                    : ""
                }.`
              : "No hay productos que coincidan con los filtros seleccionados."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-[1.5vh] sm:gap-[1vw]">
            {isPriceFilterActive && (
              <button
                onClick={handleResetPriceFilter}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-[1vw] sm:space-x-[0.3vw] bg-black text-white text-[3.4vw] sm:text-[1.4vw] lg:text-[0.75vw] uppercase tracking-widest font-bold px-[5vw] sm:px-[2.5vw] lg:px-[1.5vw] py-[1.2vh] sm:py-[0.9vh] rounded-[1vw] sm:rounded-[0.3vw] lg:rounded-[0.2vw] hover:bg-gray-800 transition-colors"
              >
                <RotateCcw className="w-[3.5vw] sm:w-[1.4vw] lg:w-[0.7vw] h-[3.5vw] sm:h-[1.4vw] lg:h-[0.7vw]" />
                <span>Restablecer Precio</span>
              </button>
            )}
            <button
              onClick={() => {
                setSelectedCategory("todas");
                setSelectedSubcategory("");
                setSearchTerm("");
                handleResetPriceFilter();
              }}
              className="w-full sm:w-auto border border-black text-black text-[3.4vw] sm:text-[1.4vw] lg:text-[0.75vw] uppercase tracking-widest font-bold px-[5vw] sm:px-[2.5vw] lg:px-[1.5vw] py-[1.2vh] sm:py-[0.9vh] rounded-[1vw] sm:rounded-[0.3vw] lg:rounded-[0.2vw] hover:bg-black hover:text-white transition-colors"
            >
              Ver Todo el Catálogo
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[2.5vw] sm:gap-x-[2vw] lg:gap-x-[1.5vw] gap-y-[3vh] sm:gap-y-[4vh] mt-[3vh]">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="w-[90%] mx-auto p-[5vw] text-center text-[3.2vw] sm:text-[0.8vw]">
          Cargando catálogo...
        </div>
      }
    >
      <ProductsCatalog />
    </Suspense>
  );
}
