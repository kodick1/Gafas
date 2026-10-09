"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InventoryProduct } from "@/lib/mock-products";
import { productsQueryKey } from "@/hooks/use-products";

async function createProduct(formData: FormData) {
  const response = await fetch("/api/products", { method: "POST", body: formData });
  if (!response.ok) {
    const result = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(result?.message ?? "No se pudo guardar el producto.");
  }
  const result = await response.json() as { product: InventoryProduct };
  return result.product;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: (product) => {
      queryClient.setQueryData<InventoryProduct[]>(productsQueryKey, (current) => [product, ...(current ?? []).filter((item) => item.id !== product.id)]);
      return Promise.all([
      queryClient.invalidateQueries({ queryKey: productsQueryKey }),
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] }),
      ]);
    },
  });
}
