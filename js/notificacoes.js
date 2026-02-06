// JS de Notificações: polling simples e renderização

async function atualizarBadgeNotificacoes() {
    try {
        const res = await fetch('/api/notificacoes/unread-count', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` || '' }
        });
        if (!res.ok) return;
        const dados = await res.json();
        const badge = document.getElementById('badgeNotificacoes');
        const container = document.getElementById('navNotificacoesContainer');
        if (!badge || !container) return;
        const unread = dados.unread || 0;
        badge.textContent = unread;
        container.style.display = 'block';
        badge.style.display = unread > 0 ? 'inline-block' : 'none';
    } catch (e) {
        // console.error('Erro ao atualizar badge:', e);
    }
}

async function carregarNotificacoes() {
    try {
        const res = await fetch('/api/notificacoes?limit=20', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` || '' }
        });
        if (!res.ok) return;
        const dados = await res.json();
        const lista = document.getElementById('listaNotificacoes');
        if (!lista) return;
        lista.innerHTML = '';

        if (!dados.notificacoes || dados.notificacoes.length === 0) {
            lista.innerHTML = '<div class="text-muted small py-2">Nenhuma notificação</div>';
            return;
        }

        dados.notificacoes.forEach(n => {
            const item = document.createElement('div');
            item.className = 'd-flex align-items-start py-2 border-bottom';
            item.innerHTML = `
                <div class="me-2">
                    <img src="${n.origem_avatar || '/uploads/avatars/default.png'}" width="36" height="36" class="rounded-circle" />
                </div>
                <div style="flex:1">
                    <div class="small text-warning">${n.tipo}</div>
                    <div class="text-light small">${n.mensagem}</div>
                    <div class="text-muted tiny" style="font-size: 10px">${new Date(n.criado_em).toLocaleString('pt-BR')}</div>
                </div>
                <div class="ms-2">
                    <button class="btn btn-sm btn-outline-warning btn-mark-read" data-id="${n.id}">Marcar lida</button>
                </div>
            `;
            lista.appendChild(item);
        });

        // adicionar listeners para marcar lida
        document.querySelectorAll('.btn-mark-read').forEach(btn => {
            btn.addEventListener('click', async (ev) => {
                const id = ev.currentTarget.getAttribute('data-id');
                await marcarComoLida(id);
                await atualizarBadgeNotificacoes();
                await carregarNotificacoes();
            });
        });

    } catch (e) {
        console.error('Erro ao carregar notificações:', e);
    }
}

async function marcarComoLida(id) {
    try {
        const res = await fetch(`/api/notificacoes/${id}/ler`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` || '' }
        });
        return res.ok;
    } catch (e) {
        return false;
    }
}

// Inicialização: polling e evento de clique
document.addEventListener('DOMContentLoaded', () => {
    atualizarBadgeNotificacoes();
    setInterval(atualizarBadgeNotificacoes, 15000); // cada 15s

    const notificacoesToggle = document.getElementById('navNotificacoes');
    if (notificacoesToggle) {
        notificacoesToggle.addEventListener('click', (ev) => {
            // Ao abrir, carregar notificações
            setTimeout(() => carregarNotificacoes(), 150);
        });
    }
});
