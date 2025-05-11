const { Mensagem, Usuario, Notificacao } = require('../models');
const { Op } = require('sequelize');

exports.create = async (req, res) => 
{
  try 
  {
    const { remetente_id, destinatario_id, mensagem } = req.body;

    const msg = await Mensagem.create({ remetente_id, destinatario_id, mensagem });

    const terapeuta = await Usuario.findByPk(destinatario_id);
    if (terapeuta)
    {
      const usuario = await Usuario.findByPk(remetente_id);
      const notMsg = 'Nova mensagem recebida de ' + usuario.nome;
      await Notificacao.create({ terapeuta_id: destinatario_id, mensagem: notMsg });
    }

    res.status(201).json({
      success: true,
      data: msg
    });

  } 
  catch (error)
  {
    console.error('Erro ao criar mensagem:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao criar mensagem',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.list = async (req, res) => 
{
  try 
  {
    const { remetente_id, destinatario_id } = req.params;

    const mensagens = await Mensagem.findAll({
      where: {
        [Op.or]: [
          { remetente_id, destinatario_id },
          { remetente_id: destinatario_id, destinatario_id: remetente_id }
        ]
      },
      include: [
        { model: Usuario, as: 'remetente', attributes: ['id', 'nome', 'tipo'] },
        { model: Usuario, as: 'destinatario', attributes: ['id', 'nome', 'tipo'] } 
      ]
    });

    res.status(200).json(mensagens);

  } 
  catch (error) 
  {
    console.error('Erro ao listar mensagens:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao listar mensagens',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};