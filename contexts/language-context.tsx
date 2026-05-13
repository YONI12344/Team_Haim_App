"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Language, TranslationKey } from "@/lib/translations"
import { t as translate } from "@/lib/translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
  isRTL: boolean
  dir: "ltr" | "rtl"
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("he") // Default to Hebrew

  useEffect(() => {
    // Load saved language preference
    const saved = localStorage.getItem("language") as Language | null
    if (saved && (saved === "en" || saved === "he")) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: TranslationKey) => translate(key, language)

  const isRTL = language === "he"
  const dir = isRTL ? "rtl" : "ltr"

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
