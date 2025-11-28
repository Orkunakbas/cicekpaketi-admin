const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  banner_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  background_color: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  button_text: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  button_color: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  button_link: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  language_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: 'tr'
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
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
  tableName: 'banners',
  timestamps: false
});

module.exports = Banner;
