function toSearchKey(input) {
  const s = (input ?? '').toString().trim().toLowerCase();

  // Juda agresiv bo'lmaymiz: harf/raqam + bo'shliq qoldiramiz
  // Unicode harflarini ham saqlaydi (ru, uz-cyrl)
  return s
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = { toSearchKey };