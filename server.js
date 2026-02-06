const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar banco de dados
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || '*',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname)));

// Servir uploads estáticos (avatares)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importar rotas
const { router: authRoutesNovo } = require('./routes/auth-novo');
const usuariosRoutes = require('./routes/usuarios');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const notificacoesRoutes = require('./routes/notificacoes');

// Usar rotas
app.use('/api/auth', authRoutesNovo); // Nova autenticação com JWT + avatar
app.use('/api/usuarios', usuariosRoutes); // Rotas de usuários
app.use('/api/contact', contactRoutes);
app.use('/api/notificacoes', notificacoesRoutes);

// Rota raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para a página de contato
app.get('/contato', (req, res) => {
    res.sendFile(path.join(__dirname, 'contato.html'));
});

// Rota para a página de perfil
app.get('/perfil', (req, res) => {
    res.sendFile(path.join(__dirname, 'perfil.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor',
        erro: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Rota 404
app.use((req, res) => {
    res.status(404).json({
        sucesso: false,
        mensagem: 'Rota não encontrada'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🌙 Servidor Lâminas do Destino iniciado em http://localhost:${PORT}`);
    console.log(`📧 Email de teste: http://localhost:${PORT}/api/contact/test`);
});
