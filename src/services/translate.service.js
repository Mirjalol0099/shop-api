const axios = require("axios");
const { latinToCyrillic, cyrillicToLatin } = require("uzbek-transliterator");

const SUPPORTED = ["uz-Latn", "uz-Cyrl", "ru"];

function normalizeLang(lang) {
  if (!lang) return "uz-Latn";
  const l = String(lang).toLowerCase();
  if (l === "uz" || l.includes("latn")) return "uz-Latn";
  if (l.includes("cyrl")) return "uz-Cyrl";
  if (l.startsWith("ru")) return "ru";
  return "uz-Latn";
}

function isCyrillic(text = "") {
  return /[\u0400-\u04FFЁё]/.test(text);
}

function detectUzScript(text = "") {
  return isCyrillic(text) ? "uz-Cyrl" : "uz-Latn";
}

function toMyMemoryLang(lang) {
  // MyMemory expects basic codes like "ru|uz"
  if (lang === "ru") return "ru";
  if (lang === "uz-Latn" || lang === "uz-Cyrl") return "uz";
  return "uz";
}

async function translateViaMyMemory(text, src, tgt) {
  const params = {
    q: text,
    langpair: `${toMyMemoryLang(src)}|${toMyMemoryLang(tgt)}`,
  };
  if (process.env.MYMEMORY_EMAIL) params.de = process.env.MYMEMORY_EMAIL;

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await axios.get("https://api.mymemory.translated.net/get", {
        params,
        timeout: 8000, // 8s
      });

      const out = res.data?.responseData?.translatedText;
      return (out && typeof out === "string") ? out : "";
    } catch (err) {
      const code = err?.code;
      const isRetryable =
        code === "EAI_AGAIN" ||
        code === "ENOTFOUND" ||
        code === "ECONNRESET" ||
        code === "ETIMEDOUT" ||
        code === "ECONNABORTED";

      if (!isRetryable || attempt === maxAttempts) {
        throw err;
      }

      await new Promise(r => setTimeout(r, 300 * attempt));
    }
  }

  return "";
}


function translitUz(text, from, to) {
  if (!text) return text;

  const src = from === "uz-Latn" || from === "uz-Cyrl" ? from : detectUzScript(text);
  const tgt = to;

  if (src === tgt) return text;

  if (src === "uz-Latn" && tgt === "uz-Cyrl") return latinToCyrillic(text);
  if (src === "uz-Cyrl" && tgt === "uz-Latn") return cyrillicToLatin(text);

  return text;
}

async function translateOne(text, sourceLang, targetLang) {
  const src = normalizeLang(sourceLang);
  const tgt = normalizeLang(targetLang);

  if (!text || !String(text).trim()) return text;
  if (src === tgt) return text;

  const isUzSrc = src === "uz-Latn" || src === "uz-Cyrl";
  const isUzTgt = tgt === "uz-Latn" || tgt === "uz-Cyrl";

  if (isUzSrc && isUzTgt) {
    return translitUz(text, src, tgt);
  }

  // ru <-> uz translation via MyMemory
  const isRuUz =
    (src === "ru" && isUzTgt) ||
    (tgt === "ru" && isUzSrc);

  if (!isRuUz) {
    // Sizning SUPPORTED doirangizdan tashqariga chiqsa fallback
    return text;
  }

  const translated = await translateViaMyMemory(text, src, tgt);

  // Fallback: agar MyMemory bo‘sh qaytarsa
  if (!translated.trim()) return text;

  // Agar target uz bo‘lib, aniq skript kerak bo‘lsa — natijani translit qilib beramiz
  if (isUzTgt) {
    const detected = detectUzScript(translated);
    if (detected !== tgt) {
      return translitUz(translated, detected, tgt);
    }
  }

  return translated;
}

async function translateToAll(text, sourceLang = "uz-Latn") {
  const src = normalizeLang(sourceLang);
  const result = {};

  for (const lang of SUPPORTED) {
    if (lang === src) result[lang] = text;
    else result[lang] = await translateOne(text, src, lang);
  }
  return result;
}

module.exports = { translateOne, translateToAll, normalizeLang, SUPPORTED };
