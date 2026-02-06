// auth.js - funções de login e registro usando fazerRequisicao de api.js
const auth = (function() {
    async function login({ email, senha }) {
        try {
            const res = await fazerRequisicao('/auth/login', 'POST', { email, senha });
            if (res.sucesso && res.usuario && res.usuario.token) {
                localStorage.setItem('token', res.usuario.token);
                localStorage.setItem('usuarioId', res.usuario.id);
                localStorage.setItem('usuarioNome', res.usuario.nome);
                return res;
            }
            throw new Error(res.mensagem || 'Resposta inválida');
        } catch (e) {
            console.error('Erro login:', e);
            throw e;
        }
    }

    async function register({ nome, email, senha }) {
        try {
            const res = await fazerRequisicao('/auth/registrar', 'POST', { nome, email, senha });
            if (res.sucesso && res.usuario && res.usuario.token) {
                localStorage.setItem('token', res.usuario.token);
                localStorage.setItem('usuarioId', res.usuario.id);
                localStorage.setItem('usuarioNome', res.usuario.nome);
                return res;
            }
            throw new Error(res.mensagem || 'Resposta inválida');
        } catch (e) {
            console.error('Erro registrar:', e);
            throw e;
        }
    }

    async function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('usuarioNome');
    }

    return { login, register, logout };
})();

// Export for CommonJS (node scripts/tests)
if (typeof module !== 'undefined' && module.exports) module.exports = auth;