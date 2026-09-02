import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { extractPlan } from "./lib/geminiExtractor";

dotenv.config();

/**
 * Servidor Express usado APENAS em desenvolvimento local (`npm run dev`).
 *
 * Em produção no Vercel este arquivo NÃO é executado — o Vercel serve o build
 * estático do Vite (pasta `dist`) e usa as funções serverless em `api/`.
 * A lógica de extração é compartilhada via `lib/geminiExtractor.ts`, portanto
 * o comportamento é idêntico nos dois ambientes.
 */

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Limite alto de payload para lidar com múltiplos arquivos base64 (imagens/PDF).
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Gerador Inteligente de Planos de Aula Semanais",
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
  });
});

// Extração multimodal de planos de aula a partir de imagens/PDFs.
app.post("/api/extract-plan", async (req, res) => {
  try {
    const { files, customInstructions } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "Nenhum arquivo enviado para análise." });
    }
    const data = await extractPlan(files, customInstructions);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Erro na extração multimodal do plano:", error);
    return res.status(500).json({
      error: error?.message || "Erro interno ao processar os arquivos com o Gemini.",
    });
  }
});

// Inicia Express + Vite
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
