const Product = require('../models/productModel');
const ProductVariant = require('../models/productVariantModel');
const Image = require('../models/imageModel');
const Category = require('../models/categoryModel');
const { Op } = require('sequelize');

// ============================================
// E-TİCARET - KATEGORİ BAZLI ÜRÜN LİSTELEME
// ============================================
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
    
    console.log('🔍 [E-Commerce] Kategori arama:', { category_url, language_code, fullPath: req.params.category_url });
    
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
    
    console.log('✅ [E-Commerce] Kategori bulundu:', category.name, '(ID:', category.id + ')');
    
    // WHERE şartları (sadece aktif ürünler)
    let whereClause = {
      is_active: true
    };
    
    if (language_code) {
      whereClause.language_code = language_code;
    }
    
    const products = await Product.findAll({
      where: whereClause,
      order: [['id', 'DESC']],
      raw: true
    });
    
    console.log('📦 [E-Commerce] Bulunan aktif ürün sayısı:', products.length);

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
        console.error('❌ [E-Commerce] Kategori parse hatası:', e.message, '- Ürün:', product.name);
        return false;
      }
    });

    console.log('✅ [E-Commerce] Kategoriye göre filtrelenmiş ürün sayısı:', filteredProducts.length);

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
            console.error('❌ [E-Commerce] Kategori parse hatası:', e.message);
          }
        }

        // Varyantlardan min/max fiyat hesapla
        let minPrice = null;
        let maxPrice = null;
        let minDiscount = null;
        let maxDiscount = null;
        
        if (variantsWithImages.length > 0) {
          const prices = variantsWithImages.map(v => v.price).filter(p => p > 0);
          const discounts = variantsWithImages.map(v => v.discount_price).filter(d => d && d > 0);
          
          if (prices.length > 0) {
            minPrice = Math.min(...prices);
            maxPrice = Math.max(...prices);
          }
          
          if (discounts.length > 0) {
            minDiscount = Math.min(...discounts);
            maxDiscount = Math.max(...discounts);
          }
        }

        return { 
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          short_description: product.short_description,
          category_id: parsedCategoryIds,
          categoryNames: categoryNames,
          brand: product.brand,
          tags: product.tags,
          is_variant: product.is_variant,
          language_code: product.language_code,
          meta_title: product.meta_title,
          meta_description: product.meta_description,
          variantCount,
          imageCount,
          coverImage: coverImage?.image_url || null,
          minPrice,
          maxPrice,
          minDiscount,
          maxDiscount,
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
        description: category.description,
        image_url: category.image_url
      },
      data: productsWithCounts
    });
  } catch (error) {
    console.error('[E-Commerce] Kategori ürünleri alınırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Ürünler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// ============================================
// E-TİCARET - TEK ÜRÜN DETAYI (SLUG BAZLI)
// ============================================
exports.getSingleProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    
    console.log('🔍 [E-Commerce] Ürün detayı arama - Slug:', slug);
    
    const product = await Product.findOne({
      where: { 
        slug,
        is_active: true // Sadece aktif ürünler
      },
      raw: true
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı veya aktif değil'
      });
    }

    // Varyantları getir
    const variants = await ProductVariant.findAll({
      where: { product_id: product.id },
      raw: true
    });

    // Her varyant için resimleri de çek
    const variantsWithImages = await Promise.all(
      variants.map(async (variant) => {
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
          images: cleanImages
        };
      })
    );

    // Ürün seviyesindeki resimleri getir (varyantsız ürünler için)
    const productImages = await Image.findAll({
      where: { 
        imageable_id: product.id,
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
    let categoryNames = [];
    
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
        
        // Kategori isimlerini al
        if (parsedCategoryIds.length > 0) {
          const categories = await Category.findAll({
            where: { id: parsedCategoryIds },
            attributes: ['id', 'name', 'category_url'],
            raw: true
          });
          categoryNames = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            url: cat.category_url
          }));
        }
      } catch (e) {
        console.error('❌ [E-Commerce] Kategori parse hatası:', e.message);
      }
    }

    console.log('✅ [E-Commerce] Ürün detayı bulundu:', product.name);

    res.status(200).json({
      success: true,
      data: {
        ...product,
        category_id: parsedCategoryIds,
        categories: categoryNames,
        variants: variantsWithImages,
        images: cleanProductImages
      }
    });
  } catch (error) {
    console.error('[E-Commerce] Ürün detayı alınırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// ============================================
// E-TİCARET - KATEGORİ AĞACI (HİYERARŞİK)
// ============================================
exports.getCategories = async (req, res) => {
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

    console.log('✅ [E-Commerce] Kategori ağacı oluşturuldu - Toplam:', categories.length, 'kategori');

    res.status(200).json({
      success: true,
      data: tree
    });
  } catch (error) {
    console.error('[E-Commerce] Kategori ağacı alınırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Kategoriler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// ============================================
// E-TİCARET - ÜRÜN ARAMA
// ============================================
exports.searchProducts = async (req, res) => {
  try {
    console.log('🔍 [ARAMA API] İstek geldi!');
    console.log('Query parametreleri:', req.query);
    console.log('URL:', req.url);
    
    const { q, language_code, limit = 10 } = req.query;
    
    console.log('Arama terimi (q):', q, '| Uzunluk:', q ? q.length : 0);
    
    // Arama terimi kontrolü (minimum 3 karakter)
    if (!q || q.length < 3) {
      console.log('❌ Arama terimi yetersiz!');
      return res.status(400).json({
        success: false,
        message: 'Arama terimi en az 3 karakter olmalıdır',
        received: q || 'boş'
      });
    }
    
    console.log('✅ [E-Commerce] Ürün arama başlıyor:', { query: q, language_code, limit });
    
    // WHERE şartları
    let whereClause = {
      is_active: true,
      name: {
        [Op.like]: `%${q}%` // Ürün isminde arama
      }
    };
    
    if (language_code) {
      whereClause.language_code = language_code;
    }
    
    // Ürünleri ara
    const products = await Product.findAll({
      where: whereClause,
      limit: parseInt(limit),
      order: [['name', 'ASC']],
      raw: true
    });
    
    console.log('📦 [E-Commerce] Bulunan ürün sayısı:', products.length);
    
    // Her ürün için detayları ekle
    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        // Varyantları al
        const variants = await ProductVariant.findAll({
          where: { product_id: product.id },
          raw: true
        });
        
        // Cover resmi bul
        let coverImage = null;
        
        if (product.is_variant === 0) {
          // Basit ürün - product_id'ye bağlı cover resmi
          const productCover = await Image.findOne({
            where: { 
              imageable_id: product.id,
              imageable_type: 'products',
              image_type: 'cover'
            },
            raw: true
          });
          
          if (!productCover) {
            // Cover yoksa ilk resmi al
            const firstImage = await Image.findOne({
              where: { 
                imageable_id: product.id,
                imageable_type: 'products'
              },
              order: [['sort_order', 'ASC']],
              raw: true
            });
            coverImage = firstImage?.image_url || null;
          } else {
            coverImage = productCover.image_url;
          }
        } else {
          // Varyantlı ürün - ilk varyantın cover resmini al
          if (variants.length > 0) {
            const variantCover = await Image.findOne({
              where: { 
                imageable_id: variants[0].id,
                imageable_type: 'products',
                image_type: 'cover'
              },
              raw: true
            });
            
            if (!variantCover) {
              // Cover yoksa ilk resmi al
              const firstImage = await Image.findOne({
                where: { 
                  imageable_id: variants[0].id,
                  imageable_type: 'products'
                },
                order: [['sort_order', 'ASC']],
                raw: true
              });
              coverImage = firstImage?.image_url || null;
            } else {
              coverImage = variantCover.image_url;
            }
          }
        }
        
        // Fiyat ve indirim aralığı hesapla
        let minPrice = null;
        let maxPrice = null;
        let minDiscount = null;
        let maxDiscount = null;
        
        if (variants.length > 0) {
          const prices = variants.map(v => parseFloat(v.price)).filter(p => p > 0);
          const discounts = variants.map(v => v.discount_price ? parseFloat(v.discount_price) : null).filter(d => d && d > 0);
          
          if (prices.length > 0) {
            minPrice = Math.min(...prices);
            maxPrice = Math.max(...prices);
          }
          
          if (discounts.length > 0) {
            minDiscount = Math.min(...discounts);
            maxDiscount = Math.max(...discounts);
          }
        }
        
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          short_description: product.short_description,
          coverImage,
          minPrice: minDiscount || minPrice || 0,
          maxPrice: maxDiscount || maxPrice || minPrice || 0,
          minDiscount,
          maxDiscount,
          is_variant: product.is_variant
        };
      })
    );
    
    res.status(200).json({
      success: true,
      query: q,
      count: productsWithDetails.length,
      data: productsWithDetails
    });
  } catch (error) {
    console.error('[E-Commerce] Ürün arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Arama sırasında bir hata oluştu',
      error: error.message
    });
  }
};

// ============================================
// E-TİCARET - ÖNE ÇIKAN ÜRÜNLER
// ============================================
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { language_code } = req.query;
    
    // WHERE şartları: is_featured = 1 ve is_active = 1
    const whereClause = {
      is_featured: true,
      is_active: true
    };
    
    if (language_code) {
      whereClause.language_code = language_code;
    }
    
    console.log('⭐ [E-Commerce] Öne çıkan ürünler getiriliyor:', whereClause);
    
    const products = await Product.findAll({
      where: whereClause,
      order: [['id', 'DESC']],
      raw: true
    });

    console.log('✅ [E-Commerce] Öne çıkan ürün sayısı:', products.length);

    // Her ürün için varyant sayısını, resim sayısını ve fiyat/stok bilgisini ekle
    const productsWithDetails = await Promise.all(
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

        // TÜM VARYANTLARI ÇEK (fiyat bilgisi için)
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

        // Min ve Max fiyat hesapla
        let minPrice = null;
        let maxPrice = null;
        let minDiscountPrice = null;
        let maxDiscountPrice = null;

        if (variantsWithImages && variantsWithImages.length > 0) {
          const prices = variantsWithImages.map(v => v.price).filter(p => p > 0);
          const discountPrices = variantsWithImages
            .map(v => v.discount_price)
            .filter(p => p !== null && p > 0);
          
          if (prices.length > 0) {
            minPrice = Math.min(...prices);
            maxPrice = Math.max(...prices);
          }
          
          if (discountPrices.length > 0) {
            minDiscountPrice = Math.min(...discountPrices);
            maxDiscountPrice = Math.max(...discountPrices);
          }
        }

        // Kategori isimlerini al
        let parsedCategoryIds = [];
        let categoryNames = [];
        
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
              const cats = await Category.findAll({
                where: { id: parsedCategoryIds },
                attributes: ['id', 'name'],
                raw: true
              });
              categoryNames = cats.map(c => c.name);
            }
          } catch (e) {
            console.error('❌ [E-Commerce] Kategori parse hatası:', e.message);
            parsedCategoryIds = [];
          }
        }

        return { 
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          short_description: product.short_description,
          category_id: parsedCategoryIds,
          categoryNames: categoryNames,
          brand: product.brand,
          tags: product.tags,
          is_variant: product.is_variant,
          language_code: product.language_code,
          variantCount,
          imageCount,
          coverImage: coverImage?.image_url || null,
          minPrice,
          maxPrice,
          minDiscountPrice,
          maxDiscountPrice,
          variants: variantsWithImages
        };
      })
    );

    res.status(200).json({
      success: true,
      count: productsWithDetails.length,
      data: productsWithDetails
    });
  } catch (error) {
    console.error('❌ [E-Commerce] Öne çıkan ürünler getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Öne çıkan ürünler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

