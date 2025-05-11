const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TerapeutaAgenda = sequelize.define('TerapeutaAgenda', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  terapeuta_id: {
    type: DataTypes.INTEGER
  },
  dia: {
    type: DataTypes.ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo')
  },
  inicio: {
    type: DataTypes.TIME
  },
  fim: {
    type: DataTypes.TIME
  }
}, {
  tableName: 'terapeuta_agenda',
  timestamps: false
});

TerapeutaAgenda.associate = (models) => {
  TerapeutaAgenda.belongsTo(models.Terapeuta, {
    foreignKey: 'terapeuta_id',
    as: 'terapeuta'
  });
};

module.exports = TerapeutaAgenda;