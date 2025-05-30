const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Login route
router.post('/login', adminController.login);

module.exports = router; 