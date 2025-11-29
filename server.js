const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const sequelize = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Rate limiting (daha gevşek)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});

// Middleware
app.use(limiter);
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Resimler için limit artırıldı
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Trust proxy for rate limiter
app.set('trust proxy', 1);

// Uploads klasörünü static olarak serve et
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/admin', require('./routes/adminRoute'));
app.use('/api/languages', require('./routes/languageRoute'));
app.use('/api/categories', require('./routes/categoryRoute'));
app.use('/api/banners', require('./routes/bannerRoute'));
app.use('/api/terms', require('./routes/termRoute'));
app.use('/api/users', require('./routes/userRoute'));
app.use('/api/variant-options', require('./routes/variantOptionRoute'));
app.use('/api/products', require('./routes/productRoute'));
app.use('/api/addresses', require('./routes/addressRoute'));
app.use('/api/cart', require('./routes/cartRoute'));
app.use('/api/orders', require('./routes/orderRoute'));
app.use('/api/dashboard', require('./routes/dashboardRoute'));
app.use('/api/reviews', require('./routes/reviewRoute'));


// Production modunda Next.js build'ini serve et
if (!isDevelopment) {
  // Serve Next.js static files
  app.use('/_next', express.static(path.join(__dirname, 'admin/.next')));
  app.use('/static', express.static(path.join(__dirname, 'admin/.next/static')));

  // Serve admin panel (Next.js build)
  app.use(express.static(path.join(__dirname, 'admin/out')));

  // Catch all handler for admin panel routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Serve admin panel
    res.sendFile(path.join(__dirname, 'admin/out/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Database bağlantısını test et
sequelize.authenticate()
  .then(() => {
    console.log('✅ Veritabanına başarıyla bağlandı.');
  })
  .catch(err => {
    console.error('❌ Veritabanı bağlantı hatası:', err);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  if (isDevelopment) {
    console.log(`🎨 Admin panel: http://localhost:3001 (Next.js dev server)`);
    console.log(`⚡ Development mode - Hot reload enabled!`);
    console.log(`💡 Run 'npm run dev' to start both API and admin panel`);
  } else {
    console.log(`🎨 Admin panel: http://localhost:${PORT}`);
    console.log(`🚀 Production mode - Single port setup!`);
  }
}); 