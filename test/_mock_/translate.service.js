// test/__mocks__/translate.service.js
module.exports = {
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
};