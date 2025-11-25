const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  language_code: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  category_type: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tags: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Kategori görseli'
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  }
}, {
  tableName: 'categories',
  timestamps: false
});

module.exports = Category;

