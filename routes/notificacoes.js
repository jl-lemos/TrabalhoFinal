const express = require('express');
const db = require('../config/database');
const { verificarToken } = require('./auth-novo');
const router = express.Router();

// GET - Obter notificações do usuário (todas, paginadas opcionalmente)
router.get('/', verificarToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const notificacoes = await new Promise((resolve, reject) => {
            db.all(
                `SELECT n.*, u.nome as origem_nome, u.avatar as origem_avatar
                 FROM notificacoes n
                 LEFT JOIN usuarios u ON n.origem_usuario_id = u.id
                 WHERE n.usuario_id_destino = ?
                 ORDER BY n.criado_em DESC
                 LIMIT ? OFFSET ?`,
                [req.usuario_id, limit, offset],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows || []);
                }
            );
        });

        return res.json({ sucesso: true, notificacoes });
    } catch (erro) {
        console.error('Erro ao obter notificações:', erro);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao obter notificações' });
    }
});

// GET - Contagem de não-lidas
router.get('/unread-count', verificarToken, async (req, res) => {
    try {
        const row = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total FROM notificacoes WHERE usuario_id_destino = ? AND lido = 0', [req.usuario_id], (err, r) => {
                if (err) reject(err);
                resolve(r);
            });
        });

        return res.json({ sucesso: true, unread: row.total });
    } catch (erro) {
        console.error('Erro ao obter contagem de notificações:', erro);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao obter contagem' });
    }
});

// PUT - Marcar notificação como lida
router.put('/:id/ler', verificarToken, async (req, res) => {
    try {
        const notif = await new Promise((resolve, reject) => {
            db.get('SELECT usuario_id_destino FROM notificacoes WHERE id = ?', [req.params.id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!notif) return res.status(404).json({ sucesso: false, mensagem: 'Notificação não encontrada' });
        if (notif.usuario_id_destino !== req.usuario_id) return res.status(403).json({ sucesso: false, mensagem: 'Acesso negado' });

        await new Promise((resolve, reject) => {
            db.run('UPDATE notificacoes SET lido = 1 WHERE id = ?', [req.params.id], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        return res.json({ sucesso: true, mensagem: 'Notificação marcada como lida' });
    } catch (erro) {
        console.error('Erro ao marcar notificação como lida:', erro);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar' });
    }
});

module.exports = router;
