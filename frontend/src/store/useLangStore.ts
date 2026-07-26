import { create } from 'zustand';
import { translations } from '../i18n/translations';

type Language = 'ar' | 'en';

interface LangState {
  lang: Language;
  t: typeof translations['ar'];
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const initialLang: Language = (localStorage.getItem('codex_lang') as Language) || 'ar';
document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = initialLang;

export const useLangStore = create<LangState>((set) => ({
  lang: initialLang,
  t: translations[initialLang],
  setLang: (lang: Language) => {
    localStorage.setItem('codex_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    set({ lang, t: translations[lang] });
  },
  toggleLang: () => {
    set((state) => {
      const nextLang: Language = state.lang === 'ar' ? 'en' : 'ar';
      localStorage.setItem('codex_lang', nextLang);
      document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = nextLang;
      return { lang: nextLang, t: translations[nextLang] };
    });
  }
}));
