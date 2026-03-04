const prisma = require('../prismaClient.js');
const { toSearchKey } = require('../utils/search-key.js');

(async () => {
  const products = await prisma.product.findMany();

  for (const p of products) {
    // Json bo'lsa ham, eng kamida uz-Latn dan olamiz
    const name =
      (p.name && (p.name['uz-Latn'] || p.name['ru'] || p.name['uz-Cyrl'])) || '';
    const desc =
      (p.description && (p.description['uz-Latn'] || p.description['ru'] || p.description['uz-Cyrl'])) || '';

    await prisma.product.update({
      where: { id: p.id },
      data: {
        nameKey: toSearchKey(name),
        descKey: desc ? toSearchKey(desc) : null,
      },
    });
  }

  console.log('Done backfill');
  await prisma.$disconnect();
})();