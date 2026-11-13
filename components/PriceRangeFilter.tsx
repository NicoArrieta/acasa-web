"use client";

import React, { useState, useRef, useEffect } from "react";
import { formatCurrency } from "@/lib/store";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

interface PriceRangeFilterProps {
  minBound: number;
  maxBound: number;
  priceRange: [number, number];
  onChange: (range: [number, number]) => void;
  onReset: () => void;
  isActive: boolean;
}

export default function PriceRangeFilter({
  minBound,
  maxBound,
  priceRange,
  onChange,
  onReset,
  isActive,
}: PriceRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [minVal, maxVal] = priceRange;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Safe percentage calculation for slider track
  const safeRange = Math.max(1, maxBound - minBound);
  const leftPercent = Math.max(0, Math.min(100, ((minVal - minBound) / safeRange) * 100));
  const rightPercent = Math.max(0, Math.min(100, ((maxVal - minBound) / safeRange) * 100));
  const widthPercent = Math.max(0, rightPercent - leftPercent);

  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - 5000);
    onChange([Math.max(minBound, val), maxVal]);
  };

  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + 5000);
    onChange([minVal, Math.min(maxBound, val)]);
  };

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      onChange([Math.max(minBound, Math.min(val, maxVal)), maxVal]);
    }
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      onChange([minVal, Math.min(maxBound, Math.max(val, minVal))]);
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Subtle Trigger Button in Toolbar */}
      <div className="inline-flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`text-[3.4vw] sm:text-[1.4vw] lg:text-[0.8vw] border rounded-md px-[3vw] sm:px-[1.8vw] lg:px-[1vw] py-[1vh] sm:py-[0.8vh] flex items-center space-x-[1vw] sm:space-x-[0.5vw] transition-all cursor-pointer whitespace-nowrap ${
            isActive
              ? "bg-black text-white border-black font-medium shadow-sm"
              : "bg-white text-gray-700 border-gray-300 hover:border-black"
          }`}
        >
          <SlidersHorizontal className="w-[3.6vw] sm:w-[1.6vw] lg:w-[0.8vw] h-[3.6vw] sm:h-[1.6vw] lg:h-[0.8vw]" />
          <span>
            {isActive
              ? `${formatCurrency(minVal)} - ${formatCurrency(maxVal)}`
              : "Precio"}
          </span>
          <ChevronDown
            className={`w-[3.2vw] sm:w-[1.4vw] lg:w-[0.7vw] h-[3.2vw] sm:h-[1.4vw] lg:h-[0.7vw] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Quick Reset X if active */}
        {isActive && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            title="Quitar filtro de precio"
            className="ml-[1vw] sm:ml-[0.3vw] p-[0.8vw] sm:p-[0.3vw] text-gray-400 hover:text-black transition-colors"
          >
            <X className="w-[3.8vw] sm:w-[1.6vw] lg:w-[0.8vw] h-[3.8vw] sm:h-[1.6vw] lg:h-[0.8vw]" />
          </button>
        )}
      </div>

      {/* Floating Popover - Responsive for mobile & desktop */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+0.8vh)] w-[85vw] sm:w-[28vw] lg:w-[20vw] bg-white border border-gray-200 rounded-[2vw] sm:rounded-[1vw] lg:rounded-[0.4vw] shadow-[0_12px_32px_rgba(0,0,0,0.14)] p-[4vw] sm:p-[2vw] lg:p-[1.2vw] z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-[1vh] border-b border-gray-100">
            <span className="text-[3vw] sm:text-[1.3vw] lg:text-[0.68vw] uppercase tracking-wider text-gray-400 font-semibold">
              Rango de precio
            </span>
            {isActive && (
              <button
                type="button"
                onClick={onReset}
                className="text-[3vw] sm:text-[1.3vw] lg:text-[0.65vw] uppercase tracking-wider text-gray-500 hover:text-black underline transition-colors"
              >
                Restablecer
              </button>
            )}
          </div>

          {/* Current Values Display */}
          <div className="py-[1.2vh] sm:py-[1vh] text-center">
            <span className="font-heading font-bold text-[4.2vw] sm:text-[2vw] lg:text-[0.9vw] text-black">
              {formatCurrency(minVal)}
            </span>
            <span className="text-gray-400 mx-[1vw] sm:mx-[0.5vw] text-[3.8vw] sm:text-[1.6vw] lg:text-[0.8vw]">
              —
            </span>
            <span className="font-heading font-bold text-[4.2vw] sm:text-[2vw] lg:text-[0.9vw] text-black">
              {formatCurrency(maxVal)}
            </span>
          </div>

          {/* Minimalist Slider Track */}
          <div className="py-[2vh] sm:py-[1.2vh] px-[0.5vw]">
            <div className="relative w-full h-[0.5vh] sm:h-[0.3vh] bg-gray-200 rounded-full">
              {/* Highlight active range */}
              <div
                className="absolute h-full bg-black rounded-full"
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                }}
              />

              {/* Min range input */}
              <input
                type="range"
                min={minBound}
                max={maxBound}
                step={5000}
                value={minVal}
                onChange={handleMinSlider}
                aria-label="Precio mínimo"
                className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none accent-black [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-[5vw] sm:[&::-webkit-slider-thumb]:w-[2vw] lg:[&::-webkit-slider-thumb]:w-[1vw] [&::-webkit-slider-thumb]:h-[5vw] sm:[&::-webkit-slider-thumb]:h-[2vw] lg:[&::-webkit-slider-thumb]:h-[1vw] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-[5vw] sm:[&::-moz-range-thumb]:w-[2vw] lg:[&::-moz-range-thumb]:w-[1vw] [&::-moz-range-thumb]:h-[5vw] sm:[&::-moz-range-thumb]:h-[2vw] lg:[&::-moz-range-thumb]:h-[1vw] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-pointer"
              />

              {/* Max range input */}
              <input
                type="range"
                min={minBound}
                max={maxBound}
                step={5000}
                value={maxVal}
                onChange={handleMaxSlider}
                aria-label="Precio máximo"
                className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none accent-black [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-[5vw] sm:[&::-webkit-slider-thumb]:w-[2vw] lg:[&::-webkit-slider-thumb]:w-[1vw] [&::-webkit-slider-thumb]:h-[5vw] sm:[&::-webkit-slider-thumb]:h-[2vw] lg:[&::-webkit-slider-thumb]:h-[1vw] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-[5vw] sm:[&::-moz-range-thumb]:w-[2vw] lg:[&::-moz-range-thumb]:w-[1vw] [&::-moz-range-thumb]:h-[5vw] sm:[&::-moz-range-thumb]:h-[2vw] lg:[&::-moz-range-thumb]:h-[1vw] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>
          </div>

          {/* Minimal Inputs: Min & Max */}
          <div className="flex items-center justify-between gap-[2vw] sm:gap-[0.8vw] pt-[1vh]">
            <div className="flex-1 flex items-center border border-gray-200 rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] px-[2vw] sm:px-[1vw] lg:px-[0.6vw] py-[0.8vh] sm:py-[0.4vh] bg-gray-50 focus-within:border-black focus-within:bg-white">
              <span className="text-[3vw] sm:text-[1.2vw] lg:text-[0.65vw] text-gray-400 mr-[0.5vw] sm:mr-[0.2vw]">
                $
              </span>
              <input
                type="number"
                value={minVal}
                min={minBound}
                max={maxVal}
                step={5000}
                onChange={handleMinInput}
                className="w-full text-[3.4vw] sm:text-[1.4vw] lg:text-[0.72vw] bg-transparent outline-none text-black font-medium"
              />
            </div>
            <span className="text-gray-300 text-[3.4vw] sm:text-[1.4vw] lg:text-[0.7vw]">
              —
            </span>
            <div className="flex-1 flex items-center border border-gray-200 rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] px-[2vw] sm:px-[1vw] lg:px-[0.6vw] py-[0.8vh] sm:py-[0.4vh] bg-gray-50 focus-within:border-black focus-within:bg-white">
              <span className="text-[3vw] sm:text-[1.2vw] lg:text-[0.65vw] text-gray-400 mr-[0.5vw] sm:mr-[0.2vw]">
                $
              </span>
              <input
                type="number"
                value={maxVal}
                min={minVal}
                max={maxBound}
                step={5000}
                onChange={handleMaxInput}
                className="w-full text-[3.4vw] sm:text-[1.4vw] lg:text-[0.72vw] bg-transparent outline-none text-black font-medium"
              />
            </div>
          </div>

          {/* Subtle Quick Presets */}
          <div className="flex items-center justify-between pt-[1.5vh] sm:pt-[1.2vh] border-t border-gray-100 mt-[1.2vh] text-[3vw] sm:text-[1.3vw] lg:text-[0.65vw]">
            <button
              type="button"
              onClick={() => onChange([minBound, 300000])}
              className="text-gray-500 hover:text-black transition-colors"
            >
              &lt; $300k
            </button>
            <span className="text-gray-200">•</span>
            <button
              type="button"
              onClick={() => onChange([300000, 600000])}
              className="text-gray-500 hover:text-black transition-colors"
            >
              $300k - $600k
            </button>
            <span className="text-gray-200">•</span>
            <button
              type="button"
              onClick={() => onChange([600000, maxBound])}
              className="text-gray-500 hover:text-black transition-colors"
            >
              &gt; $600k
            </button>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full mt-[1.5vh] sm:mt-[1.2vh] bg-black text-white text-[3.4vw] sm:text-[1.4vw] lg:text-[0.7vw] uppercase tracking-wider font-semibold py-[1vh] sm:py-[0.6vh] rounded-[1vw] sm:rounded-[0.4vw] lg:rounded-[0.2vw] hover:bg-gray-800 transition-colors"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
