const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || 'AIzaSyDA3LQb1cwqtTdH0l3zQDUiUKjqwLjwX-Y');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function avaliarCandidato(candidato) {
  const prompt = `Você é o sistema de IA de recrutamento da Billie Global BR, uma comunidade brasileira de fãs da Billie Eilish. Você deve avaliar um(a) candidato(a) à vaga de administrador(a) do Canal do WhatsApp da comunidade.

CONTEXTO DA VAGA:
- O canal posta atualizações sobre a Billie Eilish (stories do Instagram, feed, rumores, novas fotos, notícias)
- O administrador precisa ser ativo, criativo, responsável e fã da Billie
- Precisa saber legendar posts de forma profissional
- Precisa ter disponibilidade e compromisso

DADOS DO CANDIDATO:
Nome: ${candidato.nome}
Interesse na vaga: ${candidato.r_interesse}
Experiência anterior: ${candidato.r_experiencia}
Habilidades de edição: ${candidato.r_edicao}
Como legendaria um Story: ${candidato.r_legenda_story}
Como legendaria um post do Feed: ${candidato.r_legenda_feed}
Como postaria um rumor: ${candidato.r_legenda_rumor}
Comportamento social: ${candidato.r_comportamento}
Horários disponíveis: ${candidato.r_horarios}
WhatsApp: ${candidato.r_whatsapp}
Instagram: ${candidato.r_instagram}
Intenções: ${candidato.r_intencoes}
Conhecimento sobre a Billie: ${candidato.r_conhecimento_billie}
Nível de inglês: ${candidato.r_idiomas}
Situação atual: ${candidato.r_situacao}
Nível de compromisso: ${candidato.r_compromisso}
Aceitou o termo: ${candidato.r_termo}

INSTRUÇÕES DE AVALIAÇÃO:
1. Analise cada resposta com cuidado
2. Avalie: motivação, conhecimento, criatividade, responsabilidade, disponibilidade e profissionalismo
3. Dê uma nota de 0 a 100
4. Escreva uma avaliação detalhada em português
5. Seja criterioso mas justo

Responda APENAS no seguinte formato JSON (sem markdown, sem texto extra):
{
  "score": [número de 0 a 100],
  "aprovado": [true ou false],
  "avaliacao": "[texto da avaliação detalhada em 2-3 parágrafos]",
  "pontos_fortes": "[principais pontos positivos]",
  "pontos_fracos": "[principais pontos a melhorar]",
  "recomendacao": "[sua recomendação final]"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return parsed;
  } catch (e) {
    console.error('Erro IA:', e.message);
    return {
      score: 50,
      aprovado: false,
      avaliacao: 'Erro ao processar avaliação automática. Revisão manual necessária.',
      pontos_fortes: 'Não avaliado',
      pontos_fracos: 'Não avaliado',
      recomendacao: 'Revisão manual necessária'
    };
  }
}

module.exports = { avaliarCandidato };
