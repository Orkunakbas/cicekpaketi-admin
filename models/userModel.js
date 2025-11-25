const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  surname: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_token_expires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;

