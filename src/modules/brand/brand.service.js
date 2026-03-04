const prisma = require('../../prismaClient.js');
const { translateToAll, normalizeLang } = require('../../services/translate.service.js');

function fallbackI18n(text) {
  return { 'uz-Latn': text, 'uz-Cyrl': text, ru: text };
}

exports.getAll = () =>
  prisma.brand.findMany({ orderBy: { createdAt: 'desc' } });

exports.create = async (name, sourceLang = 'uz-Latn') => {
  const text = (name || '').trim();
  if (!text) {
    const err = new Error('Name is required');
    err.status = 400;
    throw err;
  }

  const src = normalizeLang(sourceLang);

  let nameI18n;
  try {
    nameI18n = await translateToAll(text, src);
  } catch {
    nameI18n = fallbackI18n(text);
  }

  return prisma.brand.create({ data: { name: nameI18n } });
};

exports.update = async (id, name, sourceLang = 'uz-Latn') => {
  if (name && typeof name === 'object') {
    return prisma.brand.update({ where: { id }, data: { name } });
  }

  const text = (name || '').trim();
  if (!text) {
    const err = new Error('Name is required');
    err.status = 400;
    throw err;
  }

  const src = normalizeLang(sourceLang);

  let nameI18n;
  try {
    nameI18n = await translateToAll(text, src);
  } catch {
    nameI18n = fallbackI18n(text);
  }

  return prisma.brand.update({
    where: { id },
    data: { name: nameI18n },
  });
};

exports.remove = async (id) => {
    try {
        return await prisma.brand.delete({
            where: {id},
        });
    } catch (e) {
        if (e.code === 'P2025') {
            const err = new Error('Brand Not Found');
            err.status = 404;
            throw err;
        }
        throw e;
    }
};