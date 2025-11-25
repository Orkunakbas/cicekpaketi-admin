const Category = require('../models/categoryModel');
const sequelize = require('../database');
const slugify = require('slugify');

// Yardımcı fonksiyon: Alt kategorilerin URL'lerini recursive olarak güncelle
async function updateChildCategoryUrls(parentId, newParentUrl, transaction) {
  const children = await Category.findAll({
    where: { parent_id: parentId },
    transaction
  });

  for (const child of children) {
    // Child'ın URL'sinin son kısmını al (slug)
    const childSlugParts = child.category_url.split('/');
    const childSlug = childSlugParts[childSlugParts.length - 1];
    
    // Yeni URL oluştur
    const newChildUrl = `${newParentUrl}/${childSlug}`;
    
    await child.update({ category_url: newChildUrl }, { transaction });
    
    // Bu child'ın da alt kategorileri varsa, onları da güncelle
    await updateChildCategoryUrls(child.id, newChildUrl, transaction);
  }
}

// ========================================
// ADMIN PANEL - Tüm kategorileri getir (Düz liste)
// ========================================
exports.listCategories = async (req, res) => {
  try {
    const { language_code } = req.params;
    
    const whereClause = language_code ? { language_code } : {};
    
    const categories = await Category.findAll({
      where: whereClause,
      order: [['rank', 'ASC'], ['id', 'ASC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Kategori listesi alınırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Kategoriler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// ========================================
// E-TİCARET FRONTEND - Kategorileri hiyerarşik yapıda getir
// Kullanım Alanları: Menü, Breadcrumb, Kategori Tree vb.
// ========================================
exports.getEcommerceCategories = async (req, res) => {
  try {
    const { language_code } = req.params;
    
    const whereClause = language_code ? { language_code } : {};
    
    // Tüm kategorileri getir
    const categories = await Category.findAll({
      where: whereClause,
      order: [['rank', 'ASC'], ['id', 'ASC']],
      raw: true
    });

    // Kategorileri hiyerarşik yapıya dönüştür
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(parent => ({
          ...parent,
          children: buildTree(items, parent.id)
        }));
    };

    const tree = buildTree(categories);

    res.status(200).json({
      success: true,
      data: tree
    });
  } catch (error) {
    console.error('E-Ticaret kategori ağacı alınırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Kategoriler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tek bir kategori getir
exports.singleCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByPk(id, { raw: true });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Kategori getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Yeni kategori ekle
exports.addCategory = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { name, description, language_code, parent_id, category_type, tags, icon } = req.body;
    
    // Eğer parent_id boş bir stringse, null olarak ayarla
    const parsedParentId = parent_id === "" ? null : parent_id;

    // En büyük rank'ı bul ve +1 ekle
    const maxRankCategory = await Category.findOne({
      order: [['rank', 'DESC']],
      transaction: t
    });
    const newRank = maxRankCategory ? maxRankCategory.rank + 1 : 0;

    // URL oluştur (hiyerarşik)
    let baseSlug = slugify(name, { lower: true, strict: true, locale: 'tr' });
    let category_url = baseSlug;
    let parentCategory = null;
    
    // Eğer parent varsa, parent'ın URL'ini başına ekle
    if (parsedParentId) {
      parentCategory = await Category.findByPk(parsedParentId, { transaction: t });
      if (parentCategory) {
        category_url = `${parentCategory.category_url}/${baseSlug}`;
      }
    }
    
    // Benzersiz URL kontrolü
    let counter = 1;
    let existingCategory = await Category.findOne({ 
      where: { category_url }, 
      transaction: t 
    });
    
    while (existingCategory) {
      const finalSlug = `${baseSlug}-${counter}`;
      category_url = parsedParentId && parentCategory
        ? `${parentCategory.category_url}/${finalSlug}`
        : finalSlug;
      counter++;
      existingCategory = await Category.findOne({ 
        where: { category_url }, 
        transaction: t 
      });
    }

    // Resim yüklendiyse path'ini al
    const image_url = req.file ? req.file.path.replace(/\\/g, '/') : null;

    const category = await Category.create({ 
      name, 
      description,
      language_code, 
      parent_id: parsedParentId,
      category_type,
      category_url,
      tags,
      icon,
      image_url,
      rank: newRank
    }, { transaction: t });

    await t.commit();
    
    res.status(201).json({
      success: true,
      message: 'Kategori başarıyla eklendi',
      data: category
    });
  } catch (error) {
    await t.rollback();
    console.error('Kategori ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori eklenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kategori güncelle
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, language_code, parent_id, category_type, tags, icon, rank } = req.body;
  const t = await sequelize.transaction();
  
  try {
    const category = await Category.findByPk(id, { transaction: t });
    
    if (!category) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    // parent_id'yi kontrol et ve boş bir stringse null olarak ayarla
    const parsedParentId = parent_id === "" ? null : parent_id;
    const oldParentId = category.parent_id;
    const oldCategoryUrl = category.category_url;

    // Eğer isim veya parent değiştiyse URL'yi yeniden oluştur
    let category_url = category.category_url;
    const nameChanged = name && name !== category.name;
    const parentChanged = parsedParentId !== oldParentId;
    
    if (nameChanged || parentChanged) {
      let baseSlug = slugify(name || category.name, { lower: true, strict: true, locale: 'tr' });
      category_url = baseSlug;
      let parentCategory = null;
      
      // Eğer parent varsa, parent'ın URL'ini başına ekle
      if (parsedParentId) {
        parentCategory = await Category.findByPk(parsedParentId, { transaction: t });
        if (parentCategory) {
          category_url = `${parentCategory.category_url}/${baseSlug}`;
        }
      }
      
      // Benzersiz URL kontrolü (kendi ID'sini hariç tut)
      let counter = 1;
      let existingCategory = await Category.findOne({ 
        where: { category_url }, 
        transaction: t 
      });
      
      while (existingCategory && existingCategory.id !== parseInt(id)) {
        const finalSlug = `${baseSlug}-${counter}`;
        category_url = parsedParentId && parentCategory
          ? `${parentCategory.category_url}/${finalSlug}`
          : finalSlug;
        counter++;
        existingCategory = await Category.findOne({ 
          where: { category_url }, 
          transaction: t 
        });
      }
    }

    // Yeni resim yüklendiyse, eski resmi silip yenisini ekle
    let image_url = category.image_url;
    if (req.file) {
      // Eski resmi sil (eğer varsa)
      if (category.image_url) {
        const fs = require('fs');
        const oldImagePath = category.image_url;
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (err) {
            console.log('Eski resim silinemedi:', err);
          }
        }
      }
      image_url = req.file.path.replace(/\\/g, '/');
    }

    await category.update({
      name,
      description,
      language_code,
      parent_id: parsedParentId,
      category_type,
      category_url,
      tags,
      icon,
      image_url,
      rank: rank !== undefined ? rank : category.rank
    }, { transaction: t });

    // Eğer URL değiştiyse, alt kategorilerin URL'lerini de güncelle
    if (category_url !== oldCategoryUrl) {
      await updateChildCategoryUrls(id, category_url, t);
    }

    await t.commit();
    
    res.status(200).json({
      success: true,
      message: 'Kategori başarıyla güncellendi',
      data: category
    });
  } catch (error) {
    await t.rollback();
    console.error('Kategori güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kategori rank güncelle
exports.updateCategoryRank = async (req, res) => {
  const { id } = req.params;
  const { newRank } = req.body;
  const t = await sequelize.transaction();
  
  try {
    const category = await Category.findByPk(id, { transaction: t });
    
    if (!category) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    const oldRank = category.rank;

    // Tüm kategorileri al
    const allCategories = await Category.findAll({
      order: [['rank', 'ASC']],
      transaction: t
    });

    // Sıralamayı güncelle
    if (newRank > oldRank) {
      // Aşağı taşınıyor
      for (const cat of allCategories) {
        if (cat.id === parseInt(id)) {
          await cat.update({ rank: newRank }, { transaction: t });
        } else if (cat.rank > oldRank && cat.rank <= newRank) {
          await cat.update({ rank: cat.rank - 1 }, { transaction: t });
        }
      }
    } else if (newRank < oldRank) {
      // Yukarı taşınıyor
      for (const cat of allCategories) {
        if (cat.id === parseInt(id)) {
          await cat.update({ rank: newRank }, { transaction: t });
        } else if (cat.rank >= newRank && cat.rank < oldRank) {
          await cat.update({ rank: cat.rank + 1 }, { transaction: t });
        }
      }
    }

    // Tüm kategorileri yeniden çek ve 0'dan başlayarak sırala
    const updatedCategories = await Category.findAll({
      order: [['rank', 'ASC'], ['id', 'ASC']],
      transaction: t
    });

    // Her kategoriye sırasıyla 0, 1, 2, 3... rank ver
    for (let i = 0; i < updatedCategories.length; i++) {
      if (updatedCategories[i].rank !== i) {
        await updatedCategories[i].update({ rank: i }, { transaction: t });
      }
    }

    await t.commit();
    
    res.status(200).json({
      success: true,
      message: 'Kategori sırası güncellendi'
    });
  } catch (error) {
    await t.rollback();
    console.error('Kategori rank güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori sırası güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kategori sil
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  
  try {
    const category = await Category.findByPk(id, { transaction: t });
    
    if (!category) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    // Alt kategorileri kontrol et
    const subcategories = await Category.findAll({
      where: { parent_id: id },
      transaction: t
    });

    if (subcategories.length > 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Bu kategorinin alt kategorileri var, silinemez'
      });
    }

    // Kategori resmini sil (eğer varsa)
    if (category.image_url) {
      const fs = require('fs');
      const imagePath = category.image_url;
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.log('Kategori resmi silinemedi:', err);
        }
      }
    }

    await category.destroy({ transaction: t });
    await t.commit();
    
    res.status(200).json({
      success: true,
      message: 'Kategori başarıyla silindi'
    });
  } catch (error) {
    await t.rollback();
    console.error('Kategori silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori silinirken bir hata oluştu',
      error: error.message
    });
  }
};

