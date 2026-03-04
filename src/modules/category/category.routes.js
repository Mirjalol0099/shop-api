const router = require('express').Router();
const controller = require('./category.controller.js');
const validate = require('../../middlewares/validate.middleware.js');
const {categoryCreateSchema, categoryUpdateSchema} = require('./category.schemas.js');

const auth = require('../../middlewares/auth.middleware.js');
const role = require('../../middlewares/role.middleware.js');

router.get('/', controller.getAll);
router.post('/', auth, role('ADMIN'), validate(categoryCreateSchema), controller.create);
router.put('/:id', auth, role('ADMIN'), validate(categoryUpdateSchema), controller.update);
router.delete('/:id', auth, role('ADMIN'), controller.remove);

module.exports = router;