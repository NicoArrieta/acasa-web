"use client";

import React from "react";
import SplitHero from "@/components/SplitHero";

export default function HomePage() {
  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-black">
      {/* 100vh Split Screen Gateway: 50vw Línea Práctica / Compra Fácil & 50vw Línea Premium / Interiorismo */}
      <SplitHero />
    </div>
  );
}
