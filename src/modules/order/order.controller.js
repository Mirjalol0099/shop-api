const orderService = require('./order.service.js');

exports.create = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    const order = await orderService.createOrder(userId, items);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.getMine = async (req, res, next) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const order = await orderService.updateStatus(id, status);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await orderService.deleteOrder(id);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};