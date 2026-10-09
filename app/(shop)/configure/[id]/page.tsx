"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Glasses } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { formatCurrency } from "@/lib/utils";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocaleText } from "@/hooks/use-locale-text";

const lensOptions = [
  { id: "monofocal", surcharge: 0 },
  { id: "blue", surcharge: 85000 },
  { id: "photochromic", surcharge: 145000 },
  { id: "polarized", surcharge: 120000 },
  { id: "progressive", surcharge: 230000 },
];

export default function LensConfigurationPage() {
  const t = useLocaleText("configure");
  const params = useParams<{ id: string }>();
  const query = useProducts();
  const product = query.data?.find((item) => item.id === params.id);
  const [lensId, setLensId] = useState("monofocal");
  const [sphere, setSphere] = useState("");
  const addToCart = useStore((state) => state.addToCart);
  if (query.isPending) return <main className="container-width grid gap-6 py-12 lg:grid-cols-2"><Skeleton className="h-[520px] rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /></main>;
  if (query.isError) return <main className="container-width py-12"><Card><ErrorState onRetry={() => void query.refetch()} /></Card></main>;
  if (!product) return <main className="container-width py-20 text-center"><h1 className="text-2xl font-semibold">{t("notFound")}</h1><Link href="/shop" className="mt-4 inline-block text-sm text-forest underline">{t("backShop")}</Link></main>;
  const selectedLens = lensOptions.find((item) => item.id === lensId) ?? lensOptions[0];
  const sphereValue = Number(sphere);
  const incompatible = Boolean(product.maxSphere && sphere.trim() && Number.isFinite(sphereValue) && Math.abs(sphereValue) > product.maxSphere);

  return <main className="container-width py-9 sm:py-14">
    <Link href={`/product/${product.id}`} className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-muted"><ArrowLeft size={14} /> {t("back", { name: product.name })}</Link>
    <div className="mb-8"><p className="eyebrow text-forest">{t("step")}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h1><p className="mt-2 text-sm text-muted">{t("description")}</p></div>
    <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
      <Card className="p-5 sm:p-7"><h2 className="font-semibold">{t("lensType")}</h2><p className="mt-1 text-xs text-muted">{t("selectLens", { name: product.name })}</p><div className="mt-5 space-y-2">{lensOptions.map((option) => <button key={option.id} onClick={() => setLensId(option.id)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${lensId === option.id ? "border-forest bg-[#f5f2ed]" : "border-line hover:bg-canvas"}`}><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${lensId === option.id ? "border-forest bg-forest text-white" : "border-slate-300"}`}>{lensId === option.id && <Check size={12} />}</span><span className="min-w-0 flex-1"><strong className="block text-sm">{t(option.id)}</strong><small className="mt-1 block text-xs text-muted">{t(`${option.id}Description`)}</small></span><span className="whitespace-nowrap text-xs font-semibold">{option.surcharge ? `+${formatCurrency(option.surcharge)}` : t("included")}</span></button>)}</div>
        <div className="mt-6 border-t border-line pt-5"><label className="text-sm font-semibold">{t("sphereQuestion")}</label><p className="mt-1 text-xs text-muted">{t("sphereDescription")}</p><div className="mt-3 flex max-w-xs items-center gap-3"><input aria-label={t("sphere")} type="number" step="0.25" min="-20" max="20" placeholder="Ej. -2.00" value={sphere} onChange={(event) => setSphere(event.target.value)} className="h-10 w-36 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-forest" /><span className="text-xs text-muted">{t("diopters")}</span></div>{incompatible && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700">{t("incompatible", { name: product.name, sphere: product.maxSphere?.toFixed(2) ?? "0" })}</p>}</div>
      </Card>
      <Card className="h-fit p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-12 w-14 items-center justify-center rounded-xl bg-[#f5f2ed] text-forest"><Glasses size={23} /></span><span><strong className="block">{product.name}</strong><small className="mt-1 block text-xs text-muted">{product.colorName}</small></span></div><div className="mt-5 space-y-3 border-y border-line py-4 text-sm"><div className="flex justify-between"><span className="text-muted">{t("summaryFrame")}</span><span>{formatCurrency(product.price)}</span></div><div className="flex justify-between"><span className="text-muted">{t(selectedLens.id)}</span><span>{selectedLens.surcharge ? formatCurrency(selectedLens.surcharge) : t("included")}</span></div><div className="flex justify-between border-t border-line pt-3 font-semibold"><span>{t("estimatedTotal")}</span><span>{formatCurrency(product.price + selectedLens.surcharge)}</span></div></div>{incompatible ? <button type="button" disabled className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-white opacity-50">{t("correctCompatibility")} <ArrowRight size={15} /></button> : <Link href={`/checkout?product=${product.id}&lens=${lensId}`} onClick={addToCart} className="mt-5 flex h-11 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-white hover:bg-forest">{t("continue")} <ArrowRight size={15} /></Link>}<p className="mt-3 text-center text-[10px] leading-4 text-muted">{t("priceNote")}</p><Button className="mt-3 w-full" variant="ghost" size="sm" onClick={() => setSphere("")}>{t("clearPrescription")}</Button></Card>
    </div>
  </main>;
}
