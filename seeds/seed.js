const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function runSeed() {
    try {
        // Usuários de teste
        const users = [
            { email: 'teste@exemplo.com', senha: '123456', nome: 'João da Lâmina' },
            { email: 'usuario2@exemplo.com', senha: '123456', nome: 'Maria das Sombras' }
        ];

        for (const u of users) {
            const hash = await bcrypt.hash(u.senha, 10);
            await new Promise((resolve, reject) => {
                db.run('INSERT OR IGNORE INTO usuarios (email, senha, nome) VALUES (?, ?, ?)', [u.email, hash, u.nome], function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            });
        }

        // Criar algumas narrativas para o primeiro usuário
        const userRow = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM usuarios WHERE email = ?', ['teste@exemplo.com'], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        const uid = userRow?.id;
        if (uid) {
            await new Promise((resolve, reject) => {
                db.run('INSERT INTO narrativas (usuario_id, titulo, conteudo, genero) VALUES (?, ?, ?, ?)', [uid, 'A Espada da Meia-Noite', 'Uma lâmina que brilha nas sombras...', 'fantasia'], function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            });
        }

        console.log('Seed finalizado com sucesso.');
        process.exit(0);
    } catch (err) {
        console.error('Erro no seed:', err);
        process.exit(1);
    }
}

runSeed();
