const Address = require('../models/addressModel');
const sequelize = require('../database');

// Tek adres getir
exports.singleAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme hatası'
      });
    }

    const address = await Address.findOne({
      where: { id, user_id },
      raw: true
    });
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Adres getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Adres getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Yeni adres ekle
exports.addAddress = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    // Bearer token'dan user_id'yi al
    const user_id = req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme hatası'
      });
    }

    const { 
      address_type,
      title,
      first_name,
      last_name,
      phone,
      city,
      district,
      address_line,
      postal_code,
      is_default,
      tc_number,
      tax_office,
      tax_number,
      company_name
    } = req.body;

    // Kullanıcının mevcut adres sayısını kontrol et
    const existingAddressCount = await Address.count({
      where: { user_id },
      transaction: t
    });

    // İlk adres ise otomatik varsayılan yap
    let shouldBeDefault = is_default || false;
    if (existingAddressCount === 0) {
      shouldBeDefault = true;
    }

    // Eğer varsayılan adres olarak işaretlendiyse, diğer adresleri varsayılandan çıkar
    if (shouldBeDefault) {
      await Address.update(
        { is_default: false },
        { 
          where: { user_id, is_default: true },
          transaction: t 
        }
      );
    }

    const address = await Address.create({
      user_id,
      address_type,
      title,
      first_name,
      last_name,
      phone,
      city,
      district,
      address_line,
      postal_code,
      is_default: shouldBeDefault,
      tc_number,
      tax_office,
      tax_number,
      company_name
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Adres başarıyla eklendi',
      data: address
    });
  } catch (error) {
    await t.rollback();
    console.error('Adres eklenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Adres eklenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Adres sil
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme hatası'
      });
    }

    const address = await Address.findOne({
      where: { id, user_id }
    });
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      });
    }

    await address.destroy();

    res.status(200).json({
      success: true,
      message: 'Adres başarıyla silindi'
    });
  } catch (error) {
    console.error('Adres silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Adres silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// Varsayılan adresi ayarla
exports.setDefaultAddress = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    
    if (!user_id) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme hatası'
      });
    }

    const address = await Address.findOne({
      where: { id, user_id },
      transaction: t
    });
    
    if (!address) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      });
    }

    // Kullanıcının tüm adreslerini varsayılandan çıkar
    await Address.update(
      { is_default: false },
      { 
        where: { user_id },
        transaction: t 
      }
    );

    // Bu adresi varsayılan yap
    await address.update({ is_default: true }, { transaction: t });

    await t.commit();

    res.status(200).json({
      success: true,
      message: 'Varsayılan adres ayarlandı',
      data: address
    });
  } catch (error) {
    await t.rollback();
    console.error('Varsayılan adres ayarlanırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Varsayılan adres ayarlanırken bir hata oluştu',
      error: error.message
    });
  }
};

