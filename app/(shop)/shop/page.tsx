"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/shop/product-card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/store/use-store";
import { useLocaleText } from "@/hooks/use-locale-text";

const groups = [
  { key: "faceShapes" as const, label: "faces", values: ["ovalado", "cuadrado", "redondo", "corazón"], labels: "optionFaces" },
  { key: "materials" as const, label: "materials", values: ["Acetato", "Titanio", "Metal", "Madera"], labels: "optionMaterials" },
  { key: "styles" as const, label: "styles", values: ["Redonda", "Rectangular", "Cat eye", "Aviador"], labels: "optionStyles" },
  { key: "lensTypes" as const, label: "lenses", values: ["Progresivo", "Filtro azul", "Fotocromático", "Polarizado"], labels: "optionLenses" },
];

export default function ShopPage() {
  const t = useLocaleText("shop");
  const { filters, toggleFilter, clearFilters } = useStore();
  const [mobileFilters, setMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [onlyPrescription, setOnlyPrescription] = useState(false);
  const query = useProducts();
  const products = query.data ?? [];
  useEffect(() => setOnlyPrescription(new URLSearchParams(window.location.search).get("tipo") === "recetadas"), []);
  const filtered = useMemo(() => {
    const matches = products.filter((product) =>
      (!onlyPrescription || product.prescription) &&
      (!filters.faceShapes.length || filters.faceShapes.some((shape) => product.faceShapes.includes(shape))) &&
      (!filters.materials.length || filters.materials.includes(product.material)) &&
      (!filters.styles.length || filters.styles.includes(product.shape)) &&
      (!filters.lensTypes.length || filters.lensTypes.includes(product.lens)),
    );
    if (sortBy === "price-asc") return matches.sort((first, second) => first.price - second.price);
    if (sortBy === "price-desc") return matches.sort((first, second) => second.price - first.price);
    return matches.sort((first, second) => Number(Boolean(second.bestseller)) - Number(Boolean(first.bestseller)));
  }, [filters, onlyPrescription, products, sortBy]);

  const sidebar = <div className="space-y-7">{groups.map((group) => <div key={group.key}><h3 className="mb-3 text-sm font-semibold">{t(group.label)}</h3><div className="space-y-2.5">{group.values.map((value, index) => { const checked = filters[group.key].includes(value); return <button key={value} onClick={() => toggleFilter(group.key, value)} className="flex w-full items-center gap-2.5 text-left text-sm text-muted hover:text-ink"><span className={`flex h-4 w-4 items-center justify-center rounded border ${checked ? "border-forest bg-forest text-white" : "border-slate-300 bg-white"}`}>{checked && <Check size={11} />}</span><span className="capitalize">{t(`${group.labels}.${index}`)}</span></button>; })}</div></div>)}</div>;

  return <main className="container-width py-9 sm:py-14">
    <div className="mb-8"><p className="eyebrow text-forest">{t("eyebrow")}</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">{t("title")}</h1><p className="mt-2 text-sm text-muted">{t("description")}</p></div>
    <div className="mb-5 flex items-center justify-between border-b border-line pb-4"><p className="text-sm text-muted">{t("count", { count: query.isPending ? "…" : query.isError ? "—" : filtered.length })}</p><button className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm lg:hidden" onClick={() => setMobileFilters(true)}><SlidersHorizontal size={15} /> {t("filters")}</button><select aria-label={t("sortPopular")} value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="hidden rounded-full border border-line bg-white px-4 py-2 text-sm lg:block"><option value="popular">{t("sortPopular")}</option><option value="price-asc">{t("sortLow")}</option><option value="price-desc">{t("sortHigh")}</option></select></div>
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]"><aside className="hidden lg:block"><div className="mb-6 flex items-center justify-between"><h2 className="font-semibold">{t("filters")}</h2><button className="text-xs text-muted underline" onClick={clearFilters}>{t("clear")}</button></div>{sidebar}</aside><section>
      {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : query.isPending ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index}><Skeleton className="aspect-[.9] rounded-2xl" /><Skeleton className="mt-3 h-5 w-2/3" /></div>)}</div> : <><div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>{filtered.length === 0 && <div className="py-20 text-center text-sm text-muted">{t("noResults")} <button onClick={clearFilters} className="font-semibold text-forest underline">{t("clearFilters")}</button></div>}</>}
    </section></div>
    {mobileFilters && <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileFilters(false); }}><div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-6"><div className="mb-6 flex justify-between"><h2 className="text-lg font-semibold">{t("filters")}</h2><button onClick={() => setMobileFilters(false)} aria-label={t("clearFilters")}><X /></button></div>{sidebar}<button className="mt-8 h-11 w-full rounded-full bg-ink text-sm font-semibold text-white" onClick={() => setMobileFilters(false)}>{t("view", { count: filtered.length })}</button></div></div>}
  </main>;
}
