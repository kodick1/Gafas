import { products as catalogProducts, type Product } from "@/lib/products";

export type ProductCategory = "sol" | "recetada" | "deportiva";
export type FrameMaterial = "acetato" | "titanio" | "metal" | "madera";

export type InventoryProduct = Product;

const storage = globalThis as typeof globalThis & { lumiereInventoryProducts?: InventoryProduct[] };
storage.lumiereInventoryProducts ??= [];
const existingProductIds = new Set(storage.lumiereInventoryProducts.map((product) => product.id));
storage.lumiereInventoryProducts = [
  ...catalogProducts.filter((product) => !existingProductIds.has(product.id)),
  ...storage.lumiereInventoryProducts,
];

export function getInventoryProducts() {
  return storage.lumiereInventoryProducts!;
}

export function addInventoryProduct(product: InventoryProduct) {
  storage.lumiereInventoryProducts = [product, ...getInventoryProducts()];
}

export function updateInventoryProduct(id: string, updates: Partial<InventoryProduct>) {
  const product = getInventoryProducts().find((item) => item.id === id);
  if (!product) return undefined;
  Object.assign(product, updates);
  return product;
}

export function removeInventoryProduct(id: string) {
  const products = getInventoryProducts();
  const product = products.find((item) => item.id === id);
  if (!product) return false;
  storage.lumiereInventoryProducts = products.filter((item) => item.id !== id);
  return true;
}
