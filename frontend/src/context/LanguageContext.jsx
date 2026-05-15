import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { t } from '../utils/translations';
import {
  startLiveTranslator,
  stopLiveTranslator,
} from '../utils/liveTranslator';

const LANGUAGES = ['en', 'mr', 'hi'];
const LANG_LABELS = { en: 'English', mr: 'मराठी', hi: 'हिन्दी' };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('appLang');
    return saved && LANGUAGES.includes(saved) ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('appLang', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  // Live DOM translator: walks the rendered DOM and translates mock data,
  // hardcoded JSX text, third-party widget labels, and dynamic content using
  // the same dictionary as t(). Keeps the original English in a WeakMap so
  // toggling back is lossless. `startLiveTranslator` is idempotent and also
  // serves as the language-switch path, so we call it whenever `lang` changes.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    startLiveTranslator(lang);
    return undefined;
  }, [lang]);

  useEffect(() => () => stopLiveTranslator(), []);

  const cycleLanguage = useCallback(() => {
    setLang(prev => {
      const idx = LANGUAGES.indexOf(prev);
      return LANGUAGES[(idx + 1) % LANGUAGES.length];
    });
  }, []);

  const setLanguage = useCallback((code) => {
    if (LANGUAGES.includes(code)) setLang(code);
  }, []);

  const translate = useCallback((key, params) => t(key, lang, params), [lang]);

  const currentLabel = LANG_LABELS[lang] || 'English';

  return (
    <LanguageContext.Provider value={{
      lang,
      cycleLanguage,
      setLanguage,
      t: translate,
      currentLabel,
      availableLanguages: LANGUAGES,
      langLabels: LANG_LABELS,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
