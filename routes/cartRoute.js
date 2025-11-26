const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Sepeti getir
router.get('/', cartController.getCart);

// Sepete ürün ekle
router.post('/add', cartController.addToCart);

// Sepet ürününü güncelle (adet değiştir)
router.put('/update/:id', cartController.updateCartItem);

// Sepetten ürün sil
router.delete('/remove/:id', cartController.removeFromCart);

// Sepeti temizle
router.delete('/clear', cartController.clearCart);

module.exports = router;


