const productService = require('./product.service.js');
const { normalizeLang } = require('../../services/translate.service.js');

function pickI18n(val, lang) {
  if (!val) return null;
  return val[lang] ?? val['uz-Latn'] ?? val['ru'] ?? val['uz-Cyrl'] ?? null;
}

// CREATE PRODUCT
exports.create = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      categoryIds,
      brandId,
      sourceLang,
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    let catIds = [];
    if (Array.isArray(categoryIds)) {
      catIds = categoryIds.map((x) => Number(x)).filter(Number.isFinite);
    } else if (typeof categoryIds === 'string') {
      catIds = categoryIds
        .split(',')
        .map((s) => Number(s.trim()))
        .filter(Number.isFinite);
    } else if (categoryIds != null) {
      const n = Number(categoryIds);
      if (Number.isFinite(n)) catIds = [n];
    }

    const product = await productService.createProduct(
      {
        name: String(name).trim(),
        description: description != null && String(description).trim() ? String(description) : null,
        price: Number(price),
        stock: Number(stock),
        brandId: brandId !== undefined && brandId !== '' ? Number(brandId) : null,
        categoryIds: catIds, // ✅ M2M
        image,
      },
      sourceLang || 'uz-Latn'
    );

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// GET ONE PRODUCT
exports.getOne = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await productService.getOne(id);

    if (!product || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const lang = normalizeLang(req.lang || req.query.lang || 'uz-Latn');

    const categories = (product.categories || [])
      .map((pc) => pc?.category)
      .filter(Boolean)
      .map((c) => ({
        ...c,
        name: pickI18n(c.name, lang),
      }));

    res.json({
      ...product,
      name: pickI18n(product.name, lang),
      description: pickI18n(product.description, lang),

      categories,

      brand: product.brand
        ? { ...product.brand, name: pickI18n(product.brand.name, lang) }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL PRODUCTS
exports.getAll = async (req, res, next) => {
  try {
    const lang = normalizeLang(req.lang || req.query.lang || 'uz-Latn');

    const result = await productService.getAllProducts(req.query);

    res.locals.meta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
      sort: req.query.sort,
      brandId: req.query.brandId ?? null,
      categoryId: req.query.categoryId ?? null,
      search: req.query.search ?? null,
      minPrice: req.query.minPrice ?? null,
      maxPrice: req.query.maxPrice ?? null,
      inStock: req.query.inStock ?? null,
    };

    res.json(
      result.items.map((p) => ({
        ...p,
        name: pickI18n(p.name, lang),
        description: pickI18n(p.description, lang),

        categories: (p.categories || []).map((pc) => ({
          ...pc.category,
          name: pickI18n(pc.category?.name, lang),
        })),

        brand: p.brand ? { ...p.brand, name: pickI18n(p.brand.name, lang) } : null,
      }))
    );
  } catch (err) {
    next(err);
  }
};

// UPDATE PRODUCT (image optional)
exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
    if (updateData.categoryId !== undefined) updateData.categoryId = updateData.categoryId === '' ? null : Number(updateData.categoryId);
    if (updateData.brandId !== undefined) updateData.brandId = updateData.brandId === '' ? null : Number(updateData.brandId);

    const sourceLang = updateData.sourceLang || 'uz-Latn';
    delete updateData.sourceLang;

    const product = await productService.updateProduct(id, updateData, sourceLang);

    const lang = normalizeLang(req.lang || 'uz-Latn');
    res.json({
      ...product,
      name: pickI18n(product.name, lang),
      description: pickI18n(product.description, lang),
    });
  } catch (err) {
    next(err);
  }
};

// DELETE PRODUCT
exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    await productService.deleteProduct(id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};