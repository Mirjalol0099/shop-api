const router = require('express').Router();
const controller = require('./product.controller.js');
const validate = require('../../middlewares/validate.middleware.js');
const {productCreateSchema, productListSchema} = require('./product.schemas.js');

const auth = require('../../middlewares/auth.middleware.js');
const role = require('../../middlewares/role.middleware.js');
const upload = require('../../middlewares/upload.middleware.js');

router.get('/', validate(productListSchema), controller.getAll);
router.get('/:id', auth, controller.getOne);

// Admin
router.post('/', auth, role('ADMIN'), upload.single('image'), validate(productCreateSchema), controller.create);
router.put('/:id', auth, role('ADMIN'), upload.single('image'), controller.update);
router.delete('/:id', auth, role('ADMIN'), controller.remove);

module.exports = router;
