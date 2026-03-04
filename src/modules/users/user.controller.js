const service = require('./user.service.js');

exports.getAll = async (req, res, next) => {
    try {
        const users = await service.getAll();
        res.json(users);
    } catch (e) {
        next(e);
    }
};