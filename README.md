# Lâminas do Destino  Trabalho Final

Este repositório contém a aplicação "Lâminas do Destino": um servidor Node.js + Express com SQLite que implementa usuários, narrativas (postagens), curtidas, comentários e notificações.

Funcionalidades principais
- Registro e login com JWT
- Upload e redimensionamento de avatar (multer + sharp)
- Feed público com paginação, filtros e busca
- Curtidas (por usuário) e comentários por narrativa
- Notificações armazenadas (polling) quando alguém curte/comenta sua narrativa

Como rodar (Windows / PowerShell)
1. Instale dependências:

```powershell
cd "c:\Users\julimar.areia\Documents\TrabalhoFinal\TrabalhoFinal"
npm install
```

2. Inicie o servidor:

```powershell
node server.js
```

O servidor por padrão roda em `http://localhost:5000`.

Páginas front-end
- `index.html`  página principal
- `galeria.html`  feed público (visualizar, curtir, comentar)
- `login.html` / `register.html`  páginas de autenticação

APIs principais
- `POST /api/auth/registrar`  registra usuário (body: `nome`, `email`, `senha`)
- `POST /api/auth/login`  login (body: `email`, `senha`)  retorna `token`
- `GET /api/usuarios/feed/publico`  lista narrativas públicas (query: `limit`, `offset`, `q`, `genero`)
- `POST /api/usuarios/narrativas`  cria narrativa (autenticado)
- `PUT /api/usuarios/narrativas/:id/curtir`  curtir narrativa (autenticado)
- `DELETE /api/usuarios/narrativas/:id/curtir`  remover curtida (autenticado)
- `POST /api/usuarios/narrativas/:id/comentarios`  adicionar comentário (autenticado)
- `GET /api/notificacoes`  listar notificações do usuário atual (autenticado)
- `GET /api/notificacoes/unread-count`  contar não-lidas (autenticado)
- `PUT /api/notificacoes/:id/ler`  marcar notificação como lida (autenticado)

Testes e scripts úteis
- `scripts/test_galeria.js`  teste automatizado que registra/login, cria narrativa, curte e comenta (usa axios). Execute com:

```powershell
node scripts/test_galeria.js
```

Banco de dados
- O banco SQLite está em `database/laminas.db`. O arquivo é criado/atualizado automaticamente na primeira inicialização.

Configuração adicional (opcional)
- Variáveis de ambiente suportadas:
  - `JWT_SECRET`  segredo do JWT (recomendado para produção)
  - `EMAIL_USER` / `EMAIL_PASS`  para envio real de e-mails (dev usa Ethereal)

Próximos passos sugeridos
- Marcar notificações como lidas ao abrir o dropdown (cliente)
- Implementar notificações em tempo real (Socket.IO)
- Adicionar testes front-end automatizados

Contato
- Se precisar que eu implemente algum dos próximos passos (ex.: marcar como lida automático ou WebSocket), diga qual opção prefere.
