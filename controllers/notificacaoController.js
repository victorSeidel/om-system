const { Notificacao, Terapeuta, Usuario } = require('../models');
const { Op } = require('sequelize');

exports.create = async (req, res) => 
{
  try 
  {
    const { terapeuta_id, mensagem } = req.body;

    const notificacao = await Notificacao.create({ terapeuta_id, mensagem });

    res.status(201).json({
      success: true,
      data: notificacao
    });

  } 
  catch (error)
  {
    console.error('Erro ao criar notificação:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao criar notificação',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.list = async (req, res) => 
{
  try 
  {
    const { terapeuta_id } = req.params;

    const notificacoes = await Notificacao.findAll({
      where: { terapeuta_id },
      include: [{
        model: Terapeuta,
        as: 'terapeuta',
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: { exclude: ['senha_hash'] }
        }]
      }],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json(notificacoes);

  } 
  catch (error) 
  {
    console.error('Erro ao listar notificações:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao listar notificações',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.delete = async (req, res) => 
{
  try 
  {
    const { id } = req.params;

    const notificacao = await Notificacao.findByPk(id);

    if (!notificacao) 
    {
      return res.status(404).json({
        success: false,
        message: 'Notificação não encontrada.'
      });
    }

    await notificacao.destroy();

    res.status(200).json({
      success: true,
      message: 'Notificação removida com sucesso.'
    });

  } 
  catch (error) 
  {
    console.error('Erro ao remover notificação:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao remover notificaçaõ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};