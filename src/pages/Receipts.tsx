// src/pages/Receipts.tsx
import { useEffect, useState } from "react";

type Receipt = {
  id: number;
  title: string;
  amount: number;
  createdAt: string;
};

export default function Receipts() {
  const [items, setItems] = useState<Receipt[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("receipts") || "[]");
    setItems(stored);
  }, []);

  function remove(id: number) {
    if (!confirm("Delete this receipt?")) return;
    const next = items.filter(i => i.id !== id);
    setItems(next);
    localStorage.setItem("receipts", JSON.stringify(next));
  }

  const total = items.reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <h2>Receipts</h2>
      <p>Total: <strong>{total.toFixed(2)}</strong></p>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
        {items.length === 0 && <li>No receipts yet.</li>}
        {items.map(r => (
          <li key={r.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{new Date(r.createdAt).toLocaleString()}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div><strong>{r.amount.toFixed(2)}</strong></div>
              <button onClick={() => remove(r.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
