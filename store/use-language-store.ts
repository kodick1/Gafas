"use client";

import { create } from "zustand";
import type { Locale } from "@/i18n/request";

type LanguageState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLanguageStore = create<LanguageState>((set) => ({
  locale: "es",
  setLocale: (locale) => set({ locale }),
}));
