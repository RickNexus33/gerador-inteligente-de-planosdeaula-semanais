import { GoogleGenAI, Type } from "@google/genai";

/**
 * Lógica compartilhada de extração multimodal de planos de aula via Gemini.
 *
 * É utilizada tanto pelo servidor Express local (`server.ts`, usado em
 * desenvolvimento com `npm run dev`) quanto pela função serverless da Vercel
 * (`api/extract-plan.ts`, usada em produção). Assim garantimos que o prompt,
 * o schema e a lista de modelos fiquem sempre sincronizados.
 */

export interface UploadedFilePayload {
  name?: string;
  mimeType?: string;
  data?: string;
}

// Inicialização preguiçosa (lazy) do cliente Gemini.
let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    // A chave é lida da variável de ambiente GEMINI_API_KEY.
    // No Vercel: Settings > Environment Variables > GEMINI_API_KEY.
    // Também aceitamos GOOGLE_API_KEY como alias de compatibilidade.
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY não configurada no servidor. Configure a variável de ambiente GEMINI_API_KEY (no Vercel: Settings > Environment Variables) e faça um novo deploy."
      );
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

const SYSTEM_PROMPT = `Você é um Especialista em EdTech e Coordenador Pedagógico do Ensino Fundamental Brasileiro.
Sua missão é transcrever, interpretar e estruturar com alta precisão rascunhos manuscritos, anotações de caderno ou impressos de planos de aula semanais de professores (de Segunda a Sexta-feira).

DIRETRIZES FUNDAMENTAIS:
1. Identifique ou deduza os 5 dias letivos da semana (Segunda-feira, Terça-feira, Quarta-feira, Quinta-feira, Sexta-feira) com suas respectivas datas (DD/MM/AAAA) se visíveis ou sugeridas.
2. Para cada dia da semana, organize rigorosamente nos campos:
   - "data": Data correspondente (ex: "02/03/2026" ou deixe vazio se não legível).
   - "dia_semana": Nome oficial do dia (Segunda-feira, Terça-feira, Quarta-feira, Quinta-feira, Sexta-feira).
   - "objetos_conhecimento": Objetos de conhecimento / Conteúdos programáticos (com tópicos claros).
   - "habilidades_bncc": Códigos e descrições das Habilidades da BNCC (ex: "EF15LP04, EF04MA04 - Identificar a função social do texto..."). Se o rascunho contiver apenas o tema, deduza e insira os códigos BNCC pertinentes ao Ensino Fundamental.
   - "desenvolvimento": Metodologia passo a passo (Acolhida, Introdução, Desenvolvimento/Prática, Intervenção Pedagógica, Avaliação/Fechamento). Use listas numeradas ou hífens bem formatados.
   - "recursos": Materiais e recursos didáticos necessários (ex: Livro didático pág. 45, cartolina, lápis de cor, projetor, jogos pedagógicos).
3. Se houver informações de cabeçalho (Escola, Município, DRE, Professor(a), Bimestre, Turma, Turno, Componente Curricular), extraia para o objeto "cabecalho". Se algum campo não constar, preencha com valores padrão realistas ou mantenha vazio.
4. Se o professor enviou anotações parciais de alguns dias, complete a semana de 5 dias mantendo coerência pedagógica com a sequência didática semanal.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    cabecalho: {
      type: Type.OBJECT,
      properties: {
        escola: { type: Type.STRING, description: "Nome da Escola Municipal ou Estadual" },
        municipio: { type: Type.STRING, description: "Município / UF" },
        dre: { type: Type.STRING, description: "Diretoria Regional de Ensino (DRE) ou Núcleo" },
        docente: { type: Type.STRING, description: "Nome do(a) Professor(a) / Docente" },
        bimestre: { type: Type.STRING, description: "Bimestre (ex: 1º Bimestre / 2026)" },
        turma: { type: Type.STRING, description: "Ano / Turma (ex: 4º Ano B)" },
        turno: { type: Type.STRING, description: "Turno (ex: Matutino / Vespertino)" },
        componente_curricular: {
          type: Type.STRING,
          description: "Componente(s) Curricular(es) (ex: Língua Portuguesa e Matemática)",
        },
      },
    },
    dias: {
      type: Type.ARRAY,
      description: "Lista ordenada de 5 dias da semana (Segunda a Sexta)",
      items: {
        type: Type.OBJECT,
        properties: {
          data: { type: Type.STRING, description: "Data no formato DD/MM/AAAA" },
          dia_semana: { type: Type.STRING, description: "Dia da semana (ex: Segunda-feira)" },
          objetos_conhecimento: {
            type: Type.STRING,
            description: "Objetos do conhecimento e conteúdos curriculares",
          },
          habilidades_bncc: {
            type: Type.STRING,
            description: "Habilidades da BNCC com códigos e descritores (ex: EF15LP04, EF04MA02)",
          },
          desenvolvimento: {
            type: Type.STRING,
            description: "Passo a passo metodológico: Acolhida, Atividades, Intervenções e Fechamento",
          },
          recursos: { type: Type.STRING, description: "Recursos didáticos e materiais pedagógicos" },
        },
        required: [
          "dia_semana",
          "objetos_conhecimento",
          "habilidades_bncc",
          "desenvolvimento",
          "recursos",
        ],
      },
    },
  },
  required: ["dias"],
};

// Modelos oficiais e estáveis do Gemini, em ordem de preferência.
// A lista antiga usava nomes inexistentes (ex: "gemini-3.7-flash"), o que
// causava falha em todas as tentativas. Estes são aliases/versões válidas.
const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.5-pro",
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extrai e estrutura o plano de aula a partir de imagens/PDFs enviados.
 * Lança erro (com mensagem em português) em caso de falha.
 */
export async function extractPlan(
  files: UploadedFilePayload[],
  customInstructions?: string
): Promise<any> {
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error("Nenhum arquivo enviado para análise.");
  }

  const ai = getGeminiClient();

  // Monta as partes multimodais.
  const parts: any[] = [];
  parts.push({ text: SYSTEM_PROMPT });

  if (customInstructions) {
    parts.push({ text: `Instruções adicionais do professor: ${customInstructions}` });
  }

  for (const f of files) {
    if (f.data && f.mimeType) {
      // Remove o prefixo base64 (data:...;base64,) se presente.
      const cleanBase64 = f.data.includes("base64,") ? f.data.split("base64,")[1] : f.data;
      const mimeType =
        f.mimeType || (f.name?.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }
  }

  let response: any = null;
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    // Até 2 tentativas por modelo em caso de 503/429 temporário.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        });

        if (response?.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        const isRateLimitOrDemand =
          err?.message?.includes("503") ||
          err?.message?.includes("high demand") ||
          err?.message?.includes("429") ||
          err?.message?.includes("RESOURCE_EXHAUSTED") ||
          err?.message?.includes("UNAVAILABLE");

        console.warn(
          `Tentativa ${attempt} com modelo ${modelName} falhou (${err?.message || err}).`
        );

        if (isRateLimitOrDemand && attempt < 2) {
          await delay(1500);
        } else {
          break;
        }
      }
    }

    if (response?.text) {
      break;
    }
  }

  if (!response || !response.text) {
    throw lastError || new Error("A IA não retornou resposta textual.");
  }

  return JSON.parse(response.text);
}
