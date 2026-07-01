const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'الاسم مطلوب'], trim: true },
  email: { type: String, required: [true, 'البريد الإلكتروني مطلوب'], unique: true, lowercase: true },
  password: { type: String, required: [true, 'كلمة المرور مطلوبة'], minlength: 6, select: false },
  phone: { type: String, required: [true, 'رقم الهاتف مطلوب'] },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  address: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
