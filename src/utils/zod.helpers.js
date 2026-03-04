const { z } = require('zod');

const toNumber = (v) =>
  v === '' || v === null || v === undefined ? undefined : Number(v);

const idSchema = z.preprocess(toNumber, z.number().int().positive());

const optionalIdSchema = z.preprocess(
  toNumber,
  z.number().int().positive().optional()
);

const langEnum = z.enum(['uz-Latn', 'uz-Cyrl', 'ru']).optional();

module.exports = {
  z,
  toNumber,
  idSchema,
  optionalIdSchema,
  langEnum,
};