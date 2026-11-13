"use client";

import React from "react";
import Link from "next/link";

interface MostChosenItem {
  slug: string;
  title: string;
  image: string;
}

const DEFAULT_ITEMS: MostChosenItem[] = [
  {
    slug: "puff-cama",
    title: "PUFF CAMA",
    image: "https://acasatienda.com.ar/wp-content/uploads/2026/04/puf-cama.png",
  },
  {
    slug: "sofa-cama-but-carrito",
    title: "SOFA CAMA BUT CARRITO",
    image: "https://acasatienda.com.ar/wp-content/uploads/2026/04/but-carrito-1.png",
  },
  {
    slug: "sofa-cama-ital",
    title: "SOFA CAMA ITAL",
    image: "https://acasatienda.com.ar/wp-content/uploads/2026/04/ChatGPT-Image-17-jun-2026-09_14_31-1.png",
  },
];

interface MostChosenSectionProps {
  theme?: "original" | "economica";
  items?: MostChosenItem[];
  title?: string;
  subtitle?: string;
}

export default function MostChosenSection({
  theme = "original",
  items = DEFAULT_ITEMS,
  title = "LO MÁS ELEGIDO",
  subtitle = "Las piezas favoritas de quienes ya transformaron su hogar.",
}: MostChosenSectionProps) {
  const isEconomica = theme === "economica";

  return (
    <section
      className={`w-full py-[6vh] sm:py-[8vh] transition-colors duration-300 ${
        isEconomica ? "bg-[#251813] text-white" : "bg-black text-white"
      }`}
    >
      <div className="w-[90%] mx-auto">
        {/* Header with Title, Line and Subtitle */}
        <div className="mb-[3vh] sm:mb-[4vh]">
          <div className="flex items-center space-x-[2vw] sm:space-x-[1.5vw]">
            <h2 className="font-heading text-[5.5vw] sm:text-[3.5vw] lg:text-[2.4vw] font-bold uppercase tracking-wider text-white whitespace-nowrap">
              {title}
            </h2>
            <div
              className={`flex-1 h-[1.5px] ${
                isEconomica ? "bg-[#c25e1a]" : "bg-white/60"
              }`}
            />
          </div>
          <p
            className={`text-[3.2vw] sm:text-[1.8vw] lg:text-[1vw] font-light mt-[0.8vh] ${
              isEconomica ? "text-[#e8d5c8]" : "text-[#cccccc]"
            }`}
          >
            {subtitle}
          </p>
        </div>

        {/* Responsive Grid: 1 col on mobile, 3 cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[4vh] md:gap-[2vw]">
          {items.map((item) => (
            <div key={item.slug} className="flex flex-col text-left">
              {/* Crisp Pure White Square Container */}
              <Link
                href={`/producto/${item.slug}`}
                className="block bg-white aspect-square w-full p-[6vw] sm:p-[4vw] lg:p-[2vw] flex items-center justify-center overflow-hidden rounded-[2vw] sm:rounded-[1.2vw] lg:rounded-none group hover:opacity-95 transition-opacity shadow-sm"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </Link>

              {/* Title in White uppercase */}
              <h3 className="font-heading font-bold text-[4.2vw] sm:text-[2.2vw] lg:text-[1.4vw] uppercase tracking-wider text-white mt-[1.5vh] sm:mt-[2vh]">
                {item.title}
              </h3>

              {/* Outline Button: Ver detalle */}
              <div className="mt-[1vh] sm:mt-[1.2vh]">
                <Link
                  href={`/producto/${item.slug}`}
                  className={`inline-block text-[3.2vw] sm:text-[1.4vw] lg:text-[0.85vw] font-medium px-[4.5vw] sm:px-[2.5vw] lg:px-[1.8vw] py-[1vh] sm:py-[0.8vh] rounded-[1vw] sm:rounded-[0.5vw] lg:rounded-[0.4vw] transition-all ${
                    isEconomica
                      ? "border border-[#c25e1a] bg-[#251813] text-[#f6ad55] hover:bg-[#c25e1a] hover:text-white"
                      : "border border-white bg-black text-white hover:bg-white hover:text-black"
                  }`}
                >
                  Ver detalle
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
