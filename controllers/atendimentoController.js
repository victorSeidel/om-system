const { Atendimento, Terapeuta, Usuario, Notificacao } = require('../models');

exports.create = async (req, res) => 
{
  try 
  {
    const { cliente_id, terapeuta_id, dia } = req.body;

    const clienteAtendimento = await Atendimento.findOne({
      where: { cliente_id, dia }
    });

    if (clienteAtendimento)
    {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma sessão marcada nesta data.'
      });
    }

    const terapeutaAtendimento = await Atendimento.findOne({
      where: { terapeuta_id, dia }
    });

    if (terapeutaAtendimento)
    {
      return res.status(400).json({
        success: false,
        message: 'Já existe um atendimento agendado nesta data.'
      });
    }

    const atendimento = await Atendimento.create({ cliente_id, terapeuta_id, dia });
    
    const notMsg = 'Nova consulta agendada';
    await Notificacao.create({ terapeuta_id, mensagem: notMsg });

    res.status(201).json({
      success: true,
      data: atendimento
    });

  } 
  catch (error)
  {
    console.error('Erro ao criar atendimento:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao criar atendimento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.list = async (req, res) => 
{
  try 
  {
    const atendimentos = await Atendimento.findAll({
      include: [{
        model: Terapeuta,
        as: 'terapeuta',
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: { exclude: ['senha_hash'] }
        }]
      },
      {
        model: Usuario,
        as: 'usuario',
        attributes: { exclude: ['senha_hash'] }
      }],
      order: [['terapeuta_id', 'ASC']]
    });

    res.status(200).json(atendimentos);

  } 
  catch (error) 
  {
    console.error('Erro ao listar atendimentos:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao listar atendimentos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.listByTerapeutaId = async (req, res) => 
{
  try 
  {
    let { terapeuta_id } = req.params;

    if (!terapeuta_id || terapeuta_id == -1)
    {
      const token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      terapeuta_id = decoded.id;
    }

    const atendimentos = await Atendimento.findAll({
      where: { terapeuta_id },
      include: [{
        model: Terapeuta,
        as: 'terapeuta',
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: { exclude: ['senha_hash'] }
        }]
      },
      {
        model: Usuario,
        as: 'cliente',
        attributes: { exclude: ['senha_hash'] }
      }],
      order: [['dia', 'ASC']]
    });

    if (!atendimentos) 
    {
      return res.status(404).json({
        success: false,
        message: 'Atendimentos não encontrados.'
      });
    }

    res.status(200).json({
      success: true,
      data: atendimentos
    });

  } 
  catch (error) 
  {
    console.error('Erro ao buscar atendimentos do terapeuta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar atendimentos do terapeuta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.listByClienteId = async (req, res) => 
{
  try 
  {
    let { cliente_id } = req.params;

    const atendimentos = await Atendimento.findAll({
      where: { cliente_id },
      include: [{
        model: Terapeuta,
        as: 'terapeuta',
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: { exclude: ['senha_hash'] }
        }]
      },
      {
        model: Usuario,
        as: 'cliente',
        attributes: { exclude: ['senha_hash'] }
      }],
      order: [['dia', 'ASC']]
    });

    if (!atendimentos) 
    {
      return res.status(404).json({
        success: false,
        message: 'Atendimentos não encontrados.'
      });
    }

    res.status(200).json({
      success: true,
      data: atendimentos
    });

  } 
  catch (error) 
  {
    console.error('Erro ao buscar atendimentos do terapeuta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar atendimentos do terapeuta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getById = async (req, res) => 
{
    try 
    {
      let { id } = req.params;
  
      const atendimento = await Atendimento.findOne({
        where: { id }
      });
  
      if (!atendimento) 
      {
        return res.status(404).json({
          success: false,
          message: 'Atendimento não encontrado.'
        });
      }
  
      res.status(200).json({
        success: true,
        data: atendimento
      });
  
    } 
    catch (error) 
    {
      console.error('Erro ao buscar atendimento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno ao buscar atendimento',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
};

exports.update = async (req, res) => 
{
  try 
  {
    const { id } = req.params;
    let { iniciado, finalizado_cliente, finalizado_terapeuta, resumo, sintomas, nota, comentario } = req.body;

    const atendimento = await Atendimento.findByPk(id);

    if (!atendimento) 
    {
      return res.status(404).json({
        success: false,
        message: 'Atendimento não encontrado.'
      });
    }

    if (!finalizado_cliente)   finalizado_cliente   = atendimento.finalizado_cliente;
    if (!finalizado_terapeuta) finalizado_terapeuta = atendimento.finalizado_terapeuta;

    let finalizado = false;
    if (finalizado_cliente && finalizado_terapeuta) finalizado = true;

    if (nota > 5) nota = 5;
    if (nota < 1) nota = 1;

    await atendimento.update({ iniciado, finalizado_cliente, finalizado_terapeuta, finalizado, resumo, sintomas, nota, comentario });

    res.status(200).json({
      success: true,
      data: atendimento
    });
  } 
  catch (error) 
  {
    console.error('Erro ao atualizar atendimento:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar atendimento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.delete = async (req, res) => 
{
  try 
  {
    const { id } = req.params;

    const atendimento = await Atendimento.findByPk(id);

    if (!atendimento) 
    {
      return res.status(404).json({
        success: false,
        message: 'Atendimento não encontrado.'
      });
    }

    await atendimento.destroy();

    const notMsg = 'Um agendamento foi cancelado';
    await Notificacao.create({ terapeuta_id: atendimento.terapeuta_id, mensagem: notMsg });

    res.status(200).json({
      success: true,
      message: 'Atendimento removido com sucesso.'
    });
  } 
  catch (error) 
  {
    console.error('Erro ao remover atendimento:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao remover atendimento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};