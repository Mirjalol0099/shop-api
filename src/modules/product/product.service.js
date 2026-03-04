const prisma = require('../../prismaClient.js');
const { translateToAll, normalizeLang } = require('../../services/translate.service.js');
const {toSearchKey} = require('../../utils/search-key.js');

const productInclude = {
  brand: true,
  categories: {
    include: { category: true },
  },
};

function fallbackI18n(text) {
  return {
    'uz-Latn': text,
    'uz-Cyrl': text,
    ru: text,
  };
}

exports.createProduct = async (data, sourceLang = 'uz-Latn') => {
  try {
    const src = normalizeLang(sourceLang);

    const nameText = (data.name ?? '').toString().trim();
    if (!nameText) {
      const err = new Error('name is required');
      err.status = 400;
      throw err;
    }
    const nameKey = toSearchKey(nameText);

    const descText = (data.description ?? '').toString().trim();
    const descKey = descText ? toSearchKey(descText) : null;

    let nameI18n;
    let descI18n = null;

    try {
      nameI18n = await translateToAll(nameText, src);
    } catch {
      nameI18n = fallbackI18n(nameText);
    }

    if (descText) {
      try {
        descI18n = await translateToAll(descText, src);
      } catch {
        descI18n = fallbackI18n(descText);
      }
    }

    const categoryIds = Array.isArray(data.categoryIds) ? data.categoryIds : [];
    const brandId = data.brandId == null || data.brandId === '' ? null : Number(data.brandId);

    const price = Number(data.price);
    const stock = Number(data.stock);

    // (optional) safety: if validate.middleware already guarantees these, you can remove
    if (!Number.isFinite(price) || price <= 0) {
      const err = new Error('price must be a positive number');
      err.status = 400;
      throw err;
    }
    if (!Number.isFinite(stock) || !Number.isInteger(stock) || stock < 0) {
      const err = new Error('stock must be a non-negative integer');
      err.status = 400;
      throw err;
    }

    const createData = {
      name: nameI18n,
      description: descI18n,
      price,
      stock,
      image: data.image ?? null,
      nameKey,
      descKey,

      ...(brandId ? { brand: { connect: { id: brandId } } } : {}),

      ...(categoryIds.length
        ? {
            categories: {
              create: categoryIds.map((cid) => ({ categoryId: cid })),
            },
          }
        : {}),
    };

    return await prisma.product.create({
      data: createData,
      include: productInclude,
    });
  } catch (e) {
    if (e?.code === 'P2003') {
      const err = new Error('Invalid brandId or categoryIds');
      err.status = 400;
      throw err;
    }
    throw e;
  }
};

exports.getOne = async (id) => {
  return await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
};

exports.getAllProducts = async (filters = {}) => {
  const where = { isDeleted: false };

  // filters: brand/category
  if (filters.brandId != null) where.brandId = Number(filters.brandId);
  if (filters.categoryId != null) {
  where.categories = {
    some: { categoryId: Number(filters.categoryId) },
  };
}
  
  if (filters.inStock === true) where.stock = { gt: 0 };
  if (filters.inStock === false) where.stock = { equals: 0 };

  // price range
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {};
    if (filters.minPrice != null) where.price.gte = Number(filters.minPrice);
    if (filters.maxPrice != null) where.price.lte = Number(filters.maxPrice);
  }

  // search (requires Product.nameKey/descKey)
  if (filters.search) {
    const s = String(filters.search).trim().toLowerCase();
    if (s) {
      where.OR = [
        { nameKey: { contains: s, mode: 'insensitive' } },
        { descKey: { contains: s, mode: 'insensitive' } }, // descKey bo'lmasa olib tashlang
      ];
    }
  }

  // sorting
  const sort = String(filters.sort || 'createdAt_desc');
  const orderByMap = {
    createdAt_desc: { createdAt: 'desc' },
    createdAt_asc: { createdAt: 'asc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    stock_asc: { stock: 'asc' },
    stock_desc: { stock: 'desc' },
  };
  const orderBy = orderByMap[sort] || orderByMap.createdAt_desc;

  // pagination (safe)
  const page = Math.max(1, Number(filters.page || 1));
  const limit = Math.min(100, Math.max(1, Number(filters.limit || 20)));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, limit };
};

exports.updateProduct = async (id, data, sourceLang = 'uz-Latn') => {
  try {
    const src = normalizeLang(sourceLang);
    const patch = { ...data };

    if (patch.name !== undefined) {
      if (typeof patch.name === 'object' && patch.name !== null) {
        // allow direct i18n object update
      } else {
        const nameText = (patch.name || '').toString().trim();
        patch.nameKey = toSearchKey(nameText);
        if (!nameText) {
          const err = new Error('name is required');
          err.status = 400;
          throw err;
        }
        try {
          patch.name = await translateToAll(nameText, src);
        } catch {
          patch.name = fallbackI18n(nameText);
        }
      }
    }

    if (patch.categoryIds !== undefined) {
          const categoryIds = Array.isArray(patch.categoryIds) ? patch.categoryIds : [];
          delete patch.categoryIds;

          patch.categories = {
            deleteMany: {}, // hammasini o'chir
            create: categoryIds.map((cid) => ({ categoryId: cid })),
      };
    }
    if (patch.description !== undefined) {
      if (typeof patch.description === 'object' && patch.description !== null) {
        
      } else {
        const descText = (patch.description ?? '').toString().trim();
        patch.descKey = descText ? toSearchKey(descText) : null;
        if (!descText) {
          patch.description = null;
        } else {
          try {
            patch.description = await translateToAll(descText, src);
          } catch {
            patch.description = fallbackI18n(descText);
          }
        }
      }
    }

    return await prisma.product.update({
      where: { id },
      data: patch,
      include: productInclude,
    });
  } catch (e) {
    if (e.code === 'P2025') {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }
    if (e.code === 'P2003') {
      const err = new Error('Invalid categoryId or brandId');
      err.status = 400;
      throw err;
    }
    throw e;
  }
};

exports.deleteProduct = async (id) => {
  try {
    return await prisma.product.update({
      where: { id },
      data: {isDeleted: true},
    });
  } catch (e) {
    if (e.code === 'P2025') {
      const err = new Error('Product Not Found');
      err.status = 404;
      throw err;
    }
    throw e;
  }
};