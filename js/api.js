// Configuração da API
const API_URL = 'http://localhost:5000/api';

// Função para fazer requisições à API
async function fazerRequisicao(endpoint, metodo = 'GET', dados = null) {
    try {
        const opcoes = {
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Adicionar token se existir
        const token = localStorage.getItem('token');
        if (token) {
            opcoes.headers['Authorization'] = `Bearer ${token}`;
        }

        if (dados) {
            opcoes.body = JSON.stringify(dados);
        }

        const resposta = await fetch(`${API_URL}${endpoint}`, opcoes);
        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem || 'Erro na requisição');
        }

        return resultado;
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        throw erro;
    }
}

// Validação de Email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validação de Senha
function validarSenha(senha) {
    return senha.length >= 6;
}

// Validação de Nome
function validarNome(nome) {
    return nome.trim().length >= 3;
}

// Validação de Mensagem
function validarMensagem(mensagem) {
    const trim = mensagem.trim();
    return trim.length >= 10 && trim.length <= 5000;
}

// Função para mostrar mensagem de erro
function mostrarErro(elemento, mensagem) {
    elemento.classList.add('is-invalid');
    const feedback = elemento.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = mensagem;
    }
}

// Função para limpar erro
function limparErro(elemento) {
    elemento.classList.remove('is-invalid');
    const feedback = elemento.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = '';
    }
}

// Função para exibir notificação
function exibirNotificacao(mensagem, tipo = 'sucesso') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo === 'sucesso' ? 'success' : 'danger'} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <i class="bi bi-${tipo === 'sucesso' ? 'check-circle-fill' : 'exclamation-circle-fill'}"></i> 
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.insertBefore(alertDiv, document.body.firstChild);
    
    // Auto-fechar após 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Exportar funções (para uso em módulos)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fazerRequisicao,
        validarEmail,
        validarSenha,
        validarNome,
        validarMensagem,
        mostrarErro,
        limparErro,
        exibirNotificacao
    };
}
