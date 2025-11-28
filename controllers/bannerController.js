const Banner = require('../models/bannerModel');
const sequelize = require('../database');

// ========================================
// ADMIN PANEL - Tüm banner'ları getir
// ========================================
exports.listBanners = async (req, res) => {
  try {
    const { language_code } = req.params;
    
    const whereClause = language_code ? { language_code } : {};
    
    const banners = await Banner.findAll({
      where: whereClause,
      order: [['rank', 'ASC'], ['id', 'ASC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('Banner listesi alınırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Banner\'lar getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tek bir banner getir
exports.singleBanner = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findByPk(id, { raw: true });
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    console.error('Banner getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Banner getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Yeni banner ekle
exports.addBanner = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const {
      title,
      description,
      background_color,
      button_text,
      button_color,
      button_link,
      language_code
    } = req.body;

    // En büyük rank'ı bul ve +1 ekle
    const maxRankBanner = await Banner.findOne({
      order: [['rank', 'DESC']],
      transaction: t
    });
    const newRank = maxRankBanner ? maxRankBanner.rank + 1 : 0;

    // Resim yüklendiyse path'ini al
    const banner_image = req.files?.banner_image 
      ? req.files.banner_image[0].path.replace(/\\/g, '/') 
      : null;

    const banner = await Banner.create({ 
      title, 
      description,
      banner_image,
      background_color, 
      button_text,
      button_color,
      button_link,
      language_code, 
      rank: newRank
    }, { transaction: t });

    await t.commit();
    
    res.status(201).json({
      success: true,
      message: 'Banner başarıyla eklendi',
      data: banner
    });
  } catch (error) {
    await t.rollback();
    console.error('Banner ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Banner eklenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Banner güncelle
exports.updateBanner = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    background_color,
    button_text,
    button_color,
    button_link,
    language_code,
    rank
  } = req.body;
  const t = await sequelize.transaction();
  
  try {
    const banner = await Banner.findByPk(id, { transaction: t });
    
    if (!banner) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Banner bulunamadı'
      });
    }

    // Yeni banner_image yüklendiyse, eski resmi silip yenisini ekle
    let banner_image = banner.banner_image;
    if (req.files?.banner_image) {
      // Eski resmi sil (eğer varsa)
      if (banner.banner_image) {
        const fs = require('fs');
        const oldImagePath = banner.banner_image;
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (err) {
            console.log('Eski banner resmi silinemedi:', err);
          }
        }
      }
      banner_image = req.files.banner_image[0].path.replace(/\\/g, '/');
    }

    await banner.update({
      title,
      description,
      banner_image,
      background_color,
      button_text,
      button_color,
      button_link,
      language_code,
      rank: rank !== undefined ? rank : banner.rank
    }, { transaction: t });

    await t.commit();
    
    res.status(200).json({
      success: true,
      message: 'Banner başarıyla güncellendi',
      data: banner
    });
  } catch (error) {
    await t.rollback();
    console.error('Banner güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Banner güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Banner rank güncelle
exports.updateBannerRank = async (req, res) => {
  const { id } = req.params;
  const { newRank } = req.body;
  const t = await sequelize.transaction();
  
  try {
    const banner = await Banner.findByPk(id, { transaction: t });
    
    if (!banner) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Banner bulunamadı'
      });
    }

    const oldRank = banner.rank;

    // Tüm banner'ları al
    const allBanners = await Banner.findAll({
      order: [['rank', 'ASC']],
      transaction: t
    });

    // Sıralamayı güncelle
    if (newRank > oldRank) {
      // Aşağı taşınıyor
      for (const bnr of allBanners) {
        if (bnr.id === parseInt(id)) {
          await bnr.update({ rank: newRank }, { transaction: t });
        } else if (bnr.rank > oldRank && bnr.rank <= newRank) {
          await bnr.update({ rank: bnr.rank - 1 }, { transaction: t });
        }
      }
    } else if (newRank < oldRank) {
      // Yukarı taşınıyor
      for (const bnr of allBanners) {
        if (bnr.id === parseInt(id)) {
          await bnr.update({ rank: newRank }, { transaction: t });
        } else if (bnr.rank >= newRank && bnr.rank < oldRank) {
          await bnr.update({ rank: bnr.rank + 1 }, { transaction: t });
        }
      }
    }

    // Tüm banner'ları yeniden çek ve 0'dan başlayarak sırala
    const updatedBanners = await Banner.findAll({
      order: [['rank', 'ASC'], ['id', 'ASC']],
      transaction: t
    });

    // Her banner'a sırasıyla 0, 1, 2, 3... rank ver
    for (let i = 0; i < updatedBanners.length; i++) {
      if (updatedBanners[i].rank !== i) {
        await updatedBanners[i].update({ rank: i }, { transaction: t });
      }
    }

    await t.commit();
    
    res.status(200).json({
      success: true,
      message: 'Banner sırası güncellendi'
    });
  } catch (error) {
    await t.rollback();
    console.error('Banner rank güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Banner sırası güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Banner sil
exports.deleteBanner = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  
  try {
    const banner = await Banner.findByPk(id, { transaction: t });
    
    if (!banner) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Banner bulunamadı'
      });
    }

    const fs = require('fs');

    // Banner resmini sil (eğer varsa)
    if (banner.banner_image) {
      const imagePath = banner.banner_image;
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.log('Banner resmi silinemedi:', err);
        }
      }
    }

    await banner.destroy({ transaction: t });
    await t.commit();
    
    res.status(200).json({
      success: true,
      message: 'Banner başarıyla silindi'
    });
  } catch (error) {
    await t.rollback();
    console.error('Banner silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Banner silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// Banner resmini sil (sadece resim)
exports.deleteBannerImage = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const banner = await Banner.findByPk(id, { transaction: t });
    
    if (!banner) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Banner bulunamadı'
      });
    }

    if (!banner.banner_image) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Banner\'da silinecek resim yok'
      });
    }

    const fs = require('fs');

    // Fiziksel dosyayı sil
    const imagePath = banner.banner_image;
    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
        console.log('✅ Banner resmi fiziksel olarak silindi:', imagePath);
      } catch (err) {
        console.log('⚠️ Banner resmi silinemedi:', err);
      }
    }

    // DB'de banner_image'ı null yap
    await banner.update({ banner_image: null }, { transaction: t });
    
    await t.commit();
    
    res.status(200).json({
      success: true,
      message: 'Banner resmi başarıyla silindi'
    });
  } catch (error) {
    await t.rollback();
    console.error('❌ Banner resmi silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Banner resmi silinirken bir hata oluştu',
      error: error.message
    });
  }
};

