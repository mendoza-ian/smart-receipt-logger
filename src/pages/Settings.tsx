// src/pages/Settings.tsx
export default function Settings() {
  function clearAll() {
    if (!confirm("Clear all receipts?")) return;
    localStorage.removeItem("receipts");
    location.reload();
  }
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <h2>Settings</h2>
      <button onClick={clearAll}>Clear all receipts</button>
    </div>
  );
}
