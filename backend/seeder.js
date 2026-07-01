const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Store = require('./models/Store');
const Product = require('./models/Product');

dotenv.config();

const stores = [
  { name: 'سوبرماركت التميز', category: 'supermarket', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop', rating: 4.5, deliveryTime: '30-45', deliveryFee: 15, description: 'كل ما تحتاجه من مواد غذائية وخضروات وفواكه طازجة' },
  { name: 'سوبرماركت البركة', category: 'supermarket', image: 'https://images.unsplash.com/photo-1578916171728-46686eacbf58?w=400&h=300&fit=crop', rating: 4.3, deliveryTime: '25-40', deliveryFee: 10, description: 'أسعار منافسة وجودة عالية في جميع المنتجات' },
  { name: 'سوبرماركت العائلة', category: 'supermarket', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop', rating: 4.7, deliveryTime: '20-35', deliveryFee: 12, description: 'التسوق السهل لكل أفراد العائلة بأفضل العروض' },
  { name: 'مطعم الشيف', category: 'restaurant', image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop', rating: 4.8, deliveryTime: '20-35', deliveryFee: 20, description: 'أشهى الوجبات السريعة الطازجة والمشاوي اللذيذة' },
  { name: 'مطعم الذواق', category: 'restaurant', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop', rating: 4.6, deliveryTime: '30-50', deliveryFee: 25, description: 'المشاوي الشرقية والطعام العربي الأصيل' },
  { name: 'بيتزا تايم', category: 'restaurant', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', rating: 4.4, deliveryTime: '20-30', deliveryFee: 15, description: 'بيتزا إيطالية طازجة بأنواع مختلفة' },
  { name: 'مطعم فلافل أون', category: 'restaurant', image: 'https://images.unsplash.com/photo-1593001874117-99c1f51100b5?w=400&h=300&fit=crop', rating: 4.2, deliveryTime: '15-25', deliveryFee: 10, description: 'فلافل وفول طازج بجودة عالية وأسعار مناسبة' },
  { name: 'مخبز الحاج', category: 'shop', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', rating: 4.9, deliveryTime: '15-25', deliveryFee: 8, description: 'مخبوزات طازجة يومياً - خبز ومعجنات وحلويات شرقية' },
  { name: 'عصير فيش', category: 'shop', image: 'https://images.unsplash.com/photo-1603569283847-aa2955ae0ece?w=400&h=300&fit=crop', rating: 4.5, deliveryTime: '10-20', deliveryFee: 8, description: 'عصائر طبيعية طازجة وفواكه موسمية' },
  { name: 'حلويات اللذيذة', category: 'shop', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop', rating: 4.7, deliveryTime: '20-35', deliveryFee: 12, description: 'أشهر الحلويات الشرقية والغربية الطازجة يومياً' },
  { name: 'بقالة الخير', category: 'shop', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop', rating: 4.1, deliveryTime: '10-15', deliveryFee: 5, description: 'كل ما تحتاجه من البقالة بأسعار مخفضة' },
];

const allProducts = {
  0: [ // سوبرماركت التميز
    { name: 'خضروات مشكلة', price: 35, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop', unit: 'كيلو' },
    { name: 'فواكه موسمية', price: 45, image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&h=200&fit=crop', unit: 'كيلو' },
    { name: 'أرز بسمتي', price: 28, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop', unit: 'كيلو' },
    { name: 'زيت طهي', price: 42, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop', unit: 'لتر' },
    { name: 'حليب طازج', price: 18, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop', unit: 'لتر' },
    { name: 'بيض بلدي', price: 22, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop', unit: 'كرتونة' },
  ],
  1: [ // سوبرماركت البركة
    { name: 'سكر ناعم', price: 15, image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200&h=200&fit=crop', unit: 'كيلو' },
    { name: 'شاي أحمر', price: 25, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop', unit: 'علبة' },
    { name: 'قهوة سريعة', price: 38, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=200&h=200&fit=crop', unit: 'علبة' },
    { name: 'زبدة فول سوداني', price: 32, image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=200&h=200&fit=crop', unit: 'علبة' },
    { name: 'عسل طبيعي', price: 65, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200&h=200&fit=crop', unit: 'علبة' },
  ],
  2: [ // سوبرماركت العائلة
    { name: 'منظفات منزلية', price: 18, image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=200&h=200&fit=crop', unit: 'قطعة' },
    { name: 'شامبو عناية', price: 35, image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=200&h=200&fit=crop', unit: 'زجاجة' },
    { name: 'شوكولاته', price: 20, image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=200&h=200&fit=crop', unit: 'قطعة' },
    { name: 'حفاضات أطفال', price: 45, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200&h=200&fit=crop', unit: 'علبة' },
  ],
  3: [ // مطعم الشيف
    { name: 'برجر لحم', price: 45, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop', unit: 'وجبة' },
    { name: 'برجر دجاج', price: 40, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&h=200&fit=crop', unit: 'وجبة' },
    { name: 'ساندويتش شاورما لحم', price: 35, image: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=200&h=200&fit=crop', unit: 'ساندويتش' },
    { name: 'وجبة ناجتس', price: 25, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=200&h=200&fit=crop', unit: 'وجبة' },
  ],
  4: [ // مطعم الذواق
    { name: 'كباب لحم', price: 55, image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=200&h=200&fit=crop', unit: 'طبق' },
    { name: 'شيش طاووق', price: 50, image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&h=200&fit=crop', unit: 'طبق' },
    { name: 'مندي لحم', price: 70, image: 'https://images.unsplash.com/photo-1668236543090-82bba155b801?w=200&h=200&fit=crop', unit: 'طبق' },
  ],
  5: [ // بيتزا تايم
    { name: 'بيتزا مارجريتا', price: 40, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop', unit: 'قطعة' },
    { name: 'بيتزا بيبروني', price: 48, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&h=200&fit=crop', unit: 'قطعة' },
    { name: 'بيتزا دجاج', price: 50, image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=200&h=200&fit=crop', unit: 'قطعة' },
  ],
  6: [ // فلافل أون
    { name: 'ساندويتش فلافل', price: 15, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&h=200&fit=crop', unit: 'ساندويتش' },
    { name: 'طبق فلافل', price: 20, image: 'https://images.unsplash.com/photo-1593023311830-2f0d9b1f9a7a?w=200&h=200&fit=crop', unit: 'طبق' },
    { name: 'حمص بالطحينة', price: 18, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop', unit: 'طبق' },
  ],
  7: [ // مخبز الحاج
    { name: 'خبز عربي', price: 5, image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=200&h=200&fit=crop', unit: 'ربطة' },
    { name: 'كرواسون', price: 12, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038028a?w=200&h=200&fit=crop', unit: 'قطعة' },
    { name: 'مناقيش زعتر', price: 10, image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=200&h=200&fit=crop', unit: 'قطعة' },
  ],
  8: [ // عصير فيش
    { name: 'عصير برتقال طازج', price: 18, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=200&h=200&fit=crop', unit: 'كوب' },
    { name: 'عصير مانجو', price: 22, image: 'https://images.unsplash.com/photo-1546173152-0b0f2c3a0f5a?w=200&h=200&fit=crop', unit: 'كوب' },
    { name: 'ميلك شيك شوكولاته', price: 28, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop', unit: 'كوب' },
  ],
  9: [ // حلويات اللذيذة
    { name: 'كنافة نابلسية', price: 35, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&h=200&fit=crop', unit: 'كيلو' },
    { name: 'بقلاوة مشكلة', price: 40, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&h=200&fit=crop', unit: 'كيلو' },
    { name: 'كيك شوكولاته', price: 25, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop', unit: 'قطعة' },
  ],
  10: [ // بقالة الخير
    { name: 'مشروبات غازية', price: 8, image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=200&h=200&fit=crop', unit: 'علبة' },
    { name: 'شيبس', price: 5, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d7b?w=200&h=200&fit=crop', unit: 'كيس' },
    { name: 'لبن زبادي', price: 12, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop', unit: 'علبة' },
  ],
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Store.deleteMany({});
    await Product.deleteMany({});

    const admin = await User.create({
      name: 'مشرف انجاز',
      email: 'admin@ingaz.com',
      password: '123456',
      phone: '01000000000',
      role: 'admin',
    });
    console.log(`Admin created: ${admin.email} / password: 123456`);

    const customer = await User.create({
      name: 'عميل تجريبي',
      email: 'customer@ingaz.com',
      password: '123456',
      phone: '01111111111',
      role: 'customer',
    });
    console.log(`Customer created: ${customer.email} / password: 123456`);

    for (let i = 0; i < stores.length; i++) {
      const store = await Store.create(stores[i]);
      console.log(`Store created: ${store.name}`);

      const products = allProducts[i] || [];
      for (const p of products) {
        await Product.create({ ...p, store: store._id });
      }
      console.log(`  ${products.length} products added`);
    }

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
