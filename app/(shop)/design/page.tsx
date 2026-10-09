"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, ImagePlus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/use-store";
import { useLocaleText } from "@/hooks/use-locale-text";

export default function DesignPage() {
  const t = useLocaleText("design");
  const config = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState({ title: "", name: "", email: "", description: "" });

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!/\.(glb|obj|svg|png)$/i.test(selected.name) || selected.size > 20 * 1024 * 1024) {
      toast.error(t("fileTypes"));
      event.target.value = "";
      return;
    }
    setFile(selected);
  }

  async function submitDesign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) { toast.error(t("fileTypes")); return; }
    setSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(values).forEach(([key, value]) => form.append(key, value));
      form.append("material", config.frameMaterial);
      form.append("color", config.frameColor);
      form.append("lensTint", config.lensTint);
      form.append("engravingText", config.engravingText);
      form.append("file", file);
      const response = await fetch("/api/designs", { method: "POST", body: form });
      if (!response.ok) {
        const result = await response.json() as { message?: string };
        throw new Error(result.message ?? t("send"));
      }
      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("send"));
    } finally {
      setSubmitting(false);
    }
  }

  const colorClass = config.frameColor === "Negro" ? "glasses-color-black" : config.frameColor === "Miel" ? "glasses-color-honey" : config.frameColor === "Vino" ? "glasses-color-burgundy" : "glasses-color-olive";
  const materialClass = `material-${config.frameMaterial.toLowerCase()}`;
  const lensClass = `lens-${config.lensTint.toLowerCase()}`;
  if (submitted) return <main className="container-width flex min-h-[65vh] items-center justify-center py-16"><div className="max-w-lg text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f2ed] text-forest"><Check /></span><p className="eyebrow mt-5 text-forest">{t("received")}</p><h1 className="mt-2 text-3xl font-semibold">{t("receivedTitle")}</h1><p className="mt-3 text-sm leading-6 text-muted">{t("receivedDescription")}</p><Link href="/shop" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white">{t("back")} <ArrowRight size={15} /></Link></div></main>;

  return <main className="container-width py-10 sm:py-16">
    <div className="mb-9 max-w-2xl"><p className="eyebrow text-forest">{t("eyebrow")}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1><p className="mt-3 text-sm leading-6 text-muted">{t("description")}</p></div>
    <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
      <section className="h-fit rounded-3xl bg-canvas p-5 sm:p-7"><div className="flex items-center justify-between"><span className="eyebrow text-forest">{t("preview")}</span><span className="flex items-center gap-1 text-[10px] text-forest"><Sparkles size={13} /> {t("live")}</span></div><div className="relative mt-5 flex aspect-[1.1] items-center justify-center overflow-hidden rounded-2xl bg-[#fbfaf8]"><div className="absolute left-8 top-8 h-36 w-36 rounded-full bg-lime/30 blur-3xl" /><div className="relative scale-[1.5]"><div className={`product-shape ${colorClass} ${materialClass} ${lensClass}`}><div className="product-lens" /><div className="product-lens" /></div><span className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white/75 px-2 py-1 text-[9px] tracking-wider text-muted">{config.engravingText || t("initials")}</span></div><span className="absolute bottom-4 right-4 text-[10px] text-muted">{t("brand")} · {config.frameMaterial}</span></div><p className="mt-4 text-xs leading-5 text-muted">{t("brand")}</p></section>
      <section><div className="mb-5"><h2 className="text-lg font-semibold">{t("customize")}</h2><p className="mt-1 text-sm text-muted">{t("customizeDescription")}</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[{ label: t("material"), key: "frameMaterial", choices: ["Acetato", "Titanio", "Metal", "Madera"], labels: "optionMaterials" }, { label: t("color"), key: "frameColor", choices: ["Oliva", "Negro", "Miel", "Vino"], labels: "optionColors" }, { label: t("tint"), key: "lensTint", choices: ["Verde", "Ámbar", "Gris", "Transparente"], labels: "optionTints" }].map(({ label, key, choices, labels }) => <label key={key} className="text-xs font-semibold">{label}<span className="relative mt-2 block"><select value={config[key as "frameMaterial" | "frameColor" | "lensTint"]} onChange={(event) => config.setDesign(key as "frameMaterial" | "frameColor" | "lensTint", event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-line bg-white px-3 text-sm font-normal outline-none focus:border-forest">{choices.map((choice, index) => <option key={choice} value={choice}>{t(`${labels}.${index}`)}</option>)}</select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" /></span></label>)}
          <label className="text-xs font-semibold">{t("engraving")} <span className="font-normal text-muted">{t("maxCharacters")}</span><Input className="mt-2" maxLength={10} placeholder={t("initials")} value={config.engravingText} onChange={(event) => config.setDesign("engravingText", event.target.value)} /><span className="mt-1 block text-right text-[10px] text-muted">{config.engravingText.length}/10</span></label>
        </div>
        <form onSubmit={(event) => void submitDesign(event)} className="mt-8 border-t border-line pt-7">
          <h2 className="text-lg font-semibold">{t("share")}</h2><p className="mt-1 text-sm text-muted">{t("shareDescription")}</p>
          <label className="mt-5 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-7 text-center transition hover:border-forest"><input type="file" accept=".glb,.obj,.svg,.png" className="sr-only" onChange={chooseFile} /><span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-forest"><ImagePlus size={18} /></span><span className="mt-3 text-sm font-semibold">{file?.name ?? t("drop")}</span><span className="mt-1 text-xs text-muted">{t("fileTypes")}</span></label>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><Input required minLength={3} maxLength={80} placeholder={t("modelTitle")} value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} /><Input required minLength={2} placeholder={t("name")} value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} /><Input required type="email" placeholder={t("email")} value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} /></div>
          <textarea required minLength={10} maxLength={500} placeholder={t("descriptionPlaceholder")} className="mt-3 min-h-24 w-full resize-y rounded-xl border border-line bg-white px-3 py-3 text-sm outline-none placeholder:text-muted/70 focus:border-forest" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} />
          <Button type="submit" className="mt-4 w-full" disabled={submitting}>{submitting ? t("sending") : t("send")} <ArrowRight size={15} /></Button>
        </form>
      </section>
    </div>
  </main>;
}
