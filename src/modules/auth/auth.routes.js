const router = require('express').Router();
const controller = require('./auth.controller.js');
const validate = require('../../middlewares/validate.middleware.js');
const {registerSchema, loginSchema} = require('./auth.schemas.js');

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);

module.exports = router;