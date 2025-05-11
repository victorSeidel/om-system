const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', 
{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  imagem: {
    type: DataTypes.BLOB('long')
  },
  nome: {
    type: DataTypes.STRING(50)
  },
  email: {
    type: DataTypes.STRING(100)
  },
  telefone: {
    type: DataTypes.STRING(20)
  },
  senha_hash: {
    type: DataTypes.STRING(255)
  },
  endereco: {
    type: DataTypes.TEXT('long')
  },
  cpf: {
    type: DataTypes.STRING(15)
  },
  tipo: {
    type: DataTypes.ENUM('paciente', 'terapeuta', 'admin')
  }
}, {
  tableName: 'usuarios',
  timestamps: true
});

Usuario.associate = (models) => 
{
  Usuario.hasOne(models.Terapeuta, {
    foreignKey: 'usuario_id',
    as: 'terapeuta'
  });

  Usuario.hasMany(models.Atendimento, {
    foreignKey: 'cliente_id',
    as: 'atendimentos',
  });

  Usuario.hasMany(models.Mensagem, {
    foreignKey: 'remetente_id',
    as: 'mensagensEnviadas'
  });
  
  Usuario.hasMany(models.Mensagem, {
    foreignKey: 'destinatario_id',
    as: 'mensagensRecebidas'
  });
}

module.exports = Usuario;