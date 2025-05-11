const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notificacao = sequelize.define('Notificacao', 
{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  terapeuta_id: {
    type: DataTypes.INTEGER
  },
  mensagem: {
    type: DataTypes.TEXT('long')
  }
}, {
  tableName: 'notificacoes',
  timestamps: true
});

Notificacao.associate = (models) => 
{
  Notificacao.belongsTo(models.Terapeuta, {
    foreignKey: 'terapeuta_id',
    as: 'terapeuta',
  });
}

module.exports = Notificacao;