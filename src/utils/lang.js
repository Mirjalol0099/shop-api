const SUPPORTED = ['uz-Latn', 'uz-Cyrl', 'ru'];

function normalizeLang(lang) {
  const s = (lang ?? '').toString().trim();
  if (!s) return 'uz-Latn';
  const low = s.toLowerCase();
  if (low.startsWith('uz')) return low.includes('cyrl') ? 'uz-Cyrl' : 'uz-Latn';
  if (low.startsWith('ru')) return 'ru';
  return 'uz-Latn';
}

module.exports = { SUPPORTED, normalizeLang };