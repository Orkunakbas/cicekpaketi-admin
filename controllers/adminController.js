const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');

// JWT Secret (gerçek projede .env'den gelir)
const JWT_SECRET = 'orwys-cms-secret-key-2024';

// Login controller
exports.login = async (req, res) => {
  try {
    // Hem JSON hem form data destekle
    const { username, password } = req.body; // Frontend'den hala username geliyor

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-posta ve şifre gereklidir.'
      });
    }

    // Database'den user bulma (email alanında ara)
    const user = await Admin.findOne({ 
      where: { email: username } // username aslında email
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
        email: user.email,
        fullname: user.fullname,
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
      message: 'Giriş başarılı!',
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
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