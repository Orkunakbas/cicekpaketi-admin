const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { upload } = require('../middleware/multiUploadMiddleware');

// ========================================
// ADMIN PANEL ROUTES
// ========================================

// Kategorileri listele (Düz liste - Admin için)
router.get('/list/:language_code?', categoryController.listCategories);

// ========================================
// E-TİCARET FRONTEND ROUTES
// ========================================

// Kategorileri hiyerarşik yapıda getir (E-Ticaret için - Menü, Breadcrumb vb.)
router.get('/e-commerce/:language_code?', categoryController.getEcommerceCategories);

// Tek kategori getir
router.get('/:id', categoryController.singleCategory);

// Yeni kategori ekle (Resim yüklemeli)
router.post('/add', upload.single('image'), categoryController.addCategory);

// Kategori güncelle (Resim yüklemeli)
router.put('/update/:id', upload.single('image'), categoryController.updateCategory);

// Kategori rank güncelle
router.patch('/rank/:id', categoryController.updateCategoryRank);

// Kategori sil
router.delete('/delete/:id', categoryController.deleteCategory);

module.exports = router;

