const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const ecommerceController = require('../controllers/ecommerceController');
const { upload } = require('../middleware/multiUploadMiddleware');

// ============================================
// ADMİN PANEL ROUTE'LARI
// ============================================

// Ürün listesi (dil bazlı veya hepsi)
router.get('/list/:language_code?', productController.listProducts);

// Yeni ürün ekle (Multer ile birden fazla resim)
router.post('/add', upload.multiple('images', 10), productController.addProduct);

// Ürün güncelle (Multer ile resim upload)
router.put('/update/:id', upload.multiple('images', 20), productController.updateProduct);

// Ürün aktifliğini toggle et
router.patch('/toggle-active/:id', productController.toggleActive);

// Ürün öne çıkarma durumunu toggle et
router.patch('/toggle-featured/:id', productController.toggleFeatured);

// Ürün sil
router.delete('/delete/:id', productController.deleteProduct);

// Ürün resmini sil
router.delete('/image/delete/:image_id', productController.deleteProductImage);

// Varyanta resim ekle (güncelleme sırasında)
router.post('/variants/:variant_id/upload-images', upload.multiple('images', 10), productController.uploadVariantImages);

// Varyant kapak resmini ayarla
router.put('/variants/:variant_id/set-cover', productController.setVariantCoverImage);

// Varyant sil
router.delete('/variants/:variant_id', productController.deleteVariant);

// Tek ürün getir (sadece numeric ID - admin için)
router.get('/:id(\\d+)', productController.singleProduct);

// ============================================
// E-TİCARET (FRONTEND) ROUTE'LARI
// ============================================

// Kategori ağacı (hiyerarşik)
router.get('/categories/:language_code?', ecommerceController.getCategories);

// Ürün arama (query parametresi ile)
router.get('/search', ecommerceController.searchProducts);

// Öne çıkan ürünler (is_featured = 1)
router.get('/featured', ecommerceController.getFeaturedProducts);

// Tek ürün detayı (slug bazlı - E-Commerce için)
router.get('/detail/:slug', ecommerceController.getSingleProduct);

// Kategoriye göre ürünleri getir (URL bazlı - E-Commerce için) - En sonda olmalı
router.get('/:category_url(*)', ecommerceController.getProductsByCategory);

module.exports = router;

