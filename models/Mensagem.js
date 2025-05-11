const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mensagem = sequelize.define('Mensagem', 
{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  remetente_id: {
    type: DataTypes.INTEGER
  },
  destinatario_id: {
    type: DataTypes.INTEGER
  },
  mensagem: {
    type: DataTypes.TEXT('long')
  }
}, {
  tableName: 'mensagens',
  timestamps: true
});

Mensagem.associate = (models) => 
{
  Mensagem.belongsTo(models.Usuario, {
    foreignKey: 'remetente_id',
    as: 'remetente',
  });

  Mensagem.belongsTo(models.Usuario, {
    foreignKey: 'destinatario_id',
    as: 'destinatario',
  });
}

module.exports = Mensagem;