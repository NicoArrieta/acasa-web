import React from "react";
import SingleProductClient from "@/components/SingleProductClient";
import { INITIAL_PRODUCTS } from "@/lib/data";

export function generateStaticParams() {
  return INITIAL_PRODUCTS.map((p) => ({ slug: p.slug }));
}

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  return <SingleProductClient slug={params.slug} />;
}
