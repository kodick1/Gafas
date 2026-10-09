import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";
import { useLocaleText } from "@/hooks/use-locale-text";

export function ProductCard({ product }: { product: Product }) {
  const t = useLocaleText("shop");
  const materialLabels = ["Acetato", "Titanio", "Metal", "Madera"];
  const materialIndex = materialLabels.indexOf(product.material);
  const material = materialIndex >= 0 ? t(`optionMaterials.${materialIndex}`) : product.material;
  return <Link href={`/product/${product.id}`} className="group">
    <div className="relative flex aspect-[.9] items-center justify-center overflow-hidden rounded-2xl glass-gradient">
      {product.images?.[0]
        ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        : <div className="product-shape scale-[.68] transition duration-500 group-hover:scale-[.78] sm:scale-90 sm:group-hover:scale-100"><div className={`product-lens glasses-color-${product.color}`} /><div className={`product-lens glasses-color-${product.color}`} /></div>}
      {product.bestseller && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold sm:left-4 sm:top-4">{t("bestSeller")}</span>}
      <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] text-muted">{material}</span>
      <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white opacity-0 transition group-hover:opacity-100"><ArrowUpRight size={15} /></span>
    </div>
    <div className="mt-3 flex items-start justify-between gap-2">
      <div className="min-w-0"><h3 className="truncate text-sm font-semibold">{product.name}</h3><p className="mt-1 truncate text-[11px] text-muted">{product.colorName}</p></div>
      <span className="shrink-0 text-xs font-semibold">{formatCurrency(product.price)}</span>
    </div>
  </Link>;
}
