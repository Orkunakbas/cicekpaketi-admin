const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class VariantOptionType extends Model {}

VariantOptionType.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  language_code: {
    type: DataTypes.STRING(3),
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
  modelName: 'VariantOptionType',
  tableName: 'variant_option_types',
  timestamps: false
});

module.exports = VariantOptionType;

