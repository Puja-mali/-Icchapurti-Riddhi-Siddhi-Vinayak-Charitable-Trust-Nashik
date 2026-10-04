import React, { createContext, useContext, useState, useEffect } from "react";
import {
  translations,
  TranslationSchema,
  SupportedLanguage,
} from "@/src/i18n/translations";

export type Language = SupportedLanguage;
export type Translations = TranslationSchema;

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved =
        (localStorage.getItem("impactseva_lang") as Language) ||
        (localStorage.getItem("selectedLanguage") as Language);
      return saved && ["en", "hi", "mr"].includes(saved) ? saved : "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("impactseva_lang", lang);
      localStorage.setItem("selectedLanguage", lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignore in restricted environments
    }
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // Ignore
    }
  }, [language]);

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
