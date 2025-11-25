const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload klasörünü oluştur (yoksa)
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Alt klasörleri oluştur
const subDirs = ['products', 'categories', 'blogs', 'users', 'temp'];
subDirs.forEach(dir => {
  const fullPath = path.join(uploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Dosya storage ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // URL'den upload tipini belirle
    let folder = 'temp';
    
    if (req.baseUrl.includes('/products')) {
      folder = 'products';
    } else if (req.baseUrl.includes('/categories')) {
      folder = 'categories';
    } else if (req.baseUrl.includes('/blogs')) {
      folder = 'blogs';
    } else if (req.baseUrl.includes('/users')) {
      folder = 'users';
    }
    
    const uploadPath = path.join(uploadDir, folder);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    
    // Türkçe karakterleri düzelt
    const sanitizedName = nameWithoutExt
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-');
    
    cb(null, sanitizedName + '-' + uniqueSuffix + ext);
  }
});

// Dosya filtresi (sadece resim dosyaları)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir! (JPEG, PNG, GIF, WEBP)'), false);
  }
};

// Multer yapılandırması
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Farklı upload tipleri
const uploadMiddleware = {
  // Tek resim
  single: (fieldName) => upload.single(fieldName),
  
  // Çoklu resim (aynı field)
  multiple: (fieldName, maxCount = 10) => upload.array(fieldName, maxCount),
  
  // Farklı fieldlar
  fields: (fields) => upload.fields(fields),
  
  // Herhangi bir field
  any: () => upload.any()
};

// Hata yakalama middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Dosya boyutu çok büyük! Maksimum 5MB olabilir.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Çok fazla dosya seçildi!'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Dosya yükleme hatası: ' + err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  upload: uploadMiddleware,
  handleUploadError
};

