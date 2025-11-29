const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const { Op } = require('sequelize');
const sequelize = require('../database');

// Bu Ay İstatistikleri
exports.getMonthlyStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // 'month', 'week', 'month30'
    const now = new Date();
    
    let startDate, endDate, prevStartDate, prevEndDate;
    
    if (period === 'week') {
      // Son 7 gün
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      
      // Önceki 7 gün (trend için)
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 7);
      prevEndDate = new Date(startDate);
      prevEndDate.setHours(23, 59, 59, 999);
    } else if (period === 'month30') {
      // Son 30 gün
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      
      // Önceki 30 gün (trend için)
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 30);
      prevEndDate = new Date(startDate);
      prevEndDate.setHours(23, 59, 59, 999);
    } else {
      // Bu ay (default)
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      // Geçen ay (trend için)
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    }
    
    const firstDayOfMonth = startDate;
    const lastDayOfMonth = endDate;

    // Bu Ay Hasılat (sadece paid siparişler)
    const monthlyRevenue = await Order.sum('total_amount', {
      where: {
        created_at: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth]
        },
        payment_status: 'paid'
      }
    });

    // Bu Ay Sipariş Sayısı
    const monthlyOrders = await Order.count({
      where: {
        created_at: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth]
        }
      }
    });

    // Ort. Sipariş Tutarı (bu ay, sadece paid)
    const avgOrderAmount = await Order.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg']
      ],
      where: {
        created_at: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth]
        },
        payment_status: 'paid'
      },
      raw: true
    });

    // Yeni Üyeler (bu ay)
    const newUsers = await User.count({
      where: {
        created_at: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth]
        }
      }
    });

    // Önceki periyodun verilerini de alalım (trend için)
    const lastMonthRevenue = await Order.sum('total_amount', {
      where: {
        created_at: {
          [Op.between]: [prevStartDate, prevEndDate]
        },
        payment_status: 'paid'
      }
    }) || 0;

    const lastMonthOrders = await Order.count({
      where: {
        created_at: {
          [Op.between]: [prevStartDate, prevEndDate]
        }
      }
    });

    const lastMonthAvg = await Order.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg']
      ],
      where: {
        created_at: {
          [Op.between]: [prevStartDate, prevEndDate]
        },
        payment_status: 'paid'
      },
      raw: true
    });

    const lastMonthUsers = await User.count({
      where: {
        created_at: {
          [Op.between]: [prevStartDate, prevEndDate]
        }
      }
    });

    // Trend hesaplama
    const calculateTrend = (current, previous) => {
      if (!previous || previous === 0) return { value: '+0%', isUp: true };
      const diff = ((current - previous) / previous) * 100;
      return {
        value: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`,
        isUp: diff >= 0
      };
    };

    res.json({
      success: true,
      data: {
        revenue: {
          value: monthlyRevenue || 0,
          trend: calculateTrend(monthlyRevenue || 0, lastMonthRevenue)
        },
        orders: {
          value: monthlyOrders,
          trend: calculateTrend(monthlyOrders, lastMonthOrders)
        },
        avgOrderAmount: {
          value: parseFloat(avgOrderAmount?.avg || 0).toFixed(2),
          trend: calculateTrend(
            parseFloat(avgOrderAmount?.avg || 0),
            parseFloat(lastMonthAvg?.avg || 0)
          )
        },
        newUsers: {
          value: newUsers,
          trend: calculateTrend(newUsers, lastMonthUsers)
        }
      }
    });
  } catch (error) {
    console.error('getMonthlyStats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'İstatistikler alınırken hata oluştu',
      error: error.message 
    });
  }
};

// Toplam İstatistikler
exports.getTotalStats = async (req, res) => {
  try {
    // Toplam Sipariş
    const totalOrders = await Order.count();

    // Toplam Üye
    const totalUsers = await User.count();

    // Toplam Ürün (sadece aktif)
    const totalProducts = await Product.count({
      where: { is_active: true }
    });

    // Son 7 günlük sipariş verileri (mini chart için)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = await Order.count({
        where: {
          created_at: {
            [Op.between]: [date, nextDate]
          }
        }
      });
      
      last7Days.push({ value: dayOrders });
    }

    res.json({
      success: true,
      data: {
        totalOrders: {
          value: totalOrders,
          chartData: last7Days
        },
        totalUsers: {
          value: totalUsers,
          chartData: last7Days.map(() => ({ value: Math.floor(Math.random() * 50) + 800 })) // Placeholder
        },
        totalProducts: {
          value: totalProducts,
          chartData: last7Days.map(() => ({ value: Math.floor(Math.random() * 10) + totalProducts - 5 })) // Placeholder
        }
      }
    });
  } catch (error) {
    console.error('getTotalStats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Toplam istatistikler alınırken hata oluştu',
      error: error.message 
    });
  }
};

// En Çok Satan Ürünler (Top 5)
exports.getTopProducts = async (req, res) => {
  try {
    const topProducts = await OrderItem.findAll({
      attributes: [
        'product_id',
        'product_name',
        'product_image',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sales'],
        [sequelize.fn('SUM', sequelize.col('line_total')), 'total_revenue']
      ],
      group: ['product_id', 'product_name', 'product_image'],
      order: [[sequelize.literal('total_sales'), 'DESC']],
      limit: 5,
      raw: true
    });

    res.json({
      success: true,
      data: topProducts.map(product => ({
        name: product.product_name,
        sales: parseInt(product.total_sales),
        revenue: parseFloat(product.total_revenue),
        image: product.product_image
      }))
    });
  } catch (error) {
    console.error('getTopProducts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'En çok satan ürünler alınırken hata oluştu',
      error: error.message 
    });
  }
};

// En Son Üyeler (Son 5)
exports.getRecentUsers = async (req, res) => {
  try {
    const recentUsers = await User.findAll({
      attributes: ['id', 'name', 'surname', 'email', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: recentUsers.map(user => {
        // Tarih farkını hesapla
        const now = new Date();
        const created = new Date(user.created_at);
        const diffMs = now - created;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeAgo = 'Bugün';
        if (diffMins < 60) {
          timeAgo = `${diffMins} dakika önce`;
        } else if (diffHours < 24) {
          timeAgo = `${diffHours} saat önce`;
        } else if (diffDays === 1) {
          timeAgo = 'Dün';
        } else if (diffDays < 30) {
          timeAgo = `${diffDays} gün önce`;
        }

        return {
          name: `${user.name || ''} ${user.surname || ''}`.trim(),
          email: user.email,
          date: timeAgo
        };
      })
    });
  } catch (error) {
    console.error('getRecentUsers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Son üyeler alınırken hata oluştu',
      error: error.message 
    });
  }
};

