const res = require('express/lib/response');
const authService = require('./auth.service.js');

exports.register = async (req, res, next) => {
    try {
        const {name, email, password, role} = req.body;
        const data = await authService.register({name, email, password, role});
        res.json(data);
    }
    catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const data = await authService.login({email, password});
        res.json(data);
    } catch (err) {
        next(err);
    }
};