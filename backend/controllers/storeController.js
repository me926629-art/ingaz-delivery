const Store = require('../models/Store');
const Product = require('../models/Product');

exports.getStores = async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.category && req.query.category !== 'all') filter.category = req.query.category;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
    const stores = await Store.find(filter).sort({ rating: -1 });
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'المتجر غير موجود' });
    const products = await Product.find({ store: store._id, active: true });
    res.json({ store, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createStore = async (req, res) => {
  try {
    const store = await Store.create(req.body);
    res.status(201).json(store);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!store) return res.status(404).json({ message: 'المتجر غير موجود' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ message: 'المتجر غير موجود' });
    await Product.deleteMany({ store: store._id });
    res.json({ message: 'تم حذف المتجر' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
