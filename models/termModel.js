const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Term = sequelize.define('Term', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  language_code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'tr'
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'terms',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Term;

