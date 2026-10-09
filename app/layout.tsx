import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getLocale } from "next-intl/server";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import type { Locale } from "@/i18n/request";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LUMIERE_OPTIQUE — Una mirada que habla por ti",
  description: "Óptica de lujo en Bogotá. Monturas cuidadosamente seleccionadas y lentes con estilo.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale() as Locale;
  return <html lang={locale}><body><Providers locale={locale}>{children}<WhatsAppFloat /></Providers></body></html>;
}
