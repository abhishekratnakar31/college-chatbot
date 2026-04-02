import type { FastifyInstance } from "fastify";
import { createRequire } from "module";
import { qdrant } from "../lib/qdrant.js";
import { getEmbedding } from "../llm/embedding.js";
import { extractTextFromPDF } from "../utils/ocr.js";
import crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

      // Setup SSE first so we can report OCR progress
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      reply.hijack();

      // Extract text using OCR pipeline with progress reporting
      const text = await extractTextFromPDF(buffer, data.filename, (prog) => {
         reply.raw.write(`data: ${JSON.stringify(prog)}\n\n`);
      });

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

      if (chunks.length === 0) {
        throw new Error("No readable text found in this PDF. It might be a scanned image or empty file.");
      }

      reply.raw.write(`data: ${JSON.stringify({ status: "started", total: chunks.length })}\n\n`);

      for (const [i, chunk] of chunks.entries()) {
        const embedding = await getEmbedding(chunk);

        await qdrant.upsert("college_docs", {
          wait: true,
          points: [
            {
              id: crypto.randomUUID(),
              vector: embedding,
              payload: {
                text: chunk,
                document: data.filename,
                chunk_index: i,
              },
            },
          ],
        });
        console.log(`Indexed chunk ${i+1}/${chunks.length}`)
        reply.raw.write(`data: ${JSON.stringify({ status: "embedding", progress: i + 1, total: chunks.length })}\n\n`);
      }

      // Save the original file to uploads folder for previewing
      const uploadPath = path.join(__dirname, "../../uploads", data.filename);
      await fs.writeFile(uploadPath, buffer);

      reply.raw.write(`data: ${JSON.stringify({ 
        status: "done", 
        message: "PDF processed and embedded", 
        chunksCount: chunks.length,
        fileUrl: `http://localhost:4000/uploads/${encodeURIComponent(data.filename)}` 
      })}\n\n`);
      reply.raw.end();
    } catch (err) {
      console.error("Upload error:", err);

      if (!reply.raw.headersSent) {
        reply.status(500).send({
          error: "Upload Error",
          message: err instanceof Error ? err.message : "Failed to process PDF",
        });
      } else {
        reply.raw.write(`data: ${JSON.stringify({ status: "error", message: err instanceof Error ? err.message : "Failed to process PDF" })}\n\n`);
        reply.raw.end();
      }
    }
  });
}
