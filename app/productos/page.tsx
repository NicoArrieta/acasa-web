"use client";

import React, { Suspense } from "react";
import ProductsCatalog from "@/components/ProductsCatalog";

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
