// ⚔️ GALERIA - CONTROLE INTERATIVO ⚔️

let paginaAtual = 1;
const limitePorPagina = 10;
let filtrosAtivos = {
    busca: '',
    genero: ''
};
let narrativasCarregadas = [];
let usuarioAtual = null;
let modalComentarioAtual = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', async () => {
    await verificarAutenticacao();
    await carregarNarrativas();
    adicionarEventListeners();
});

// ===== VERIFICAR AUTENTICAÇÃO =====
async function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    const navPerfil = document.getElementById('navPerfil');
    const navSair = document.getElementById('navSair');
    const navEntrar = document.getElementById('navEntrar');
    const cardUsuario = document.getElementById('cardUsuario');

    if (token) {
        try {
            const perfil = await api.getPerfil();
            if (perfil.sucesso) {
                usuarioAtual = perfil.usuario;
                navPerfil.style.display = 'block';
                navSair.style.display = 'block';
                navEntrar.style.display = 'none';

                // Mostrar card do usuário
                cardUsuario.style.display = 'block';
                document.getElementById('avatarUsuario').src = usuarioAtual.avatar;
                document.getElementById('nomeUsuario').textContent = usuarioAtual.nome;
                document.getElementById('nivelUsuario').textContent = `Nível ${Math.floor(usuarioAtual.experiencia / 100) + 1}`;

                // Mostrar forma de comentário
                document.getElementById('formaComentario').style.display = 'block';
            }
        } catch (erro) {
            console.error('Erro ao carregar perfil:', erro);
        }
    } else {
        navPerfil.style.display = 'none';
        navSair.style.display = 'none';
        navEntrar.style.display = 'block';
        cardUsuario.style.display = 'none';
        document.getElementById('formaComentario').style.display = 'none';
    }
}

// ===== CARREGAR NARRATIVAS =====
async function carregarNarrativas() {
    try {
        const container = document.getElementById('containerNarrativas');
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            </div>
        `;

        const params = new URLSearchParams({
            page: paginaAtual,
            limit: limitePorPagina
        });

        if (filtrosAtivos.busca) {
            params.append('busca', filtrosAtivos.busca);
        }

        if (filtrosAtivos.genero) {
            params.append('genero', filtrosAtivos.genero);
        }

        const response = await fetch(`/api/usuarios/feed/publico?${params}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` || ''
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar feed');

        const dados = await response.json();

        if (dados.sucesso && dados.narrativas.length > 0) {
            narrativasCarregadas = dados.narrativas;
            container.innerHTML = '';

            dados.narrativas.forEach(narrativa => {
                container.appendChild(criarCardNarrativa(narrativa));
            });

            // Atualizar paginação
            atualizarPaginacao(dados.paginacao);

            // Atualizar estatísticas
            document.getElementById('totalNarrativas').textContent = `📚 ${dados.paginacao.total} narrativas`;

            // Calcular total de comentários
            const totalComentarios = dados.narrativas.reduce((total, n) => total + n.total_comentarios, 0);
            document.getElementById('totalComentarios').textContent = `💬 ${totalComentarios} comentários`;
        } else {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <div class="empty-state-icon">📖</div>
                        <h5>Nenhuma narrativa encontrada</h5>
                        <p>Tente ajustar seus filtros ou crie uma nova narrativa!</p>
                    </div>
                </div>
            `;
            document.getElementById('paginacao').style.display = 'none';
        }

    } catch (erro) {
        console.error('Erro ao carregar narrativas:', erro);
        document.getElementById('containerNarrativas').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    ❌ Erro ao carregar narrativas. Tente novamente.
                </div>
            </div>
        `;
    }
}

// ===== CRIAR CARD DE NARRATIVA =====
function criarCardNarrativa(narrativa) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';

    const dataFormatada = new Date(narrativa.criado_em).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const generoEmoji = {
        'fantasia': '🐉',
        'ficção-científica': '🚀',
        'mistério': '🔍',
        'romance': '💕',
        'horror': '👻',
        'aventura': '🗺️',
        'outro': '📖'
    };

    const emoji = generoEmoji[narrativa.genero] || '📖';

    col.innerHTML = `
        <div class="card card-narrativa h-100">
            <div class="card-header">
                <h5>${narrativa.titulo}</h5>
                <span class="badge-genero">${emoji} ${narrativa.genero}</span>
            </div>

            <div class="autor-info">
                <img src="${narrativa.autor_avatar}" alt="${narrativa.autor_nome}" class="autor-avatar">
                <div class="autor-detalhes">
                    <a href="#" onclick="irParaPerfil(${narrativa.autor_id}); return false;" class="autor-nome">
                        ${narrativa.autor_nome}
                    </a>
                    <small class="autor-data">${dataFormatada}</small>
                </div>
            </div>

            <div class="card-body">
                <p class="conteudo-narrativa">${narrativa.conteudo.substring(0, 150)}...</p>
            </div>

            <div class="card-footer">
                <button class="btn-curtir" data-narrativa-id="${narrativa.id}" onclick="toggleCurtida(${narrativa.id}, event)">
                    <span class="icon-curtida">❤️</span>
                    <span class="count-curtida">${narrativa.curtidas}</span>
                </button>
                <button class="btn-comentarios" onclick="abrirModalComentarios(${narrativa.id}, '${narrativa.titulo}')">
                    💬 <span>${narrativa.total_comentarios || 0}</span>
                </button>
            </div>
        </div>
    `;

    return col;
}

// ===== CURTIR/DESCURTIR NARRATIVA =====
async function toggleCurtida(narrativaId, event) {
    if (!usuarioAtual) {
        alert('Você precisa estar logado para curtir narrativas!');
        return;
    }

    try {
        const botao = event.currentTarget;
        const jaFoiCurtida = botao.classList.contains('curtido');

        if (jaFoiCurtida) {
            // Remover curtida
            const response = await fetch(`/api/usuarios/narrativas/${narrativaId}/curtir`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                botao.classList.remove('curtido');
                const count = botao.querySelector('.count-curtida');
                count.textContent = parseInt(count.textContent) - 1;
            }
        } else {
            // Adicionar curtida
            const response = await fetch(`/api/usuarios/narrativas/${narrativaId}/curtir`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                botao.classList.add('curtido');
                const count = botao.querySelector('.count-curtida');
                count.textContent = parseInt(count.textContent) + 1;
            }
        }
    } catch (erro) {
        console.error('Erro ao curtir narrativa:', erro);
        alert('Erro ao curtir narrativa');
    }
}

// ===== ABRIR MODAL DE COMENTÁRIOS =====
async function abrirModalComentarios(narrativaId, titulo) {
    modalComentarioAtual = narrativaId;

    // Atualizar título do modal
    document.querySelector('#modalComentarios .modal-title').textContent = `💬 Comentários: ${titulo}`;

    // Carregar comentários
    await carregarComentarios(narrativaId);

    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('modalComentarios'));
    modal.show();

    // Configurar botão de adicionar comentário
    const btnAdicionar = document.getElementById('btnAdicionarComentario');
    const inputComentario = document.getElementById('inputComentario');

    btnAdicionar.onclick = async () => {
        const conteudo = inputComentario.value.trim();
        if (conteudo) {
            await adicionarComentario(narrativaId, conteudo);
            inputComentario.value = '';
        }
    };

    inputComentario.onkeypress = (event) => {
        if (event.key === 'Enter') {
            btnAdicionar.click();
        }
    };
}

// ===== CARREGAR COMENTÁRIOS =====
async function carregarComentarios(narrativaId) {
    try {
        const response = await fetch(`/api/usuarios/narrativas/${narrativaId}/comentarios`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` || ''
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar comentários');

        const dados = await response.json();
        const lista = document.getElementById('listaComentarios');
        lista.innerHTML = '';

        if (dados.comentarios.length === 0) {
            lista.innerHTML = '<p class="text-muted text-center">Nenhum comentário ainda. Seja o primeiro! 🎉</p>';
            return;
        }

        dados.comentarios.forEach(comentario => {
            const el = document.createElement('div');
            el.className = 'comentario-item';
            el.id = `comentario-${comentario.id}`;

            const podeDeletar = usuarioAtual && usuarioAtual.id === comentario.usuario_id;

            el.innerHTML = `
                <div class="comentario-autor">
                    <img src="${comentario.usuario_avatar}" alt="${comentario.usuario_nome}" class="comentario-avatar">
                    <span class="comentario-nome">${comentario.usuario_nome}</span>
                    <small class="comentario-data">${new Date(comentario.criado_em).toLocaleDateString('pt-BR')}</small>
                    ${podeDeletar ? `<span class="btn-deletar-comentario ms-auto" onclick="deletarComentario(${comentario.id})">✕</span>` : ''}
                </div>
                <p class="comentario-conteudo">${comentario.conteudo}</p>
            `;

            lista.appendChild(el);
        });

    } catch (erro) {
        console.error('Erro ao carregar comentários:', erro);
        document.getElementById('listaComentarios').innerHTML = '<p class="text-danger">Erro ao carregar comentários</p>';
    }
}

// ===== ADICIONAR COMENTÁRIO =====
async function adicionarComentario(narrativaId, conteudo) {
    try {
        const response = await fetch(`/api/usuarios/narrativas/${narrativaId}/comentarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ conteudo })
        });

        if (!response.ok) throw new Error('Erro ao adicionar comentário');

        await carregarComentarios(narrativaId);
    } catch (erro) {
        console.error('Erro ao adicionar comentário:', erro);
        alert('Erro ao adicionar comentário');
    }
}

// ===== DELETAR COMENTÁRIO =====
async function deletarComentario(comentarioId) {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) return;

    try {
        const response = await fetch(`/api/usuarios/comentarios/${comentarioId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Erro ao deletar comentário');

        // Remover elemento
        const el = document.getElementById(`comentario-${comentarioId}`);
        if (el) el.remove();

        // Se ainda há modal aberto, atualizar
        if (modalComentarioAtual) {
            await carregarComentarios(modalComentarioAtual);
        }
    } catch (erro) {
        console.error('Erro ao deletar comentário:', erro);
        alert('Erro ao deletar comentário');
    }
}

// ===== ATUALIZAR PAGINAÇÃO =====
function atualizarPaginacao(paginacao) {
    const nav = document.getElementById('paginacao');
    const paginaAtualEl = document.getElementById('paginaAtual');
    const totalPaginasEl = document.getElementById('totalPaginas');
    const btnAnterior = document.getElementById('btnAnterior');
    const btnProximo = document.getElementById('btnProximo');

    if (paginacao.totalPaginas > 1) {
        nav.style.display = 'block';
        paginaAtualEl.textContent = paginacao.pagina;
        totalPaginasEl.textContent = paginacao.totalPaginas;

        // Atualizar disponibilidade dos botões
        if (paginacao.pagina === 1) {
            btnAnterior.classList.add('disabled');
        } else {
            btnAnterior.classList.remove('disabled');
            btnAnterior.onclick = () => {
                paginaAtual--;
                carregarNarrativas();
                window.scrollTo(0, 0);
            };
        }

        if (paginacao.pagina === paginacao.totalPaginas) {
            btnProximo.classList.add('disabled');
        } else {
            btnProximo.classList.remove('disabled');
            btnProximo.onclick = () => {
                paginaAtual++;
                carregarNarrativas();
                window.scrollTo(0, 0);
            };
        }
    } else {
        nav.style.display = 'none';
    }
}

// ===== EVENT LISTENERS =====
function adicionarEventListeners() {
    // Botão Aplicar Filtros
    document.getElementById('btnAplicarFiltros').addEventListener('click', () => {
        filtrosAtivos.busca = document.getElementById('buscaInput').value;
        filtrosAtivos.genero = document.getElementById('generoSelect').value;
        paginaAtual = 1;
        carregarNarrativas();
    });

    // Botão Limpar Filtros
    document.getElementById('btnLimparFiltros').addEventListener('click', () => {
        document.getElementById('buscaInput').value = '';
        document.getElementById('generoSelect').value = '';
        filtrosAtivos = { busca: '', genero: '' };
        paginaAtual = 1;
        carregarNarrativas();
    });

    // Enter no input de busca
    document.getElementById('buscaInput').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            document.getElementById('btnAplicarFiltros').click();
        }
    });
}

// ===== FUNÇÕES AUXILIARES =====
function sair() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

function irPara(url) {
    window.location.href = url;
}

function irParaPerfil(usuarioId) {
    window.location.href = `/perfil?id=${usuarioId}`;
}
