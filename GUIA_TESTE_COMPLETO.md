# 🎮 GUIA DE TESTE COMPLETO - LÂMINAS DO DESTINO

## 🎯 OBJETIVO
Testar todas as funcionalidades do sistema completo com banco de dados, autenticação JWT e perfil animado!

---

## ✅ PRÉ-TESTE
- [ ] Servidor está rodando em http://localhost:5000
- [ ] Banco de dados SQLite criado
- [ ] Todas as dependências instaladas

---

## 🧪 TESTE 1: Página Inicial

### Passo 1: Abrir a página
```
Acesse: http://localhost:5000
```

### Verificar
- [ ] Navbar carrega sem erros
- [ ] Jumbotron com animação fade-in visível
- [ ] Carousel rotaciona as 4 imagens
- [ ] Botão "Começar Jornada" responsivo
- [ ] Footer exibe corretamente
- [ ] Favicon (⚔️) na aba

### Resultado Esperado
✅ Página inicial épica carregando perfeitamente

---

## 🎭 TESTE 2: Criar Conta

### Passo 1: Clique em "Começar Jornada"
```
Localizar botão azul: "Começar Jornada"
Clique nele
```

### Passo 2: Preencher formulário
```
Email: seu_teste@exemplo.com
Senha: 123456
```

### Passo 3: Clique em "Crie sua conta"
```
Link azul: "Crie sua conta"
```

### Passo 4: Preencher cadastro
```
Nome: Seu Nome Aqui
Email: seu_teste@exemplo.com
Senha: 123456 (confirmar)
```

### Passo 5: Clicar em "Registrar" ou "Criar Conta"

### Verificar
- [ ] Mensagem de sucesso aparece
- [ ] Token salvo no localStorage
- [ ] Redirecionado para /perfil automaticamente
- [ ] Perfil carrega corretamente

### Resultado Esperado
✅ Conta criada com sucesso, usuário logado

---

## 👤 TESTE 3: Perfil do Usuário (O Melhor!)

### Verificar Elementos

#### Avatar
- [ ] Avatar com brilho dourado (#d4af37)
- [ ] Badge verde pulsando (indicador "Conectado")
- [ ] Animação avatar-glow contínua

#### Informações do Usuário
- [ ] Nome exibido corretamente
- [ ] Título mostra "Iniciante"
- [ ] Bio mostra "Explorador das Lâminas do Destino"
- [ ] Botão "Editar Perfil" funciona

#### Estatísticas (Cards)
- [ ] Card 1: Nível 1 (com animação float)
- [ ] Card 2: Narrativas 0
- [ ] Card 3: Curtidas Recebidas 0
- [ ] Card 4: Seguidores 0
- [ ] Cada card tem hover effect (scale 1.05)

#### Nível e XP
- [ ] Card de nível com background dourado
- [ ] Barra de XP vazia (0/100)
- [ ] Animação shimmer na barra
- [ ] Texto "Próximo Nível" visível

#### Conquistas
- [ ] Seção visível com título "🏆 Conquistas"
- [ ] Mensagem "Nenhuma conquista desbloqueada ainda"
- [ ] (Será preenchida quando desbloquear)

#### Minhas Narrativas
- [ ] Seção visível com título "📖 Minhas Narrativas"
- [ ] Botão "Nova Narrativa" (ícone +)
- [ ] Mensagem "Nenhuma narrativa criada ainda"

### Animações para Testar
```
1. Passe o mouse sobre os stat cards
   → Esperado: Scale up, brilho aumento, cor muda para ouro

2. Observe o avatar
   → Esperado: Brilho pulsando continuamente

3. Observe a barra de XP
   → Esperado: Shimmer deslizando da esquerda para direita

4. Veja o nível card
   → Esperado: Pulsa (scale) levemente a cada 2 segundos
```

### Resultado Esperado
✅ Perfil épico com todas as animações funcionando

---

## ✏️ TESTE 4: Editar Perfil

### Passo 1: Clique em "Editar Perfil"
```
Botão dourado: "Editar Perfil"
```

### Passo 2: Preencher formulário
```
Nome: Seu Nome Alterado
Bio: Explorador das Lâminas - Nível Avançado
```

### Passo 3: Clicar em "Salvar Alterações"

### Verificar
- [ ] Modal fecha
- [ ] Página recarrega
- [ ] Nome atualizado no perfil
- [ ] Bio atualizada

### Resultado Esperado
✅ Perfil atualizado com sucesso

---

## 📖 TESTE 5: Criar Narrativa (CRUCIAL!)

### Passo 1: Clique em "Nova Narrativa"
```
Botão dourado: "+ Nova Narrativa"
```

### Passo 2: Preencher formulário
```
Título: A Espada da Meia-Noite
Gênero: Fantasia
Conteúdo: 
  "Uma noite escura, uma lâmina brilha entre as sombras. 
   O destino de toda uma geração repousa nas mãos de 
   um jovem guerreiro que nunca imaginou sua verdadeira força."
```

### Passo 3: Clicar em "Publicar Narrativa"

### Verificar
- [ ] Modal fecha
- [ ] Alerta: "📖 Narrativa publicada com sucesso! +50 XP"
- [ ] Página recarrega
- [ ] Narrativa aparece na seção "Minhas Narrativas"
- [ ] Card mostra: título, conteúdo (100 chars), stats

### Verificar XP
- [ ] Barra de XP agora mostra 50/100
- [ ] Progresso visual na barra (~50%)
- [ ] Texto "50 / 100 XP" atualizado

### Resultado Esperado
✅ Narrativa criada, XP ganho, barra atualizada!

---

## ❤️ TESTE 6: Curtir Narrativa

### Passo 1: Abrir outra guia do navegador
```
Nova guia: http://localhost:5000
```

### Passo 2: Login com outro usuário
```
Ou crie outra conta:
Email: usuario2@exemplo.com
Senha: 123456
Nome: Outro Usuário
```

### Passo 3: Procurar por narrativas de outros
```
(Futuro: quando houver feed de narrativas)
Ou crie várias contas e teste entre elas
```

### Resultado Esperado
✅ Sistema de curtidas preparado para funcionamento

---

## 🧪 TESTE 7: Endpoint de Email

### Passo 1: Abrir página de testes
```
Acesse: http://localhost:5000/teste-api.html
```

### Passo 2: Testar conexão de email
```
Clique: "🧪 Testar Conexão de Email"
```

### Verificar
- [ ] Resposta: "Servidor de email funcionando!"
- [ ] Email exibido: thad.carter@ethereal.email
- [ ] Serviço: ethereal

### Resultado Esperado
✅ Email funcionando corretamente

---

## 🔓 TESTE 8: Logout

### Passo 1: Na navbar, clique em "Sair"

### Verificar
- [ ] Token removido do localStorage
- [ ] Usuário redireciona para /
- [ ] NavPerfil desaparece da navbar

### Resultado Esperado
✅ Logout funcionando corretamente

---

## 🔐 TESTE 9: Login Novamente

### Passo 1: Clique em "Começar Jornada"

### Passo 2: Faça login
```
Email: seu_teste@exemplo.com
Senha: 123456
```

### Verificar
- [ ] Login bem-sucedido
- [ ] Mensagem: "✨ Bem-vindo, Seu Nome!"
- [ ] Redirecionado para /perfil
- [ ] Dados persistem (nome, nível, XP)

### Resultado Esperado
✅ Autenticação persistente funcionando

---

## 📱 TESTE 10: Responsividade

### Passo 1: Abrir DevTools (F12)

### Passo 2: Testar em diferentes tamanhos
```
- Mobile (375x667)
- Tablet (768x1024)
- Desktop (1920x1080)
```

### Verificar
- [ ] Layout adapta corretamente
- [ ] Avatar responsivo
- [ ] Stats se reorganizam em colunas
- [ ] Fonts legíveis
- [ ] Modais centralizados

### Resultado Esperado
✅ Design 100% responsivo

---

## 🎨 TESTE 11: Animações Completas

### Verificar Cada Animação

#### 1. Avatar Glow
```
Observar avatar
→ Brilho pulsando suavemente (3s)
```

#### 2. Stat Cards Float
```
Cards de estatísticas
→ Flutuam para cima e para baixo (3s)
```

#### 3. Stat Cards Hover
```
Passar mouse sobre card
→ Scale 1.05 + brilho aumenta
```

#### 4. XP Progress Shimmer
```
Observar barra de XP
→ Brilho desliza (3s)
```

#### 5. Nível Pulse Scale
```
Observar card de nível
→ Pulsa aumentando de tamanho (2s)
```

#### 6. Modal Slide In
```
Abrir modal de edição
→ Desliza suavemente
```

### Resultado Esperado
✅ Todas as animações fluindo perfeitamente

---

## 🗄️ TESTE 12: Banco de Dados

### Verificar Arquivos
```
Pasta: database/
Arquivo: laminas.db
```

### Verificar no SQLite (Opcional)
```powershell
# Instalar SQLite CLI (se não tiver)
# Então:
sqlite3 database/laminas.db ".tables"
```

### Esperado
```
usuarios narrativas conquistas sessoes estatisticas
```

### Verificar Dados
```
sqlite3 database/laminas.db "SELECT * FROM usuarios;"
```

### Resultado Esperado
✅ Usuários e narrativas salvos corretamente

---

## 📊 CHECKLIST FINAL

### Funcionalidades Core
- [ ] Página inicial carrega
- [ ] Criar conta funciona
- [ ] Login funciona
- [ ] Perfil exibe corretamente
- [ ] Editar perfil funciona
- [ ] Criar narrativa funciona
- [ ] XP é ganho (+50)
- [ ] Barra de XP atualiza
- [ ] Logout funciona
- [ ] Dados persistem

### Animações
- [ ] Avatar brilha
- [ ] Cards flutuam
- [ ] Cards têm hover
- [ ] XP shimmer
- [ ] Nível pulsa
- [ ] Modais deslizam

### Design
- [ ] Cores corretas (ouro #d4af37)
- [ ] Fontes carregam
- [ ] Layout responsivo
- [ ] Sem erros no console
- [ ] Favicon exibe

### Banco de Dados
- [ ] SQLite criado
- [ ] Tabelas existem
- [ ] Dados salvos
- [ ] Autenticação funciona

---

## 🎉 RESULTADO FINAL

Se todos os testes passarem ✅:

```
🌙 LÂMINAS DO DESTINO SOB A LUA
✅ Frontend Épico
✅ Backend Robusto
✅ BD Funcional
✅ Autenticação JWT
✅ Animações Incríveis
✅ Totalmente Responsivo

PARABÉNS! 🎊 Você tem um projeto PROFISSIONAL!
```

---

## 🚀 Próximos Passos

1. Testar em navegadores diferentes (Chrome, Firefox, Edge)
2. Criar mais contas e testar interação
3. Verificar logs do servidor (console)
4. Fazer backup do banco de dados
5. Documentar descobertas

---

**Divirta-se testando! A jornada nas Lâminas do Destino começa agora! ⚔️🌙**
