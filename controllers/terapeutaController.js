const { Usuario, Terapeuta, TerapeutaPagamento, TerapeutaAgenda, Atendimento, Evento } = require('../models');
const { Op } = require('sequelize');

const jwt = require('jsonwebtoken');

exports.create = async (req, res) => 
{
  try 
  {
    const { usuario_id } = req.body;

    const terapeuta = await Terapeuta.create({ usuario_id });

    res.status(201).json({
      success: true,
      data: terapeuta
    });

  } 
  catch (error)
  {
    console.error('Erro ao criar usuário terapeuta:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao criar usuário terapeuta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.list = async (req, res) => 
{
  try 
  {
    const { nome, especialidade, area } = req.query;

    const whereTerapeuta = {};
    const whereUsuario = {};

    if (especialidade) whereTerapeuta.especialidade = { [Op.like]: `%${especialidade}%` };
    if (area) whereTerapeuta.area = { [Op.like]: `%${area}%` };
    if (nome) whereUsuario.nome = { [Op.like]: `%${nome}%` };

    console.log(especialidade);

    const terapeutas = await Terapeuta.findAll({
      where: whereTerapeuta,
      attributes: ['usuario_id', 'bio', 'especialidade', 'area'],
      include: [{
        model: Usuario,
        as: 'usuario',
        where: whereUsuario,
        attributes: { exclude: ['senha_hash'] }
      },
      {
        model: TerapeutaPagamento,
        as: 'pagamento'
      },
      {
        model: TerapeutaAgenda,
        as: 'agenda'
      },
      {
        model: Atendimento,
        as: 'atendimentos'
      },
      {
        model: Evento,
        as: 'eventos'
      }],
      order: [['usuario_id', 'ASC']]
    });

    res.status(200).json(terapeutas);

  } 
  catch (error) 
  {
    console.error('Erro ao listar usuários terapeutas:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao listar usuários terapeutas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getById = async (req, res) => 
{
  try 
  {
    let { id } = req.params;

    if (!id || id == -1)
    {
      const token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      id = decoded.id;
    }

    const terapeuta = await Terapeuta.findOne({
      where: { usuario_id: id },
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: { exclude: ['senha_hash'] }
      },
      {
        model: TerapeutaPagamento,
        as: 'pagamento'
      },
      {
        model: TerapeutaAgenda,
        as: 'agenda'
      },
      {
        model: Atendimento,
        as: 'atendimentos'
      },
      {
        model: Evento,
        as: 'eventos'
      }]
    });

    if (!terapeuta) 
    {
      return res.status(404).json({
        success: false,
        message: 'Usuário terapeuta não encontrado.'
      });
    }

    res.status(200).json({
      success: true,
      data: terapeuta
    });

  } 
  catch (error) 
  {
    console.error('Erro ao buscar usuário terapeuta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar usuário terapeuta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.update = async (req, res) => 
{
  try 
  {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { bio, especialidade, area, fantasia, razao, duracao_sessao, preco_sessao } = req.body;

    const terapeuta = await Terapeuta.findOne({ where: { usuario_id: userId } });

    if (!terapeuta) 
    {
      return res.status(404).json({
        success: false,
        message: 'Usuário terapeuta não encontrado.'
      });
    }

    await terapeuta.update({ bio, especialidade, area, fantasia, razao, duracao_sessao, preco_sessao });

    res.status(200).json({
      success: true,
      data: terapeuta
    });
    
  } 
  catch (error) 
  {
    console.error('Erro ao atualizar usuário terapeuta:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar usuário terapeuta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.delete = async (req, res) => 
{
  try 
  {
    const { id } = req.params;

    const terapeuta = await Terapeuta.findByPk(id);

    if (!terapeuta) 
    {
      return res.status(404).json({
        success: false,
        message: 'Usuário terapeuta não encontrado.'
      });
    }

    await terapeuta.destroy();

    res.status(200).json({
      success: true,
      message: 'Usuário terapeuta removido com sucesso.'
    });

  } 
  catch (error) 
  {
    console.error('Erro ao remover usuário terapeuta:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao remover usuário terapeuta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.setBank = async (req, res) => 
{
  try 
  {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { banco, agencia, conta, favorecido, pix } = req.body;

    let pagamento = await TerapeutaPagamento.findOne({ where: { terapeuta_id: userId } });

    if (pagamento) 
    {
      await pagamento.update({ banco, agencia, conta, favorecido, pix });

      return res.status(200).json({
        success: true,
        message: 'Dados bancários atualizados com sucesso.',
        data: pagamento
      });
    } 
    else 
    {
      pagamento = await TerapeutaPagamento.create({ terapeuta_id: userId, banco, agencia, conta, favorecido, pix });

      return res.status(201).json({
        success: true,
        message: 'Dados bancários cadastrados com sucesso.',
        data: pagamento
      });
    }
  } 
  catch (error) 
  {
    console.error('Erro ao salvar dados bancários:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao salvar dados bancários.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.setAgenda = async (req, res) => 
{
  try 
  {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { horarios } = req.body;

    if (!Array.isArray(horarios)) { return res.status(400).json({ success: false, message: 'Horários inválidos.' }); }

    await TerapeutaAgenda.destroy({ where: { terapeuta_id: userId } });
    
    const registros = horarios.map(h => ({
      terapeuta_id: userId,
      dia: h.dia,
      inicio: h.inicio.length === 5 ? h.inicio + ':00' : h.inicio,
      fim: h.fim.length === 5 ? h.fim + ':00' : h.fim
    }));

    await TerapeutaAgenda.bulkCreate(registros);

    return res.status(201).json({
      success: true,
      message: 'Agenda salva com sucesso.',
      data: registros
    });

  } 
  catch (error) 
  {
    console.error('Erro ao salvar agenda:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao salvar agenda.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};