import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const locales = ["es", "en", "fr"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("lumiere_locale")?.value;
  const locale: Locale = locales.includes(cookieLocale as Locale) ? cookieLocale as Locale : "es";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
