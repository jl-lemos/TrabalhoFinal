const fetch = require('node-fetch');
const FormData = require('form-data');
const sharp = require('sharp');
const fs = require('fs');

(async () => {
  try {
    const API = 'http://localhost:5000/api';

    // 1) Fazer login com usuário seed
    console.log('Fazendo login...');
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teste@exemplo.com', senha: '123456' })
    });

    const loginJson = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Falha no login:', loginJson);
      process.exit(1);
    }

    const token = loginJson.usuario.token;
    const usuarioId = loginJson.usuario.id;
    console.log('Login OK. Token obtido para usuário id=', usuarioId);

    // 2) Gerar imagem PNG 300x300 com Sharp
    console.log('Gerando imagem com sharp...');
    const avatarBuffer = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 4,
        background: { r: 10, g: 14, b: 39, alpha: 1 }
      }
    })
    .png()
    .toBuffer();

    // 3) Montar FormData e enviar
    const form = new FormData();
    form.append('avatar', avatarBuffer, { filename: 'test_avatar.png', contentType: 'image/png' });

    console.log('Enviando avatar para /api/auth/avatar ...');
    const uploadRes = await fetch(`${API}/auth/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });

    const uploadJson = await uploadRes.json();
    if (!uploadRes.ok) {
      console.error('Falha no upload:', uploadJson);
      process.exit(1);
    }

    console.log('Upload realizado com sucesso:', uploadJson);
    console.log('Avatar disponível em:', uploadJson.avatar);

    // 4) Verificar perfil para ver se avatar foi atualizado
    const perfilRes = await fetch(`${API}/auth/perfil`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const perfilJson = await perfilRes.json();
    console.log('Perfil atualizado com avatar:', perfilJson.usuario.avatar);

    process.exit(0);
  } catch (err) {
    console.error('Erro no script de upload:', err);
    process.exit(1);
  }
})();
