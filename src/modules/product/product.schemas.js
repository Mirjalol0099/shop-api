const { z, idSchema,optionalIdSchema, langEnum, toNumber } = require('../../utils/zod.helpers');

const toBool = (v) => {
  if (v === true || v === false) return v;
  if (typeof v === 'string') {
    const s = v.toLowerCase().trim();
    if (s === 'true') return true;
    if (s === 'false') return false;
  }
  return undefined;
};

const parseIds = (v) => {
  if (v == null || v === '') return [];

  if (Array.isArray(v)) return v;

  if (typeof v === 'string') {
    const s = v.trim();

    if (s.startsWith('[') && s.endsWith(']')) {
      try {
        const arr = JSON.parse(s);
        return Array.isArray(arr) ? arr : [];
      } catch {
        // fall through
      }
    }

    // CSV
    if (s.includes(',')) return s.split(',').map((x) => x.trim());

    // single
    return [s];
  }

  // fallback
  return [v];
};

exports.productCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    description: z.string().optional().nullable(),
    sourceLang: langEnum,

    price: z.preprocess((v) => Number(v), z.number().positive()),
    stock: z.preprocess((v) => Number(v), z.number().int().nonnegative()),

    brandId: optionalIdSchema,

    categoryIds: z
      .preprocess(parseIds, z.array(idSchema).max(20))
      .optional()
      .default([]),
  }),
});
exports.productListSchema = z.object({
  query: z.object({
    lang: langEnum,

    brandId: optionalIdSchema,
    categoryId: optionalIdSchema,

    page: z.preprocess(toNumber, z.number().int().positive()).default(1),
    limit: z.preprocess(toNumber, z.number().int().positive().max(100)).default(20),

    sort: z
      .enum(['createdAt_desc', 'createdAt_asc', 'price_asc', 'price_desc', 'stock_asc', 'stock_desc'])
      .optional()
      .default('createdAt_desc'),

    search: z.string().trim().min(1).optional(),

    minPrice: z.preprocess(toNumber, z.number().min(0).optional()),
    maxPrice: z.preprocess(toNumber, z.number().min(0).optional()),

    inStock: z.preprocess(toBool, z.boolean().optional()),
  }).refine(
    (q) => q.minPrice == null || q.maxPrice == null || q.minPrice <= q.maxPrice,
    { message: 'minPrice must be <= maxPrice', path: ['maxPrice'] }
  ),
});