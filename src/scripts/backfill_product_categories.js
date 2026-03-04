const prisma = require('../prismaClient.js');

(async () => {
  const products = await prisma.product.findMany({
    where: { categoryId: { not: null } },
    select: { id: true, categoryId: true },
  });

  for (const p of products) {
    await prisma.productCategory.upsert({
      where: {
        productId_categoryId: { productId: p.id, categoryId: p.categoryId },
      },
      update: {},
      create: { productId: p.id, categoryId: p.categoryId },
    });
  }

  console.log(`Backfilled ${products.length} products`);
  await prisma.$disconnect();
})();