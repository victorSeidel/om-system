const dotenv = require('dotenv');
dotenv.config();

const express      = require('express');
const path         = require('path');
const bodyParser   = require('body-parser');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const sequelize    = require('./config/database.js');

const jwt = require('jsonwebtoken');
const autenticar = require('./middlewares/authMiddleware');

const nodemailer = require('nodemailer');

const app = express();

app.use(cookieParser());

app.use(cors
({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.static('public'));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => 
{
  console.log(`Servidor rodando na porta ${PORT}`);
});

(async () => 
{
  try { await sequelize.authenticate(); console.log('Conexão com MySQL estabelecida com sucesso.'); } 
  catch (error) { console.error('Falha ao conectar ao MySQL:', error); }
})();

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public/html', 'index.html')); });
app.get('/index', (req, res) => { res.sendFile(path.join(__dirname, 'public/html', 'index.html')); });
app.get('/inicio', (req, res) => { res.sendFile(path.join(__dirname, 'public/html', 'home.html')); });
app.get('/login', (req, res) => { res.sendFile(path.join(__dirname, 'public/html', 'login.html')); });
app.get('/tipoCadastro', (req, res) => { res.sendFile(path.join(__dirname, 'public/html', 'tipoCadastro.html')); });
app.get('/cadastro', (req, res) => { res.sendFile(path.join(__dirname, 'public/html', 'cadastro.html')); });
app.get('/terapeuta-perfil', autenticar, (req, res) => { res.sendFile(path.join(__dirname, 'public/html', 'terapeutaPerfil.html')); });
app.get('/agendamentos', (req, res) => { res.sendFile(path.join(__dirname, 'public/html', 'agendamentos.html')); });
app.get('/eventos', (req, res) => { res.sendFile(path.join(__dirname, 'public/html', 'eventos.html')); });

const usuarioRoutes = require('./routes/usuarioRoutes.js');
app.use('/api/usuarios', usuarioRoutes);

const terapeutaRoutes = require('./routes/terapeutaRoutes.js');
app.use('/api/terapeutas', terapeutaRoutes);

const eventoRoutes = require('./routes/eventoRoutes.js');
app.use('/api/eventos', eventoRoutes);

const atendimentoRoutes = require('./routes/atendimentoRoutes.js');
app.use('/api/atendimentos', atendimentoRoutes);

const mensagemRoutes = require('./routes/mensagemRoutes.js');
app.use('/api/mensagens', mensagemRoutes);

const notificacaoRoutes = require('./routes/notificacaoRoutes.js');
app.use('/api/notificacoes', notificacaoRoutes);

app.get('/api/status', (req, res) => 
{
  const token = req.cookies.token;
  
  if (!token) { return res.json({ logado: false }); }

  try 
  {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ 
      logado: true,
      usuario: 
      {
        id: decoded.id,
        tipo: decoded.tipo
      }
    });
  } 
  catch (err) 
  {
    res.json({ logado: false });
  }
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_SENHA
    }
});

const { salvarCodigo, verificarCodigo } = require('./email-verificador');

app.post('/enviar-codigo', async (req, res) => 
{
    const { email } = req.body;
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    salvarCodigo(email, codigo);

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Código de Verificação - OM System',
        text: `Seu código de verificação é: ${codigo}`
    });

    res.json({ message: 'Código enviado com sucesso!' });
});

app.post('/verificar-codigo', async (req, res) => 
{
    const { email, codigo } = req.body;

    if (verificarCodigo(email, codigo)) res.json({ message: "Código válido!" });
    else res.status(400).json({ message: "Código incorreto ou expirado." });
});

app.use((req, res) => { res.status(404).json({ error: 'Endpoint não encontrado.' }); });