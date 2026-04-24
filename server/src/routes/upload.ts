import type { FastifyInstance } from "fastify";
import { createRequire } from "module";
import { qdrant } from "../lib/qdrant.js";
import { getEmbeddings } from "../llm/embedding.js";
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
  /**
   * POST /extract-text
   * ─────────────────────────────────────────────────────────────────
   * Lightweight PDF text extraction endpoint — does NOT index into
   * Qdrant. Used in web-search mode to enrich search queries with
   * PDF content without storing anything permanently.
   *
   * Returns: { text: string }  (first 3000 chars of extracted text)
   */
  app.post("/extract-text", async (req, reply) => {
    try {
      const data = await req.file();
      if (!data) {
        return reply.status(400).send({ error: "No file uploaded" });
      }

      const buffer = await data.toBuffer();

      let text = "";
      let usedOcr = false;

      // ── Step 1: Try pdf-parse (fast, text-based PDFs) ──────────────
      try {
        const parsed = await pdfParse(buffer);
        text = (parsed.text || "").replace(/\s+/g, " ").trim();
      } catch (err) {
        console.warn(`[ExtractText] pdf-parse threw — will try OCR:`, err);
      }

      // ── Step 2: If empty (scanned PDF), fall back to OCR ───────────
      if (!text) {
        console.log(`[ExtractText] Empty text from pdf-parse — trying OCR fallback...`);
        try {
          const pages = await extractTextFromPDF(buffer, data.filename, () => {});
          text = pages.map(p => p.text).join(" ").replace(/\s+/g, " ").trim();
          usedOcr = true;
          console.log(`[ExtractText] OCR returned ${text.length} chars`);
        } catch (ocrErr) {
          console.error(`[ExtractText] OCR also failed:`, ocrErr);
        }
      }

      // Allow up to ~15,000 chars (approx 3-4k tokens) for Web Mode context
      const snippet = text.slice(0, 15000);

      return reply.send({
        text: snippet,
        filename: data.filename,
        scanned: usedOcr,
        empty: !snippet,
      });
    } catch (err) {
      console.error("[ExtractText] Error:", err);
      return reply.status(500).send({
        error: "ExtractText Error",
        message: err instanceof Error ? err.message : "Failed to extract text",
      });
    }
  });


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
      const pages = await extractTextFromPDF(buffer, data.filename, (prog) => {
         reply.raw.write(`data: ${JSON.stringify(prog)}\n\n`);
      });

      const totalChars = pages.reduce((acc, p) => acc + p.text.length, 0);
      console.log(`[RAG Upload] Extracted Text Length: ${totalChars} characters across ${pages.length} pages.`);

      // Chunk text (per page to preserve page boundaries)
      const chunkSize = 3000;
      const overlap = 400;
      const chunks: { text: string; page: number }[] = [];

      for (const page of pages) {
        if (page.text.length < 50) continue;

        // Simple sliding window within the page
        for (let i = 0; i < page.text.length; i += chunkSize - overlap) {
          const textChunk = page.text.slice(i, i + chunkSize).trim();
          if (textChunk.length > 100) {
            chunks.push({ text: textChunk, page: page.page });
          }
        }
      }

      if (chunks.length === 0) {
        throw new Error("No readable text found in this PDF. It might be a scanned image or empty file.");
      }

      console.log(`[RAG Upload] Successfully created ${chunks.length} chunks. Starting vectorization and indexing...`);
      reply.raw.write(`data: ${JSON.stringify({ status: "started", total: chunks.length })}\n\n`);

      // ── Client-disconnect guard ─────────────────────────────────────
      let clientAborted = false;
      const onSocketClose = () => {
        clientAborted = true;
        console.warn(`[RAG Upload] Client disconnected — aborting embedding loop.`);
      };
      reply.raw.socket?.on("close", onSocketClose);
      // ──────────────────────────────────────────────────────────────

      // ── Parallel batch processing ───────────────────────────────────
      // Instead of 1 embed + 1 upsert per chunk (553 serial roundtrips),
      // we embed BATCH_SIZE chunks concurrently and do a single bulk upsert.
      // At batch=8: 553 chunks → ~70 batches ≈ 8-10x faster.
      const BATCH_SIZE = 8;
      let totalIndexed = 0;

      for (let batchStart = 0; batchStart < chunks.length; batchStart += BATCH_SIZE) {
        // Early exit if client disconnected
        if (clientAborted) {
          console.warn(`[RAG Upload] Aborted at chunk ${totalIndexed + 1}/${chunks.length} — client disconnected.`);
          break;
        }

        const batch = chunks.slice(batchStart, Math.min(batchStart + BATCH_SIZE, chunks.length));

        // 1. Embed all chunks in this batch
        const embeddings = await getEmbeddings(batch.map(c => c.text));

        // 2. Build all Qdrant points for this batch
        const points = batch.map((chunkObj, j) => ({
          id: crypto.randomUUID(),
          vector: embeddings[j]!,
          payload: {
            text: chunkObj.text,
            document: data.filename,
            page_number: chunkObj.page,
            chunk_index: batchStart + j,
          },
        }));

        await qdrant.upsert("college_docs", { wait: true, points });
        totalIndexed += batch.length;
        reply.raw.write(`data: ${JSON.stringify({ status: "embedding", progress: totalIndexed, total: chunks.length })}\n\n`);
      }
      // ──────────────────────────────────────────────────────────────

      // Remove listener regardless of how the loop ended
      reply.raw.socket?.off("close", onSocketClose);

      // If client left mid-upload, close cleanly without a done event
      if (clientAborted) {
        reply.raw.end();
        return;
      }

      // Save the original file to uploads folder for previewing
      const uploadPath = path.join(__dirname, "../../uploads", data.filename);
      await fs.writeFile(uploadPath, buffer);

      reply.raw.write(`data: ${JSON.stringify({ 
        status: "done", 
        message: "PDF processed and embedded", 
        chunksCount: chunks.length,
        fileUrl: `/uploads/${encodeURIComponent(data.filename)}` 
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
