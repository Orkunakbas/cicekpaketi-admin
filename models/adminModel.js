const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  fullname: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  authority: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'admin'
  }
}, {
  tableName: 'admin',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Admin; 