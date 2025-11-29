const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  
  order_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'order_items',
      key: 'id'
    }
  },
  
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  review_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  
  is_verified_purchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  helpful_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Review;

