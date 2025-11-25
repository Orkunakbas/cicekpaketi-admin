const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class Image extends Model {}

Image.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  imageable_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  imageable_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  image_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  alt_text: {
    type: DataTypes.STRING(255),
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
  modelName: 'Image',
  tableName: 'images',
  timestamps: false
});

module.exports = Image;


