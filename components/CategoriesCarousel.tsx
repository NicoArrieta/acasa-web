"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/data";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoriesCarouselProps {
  theme?: "original" | "economica";
}

export default function CategoriesCarousel({
  theme = "original",
}: CategoriesCarouselProps) {
  const isEconomica = theme === "economica";
  const [visibleCount, setVisibleCount] = useState(3);
  const originalLength = CATEGORIES.length;

  // Triplicate array to allow completely seamless infinite loop in both directions
  const items = [...CATEGORIES, ...CATEGORIES, ...CATEGORIES];

  // Start at the middle set
  const [currentIndex, setCurrentIndex] = useState(originalLength);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Touch swipe support for mobile
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);

  // Responsive visible count tracking
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  // Next slide
  const handleNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  // Prev slide
  const handlePrev = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  // When transition completes, check if we need to silently reset
  const handleTransitionEnd = () => {
    if (currentIndex >= originalLength * 2) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev - originalLength);
    } else if (currentIndex < originalLength) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev + originalLength);
    }
  };

  // Re-enable transitions on next tick after silent reset
  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  // Autoplay forward every 6 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX !== null) {
      setTouchDeltaX(e.touches[0].clientX - touchStartX);
    }
  };

  const handleTouchEnd = () => {
    if (touchDeltaX > 45) {
      handlePrev();
    } else if (touchDeltaX < -45) {
      handleNext();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsPaused(false);
  };

  return (
    <section id="areas" className="w-[90%] mx-auto pt-[4vh] pb-[6vh]">
      {/* Header with Title and Horizontal Rule */}
      <div className="mb-[3vh]">
        <div className="flex items-center space-x-[2vw] sm:space-x-[1.5vw]">
          <h2 className="font-heading text-[5.5vw] sm:text-[3.5vw] lg:text-[2.4vw] font-bold uppercase tracking-wider text-black whitespace-nowrap">
            AREAS PARA TU HOGAR
          </h2>
          <div
            className={`flex-1 h-[2px] ${
              isEconomica ? "bg-[#c25e1a]" : "bg-black"
            }`}
          />
        </div>
        <p
          className={`text-[3.4vw] sm:text-[1.8vw] lg:text-[1.1vw] italic font-serif mt-[0.5vh] ${
            isEconomica ? "text-[#b3531b]" : "text-gray-500"
          }`}
        >
          Todo para tu hogar.
        </p>
      </div>

      {/* Carousel Container */}
      <div
        className="relative group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          aria-label="Anterior"
          className={`absolute -left-[2.5vw] sm:-left-[1.2vw] top-[40%] -translate-y-1/2 z-20 w-[9vw] h-[9vw] sm:w-[3.2vw] sm:h-[3.2vw] lg:w-[2.8vw] lg:h-[2.8vw] min-w-[36px] min-h-[36px] text-white rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm ${
            isEconomica
              ? "bg-[#c25e1a]/80 hover:bg-[#c25e1a]"
              : "bg-black/60 hover:bg-black"
          }`}
        >
          <ChevronLeft className="w-[4.5vw] h-[4.5vw] sm:w-[1.8vw] sm:h-[1.8vw] lg:w-[1.6vw] lg:h-[1.6vw] min-w-[20px] min-h-[20px]" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          aria-label="Siguiente"
          className={`absolute -right-[2.5vw] sm:-right-[1.2vw] top-[40%] -translate-y-1/2 z-20 w-[9vw] h-[9vw] sm:w-[3.2vw] sm:h-[3.2vw] lg:w-[2.8vw] lg:h-[2.8vw] min-w-[36px] min-h-[36px] text-white rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm ${
            isEconomica
              ? "bg-[#c25e1a]/80 hover:bg-[#c25e1a]"
              : "bg-black/60 hover:bg-black"
          }`}
        >
          <ChevronRight className="w-[4.5vw] h-[4.5vw] sm:w-[1.8vw] sm:h-[1.8vw] lg:w-[1.6vw] lg:h-[1.6vw] min-w-[20px] min-h-[20px]" />
        </button>

        {/* Carousel Viewport */}
        <div className="overflow-hidden w-full">
          <div
            onTransitionEnd={handleTransitionEnd}
            className="flex gap-[3vw] sm:gap-[1.5vw]"
            style={{
              transform:
                visibleCount === 1
                  ? `translateX(calc(-${currentIndex} * (100% + 3vw)))`
                  : visibleCount === 2
                  ? `translateX(calc(-${currentIndex} * ((100% - 1.5vw) / 2 + 1.5vw)))`
                  : `translateX(calc(-${currentIndex} * ((100% - 3vw) / 3 + 1.5vw)))`,
              transition: isTransitioning
                ? "transform 1400ms cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
            }}
          >
            {items.map((cat, idx) => (
              <div
                key={`${cat.id}-${idx}`}
                className={`flex-shrink-0 flex flex-col ${
                  visibleCount === 1
                    ? "w-full"
                    : visibleCount === 2
                    ? "w-[calc((100%-1.5vw)/2)]"
                    : "w-[calc((100%-3vw)/3)]"
                }`}
              >
                {/* Image card with rounded corners */}
                <Link
                  href={`/productos?categoria=${cat.slug}`}
                  className="block relative aspect-[4/3.2] w-full rounded-[2.5vw] sm:rounded-[1.6vw] lg:rounded-[1.2vw] overflow-hidden bg-gray-100 group/card shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={cat.image || "/placeholder.jpg"}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out"
                  />
                </Link>

                {/* Info below image */}
                <div className="mt-[1.5vh] text-left">
                  <h3 className="font-heading font-bold text-[4.2vw] sm:text-[2.2vw] lg:text-[1.4vw] uppercase tracking-wider text-black">
                    {cat.name}
                  </h3>
                  <Link
                    href={`/productos?categoria=${cat.slug}`}
                    className="inline-block mt-[1vh] border border-black rounded-[1vw] sm:rounded-[0.5vw] lg:rounded-[0.4vw] px-[4.5vw] sm:px-[2.5vw] lg:px-[1.8vw] py-[0.9vh] sm:py-[0.7vh] text-[3.2vw] sm:text-[1.4vw] lg:text-[0.85vw] font-medium text-black hover:bg-black hover:text-white transition-all"
                  >
                    Ver todo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
