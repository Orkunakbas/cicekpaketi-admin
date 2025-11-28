const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { upload } = require('../middleware/multiUploadMiddleware');

// ========================================
// ADMIN PANEL ROUTES
// ========================================

// Banner'ları listele
router.get('/list/:language_code?', bannerController.listBanners);

// Tek banner getir
router.get('/:id', bannerController.singleBanner);

// Yeni banner ekle (Tek resim yüklemeli: banner_image)
router.post('/add', upload.fields([
  { name: 'banner_image', maxCount: 1 }
]), bannerController.addBanner);

// Banner güncelle (Tek resim yüklemeli: banner_image)
router.put('/update/:id', upload.fields([
  { name: 'banner_image', maxCount: 1 }
]), bannerController.updateBanner);

// Banner rank güncelle
router.patch('/rank/:id', bannerController.updateBannerRank);

// Banner resmini sil
router.delete('/image/delete/:id', bannerController.deleteBannerImage);

// Banner sil
router.delete('/delete/:id', bannerController.deleteBanner);

module.exports = router;

