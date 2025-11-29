const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Bu Ay İstatistikleri
router.get('/monthly-stats', dashboardController.getMonthlyStats);

// Toplam İstatistikler
router.get('/total-stats', dashboardController.getTotalStats);

// En Çok Satan Ürünler
router.get('/top-products', dashboardController.getTopProducts);

// En Son Üyeler
router.get('/recent-users', dashboardController.getRecentUsers);

module.exports = router;

