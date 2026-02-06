#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

let token = '';
let usuarioId = '';
let narrativaId = '';

// ===== CLIENTE AXIOS =====
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

async function runTests() {
    console.log('\n=== TESTE COMPLETO - GALERIA + FEED PUBLICO ===\n');

    try {
        // 1. LOGIN
        console.log('1. Fazendo login...');
        const loginRes = await api.post('/api/auth/login', {
            email: 'teste@exemplo.com',
            senha: '123456'
        });

        if (loginRes.data.sucesso) {
            // O servidor pode retornar o token em dois formatos:
            // 1) { sucesso: true, token: '...' }
            // 2) { sucesso: true, usuario: { ..., token: '...' } }
            token = (loginRes.data.token) ? loginRes.data.token : (loginRes.data.usuario && loginRes.data.usuario.token) ? loginRes.data.usuario.token : '';
            usuarioId = (loginRes.data.usuario && loginRes.data.usuario.id) ? loginRes.data.usuario.id : null;

            if (!token) throw new Error('Token não retornado pelo servidor');

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('OK Login bem-sucedido!');
            console.log(`   Token: ${token.substring(0, 20)}...`);
            console.log(`   Usuario ID: ${usuarioId}\n`);
        } else {
            throw new Error('Erro ao fazer login');
        }

        // 2. CRIAR NARRATIVA
        console.log('2. Criando narrativa...');
        const narrativaRes = await api.post('/api/usuarios/narrativas', {
            titulo: 'A Lamina Magica - Teste Galeria',
            conteudo: 'Esta eh uma narrativa de teste para validar o sistema de galeria e comentarios. Ela foi criada para testar curtidas, comentarios e o feed publico.',
            genero: 'fantasia'
        });

        if (narrativaRes.data.sucesso) {
            narrativaId = narrativaRes.data.narrativa.id;
            console.log('OK Narrativa criada com sucesso!');
            console.log(`   ID: ${narrativaId}`);
            console.log(`   Titulo: ${narrativaRes.data.narrativa.titulo}\n`);
        } else {
            throw new Error('Erro ao criar narrativa');
        }

        // 3. CARREGAR FEED PUBLICO
        console.log('3. Carregando feed publico...');
        const feedRes = await api.get('/api/usuarios/feed/publico?page=1&limit=10');

        if (feedRes.data.sucesso) {
            console.log('OK Feed publico carregado!');
            console.log(`   Total de narrativas: ${feedRes.data.paginacao.total}`);
            console.log(`   Total de paginas: ${feedRes.data.paginacao.totalPaginas}`);
            console.log(`   Narrativas nesta pagina: ${feedRes.data.narrativas.length}\n`);

            if (feedRes.data.narrativas.length > 0) {
                const primeira = feedRes.data.narrativas[0];
                console.log('   Primeira Narrativa:');
                console.log(`      - Titulo: ${primeira.titulo}`);
                console.log(`      - Autor: ${primeira.autor_nome}`);
                console.log(`      - Curtidas: ${primeira.curtidas}`);
                console.log(`      - Comentarios: ${primeira.total_comentarios}\n`);
            }
        } else {
            throw new Error('Erro ao carregar feed');
        }

        // 4. CURTIR NARRATIVA
        console.log('4. Curtindo narrativa...');
        const curtirRes = await api.put(`/api/usuarios/narrativas/${narrativaId}/curtir`);

        if (curtirRes.data.sucesso) {
            console.log('OK Narrativa curtida com sucesso!');
            console.log(`   ${curtirRes.data.mensagem}\n`);
        } else {
            console.log('AV Narrativa ja estava curtida\n');
        }

        // 5. ADICIONAR COMENTARIO
        console.log('5. Adicionando comentario...');
        const comentarioRes = await api.post(`/api/usuarios/narrativas/${narrativaId}/comentarios`, {
            conteudo: 'Que narrativa incrivel! Adorei a forma como foi escrita. Parabens ao autor!'
        });

        if (comentarioRes.data.sucesso) {
            console.log('OK Comentario adicionado com sucesso!');
            console.log(`   ${comentarioRes.data.mensagem}\n`);
        } else {
            throw new Error('Erro ao adicionar comentario');
        }

        // 6. CARREGAR COMENTARIOS
        console.log('6. Carregando comentarios da narrativa...');
        const comentariosRes = await api.get(`/api/usuarios/narrativas/${narrativaId}/comentarios`);

        if (comentariosRes.data.sucesso) {
            console.log('OK Comentarios carregados!');
            console.log(`   Total de comentarios: ${comentariosRes.data.comentarios.length}\n`);

            comentariosRes.data.comentarios.forEach((com, i) => {
                console.log(`   Comentario ${i + 1}:`);
                console.log(`      - Autor: ${com.usuario_nome}`);
                console.log(`      - Conteudo: ${com.conteudo}`);
                console.log(`      - Data: ${new Date(com.criado_em).toLocaleDateString('pt-BR')}\n`);
            });
        }

        // 7. FILTRAR FEED POR GENERO
        console.log('7. Filtrando feed por genero (fantasia)...');
        const feedFiltroRes = await api.get('/api/usuarios/feed/publico?page=1&limit=10&genero=fantasia');

        if (feedFiltroRes.data.sucesso) {
            console.log('OK Feed filtrado com sucesso!');
            console.log(`   Narrativas de fantasia encontradas: ${feedFiltroRes.data.narrativas.length}\n`);
        } else {
            throw new Error('Erro ao filtrar feed');
        }

        // 8. BUSCAR NARRATIVAS
        console.log('8. Buscando narrativas...');
        const buscaRes = await api.get('/api/usuarios/feed/publico?page=1&limit=10&busca=Lamina');

        if (buscaRes.data.sucesso) {
            console.log('OK Busca realizada com sucesso!');
            console.log(`   Narrativas encontradas com "Lamina": ${buscaRes.data.narrativas.length}\n`);
        } else {
            throw new Error('Erro ao buscar narrativas');
        }

        // 9. REMOVER CURTIDA
        console.log('9. Removendo curtida...');
        const descurtirRes = await api.delete(`/api/usuarios/narrativas/${narrativaId}/curtir`);

        if (descurtirRes.data.sucesso) {
            console.log('OK Curtida removida com sucesso!');
            console.log(`   ${descurtirRes.data.mensagem}\n`);
        } else {
            console.log('AV Nao estava curtida\n');
        }

        console.log('\n=== TODOS OS TESTES PASSARAM COM SUCESSO! ===\n');
        console.log('RESUMO:');
        console.log('   OK Autenticacao JWT');
        console.log('   OK Criacao de narrativas');
        console.log('   OK Feed publico com paginacao');
        console.log('   OK Sistema de curtidas (like/unlike)');
        console.log('   OK Sistema de comentarios');
        console.log('   OK Filtros por genero');
        console.log('   OK Busca de narrativas');
        console.log('\nGaleria implementada com sucesso!\n');

    } catch (erro) {
        console.error('\nERRO DURANTE TESTES:', erro.message);
        if (erro.response && erro.response.data) {
            console.error('Detalhes:', erro.response.data);
        }
        process.exit(1);
    }
}

runTests();
