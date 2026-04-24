import { fromBuffer } from "pdf2pic";
import Tesseract from "tesseract.js";
import { createRequire } from "module";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import os from "node:os";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export interface PDFPage {
  page: number;
  text: string;
}

// Lazily import pdfjs-dist to avoid issues with the worker initialization
async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  return pdfjs;
}

export async function extractTextFromPDF(
  buffer: Buffer, 
  filename: string,
  onProgress?: (data: { status: string; progress: number; total: number }) => void
): Promise<PDFPage[]> {
  
  // ── Step 1: Try high-fidelity text extraction with pdfjs-dist ──────
  try {
    const pdfjs = await getPdfJs();
    const data = new Uint8Array(buffer);
    const loadingTask = (pdfjs as any).getDocument({ data, disableWorker: true });
    const doc = await loadingTask.promise;
    const numPages = doc.numPages;
    
    const pages: PDFPage[] = [];
    let totalTextLength = 0;

    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const strings = textContent.items.map((item: any) => item.str);
      const pageText = strings.join(" ").replace(/\s+/g, " ").trim();
      
      if (pageText) {
        pages.push({ page: i, text: pageText });
        totalTextLength += pageText.length;
      }
    }

    // If we extracted a reasonable amount of text, return it
    if (totalTextLength > 200) {
      console.log(`[OCR] pdfjs-dist parse successful for ${filename} (${totalTextLength} chars, ${pages.length} pages)`);
      return pages;
    }
  } catch (err) {
    console.warn(`[OCR] pdfjs-dist failed on ${filename}, trying pdf-parse fallback.`, (err as Error).message);
  }

  // ── Step 2: Try basic pdf-parse (fast, good for simple text PDFs) ──
  try {
    const result = await pdfParse(buffer);
    const extractedText = (result.text || "").replace(/\s+/g, " ").trim();
    
    if (extractedText.length > 200) {
      console.log(`[OCR] pdf-parse fallback successful for ${filename} (${extractedText.length} chars)`);
      // pdf-parse doesn't have page info, so we return as a single "page 0"
      return [{ page: 1, text: extractedText }];
    }
  } catch (err) {
    console.warn(`[OCR] pdf-parse also failed on ${filename}, falling back to Tesseract OCR.`, err);
  }

  console.log(`[OCR] Proceeding with Tesseract OCR fallback for ${filename}...`);

  // ── Step 3: OCR Fallback using pdf2pic + tesseract.js ─────────────
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ocr-"));
  
  try {
    const options = {
      density: 150,
      saveFilename: "page",
      savePath: tempDir,
      format: "png",
      width: 1200,
      height: 1600
    };

    const convert = fromBuffer(buffer, options);
    onProgress?.({ status: "ocr_converting", progress: 0, total: 100 });
    
    const results = await convert.bulk(-1, { responseType: "image" });
    const pages: PDFPage[] = [];

    console.log(`[OCR] PDF converted to ${results.length} images. Running Tesseract...`);
    onProgress?.({ status: "ocr_processing", progress: 0, total: results.length });

    for (const [idx, res] of results.entries()) {
       if (!res.path) continue;
       
       const { data: { text } } = await Tesseract.recognize(res.path, "eng");
       pages.push({ 
         page: res.page || (idx + 1), 
         text: text.replace(/\s+/g, " ").trim() 
       });

       onProgress?.({ 
         status: "ocr_processing", 
         progress: idx + 1, 
         total: results.length 
       });
    }

    return pages;

  } catch (ocrError) {
    console.error("[OCR] Tesseract pipeline failed:", ocrError);
    throw new Error("Failed to extract text using OCR pipeline.");
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignored
    }
  }
}
