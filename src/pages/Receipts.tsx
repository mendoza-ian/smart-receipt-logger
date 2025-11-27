// src/pages/Receipts.tsx
import { useEffect, useState } from "react";
import { uploadToOneDrive } from "../services/graphService";
import { generateExcelForMonth } from "../utils/excelGenerator";

// Receipt structure from AddReceipt page
interface ImportedReceipt {
  id: string;
  type: string;
  date: string | null;
  merchant: string | null;
  amount: number | null;
  imageBase64: string | null;
}

function Receipts() {
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [receipts, setReceipts] = useState<ImportedReceipt[]>([]);

  const key = `receipts_${year}_${month}`;

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    setReceipts(saved);
  }, [key]);

  function totalAmount() {
    return receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  }

  function clearMonth() {
    if (!confirm("Delete all receipts for this month?")) return;
    localStorage.removeItem(key);
    setReceipts([]);
  }

  // ONE DRIVE UPLOAD FLOW
  async function handleSendToOneDrive() {
    if (receipts.length === 0) {
      alert("No receipts to upload for this month.");
      return;
    }

    try {
      alert("Generating Excel…");
      const blob = await generateExcelForMonth(year, month, receipts);

      // naming: November 2025.xlsx
      const date = new Date(year, month - 1);
      const fileName =
        `${date.toLocaleString("default", { month: "long" })} ${year}.xlsx`;

      alert("Uploading to OneDrive…");

      await uploadToOneDrive(fileName, blob);

      alert("Upload successful!");
    } catch (e) {
      console.error("Upload error:", e);
      alert("Error uploading to OneDrive. See console for details.");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Receipts</h2>

      {/* Month Selector */}
      <div style={{ marginBottom: "20px" }}>
        <label>Month: </label>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <label style={{ marginLeft: "10px" }}>Year: </label>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2024,2025,2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <button
          onClick={clearMonth}
          style={{
            marginLeft: "20px",
            padding: "6px 14px",
            background: "#ff5050",
            border: "none",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Clear Month
        </button>
      </div>

      {/* Receipts Table */}
      <table
        style={{
          width: "100%",
          maxWidth: "800px",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ background: "#f1f1f1" }}>
            <th style={th}>Type</th>
            <th style={th}>Date</th>
            <th style={th}>Merchant</th>
            <th style={th}>Amount</th>
          </tr>
        </thead>

        <tbody>
          {receipts.map((r) => (
            <tr key={r.id}>
              <td style={td}>{r.type}</td>
              <td style={td}>{r.date || ""}</td>
              <td style={td}>{r.merchant || ""}</td>
              <td style={td}>{r.amount ?? ""}</td>
            </tr>
          ))}

          {/* TOTAL ROW */}
          <tr style={{ background: "#fafafa", fontWeight: 600 }}>
            <td style={td}>Total</td>
            <td style={td}></td>
            <td style={td}></td>
            <td style={td}>{totalAmount()}</td>
          </tr>
        </tbody>
      </table>

      {/* Upload to OneDrive Button */}
      <button
        onClick={handleSendToOneDrive}
        style={{
          marginTop: "30px",
          padding: "12px 24px",
          background: "#3a6dff",
          border: "none",
          color: "white",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Send to OneDrive
      </button>
    </div>
  );
}

const th = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
  textAlign: "left" as const,
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};

export default Receipts;
