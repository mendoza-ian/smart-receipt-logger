// src/utils/ocr.ts
import Tesseract from "tesseract.js";

export interface OcrResult {
  date: string | null;
  merchant: string | null;
  amount: number | null;
  rawText: string;
}

// simple regex helpers
function extractAmount(text: string): number | null {
  // Match currency-like patterns: 123.45, ₱123.00, 123, etc.
  const amtRegex = /(?:₱?\s*)(\d{1,6}(?:[\.,]\d{2})?)/g;
  const matches = [...text.matchAll(amtRegex)];
  if (matches.length === 0) return null;

  // Take the highest number (usually total)
  const nums = matches.map(m => parseFloat(m[1].replace(",", "")));
  return Math.max(...nums);
}

function extractDate(text: string): string | null {
  // regex for dates like 11/27/25 or 2025-11-27 etc.
  const dateRegex1 = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/;
  const dateRegex2 = /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/;

  const d1 = dateRegex1.exec(text);
  if (d1) return d1[1];

  const d2 = dateRegex2.exec(text);
  if (d2) return d2[1];

  return null;
}

function extractMerchant(text: string): string | null {
  // Merchant usually appears at the top, so take first 1–2 non-empty lines
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 1);

  if (lines.length === 0) return null;

  // First line usually best guess
  return lines[0];
}

export async function runOcr(file: File | Blob): Promise<OcrResult> {
  const { data } = await Tesseract.recognize(file, "eng", {
    logger: m => console.log("OCR progress:", m),
  });

  const text = data.text.trim();

  return {
    rawText: text,
    amount: extractAmount(text),
    date: extractDate(text),
    merchant: extractMerchant(text),
  };
}
