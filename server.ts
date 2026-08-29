import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// High payload limit for handling multiple uploaded image/PDF base64 files
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não configurada no servidor.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Gerador Inteligente de Planos de Aula Semanais" });
});

// API Endpoint to extract handwritten lesson plans from images/PDFs
app.post("/api/extract-plan", async (req, res) => {
  try {
    const { files, customInstructions } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "Nenhum arquivo enviado para análise." });
    }

    const ai = getGeminiClient();

    // Prepare multimodal parts
    const parts: any[] = [];

    // System prompt explaining teacher domain & BNCC structure
    const systemPrompt = `Você é um Especialista em EdTech e Coordenador Pedagógico do Ensino Fundamental Brasileiro.
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

    parts.push({ text: systemPrompt });

    if (customInstructions) {
      parts.push({ text: `Instruções adicionais do professor: ${customInstructions}` });
    }

    // Add each file inline
    for (const f of files) {
      if (f.data && f.mimeType) {
        // Clean base64 prefix if present
        const cleanBase64 = f.data.includes("base64,") ? f.data.split("base64,")[1] : f.data;
        const mimeType = f.mimeType || (f.name?.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        });
      }
    }

    // Helper delay function for backoff
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Request structured output from Gemini with retry and fallback across official models
    let response: any = null;
    const candidateModels = [
      "gemini-3.7-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.1-pro-preview",
      "gemini-flash-latest",
    ];
    let lastError: any = null;

    for (const modelName of candidateModels) {
      // Try up to 2 times per model if encountering temporary 503 / 429
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
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
                      componente_curricular: { type: Type.STRING, description: "Componente(s) Curricular(es) (ex: Língua Portuguesa e Matemática)" },
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
                        objetos_conhecimento: { type: Type.STRING, description: "Objetos do conhecimento e conteúdos curriculares" },
                        habilidades_bncc: { type: Type.STRING, description: "Habilidades da BNCC com códigos e descritores (ex: EF15LP04, EF04MA02)" },
                        desenvolvimento: { type: Type.STRING, description: "Passo a passo metodológico: Acolhida, Atividades, Intervenções e Fechamento" },
                        recursos: { type: Type.STRING, description: "Recursos didáticos e materiais pedagógicos" },
                      },
                      required: ["dia_semana", "objetos_conhecimento", "habilidades_bncc", "desenvolvimento", "recursos"],
                    },
                  },
                },
                required: ["dias"],
              },
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
            // Wait 1.5s before retry
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

    const responseText = response.text;
    if (!responseText) {
      throw new Error("A IA não retornou resposta textual.");
    }

    const parsedData = JSON.parse(responseText);
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Erro na extração multimodal do plano:", error);
    return res.status(500).json({
      error: error?.message || "Erro interno ao processar os arquivos com o Gemini.",
    });
  }
});

// Start Express + Vite Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor ativo na porta ${PORT} (http://localhost:${PORT})`);
  });
}

startServer();
