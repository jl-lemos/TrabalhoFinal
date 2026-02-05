const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/laminas.db');

// Criar ou abrir banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco:', err);
    } else {
        console.log('✅ Conectado ao banco de dados SQLite');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Tabela de Usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            nome TEXT NOT NULL,
            bio TEXT DEFAULT 'Explorador das Lâminas do Destino',
            avatar TEXT DEFAULT 'https://via.placeholder.com/150?text=Avatar',
            nivel INTEGER DEFAULT 1,
            experiencia INTEGER DEFAULT 0,
            tipo_personagem TEXT DEFAULT 'aventureiro',
            titulo TEXT DEFAULT 'Iniciante',
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabela de Postagens/Narrativas
    db.run(`
        CREATE TABLE IF NOT EXISTS narrativas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            titulo TEXT NOT NULL,
            conteudo TEXT NOT NULL,
            genero TEXT,
            curtidas INTEGER DEFAULT 0,
            comentarios INTEGER DEFAULT 0,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
        )
    `);

    // Tabela de Conquistas
    db.run(`
        CREATE TABLE IF NOT EXISTS conquistas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            tipo TEXT NOT NULL,
            titulo TEXT NOT NULL,
            descricao TEXT,
            icone TEXT,
            desbloqueado_em DATETIME,
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
        )
    `);

    // Tabela de Tokens/Sessões
    db.run(`
        CREATE TABLE IF NOT EXISTS sessoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expira_em DATETIME NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
        )
    `);

    // Tabela de Estatísticas de Usuário
    db.run(`
        CREATE TABLE IF NOT EXISTS estatisticas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER UNIQUE NOT NULL,
            narrativas_criadas INTEGER DEFAULT 0,
            narrativas_curtidas INTEGER DEFAULT 0,
            comentarios_feitos INTEGER DEFAULT 0,
            seguidores INTEGER DEFAULT 0,
            seguindo INTEGER DEFAULT 0,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
        )
    `);

    console.log('📦 Banco de dados inicializado com sucesso!');
}

module.exports = db;
