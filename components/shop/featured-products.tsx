"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/shop/product-card";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedProducts() {
  const query = useProducts();
  const featured = query.data ?? [];

  return <section className="container-width py-16 sm:py-24">
    <div className="mb-7 flex items-end justify-between"><div><p className="eyebrow text-forest">La colección</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Para ver el mundo a tu manera</h2></div><Link href="/shop" className="hidden items-center gap-2 text-sm font-semibold sm:flex">Ver todo <ArrowRight size={16} /></Link></div>
    {query.isError ? <Card><ErrorState onRetry={() => void query.refetch()} /></Card>
      : query.isPending ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index}><Skeleton className="aspect-[.91] w-full rounded-2xl" /><Skeleton className="mt-3 h-5 w-2/3" /><Skeleton className="mt-2 h-4 w-1/3" /></div>)}</div>
        : featured.length === 0 ? <p className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-muted">Pronto encontrarás nuevas monturas en nuestra colección.</p>
          : <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
  </section>;
}
