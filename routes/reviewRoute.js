const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Klasör oluşturma
const uploadDir = 'uploads/reviews';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer yapılandırması (tek resim)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Sadece resim dosyaları yüklenebilir'));
  }
});

// ============================================
// FRONTEND ROUTES
// ============================================

// Ürün yorumlarını getir (public)
router.get('/product/:product_id', reviewController.getProductReviews);

// Kullanıcının değerlendirebileceği ürünleri getir
router.get('/user/:user_id/reviewable', reviewController.getUserReviewableProducts);

// Yorum ekle (tek resim)
router.post('/add', upload.single('review_image'), reviewController.addReview);

// Yorumu faydalı bul
router.post('/:review_id/helpful', reviewController.markHelpful);

// ============================================
// ADMIN ROUTES
// ============================================

// Tüm yorumları listele
router.get('/admin/list', reviewController.listAllReviews);

// Yorumu onayla/reddet
router.patch('/admin/:id/approve', reviewController.approveReview);

// Yorumu sil
router.delete('/admin/:id', reviewController.deleteReview);

module.exports = router;


