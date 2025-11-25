const express = require('express');
const router = express.Router();
const variantOptionController = require('../controllers/variantOptionController');

// ============================================
// VARIANT OPTION TYPES (Renk, Beden, Malzeme)
// ============================================

// Liste (dil opsiyonel)
router.get('/types/list/:language_code?', variantOptionController.listOptionTypes);

// Tekil
router.get('/types/:id', variantOptionController.getSingleOptionType);

// Ekle
router.post('/types/add', variantOptionController.addOptionType);

// Güncelle
router.put('/types/update/:id', variantOptionController.updateOptionType);

// Sil
router.delete('/types/delete/:id', variantOptionController.deleteOptionType);

// ============================================
// VARIANT OPTION VALUES (Siyah, 42, Deri)
// ============================================

// Liste (dil opsiyonel, query ile option_type_id filtrelenebilir)
router.get('/values/list/:language_code?', variantOptionController.listOptionValues);

// Tekil
router.get('/values/:id', variantOptionController.getSingleOptionValue);

// Ekle
router.post('/values/add', variantOptionController.addOptionValue);

// Güncelle
router.put('/values/update/:id', variantOptionController.updateOptionValue);

// Sil
router.delete('/values/delete/:id', variantOptionController.deleteOptionValue);

module.exports = router;


