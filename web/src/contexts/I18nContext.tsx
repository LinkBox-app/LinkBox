import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { LOCALE_KEY } from "../storage-key.constant";
import { messages, supportedLocales, type Locale } from "../i18n/messages";

type TranslationParams = Record<string, string | number>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslationParams) => string;
  formatDate: (value: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (value: string | Date, options?: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const isSupportedLocale = (value: string | null): value is Locale =>
  !!value && supportedLocales.includes(value as Locale);

const detectInitialLocale = (): Locale => {
  const storedLocale = localStorage.getItem(LOCALE_KEY);
  if (isSupportedLocale(storedLocale)) {
    return storedLocale;
  }

  return navigator.language.toLowerCase().startsWith("en") ? "en-US" : "zh-CN";
};

const resolveMessage = (locale: Locale, key: string): string => {
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, messages[locale]);

  return typeof value === "string" ? value : key;
};

const interpolate = (template: string, params?: TranslationParams) => {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale);

  useEffect(() => {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
  };

  const t = (key: string, params?: TranslationParams) =>
    interpolate(resolveMessage(locale, key), params);

  const formatDate = (
    value: string | Date,
    options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ) => new Intl.DateTimeFormat(locale, options).format(new Date(value));

  const formatDateTime = (
    value: string | Date,
    options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
  ) => new Intl.DateTimeFormat(locale, options).format(new Date(value));

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        formatDate,
        formatDateTime,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
};
