const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cart_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'carts',
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
    },
    onDelete: 'CASCADE'
  },
  variant_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Varyant yoksa null
    references: {
      model: 'product_variants',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Varyantlı ürünler için variant ID'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Sepete eklendiği andaki fiyat (snapshot)'
  },
  discount_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Sepete eklendiği andaki indirimli fiyat (varsa)'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'cart_items',
  timestamps: false
});

module.exports = CartItem;


