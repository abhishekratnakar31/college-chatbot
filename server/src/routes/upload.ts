import type { FastifyInstance } from "fastify";
import fs from "fs";
import { PDFParse } from "pdf-parse";
import { getEmbedding } from "../llm/embedding.js";

export let storedChunks: { text: string; embedding: number[] }[] = [];

export async function uploadRoute(app: FastifyInstance) {
  app.post("/upload", async (req, reply) => {
    try {
      const data = await req.file();

      if (!data) {
        return reply.status(400).send({ error: "No file uploaded" });
      }

      const buffer = await data.toBuffer();

      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      await parser.destroy();

      const text = textResult.text;

      // 🔥 Step 1: chunk text
      const chunkSize = 800;
const overlap = 200;

const chunks: string[] = [];

for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
  const chunk = text.slice(i, i + chunkSize).trim();
  if (chunk.length > 100) {
    chunks.push(chunk);
  }
}

      // Clear old chunks if replacing document
      storedChunks.length = 0;

      // 🔥 Step 2: create embeddings
      for (const chunk of chunks) {
        try {
          const embedding = await getEmbedding(chunk);
          storedChunks.push({ text: chunk, embedding });
        } catch (embErr) {
          console.error("Error creating embedding for chunk:", embErr);
        }
      }

      reply.send({
        message: "PDF processed and embedded",
        chunksCount: chunks.length,
      });
    } catch (err) {
      console.error("Upload error:", err);
      reply.status(500).send({
        error: "Upload Error",
        message: err instanceof Error ? err.message : "Failed to process PDF",
      });
    }
  });
}
