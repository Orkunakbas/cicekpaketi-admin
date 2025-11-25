const Language = require('../models/languageModel');

// Tüm dilleri getir
exports.getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.findAll({
      attributes: ['id', 'code', 'name', 'is_active', 'is_default'],
      order: [['id', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: languages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Diller getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Yeni dil ekle
exports.createLanguage = async (req, res) => {
  try {
    const { code, name, is_active, is_default } = req.body;
    
    // Aynı kod ile dil var mı kontrol et
    const existingLanguage = await Language.findOne({ where: { code } });
    if (existingLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Bu dil kodu zaten mevcut'
      });
    }
    
    // Eğer varsayılan dil olarak işaretlendiyse, diğerlerini güncelle
    if (is_default) {
      await Language.update(
        { is_default: false },
        { where: { is_default: true } }
      );
    }
    
    const language = await Language.create({
      code,
      name,
      is_active: is_active !== undefined ? is_active : true,
      is_default: is_default || false
    });
    
    res.status(201).json({
      success: true,
      message: 'Dil başarıyla eklendi',
      data: language
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Dil eklenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Dil sil
exports.deleteLanguage = async (req, res) => {
  try {
    const language = await Language.findByPk(req.params.id);
    
    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Dil bulunamadı'
      });
    }
    
    // Varsayılan dil silinmesin
    if (language.is_default) {
      return res.status(400).json({
        success: false,
        message: 'Varsayılan dil silinemez'
      });
    }
    
    await language.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Dil başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Dil silinirken bir hata oluştu',
      error: error.message
    });
  }
};

