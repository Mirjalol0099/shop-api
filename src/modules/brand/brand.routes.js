const router = require('express').Router();
const controller = require('./brand.controller.js');
const validate = require('../../middlewares/validate.middleware.js');

const auth = require('../../middlewares/auth.middleware.js');
const role = require('../../middlewares/role.middleware.js');

const {brandUpdateSchema, brandCreateSchema} = require('./brand.schemas.js');

router.get('/', controller.getAll);
router.post('/', auth, role('ADMIN'), validate(brandCreateSchema), controller.create);
router.put('/:id', auth, role('ADMIN'), validate(brandUpdateSchema), controller.update);
router.delete('/:id', auth, role('ADMIN'), controller.remove);

module.exports = router;