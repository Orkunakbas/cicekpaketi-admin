const express = require('express');
const router = express.Router();
const termController = require('../controllers/termController');

// Tüm sözleşmeleri listele
router.get('/list', termController.listTerms);

// Tek sözleşme getir
router.get('/:id', termController.singleTerm);

// Yeni sözleşme ekle
router.post('/add', termController.addTerm);

// Sözleşme güncelle
router.put('/update/:id', termController.updateTerm);

// Sözleşme sıralamasını güncelle
router.put('/rank/update', termController.updateTermRank);

// Sözleşme sil
router.delete('/delete/:id', termController.deleteTerm);

module.exports = router;

