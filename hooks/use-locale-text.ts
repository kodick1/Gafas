"use client";

import { useLanguageStore } from "@/store/use-language-store";
import es from "@/messages/es.json";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

const dictionaries = { es, en, fr };
type Namespace = keyof typeof es;

export function useLocaleText(namespace: Namespace) {
  const locale = useLanguageStore((state) => state.locale);

  return (key: string, values: Record<string, string | number> = {}) => {
    const messagePath = `${namespace}.${key}`.split(".");
    let message: unknown = dictionaries[locale];
    for (const part of messagePath) {
      if (typeof message !== "object" || message === null || !(part in message)) {
        throw new Error(`Missing translation: ${locale}.${messagePath.join(".")}`);
      }
      message = (message as Record<string, unknown>)[part];
    }
    if (typeof message !== "string") {
      throw new Error(`Translation must be a string: ${locale}.${messagePath.join(".")}`);
    }
    return message.replace(/\{([^}]+)\}/g, (match, name: string) => name in values ? String(values[name]) : match);
  };
}
