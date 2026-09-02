import { extractPlan } from "../lib/geminiExtractor";

/**
 * Função Serverless da Vercel: POST /api/extract-plan
 *
 * No Vercel não existe um servidor Express persistente rodando. Cada arquivo
 * dentro da pasta `api/` é automaticamente publicado como uma função
 * serverless. Esta função substitui a rota Express equivalente de `server.ts`
 * para funcionar em produção no Vercel.
 *
 * A chave é lida de process.env.GEMINI_API_KEY (configurada em
 * Vercel > Settings > Environment Variables).
 */
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  try {
    // Na Vercel, req.body já vem parseado quando o Content-Type é JSON.
    // Fazemos um fallback defensivo caso venha como string.
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { files, customInstructions } = body || {};

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "Nenhum arquivo enviado para análise." });
    }

    const data = await extractPlan(files, customInstructions);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error("Erro na extração multimodal do plano:", error);
    return res.status(500).json({
      error: error?.message || "Erro interno ao processar os arquivos com o Gemini.",
    });
  }
}
