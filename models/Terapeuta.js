const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Terapeuta = sequelize.define('Terapeuta', 
{
  usuario_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  bio: {
    type: DataTypes.TEXT('long')
  },
  especialidade: {
    type: DataTypes.STRING(255)
  },
  area: {
    type: DataTypes.STRING(255)
  },
  duracao_sessao: {
    type: DataTypes.INTEGER
  },
  preco_sessao: {
    type: DataTypes.INTEGER
  },
  fantasia: {
    type: DataTypes.STRING(100)
  },
  razao: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'terapeutas',
  timestamps: true
});

Terapeuta.associate = (models) => 
{
  Terapeuta.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });

  Terapeuta.hasOne(models.TerapeutaPagamento, {
    foreignKey: 'terapeuta_id',
    as: 'pagamento'
  });

  Terapeuta.hasMany(models.TerapeutaAgenda, {
    foreignKey: 'terapeuta_id',
    as: 'agenda'
  });

  Terapeuta.hasMany(models.Atendimento, {
    foreignKey: 'terapeuta_id',
    as: 'atendimentos',
  });

  Terapeuta.hasMany(models.Evento, {
    foreignKey: 'terapeuta_id',
    as: 'eventos',
  });

  Terapeuta.hasMany(models.Notificacao, {
    foreignKey: 'terapeuta_id',
    as: 'notificacoes',
  });
}

module.exports = Terapeuta;