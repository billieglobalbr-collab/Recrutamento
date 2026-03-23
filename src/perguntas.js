// Fluxo completo de recrutamento — Billie Global BR
// Cada etapa tem: campo no banco, pergunta, validacao opcional

const ETAPAS = [
  // 0 = início
  {
    campo: null,
    mensagem: `🔴🖤 *Olá! Seja bem-vindo(a) ao processo seletivo da*
*Billie Global BR!* 🖤🔴

━━━━━━━━━━━━━━━━━━━━━━━━

Sou o bot oficial de recrutamento da maior comunidade brasileira de fãs da *Billie Eilish*!

Estamos em busca de *Administradores* para nosso *Canal do WhatsApp* dedicado a postagens sobre a Billie.

📋 *O processo leva cerca de 5-10 minutos.*
✅ *Seja honesto(a) em todas as respostas.*
❌ *Respostas vazias ou sem esforço serão desconsideradas.*

━━━━━━━━━━━━━━━━━━━━━━━━

Para começar, me diga seu *nome completo*:`,
    campo_salvar: 'nome'
  },

  // 1 = interesse
  {
    campo: 'r_interesse',
    mensagem: `✅ Prazer, *{nome}*!

━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 1 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

🎯 *Por que você tem interesse em ser administrador(a) do Canal Billie Global BR?*

_Seja detalhado(a)! Fale sobre sua motivação real._`
  },

  // 2 = experiência
  {
    campo: 'r_experiencia',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 2 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

📚 *Você já tem experiência como administrador(a) de grupos, canais ou páginas de fãs?*

Se sim, conte sobre essa experiência (onde foi, por quanto tempo, o que fazia).
Se não, tudo bem! Só nos diga isso.`
  },

  // 3 = edição
  {
    campo: 'r_edicao',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 3 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

🎨 *Você sabe fazer edição de imagens ou vídeos?*

• Quais aplicativos/programas você usa?
• Qual é o seu nível (iniciante, intermediário, avançado)?
• Já fez edições para comunidades de fãs antes?`
  },

  // 4 = legenda story
  {
    campo: 'r_legenda_story',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 4 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

📸 *Situação prática:*

A Billie Eilish acabou de postar um Story no Instagram mostrando ela nos bastidores de um show.

*Como você legendaria essa postagem no Canal?*

_Escreva exatamente como você postaria, incluindo emojis, hashtags e o que mais achar necessário._`
  },

  // 5 = legenda feed
  {
    campo: 'r_legenda_feed',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 5 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

🖼️ *Situação prática:*

A Billie postou uma nova foto no Feed do Instagram — uma foto de divulgação de uma nova música.

*Como você legendaria essa postagem no Canal?*

_Escreva exatamente como você postaria._`
  },

  // 6 = legenda rumor
  {
    campo: 'r_legenda_rumor',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 6 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

🔥 *Situação prática:*

Saiu um rumor na internet de que a Billie vai lançar um novo álbum em breve. Não é confirmado, é apenas um rumor.

*Como você postaria essa informação no Canal sem passar como verdade?*

_Mostre exatamente como legendaria._`
  },

  // 7 = comportamento social
  {
    campo: 'r_comportamento',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 7 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

🤝 *Como você se comporta socialmente com o público?*

• Como você lidaria com membros que criticam suas postagens?
• Como você reage a comentários negativos sobre a Billie?
• Você se considera uma pessoa paciente e diplomática?`
  },

  // 8 = horários
  {
    campo: 'r_horarios',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 8 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

⏰ *Quais são seus horários disponíveis?*

• Em quais horários do dia você estaria ativo(a)?
• Quantas horas por dia você poderia dedicar ao canal?
• Você tem disponibilidade nos fins de semana?

_Seja realista! Não precisa estar disponível 24h._`
  },

  // 9 = whatsapp
  {
    campo: 'r_whatsapp',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 9 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

📱 *Qual é o seu número de WhatsApp?*

_Digite no formato: 55 + DDD + número_
_Exemplo: 5511999999999_

_(Este número será usado para contato caso seja aprovado(a))_`
  },

  // 10 = instagram
  {
    campo: 'r_instagram',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 10 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

📷 *Qual é o seu @ do Instagram?*

_Exemplo: @seunome_

_(Usaremos para verificar seu perfil e possível acompanhamento das postagens da Billie)_`
  },

  // 11 = intenções
  {
    campo: 'r_intencoes',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 11 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

🎯 *Quais são suas intenções ao ser administrador(a)?*

• O que você espera aprender ou ganhar com isso?
• Você pretende ficar por muito tempo?
• Você tem algum objetivo específico dentro da comunidade?`
  },

  // 12 = conhecimento da Billie
  {
    campo: 'r_conhecimento_billie',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 12 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

🎵 *Teste de conhecimento sobre a Billie Eilish:*

Responda rapidamente:
1. Qual foi o primeiro álbum de estúdio da Billie?
2. Quem produz a maioria das músicas dela?
3. Cite 3 músicas da Billie Eilish.
4. Você acompanha as redes sociais dela? Com que frequência?`
  },

  // 13 = idiomas
  {
    campo: 'r_idiomas',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 13 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

🌍 *Você entende inglês?*

A Billie posta tudo em inglês. É necessário pelo menos entender o básico para traduzir e legendar corretamente.

• Qual é o seu nível de inglês?
• Você usa algum tradutor? Qual?`
  },

  // 14 = situação atual
  {
    campo: 'r_situacao',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 14 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

📋 *Qual é sua situação atual?*

• Você estuda? Trabalha? Os dois?
• Isso pode interferir na sua disponibilidade para o canal?
• Você tem alguma limitação de acesso ao celular em algum momento do dia?`
  },

  // 15 = compromisso
  {
    campo: 'r_compromisso',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 15 de 16*
━━━━━━━━━━━━━━━━━━━━━━━━

💪 *Nível de compromisso:*

• Se for aprovado(a), por quanto tempo você se compromete a permanecer ativo(a)?
• O que você faria se não conseguisse cumprir com suas responsabilidades em algum dia?
• Como você avisaria a equipe caso precise se ausentar?`
  },

  // 16 = termo
  {
    campo: 'r_termo',
    mensagem: `━━━━━━━━━━━━━━━━━━━━━━━━
*PERGUNTA 16 de 16 — TERMO DE CONDUTA*
━━━━━━━━━━━━━━━━━━━━━━━━

📜 *Leia atentamente o Termo de Conduta abaixo:*

Ao aceitar ser administrador(a) do Canal Billie Global BR, você concorda que:

❌ *É PROIBIDO:*
• Publicar brincadeiras ou jogos sem autorização do dono
• Editar informações do canal sem permissão
• Publicar conteúdo ofensivo, racista ou preconceituoso
• Fazer divulgação de outros grupos/canais sem autorização
• Usar xingamentos ou linguagem inadequada
• Publicar conteúdo +18
• Publicar videoclipes ou performances da Billie (direitos autorais)
• Vazar informações internas da equipe
• Usar o cargo para benefício próprio
• Publicar notícias sem verificar a fonte

✅ *É OBRIGATÓRIO:*
• Sempre citar a fonte das postagens
• Avisar com antecedência caso precise se ausentar
• Manter postura profissional com o público
• Seguir as diretrizes de postagem do canal
• Respeitar as decisões do dono (Carluz)
• Estar ativo(a) no horário combinado

⚠️ *CONSEQUÊNCIAS:*
O descumprimento das regras pode resultar em advertência, suspensão ou demissão imediata sem aviso prévio.

━━━━━━━━━━━━━━━━━━━━━━━━

*Você leu, entendeu e concorda com todos os termos acima?*

_Responda: SIM ou NÃO_`
  }
];

const MENSAGEM_AGUARDO = `⏳ *Candidatura recebida!*

━━━━━━━━━━━━━━━━━━━━━━━━

✅ Suas respostas foram registradas com sucesso!

🤖 Nossa IA está analisando sua candidatura agora...

Você receberá o resultado em breve por aqui mesmo!

🔴 *Billie Global BR* 🖤`;

const MENSAGEM_APROVADO = `🎉🔴 *PARABÉNS, {nome}!* 🖤🎉

━━━━━━━━━━━━━━━━━━━━━━━━

✅ *Sua candidatura foi APROVADA!*

🤖 *Avaliação da IA:*
_{avaliacao}_

📊 *Pontuação:* {score}/100

━━━━━━━━━━━━━━━━━━━━━━━━

🔴 O dono da comunidade, *Carluz*, entrará em contato com você em breve pelo WhatsApp informado!

Fique de olho nas mensagens!

Bem-vindo(a) à família *Billie Global BR*! 🖤
_Obrigado por seu interesse!_`;

const MENSAGEM_REPROVADO = `😔 *Resultado da sua candidatura, {nome}*

━━━━━━━━━━━━━━━━━━━━━━━━

❌ *Infelizmente sua candidatura não foi aprovada desta vez.*

🤖 *Avaliação da IA:*
_{avaliacao}_

━━━━━━━━━━━━━━━━━━━━━━━━

Não desanime! Você pode tentar novamente em futuras seleções.

Agradecemos seu interesse na *Billie Global BR*! 🔴🖤`;

const MENSAGEM_JA_INSCRITO = `⚠️ *Você já tem uma candidatura em andamento!*

Para reiniciar o processo, envie: *REINICIAR*`;

module.exports = { ETAPAS, MENSAGEM_AGUARDO, MENSAGEM_APROVADO, MENSAGEM_REPROVADO, MENSAGEM_JA_INSCRITO };
