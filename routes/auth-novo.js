const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_laminas_do_destino_2026';

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Token não fornecido'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario_id = decoded.usuario_id;
        req.usuario_email = decoded.email;
        next();
    } catch (erro) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Token inválido ou expirado'
        });
    }
};

// POST - Registrar novo usuário
router.post('/registrar', [
    body('email').isEmail().normalizeEmail(),
    body('senha').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
    body('nome').trim().notEmpty().isLength({ min: 3 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ sucesso: false, erros: errors.array() });
    }

    const { email, senha, nome } = req.body;

    try {
        // Verificar se usuário existe
        const usuarioExistente = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM usuarios WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (usuarioExistente) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Email já cadastrado'
            });
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Criar usuário
        const resultado = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO usuarios (email, senha, nome) VALUES (?, ?, ?)',
                [email, senhaHash, nome],
                function(err) {
                    if (err) reject(err);
                    else {
                        // Criar registro de estatísticas
                        db.run(
                            'INSERT INTO estatisticas (usuario_id) VALUES (?)',
                            [this.lastID],
                            (err) => {
                                if (err) reject(err);
                                else resolve(this.lastID);
                            }
                        );
                    }
                }
            );
        });

        // Gerar token JWT
        const token = jwt.sign(
            { usuario_id: resultado, email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Usuário cadastrado com sucesso! 🎉',
            usuario: {
                id: resultado,
                email,
                nome,
                token
            }
        });

    } catch (erro) {
        console.error('Erro ao registrar:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao registrar usuário'
        });
    }
});

// POST - Login
router.post('/login', [
    body('email').isEmail(),
    body('senha').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ sucesso: false, erros: errors.array() });
    }

    const { email, senha } = req.body;

    try {
        const usuario = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!usuario) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Email ou senha incorretos'
            });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Email ou senha incorretos'
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { usuario_id: usuario.id, email: usuario.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            sucesso: true,
            mensagem: 'Bem-vindo! 🌙',
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nome: usuario.nome,
                avatar: usuario.avatar,
                nivel: usuario.nivel,
                titulo: usuario.titulo,
                token
            }
        });

    } catch (erro) {
        console.error('Erro ao fazer login:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao fazer login'
        });
    }
});

// GET - Obter perfil do usuário logado
router.get('/perfil', verificarToken, async (req, res) => {
    try {
        const usuario = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id, email, nome, bio, avatar, nivel, experiencia, tipo_personagem, titulo FROM usuarios WHERE id = ?',
                [req.usuario_id],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        const stats = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM estatisticas WHERE usuario_id = ?', [req.usuario_id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        const conquistas = await new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM conquistas WHERE usuario_id = ? AND desbloqueado_em IS NOT NULL',
                [req.usuario_id],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows || []);
                }
            );
        });

        return res.json({
            sucesso: true,
            usuario: {
                ...usuario,
                estatisticas: stats,
                conquistas
            }
        });

    } catch (erro) {
        console.error('Erro ao obter perfil:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao obter perfil'
        });
    }
});

// PUT - Atualizar perfil
router.put('/perfil', verificarToken, [
    body('nome').optional().trim().isLength({ min: 3 }),
    body('bio').optional().trim().isLength({ max: 500 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ sucesso: false, erros: errors.array() });
    }

    const { nome, bio } = req.body;

    try {
        const updates = [];
        const values = [];

        if (nome) {
            updates.push('nome = ?');
            values.push(nome);
        }
        if (bio) {
            updates.push('bio = ?');
            values.push(bio);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nenhum campo para atualizar'
            });
        }

        updates.push('atualizado_em = CURRENT_TIMESTAMP');
        values.push(req.usuario_id);

        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
                values,
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        return res.json({
            sucesso: true,
            mensagem: 'Perfil atualizado com sucesso! ✨'
        });

    } catch (erro) {
        console.error('Erro ao atualizar perfil:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar perfil'
        });
    }
});

// GET - Obter perfil público de outro usuário
router.get('/perfil/:usuarioId', async (req, res) => {
    try {
        const usuario = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id, nome, bio, avatar, nivel, titulo, criado_em FROM usuarios WHERE id = ?',
                [req.params.usuarioId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        const stats = await new Promise((resolve, reject) => {
            db.get('SELECT narrativas_criadas, narrativas_curtidas, seguidores FROM estatisticas WHERE usuario_id = ?', [req.params.usuarioId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        return res.json({
            sucesso: true,
            usuario: { ...usuario, estatisticas: stats }
        });

    } catch (erro) {
        console.error('Erro ao obter perfil público:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao obter perfil'
        });
    }
});

module.exports = { router, verificarToken };
