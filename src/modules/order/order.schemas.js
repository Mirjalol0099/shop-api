const { z, idSchema } = require('../../utils/zod.helpers');

exports.orderCreateSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: idSchema,
        quantity: z.number().int().positive(),
      })
    ).min(1),
  }),
});

exports.orderStatusSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    status: z.enum(['PENDING', 'PAID', 'CANCELED']),
  }),
});