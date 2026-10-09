import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Leaf, ScanFace, Sparkles } from "lucide-react";
import { ShopHeader } from "@/components/shop-header";
import { FeaturedProducts } from "@/components/shop/featured-products";
import { Footer } from "@/components/layout/Footer";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");
  return (
    <main>
      <ShopHeader />
      <section className="container-width grid min-h-[590px] items-center gap-8 py-12 md:grid-cols-[.95fr_1.05fr] md:py-16">
        <div className="max-w-[540px]">
          <p className="eyebrow text-forest">{t("eyebrow")}</p>
          <h1 className="mt-5 text-[54px] font-medium leading-[.98] tracking-[-.065em] sm:text-[76px]">{t("title")}<br /><span className="font-serif italic text-forest">{t("titleAccent")}</span></h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted">{t("description")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3"><Link href="/shop" className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-forest">{t("collection")} <ArrowRight size={16} /></Link><Link href="/design" className="px-4 py-3 text-sm font-semibold hover:text-forest">{t("design")}</Link></div>
          <div className="mt-12 flex items-center gap-4 border-t border-line pt-5 text-xs text-muted"><div className="flex -space-x-2"><span className="h-7 w-7 rounded-full border-2 border-canvas bg-[#d9c5ae]" /><span className="h-7 w-7 rounded-full border-2 border-canvas bg-[#a6b19d]" /><span className="h-7 w-7 rounded-full border-2 border-canvas bg-[#cfb4a9]" /></div><span><strong className="text-ink">4.9/5</strong> {t("rating")}</span></div>
        </div>
        <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[32px] glass-gradient">
          <div className="absolute left-8 top-8 rounded-full bg-white/75 px-3 py-2 text-[10px] font-semibold tracking-wide backdrop-blur">{t("collectionSeason")}</div>
          <div className="absolute right-8 top-8 flex h-10 w-10 items-center justify-center rounded-full bg-white/70"><ArrowUpRight size={17} /></div>
          <div className="absolute left-[8%] top-[23%] h-40 w-40 rounded-full bg-[#d6e8a9]/60 blur-3xl" />
          <div className="relative mt-4 scale-[1.4] sm:scale-[1.8]"><div className="product-shape glasses-color-olive"><div className="product-lens" /><div className="product-lens" /></div></div>
          <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
            <div><p className="text-xs text-muted">{t("favorite")}</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Sierra · Oliva</h2></div>
            <Link href="/product/sol-01" className="flex h-11 w-11 items-center justify-center rounded-full bg-white transition hover:bg-ink hover:text-white"><ArrowUpRight size={18} /></Link>
          </div>
          <div className="absolute bottom-[115px] right-8 rounded-full bg-white/80 px-3 py-2 text-[10px] font-medium backdrop-blur">{t("craft")}</div>
        </div>
      </section>
      <section className="border-y border-line bg-white">
        <div className="container-width grid gap-5 py-6 sm:grid-cols-3">
          {[{ icon: ScanFace, title: t("virtualTryOn"), note: t("virtualTryOnNote") }, { icon: Leaf, title: t("craft"), note: t("craftNote") }, { icon: Sparkles, title: t("prescription"), note: t("prescriptionNote") }].map(({ icon: Icon, title, note }) => <div key={title} className="flex items-center gap-4 px-2"><Icon className="shrink-0 text-forest" size={21} /><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-muted">{note}</p></div></div>)}
        </div>
      </section>
      <FeaturedProducts />
      <section id="nuestra-historia" className="bg-canvas py-14"><div className="container-width flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><p className="eyebrow text-forest">{t("storyEyebrow")}</p><h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight">{t("storyTitle")}</h2></div><Link href="/shop" className="flex items-center gap-2 rounded-full border border-forest/20 px-5 py-3 text-sm font-semibold text-forest">{t("storyLink")} <ArrowDown size={15} /></Link></div></section>
      <Footer />
    </main>
  );
}
