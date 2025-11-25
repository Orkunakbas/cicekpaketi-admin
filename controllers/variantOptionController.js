const VariantOptionType = require('../models/variantOptionTypeModel');
const VariantOptionValue = require('../models/variantOptionValueModel');

// ============================================
// VARIANT OPTION TYPES (Renk, Beden, Malzeme)
// ============================================

// Tüm tipleri listele
exports.listOptionTypes = async (req, res) => {
  try {
    const { language_code } = req.params;
    
    // Dil varsa filtrele, yoksa hepsini getir
    const whereClause = language_code ? { language_code } : {};
    
    const optionTypes = await VariantOptionType.findAll({
      where: whereClause,
      order: [['id', 'ASC']],
      raw: true
    });

    // Her tip için değer sayısını ekle
    const optionTypesWithCount = await Promise.all(
      optionTypes.map(async (type) => {
        const valueCount = await VariantOptionValue.count({
          where: { 
            option_type_id: type.id,
            language_code: language_code || null
          }
        });
        return { ...type, valueCount };
      })
    );

    res.status(200).json({
      success: true,
      data: optionTypesWithCount
    });
  } catch (error) {
    console.error('Option types listesi alınırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Option types getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tek bir tip getir
exports.getSingleOptionType = async (req, res) => {
  try {
    const { id } = req.params;

    const optionType = await VariantOptionType.findByPk(id);

    if (!optionType) {
      return res.status(404).json({
        success: false,
        message: 'Option type bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: optionType
    });
  } catch (error) {
    console.error('Option type getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Option type getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Yeni tip ekle
exports.addOptionType = async (req, res) => {
  try {
    const { name, language_code } = req.body;

    // Validasyon
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name zorunludur'
      });
    }

    const optionType = await VariantOptionType.create({
      name,
      language_code: language_code || null
    });

    res.status(201).json({
      success: true,
      message: 'Option type başarıyla eklendi',
      data: optionType
    });
  } catch (error) {
    console.error('Option type ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Option type eklenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tip güncelle
exports.updateOptionType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, language_code } = req.body;

    const optionType = await VariantOptionType.findByPk(id);

    if (!optionType) {
      return res.status(404).json({
        success: false,
        message: 'Option type bulunamadı'
      });
    }

    await optionType.update({
      name: name || optionType.name,
      language_code: language_code || optionType.language_code
    });

    res.status(200).json({
      success: true,
      message: 'Option type başarıyla güncellendi',
      data: optionType
    });
  } catch (error) {
    console.error('Option type güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Option type güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tip sil
exports.deleteOptionType = async (req, res) => {
  try {
    const { id } = req.params;

    const optionType = await VariantOptionType.findByPk(id);

    if (!optionType) {
      return res.status(404).json({
        success: false,
        message: 'Option type bulunamadı'
      });
    }

    // Bu tipe ait değerleri kontrol et
    const values = await VariantOptionValue.findAll({
      where: { option_type_id: id }
    });

    if (values.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu tipe ait değerler var, önce onları silin'
      });
    }

    await optionType.destroy();

    res.status(200).json({
      success: true,
      message: 'Option type başarıyla silindi'
    });
  } catch (error) {
    console.error('Option type silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Option type silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// ============================================
// VARIANT OPTION VALUES (Siyah, 42, Deri)
// ============================================

// Tüm değerleri listele
exports.listOptionValues = async (req, res) => {
  try {
    const { language_code } = req.params;
    const { option_type_id } = req.query;
    
    // Dil varsa filtrele, yoksa hepsini getir
    const whereClause = {};
    if (language_code) whereClause.language_code = language_code;
    if (option_type_id) whereClause.option_type_id = option_type_id;
    
    const optionValues = await VariantOptionValue.findAll({
      where: whereClause,
      order: [['id', 'ASC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: optionValues
    });
  } catch (error) {
    console.error('Option values listesi alınırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Option values getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tek bir değer getir
exports.getSingleOptionValue = async (req, res) => {
  try {
    const { id } = req.params;

    const optionValue = await VariantOptionValue.findByPk(id);

    if (!optionValue) {
      return res.status(404).json({
        success: false,
        message: 'Option value bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: optionValue
    });
  } catch (error) {
    console.error('Option value getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Option value getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Yeni değer ekle
exports.addOptionValue = async (req, res) => {
  try {
    const { option_type_id, value, language_code, color_code } = req.body;

    // Validasyon
    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'Value zorunludur'
      });
    }

    const optionValue = await VariantOptionValue.create({
      option_type_id: option_type_id || null,
      value,
      language_code: language_code || null,
      color_code: color_code || null
    });

    res.status(201).json({
      success: true,
      message: 'Option value başarıyla eklendi',
      data: optionValue
    });
  } catch (error) {
    console.error('Option value ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Option value eklenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Değer güncelle
exports.updateOptionValue = async (req, res) => {
  try {
    const { id } = req.params;
    const { option_type_id, value, language_code, color_code } = req.body;

    const optionValue = await VariantOptionValue.findByPk(id);

    if (!optionValue) {
      return res.status(404).json({
        success: false,
        message: 'Option value bulunamadı'
      });
    }

    await optionValue.update({
      option_type_id: option_type_id !== undefined ? option_type_id : optionValue.option_type_id,
      value: value || optionValue.value,
      language_code: language_code || optionValue.language_code,
      color_code: color_code !== undefined ? color_code : optionValue.color_code
    });

    res.status(200).json({
      success: true,
      message: 'Option value başarıyla güncellendi',
      data: optionValue
    });
  } catch (error) {
    console.error('Option value güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Option value güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Değer sil
exports.deleteOptionValue = async (req, res) => {
  try {
    const { id } = req.params;

    const optionValue = await VariantOptionValue.findByPk(id);

    if (!optionValue) {
      return res.status(404).json({
        success: false,
        message: 'Option value bulunamadı'
      });
    }

    await optionValue.destroy();

    res.status(200).json({
      success: true,
      message: 'Option value başarıyla silindi'
    });
  } catch (error) {
    console.error('Option value silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Option value silinirken bir hata oluştu',
      error: error.message
    });
  }
};

