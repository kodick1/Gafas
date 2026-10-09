"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import type { Locale } from "@/i18n/request";
import { useLanguageStore } from "@/store/use-language-store";

export function Providers({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 20_000, retry: 1, refetchOnWindowFocus: false } },
  }));
  const setLocale = useLanguageStore((state) => state.setLocale);
  useEffect(() => setLocale(locale), [locale, setLocale]);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
