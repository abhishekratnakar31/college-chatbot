import type { FastifyInstance } from "fastify";
import { createRequire } from "module";
import { setChunks } from "../lib/chunkStore.js";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function uploadRoute(app: FastifyInstance) {
  app.post("/upload", async (req, reply) => {
    try {
      const data = await req.file();

      if (!data) {
        return reply.status(400).send({ error: "No file uploaded" });
      }

      const buffer = await data.toBuffer();

      // Parse PDF
      const result = await pdfParse(buffer);
      const text = result.text;

      console.log("TEXT LENGTH:", text.length);

      // Chunk text
      const chunkSize = 800;
      const overlap = 200;

      const chunks: string[] = [];

      for (let i = 0; i < text.length; i += chunkSize - overlap) {
        const chunk = text.slice(i, i + chunkSize).trim();

        if (chunk.length > 100) {
          chunks.push(chunk);
        }
      }

      console.log("Generated chunks:", chunks.length);

      // Store chunks in memory (replaces PostgreSQL insert)
      setChunks(chunks);

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