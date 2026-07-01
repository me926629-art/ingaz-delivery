const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { customerName, phone, address, paymentMethod, notes, items } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'السلة فارغة' });
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const orderData = { customerName, phone, address, paymentMethod: paymentMethod || 'cash', notes, items, total };
    if (req.user) orderData.user = req.user._id;
    const order = await Order.create(orderData);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find().sort('-createdAt').populate('items.store', 'name');
    } else {
      orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.store', 'name');
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
    if (req.user.role !== 'admin' && order.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح به' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
