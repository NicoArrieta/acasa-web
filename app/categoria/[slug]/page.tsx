import React, { Suspense } from "react";
import { ProductsCatalog } from "@/app/productos/page";
import { CATEGORIES } from "@/lib/data";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <Suspense
      fallback={
        <div className="w-[90%] mx-auto p-[5vw] text-center text-[0.8vw]">
          Cargando categoría...
        </div>
      }
    >
      <ProductsCatalog initialCategory={params.slug} />
    </Suspense>
  );
}
