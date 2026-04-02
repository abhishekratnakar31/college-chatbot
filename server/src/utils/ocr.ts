import { fromBuffer } from "pdf2pic";
import Tesseract from "tesseract.js";
import { createRequire } from "module";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import os from "node:os";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function extractTextFromPDF(
  buffer: Buffer, 
  filename: string,
  onProgress?: (data: { status: string; progress: number; total: number }) => void
): Promise<string> {
  // 1. Try normal text extraction first (fast)
  try {
    const result = await pdfParse(buffer);
    const extractedText = result.text?.trim() || "";

    // If PDF has actual text layers, it usually has far more than 200 chars.
    // Short extracted text means it's likely a scanned image.
    if (extractedText.length > 200) {
      return extractedText;
    }
  } catch (err) {
    console.warn(`pdf-parse failed on ${filename}, falling back to OCR.`, err);
  }

  console.log(`Poor text extraction from ${filename}. Proceeding with OCR fallback...`);

  // 2. OCR Fallback using pdf2pic + tesseract.js
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ocr-"));
  
  try {
    const options = {
      density: 150,     // 150 DPI is usually sufficient for text OCR
      saveFilename: "page",
      savePath: tempDir,
      format: "png",
      width: 1200,      // limits max width for speed
      height: 1600
    };

    const convert = fromBuffer(buffer, options);

    // Report conversion start
    onProgress?.({ status: "ocr_converting", progress: 0, total: 100 });
    
    // Bulk convert all pages. Return array of page info
    const results = await convert.bulk(-1, { responseType: "image" });
    
    let combinedText = "";

    console.log(`PDF converted to ${results.length} images for OCR. Processing...`);
    onProgress?.({ status: "ocr_processing", progress: 0, total: results.length });

    // We process images sequentially to avoid huge memory spikes,
    // but you could use Promise.all if you manage Tesseract workers.
    for (const [idx, res] of results.entries()) {
       if (!res.path) continue;
       console.log(`Running OCR on page ${res.page}...`);
       
       const { data: { text } } = await Tesseract.recognize(res.path, "eng");
       combinedText += text + "\n\n";

       onProgress?.({ 
         status: "ocr_processing", 
         progress: idx + 1, 
         total: results.length 
       });
    }

    return combinedText;

  } catch (ocrError) {
    console.error("OCR Pipeline failed:", ocrError);
    throw new Error("Failed to extract text using OCR pipeline.");
  } finally {
    // 3. Cleanup temporary image files to save disk space
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignored
    }
  }
}
