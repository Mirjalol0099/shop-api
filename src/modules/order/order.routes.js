const router = require('express').Router();
const controller = require('./order.controller.js');

const auth = require('../../middlewares/auth.middleware.js');
const role = require('../../middlewares/role.middleware.js');

const validate = require('../../middlewares/validate.middleware.js');
const {orderCreateSchema, orderStatusSchema} = require('./order.schemas.js');

router.post('/', auth, validate(orderCreateSchema), controller.create);
router.get('/me', auth, controller.getMine)

//Admin barcha buyurtmalarni korish
router.get('/', auth, role('ADMIN'), controller.getAll);

//Admin statusni o'zgartirish
router.patch('/:id/status', auth, role('ADMIN'), validate(orderStatusSchema), controller.updateStatus);

//Admin yaratilgan buyurtmani o'chirish
router.delete('/:id', auth, role('ADMIN'), controller.remove);

module.exports = router;