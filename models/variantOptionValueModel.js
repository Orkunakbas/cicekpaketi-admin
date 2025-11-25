const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class VariantOptionValue extends Model {}

VariantOptionValue.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  option_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  value: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  language_code: {
    type: DataTypes.STRING(3),
    allowNull: true
  },
  color_code: {
    type: DataTypes.STRING(7),
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
  modelName: 'VariantOptionValue',
  tableName: 'variant_option_values',
  timestamps: false
});

module.exports = VariantOptionValue;

