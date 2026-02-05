# 🌙 Lâminas do Destino - Quick Start

## ✅ Status Atual
- ✅ Dependências instaladas (npm install concluído)
- ⏳ Configuração .env pendente
- ⏳ Testes pendentes

## 🚀 Começando em 3 passos

### 1️⃣ Configurar Credenciais de Email (IMPORTANTE!)

Abra o arquivo `.env` e adicione suas credenciais Gmail:

```bash
# Edite o arquivo .env
PORT=5000
NODE_ENV=development
EMAIL_SERVICE=gmail
EMAIL_USER=seu_email@gmail.com          # ← Seu email Gmail
EMAIL_PASSWORD=sua_senha_de_app         # ← Senha de Aplicativo
EMAIL_FROM=contato@laminasdodestino.com
ALLOWED_ORIGIN=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

**⚠️ Como gerar Senha de Aplicativo Gmail:**

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione "Mail" e "Windows Computer"
3. Copie a senha gerada (16 caracteres)
4. Cole em `EMAIL_PASSWORD` no arquivo `.env`

### 2️⃣ Iniciar o Servidor

**Opção A: Script rápido (Windows)**
```powershell
.\start.bat
```

**Opção B: Comando direto**
```bash
npm run dev
```

Você deve ver:
```
🌙 Servidor Lâminas do Destino iniciado em http://localhost:5000
```

### 3️⃣ Testar a API

Abra no navegador:
```
http://localhost:5000/teste-api.html
```

Clique em **"🧪 Testar Conexão de Email"** para verificar sua configuração.

---

## 📋 Endpoints Disponíveis

### Páginas do Site
- `GET /` → index.html (página inicial)
- `GET /contato` → contato.html (página de contato)
- `GET /teste-api.html` → página de testes

### API de Autenticação
```
POST /api/auth/login
POST /api/auth/registrar
GET /api/auth/validar
```

### API de Contato
```
POST /api/contact/enviar     # Enviar formulário
GET /api/contact/test        # Testar email
```

---

## 🧪 Testes Recomendados

### 1. Teste de Conexão de Email
```
http://localhost:5000/teste-api.html
→ Clique: "🧪 Testar Conexão de Email"
```

Resultado esperado:
```json
{
  "sucesso": true,
  "mensagem": "Conexão com o serviço de email estabelecida com sucesso!",
  "servico": "Gmail",
  "usuario": "seu_email@gmail.com"
}
```

### 2. Teste de Formulário de Contato
```
http://localhost:5000/teste-api.html
→ Clique: "📧 Teste Formulário de Contato"
→ Preencha os campos
→ Clique: "Enviar Teste"
```

Verifique sua caixa de entrada por 2 emails:
1. Email ao administrador (com todos os detalhes)
2. Email de confirmação ao usuário

### 3. Teste de Login
```
http://localhost:5000/teste-api.html
→ Clique: "🔐 Teste Login"
→ Use qualquer email e senha (min 6 caracteres)
→ Clique: "Testar Login"
```

---

## 🎨 Acessar o Site

```
http://localhost:5000
```

### Funcionalidades disponíveis:
- ✅ Página inicial com carousel
- ✅ Navbar com navegação
- ✅ Modal de login
- ✅ Página de contato (clique em "Contato" na navbar)
- ✅ Envio de formulário com validação

---

## 🐛 Troubleshooting

### "Erro ao conectar ao email"
- ❌ Verifica se a senha de aplicativo está correta
- ❌ Verifica se EMAIL_USER está correto no .env
- ❌ Verifica se 2FA está ativado na conta Gmail

### "Porta 5000 já está em uso"
```powershell
# Matar processo na porta 5000
Get-Process | Where-Object {$_.Id -eq (Get-NetTCPConnection -LocalPort 5000).OwningProcess}
Stop-Process -Id <PID> -Force
```

### Ou usar uma porta diferente
```bash
# No terminal
$env:PORT=3001; npm start
```

### "Cors error"
- ✅ Verifica se ALLOWED_ORIGIN no .env está correto
- ✅ Verifica se está acessando de http://localhost:5000

---

## 📁 Estrutura do Projeto

```
├── index.html              # Página inicial
├── contato.html            # Página de contato
├── teste-api.html          # Página de testes
├── start.bat               # Script para iniciar (Windows)
├── server.js               # Servidor Express
├── package.json            # Dependências
├── .env                    # ⚠️ Configurações (NÃO COMMITAR!)
├── .env.example            # Template do .env
├── .gitignore              # Arquivos ignorados no Git
├── css/
│   └── style.css           # Estilos do site
├── js/
│   └── api.js              # Cliente API
├── routes/
│   ├── auth.js             # Endpoints de autenticação
│   └── contact.js          # Endpoints de contato
├── img/                    # Imagens do carousel
└── README.md               # Este arquivo
```

---

## 🌙 Próximas Melhorias (Roadmap)

- [ ] Integração com banco de dados (MongoDB/PostgreSQL)
- [ ] Autenticação com JWT
- [ ] Sistema de feedback do usuário
- [ ] Dashboard administrativo
- [ ] Deploy em produção (Heroku/Railway)
- [ ] Implementar rate limiting
- [ ] Testes automatizados

---

## ❓ Dúvidas?

Consulte:
- `BACKEND_README.md` - Documentação completa do backend
- `README.md` - Documentação geral do projeto

---

**Desenvolvido com ✨ e 🌙 Lâminas do Destino Sob a Lua**
