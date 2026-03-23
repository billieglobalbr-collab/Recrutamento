const crypto = require('crypto');
if (!globalThis.crypto) globalThis.crypto = crypto;

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino    = require('pino');
const path    = require('path');
const fs      = require('fs');
const express = require('express');
const cors    = require('cors');

const db          = require('./database');
const { ETAPAS, MENSAGEM_AGUARDO, MENSAGEM_APROVADO, MENSAGEM_REPROVADO, MENSAGEM_JA_INSCRITO } = require('./perguntas');
const { avaliarCandidato } = require('./avaliacao');

const PORT    = process.env.PORT || 3000;
const AUTH_DIR = path.join(__dirname, '..', 'data', 'auth');
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

let qrAtual = null, botOnline = false, tentativas = 0;
let logMsgs = ['Bot de Recrutamento iniciando...'];

function addLog(msg) {
  const t = new Date().toLocaleTimeString('pt-BR');
  logMsgs.push('[' + t + '] ' + msg);
  if (logMsgs.length > 30) logMsgs.shift();
  console.log(msg);
}

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
function getNumero(jid) { return jid.split('@')[0].replace(/[^0-9]/g, ''); }

// ─── Express Server (API + QR + Central) ───
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'central')));

// API: todos os candidatos
app.get('/api/candidatos', function(req, res) {
  try {
    const candidatos = db.getTodosCandidatos();
    res.json(candidatos);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// API: estatísticas
app.get('/api/stats', function(req, res) {
  try {
    res.json(db.getEstatisticas());
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// Página principal (QR Code ou "Online")
app.get('/qr', function(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (botOnline) {
    return res.end('<!DOCTYPE html><html><body style="background:#0a0a0a;color:#fff;font-family:sans-serif;text-align:center;padding:50px"><h1 style="color:#e50914">🔴🖤 Billie Global BR</h1><h2 style="color:#0f0">✅ BOT DE RECRUTAMENTO ONLINE!</h2><p>O bot está ativo e recebendo candidaturas!</p><p><a href="/" style="color:#e50914">Ver Central de Gerenciamento →</a></p></body></html>');
  }
  if (qrAtual) {
    const qrImg = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qrAtual);
    return res.end('<!DOCTYPE html><html><head><meta http-equiv="refresh" content="20"></head><body style="background:#0a0a0a;color:#fff;font-family:sans-serif;text-align:center;padding:50px"><h1 style="color:#e50914">🔴🖤 Billie Global BR</h1><h2>📱 Escaneie para conectar o bot</h2><img src="' + qrImg + '" style="border:4px solid #e50914;border-radius:10px;margin:20px;width:280px"/><p style="color:#f44">⏳ Expira em 60s</p><p>WhatsApp > Dispositivos conectados > Conectar dispositivo</p></body></html>');
  }
  const logs = logMsgs.map(function(l) { return '<div style="font-size:11px;color:#aaa;text-align:left">' + l + '</div>'; }).join('');
  res.end('<!DOCTYPE html><html><head><meta http-equiv="refresh" content="3"></head><body style="background:#0a0a0a;color:#fff;font-family:sans-serif;text-align:center;padding:50px"><h1 style="color:#e50914">🔴🖤 Billie Global BR</h1><h2>⏳ Aguardando QR Code...</h2><div style="background:#1a1a1a;padding:15px;border-radius:8px;margin:20px auto;max-width:500px">' + logs + '</div></body></html>');
});

app.listen(PORT, function() { addLog('Servidor Express porta ' + PORT); });

// ─── Handler de Mensagens ───
async function handleMsg(sock, msg) {
  try {
    const key = msg.key, message = msg.message;
    if (!message || key.fromMe) return;

    const from = key.remoteJid;
    // Só responde no privado
    if (from.endsWith('@g.us')) return;

    const numero = getNumero(from);
    const bodyRaw = (message.conversation || (message.extendedTextMessage && message.extendedTextMessage.text) || '').trim();
    const body = bodyRaw.toLowerCase();

    if (!bodyRaw) return;

    const send = function(text) {
      return sock.sendMessage(from, { text: text });
    };

    // Reiniciar processo
    if (body === 'reiniciar' || body === 'restart' || body === 'recomeçar') {
      const c = db.getCandidato(numero);
      if (c) {
        // Deleta e recria
        const Database = require('better-sqlite3');
        const dbPath = path.join(__dirname, '..', 'data', 'recrutamento.db');
        const rawDb = new Database(dbPath);
        rawDb.prepare('DELETE FROM candidatos WHERE numero=?').run(numero);
        rawDb.close();
      }
      await send('🔄 Processo reiniciado! Enviando nova mensagem de boas-vindas...');
      await sleep(1000);
    }

    let candidato = db.getCandidato(numero);

    // Novo candidato — inicia processo
    if (!candidato) {
      candidato = db.criarCandidato(numero);
      await send(ETAPAS[0].mensagem);
      db.atualizarEtapa(numero, 1);
      return;
    }

    // Processo finalizado
    if (candidato.status === 'finalizado' || candidato.status === 'reprovado') {
      return send('✅ Sua candidatura já foi processada!\n\nSe quiser recomeçar do zero, envie: *REINICIAR*');
    }

    const etapaAtual = candidato.etapa;

    // Etapa 1 = salvar nome e ir para etapa 2
    if (etapaAtual === 1) {
      const nome = bodyRaw.trim();
      if (nome.length < 3) return send('Por favor, informe seu nome completo (mínimo 3 caracteres).');
      const Database = require('better-sqlite3');
      const dbPath = path.join(__dirname, '..', 'data', 'recrutamento.db');
      const rawDb = new Database(dbPath);
      rawDb.prepare('UPDATE candidatos SET nome=? WHERE numero=?').run(nome, numero);
      rawDb.close();
      db.atualizarEtapa(numero, 2);
      const msg2 = ETAPAS[1].mensagem.replace('{nome}', nome);
      return send(msg2);
    }

    // Etapas 2 a 16 — salva resposta e avança
    if (etapaAtual >= 2 && etapaAtual <= 16) {
      if (bodyRaw.length < 5) return send('Por favor, forneça uma resposta mais completa! (mínimo 5 caracteres)');

      // Etapa 16 = verificar se aceitou o termo
      if (etapaAtual === 16) {
        if (!body.includes('sim') && !body.includes('aceito') && !body.includes('concordo')) {
          await send('❌ Candidatura encerrada.\n\nVocê não aceitou os termos de conduta.\n\nSe mudou de ideia, envie: *REINICIAR*');
          db.reprovarCandidato(numero, 'Candidato não aceitou os termos de conduta.');
          return;
        }
      }

      // Salva a resposta da etapa atual
      const campos = [
        null, 'nome',
        'r_interesse', 'r_experiencia', 'r_edicao',
        'r_legenda_story', 'r_legenda_feed', 'r_legenda_rumor',
        'r_comportamento', 'r_horarios', 'r_whatsapp', 'r_instagram',
        'r_intencoes', 'r_conhecimento_billie', 'r_idiomas',
        'r_situacao', 'r_compromisso', 'r_termo'
      ];

      if (campos[etapaAtual]) {
        db.salvarResposta(numero, campos[etapaAtual], bodyRaw);
      }

      // Avança para próxima etapa
      const proximaEtapa = etapaAtual + 1;

      if (proximaEtapa <= 16) {
        db.atualizarEtapa(numero, proximaEtapa);
        // Recarrega candidato para pegar nome atualizado
        const cAtual = db.getCandidato(numero);
        const proximaMensagem = ETAPAS[proximaEtapa - 1].mensagem.replace('{nome}', cAtual.nome || '');
        return send(proximaMensagem);
      }

      // Finaliza — etapa 17 = processa
      db.atualizarEtapa(numero, 17);
      await send(MENSAGEM_AGUARDO);

      // Avalia com IA em background
      setTimeout(async function() {
        try {
          const cFinal = db.getCandidato(numero);
          addLog('Avaliando candidato: ' + (cFinal.nome || numero));
          const resultado = await avaliarCandidato(cFinal);

          db.finalizarCandidato(numero, resultado.score, resultado.avaliacao);

          if (resultado.aprovado && resultado.score >= 55) {
            const msgAprovado = MENSAGEM_APROVADO
              .replace('{nome}', cFinal.nome || 'Candidato(a)')
              .replace('{avaliacao}', resultado.avaliacao)
              .replace('{score}', resultado.score);
            await sock.sendMessage(from, { text: msgAprovado });
          } else {
            const msgReprovado = MENSAGEM_REPROVADO
              .replace('{nome}', cFinal.nome || 'Candidato(a)')
              .replace('{avaliacao}', resultado.avaliacao);
            await sock.sendMessage(from, { text: msgReprovado });
          }
          addLog('Candidato avaliado: ' + (cFinal.nome || numero) + ' | Score: ' + resultado.score);
        } catch (e) {
          addLog('Erro ao avaliar: ' + e.message);
          await sock.sendMessage(from, { text: '⚠️ Houve um erro na avaliação automática.\nSua candidatura foi registrada e será revisada manualmente.\n\n🔴 *Billie Global BR* 🖤' });
        }
      }, 3000);

      return;
    }

    // Etapa 17 = aguardando avaliação
    if (etapaAtual === 17) {
      return send('⏳ Sua candidatura está sendo processada...\nAguarde o resultado em breve!');
    }

  } catch (err) {
    addLog('Erro handler: ' + err.message);
  }
}

// ─── Conexão WhatsApp ───
async function conectar() {
  tentativas++;
  addLog('Tentativa ' + tentativas + '...');
  try {
    const authState = await useMultiFileAuthState(AUTH_DIR);
    addLog('Auth OK');
    const vd = await fetchLatestBaileysVersion();
    addLog('Baileys ' + vd.version.join('.'));
    const logger = pino({ level: 'silent' });
    const sock = makeWASocket({
      version: vd.version,
      logger: logger,
      auth: { creds: authState.state.creds, keys: makeCacheableSignalKeyStore(authState.state.keys, logger) },
      printQRInTerminal: false,
      browser: ['Ubuntu', 'Chrome', '20.0.04'],
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 10000,
    });

    sock.ev.on('creds.update', authState.saveCreds);

    sock.ev.on('connection.update', async function(u) {
      if (u.qr) { qrAtual = u.qr; botOnline = false; addLog('QR Code gerado! Acesse /qr para escanear.'); }
      if (u.connection === 'close') {
        botOnline = false; qrAtual = null;
        const code = u.lastDisconnect && u.lastDisconnect.error && u.lastDisconnect.error.output ? u.lastDisconnect.error.output.statusCode : 0;
        addLog('Fechou. Codigo: ' + code);
        if (code === DisconnectReason.loggedOut) { try { fs.rmSync(AUTH_DIR, { recursive: true, force: true }); fs.mkdirSync(AUTH_DIR); } catch (e) {} }
        const delay = Math.min(5000 * tentativas, 30000);
        await sleep(delay);
        conectar();
      }
      if (u.connection === 'open') {
        tentativas = 0; qrAtual = null; botOnline = true;
        addLog('BOT DE RECRUTAMENTO ONLINE! Aguardando candidatos...');
      }
    });

    sock.ev.on('messages.upsert', async function(upsert) {
      if (upsert.type !== 'notify') return;
      for (let i = 0; i < upsert.messages.length; i++) {
        if (!upsert.messages[i].message) continue;
        await handleMsg(sock, upsert.messages[i]);
      }
    });

  } catch (err) {
    addLog('ERRO: ' + err.message);
    await sleep(Math.min(5000 * tentativas, 30000));
    conectar();
  }
}

conectar();
