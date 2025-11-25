const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');
const Product = require('../models/productModel');
const ProductVariant = require('../models/productVariantModel');
const Image = require('../models/imageModel');
const crypto = require('crypto');

// Model ilişkileri (sadece cart için)
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// Session ID oluşturucu
const generateSessionId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Sepeti getir (user_id veya session_id ile)
exports.getCart = async (req, res) => {
  try {
    const { user_id, session_id } = req.query;

    if (!user_id && !session_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'user_id veya session_id gerekli' 
      });
    }

    // Sepeti bul
    let cart = await Cart.findOne({
      where: user_id ? { user_id } : { session_id }
    });

    // Sepet yoksa boş döndür
    if (!cart) {
      return res.json({
        success: true,
        data: {
          cart: null,
          items: [],
          summary: {
            subtotal: 0,
            discount: 0,
            total: 0,
            item_count: 0
          }
        }
      });
    }

    // Sepet ürünlerini getir
    const cartItems = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [
        {
          model: Product,
          as: 'product'
        },
        {
          model: ProductVariant,
          as: 'variant',
          required: false
        }
      ]
    });

    // Her ürün için cover image'i ayrıca getir
    for (const item of cartItems) {
      if (item.product) {
        const coverImage = await Image.findOne({
          where: {
            imageable_id: item.product.id,
            imageable_type: 'products'
          },
          order: [['sort_order', 'ASC']],
          limit: 1
        });
        item.product.coverImage = coverImage;
      }
    }

    // Fiyat hesaplaması
    let subtotal = 0;
    let discount = 0;

    const items = cartItems.map(item => {
      const itemPrice = parseFloat(item.price);
      const itemDiscountPrice = item.discount_price ? parseFloat(item.discount_price) : null;
      const quantity = item.quantity;

      const lineTotal = (itemDiscountPrice || itemPrice) * quantity;
      const lineDiscount = itemDiscountPrice ? (itemPrice - itemDiscountPrice) * quantity : 0;

      subtotal += itemPrice * quantity;
      discount += lineDiscount;

      // Ürün bilgileri
      const product = item.product;
      const coverImage = product?.coverImage;

      // Varyant bilgileri
      const variant = item.variant;
      
      // Varyant opsiyonlarını topla (color, size, material)
      const variantOptions = [];
      if (variant) {
        if (variant.color) variantOptions.push({ name: 'Renk', value: variant.color });
        if (variant.size) variantOptions.push({ name: 'Beden', value: variant.size });
        if (variant.material) variantOptions.push({ name: 'Malzeme', value: variant.material });
        if (variant.additional_options) {
          // JSON olarak tutulan ek opsiyonlar
          try {
            const additionalOpts = typeof variant.additional_options === 'string' 
              ? JSON.parse(variant.additional_options) 
              : variant.additional_options;
            Object.entries(additionalOpts).forEach(([key, value]) => {
              variantOptions.push({ name: key, value });
            });
          } catch (e) {
            console.error('Additional options parse error:', e);
          }
        }
      }

      // Frontend için formatla
      return {
        id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: itemPrice,
        discount_price: itemDiscountPrice,
        line_total: parseFloat(lineTotal.toFixed(2)),
        line_discount: parseFloat(lineDiscount.toFixed(2)),
        
        // Ürün detayları
        product: {
          id: product?.id,
          slug: product?.slug,
          name: product?.name || 'Ürün',
          image: coverImage?.image_url ? `${req.protocol}://${req.get('host')}${coverImage.image_url}` : null,
          is_variant: product?.is_variant
        },
        
        // Varyant detayları
        variant: variant ? {
          id: variant.id,
          sku: variant.sku,
          stock: variant.stock_quantity,
          options: variantOptions
        } : null
      };
    });

    const total = subtotal - discount;

    res.json({
      success: true,
      data: {
        cart: {
          id: cart.id,
          user_id: cart.user_id,
          session_id: cart.session_id,
          created_at: cart.created_at,
          updated_at: cart.updated_at
        },
        items,
        summary: {
          subtotal: subtotal.toFixed(2),
          discount: discount.toFixed(2),
          total: total.toFixed(2),
          item_count: items.length
        }
      }
    });

  } catch (error) {
    console.error('Sepet getirme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sepet getirilirken hata oluştu',
      error: error.message 
    });
  }
};

// Sepete ürün ekle
exports.addToCart = async (req, res) => {
  try {
    const { user_id, session_id, product_id, variant_id, quantity = 1 } = req.body;

    if (!user_id && !session_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'user_id veya session_id gerekli' 
      });
    }

    if (!product_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'product_id gerekli' 
      });
    }

    // Ürünü kontrol et
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ürün bulunamadı' 
      });
    }

    // Varyant kontrolü
    let variant = null;
    let price, discountPrice;

    if (variant_id) {
      variant = await ProductVariant.findByPk(variant_id);
      if (!variant) {
        return res.status(404).json({ 
          success: false, 
          message: 'Varyant bulunamadı' 
        });
      }
      price = variant.price;
      discountPrice = variant.discount_price;
    } else {
      // Basit ürün - ilk varyanttan fiyat al
      const firstVariant = await ProductVariant.findOne({
        where: { product_id }
      });
      price = firstVariant?.price || 0;
      discountPrice = firstVariant?.discount_price;
    }

    // Sepeti bul veya oluştur
    let cart = await Cart.findOne({
      where: user_id ? { user_id } : { session_id }
    });

    if (!cart) {
      cart = await Cart.create({
        user_id: user_id || null,
        session_id: session_id || generateSessionId()
      });
    }

    // Sepet ürünü var mı kontrol et
    let cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        product_id,
        variant_id: variant_id || null
      }
    });

    if (cartItem) {
      // Mevcut ürünün adetini artır
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Yeni ürün ekle
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id,
        variant_id: variant_id || null,
        quantity,
        price,
        discount_price: discountPrice
      });
    }

    res.json({
      success: true,
      message: 'Ürün sepete eklendi',
      data: {
        cart_id: cart.id,
        session_id: cart.session_id,
        item: cartItem
      }
    });

  } catch (error) {
    console.error('Sepete ekleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sepete eklenirken hata oluştu',
      error: error.message 
    });
  }
};

// Sepet ürünü güncelle (adet değiştir)
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Geçerli bir adet giriniz' 
      });
    }

    const cartItem = await CartItem.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sepet ürünü bulunamadı' 
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      success: true,
      message: 'Sepet güncellendi',
      data: cartItem
    });

  } catch (error) {
    console.error('Sepet güncelleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sepet güncellenirken hata oluştu',
      error: error.message 
    });
  }
};

// Sepetten ürün sil
exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await CartItem.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sepet ürünü bulunamadı' 
      });
    }

    await cartItem.destroy();

    res.json({
      success: true,
      message: 'Ürün sepetten kaldırıldı'
    });

  } catch (error) {
    console.error('Sepetten silme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ürün silinirken hata oluştu',
      error: error.message 
    });
  }
};

// Sepeti temizle (tüm ürünleri sil)
exports.clearCart = async (req, res) => {
  try {
    const { user_id, session_id } = req.query;

    if (!user_id && !session_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'user_id veya session_id gerekli' 
      });
    }

    const cart = await Cart.findOne({
      where: user_id ? { user_id } : { session_id }
    });

    if (!cart) {
      return res.json({
        success: true,
        message: 'Sepet zaten boş'
      });
    }

    // Tüm ürünleri sil
    await CartItem.destroy({
      where: { cart_id: cart.id }
    });

    // Sepeti de sil
    await cart.destroy();

    res.json({
      success: true,
      message: 'Sepet temizlendi'
    });

  } catch (error) {
    console.error('Sepet temizleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sepet temizlenirken hata oluştu',
      error: error.message 
    });
  }
};

