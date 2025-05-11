const { Usuario, Atendimento } = require('../models');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { where } = require('sequelize');

exports.create = async (req, res) => 
{
  try 
  {
    const { nome, email, telefone, senha, tipo } = req.body;

    const emailUsuario = await Usuario.findOne({ where: {email} });
    if (emailUsuario)
    {
      res.status(400).json({
        success: false,
        message: 'Já existe um usuário cadastrado com esse e-mail.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    const telUsuario = await Usuario.findOne({ where: {telefone} });
    if (telUsuario)
    {
      res.status(400).json({
        success: false,
        message: 'Já existe um usuário cadastrado com esse telefone.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const usuario = await Usuario.create({ nome, email, telefone, senha_hash, tipo });

    res.status(201).json({
      success: true,
      data: usuario
    });

  } 
  catch (error)
  {
    console.error('Erro ao criar usuário:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao criar usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.list = async (req, res) => 
{
  try 
  {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nome', 'email', 'tipo'],
      order: [['nome', 'ASC']]
    });

    res.status(200).json(usuarios);

  } 
  catch (error) 
  {
    console.error('Erro ao listar usuários:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao listar usuários',
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

    const usuario = await Usuario.findByPk(id);

    if (!usuario) 
    {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    res.status(200).json({
      success: true,
      data: usuario
    });

  } 
  catch (error) 
  {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.login = async (req, res) => 
{
  try 
  {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ 
      where: { email },
      include: [{
        model: Atendimento,
        as: 'atendimentos'
      }]
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: 'Senha incorreta.'
      });
    }

    const { senha_hash, ...usuarioSemSenha } = usuario.toJSON();

    const token = jwt.sign({ id: usuario.id, tipo: usuario.tipo }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000
    });

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso.',
      data: usuarioSemSenha
    });

  } 
  catch (error) 
  {
    console.error('Erro ao fazer login:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao fazer login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};  

exports.update = async (req, res) => 
{
  try 
  {
    const { id } = req.params;
    const { nome, email, telefone, senha, endereco, cpf } = req.body;
    const imagem = req.file.buffer;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) 
    {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    let senha_hash = usuario.senha_hash;
    if (senha) senha_hash = await bcrypt.hash(senha, 10);

    await usuario.update({ imagem, nome, email, telefone, senha_hash, endereco, cpf });

    res.status(200).json({
      success: true,
      data: usuario
    });
  } 
  catch (error) 
  {
    console.error('Erro ao atualizar usuário:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.delete = async (req, res) => 
{
  try 
  {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) 
    {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    await usuario.destroy();

    res.status(200).json({
      success: true,
      message: 'Usuário removido com sucesso.'
    });

  } 
  catch (error) 
  {
    console.error('Erro ao remover usuário:', error);

    res.status(500).json({
      success: false,
      message: 'Erro interno ao remover usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
