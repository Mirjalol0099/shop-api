const router = require('express').Router();
const controller = require('./user.controller.js');


const auth = require('../../middlewares/auth.middleware.js');
const role = require('../../middlewares/role.middleware.js');

//get all users
router.get('/', auth, role('ADMIN'), controller.getAll);


module.exports = router;