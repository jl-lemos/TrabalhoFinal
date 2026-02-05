const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configurar transporte de email dinamicamente (Ethereal para dev, Gmail para produção)
let transporter;

async function createTransporter() {
    const service = (process.env.EMAIL_SERVICE || '').toLowerCase();

    if (service === 'ethereal' || process.env.NODE_ENV === 'development') {
        try {
            // Se Ethereal, criar conta de teste ou usar credenciais se fornecidas
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || process.env.EMAIL_SERVICE === 'ethereal') {
                const testAccount = await nodemailer.createTestAccount();
                transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });
                // Armazenar em env para debug local (não persistir em produção)
                process.env.EMAIL_USER = testAccount.user;
                process.env.EMAIL_PASSWORD = testAccount.pass;
                process.env.EMAIL_SERVICE = 'ethereal';
            } else {
                transporter = nodemailer.createTransport({
                    service: process.env.EMAIL_SERVICE,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });
            }
        } catch (err) {
            console.error('Erro criando transporter Ethereal:', err);
            throw err;
        }
    } else {
        // Produção: usar as configurações apontadas no .env (Gmail por exemplo)
        transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Verificar transporter
    try {
        await transporter.verify();
    } catch (err) {
        console.error('Erro ao verificar transporter:', err);
        throw err;
    }
}

// Validação de formulário de contato
const validateContact = [
    body('nome')
        .trim()
        .notEmpty().withMessage('Nome é obrigatório')
        .isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
    body('email')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    body('assunto')
        .notEmpty().withMessage('Assunto é obrigatório')
        .isIn(['duvida', 'teoria', 'sugestao', 'parceria', 'outro']).withMessage('Assunto inválido'),
    body('mensagem')
        .trim()
        .notEmpty().withMessage('Mensagem é obrigatória')
        .isLength({ min: 10 }).withMessage('Mensagem deve ter no mínimo 10 caracteres')
        .isLength({ max: 5000 }).withMessage('Mensagem não pode exceder 5000 caracteres')
];

// Mapa de assuntos
const assuntoMap = {
    'duvida': '📚 Dúvida sobre a História',
    'teoria': '🔮 Compartilhar Teoria/Especulação',
    'sugestao': '💡 Sugestão de Conteúdo',
    'parceria': '🤝 Oportunidade de Parceria',
    'outro': '✨ Outro Assunto'
};

// POST - Enviar mensagem de contato
router.post('/enviar', validateContact, async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Validação falhou',
            erros: errors.array()
        });
    }

    const { nome, email, assunto, mensagem } = req.body;

    try {
        // Email para o administrador
        const mailOptionsAdmin = {
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER,
            subject: `[Lâminas do Destino] ${assuntoMap[assunto]} - ${nome}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; border-left: 5px solid #d4af37;">
                        <h2 style="color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
                            Nova Mensagem de Contato
                        </h2>
                        
                        <p><strong>De:</strong> ${nome}</p>
                        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p><strong>Assunto:</strong> ${assuntoMap[assunto]}</p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        
                        <h3 style="color: #333;">Mensagem:</h3>
                        <p style="white-space: pre-wrap; line-height: 1.6;">${mensagem}</p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        
                        <p style="color: #999; font-size: 12px;">
                            Enviado em: ${new Date().toLocaleString('pt-BR')}<br>
                            De: Lâminas do Destino - Portal de Contato
                        </p>
                    </div>
                </div>
            `
        };

        // Email de confirmação para o usuário
        const mailOptionsUser = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Recebemos sua mensagem! 🌙 - Lâminas do Destino',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; border-left: 5px solid #d4af37;">
                        <h2 style="color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
                            Obrigado por Entrar em Contato!
                        </h2>
                        
                        <p>Olá <strong>${nome}</strong>,</p>
                        
                        <p>Recebemos sua mensagem sobre <strong>${assuntoMap[assunto]}</strong> e entraremos em contato assim que possível.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Dados da sua mensagem:</strong></p>
                            <p>
                                <strong>Email:</strong> ${email}<br>
                                <strong>Assunto:</strong> ${assuntoMap[assunto]}<br>
                                <strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}
                            </p>
                        </div>
                        
                        <p>Enquanto isso, continue acompanhando a jornada nas Lâminas do Destino! ⚔️</p>
                        
                        <p style="color: #999; font-size: 12px;">
                            Esta é uma mensagem automática. Por favor, não responda este email.
                        </p>
                    </div>
                </div>
            `
        };

        // Criar transporter se ainda não criado
        if (!transporter) {
            await createTransporter();
        }

        // Enviar ambos os emails
        const sendResults = await Promise.all([
            transporter.sendMail(mailOptionsAdmin),
            transporter.sendMail(mailOptionsUser)
        ]);

        // Se Ethereal, gerar links de preview
        let previewUrls = [];
        if (process.env.EMAIL_SERVICE === 'ethereal' && sendResults[0]?.messageId) {
            const url = nodemailer.getTestMessageUrl(sendResults[0]);
            if (url) previewUrls.push(url);
        }

        return res.json({
            sucesso: true,
            mensagem: 'Mensagem enviada com sucesso! Obrigado por se conectar conosco. 🌙',
            dados: {
                nome,
                email,
                assunto: assuntoMap[assunto],
                timestamp: new Date().toISOString()
            },
            preview: previewUrls.length ? previewUrls[0] : undefined
        });

    } catch (erro) {
        console.error('Erro ao enviar email:', erro);
        
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao enviar mensagem. Tente novamente mais tarde.',
            erro: process.env.NODE_ENV === 'development' ? erro.message : undefined
        });
    }
});

// GET - Teste de email (apenas para desenvolvimento)
router.get('/test', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
            sucesso: false,
            mensagem: 'Rota de teste desabilitada em produção'
        });
    }

    try {
        // Verificar conexão com email
        const verified = await transporter.verify();
        
        if (verified) {
            return res.json({
                sucesso: true,
                mensagem: 'Servidor de email funcionando! ✅',
                email: process.env.EMAIL_USER,
                servico: process.env.EMAIL_SERVICE
            });
        } else {
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Servidor de email não verificado',
                dica: 'Verifique suas credenciais no arquivo .env'
            });
        }
    } catch (erro) {
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao conectar ao servidor de email',
            erro: erro.message,
            dica: 'Se usar Gmail, gere uma "senha de app" em https://myaccount.google.com/apppasswords'
        });
    }
});

module.exports = router;
