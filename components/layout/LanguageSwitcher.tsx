"use client";

import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/store/use-language-store";
import type { Locale } from "@/i18n/request";
import { useLocaleText } from "@/hooks/use-locale-text";

const locales: { locale: Locale; flag: string; name: string }[] = [
  { locale: "es", flag: "🇪🇸", name: "Español" },
  { locale: "en", flag: "🇺🇸", name: "English" },
  { locale: "fr", flag: "🇫🇷", name: "Français" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, setLocale } = useLanguageStore();
  const t = useLocaleText("common");

  return (
    <label className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-white px-2.5 text-xs">
      <span aria-hidden="true">{locales.find((item) => item.locale === locale)?.flag ?? "🇪🇸"}</span>
      <span className="sr-only">{t("language")}</span>
      <select
        aria-label={t("language")}
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value as Locale;
          setLocale(nextLocale);
          document.cookie = `lumiere_locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
          router.refresh();
        }}
        className="max-w-[78px] cursor-pointer bg-transparent outline-none"
      >
        {locales.map((item) => <option key={item.locale} value={item.locale}>{item.name}</option>)}
      </select>
    </label>
  );
}
