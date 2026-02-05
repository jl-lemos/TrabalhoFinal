const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const db = require('../config/database');
const { verificarToken } = require('./auth-novo');

const router = express.Router();

// Certificar que a pasta de uploads existe
const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
fs.mkdirSync(uploadDir, { recursive: true });

// Configurar multer (em memória)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png/;
        const mimetype = allowed.test(file.mimetype);
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && ext) return cb(null, true);
        cb(new Error('Formato inválido. Use JPEG ou PNG.'));
    }
});

// POST - Upload avatar
router.post('/avatar', verificarToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ sucesso: false, mensagem: 'Arquivo não fornecido' });

        // Processar imagem com sharp (resize 300x300)
        const filename = `avatar_${req.usuario_id}_${Date.now()}.png`;
        const filepath = path.join(uploadDir, filename);

        await sharp(req.file.buffer)
            .resize(300, 300)
            .png({ quality: 90 })
            .toFile(filepath);

        // Salvar URL relativa no banco
        const avatarUrl = `/uploads/avatars/${filename}`;

        await new Promise((resolve, reject) => {
            db.run('UPDATE usuarios SET avatar = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?', [avatarUrl, req.usuario_id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        return res.json({ sucesso: true, mensagem: 'Avatar atualizado', avatar: avatarUrl });

    } catch (err) {
        console.error('Erro ao fazer upload do avatar:', err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar imagem' });
    }
});

module.exports = router;
