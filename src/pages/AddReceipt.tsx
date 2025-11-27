// src/pages/AddReceipt.tsx
import React, { useState } from "react";
import { runOcr } from "../utils/ocr";
import { useNavigate } from "react-router-dom";

// Allowed receipt categories
const TYPES = ["Meal", "Clothing", "WFH", "Transportation"] as const;

interface ImportedReceipt {
  id: string;
  type: string;
  date: string | null;
  merchant: string | null;
  amount: number | null;
  imageBase64: string | null;
}

function AddReceipt() {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<string>("Meal");
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Step 1 — Select file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const f = e.target.files[0];
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  // Step 2 — Run OCR
  const handleProcess = async () => {
    if (!file) {
      alert("Please upload a receipt image first.");
      return;
    }

    setProcessing(true);
    try {
      const result = await runOcr(file);
      setOcrResult(result);
    } catch (err) {
      console.error("OCR error:", err);
      alert("Failed to process receipt. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Helper: convert file to base64 for Excel embedding later
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  // Step 3 — Import Now
  const handleImport = async () => {
    if (!ocrResult) {
      alert("No OCR result available.");
      return;
    }
    if (!file) return;

    const base64 = await fileToBase64(file);

    const newReceipt: ImportedReceipt = {
      id: crypto.randomUUID(),
      type,
      date: ocrResult.date,
      merchant: ocrResult.merchant,
      amount: ocrResult.amount,
      imageBase64: base64,
    };

    // store in localStorage for now — Receipts page will read from this
    const now = new Date();
    const key = `receipts_${now.getFullYear()}_${now.getMonth() + 1}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");

    existing.push(newReceipt);

    localStorage.setItem(key, JSON.stringify(existing));

    alert("Receipt imported successfully.");
    navigate("/receipts");
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setOcrResult(null);
    setProcessing(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Receipt</h2>

      {/* Upload Section */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          maxWidth: "600px",
        }}
      >
        <label>Upload Receipt Image</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ marginTop: "8px" }}
        />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              marginTop: "12px",
              maxWidth: "100%",
              borderRadius: "6px",
            }}
          />
        )}

        {/* Category */}
        <label style={{ marginTop: "20px", display: "block" }}>
          Receipt Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "6px",
            marginTop: "6px",
            width: "200px",
          }}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <br /><br />

        {/* Process Button */}
        <button
          onClick={handleProcess}
          disabled={processing}
          style={{
            padding: "10px 20px",
            background: "#4e6cff",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {processing ? "Processing…" : "Process Receipt"}
        </button>

        <button
          onClick={resetForm}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            background: "#ccc",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {/* OCR Preview */}
      {ocrResult && (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            maxWidth: "600px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h3>Is this correct?</h3>

          <p><b>Date:</b> {ocrResult.date || "Not detected"}</p>
          <p><b>Merchant:</b> {ocrResult.merchant || "Not detected"}</p>
          <p><b>Amount:</b> {ocrResult.amount ?? "Not detected"}</p>

          {/* Import Now */}
          <button
            onClick={handleImport}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              background: "#0a9d26",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Import Now
          </button>
        </div>
      )}
    </div>
  );
}

export default AddReceipt;
