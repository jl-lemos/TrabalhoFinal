# 🌙 Lâminas do Destino Sob a Lua - Backend Setup

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- npm (vem com Node.js)
- Git

## 🚀 Instalação e Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (já existe um `.env.example`):

```bash
# Copiar arquivo exemplo
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=5000
NODE_ENV=development

# Para usar Gmail com Nodemailer:
EMAIL_SERVICE=gmail
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app
EMAIL_FROM=contato@laminasdodestino.com

ALLOWED_ORIGIN=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

### 3. Configurar Gmail para Enviar Emails

1. Acesse sua conta Google: https://myaccount.google.com/
2. Vá para "Segurança" → "Senhas de app"
3. Selecione "Mail" e "Windows/Linux/Chrome"
4. Copie a senha gerada e cole no `.env` como `EMAIL_PASSWORD`

**Nota:** Você precisa ter a autenticação em duas etapas ativada na sua conta Google.

## 🏃 Executar o Servidor

### Modo Desenvolvimento (com auto-reload):
```bash
npm run dev
```

### Modo Produção:
```bash
npm start
```

O servidor iniciará em: `http://localhost:5000`

## 🧪 Testar a API

### 1. Testar Conexão de Email
```
GET http://localhost:5000/api/contact/test
```

Resposta esperada:
```json
{
  "sucesso": true,
  "mensagem": "Servidor de email funcionando! ✅",
  "email": "seu_email@gmail.com",
  "servico": "gmail"
}
```

### 2. Testar Formulário de Contato
```bash
curl -X POST http://localhost:5000/api/contact/enviar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "assunto": "duvida",
    "mensagem": "Olá, tenho uma dúvida sobre a história da série!"
  }'
```

### 3. Testar Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

## 📁 Estrutura do Projeto

```
TrabalhoFinal/
├── index.html              # Página principal
├── contato.html            # Página de contato
├── server.js               # Servidor Express
├── package.json            # Dependências
├── .env                    # Variáveis de ambiente (não compartilhar!)
├── .env.example            # Exemplo de .env
├── css/
│   └── style.css           # Estilos do site
├── js/
│   └── api.js              # Funções de API client-side
├── routes/
│   ├── auth.js             # Rotas de autenticação
│   └── contact.js          # Rotas de contato
├── img/
│   ├── ani1.png
│   ├── ani2.png
│   ├── ani3.png
│   └── ani4.png
└── README.md               # Este arquivo
```

## 🔐 Segurança

- **Nunca** commit o arquivo `.env` com credenciais reais
- Use variáveis de ambiente para dados sensíveis
- Em produção, use um serviço de email confiável (Sendgrid, Mailgun, etc)
- Adicione rate limiting para prevenir spam
- Use HTTPS em produção

## 🐛 Troubleshooting

### "Erro ao conectar ao servidor de email"
- Verifique se você gerou uma "senha de app" no Gmail
- Verifique se tem autenticação em duas etapas ativada
- Certifique-se que EMAIL_USER e EMAIL_PASSWORD estão corretos no `.env`

### CORS Error
- Verifique se o `ALLOWED_ORIGIN` está configurado corretamente
- Se acessar localmente, use `http://localhost:3000` (ou a porta do seu servidor web)

### "Cannot find module 'express'"
- Execute `npm install` novamente
- Delete a pasta `node_modules` e tente novamente

## 📝 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/registrar` - Registrar novo usuário
- `GET /api/auth/validar` - Validar token

### Contato
- `POST /api/contact/enviar` - Enviar mensagem de contato
- `GET /api/contact/test` - Testar conexão de email (apenas desenvolvimento)

## 🌟 Validações

### Formulário de Contato
- **Nome:** Mínimo 3 caracteres
- **Email:** Email válido
- **Assunto:** Deve ser um dos valores predefinidos
- **Mensagem:** Entre 10 e 5000 caracteres

### Login
- **Email:** Email válido
- **Senha:** Mínimo 6 caracteres

## 📧 Emails Enviados

O sistema envia dois emails:
1. **Para o administrador:** Com todos os detalhes da mensagem
2. **Para o usuário:** Confirmação de recebimento da mensagem

## 🔄 Próximas Melhorias

- [ ] Implementar banco de dados (MongoDB/PostgreSQL)
- [ ] Adicionar autenticação JWT
- [ ] Implementar rate limiting
- [ ] Adicionar upload de arquivos
- [ ] Dashboard de admin para gerenciar mensagens
- [ ] Implementar webhook para Slack/Discord

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do Express:
https://expressjs.com/

## 📄 Licença

MIT License - Veja LICENSE para detalhes
