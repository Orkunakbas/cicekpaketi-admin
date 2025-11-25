const express = require('express');
const router = express.Router();
const productController = require('../../controllers/productController');
const { upload } = require('../../middleware/multiUploadMiddleware');

// Admin - Tüm ürünleri listele (aktif/pasif fark etmez)
router.get('/list/:language_code?', productController.listProducts);

// Admin - Tek ürün detayı
router.get('/:id', productController.singleProduct);

// Admin - Yeni ürün ekle
router.post('/add', upload.multiple('images', 10), productController.addProduct);

// Admin - Ürün güncelle
router.put('/update/:id', upload.multiple('images', 20), productController.updateProduct);

// Admin - Ürün aktifliğini toggle et
router.patch('/toggle-active/:id', productController.toggleActive);

// Admin - Ürün öne çıkarma durumunu toggle et
router.patch('/toggle-featured/:id', productController.toggleFeatured);

// Admin - Ürün sil
router.delete('/delete/:id', productController.deleteProduct);

// Admin - Ürün resmini sil
router.delete('/image/delete/:image_id', productController.deleteProductImage);

// Admin - Varyanta resim ekle
router.post('/variants/:variant_id/upload-images', upload.multiple('images', 10), productController.uploadVariantImages);

// Admin - Varyant kapak resmini ayarla
router.put('/variants/:variant_id/set-cover', productController.setVariantCoverImage);

// Admin - Varyant sil
router.delete('/variants/:variant_id', productController.deleteVariant);

module.exports = router;




