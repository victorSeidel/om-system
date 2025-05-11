const { Evento, Terapeuta, Usuario } = require('../models');

exports.create = async (req, res) => 
{
  try 
  {
    if (!req.file) 
    {
      return res.status(400).json({
        success: false,
        message: 'Erro ao carregar imagem'
      });
    }

    const { terapeuta_id, nome, dia, tipo, local, detalhes, link } = req.body;
    const imagem = req.file.buffer;

    const evento = await Evento.create({ terapeuta_id, imagem, nome, dia, tipo, local, detalhes, link });

    res.status(201).json({
      success: true,
      data: evento
    });

  } 
  catch (error)
  {
    console.error('Erro ao criar evento:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao criar evento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.list = async (req, res) => 
{
  try 
  {
    const eventos = await Evento.findAll({
      include: [{
        model: Terapeuta,
        as: 'terapeuta',
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: { exclude: ['senha_hash'] }
        }]
      }],
      order: [['terapeuta_id', 'ASC']]
    });

    res.status(200).json(eventos);

  } 
  catch (error) 
  {
    console.error('Erro ao listar eventos:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao listar eventos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.listByTerapeutaId = async (req, res) => 
{
  try 
  {
    let { terapeuta_id } = req.params;

    if (!id || id == -1)
    {
      const token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      terapeuta_id = decoded.id;
    }

    const evento = await Evento.findAll({
      where: { terapeuta_id }
    });

    if (!evento) 
    {
      return res.status(404).json({
        success: false,
        message: 'Eventos do terapeuta não encontrados.'
      });
    }

    res.status(200).json({
      success: true,
      data: evento
    });

  } 
  catch (error) 
  {
    console.error('Erro ao buscar eventos do terapeuta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar eventos do terapeuta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getById = async (req, res) => 
{
    try 
    {
      let { id } = req.params;
  
      const evento = await Evento.findOne({
        where: { id }
      });
  
      if (!evento) 
      {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado.'
        });
      }
  
      res.status(200).json({
        success: true,
        data: evento
      });
  
    } 
    catch (error) 
    {
      console.error('Erro ao buscar evento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno ao buscar evento',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
};

exports.update = async (req, res) => 
{
  try 
  {

  } 
  catch (error) 
  {
    console.error('Erro ao atualizar evento:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar evento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.delete = async (req, res) => 
{
  try 
  {

  } 
  catch (error) 
  {
    console.error('Erro ao remover evento:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao remover evento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};