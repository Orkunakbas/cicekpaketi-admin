const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class Product extends Model {}

Product.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  short_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category_id: {
    type: DataTypes.JSON, // ✅ Artık JSON (array olarak)
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_variant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  language_code: {
    type: DataTypes.STRING(3),
    defaultValue: 'tr'
  },
  meta_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true
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
  modelName: 'Product',
  tableName: 'products',
  timestamps: false
});

module.exports = Product;

