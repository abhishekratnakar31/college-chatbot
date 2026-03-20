import type { FastifyInstance } from "fastify";
import fs from "fs";
import { PDFParse } from "pdf-parse";

export let storedChunks: { text: string; embedding: number[] }[] = [];

export async function uploadRoute(app: FastifyInstance) {
  app.post("/upload", async (req, reply) => {
    const data = await req.file();

    if (!data) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    const buffer = await data.toBuffer();

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    
    const text = result.text;

    // 🔥 Step 1: chunk text
    const chunks = text
      .split("\n")
      .map((c) => c.trim())
      .filter((c) => c.length > 50);

    reply.send({
      message: "PDF processed",
      chunksCount: chunks.length,
    });
  });
}