import Link from "next/link";
import { Instagram, MapPin, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const address = "Cra. 21 #24 Sur-80, Bogotá, D.C, Bogotá, Colombia";
const mapQuery = encodeURIComponent(address);

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-16 border-t border-line bg-[#f5f2ed] py-12">
      <div className="container-width grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Link href="/" className="font-serif text-lg tracking-[.2em]">LUMIERE_OPTIQUE</Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">{t("brandDescription")}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[.16em]">{t("contact")}</h2>
          <div className="mt-4 space-y-3 text-sm text-muted">
            <Link className="flex items-center gap-2 hover:text-ink" href="https://wa.me/573013761312" target="_blank" rel="noreferrer"><MessageCircle size={15} /> +57 301 3761312</Link>
            <Link className="flex items-center gap-2 hover:text-ink" href="https://www.instagram.com/lumiere_optique10/" target="_blank" rel="noreferrer"><Instagram size={15} /> {t("instagram")}</Link>
            <Link className="block hover:text-ink" href="mailto:hola@lumiereoptique.com">{t("email")}</Link>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[.16em]">{t("visit")}</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-white">
            <iframe
              title={`${t("visit")}: ${address}`}
              src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-36 w-full border-0"
            />
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted"><MapPin size={14} className="mt-0.5 shrink-0" />{t("address")}</p>
          <Link href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold underline underline-offset-4">{t("directions")}</Link>
        </div>
      </div>
      <div className="container-width mt-10 flex flex-col justify-between gap-3 border-t border-line pt-5 text-xs text-muted sm:flex-row">
        <span>© {new Date().getFullYear()} {t("copyright")}</span>
        <div className="flex gap-5"><Link href="/admin/users">{t("admin")}</Link><Link href="/checkout">{t("orders")}</Link></div>
      </div>
    </footer>
  );
}
