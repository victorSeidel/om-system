CREATE DATABASE om_system_db;
USE om_system_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  imagem LONGBLOB,
  nome VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  telefone VARCHAR(20) UNIQUE,
  senha_hash VARCHAR(255),
  endereco TEXT,
  cpf VARCHAR(15),
  tipo ENUM('cliente', 'terapeuta', 'admin') DEFAULT 'cliente',
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS terapeutas (
  usuario_id INT PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  bio TEXT,
  especialidade VARCHAR(255),
  area VARCHAR(255),
  duracao_sessao INT DEFAULT 60,
  preco_sessao INT,
  fantasia VARCHAR(100),
  razao VARCHAR(100),
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS terapeuta_pagamento (
  terapeuta_id INT PRIMARY KEY REFERENCES terapeutas(usuario_id),
  banco VARCHAR(50),
  agencia VARCHAR(10),
  conta VARCHAR(20),
  favorecido VARCHAR(50),
  pix VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS terapeuta_agenda (
  id INT PRIMARY KEY AUTO_INCREMENT,
  terapeuta_id INT REFERENCES terapeutas(usuario_id),
  dia ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'),
  inicio TIME,
  fim TIME
);

CREATE TABLE IF NOT EXISTS atendimentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT REFERENCES usuarios(id),
  terapeuta_id INT REFERENCES terapeutas(usuario_id),
  dia DATETIME,
  iniciado BOOLEAN DEFAULT FALSE,
  finalizado_cliente BOOLEAN DEFAULT FALSE,
  finalizado_terapeuta BOOLEAN DEFAULT FALSE,
  finalizado BOOLEAN DEFAULT FALSE,
  nota INT,
  comentario TEXT,
  resumo TEXT,
  sintomas TEXT,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mensagens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  remetente_id INT REFERENCES usuarios(id),
  destinatario_id INT REFERENCES usuarios(id),
  mensagem TEXT,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notificacoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  terapeuta_id INT REFERENCES terapeutas(usuario_id),
  mensagem TEXT,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  terapeuta_id INT REFERENCES terapeutas(usuario_id),
  imagem LONGBLOB,
  nome VARCHAR(200),
  dia DATETIME,
  tipo VARCHAR(50),
  local TEXT,
  detalhes TEXT,
  link TEXT,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS planos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco INT NOT NULL,
  cobranca ENUM('mensal', 'anual') DEFAULT 'mensal',
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS terapeuta_plano (
  id INT PRIMARY KEY AUTO_INCREMENT,
  terapeuta_id INT NOT NULL,
  plano_id INT NOT NULL,
  inicio DATE NOT NULL,
  fim DATE,
  ativo BOOLEAN DEFAULT TRUE,
  status ENUM('pendente', 'pago', 'falhou') DEFAULT 'pendente',
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (terapeuta_id) REFERENCES terapeutas(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (plano_id) REFERENCES planos(id)
);



















