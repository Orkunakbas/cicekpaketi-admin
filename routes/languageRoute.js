const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');

// Tüm dilleri listele
router.get('/list', languageController.getAllLanguages);

// Yeni dil ekle
router.post('/add', languageController.createLanguage);

// Dil sil
router.delete('/delete/:id', languageController.deleteLanguage);

module.exports = router;

