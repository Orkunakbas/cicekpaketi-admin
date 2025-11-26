const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  
  variant_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'product_variants',
      key: 'id'
    }
  },
  
  // Ürün bilgileri (snapshot - fiyat değişse bile sipariş anındaki bilgiler kalır)
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Sipariş anındaki ürün adı'
  },
  
  variant_info: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Varyant bilgileri: { sku, color, size, etc. }'
  },
  
  product_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Sipariş anındaki ürün resmi'
  },
  
  // Fiyat bilgileri
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Kullanıcının ödediği birim fiyat (indirimli ise indirimli, değilse normal)'
  },
  
  line_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Satır toplamı (quantity * price)'
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = OrderItem;

