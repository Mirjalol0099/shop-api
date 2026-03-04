// test/helpers/seed.js
const prisma = require('../../src/prismaClient.js');

async function seedBrand(name = 'Apple') {
  return prisma.brand.create({
    data: { name: { 'uz-Latn': name, 'uz-Cyrl': name, ru: name } },
  });
}

async function seedCategory(name = 'Telefon') {
  return prisma.category.create({
    data: { name: { 'uz-Latn': name, 'uz-Cyrl': name, ru: name } },
  });
}

async function seedProduct({ name, price, stock = 5, brandId = null, categoryIds = [] }) {
  const nameText = String(name);
  return prisma.product.create({
    data: {
      name: { 'uz-Latn': nameText, 'uz-Cyrl': nameText, ru: nameText },
      description: { 'uz-Latn': 'desc', 'uz-Cyrl': 'desc', ru: 'desc' },
      nameKey: nameText.toLowerCase(),
      descKey: 'desc',
      price,
      stock,
      brandId,
      categories: categoryIds.length
        ? { create: categoryIds.map((cid) => ({ categoryId: cid })) }
        : undefined,
    },
  });
}

module.exports = { seedBrand, seedCategory, seedProduct };