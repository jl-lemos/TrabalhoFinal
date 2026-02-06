const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Validação de login
const validateLogin = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
];

// POST - Login
router.post('/login', validateLogin, (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Validação falhou',
            erros: errors.array()
        });
    }

    const { email, password } = req.body;

    // Simular autenticação (em produção, usar banco de dados)
    if (email && password) {
        return res.json({
            sucesso: true,
            mensagem: `Bem-vindo, ${email.split('@')[0]}! 🌙`,
            usuario: {
                email: email,
                nome: email.split('@')[0],
                autenticado: true
            }
        });
    }

    res.status(401).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas'
    });
});

// POST - Registrar
router.post('/registrar', [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres'),
    body('nome').notEmpty().withMessage('Nome é obrigatório')
], (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Validação falhou',
            erros: errors.array()
        });
    }

    const { email, password, nome } = req.body;

    // Simular registro (em produção, salvar no banco de dados)
    return res.status(201).json({
        sucesso: true,
        mensagem: `Bem-vindo à jornada, ${nome}! ⚔️`,
        usuario: {
            email: email,
            nome: nome,
            autenticado: true
        }
    });
});

// GET - Validar token (exemplo)
router.get('/validar', (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Token não fornecido'
        });
    }

    res.json({
        sucesso: true,
        mensagem: 'Token válido',
        usuario: {
            autenticado: true
        }
    });
});

module.exports = router;
