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

// PUT - Curtir narrativa (com rastreamento)
router.put('/narrativas/:narrativaId/curtir', verificarToken, async (req, res) => {
    try {
        const narrativa = await new Promise((resolve, reject) => {
            db.get('SELECT usuario_id, titulo FROM narrativas WHERE id = ?', [req.params.narrativaId], (err, row) => {
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

        // Verificar se já curtiu
        const jaFoiCurtida = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM curtidas WHERE narrativa_id = ? AND usuario_id = ?',
                [req.params.narrativaId, req.usuario_id],
                (err, row) => {
                    if (err) reject(err);
                    resolve(!!row);
                }
            );
        });

        if (jaFoiCurtida) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Você já curtiu essa narrativa'
            });
        }

        // Adicionar curtida
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO curtidas (narrativa_id, usuario_id) VALUES (?, ?)',
                [req.params.narrativaId, req.usuario_id],
                (err) => {
                    if (err) reject(err);
                    else {
                        // Incrementar contador
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
                                // Inserir notificação para o autor (se não for o próprio autor)
                                try {
                                    if (narrativa.usuario_id !== req.usuario_id) {
                                        const mensagem = 'Sua narrativa recebeu uma curtida ❤️';
                                        db.run(
                                            'INSERT INTO notificacoes (usuario_id_destino, origem_usuario_id, tipo, mensagem, recurso_id) VALUES (?, ?, ?, ?, ?)',
                                            [narrativa.usuario_id, req.usuario_id, 'curtida', mensagem, req.params.narrativaId],
                                            (err) => { if (err) console.error('Erro ao criar notificação de curtida:', err); }
                                        );
                                    }
                                } catch (e) {
                                    console.error('Erro ao inserir notificação:', e);
                                }
                                }
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

// DELETE - Remover curtida
router.delete('/narrativas/:narrativaId/curtir', verificarToken, async (req, res) => {
    try {
        const curtida = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM curtidas WHERE narrativa_id = ? AND usuario_id = ?',
                [req.params.narrativaId, req.usuario_id],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!curtida) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Você não curtiu essa narrativa'
            });
        }

        // Remover curtida
        await new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM curtidas WHERE id = ?',
                [curtida.id],
                (err) => {
                    if (err) reject(err);
                    else {
                        // Decrementar contador
                        db.run(
                            'UPDATE narrativas SET curtidas = curtidas - 1 WHERE id = ?',
                            [req.params.narrativaId],
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
            mensagem: 'Curtida removida'
        });

    } catch (erro) {
        console.error('Erro ao remover curtida:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao remover curtida'
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

// GET - Feed Público (todas as narrativas)
router.get('/feed/publico', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const genero = req.query.genero;
        const busca = req.query.busca || '';

        let query = `
            SELECT n.*, u.nome as autor_nome, u.avatar as autor_avatar, u.id as autor_id,
                   COUNT(DISTINCT c.id) as total_comentarios
            FROM narrativas n
            JOIN usuarios u ON n.usuario_id = u.id
            LEFT JOIN comentarios c ON n.id = c.narrativa_id
        `;
        
        let params = [];
        const conditions = [];

        if (busca) {
            conditions.push('(n.titulo LIKE ? OR n.conteudo LIKE ?)');
            params.push(`%${busca}%`, `%${busca}%`);
        }

        if (genero) {
            conditions.push('n.genero = ?');
            params.push(genero);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY n.id ORDER BY n.criado_em DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const narrativas = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                resolve(rows || []);
            });
        });

        // Contar total
        let countQuery = 'SELECT COUNT(*) as total FROM narrativas n';
        const countConditions = [];
        const countParams = [];

        if (busca) {
            countConditions.push('(n.titulo LIKE ? OR n.conteudo LIKE ?)');
            countParams.push(`%${busca}%`, `%${busca}%`);
        }

        if (genero) {
            countConditions.push('n.genero = ?');
            countParams.push(genero);
        }
        const countResult = await new Promise((resolve, reject) => {
            db.get(countQuery, countParams, (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        return res.json({
            sucesso: true,
            narrativas,
            paginacao: {
                pagina: page,
                limite: limit,
                total: countResult.total,
                totalPaginas: Math.ceil(countResult.total / limit)
            }
        });

    } catch (erro) {
        console.error('Erro ao obter feed:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao obter feed'
        });
    }
});

// POST - Adicionar comentário
router.post('/narrativas/:narrativaId/comentarios', verificarToken, async (req, res) => {
    const { conteudo } = req.body;

    if (!conteudo || conteudo.trim().length === 0) {
        return res.status(400).json({ sucesso: false, mensagem: 'Comentário não pode ser vazio' });
    }

    try {
        // Verificar se narrativa existe e obter autor
        const narrativa = await new Promise((resolve, reject) => {
            db.get('SELECT id, usuario_id, titulo FROM narrativas WHERE id = ?', [req.params.narrativaId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!narrativa) {
            return res.status(404).json({ sucesso: false, mensagem: 'Narrativa não encontrada' });
        }

        const comentarioId = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO comentarios (narrativa_id, usuario_id, conteudo) VALUES (?, ?, ?)',
                [req.params.narrativaId, req.usuario_id, conteudo],
                function(err) {
                    if (err) reject(err);
                    else {
                        // Atualizar contador
                        db.run(
                            'UPDATE narrativas SET comentarios = comentarios + 1 WHERE id = ?',
                            [req.params.narrativaId],
                            (err) => {
                                if (err) reject(err);
                                else resolve(this.lastID);
                            }
                        );
                    }
                }
            );
        });

        // Inserir notificação para o autor (se não for o próprio autor)
        try {
            if (narrativa.usuario_id !== req.usuario_id) {
                const snippet = conteudo.length > 80 ? conteudo.substring(0, 77) + '...' : conteudo;
                const mensagem = `Novo comentário: "${snippet}"`;
                db.run(
                    'INSERT INTO notificacoes (usuario_id_destino, origem_usuario_id, tipo, mensagem, recurso_id) VALUES (?, ?, ?, ?, ?)',
                    [narrativa.usuario_id, req.usuario_id, 'comentario', mensagem, req.params.narrativaId],
                    (err) => { if (err) console.error('Erro ao criar notificação de comentário:', err); }
                );
            }
        } catch (e) {
            console.error('Erro ao inserir notificação de comentário:', e);
        }

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Comentário adicionado com sucesso! 💬',
            comentario: {
                id: comentarioId,
                conteudo,
                usuario_id: req.usuario_id,
                criado_em: new Date().toISOString()
            }
        });

    } catch (erro) {
        console.error('Erro ao adicionar comentário:', erro);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao adicionar comentário' });
    }
});

// GET - Obter comentários de uma narrativa
router.get('/narrativas/:narrativaId/comentarios', async (req, res) => {
    try {
        const comentarios = await new Promise((resolve, reject) => {
            db.all(
                `SELECT c.*, u.nome as usuario_nome, u.avatar as usuario_avatar
                 FROM comentarios c
                 JOIN usuarios u ON c.usuario_id = u.id
                 WHERE c.narrativa_id = ?
                 ORDER BY c.criado_em DESC`,
                [req.params.narrativaId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows || []);
                }
            );
        });

        return res.json({
            sucesso: true,
            comentarios
        });

    } catch (erro) {
        console.error('Erro ao obter comentários:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao obter comentários'
        });
    }
});

// DELETE - Remover comentário
router.delete('/comentarios/:comentarioId', verificarToken, async (req, res) => {
    try {
        // Verificar se comentário pertence ao usuário
        const comentario = await new Promise((resolve, reject) => {
            db.get(
                'SELECT usuario_id, narrativa_id FROM comentarios WHERE id = ?',
                [req.params.comentarioId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!comentario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Comentário não encontrado'
            });
        }

        if (comentario.usuario_id !== req.usuario_id) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Você não pode deletar comentário de outro usuário'
            });
        }

        // Deletar comentário
        await new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM comentarios WHERE id = ?',
                [req.params.comentarioId],
                (err) => {
                    if (err) reject(err);
                    else {
                        // Atualizar contador
                        db.run(
                            'UPDATE narrativas SET comentarios = comentarios - 1 WHERE id = ?',
                            [comentario.narrativa_id],
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
            mensagem: 'Comentário removido'
        });

    } catch (erro) {
        console.error('Erro ao remover comentário:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao remover comentário'
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
