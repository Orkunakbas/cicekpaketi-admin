const User = require('../models/userModel');
const Address = require('../models/addressModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Kullanıcı kaydı
exports.register = async (req, res) => {
  try {
    const { name, surname, email, phone, password } = req.body;

    // Validasyon
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre zorunludur'
      });
    }

    // Email kontrolü
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcı oluştur
    const user = await User.create({
      name,
      surname,
      email,
      phone,
      password: hashedPassword
    });

    // JWT token oluştur
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      data: {
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          phone: user.phone
        },
        token
      }
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasyon
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre zorunludur'
      });
    }

    // Kullanıcı kontrolü
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          phone: user.phone
        },
        token
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu',
      error: error.message
    });
  }
};

// Şifremi unuttum (Mail gönderme işlemi sonra eklenecek)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email zorunludur'
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı'
      });
    }

    // TODO: Token oluştur, veritabanına kaydet ve mail gönder
    // Bu kısım mail servisi entegre edildiğinde tamamlanacak

    res.status(200).json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi'
    });
  } catch (error) {
    console.error('Şifremi unuttum hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İşlem sırasında bir hata oluştu',
      error: error.message
    });
  }
};

// Şifre sıfırlama (Token doğrulama sonra eklenecek)
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token ve yeni şifre zorunludur'
      });
    }

    // TODO: Token doğrulama ve şifre güncelleme
    // Bu kısım mail servisi entegre edildiğinde tamamlanacak

    res.status(200).json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İşlem sırasında bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcı profili getir
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Kullanıcının adreslerini çek (ilk eklenen en üstte)
    const addresses = await Address.findAll({
      where: { user_id: req.user.id },
      order: [['id', 'ASC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        addresses: addresses
      }
    });
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Profil getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcı profili güncelle
exports.updateProfile = async (req, res) => {
  try {
    const { name, surname, phone } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    await user.update({
      name: name || user.name,
      surname: surname || user.surname,
      phone: phone || user.phone
    });

    res.status(200).json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      data: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Profil güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// ============================================
// ADMIN PANEL İÇİN KULLANICI YÖNETİMİ
// ============================================

// Tüm kullanıcıları listele
exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar listelenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tek bir kullanıcı getir
exports.getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Yeni kullanıcı ekle (Admin tarafından)
exports.addUser = async (req, res) => {
  try {
    const { name, surname, email, phone, password } = req.body;

    // Validasyon
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre zorunludur'
      });
    }

    // Email kontrolü
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcı oluştur
    const user = await User.create({
      name,
      surname,
      email,
      phone,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla eklendi',
      data: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Kullanıcı ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı eklenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcı güncelle (Admin tarafından)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, email, phone, password } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Email değişikliği varsa kontrol et
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Bu email adresi zaten kullanılıyor'
        });
      }
    }

    // Güncellenecek veriler
    const updateData = {
      name: name || user.name,
      surname: surname || user.surname,
      email: email || user.email,
      phone: phone || user.phone
    };

    // Şifre değişikliği varsa hashle
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcı sil
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinirken bir hata oluştu',
      error: error.message
    });
  }
};

