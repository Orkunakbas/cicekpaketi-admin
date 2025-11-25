const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  address_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  address_line: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  postal_code: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tc_number: {
    type: DataTypes.STRING(11),
    allowNull: true
  },
  tax_office: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tax_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  company_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
}, {
  tableName: 'addresses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['user_id', 'is_default']
    }
  ]
});

module.exports = Address;

