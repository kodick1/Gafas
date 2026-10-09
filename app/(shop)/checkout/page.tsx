"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/use-store";
import { products } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";
import { DipMeasurer } from "@/components/DipMeasurer";
import { useLocaleText } from "@/hooks/use-locale-text";

export default function CheckoutPage() {
  const t = useLocaleText("checkout");
  const lensText = useLocaleText("configure");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [payment, setPayment] = useState("Wompi");
  const [complete, setComplete] = useState(false);
  const [configuredProduct, setConfiguredProduct] = useState("");
  const [configuredLens, setConfiguredLens] = useState("");
  const [manualDip, setManualDip] = useState("");
  const [dipOpen, setDipOpen] = useState(false);
  const cartCount = useStore((state) => state.cartCount);
  const selectedProduct = products.find((product) => product.id === configuredProduct);
  const lensPrices: Record<string, number> = { blue: 85000, photochromic: 145000, polarized: 120000, progressive: 230000 };
  const lensLabels: Record<string, string> = Object.fromEntries(["monofocal", "blue", "photochromic", "polarized", "progressive"].map((lens) => [lens, lensText(lens)]));
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setConfiguredProduct(params.get("product") ?? "");
    setConfiguredLens(params.get("lens") ?? "");
  }, []);
  useEffect(() => {
    if (!file?.type.startsWith("image/")) { setPreviewUrl(""); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const whatsappSummary = selectedProduct
    ? `Hola Lumiere_Optique, quiero finalizar por WhatsApp: ${selectedProduct.name} (${selectedProduct.colorName}), lentes ${lensLabels[configuredLens] ?? "Monofocal"}.`
    : `Hola Lumiere_Optique, quiero finalizar por WhatsApp. Mi carrito tiene ${cartCount} montura${cartCount === 1 ? "" : "s"}.`;
  const whatsappUrl = `https://wa.me/573013761312?text=${encodeURIComponent(whatsappSummary)}`;
  return <main className="container-width py-10 sm:py-14">
    <p className="eyebrow text-forest">{t("step")}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{t("title")}</h1><p className="mt-2 text-sm text-muted">{t("description")}</p>
    {complete ? <Card className="mx-auto mt-10 max-w-xl p-8 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f2ed] text-forest"><ShieldCheck /></span><h2 className="mt-4 text-xl font-semibold">{t("success")}</h2><p className="mt-2 text-sm text-muted">{t("demo")}</p><Link href="/shop" className="mt-5 inline-block text-sm font-semibold text-forest underline">{t("backShop")}</Link></Card> : <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <Card className="p-5 sm:p-6"><div className="flex items-start gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f2ed] text-forest"><FileText size={17} /></span><div><h2 className="font-semibold">{t("prescription")}</h2><p className="mt-1 text-xs text-muted">{t("prescriptionDescription")}</p></div></div>
          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-canvas p-4 hover:border-forest"><input className="sr-only" type="file" accept="image/*,.pdf" onChange={(event) => { const selected = event.target.files?.[0] ?? null; setFile(selected); }} /><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest"><Upload size={16} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{file?.name ?? t("upload")}</strong><small className="mt-1 block text-xs text-muted">{file ? `${(file.size / 1024).toFixed(0)} KB · ${t("previewReady")}` : t("secureFile")}</small></span></label>
          {previewUrl && <img alt={t("prescriptionPreview")} src={previewUrl} className="mt-3 max-h-52 rounded-xl border border-line object-contain" />}
          <p className="mt-4 rounded-lg bg-[#f5f2ed] p-3 text-xs leading-5 text-muted">{t("ocr")}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">{[t("sphere"), t("cylinder"), t("axis"), t("addition"), t("dip")].map((label) => <label key={label} className="text-xs font-medium">{label}<Input aria-label={label} className="mt-1.5" placeholder={label === t("dip") ? "64" : "0.00"} value={label === t("dip") ? manualDip : undefined} onChange={label === t("dip") ? (event) => setManualDip(event.target.value) : undefined} /></label>)}</div>
          <div className="mt-4 rounded-xl border border-line p-4"><p className="text-sm font-semibold">{t("measureDip")}</p><p className="mt-1 text-xs text-muted">{t("measureDipDescription")}</p><Button className="mt-3" variant="secondary" size="sm" onClick={() => setDipOpen(true)}>{t("openDip")}</Button></div>
        </Card>
        <Card className="p-5 sm:p-6"><h2 className="font-semibold">{t("payment")}</h2><div className="mt-4 grid gap-2 sm:grid-cols-3">{["Wompi", "MercadoPago", "Contraentrega"].map((option) => <button key={option} onClick={() => setPayment(option)} className={`rounded-xl border p-3 text-left text-sm ${payment === option ? "border-forest bg-[#f5f2ed] font-semibold text-forest" : "border-line text-muted"}`}>{option}<span className="mt-1 block text-[10px] font-normal text-muted">{option === "Contraentrega" ? t("cash") : t("securePayment")}</span></button>)}</div><p className="mt-3 text-xs text-muted">{t("paymentDemo")}</p></Card>
      </div>
      <Card className="h-fit p-5 sm:p-6">
        <h2 className="font-semibold">{t("summary")}</h2>
        <div className="my-5 border-b border-line pb-4 text-sm">
          {selectedProduct ? <>
            <div className="flex justify-between gap-2"><span className="font-medium">{selectedProduct.name} · {selectedProduct.colorName}</span><span>{formatCurrency(selectedProduct.price)}</span></div>
            <p className="mt-1 text-xs text-muted">{t("frame")} · {selectedProduct.material}</p>
            <div className="mt-3 flex justify-between text-xs"><span className="text-muted">{lensLabels[configuredLens] ?? "Monofocal"}</span><span>{lensPrices[configuredLens] ? formatCurrency(lensPrices[configuredLens]) : t("included")}</span></div>
          </> : <div className="flex justify-between"><span className="text-muted">{t("frame")} ({cartCount})</span><span>{cartCount || t("emptyCart")}</span></div>}
        </div>
        <div className="flex justify-between text-sm"><span className="text-muted">{t("shipping")}</span><span className="text-forest">{t("free")}</span></div>
        <div className="mt-5 flex justify-between border-t border-line pt-4 font-semibold"><span>{t("total")}</span><span>{selectedProduct ? formatCurrency(selectedProduct.price + (lensPrices[configuredLens] ?? 0)) : "—"}</span></div>
        <Button className="mt-6 w-full" disabled={!selectedProduct && cartCount === 0} onClick={() => setComplete(true)}>{selectedProduct || cartCount ? t("confirm") : t("emptyCart")}</Button>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted"><ShieldCheck size={13} /> {t("secure")}</p>
        {(selectedProduct || cartCount > 0) && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-5 flex h-10 items-center justify-center rounded-full border border-line px-4 text-center text-xs font-semibold transition hover:border-forest hover:text-forest">{t("whatsappTitle")} {t("whatsappAction")}</a>}
        <Link href="/shop" className="mt-5 block text-center text-xs text-muted underline">{t("continueShopping")}</Link>
      </Card>
    </div>}
    {dipOpen && <DipMeasurer onClose={() => setDipOpen(false)} onComplete={(dip) => setManualDip(String(dip))} />}
  </main>;
}
