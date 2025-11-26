const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');
const Product = require('../models/productModel');
const ProductVariant = require('../models/productVariantModel');
const Image = require('../models/imageModel');

// Sipariş numarası oluştur (örn: ÇP-324833)
const generateOrderNumber = () => {
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `ÇP-${random}`;
};

// Sipariş oluştur
exports.createOrder = async (req, res) => {
  try {
    console.log('🚀 ========== SİPARİŞ OLUŞTURMA BAŞLADI ==========');
    
    const {
      user_id,
      session_id,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      billing_address,
      payment_method,
      customer_note
    } = req.body;

    console.log('📦 Sipariş Oluşturma İsteği:', req.body);

    // 1. Kullanıcı kontrolü (user_id veya session_id zorunlu)
    if (!user_id && !session_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id veya session_id gerekli'
      });
    }

    // 2. Sepeti kontrol et
    const cart = await Cart.findOne({
      where: user_id ? { user_id } : { session_id }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Sepet bulunamadı'
      });
    }

    // 3. Sepet ürünlerini al
    const cartItems = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductVariant,
          as: 'variant',
          required: false,
          attributes: ['id', 'sku', 'stock_quantity']
        }
      ]
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sepetiniz boş'
      });
    }

    // 4. Fiyat hesaplamaları
    let subtotal = 0;

    const orderItemsData = [];

    for (const item of cartItems) {
      const product = item.product;
      const variant = item.variant;
      
      // Ürün resmini al
      const coverImage = await Image.findOne({
        where: {
          imageable_id: product.id,
          imageable_type: 'products'
        },
        order: [['sort_order', 'ASC']],
        limit: 1
      });

      const itemPrice = parseFloat(item.price);
      const itemDiscountPrice = item.discount_price ? parseFloat(item.discount_price) : null;
      const finalPrice = itemDiscountPrice || itemPrice; // İndirimli fiyat varsa onu, yoksa normal fiyatı kullan
      const quantity = item.quantity;

      const lineTotal = finalPrice * quantity;

      // Subtotal'a son fiyatı ekle (indirimli veya normal)
      subtotal += lineTotal;

      // Varyant bilgilerini hazırla
      let variantInfo = null;
      if (variant) {
        variantInfo = {
          sku: variant.sku,
          stock: variant.stock_quantity
        };
      }

      orderItemsData.push({
        product_id: product.id,
        variant_id: variant ? variant.id : null,
        product_name: product.name,
        variant_info: variantInfo,
        product_image: coverImage ? `${req.protocol}://${req.get('host')}/${coverImage.image_url}` : null,
        quantity: quantity,
        price: finalPrice,
        line_total: lineTotal
      });
    }

    // Kargo hesapla
    const SHIPPING_COST = 50;
    const FREE_SHIPPING_THRESHOLD = 1000;
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const totalAmount = subtotal + shippingCost;

    // 5. Sipariş numarası oluştur
    const orderNumber = generateOrderNumber();

    // 6. Sipariş oluştur
    // Customer name'i belirle: önce gönderilen customer_name, sonra shipping_address'den ad+soyad veya company_name
    let finalCustomerName = customer_name;
    if (!finalCustomerName && shipping_address) {
      if (shipping_address.full_name) {
        finalCustomerName = shipping_address.full_name;
      } else if (shipping_address.name && shipping_address.surname) {
        finalCustomerName = `${shipping_address.name} ${shipping_address.surname}`.trim();
      } else if (shipping_address.company_name) {
        finalCustomerName = shipping_address.company_name;
      }
    }
    
    const order = await Order.create({
      user_id: user_id || null,
      session_id: session_id || null,
      order_number: orderNumber,
      customer_name: finalCustomerName || 'Misafir Kullanıcı',
      customer_email: customer_email,
      customer_phone: customer_phone || shipping_address?.phone,
      shipping_address: shipping_address,
      billing_address: billing_address || shipping_address,
      subtotal: subtotal, // İndirimli fiyatlarla hesaplanmış subtotal
      discount: 0, // Artık ayrı discount tutmuyoruz, fiyatlar zaten indirimli
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      order_status: 'pending',
      payment_method: payment_method || null,
      payment_status: 'pending',
      customer_note: customer_note || null
    });

    console.log('✅ Sipariş Oluşturuldu:', order.id, orderNumber);

    // 7. Sipariş ürünlerini oluştur ve stok düşür
    console.log('📦 Sipariş ürünleri oluşturuluyor:', orderItemsData.length, 'adet');
    
    for (const itemData of orderItemsData) {
      await OrderItem.create({
        order_id: order.id,
        ...itemData
      });

      console.log(`🔍 Stok kontrolü - Ürün: ${itemData.product_name}, Variant ID: ${itemData.variant_id}, Miktar: ${itemData.quantity}`);

      // Stok düşürme: Eğer varyant varsa stok miktarını azalt
      if (itemData.variant_id) {
        const variant = await ProductVariant.findByPk(itemData.variant_id);
        if (variant) {
          const oldStock = variant.stock_quantity;
          const newStock = Math.max(0, oldStock - itemData.quantity);
          await variant.update({ stock_quantity: newStock });
          console.log(`📉 Stok Düşürüldü - Variant ID: ${itemData.variant_id}, Eski: ${oldStock}, Yeni: ${newStock}`);
        } else {
          console.log(`⚠️ Varyant bulunamadı - Variant ID: ${itemData.variant_id}`);
        }
      } else {
        console.log(`⚠️ Bu ürünün varyant ID'si yok (basit ürün veya varyant seçilmemiş)`);
      }
    }

    console.log('✅ Sipariş Ürünleri Eklendi ve Stoklar Güncellendi:', orderItemsData.length);

    // 8. Sepeti temizle
    await CartItem.destroy({
      where: { cart_id: cart.id }
    });
    await cart.destroy();

    console.log('✅ Sepet Temizlendi');

    // 9. Sipariş ürünlerini getir
    const createdOrderItems = await OrderItem.findAll({
      where: { order_id: order.id }
    });

    // 10. Response - Manuel olarak birleştir
    const orderResponse = {
      id: order.id,
      user_id: order.user_id,
      session_id: order.session_id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping_cost: order.shipping_cost,
      total_amount: order.total_amount,
      order_status: order.order_status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      payment_info: order.payment_info,
      customer_note: order.customer_note,
      admin_note: order.admin_note,
      tracking_number: order.tracking_number,
      shipping_company: order.shipping_company,
      created_at: order.created_at,
      updated_at: order.updated_at,
      orderItems: createdOrderItems
    };

    res.json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      data: orderResponse
    });

  } catch (error) {
    console.error('❌ Sipariş oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sipariş oluşturulurken hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcının siparişlerini getir
exports.getUserOrders = async (req, res) => {
  try {
    const user_id = req.user?.id; // Auth middleware'den geliyor

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Giriş yapmanız gerekiyor'
      });
    }

    // Kullanıcının siparişlerini getir
    const orders = await Order.findAll({
      where: { user_id },
      order: [['created_at', 'DESC']]
    });

    // Her sipariş için ürünleri getir
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await OrderItem.findAll({
          where: { order_id: order.id }
        });

        return {
          ...order.toJSON(),
          orderItems
        };
      })
    );

    res.json({
      success: true,
      data: ordersWithItems
    });

  } catch (error) {
    console.error('❌ Siparişleri getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Siparişler getirilirken hata oluştu',
      error: error.message
    });
  }
};

// Sipariş detayını order_number ile getir
exports.getOrderByNumber = async (req, res) => {
  try {
    const { order_number } = req.params;

    const order = await Order.findOne({
      where: { order_number }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
    }

    // Sipariş ürünlerini manuel olarak getir
    const orderItems = await OrderItem.findAll({
      where: { order_id: order.id }
    });

    // Manuel olarak birleştir
    const orderResponse = {
      ...order.toJSON(),
      orderItems
    };

    res.json({
      success: true,
      data: orderResponse
    });

  } catch (error) {
    console.error('❌ Sipariş detayı getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sipariş detayı getirilirken hata oluştu',
      error: error.message
    });
  }
};

