"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, ScanFace, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/use-products";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocaleText } from "@/hooks/use-locale-text";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [image, setImage] = useState(0);
  const [question, setQuestion] = useState("");
  const t = useLocaleText("product");
  const query = useProducts();
  const product = query.data?.find((item) => item.id === params.id);
  const faceLabels: Record<string, string> = {
    ovalado: t("faceOval"),
    cuadrado: t("faceSquare"),
    redondo: t("faceRound"),
    corazón: t("faceHeart"),
  };
  const colorLabels: Record<string, string> = {
    "Verde oliva": t("colorOlive"),
    Miel: t("colorHoney"),
    "Negro mate": t("colorBlack"),
    Vino: t("colorWine"),
    "Oliva oscuro": t("colorDarkOlive"),
    Ámbar: t("colorAmber"),
  };
  if (query.isPending) return <main className="container-width grid gap-10 py-8 lg:grid-cols-2"><Skeleton className="aspect-square rounded-3xl" /><div className="space-y-4 pt-8"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-12 w-2/3" /><Skeleton className="h-8 w-1/3" /><Skeleton className="h-48 w-full rounded-2xl" /></div></main>;
  if (query.isError) return <main className="container-width py-10"><Card><ErrorState onRetry={() => void query.refetch()} /></Card></main>;
  if (!product) return <main className="container-width py-20 text-center"><h1 className="text-2xl font-semibold">{t("notFound")}</h1><Link href="/shop" className="mt-4 inline-block text-sm text-forest underline">{t("back")}</Link></main>;
  return <main className="container-width py-8 sm:py-12">
    <Link href="/shop" className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-ink"><ArrowLeft size={14} /> {t("back")}</Link>
    <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
      <div><div className="relative flex aspect-[1.05] items-center justify-center overflow-hidden rounded-3xl glass-gradient">{product.images?.[0] ? <img src={product.images[Math.min(image, product.images.length - 1)]} alt={product.name} className="h-full w-full object-cover" /> : <div className="transition-transform duration-500" style={{ transform: `rotate(${(image % 12 - 6) * 1.3}deg) scale(${1 + Math.abs(image % 12 - 6) * .012})` }}><div className={`product-shape scale-110 glasses-color-${product.color}`}><div className="product-lens" /><div className="product-lens" /></div></div>}<div className="absolute left-5 top-5 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-semibold">{product.images?.length ? t("gallery", { current: String(Math.min(image + 1, product.images.length)).padStart(2, "0"), total: product.images.length }) : t("view360", { current: String(image + 1).padStart(2, "0") })}</div>{!product.images?.length && <button aria-label={t("drag360")} className="absolute inset-0" onClick={() => setImage((current) => (current + 1) % 24)} />}</div>{product.images && product.images.length > 1 ? <div className="mt-3 flex gap-2">{product.images.map((src, index) => <button type="button" key={`${src.slice(0, 64)}-${index}`} aria-label={`${t("gallery", { current: index + 1, total: product.images?.length ?? 0 })}`} onClick={() => setImage(index)} className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${image === index ? "border-forest" : "border-transparent"}`}><img src={src} alt="" className="h-full w-full object-cover" /></button>)}</div> : !product.images?.length && <><input aria-label={t("drag360")} type="range" min="0" max="23" value={image} onChange={(event) => setImage(Number(event.target.value))} className="mt-4 w-full accent-forest" /><p className="text-center text-[11px] text-muted">{t("drag360")}</p></>}</div>
      <div className="py-2"><p className="eyebrow text-forest">{t("collection", { material: product.material })}</p><div className="mt-2 flex items-center justify-between"><h1 className="text-4xl font-semibold tracking-tight">{product.name}</h1><button aria-label={t("favorite")} onClick={() => toast.success(t("saved"))} className="flex h-10 w-10 items-center justify-center rounded-full border border-line"><Heart size={17} /></button></div><p className="mt-2 text-sm text-muted">{product.subtitle}</p><p className="mt-5 text-xl font-semibold">{formatCurrency(product.price)} <span className="text-xs font-normal text-muted">{t("iva")}</span></p><p className="mt-5 max-w-lg whitespace-pre-line text-sm leading-6 text-muted">{product.description || product.subtitle}</p>
        <div className="mt-6 rounded-2xl border border-line bg-white p-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold">{t("color", { color: colorLabels[product.colorName] ?? product.colorName })}</span><span className={`h-6 w-6 rounded-full border-2 border-white shadow ${product.color === "olive" ? "bg-[#586a56]" : product.color === "honey" ? "bg-[#b0804d]" : product.color === "burgundy" ? "bg-[#744b50]" : "bg-[#303432]"}`} /></div><div className="mt-5 grid grid-cols-4 gap-3 border-t border-line pt-4 text-center">{[{ n: t("lensMeasure"), v: "52 mm" }, { n: t("bridge"), v: "18 mm" }, { n: t("temple"), v: "145 mm" }, { n: t("height"), v: "43 mm" }].map((measure) => <div key={measure.n}><p className="text-xs font-semibold">{measure.v}</p><p className="mt-1 text-[10px] text-muted">{measure.n}</p></div>)}</div></div>
        <div className="mt-5 flex gap-2 rounded-xl bg-[#f5f2ed] p-3 text-xs leading-5 text-forest"><Check size={16} className="mt-0.5 shrink-0" /><span>{product.maxSphere ? t("compatibility", { sphere: product.maxSphere.toFixed(2) }) : t("compatibilityDefault")} <Link href={`/configure/${product.id}`} className="underline">{t("prescription")}</Link></span></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2"><Link href={`/try-on/${product.id}`} className="flex h-12 items-center justify-center gap-2 rounded-full border border-ink text-sm font-semibold transition hover:bg-white"><ScanFace size={17} /> {t("tryOn")}</Link><Link href={`/configure/${product.id}`} className="flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-white transition hover:bg-forest">{t("configure")} <ArrowRight size={16} /></Link></div>
        <div className="mt-6 flex gap-5 border-t border-line pt-5 text-[11px] text-muted"><span className="flex items-center gap-2"><Truck size={15} /> {t("shipping")}</span><span className="flex items-center gap-2"><ShieldCheck size={15} /> {t("warranty")}</span></div>
        <div className="mt-8 border-t border-line pt-5"><p className="text-xs font-semibold">{t("measures")}</p><p className="mt-2 text-xs text-muted">{t("sizeNote", { faces: product.faceShapes.map((face) => faceLabels[face] ?? face).join(", ") })}</p></div>
        <div className="mt-7 rounded-2xl border border-line bg-canvas p-4">
          <h2 className="text-sm font-semibold">{t("questionsTitle")}</h2>
          <p className="mt-1 text-xs text-muted">{t("questionsDescription")}</p>
          <label className="mt-3 block"><span className="sr-only">{t("questionPlaceholder")}</span><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={t("questionPlaceholder")} className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-forest" /></label>
          <a href={question.trim() ? `https://wa.me/573013761312?text=${encodeURIComponent(`Hola, vi el modelo ${product.name} y quiero saber ${question.trim()}`)}` : undefined} target="_blank" rel="noreferrer" onClick={(event) => { if (!question.trim()) { event.preventDefault(); toast.error(t("questionRequired")); } }} className="mt-3 flex h-10 items-center justify-center rounded-full bg-ink px-4 text-xs font-semibold text-white hover:bg-forest">{t("whatsapp")}</a>
        </div>
      </div>
    </div>
  </main>;
}
