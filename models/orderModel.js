const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Kullanıcı bilgisi (null = guest)
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // Guest için session tracking
  session_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  // Sipariş numarası (unique)
  order_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  
  // İletişim bilgileri (guest için zorunlu)
  customer_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  customer_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  customer_phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  // Teslimat adresi (JSON)
  shipping_address: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON: { full_name, phone, address_line1, address_line2, city, district, postal_code }'
  },
  
  // Fatura adresi (JSON - teslimat ile aynı olabilir)
  billing_address: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON: { full_name, phone, address_line1, address_line2, city, district, postal_code, tax_office, tax_number }'
  },
  
  // Sipariş tutarları
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  shipping_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  
  // Sipariş durumu
  order_status: {
    type: DataTypes.ENUM(
      'pending',       // Beklemede (ödeme bekleniyor)
      'confirmed',     // Onaylandı (ödeme alındı)
      'preparing',     // Hazırlanıyor
      'shipped',       // Kargoya verildi
      'delivered',     // Teslim edildi
      'cancelled',     // İptal edildi
      'refunded'       // İade edildi
    ),
    defaultValue: 'pending',
    allowNull: false
  },
  
  // Ödeme bilgileri
  payment_method: {
    type: DataTypes.ENUM('credit_card', 'bank_transfer', 'cash_on_delivery'),
    allowNull: true
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
    allowNull: false
  },
  payment_info: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Ödeme gateway bilgileri (transaction_id, etc.)'
  },
  
  // Notlar
  customer_note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  admin_note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Kargo bilgisi
  tracking_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  shipping_company: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  // Tarihler
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  shipped_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Order;

