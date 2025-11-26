const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Sipariş oluştur
router.post('/create', orderController.createOrder);

// Kullanıcının siparişlerini getir (Authentication gerekli)
router.get('/user/orders', authMiddleware, orderController.getUserOrders);

// Sipariş detayını order_number ile getir
router.get('/:order_number', orderController.getOrderByNumber);

module.exports = router;

