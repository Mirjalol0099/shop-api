const router = require('express').Router();
const prisma = require('../../prismaClient.js');

router.get('/', async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e) {
    e.status = 503;
    next(e);
  }
});

module.exports = router;
