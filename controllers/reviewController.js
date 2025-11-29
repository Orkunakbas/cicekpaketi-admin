const Review = require('../models/reviewModel');
const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// ============================================
// FRONTEND (E-TİCARET) ENDPOİNTLERİ
// ============================================

// Ürüne ait yorumları listele (onaylanmış)
exports.getProductReviews = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { sort = 'newest' } = req.query;

    let orderClause = [['created_at', 'DESC']];
    
    if (sort === 'helpful') {
      orderClause = [['helpful_count', 'DESC']];
    } else if (sort === 'rating_high') {
      orderClause = [['rating', 'DESC']];
    } else if (sort === 'rating_low') {
      orderClause = [['rating', 'ASC']];
    }

    const reviews = await Review.findAll({
      where: {
        product_id,
        is_approved: true
      },
      order: orderClause,
      raw: true
    });

    // Her yorum için user bilgisini ekle
    const reviewsWithUser = await Promise.all(
      reviews.map(async (review) => {
        let userName = 'Misafir Kullanıcı';
        
        if (review.user_id) {
          const user = await User.findByPk(review.user_id, {
            attributes: ['name', 'surname'],
            raw: true
          });
          if (user) {
            userName = `${user.name || ''} ${user.surname ? user.surname.charAt(0) + '.' : ''}`.trim();
          }
        }

        return {
          ...review,
          user_name: userName
        };
      })
    );

    // Ortalama rating hesapla
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Rating dağılımı (1-5 yıldız için)
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    res.json({
      success: true,
      data: {
        reviews: reviewsWithUser,
        stats: {
          total: reviews.length,
          avgRating: parseFloat(avgRating),
          distribution: ratingDistribution
        }
      }
    });
  } catch (error) {
    console.error('getProductReviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Yorumlar alınırken hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcının değerlendirebileceği ürünleri listele
exports.getUserReviewableProducts = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Kullanıcının teslim edilmiş siparişlerini bul
    const deliveredOrders = await Order.findAll({
      where: {
        user_id,
        order_status: 'delivered'
      },
      attributes: ['id', 'order_number'],
      raw: true
    });

    if (deliveredOrders.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const orderIds = deliveredOrders.map(o => o.id);

    // Bu siparişlerdeki tüm ürünleri al
    const orderItems = await OrderItem.findAll({
      where: {
        order_id: { [Op.in]: orderIds }
      },
      raw: true
    });

    // Her order_item için yorum yapılmış mı kontrol et
    const itemsWithReviewStatus = await Promise.all(
      orderItems.map(async (item) => {
        const existingReview = await Review.findOne({
          where: { order_item_id: item.id },
          raw: true
        });

        return {
          order_item_id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          quantity: item.quantity,
          has_review: !!existingReview,
          review_id: existingReview?.id || null
        };
      })
    );

    res.json({
      success: true,
      data: itemsWithReviewStatus
    });
  } catch (error) {
    console.error('getUserReviewableProducts error:', error);
    res.status(500).json({
      success: false,
      message: 'Değerlendirilebilir ürünler alınırken hata oluştu',
      error: error.message
    });
  }
};

// Yorum ekle
exports.addReview = async (req, res) => {
  try {
    const {
      user_id,
      product_id,
      order_id,
      order_item_id,
      rating,
      title,
      comment
    } = req.body;

    // Order_item'ın zaten yorumlanmadığını kontrol et
    const existingReview = await Review.findOne({
      where: { order_item_id }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Bu ürün için zaten değerlendirme yapılmış'
      });
    }

    // Siparişin delivered olduğunu kontrol et
    const order = await Order.findByPk(order_id);
    if (!order || order.order_status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Sadece teslim edilmiş siparişler değerlendirilebilir'
      });
    }

    // Yorum oluştur
    const review = await Review.create({
      user_id: user_id || null,
      product_id,
      order_id,
      order_item_id,
      rating,
      title: title || null,
      comment: comment || null,
      review_image: req.file ? req.file.path.replace(/\\/g, '/') : null,
      is_verified_purchase: true,
      is_approved: false
    });

    res.status(201).json({
      success: true,
      message: 'Değerlendirmeniz alındı. Onaylandıktan sonra yayınlanacak.',
      data: review
    });
  } catch (error) {
    console.error('addReview error:', error);
    res.status(500).json({
      success: false,
      message: 'Değerlendirme eklenirken hata oluştu',
      error: error.message
    });
  }
};

// Yorumu faydalı bul
exports.markHelpful = async (req, res) => {
  try {
    const { review_id } = req.params;

    const review = await Review.findByPk(review_id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
    }

    await review.increment('helpful_count');

    res.json({
      success: true,
      message: 'Teşekkürler!',
      data: {
        helpful_count: review.helpful_count + 1
      }
    });
  } catch (error) {
    console.error('markHelpful error:', error);
    res.status(500).json({
      success: false,
      message: 'İşlem başarısız',
      error: error.message
    });
  }
};

// ============================================
// ADMİN PANELİ ENDPOİNTLERİ
// ============================================

// Tüm yorumları listele (admin)
exports.listAllReviews = async (req, res) => {
  try {
    const { status = 'all' } = req.query;

    let whereClause = {};
    
    if (status === 'pending') {
      whereClause.is_approved = false;
    } else if (status === 'approved') {
      whereClause.is_approved = true;
    }

    const reviews = await Review.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      raw: true
    });

    // Her yorum için user, product ve order bilgisini ekle
    const reviewsWithDetails = await Promise.all(
      reviews.map(async (review) => {
        let userName = 'Misafir Kullanıcı';
        let userEmail = null;
        
        if (review.user_id) {
          const user = await User.findByPk(review.user_id, {
            attributes: ['name', 'surname', 'email'],
            raw: true
          });
          if (user) {
            userName = `${user.name || ''} ${user.surname || ''}`.trim();
            userEmail = user.email;
          }
        }

        const product = await Product.findByPk(review.product_id, {
          attributes: ['name', 'slug'],
          raw: true
        });

        const order = await Order.findByPk(review.order_id, {
          attributes: ['order_number'],
          raw: true
        });

        return {
          ...review,
          user_name: userName,
          user_email: userEmail,
          product_name: product?.name || 'Bilinmeyen Ürün',
          product_slug: product?.slug || null,
          order_number: order?.order_number || null
        };
      })
    );

    res.json({
      success: true,
      data: reviewsWithDetails
    });
  } catch (error) {
    console.error('listAllReviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Yorumlar alınırken hata oluştu',
      error: error.message
    });
  }
};

// Yorumu onayla/reddet (admin)
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;

    const review = await Review.findByPk(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
    }

    await review.update({ is_approved });

    res.json({
      success: true,
      message: is_approved ? 'Yorum onaylandı' : 'Yorum reddedildi',
      data: review
    });
  } catch (error) {
    console.error('approveReview error:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// Yorumu sil (admin)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
    }

    // Resim varsa fiziksel dosyayı sil
    if (review.review_image) {
      try {
        const filePath = path.join(process.cwd(), review.review_image);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('✅ Yorum resmi silindi:', review.review_image);
        }
      } catch (fileError) {
        console.error('⚠️ Dosya silinirken hata:', fileError.message);
      }
    }

    await review.destroy();

    res.json({
      success: true,
      message: 'Yorum başarıyla silindi'
    });
  } catch (error) {
    console.error('deleteReview error:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum silinirken hata oluştu',
      error: error.message
    });
  }
};

