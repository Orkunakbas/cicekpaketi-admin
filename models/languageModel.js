const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Language = sequelize.define('Language', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  }
}, {
  tableName: 'languages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Language;

