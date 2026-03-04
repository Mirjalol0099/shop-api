const prisma = require('../../prismaClient.js');
const { translateToAll, normalizeLang, SUPPORTED } = require('../../services/translate.service.js');

exports.getAll = () =>
  prisma.category.findMany({ orderBy: { createdAt: 'desc' } });

exports.create = async (name, sourceLang = 'uz-Latn') => {
  const src = normalizeLang(sourceLang);
  const nameI18n = await translateToAll(name, src);

  return prisma.category.create({
    data: { name: nameI18n },
  });
};

// update 2 xil ishlaydi:
// 1) req.body.name string bo‘lsa: uni tarjima qilib i18n saqlaymiz
// 2) req.body.name allaqachon i18n object bo‘lsa: to‘g‘ridan-to‘g‘ri saqlaymiz
exports.update = async (id, name, sourceLang = 'uz-Latn') => {
  if (name && typeof name === 'object') {
    return prisma.category.update({ where: { id }, data: { name } });
  }

  const text = (name || '').trim();
  if (!text) {
    // throw new Error("name is required");
    return prisma.category.update({ where: { id }, data: { name } });
  }

  const src = normalizeLang(sourceLang);
  const nameI18n = await translateToAll(text, src);

  return prisma.category.update({
    where: { id },
    data: { name: nameI18n },
  });
};

exports.remove = async (id) => {
  try {
    return await prisma.category.delete({
      where: {id},
    });
  } catch (e) {
    if (e.code === 'P2025') {
      const err = new Error('Category Not Found');
      err.status = 404;
      throw err;
    }
    throw e;
  }
};