const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'اسم المتجر مطلوب'], trim: true },
  category: { type: String, required: true, enum: ['supermarket', 'restaurant', 'shop'] },
  image: { type: String, required: true, default: '/images/default-store.jpg' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  deliveryTime: { type: String, default: '30-45' },
  deliveryFee: { type: Number, default: 0 },
  description: { type: String, default: '' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
