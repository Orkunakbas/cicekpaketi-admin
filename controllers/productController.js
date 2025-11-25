const Product = require('../models/productModel');
const ProductVariant = require('../models/productVariantModel');
const Image = require('../models/imageModel');
const Category = require('../models/categoryModel');
const sequelize = require('../database');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

// Ürün URL'si oluşturma
const createProductUrl = async (name, excludeId = null) => {
  let baseUrl = slugify(name, { lower: true, strict: true });
  let url = baseUrl;
  let counter = 1;
  
  let whereClause = { slug: url };
  if (excludeId) {
    whereClause.id = { [sequelize.Sequelize.Op.ne]: excludeId };
  }
  
  let existingProduct = await Product.findOne({ where: whereClause });
  
  while (existingProduct) {
    url = `${baseUrl}-${counter}`;
    counter++;
    
    whereClause = { slug: url };
    if (excludeId) {
      whereClause.id = { [sequelize.Sequelize.Op.ne]: excludeId };
    }
    
    existingProduct = await Product.findOne({ where: whereClause });
  }
  
  return url;
};

// SKU oluşturma (ÇP-000001 formatında)
const generateSKU = async () => {
  // Son varyantın SKU'sunu al
  const lastVariant = await ProductVariant.findOne({
    where: {
      sku: {
        [sequelize.Sequelize.Op.like]: 'ÇP-%'
      }
    },
    order: [['id', 'DESC']],
    raw: true
  });

  let nextNumber = 1;
  
  if (lastVariant && lastVariant.sku) {
    // "ÇP-000001" -> "000001" -> 1
    const lastNumber = parseInt(lastVariant.sku.replace('ÇP-', ''));
    nextNumber = lastNumber + 1;
  }

  // 6 haneli sıfırlarla doldur
  const paddedNumber = String(nextNumber).padStart(6, '0');
  
  return `ÇP-${paddedNumber}`;
};

// Kategoriye göre ürünleri getir
exports.getProductsByCategory = async (req, res) => {
  try {
    // category_url parametresinden URL'yi ve language_code'u ayrıştır
    let categoryUrlPath = req.params.category_url || req.params[0] || '';
    
    // URL'den language_code'u ayır (son segment tr/en ise)
    const urlParts = categoryUrlPath.split('/').filter(part => part);
    let language_code = null;
    
    // Son segment dil kodu mu kontrol et
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart.length === 2 && /^[a-z]{2}$/.test(lastPart)) {
      language_code = lastPart;
      urlParts.pop(); // Dil kodunu URL'den çıkar
    }
    
    const category_url = urlParts.join('/');
    
    console.log('🔍 Kategori arama:', { category_url, language_code, fullPath: req.params.category_url });
    
    // Önce category_url'den kategoriyi bul
    const category = await Category.findOne({
      where: { category_url },
      raw: true
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı',
        searchedUrl: category_url
      });
    }
    
    console.log('✅ Kategori bulundu:', category.name, '(ID:', category.id + ')');
    
    // WHERE şartları
    let whereClause = {
      is_active: true
    };
    
    if (language_code) {
      whereClause.language_code = language_code;
    }
    
    console.log('🔍 WHERE şartları:', JSON.stringify(whereClause, null, 2));
    console.log('🔍 Aranan kategori ID:', category.id);
    
    const products = await Product.findAll({
      where: whereClause,
      order: [['id', 'DESC']],
      raw: true
    });
    
    console.log('📦 Bulunan ürün sayısı:', products.length);
    if (products.length > 0) {
      console.log('📦 İlk ürün:', products[0].name, '- category_id:', products[0].category_id);
    }

    // Kategori ID'sine göre filtrele (JavaScript tarafında)
    const filteredProducts = products.filter(product => {
      if (!product.category_id) return false;
      
      try {
        let categoryIds = product.category_id;
        
        // String ise parse et
        if (typeof categoryIds === 'string') {
          categoryIds = JSON.parse(categoryIds);
        }
        
        // Hala string ise tekrar parse et (double-escaped)
        if (typeof categoryIds === 'string') {
          categoryIds = JSON.parse(categoryIds);
        }
        
        // Array değilse false dön
        if (!Array.isArray(categoryIds)) return false;
        
        // Aranan kategori ID bu ürünün kategorilerinde var mı?
        return categoryIds.includes(category.id);
      } catch (e) {
        console.error('❌ Kategori parse hatası:', e.message, '- Ürün:', product.name);
        return false;
      }
    });

    console.log('✅ Kategoriye göre filtrelenmiş ürün sayısı:', filteredProducts.length);

    // Her ürün için varyant sayısını, resim sayısını ve fiyat/stok bilgisini ekle
    const productsWithCounts = await Promise.all(
      filteredProducts.map(async (product) => {
        const variantCount = await ProductVariant.count({
          where: { product_id: product.id }
        });
        
        // TÜM resimleri al (basit ürün resimleri)
        let images = await Image.findAll({
          where: { 
            imageable_id: product.id,
            imageable_type: 'products'
          },
          order: [['sort_order', 'ASC']],
          raw: true
        });

        // Eğer varyantlı ürünse, tüm varyantların resimlerini de ekle
        if (variantCount > 0) {
          const variants = await ProductVariant.findAll({
            where: { product_id: product.id },
            raw: true
          });
          
          for (const variant of variants) {
            const variantImages = await Image.findAll({
              where: { 
                imageable_id: variant.id,
                imageable_type: 'products'
              },
              order: [['sort_order', 'ASC']],
              raw: true
            });
            images = images.concat(variantImages);
          }
        }

        // Kapak resmini bul
        const coverImage = images.find(img => img.image_type === 'cover') || images[0];
        
        const imageCount = images.length;

        // TÜM VARYANTLARI ÇEK (detaylı bilgi için)
        const allVariants = await ProductVariant.findAll({
          where: { product_id: product.id },
          raw: true
        });

        // Her varyant için resimleri de çek
        const variantsWithImages = await Promise.all(
          allVariants.map(async (variant) => {
            let variantImages = [];
            
            // Eğer basit ürünse (is_variant: 0), product_id'ye bağlı resimleri al
            if (product.is_variant === 0) {
              variantImages = await Image.findAll({
                where: { 
                  imageable_id: product.id,
                  imageable_type: 'products'
                },
                order: [['sort_order', 'ASC']],
                raw: true
              });
            } else {
              // Varyantlı ürünlerde variant_id'ye bağlı resimleri al
              variantImages = await Image.findAll({
                where: { 
                  imageable_id: variant.id,
                  imageable_type: 'products'
                },
                order: [['sort_order', 'ASC']],
                raw: true
              });
            }

            // Resimlerden gereksiz alanları kaldır
            const cleanImages = variantImages.map(img => ({
              id: img.id,
              image_url: img.image_url,
              image_type: img.image_type,
              sort_order: img.sort_order,
              alt_text: img.alt_text
            }));

            return {
              id: variant.id,
              sku: variant.sku,
              color: variant.color,
              size: variant.size,
              material: variant.material,
              price: parseFloat(variant.price),
              discount_price: variant.discount_price ? parseFloat(variant.discount_price) : null,
              stock_quantity: parseInt(variant.stock_quantity) || 0,
              product_features: variant.product_features || '',
              images: cleanImages
            };
          })
        );

        // Kategori ID'lerini parse et ve isimleri al
        let categoryNames = [];
        let parsedCategoryIds = [];
        if (product.category_id) {
          try {
            let categoryIds = product.category_id;
            
            if (typeof categoryIds === 'string') {
              categoryIds = JSON.parse(categoryIds);
            }
            
            if (typeof categoryIds === 'string') {
              categoryIds = JSON.parse(categoryIds);
            }
            
            parsedCategoryIds = Array.isArray(categoryIds) ? categoryIds : [];
            
            if (parsedCategoryIds.length > 0) {
              const categories = await Category.findAll({
                where: { id: parsedCategoryIds },
                attributes: ['id', 'name'],
                raw: true
              });
              categoryNames = categories.map(cat => cat.name);
            }
          } catch (e) {
            console.error('❌ Kategori parse hatası:', e.message);
          }
        }

        // Varyantlardan min/max fiyat hesapla
        let minPrice = null;
        let maxPrice = null;
        if (variantsWithImages.length > 0) {
          const prices = variantsWithImages.map(v => v.price).filter(p => p > 0);
          if (prices.length > 0) {
            minPrice = Math.min(...prices);
            maxPrice = Math.max(...prices);
          }
        }

        return { 
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          short_description: product.short_description,
          category_id: parsedCategoryIds, // Parse edilmiş array
          categoryNames: categoryNames,
          brand: product.brand,
          tags: product.tags,
          is_active: product.is_active,
          is_featured: product.is_featured,
          is_variant: product.is_variant,
          language_code: product.language_code,
          meta_title: product.meta_title,
          meta_description: product.meta_description,
          variantCount,
          imageCount,
          coverImage: coverImage?.image_url || null,
          minPrice,
          maxPrice,
          variants: variantsWithImages,
          created_at: product.created_at,
          updated_at: product.updated_at
        };
      })
    );

    res.status(200).json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        category_url: category.category_url,
        description: category.description
      },
      data: productsWithCounts
    });
  } catch (error) {
    console.error('Kategoriye göre ürünler getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Ürünler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tüm ürünleri listele
exports.listProducts = async (req, res) => {
  try {
    const { language_code } = req.params;
    
    const whereClause = language_code ? { language_code } : {};
    
    const products = await Product.findAll({
      where: whereClause,
      order: [['id', 'DESC']],
      raw: true
    });

    // Her ürün için varyant sayısını, resim sayısını ve fiyat/stok bilgisini ekle
    const productsWithCounts = await Promise.all(
      products.map(async (product) => {
        const variantCount = await ProductVariant.count({
          where: { product_id: product.id }
        });
        
        // TÜM resimleri al (basit ürün resimleri)
        let images = await Image.findAll({
          where: { 
            imageable_id: product.id,
            imageable_type: 'products'
          },
          order: [['sort_order', 'ASC']],
          raw: true
        });

        // Eğer varyantlı ürünse, tüm varyantların resimlerini de ekle
        if (variantCount > 0) {
          const variants = await ProductVariant.findAll({
            where: { product_id: product.id },
            raw: true
          });
          
          for (const variant of variants) {
            const variantImages = await Image.findAll({
              where: { 
                imageable_id: variant.id,
                imageable_type: 'products'
              },
              order: [['sort_order', 'ASC']],
              raw: true
            });
            images = images.concat(variantImages);
          }
        }

        // Kapak resmini bul
        const coverImage = images.find(img => img.image_type === 'cover') || images[0];
        
        const imageCount = images.length;

        // TÜM VARYANTLARI ÇEK (detaylı bilgi için)
        const allVariants = await ProductVariant.findAll({
          where: { product_id: product.id },
          raw: true
        });

        // Her varyant için resimleri de çek
        const variantsWithImages = await Promise.all(
          allVariants.map(async (variant) => {
            const variantImages = await Image.findAll({
              where: { 
                imageable_id: variant.id,
                imageable_type: 'products'
              },
              order: [['sort_order', 'ASC']],
              raw: true
            });

            // Resimlerden gereksiz alanları kaldır
            const cleanImages = variantImages.map(img => ({
              id: img.id,
              image_url: img.image_url,
              image_type: img.image_type,
              sort_order: img.sort_order,
              alt_text: img.alt_text
            }));

            return {
              id: variant.id,
              sku: variant.sku,
              color: variant.color,
              size: variant.size,
              material: variant.material,
              price: parseFloat(variant.price),
              discount_price: variant.discount_price ? parseFloat(variant.discount_price) : null,
              stock_quantity: parseInt(variant.stock_quantity) || 0,
              product_features: variant.product_features || '',
              images: cleanImages // ✅ Temiz resimler
            };
          })
        );

        // Kategori ID'lerini parse et ve isimleri al
        let categoryNames = [];
        let parsedCategoryIds = [];
        if (product.category_id) {
          try {
            let categoryIds = product.category_id;
            
            if (typeof categoryIds === 'string') {
              categoryIds = JSON.parse(categoryIds);
            }
            
            if (typeof categoryIds === 'string') {
              categoryIds = JSON.parse(categoryIds);
            }
            
            parsedCategoryIds = Array.isArray(categoryIds) ? categoryIds : [];
            
            if (parsedCategoryIds.length > 0) {
              const categories = await Category.findAll({
                where: { id: parsedCategoryIds },
                attributes: ['id', 'name'],
                raw: true
              });
              categoryNames = categories.map(cat => cat.name);
            }
          } catch (e) {
            console.error('❌ Kategori parse hatası:', e.message);
          }
        }

        // Varyantlardan min/max fiyat hesapla
        let minPrice = null;
        let maxPrice = null;
        if (variantsWithImages.length > 0) {
          const prices = variantsWithImages.map(v => v.price).filter(p => p > 0);
          if (prices.length > 0) {
            minPrice = Math.min(...prices);
            maxPrice = Math.max(...prices);
          }
        }

        return { 
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          short_description: product.short_description,
          category_id: parsedCategoryIds, // Parse edilmiş array
          categoryNames: categoryNames, // ✅ Kategori isimleri
          brand: product.brand,
          tags: product.tags,
          is_active: product.is_active,
          is_featured: product.is_featured,
          is_variant: product.is_variant,
          language_code: product.language_code,
          meta_title: product.meta_title,
          meta_description: product.meta_description,
          variantCount,
          imageCount,
          coverImage: coverImage?.image_url || null,
          minPrice, // ✅ En düşük fiyat
          maxPrice, // ✅ En yüksek fiyat
          variants: variantsWithImages
        };
      })
    );

    res.status(200).json({
      success: true,
      data: productsWithCounts
    });
  } catch (error) {
    console.error('Ürün listesi alınırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Ürünler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tek ürün getir
exports.singleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOne({
      where: { id },
      raw: true
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Varyantları getir
    const variants = await ProductVariant.findAll({
      where: { product_id: id },
      raw: true
    });

    // Her varyant için resimleri de çek (listProducts ile aynı mantık)
    const variantsWithImages = await Promise.all(
      variants.map(async (variant) => {
        const variantImages = await Image.findAll({
          where: { 
            imageable_id: variant.id,
            imageable_type: 'products'
          },
          order: [['sort_order', 'ASC']],
          raw: true
        });

        // Resimleri temizle
        const cleanImages = variantImages.map(img => ({
          id: img.id,
          image_url: img.image_url,
          image_type: img.image_type,
          sort_order: img.sort_order,
          alt_text: img.alt_text
        }));

        return {
          id: variant.id,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          material: variant.material,
          price: parseFloat(variant.price),
          discount_price: variant.discount_price ? parseFloat(variant.discount_price) : null,
          stock_quantity: parseInt(variant.stock_quantity) || 0,
          product_features: variant.product_features || '',
          images: cleanImages // ✅ Resimler eklendi!
        };
      })
    );

    // Ürün seviyesindeki resimleri getir (varyantsız ürünler için)
    const productImages = await Image.findAll({
      where: { 
        imageable_id: id,
        imageable_type: 'products'
      },
      order: [['sort_order', 'ASC']],
      raw: true
    });

    // Ürün resimlerini temizle
    const cleanProductImages = productImages.map(img => ({
      id: img.id,
      image_url: img.image_url,
      image_type: img.image_type,
      sort_order: img.sort_order,
      alt_text: img.alt_text
    }));

    // category_id'yi parse et
    let parsedCategoryIds = [];
    if (product.category_id) {
      try {
        let categoryIds = product.category_id;
        
        if (typeof categoryIds === 'string') {
          categoryIds = JSON.parse(categoryIds);
        }
        
        if (typeof categoryIds === 'string') {
          categoryIds = JSON.parse(categoryIds);
        }
        
        parsedCategoryIds = Array.isArray(categoryIds) ? categoryIds : [];
      } catch (e) {
        // Parse hatası
      }
    }

    console.log('🔍 singleProduct - Veritabanından gelen category_id:', product.category_id);
    console.log('✅ singleProduct - Parse edilmiş category_id:', parsedCategoryIds);

    res.status(200).json({
      success: true,
      data: {
        ...product,
        category_id: parsedCategoryIds, // Parse edilmiş array
        variants: variantsWithImages, // ✅ Resimli varyantlar
        images: cleanProductImages     // ✅ Ürün resimleri
      }
    });
  } catch (error) {
    console.error('Ürün getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Yeni ürün ekle
exports.addProduct = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { 
      name, 
      description, 
      short_description,
      category_id,
      brand,
      tags,
      price,
      stock_quantity,
      is_active,
      is_featured,
      is_variant, // ✅ Varyantlı mı? (direkt frontend'den)
      language_code,
      meta_title,
      meta_description,
      variantCombinations, // Varyant kombinasyonları (JSON string)
      variantImageMapping // Hangi resim hangi varyanta ait? (JSON string)
    } = req.body;

    // DEBUG: Gelen verileri logla
    console.log('🔍 GELEN VERİLER:', {
      name,
      is_variant,
      is_variantType: typeof is_variant,
      variantCombinations: variantCombinations ? 'VAR' : 'YOK',
      variantImageMapping: variantImageMapping ? 'VAR' : 'YOK',
      filesCount: req.files ? req.files.length : 0
    });

    // Slug oluştur
    const slug = await createProductUrl(name);

    // FormData string olarak gönderiyor: "true" veya "false"
    const isVariantProduct = is_variant === 'true' || is_variant === true;

    // category_id parse et ve array olarak sakla
    let categoryIds = null;
    if (category_id) {
      try {
        // Frontend'den gelen string'i parse edip ARRAY olarak kaydet
        categoryIds = typeof category_id === 'string' ? JSON.parse(category_id) : category_id;
        // Array değilse array yap
        if (!Array.isArray(categoryIds)) {
          categoryIds = [categoryIds];
        }
        // Falsy değerleri filtrele
        categoryIds = categoryIds.filter(id => id);
      } catch (e) {
        categoryIds = null;
      }
    }

    // Ürün oluştur
    const product = await Product.create({
      name,
      slug,
      description,
      short_description,
      category_id: categoryIds, // ✅ JSON array olarak
      brand,
      tags,
      is_active: is_active !== undefined ? is_active : true,
      is_featured: is_featured !== undefined ? is_featured : false,
      is_variant: isVariantProduct, // ✅ Artık product seviyesinde
      language_code: language_code || 'tr',
      meta_title,
      meta_description
    }, { transaction: t });

    // VARYANTSIZ ÜRÜN
    if (!isVariantProduct) {
      // Eğer fiyat/stok girilmişse, otomatik basit varyant oluştur
      if (price || stock_quantity) {
        const sku = await generateSKU();
        
        const variant = await ProductVariant.create({
          product_id: product.id,
          sku: sku,
          price: price || 0,
          discount_price: req.body.discount_price || null,
          stock_quantity: stock_quantity || 0,
          product_features: req.body.product_features || null
        }, { transaction: t });

        // Resimleri basit ürüne ekle
        if (req.files && req.files.length > 0) {
          const imageTypes = req.body.imageTypes ? JSON.parse(req.body.imageTypes) : [];
          
          const imageRecords = req.files.map((file, index) => ({
            image_url: file.path,
            imageable_id: product.id,
            image_type: imageTypes[index] || 'gallery',
            imageable_type: 'products',
            sort_order: index,
            alt_text: `${name} - Resim ${index + 1}`
          }));
          
          await Image.bulkCreate(imageRecords, { transaction: t });
        }
      }
    }
    // VARYANTLI ÜRÜN
    else {
      const combinations = variantCombinations ? JSON.parse(variantCombinations) : [];
      const imageMapping = variantImageMapping ? JSON.parse(variantImageMapping) : [];

      // ÖNEMLİ: SKU numarasını LOOP DIŞINDA BİR KERE BUL!
      const lastVariant = await ProductVariant.findOne({
        where: {
          sku: {
            [sequelize.Sequelize.Op.like]: 'ÇP-%'
          }
        },
        order: [['id', 'DESC']],
        raw: true
      });

      let nextNumber = 1;
      
      if (lastVariant && lastVariant.sku) {
        const lastNumber = parseInt(lastVariant.sku.replace('ÇP-', ''));
        nextNumber = lastNumber + 1;
      }

      // Her varyant kombinasyonu için
      for (let i = 0; i < combinations.length; i++) {
        const combo = combinations[i];
        
        // SKU oluştur (her varyant için arttır)
        const sku = `ÇP-${String(nextNumber).padStart(6, '0')}`;
        nextNumber++; // Bir sonraki için arttır!

        // Varyant bilgilerini hazırla
        const variantOptions = {};
        combo.items.forEach(item => {
          variantOptions[item.typeName] = item.valueName;
        });

        // Varyant oluştur
        const variant = await ProductVariant.create({
          product_id: product.id,
          sku: sku,
          color: variantOptions['Renk'] || null,
          size: variantOptions['Beden'] || variantOptions['Ölçü'] || null,
          material: variantOptions['Malzeme'] || null,
          additional_options: JSON.stringify(variantOptions),
          price: combo.price || 0,
          discount_price: combo.discount_price || null,
          stock_quantity: combo.stock_quantity || 0,
          product_features: combo.product_features || null
        }, { transaction: t });

        // Bu varyanta ait resimleri bul
        const variantImages = imageMapping.filter(m => m.variantIndex === i);

        if (variantImages.length > 0 && req.files) {
          const variantImageRecords = variantImages.map(mapping => {
            const file = req.files[mapping.imageIndex];
            return {
              image_url: file.path,
              imageable_id: variant.id,
              image_type: mapping.isCover ? 'cover' : 'gallery',
              imageable_type: 'products',
              sort_order: mapping.sortOrder || 0,
              alt_text: `${name} - ${combo.label} - Resim ${mapping.sortOrder + 1}`
            };
          });
          
          await Image.bulkCreate(variantImageRecords, { transaction: t });
        }
      }
    }

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Ürün başarıyla eklendi',
      data: product
    });
  } catch (error) {
    await t.rollback();
    console.error('Ürün eklenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün eklenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Ürün güncelle
exports.updateProduct = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      short_description,
      category_id,
      brand,
      tags,
      is_active,
      is_featured,
      language_code,
      meta_title,
      meta_description
    } = req.body;

    const product = await Product.findByPk(id, { transaction: t });
    
    if (!product) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Slug güncelle (sadece isim değiştiyse)
    let slug = product.slug;
    if (name && product.name !== name) {
      slug = await createProductUrl(name, id);
    }

    // category_id'yi kontrol et ve array olarak sakla
    let finalCategoryId = null;
    if (category_id) {
      try {
        // Frontend'den gelen string'i parse edip ARRAY olarak kaydet
        const parsedCategoryId = typeof category_id === 'string' ? JSON.parse(category_id) : category_id;
        // Array değilse array yap
        let categoryArray = Array.isArray(parsedCategoryId) ? parsedCategoryId : [parsedCategoryId];
        // Falsy değerleri filtrele
        categoryArray = categoryArray.filter(id => id);
        // ARRAY olarak sakla (Sequelize JSON tipine otomatik çevirir)
        finalCategoryId = categoryArray.length > 0 ? categoryArray : null;
      } catch (e) {
        finalCategoryId = null;
      }
    }

    // Ürünü güncelle
    await product.update({
      name,
      slug,
      description,
      short_description,
      category_id: finalCategoryId,
      brand,
      tags,
      is_active,
      is_featured,
      language_code,
      meta_title,
      meta_description
    }, { transaction: t });

    // Yeni resimler varsa ekle
    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map((file, index) => ({
        image_url: file.path,
        imageable_id: product.id,
        image_type: req.body.image_type?.[index] || 'gallery',
        imageable_type: 'products',
        sort_order: index
      }));
      
      await Image.bulkCreate(imageRecords, { transaction: t });
    }

    // Yeni resimler varsa ekle (req.files)
    if (req.files && req.files.length > 0) {
      console.log('📤 Yeni resimler ekleniyor:', req.files.length, 'dosya');
      
      // Her dosya için variant_id kontrolü yap (req.body'den gelecek)
      const imageVariantIds = req.body.imageVariantIds ? JSON.parse(req.body.imageVariantIds) : [];
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const variantId = imageVariantIds[i] || null;
        
        await Image.create({
          image_url: file.path.replace(/\\/g, '/'),
          imageable_id: variantId || product.id,
          imageable_type: 'products',
          image_type: i === 0 ? 'cover' : 'gallery',
          sort_order: i
        }, { transaction: t });
      }
      
      console.log('✅ Resimler kaydedildi');
    }

    // BASİT ÜRÜN İÇİN PRICE, DISCOUNT_PRICE, STOCK VE FEATURES GÜNCELLEME
    if (req.body.price !== undefined || req.body.stock_quantity !== undefined || req.body.discount_price !== undefined || req.body.product_features !== undefined) {
      // İlk varyantı bul (basit ürünlerde tek varyant var)
      const firstVariant = await ProductVariant.findOne({
        where: { product_id: product.id },
        transaction: t
      });
      
      if (firstVariant) {
        await firstVariant.update({
          price: req.body.price !== undefined ? req.body.price : firstVariant.price,
          discount_price: req.body.discount_price !== undefined ? req.body.discount_price : firstVariant.discount_price,
          stock_quantity: req.body.stock_quantity !== undefined ? req.body.stock_quantity : firstVariant.stock_quantity,
          product_features: req.body.product_features !== undefined ? req.body.product_features : firstVariant.product_features
        }, { transaction: t });
        console.log('✅ Basit ürün varyantı güncellendi - Price:', req.body.price, 'Discount:', req.body.discount_price, 'Stock:', req.body.stock_quantity, 'Features:', req.body.product_features);
      }
    }

    // VARYANT GÜNCELLEME VE EKLEME (Varyantlı ürünler için)
    if (req.body.variants) {
      const variants = typeof req.body.variants === 'string' 
        ? JSON.parse(req.body.variants) 
        : req.body.variants;
        
      if (Array.isArray(variants)) {
        console.log('🔄 Varyant güncelleme başlatılıyor...');

        for (const variantData of variants) {
          // Eğer ID number ise (mevcut varyant), güncelle
          if (typeof variantData.id === 'number') {
            console.log('🔄 Mevcut varyant güncelleniyor:', variantData.id);
            
            const existingVariant = await ProductVariant.findByPk(variantData.id, { transaction: t });
            
            if (existingVariant) {
              await existingVariant.update({
                price: variantData.price || 0,
                discount_price: variantData.discount_price !== undefined ? variantData.discount_price : existingVariant.discount_price,
                stock_quantity: variantData.stock_quantity || 0,
                product_features: variantData.product_features !== undefined ? variantData.product_features : existingVariant.product_features
              }, { transaction: t });
              console.log('✅ Varyant güncellendi:', variantData.id, '- Discount:', variantData.discount_price, '- Features:', variantData.product_features);
            }
          }
          // Eğer ID string ise (yeni varyant), ekle
          else if (typeof variantData.id === 'string' && variantData.id.startsWith('combo-')) {
            console.log('➕ Yeni varyant ekleniyor...');
            
            // SKU oluştur
            const variantCount = await ProductVariant.count({ 
              where: { product_id: product.id },
              transaction: t 
            });
            const sku = `${product.slug.substring(0, 3).toUpperCase()}-${String(variantCount + 1).padStart(6, '0')}`;
            
            // items'dan renk, beden, materyal çıkar
            let color = null, size = null, material = null;
            
            if (variantData.items && Array.isArray(variantData.items)) {
              variantData.items.forEach(item => {
                const typeName = item.typeName?.toLowerCase();
                if (typeName === 'renk' || typeName === 'color') {
                  color = item.valueName;
                } else if (typeName === 'beden' || typeName === 'size') {
                  size = item.valueName;
                } else if (typeName === 'materyal' || typeName === 'material') {
                  material = item.valueName;
                }
              });
            }
            
            // Yeni varyantı oluştur
            const newVariant = await ProductVariant.create({
              product_id: product.id,
              sku: sku,
              price: variantData.price || 0,
              discount_price: variantData.discount_price || null,
              stock_quantity: variantData.stock_quantity || 0,
              color: color,
              size: size,
              material: material,
              product_features: variantData.product_features || null,
              is_default: false
            }, { transaction: t });
            
            console.log('✅ Yeni varyant eklendi:', newVariant.id, `(${color} ${size} ${material})`.trim(), '- Discount:', variantData.discount_price, '- Features:', variantData.product_features);
          }
        }
      }
    }

    await t.commit();

    res.status(200).json({
      success: true,
      message: 'Ürün başarıyla güncellendi',
      data: product
    });
  } catch (error) {
    await t.rollback();
    console.error('Ürün güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Ürün aktifliğini toggle et
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Aktifliği tersine çevir (BOOLEAN değeri)
    const newStatus = !product.is_active;
    
    await Product.update(
      { is_active: newStatus },
      { where: { id: id } }
    );

    console.log('✅ Ürün aktiflik durumu değiştirildi:', id, '→', newStatus ? 'Aktif' : 'Pasif');

    res.status(200).json({
      success: true,
      message: `Ürün ${newStatus ? 'aktif' : 'pasif'} edildi`,
      data: {
        id: parseInt(id),
        is_active: newStatus ? 1 : 0  // Frontend için 1/0 dönüyoruz
      }
    });
  } catch (error) {
    console.error('❌ Aktiflik değiştirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aktiflik durumu değiştirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Ürün öne çıkarma durumunu toggle et
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Öne çıkarma durumunu tersine çevir (BOOLEAN değeri)
    const newStatus = !product.is_featured;
    
    await Product.update(
      { is_featured: newStatus },
      { where: { id: id } }
    );

    console.log('⭐ Ürün öne çıkarma durumu değiştirildi:', id, '→', newStatus ? 'Öne Çıkan' : 'Normal');

    res.status(200).json({
      success: true,
      message: `Ürün ${newStatus ? 'öne çıkarıldı' : 'normalleştirildi'}`,
      data: {
        id: parseInt(id),
        is_featured: newStatus ? 1 : 0  // Frontend için 1/0 dönüyoruz
      }
    });
  } catch (error) {
    console.error('❌ Öne çıkarma durumu değiştirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Öne çıkarma durumu değiştirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Ürün sil
exports.deleteProduct = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, { transaction: t });
    
    if (!product) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    console.log('🗑️ Ürün siliniyor:', id, '-', product.name);

    // 1. Varyantları bul
    const variants = await ProductVariant.findAll({
      where: { product_id: id },
      raw: true,
      transaction: t
    });

    console.log('🗑️ Silinecek varyant sayısı:', variants.length);

    // 2. Tüm resimleri topla (hem ürün hem varyant resimleri)
    let allImages = [];

    // Ürün seviyesindeki resimler
    const productImages = await Image.findAll({
      where: { 
        imageable_id: id,
        imageable_type: 'products'
      },
      raw: true,
      transaction: t
    });
    allImages = allImages.concat(productImages);

    // Varyantların resimleri
    for (const variant of variants) {
      const variantImages = await Image.findAll({
        where: { 
          imageable_id: variant.id,
          imageable_type: 'products'
        },
        raw: true,
        transaction: t
      });
      allImages = allImages.concat(variantImages);
    }

    console.log('🗑️ Silinecek toplam resim sayısı:', allImages.length);

    // 3. Fiziksel dosyaları sil (hata verirse devam et)
    for (const image of allImages) {
      try {
        const filePath = path.join(process.cwd(), image.image_url);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('✅ Fiziksel dosya silindi:', image.image_url);
        } else {
          console.log('⚠️ Dosya bulunamadı (zaten silinmiş olabilir):', image.image_url);
        }
      } catch (fileError) {
        console.error('⚠️ Dosya silinirken hata (devam ediliyor):', image.image_url, fileError.message);
        // Dosya silme hatası transaction'ı iptal etmemeli, devam et
      }
    }

    // 4. Veritabanından varyantlara ait resimleri sil
    for (const variant of variants) {
      await Image.destroy({
        where: { 
          imageable_id: variant.id,
          imageable_type: 'products'
        },
        transaction: t
      });
    }

    // 5. Veritabanından ürün resimlerini sil
    await Image.destroy({
      where: { 
        imageable_id: id,
        imageable_type: 'products'
      },
      transaction: t
    });

    // 6. Varyantları sil
    await ProductVariant.destroy({
      where: { product_id: id },
      transaction: t
    });

    // 7. Ürünü sil
    await product.destroy({ transaction: t });

    await t.commit();

    console.log('✅ Ürün başarıyla silindi:', id);

    res.status(200).json({
      success: true,
      message: 'Ürün başarıyla silindi'
    });
  } catch (error) {
    await t.rollback();
    console.error('❌ Ürün silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// Ürün resmini sil (hem ürün hem varyant resimleri)
exports.deleteProductImage = async (req, res) => {
  try {
    const { image_id } = req.params;
    
    // Önce resmi bul
    const image = await Image.findOne({
      where: { 
        id: image_id,
        imageable_type: 'products'
      }
    });
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı'
      });
    }

    console.log('🗑️ Resim siliniyor:', image.id, image.image_url);

    // Fiziksel dosyayı sil
    try {
      const filePath = path.join(process.cwd(), image.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('✅ Fiziksel dosya silindi:', image.image_url);
      }
    } catch (fileError) {
      console.error('⚠️ Dosya silinirken hata:', fileError.message);
    }

    // Veritabanından sil
    await image.destroy();
    
    console.log('✅ Resim veritabanından silindi:', image_id);
    res.status(200).json({
      success: true,
      message: 'Resim başarıyla silindi'
    });
  } catch (error) {
    console.error('❌ Resim silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Resim silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// Varyanta resim yükle (güncelleme sırasında)
exports.uploadVariantImages = async (req, res) => {
  try {
    const { variant_id } = req.params;
    
    // Varyantın var olup olmadığını kontrol et
    const variant = await ProductVariant.findByPk(variant_id);
    
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Varyant bulunamadı'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Resim dosyası bulunamadı'
      });
    }

    console.log('📤 Varyanta resim yükleniyor:', variant_id, req.files.length, 'dosya');

    // Bu varyantın mevcut resimlerini kontrol et (kapak var mı?)
    const existingImages = await Image.findAll({
      where: {
        imageable_id: variant_id,
        imageable_type: 'products'
      }
    });

    const hasCoverImage = existingImages.some(img => img.image_type === 'cover');

    // Resimleri veritabanına kaydet
    const imageRecords = req.files.map((file, index) => ({
      image_url: file.path.replace(/\\/g, '/'), // Windows path fix
      imageable_id: variant_id,
      imageable_type: 'products', // Hepsi products olarak
      image_type: (!hasCoverImage && index === 0) ? 'cover' : 'gallery', // Kapak yoksa ilk resim kapak
      sort_order: existingImages.length + index
    }));
    
    const createdImages = await Image.bulkCreate(imageRecords);
    
    console.log('✅ Resimler kaydedildi:', createdImages.length);

    res.status(200).json({
      success: true,
      message: 'Resimler başarıyla yüklendi',
      data: createdImages
    });
  } catch (error) {
    console.error('❌ Resim yükleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Resimler yüklenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Varyant kapak resmini ayarla (sadece 1 kapak olacak)
exports.setVariantCoverImage = async (req, res) => {
  try {
    const { variant_id } = req.params;
    const { imageId } = req.body;
    
    // Varyantın var olup olmadığını kontrol et
    const variant = await ProductVariant.findByPk(variant_id);
    
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Varyant bulunamadı'
      });
    }

    console.log('🌟 Kapak resmi ayarlanıyor:', variant_id, 'Resim ID:', imageId);

    // 1. Bu varyantın TÜM resimlerini gallery yap
    await Image.update(
      { image_type: 'gallery' },
      { 
        where: { 
          imageable_id: variant_id,
          imageable_type: 'products'
        }
      }
    );

    // 2. Seçilen resmi cover yap
    const updated = await Image.update(
      { image_type: 'cover' },
      { 
        where: { 
          id: imageId,
          imageable_id: variant_id,
          imageable_type: 'products'
        }
      }
    );

    if (updated[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı veya güncellenemedi'
      });
    }

    console.log('✅ Kapak resmi ayarlandı');

    res.status(200).json({
      success: true,
      message: 'Kapak resmi başarıyla ayarlandı'
    });
  } catch (error) {
    console.error('❌ Kapak ayarlama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kapak resmi ayarlanırken bir hata oluştu',
      error: error.message
    });
  }
};

// Varyant sil (product_variants ve resimlerini sil)
exports.deleteVariant = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { variant_id } = req.params;
    
    // Varyantı bul
    const variant = await ProductVariant.findByPk(variant_id, { transaction: t });
    
    if (!variant) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Varyant bulunamadı'
      });
    }

    console.log('🗑️ Varyant siliniyor:', variant_id);

    // 1. Varyanta ait resimleri bul (silmeden önce)
    const images = await Image.findAll({
      where: { 
        imageable_id: variant_id,
        imageable_type: 'products'
      },
      raw: true,
      transaction: t
    });

    console.log('🗑️ Silinecek resim sayısı:', images.length);

    // 2. Fiziksel dosyaları sil (klasörden)
    for (const image of images) {
      try {
        const filePath = path.join(process.cwd(), 'public', image.image_url);
        
        // Dosya varsa sil
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('🗑️ Fiziksel dosya silindi:', image.image_url);
        } else {
          console.log('⚠️ Dosya bulunamadı:', image.image_url);
        }
      } catch (fileError) {
        console.error('❌ Dosya silinirken hata:', image.image_url, fileError.message);
        // Dosya silme hatası transaction'ı iptal etmemeli, devam et
      }
    }

    // 3. Veritabanından resimleri sil
    await Image.destroy({
      where: { 
        imageable_id: variant_id,
        imageable_type: 'products'
      },
      transaction: t
    });

    console.log('✅ Veritabanından resimler silindi');

    // 4. Varyantı sil
    await variant.destroy({ transaction: t });

    console.log('✅ Varyant silindi:', variant_id);

    await t.commit();

    res.status(200).json({
      success: true,
      message: 'Varyant ve resimleri başarıyla silindi',
      deletedImages: images.length
    });
  } catch (error) {
    await t.rollback();
    console.error('❌ Varyant silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Varyant silinirken bir hata oluştu',
      error: error.message
    });
  }
};

