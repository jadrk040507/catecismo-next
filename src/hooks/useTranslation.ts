"use client";

import { usePathname } from "next/navigation";

type TranslationDict = Record<string, { es: string; en: string }>;

/**
 * Simple bilingual translation hook.
 * Detects language from the URL path (/en/… → English, otherwise Spanish).
 * Returns a `t(key)` function that looks up the key in the provided dictionary,
 * falling back to the key itself if not found.
 */
export function useTranslation(dict: TranslationDict) {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const lang: "es" | "en" = isEn ? "en" : "es";

  function t(key: string): string {
    return dict[key]?.[lang] ?? key;
  }

  return { t, lang, isEn };
}