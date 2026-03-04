jest.mock('uzbek-transliterator', () => ({
latinToCyrillic: (s) => s,
  cyrillicToLatin: (s) => s,
  transliterate: (s) => s,
}));

jest.mock('../src/services/translate.service.js', () => ({
  SUPPORTED: ['uz-Latn', 'uz-Cyrl', 'ru'],
  normalizeLang: (lang) => {
    const s = (lang ?? '').toString();
    if (s.startsWith('ru')) return 'ru';
    if (s.toLowerCase().includes('cyrl')) return 'uz-Cyrl';
    return 'uz-Latn';
  },
  translateToAll: async (text) => ({
    'uz-Latn': text,
    'uz-Cyrl': text,
    ru: text,
  }),
  fallbackI18n: (text) => ({
    'uz-Latn': text,
    'uz-Cyrl': text,
    ru: text,
  }),
}));