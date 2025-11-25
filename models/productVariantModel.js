const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class ProductVariant extends Model {}

ProductVariant.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  size: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  material: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  additional_options: {
    type: DataTypes.JSON,
    allowNull: true
  },
  product_features: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  discount_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  sequelize,
  modelName: 'ProductVariant',
  tableName: 'product_variants',
  timestamps: false
});

module.exports = ProductVariant;

