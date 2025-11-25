const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Token'ı header'dan al
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme token\'ı bulunamadı'
      });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Kullanıcı bilgisini request'e ekle
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Yetkilendirme hatası',
      error: error.message
    });
  }
};

module.exports = authMiddleware;


