import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Appearance, Locale, Profile } from "./types";

const LOCALE_KEY = "nocturne-locale";
const APPEARANCE_KEY = "nocturne-appearance";

function readLocale(): Locale {
  if (typeof window === "undefined") return "tr";
  const v = window.localStorage.getItem(LOCALE_KEY);
  if (v === "en" || v === "ar" || v === "tr") return v;
  return "tr";
}

function readAppearance(): Appearance {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(APPEARANCE_KEY);
  return v === "light" ? "light" : "dark";
}

type SettingsValue = {
  locale: Locale;
  appearance: Appearance;
  setLocale: (locale: Locale) => void;
  setAppearance: (appearance: Appearance) => void;
  applyProfile: (profile: Profile) => void;
};

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");
  const [appearance, setAppearanceState] = useState<Appearance>("dark");

  useEffect(() => {
    setLocaleState(readLocale());
    setAppearanceState(readAppearance());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === "ar" ? "rtl" : "ltr";
    root.classList.toggle("dark", appearance === "dark");
    root.classList.toggle("light", appearance === "light");
  }, [locale, appearance]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_KEY, next);
  }, []);

  const setAppearance = useCallback((next: Appearance) => {
    setAppearanceState(next);
    window.localStorage.setItem(APPEARANCE_KEY, next);
  }, []);

  const applyProfile = useCallback(
    (profile: Profile) => {
      setLocale(profile.locale);
      setAppearance(profile.appearance);
    },
    [setLocale, setAppearance],
  );

  const value = useMemo(
    () => ({ locale, appearance, setLocale, setAppearance, applyProfile }),
    [locale, appearance, setLocale, setAppearance, applyProfile],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("SettingsProvider missing");
  return ctx;
}
