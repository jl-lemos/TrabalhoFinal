// JS auxiliar para animações interativas

document.addEventListener('DOMContentLoaded', () => {
    // Aplica animação de entrada em elementos principais
    document.querySelectorAll('.card-narrativa, .main-content, .jumbotron-epic, .genre-tag').forEach((el, idx) => {
        setTimeout(() => el.classList.add('animate-fade-in'), 60 * idx);
    });

    // Delegação para animação do botão curtir
    document.body.addEventListener('click', (ev) => {
        const btn = ev.target.closest('.btn-curtir');
        if (btn) {
            btn.classList.add('bounced');
            setTimeout(() => btn.classList.remove('bounced'), 700);
        }
    });

    // Pulsar sino quando houver notificações
    const badge = document.getElementById('badgeNotificacoes');
    const navBell = document.getElementById('navNotificacoes');
    function updateBellPulse() {
        if (!badge || !navBell) return;
        const val = parseInt(badge.textContent || '0');
        if (val > 0) navBell.classList.add('bell-pulse'); else navBell.classList.remove('bell-pulse');
    }
    updateBellPulse();
    setInterval(updateBellPulse, 2000);

    // Observador para animação quando novos cards são inseridos
    const container = document.getElementById('containerNarrativas');
    if (container) {
        const obs = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                m.addedNodes && m.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        node.querySelectorAll && node.querySelectorAll('.card-narrativa').forEach(c => c.classList.add('animate-fade-in'));
                    }
                });
            });
        });
        obs.observe(container, { childList: true, subtree: true });
    }
});
