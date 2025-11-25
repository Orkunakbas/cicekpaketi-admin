const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Null ise misafir kullanıcı
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  session_id: {
    type: DataTypes.STRING(255),
    allowNull: true, // Misafir kullanıcılar için session ID
    comment: 'Misafir kullanıcılar için benzersiz session ID'
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
  tableName: 'carts',
  timestamps: false
});

module.exports = Cart;

