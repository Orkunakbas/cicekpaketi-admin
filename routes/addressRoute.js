const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const authMiddleware = require('../middleware/authMiddleware');

// Tüm address route'ları auth gerektirir
router.use(authMiddleware);

// Tek adres getir
router.get('/:id', addressController.singleAddress);

// Yeni adres ekle
router.post('/add', addressController.addAddress);

// Adres sil
router.delete('/delete/:id', addressController.deleteAddress);

// Varsayılan adresi ayarla
router.patch('/set-default/:id', addressController.setDefaultAddress);

module.exports = router;

