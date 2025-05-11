const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TerapeutaPagamento = sequelize.define('TerapeutaPagamento', 
{
  terapeuta_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  banco: {
    type: DataTypes.STRING(50)
  },
  agencia: {
    type: DataTypes.STRING(10)
  },
  conta: {
    type: DataTypes.STRING(20)
  },
  favorecido: {
    type: DataTypes.STRING(50)
  },
  pix: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'terapeuta_pagamento',
  timestamps: false
});

TerapeutaPagamento.associate = (models) => 
{
  TerapeutaPagamento.belongsTo(models.Terapeuta, {
    foreignKey: 'terapeuta_id',
    as: 'terapeuta'
  });
}

module.exports = TerapeutaPagamento;