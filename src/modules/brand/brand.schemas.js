const { z, idSchema, langEnum } = require('../../utils/zod.helpers');

exports.brandCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    sourceLang: langEnum,
  }),
});

exports.brandUpdateSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    name: z.string().trim().min(1),
    sourceLang: langEnum.optional(),
  }),
});