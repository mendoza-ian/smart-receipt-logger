// src/pages/Receipts.tsx

import { useEffect, useState } from "react";
import { generateExcelForMonth } from "../utils/excelGenerator";

// Structure for imported receipts
interface ImportedReceipt {
  id: string;
  type: string;
  date: string | null;
  merchant: string | null;
  amount: number | null;
  imageBase64: string | null;
}

export default function Receipts() {
  const [receipts, setReceipts] = useState<ImportedReceipt[]>([]);

  // Load receipts from localStorage
  useEffect(() => {
    const now = new Date();
    const key = `receipts_${now.getFullYear()}_${now.getMonth() + 1}`;

    const saved = localStorage.getItem(key);

    if (saved) {
      setReceipts(JSON.parse(saved));
    }
  }, []);

  // Delete one receipt
  const deleteReceipt = (id: string) => {
    if (!confirm("Delete this receipt?")) return;

    const updated = receipts.filter((r) => r.id !== id);
    setReceipts(updated);

    const now = new Date();
    const key = `receipts_${now.getFullYear()}_${now.getMonth() + 1}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  // Clear all receipts for the month
  const clearAll = () => {
    if (!confirm("Clear all receipts for this month?")) return;

    const now = new Date();
    const key = `receipts_${now.getFullYear()}_${now.getMonth() + 1}`;

    localStorage.removeItem(key);
    setReceipts([]);
  };

  // Download Excel file (local only)
  const handleDownloadExcel = async () => {
    if (receipts.length === 0) {
      alert("No receipts to export.");
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const blob = await generateExcelForMonth(year, month, receipts);

    const fileName = `${now.toLocaleString("default", {
      month: "long",
    })} ${year}.xlsx`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    alert("Excel downloaded!");
  };

  // Group receipts by type for display
  const grouped: Record<string, ImportedReceipt[]> = {
    Meal: [],
    Clothing: [],
    WFH: [],
    Transportation: [],
  };

  receipts.forEach((r) => {
    grouped[r.type]?.push(r);
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>Receipts Summary</h2>

      {receipts.length === 0 ? (
        <p>No receipts added yet.</p>
      ) : (
        <>
          <button
            style={{
              background: "#6c5ce7",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
            onClick={handleDownloadExcel}
          >
            Download Excel File
          </button>

          <button
            style={{
              background: "#d63031",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              marginLeft: "10px",
              marginBottom: "10px",
            }}
            onClick={clearAll}
          >
            Clear All
          </button>

          {Object.keys(grouped).map((type) => {
            const list = grouped[type];
            if (list.length === 0) return null;

            return (
              <div
                key={type}
                style={{
                  marginTop: "25px",
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                }}
              >
                <h3>{type}</h3>

                {list.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      gap: "20px",
                      marginBottom: "20px",
                      paddingBottom: "15px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p>
                        <strong>Date:</strong> {r.date || "—"}
                      </p>
                      <p>
                        <strong>Merchant:</strong> {r.merchant || "—"}
                      </p>
                      <p>
                        <strong>Amount:</strong>{" "}
                        {r.amount !== null ? `₱${r.amount.toFixed(2)}` : "—"}
                      </p>

                      <button
                        style={{
                          marginTop: "10px",
                          background: "#d63031",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                        onClick={() => deleteReceipt(r.id)}
                      >
                        Delete
                      </button>
                    </div>

                    <div>
                      {r.imageBase64 && (
                        <img
                          src={r.imageBase64}
                          alt="receipt"
                          style={{
                            width: "160px",
                            height: "auto",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
