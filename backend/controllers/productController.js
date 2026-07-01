const Product = require('../models/Product');
const Store = require('../models/Store');

exports.getProductsByStore = async (req, res) => {
  try {
    const products = await Product.find({ store: req.params.storeId, active: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const store = await Store.findById(req.body.store);
    if (!store) return res.status(404).json({ message: 'المتجر غير موجود' });
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json({ message: 'تم حذف المنتج' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
