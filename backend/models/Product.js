const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: [true, 'اسم المنتج مطلوب'], trim: true },
  price: { type: Number, required: [true, 'السعر مطلوب'], min: 0 },
  image: { type: String, default: '/images/default-product.jpg' },
  unit: { type: String, default: 'قطعة' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
