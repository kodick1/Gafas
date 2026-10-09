"use client";

import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/lib/products";

export const productsQueryKey = ["products"] as const;

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("/api/products");
  if (!response.ok) {
    const result = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(result?.message ?? "No se pudieron cargar los productos.");
  }
  const result = await response.json() as { products: Product[] };
  return result.products.filter((product) => product.status === "active");
}

export function useProducts() {
  return useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchProducts,
  });
}
