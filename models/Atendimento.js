const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Atendimento = sequelize.define('Atendimento', 
{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER
  },
  terapeuta_id: {
    type: DataTypes.INTEGER
  },
  dia:
  {
    type: DataTypes.DATE
  },
  iniciado:
  {
    type: DataTypes.BOOLEAN
  },
  finalizado_cliente:
  {
    type: DataTypes.BOOLEAN
  },
  finalizado_terapeuta:
  {
    type: DataTypes.BOOLEAN
  },
  finalizado:
  {
    type: DataTypes.BOOLEAN
  },
  nota: {
    type: DataTypes.INTEGER
  },
  comentario: {
    type: DataTypes.TEXT('long')
  },
  resumo: {
    type: DataTypes.TEXT('long')
  },
  sintomas: {
    type: DataTypes.TEXT('long')
  }
}, {
  tableName: 'atendimentos',
  timestamps: true
});

Atendimento.associate = (models) => 
{
  Atendimento.belongsTo(models.Usuario, {
    foreignKey: 'cliente_id',
    as: 'cliente',
  });

  Atendimento.belongsTo(models.Terapeuta, {
    foreignKey: 'terapeuta_id',
    as: 'terapeuta',
  });
}

module.exports = Atendimento;