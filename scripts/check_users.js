const db = require('../config/database');

setTimeout(()=>{
  db.all('SELECT id,email,nome FROM usuarios', (err, rows)=>{
    if (err) { console.error('Erro:', err); process.exit(1); }
    console.log('Usuários no DB:');
    console.table(rows);
    process.exit(0);
  });
}, 500);
