/**
 * Função Serverless da Vercel: GET /api/health
 * Verificação simples de disponibilidade do backend serverless.
 */
export default function handler(_req: any, res: any) {
  res.status(200).json({
    status: "ok",
    service: "Gerador Inteligente de Planos de Aula Semanais",
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
  });
}
