const express = require('express');
const db = require('../config/database');
const { verificarToken } = require('./auth-novo');
const router = express.Router();

// GET - Obter todas as narrativas do usuário
router.get('/:usuarioId/narrativas', async (req, res) => {
    try {
        const narrativas = await new Promise((resolve, reject) => {
            db.all(
                `SELECT id, titulo, conteudo, genero, curtidas, comentarios, criado_em 
                 FROM narrativas WHERE usuario_id = ? ORDER BY criado_em DESC`,
                [req.params.usuarioId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows || []);
                }
            );
        });

        return res.json({
            sucesso: true,
            narrativas
        });

    } catch (erro) {
        console.error('Erro ao obter narrativas:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao obter narrativas'
        });
    }
});

// POST - Criar nova narrativa
router.post('/narrativas', verificarToken, async (req, res) => {
    const { titulo, conteudo, genero } = req.body;

    if (!titulo || !conteudo) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Título e conteúdo são obrigatórios'
        });
    }

    try {
        const resultado = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO narrativas (usuario_id, titulo, conteudo, genero) VALUES (?, ?, ?, ?)',
                [req.usuario_id, titulo, conteudo, genero || 'outro'],
                function(err) {
                    if (err) reject(err);
                    else {
                        // Atualizar estatísticas
                        db.run(
                            'UPDATE estatisticas SET narrativas_criadas = narrativas_criadas + 1 WHERE usuario_id = ?',
                            [req.usuario_id],
                            (err) => {
                                if (err) reject(err);
                                else {
                                    // Adicionar experiência
                                    db.run(
                                        'UPDATE usuarios SET experiencia = experiencia + 50 WHERE id = ?',
                                        [req.usuario_id],
                                        (err) => {
                                            if (err) reject(err);
                                            else resolve(this.lastID);
                                        }
                                    );
                                }
                            }
                        );
                    }
                }
            );
        });

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Narrativa criada com sucesso! 📖',
            narrativa: {
                id: resultado,
                titulo,
                conteudo,
                genero,
                curtidas: 0
            }
        });

    } catch (erro) {
        console.error('Erro ao criar narrativa:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao criar narrativa'
        });
    }
});

// PUT - Curtir narrativa
router.put('/narrativas/:narrativaId/curtir', verificarToken, async (req, res) => {
    try {
        const narrativa = await new Promise((resolve, reject) => {
            db.get('SELECT usuario_id FROM narrativas WHERE id = ?', [req.params.narrativaId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!narrativa) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Narrativa não encontrada'
            });
        }

        // Incrementar curtidas
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE narrativas SET curtidas = curtidas + 1 WHERE id = ?',
                [req.params.narrativaId],
                (err) => {
                    if (err) reject(err);
                    else {
                        // Adicionar XP ao autor
                        db.run(
                            'UPDATE usuarios SET experiencia = experiencia + 10 WHERE id = ?',
                            [narrativa.usuario_id],
                            (err) => {
                                if (err) reject(err);
                                else resolve();
                            }
                        );
                    }
                }
            );
        });

        return res.json({
            sucesso: true,
            mensagem: 'Narrativa curtida! ❤️'
        });

    } catch (erro) {
        console.error('Erro ao curtir narrativa:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao curtir narrativa'
        });
    }
});

// GET - Obter todas as conquistas do usuário
router.get('/:usuarioId/conquistas', async (req, res) => {
    try {
        const conquistas = await new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM conquistas WHERE usuario_id = ? ORDER BY desbloqueado_em DESC',
                [req.params.usuarioId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows || []);
                }
            );
        });

        return res.json({
            sucesso: true,
            conquistas
        });

    } catch (erro) {
        console.error('Erro ao obter conquistas:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao obter conquistas'
        });
    }
});

// GET - Sistema de nível baseado em XP
router.get('/:usuarioId/nivel', async (req, res) => {
    try {
        const usuario = await new Promise((resolve, reject) => {
            db.get('SELECT nivel, experiencia FROM usuarios WHERE id = ?', [req.params.usuarioId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        const nivelAtual = Math.floor(usuario.experiencia / 100) + 1;
        const xpProxNivel = ((nivelAtual) * 100) - usuario.experiencia;

        return res.json({
            sucesso: true,
            nivel: nivelAtual,
            experiencia: usuario.experiencia,
            xpProxNivel,
            progresso: ((usuario.experiencia % 100) / 100) * 100
        });

    } catch (erro) {
        console.error('Erro ao obter nível:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao obter nível'
        });
    }
});

module.exports = router;
