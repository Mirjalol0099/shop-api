const { normalizeLang, SUPPORTED } = require('../utils/lang.js');

module.exports = (req, res, next) => {
  let lang;

  if (req.query?.lang) {
    lang = normalizeLang(req.query.lang);
  } else {
    // Accept-Language header
    const header = req.headers['accept-language'] || '';
    
    // Masalan: "ru-RU,ru;q=0.9,en;q=0.8"
    const first = header.split(',')[0].trim();
    lang = normalizeLang(first);
  }

  // Supported check
  if (!SUPPORTED.includes(lang)) {
    lang = 'uz-Latn';
  }

  req.lang = lang;
  next();
};