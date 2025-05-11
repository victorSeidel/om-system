const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evento = sequelize.define('Evento', 
{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  terapeuta_id: {
    type: DataTypes.INTEGER,
  },
  imagem: {
    type: DataTypes.BLOB('long')
  },
  nome:
  {
    type: DataTypes.STRING(200)
  },
  dia:
  {
    type: DataTypes.DATE
  },
  tipo:
  {
    type: DataTypes.STRING(50)
  },
  local: {
    type: DataTypes.TEXT('long')
  },
  detalhes: {
    type: DataTypes.TEXT('long')
  },
  link: {
    type: DataTypes.TEXT('long')
  }
}, {
  tableName: 'eventos',
  timestamps: true
});

Evento.associate = (models) => 
{
  Evento.belongsTo(models.Terapeuta, {
    foreignKey: 'terapeuta_id',
    as: 'terapeuta',
  });
}

module.exports = Evento;