const Term = require('../models/termModel');

// Tüm sözleşmeleri listele
exports.listTerms = async (req, res) => {
  try {
    const { language_code } = req.query;
    
    const where = language_code ? { language_code } : {};
    
    const terms = await Term.findAll({
      where,
      order: [['rank', 'ASC'], ['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: terms
    });
  } catch (error) {
    console.error('❌ Sözleşme listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sözleşmeler listelenirken hata oluştu',
      error: error.message
    });
  }
};

// Tek sözleşme getir
exports.singleTerm = async (req, res) => {
  try {
    const { id } = req.params;

    const term = await Term.findByPk(id);

    if (!term) {
      return res.status(404).json({
        success: false,
        message: 'Sözleşme bulunamadı'
      });
    }

    res.json({
      success: true,
      data: term
    });
  } catch (error) {
    console.error('❌ Sözleşme getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sözleşme getirilirken hata oluştu',
      error: error.message
    });
  }
};

// Yeni sözleşme ekle
exports.addTerm = async (req, res) => {
  try {
    const { title, description, language_code, rank } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Başlık ve açıklama zorunludur'
      });
    }

    const term = await Term.create({
      title,
      description,
      language_code: language_code || 'tr',
      rank: rank || 0
    });

    res.status(201).json({
      success: true,
      message: 'Sözleşme başarıyla eklendi',
      data: term
    });
  } catch (error) {
    console.error('❌ Sözleşme ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sözleşme eklenirken hata oluştu',
      error: error.message
    });
  }
};

// Sözleşme güncelle
exports.updateTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, language_code, rank } = req.body;

    const term = await Term.findByPk(id);

    if (!term) {
      return res.status(404).json({
        success: false,
        message: 'Sözleşme bulunamadı'
      });
    }

    await term.update({
      title: title || term.title,
      description: description || term.description,
      language_code: language_code || term.language_code,
      rank: rank !== undefined ? rank : term.rank
    });

    res.json({
      success: true,
      message: 'Sözleşme başarıyla güncellendi',
      data: term
    });
  } catch (error) {
    console.error('❌ Sözleşme güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sözleşme güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// Sözleşme sıralama güncelle
exports.updateTermRank = async (req, res) => {
  try {
    const { rankings } = req.body;

    if (!Array.isArray(rankings)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz sıralama verisi'
      });
    }

    await Promise.all(
      rankings.map(({ id, rank }) =>
        Term.update({ rank }, { where: { id } })
      )
    );

    res.json({
      success: true,
      message: 'Sıralama başarıyla güncellendi'
    });
  } catch (error) {
    console.error('❌ Sıralama güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sıralama güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// Sözleşme sil
exports.deleteTerm = async (req, res) => {
  try {
    const { id } = req.params;

    const term = await Term.findByPk(id);

    if (!term) {
      return res.status(404).json({
        success: false,
        message: 'Sözleşme bulunamadı'
      });
    }

    await term.destroy();

    res.json({
      success: true,
      message: 'Sözleşme başarıyla silindi'
    });
  } catch (error) {
    console.error('❌ Sözleşme silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sözleşme silinirken hata oluştu',
      error: error.message
    });
  }
};

