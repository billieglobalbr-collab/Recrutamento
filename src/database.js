const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'recrutamento.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS candidatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT UNIQUE,
    nome TEXT,
    etapa INTEGER DEFAULT 0,
    status TEXT DEFAULT 'em_andamento',
    iniciado_em TEXT DEFAULT (datetime('now')),
    finalizado_em TEXT,
    score_ia INTEGER DEFAULT 0,
    avaliacao_ia TEXT DEFAULT '',

    -- Respostas
    r_interesse TEXT DEFAULT '',
    r_experiencia TEXT DEFAULT '',
    r_edicao TEXT DEFAULT '',
    r_legenda_story TEXT DEFAULT '',
    r_legenda_feed TEXT DEFAULT '',
    r_legenda_rumor TEXT DEFAULT '',
    r_comportamento TEXT DEFAULT '',
    r_horarios TEXT DEFAULT '',
    r_whatsapp TEXT DEFAULT '',
    r_instagram TEXT DEFAULT '',
    r_intencoes TEXT DEFAULT '',
    r_disponibilidade TEXT DEFAULT '',
    r_conhecimento_billie TEXT DEFAULT '',
    r_idiomas TEXT DEFAULT '',
    r_situacao TEXT DEFAULT '',
    r_compromisso TEXT DEFAULT '',
    r_termo TEXT DEFAULT '',
    r_mensagem_final TEXT DEFAULT ''
  );
`);

function getCandidato(numero) {
  return db.prepare('SELECT * FROM candidatos WHERE numero=?').get(numero);
}

function criarCandidato(numero) {
  try {
    db.prepare('INSERT INTO candidatos (numero) VALUES (?)').run(numero);
  } catch (e) {}
  return getCandidato(numero);
}

function atualizarEtapa(numero, etapa) {
  db.prepare('UPDATE candidatos SET etapa=? WHERE numero=?').run(etapa, numero);
}

function salvarResposta(numero, campo, valor) {
  db.prepare('UPDATE candidatos SET ' + campo + '=? WHERE numero=?').run(valor, numero);
}

function finalizarCandidato(numero, score, avaliacao) {
  db.prepare('UPDATE candidatos SET status=?, finalizado_em=datetime("now"), score_ia=?, avaliacao_ia=? WHERE numero=?')
    .run('finalizado', score, avaliacao, numero);
}

function reprovarCandidato(numero, motivo) {
  db.prepare('UPDATE candidatos SET status=?, finalizado_em=datetime("now"), avaliacao_ia=? WHERE numero=?')
    .run('reprovado', motivo, numero);
}

function getTodosCandidatos() {
  return db.prepare('SELECT * FROM candidatos ORDER BY iniciado_em DESC').all();
}

function getEstatisticas() {
  return {
    total: db.prepare('SELECT COUNT(*) as n FROM candidatos').get().n,
    finalizados: db.prepare('SELECT COUNT(*) as n FROM candidatos WHERE status="finalizado"').get().n,
    reprovados: db.prepare('SELECT COUNT(*) as n FROM candidatos WHERE status="reprovado"').get().n,
    em_andamento: db.prepare('SELECT COUNT(*) as n FROM candidatos WHERE status="em_andamento"').get().n,
    media_score: db.prepare('SELECT AVG(score_ia) as m FROM candidatos WHERE status="finalizado"').get().m || 0
  };
}

module.exports = {
  getCandidato, criarCandidato, atualizarEtapa, salvarResposta,
  finalizarCandidato, reprovarCandidato, getTodosCandidatos, getEstatisticas
};
