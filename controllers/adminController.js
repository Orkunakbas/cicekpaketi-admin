const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');

// JWT Secret (gerçek projede .env'den gelir)
const JWT_SECRET = 'orwys-cms-secret-key-2024';

// Login controller
exports.login = async (req, res) => {
  try {
    // Hem JSON hem form data destekle
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username ve password gerekli!'
      });
    }

    // Database'den user bulma
    const user = await Admin.findOne({ 
      where: { username: username } 
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      });
    }

    // Password kontrolü (gerçek projede bcrypt kullanılır)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Şifre yanlış!'
      });
    }

    // JWT Token oluştur
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        authority: user.authority 
      },
      JWT_SECRET,
      { 
        expiresIn: '24h' // 24 saat geçerli
      }
    );

    // Başarılı login
    res.json({
      success: true,
      message: 'Login başarılı!',
      user: {
        id: user.id,
        username: user.username,
        authority: user.authority
      },
      token: token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server hatası!'
    });
  }
}; 