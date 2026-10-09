import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function ShopHeader() {
  const t = useTranslations("header");
  return (
    <>
      <div className="bg-ink px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white">{t("announcement")}</div>
      <header className="border-b border-line bg-white">
        <div className="container-width flex min-h-[76px] items-center justify-between gap-3 py-3">
          <Link href="/" className="shrink-0 font-serif text-sm tracking-[.18em] sm:text-base">LUMIERE_OPTIQUE</Link>
          <nav className="hidden items-center gap-7 text-sm text-ink lg:flex">
            <Link className="transition hover:text-forest" href="/shop">{t("sunglasses")}</Link>
            <Link className="transition hover:text-forest" href="/shop?tipo=recetadas">{t("prescription")}</Link>
            <Link className="transition hover:text-forest" href="/design">{t("design")}</Link>
            <Link className="transition hover:text-forest" href="/shop#nuestra-historia">{t("story")}</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/admin/users" className="hidden text-xs text-muted hover:text-ink xl:block">{t("backoffice")}</Link>
            <LanguageSwitcher />
            <Link aria-label={t("cart")} href="/checkout" className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-canvas"><ShoppingBag size={18} /></Link>
            <Link href="/shop" className="hidden items-center gap-1 rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-forest sm:flex">{t("explore")} <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </header>
    </>
  );
}
