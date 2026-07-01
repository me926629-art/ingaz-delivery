const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name: String,
  price: Number,
  qty: { type: Number, required: true, min: 1 },
  image: String,
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: [true, 'اسم العميل مطلوب'] },
  phone: { type: String, required: [true, 'رقم الهاتف مطلوب'] },
  address: { type: String, required: [true, 'العنوان مطلوب'] },
  paymentMethod: { type: String, enum: ['cash', 'card'], default: 'cash' },
  notes: { type: String, default: '' },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
