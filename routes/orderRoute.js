const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Sipariş oluştur
router.post('/create', orderController.createOrder);

// Kullanıcının siparişlerini getir (Authentication gerekli)
router.get('/user/orders', authMiddleware, orderController.getUserOrders);

// Admin - Bekleyen sipariş sayısını getir (spesifik route'lar önce!)
router.get('/admin/pending-count', orderController.getPendingOrdersCount);

// Admin - Tüm siparişleri getir
router.get('/admin/all', orderController.getAllOrders);

// Admin - Sipariş güncelle
router.put('/admin/update/:id', orderController.updateOrder);

// Sipariş detayını order_number ile getir (dinamik route en sona!)
router.get('/:order_number', orderController.getOrderByNumber);

module.exports = router;

